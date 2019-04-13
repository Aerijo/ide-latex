import * as child_process from "child_process"

import { AutoLanguageClient, LanguageServerProcess } from "atom-languageclient"

class LatexLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return ["text.tex.latex", "text.tex.biber", "text.tex.bibtex"] }
  getLanguageName () { return "LaTeX" }
  getServerName () { return "latex-language-server" }

  startServerProcess (_projectPath: string) {
    console.log("starting latex server...")

    const command = atom.config.get("ide-latex.serverPath")
    const env = process.env

    const spawned = child_process.spawn(command, env) as LanguageServerProcess

    spawned.stdout.setEncoding("utf8")
    spawned.stderr.setEncoding("utf8")

    // spawned.stdin.on("data", data => {
    //   console.log("IN:", data)
    // })
    // spawned.stdout.on("data", data => {
    //   console.log("OUT:", data)
    // })

    console.log("spawned", spawned)

    spawned.once("close", (code, signal) => {
      console.log(`latex lang server closed with code ${code} and signal ${signal}`)
    })

    return spawned
  }

  preInitialization () {
    console.log("pre init")
  }

  postInitialization () {
    console.log("post init")
  }
}

module.exports = new LatexLanguageClient()
