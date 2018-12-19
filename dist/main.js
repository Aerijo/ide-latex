"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const atom_languageclient_1 = require("atom-languageclient");
class LatexLanguageClient extends atom_languageclient_1.AutoLanguageClient {
    getGrammarScopes() { return ["text.tex.latex", "text.tex.biber", "text.tex.bibtex"]; }
    getLanguageName() { return "LaTeX"; }
    getServerName() { return "latex-language-server"; }
    startServerProcess(projectPath) {
        console.log("starting latex server...");
        const command = "/Users/benjamingray/github/latex-language-server/cmake-build-debug/latex_language_server";
        const args = [];
        const spawned = child_process.spawn(command, args, { cwd: projectPath });
        console.log("spawned", spawned);
        spawned.stdout.setEncoding("utf8");
        spawned.stdout.on("data", data => {
            console.log("STDOUT:\n", data);
        });
        spawned.once("close", (code, signal) => {
            console.log(`latex lang server closed with code ${code} and signal ${signal}`);
        });
        return spawned;
    }
}
module.exports = new LatexLanguageClient();
//# sourceMappingURL=main.js.map