/**
 * Handles observing changes in all project files, across all projects
 *
 * Terminology:
 * - A "project" is a collection of files that all consider the same file
 *   to be the root.
 * - The project of a given file can be changed. Instead of recalculating it
 *   immediately, we will try to mark it as "invalidated" and recalculate as needed.
 * - Some root declarations pass through multiple files (magic comment chain).
 *   We should store this data too, so if a file changes it's root we can update
 *   all the files that depend on it.
 */

import * as fs from "fs"
import * as path from "path"
import * as os from "os"
import { TextEditor } from "atom"

import { GlobalConfig } from "./globalConfig"

const ROOT_SEARCH_DEPTH = 10
const ADD_ROOT_MAGIC_EXT = true

const enum ROOT_TYPE {
  MAGIC,
  DOCUMENT,
  NONE
}

interface RootData {
  type: ROOT_TYPE,
  path: string | undefined
}

/**
 * Manages the roots of projects
 * NOTE: This does not form a document tree. There
 * is no requirement to use relative magic paths.
 *
 * Basically a linked list of files, their single parent,
 * and all the children that depend on them. This lets them
 * be easily transferred between projects, as we just have
 * to change where the parent points (and possibly recursively
 * walk the children)
 *
 * Needs to handle:
 * - Root changes
 * - File name changes / deletion
 *   - If not root, offer service to redirect root
 *   - If root, alert that root for file cannot be found (for deletion)
 */
class Project {
  root: string
  files: Map<string, ProjectNode>

  constructor (root: string) {
    this.root = root
    this.files = new Map()
    this.files.set(root, new ProjectNode(root))
  }

  addFile (file: string, parentFile: string): boolean {
    const parentNode = this.files.get(parentFile)
    if (parentNode === undefined) {
      console.log(`Did not recognise parent ${parentFile} for file ${file}`)
      console.log("aborting add to", this)
      debugger
      return false
    } else if (this.files.has(file)) {
      console.log(`Project already contains file ${file}`, this)
      return false
    } else {
      this.files.set(file, new ProjectNode(file, parentNode))
      return true
    }
  }

  addNode (node: ProjectNode, parent: string): boolean {
    const baseName = node.base
    const parentNode = this.files.get(parent)

    if (this.files.has(baseName)) {
      console.log(`Project already contains Node for ${baseName}`)
      return false
    }

    if (parentNode === undefined) {
      console.log(`Project does not contain ${parent}`)
      return false
    }

    this.files.set(baseName, node)

    this.addChildToNode(node, parentNode)

    return true
  }

  addChildToNode (child: ProjectNode, parent: ProjectNode): boolean {
    if (parent.children === undefined) {
      parent.children = new Set()
    }
    parent.children.add(child)
    return true
  }

  shiftRelation (base: ProjectNode, newParent: ProjectNode): boolean {
    const origParent = base.parent

    if (origParent === undefined || origParent.children === undefined) {
      console.log("Somethings gone wrong")
      return false
    }

    origParent.children.delete(base)
    this.addChildToNode(base, newParent)
    return true
  }
}

class ProjectNode {
  base: string
  parent: ProjectNode | undefined
  children: Set<ProjectNode> | undefined

  constructor (base: string, parent?: ProjectNode) {
    this.base = base
    this.parent = parent
  }
}

export class ProjectWatcher {
  globalConfig: GlobalConfig

  projects: Map<string, Project>

  editorToProject: Map<TextEditor, Project>
  filePathToProject: Map<string, Project> // stores all known root files for the various open projects

  constructor (globalConfig: GlobalConfig) {
    console.log("Making project config...")
    this.globalConfig = globalConfig

    this.editorToProject = new Map()
    this.filePathToProject = new Map()

    this.projects = new Map()
  }

  destroy (): void {
    console.log("Destroying project config...")
  }

  get rootFilePath (): string | undefined {
    const editor = atom.workspace.getActiveTextEditor()
    if (editor === undefined) return undefined

    let project = this.editorToProject.get(editor)
    if (project) {
      return project.root
    }

    const filePath = editor.getPath()
    if (filePath === undefined) return undefined

    project = this.filePathToProject.get(filePath)
    if (project) {
      return project.root
    }

    return undefined
  }

