import * as child_process from "child_process"

import { AutoLanguageClient } from "atom-languageclient"

class LatexLanguageClient extends AutoLanguageClient {
  getGrammarScopes () { return [ "text.tex.latex" ] }
  getLanguageName () { return "LaTeX" }
  getServerName () { return "latex-language-server" }

  startServerProcess (projectPath: string) {
    console.log("starting latex server...")

    const command = "/Users/benjamingray/github/latex-language-server/cmake-build-debug/latex_language_server"
    const args: string[] = []
    const spawned = child_process.spawn(command, args, { cwd: projectPath })

    spawned.stdout.setEncoding("utf8")
    spawned.stderr.setEncoding("utf8")

    console.log("spawned", spawned)

    spawned.stdout.on("data", data => {
      console.error(data)
    })
    spawned.stderr.on("data", data => {
      console.warn(data)
    })

    spawned.once("close", (code, signal) => {
      console.log(`latex lang server closed with code ${code} and signal ${signal}`)
    })

    return spawned
  }
}

module.exports = new LatexLanguageClient()
