import { CompositeDisposable, TextEditor } from "atom"
import { GlobalConfig } from "./config/globalConfig"

/**
 * Tracks editors to apply and remove custom behaviour as needed
 */

export class EditorManager {

  watchedEditors: Set<TextEditor>
  subscriptions: CompositeDisposable
  globalConfig: GlobalConfig

  constructor () {
    this.watchedEditors = new Set()
    this.subscriptions = new CompositeDisposable()
    this.globalConfig = new GlobalConfig()

    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.handleNewEditor(editor)
      }),
      atom.workspace.onDidChangeActiveTextEditor(editor => {
        if (editor === undefined) return

        console.log("New active editor:", editor)
      })
    )
  }

  destroy (): void {
    this.subscriptions.dispose()
  }

  handleNewEditor (editor: TextEditor): void {
    if (this.watchedEditors.has(editor)) return
    console.log("Registering editor", editor)

    this.watchedEditors.add(editor)

    this.subscriptions.add(editor.onDidDestroy(() => {
      this.watchedEditors.delete(editor)
    }))

  }
}