  findActiveProjectRoot (): Promise<string|undefined> {
    const editor = atom.workspace.getActiveTextEditor()
    if (editor === undefined) return Promise.resolve(undefined)

    return this.findEditorRoot(editor)
  }

  async findEditorRoot (editor: TextEditor): Promise<string|undefined> {
    let filePath = editor.getPath()
    let text: string = editor.getText()

    const observedFiles: Set<string> = new Set()
    if (filePath !== undefined) observedFiles.add(filePath)

    let rootPath = filePath
    let directedByMagic = false

    for (let i = 0; i < ROOT_SEARCH_DEPTH; i++) {
      const rootData = this.getRootFromText(text)

      if (rootData.type === ROOT_TYPE.DOCUMENT) return rootPath
      if (rootData.type === ROOT_TYPE.NONE) {
        if (directedByMagic || this.globalConfig.implicitRoot) {
          return rootPath
        } else {
          return undefined
        }
      }
      directedByMagic = true

      rootPath = this.resolveMagicPath(rootData.path, rootPath)
      if (rootPath === undefined) {
        console.log("Did not salvage magic path")
        return undefined
      }

      const fileContents = this.getTexFileContents(rootPath)
      if (fileContents === undefined) {
        console.log(`Error reading ${rootPath}`)
        return undefined
      }

      text = fileContents
    }

    console.log("Root path too far away")
    return rootPath
  }

  resolveMagicPath (filePath: string | undefined, currentPath: string | undefined): string | undefined {
    if (filePath === undefined) return undefined

    if (!path.isAbsolute(filePath)) {
      if (currentPath === undefined) currentPath = guessCurrentPath() // TODO: Make it consider the rel path too?
      filePath = path.resolve(currentPath, filePath)
    }

    if (ADD_ROOT_MAGIC_EXT && path.extname(filePath) === "") {
      filePath += ".tex"
    }

    return filePath
  }

  getRootFromText (text: string, breakOnCommand=false): RootData {
    const searchRegex = /^%\s*!\s*T[eE]X\s+root\s*=\s*(.*)$|%.*|\\begin\s*\{\s*document\s*\}|\\.|\n/gm
    const MAX_LINES = 100

    let linesSearched = 0

    let match = searchRegex.exec(text)
    while (match) {
      switch (match[0].charAt(0)) {
        case "\\":
          if (match[0].length > 2) {
            return { type: ROOT_TYPE.DOCUMENT, path: undefined }
          } else if (breakOnCommand) {
            return { type: ROOT_TYPE.NONE, path: undefined }
          }
          break
        case "%":
          break
        case "\n":
          linesSearched += 1
          if (linesSearched > MAX_LINES) return { type: ROOT_TYPE.NONE, path: undefined }
          break
        default:
          return { type: ROOT_TYPE.MAGIC, path: match[1] }
      }

      match = searchRegex.exec(text)
    }

    return { type: ROOT_TYPE.NONE, path: undefined }
  }

  getTexFileContents (absFilePath: string): string | undefined {
    try {
      return fs.readFileSync(absFilePath, { encoding: "utf8" })
    } catch (e) {
      if (path.extname(absFilePath) !== "") return undefined
      try {
        return fs.readFileSync(`${absFilePath}.tex`, { encoding: "utf8" })
      } catch (e) {
        return undefined
      }
    }
  }
}

function guessCurrentPath (): string {
  const activeEditor = atom.workspace.getActiveTextEditor()
  if (activeEditor) {
    const filePath = activeEditor.getPath()
    if (filePath !== undefined) return filePath
  }

  const editors = atom.workspace.getTextEditors()

  for (let editor of editors) {
    const filePath = editor.getPath()
    if (filePath === undefined) continue

    const ext = path.extname(filePath)
    if (ext === ".tex") {
      return path.dirname(filePath)
    }
  }

  const openDirectories = atom.project.getPaths()
  if (openDirectories.length > 0) return openDirectories[0]

  return os.homedir()
}
