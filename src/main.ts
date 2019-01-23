import * as child_process from "child_process"

import { AutoLanguageClient } from "atom-languageclient"

class LatexLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return [ "text.tex.latex", "text.tex.biber", "text.tex.bibtex" ] }
  getLanguageName () { return "LaTeX" }
  getServerName () { return "latex-language-server" }

  startServerProcess (projectPath: string) {
    console.log("starting latex server...")

    const command = atom.config.get("ide-latex.serverPath")
    const spawned = child_process.spawn(command, { cwd: projectPath })

    spawned.stdout.setEncoding("utf8")
    spawned.stderr.setEncoding("utf8")

    console.log("spawned", spawned)

    spawned.once("close", (code, signal) => {
      console.log(`latex lang server closed with code ${code} and signal ${signal}`)
    })

    return spawned
  }
}

module.exports = new LatexLanguageClient()
