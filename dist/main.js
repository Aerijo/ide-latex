"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const atom_languageclient_1 = require("atom-languageclient");
class LatexLanguageClient extends atom_languageclient_1.AutoLanguageClient {
    getGrammarScopes() { return ["text.tex.latex", "text.tex.biber", "text.tex.bibtex"]; }
    getLanguageName() { return "LaTeX"; }
    getServerName() { return "latex-language-server"; }
    startServerProcess(_projectPath) {
        console.log("starting latex server...");
        const command = "/Users/benjamingray/github/latex-language-server/cmake-build-debug/latex_language_server";
        const args = [];
        const spawned = child_process.spawn(command, args);
        console.log("spawned", spawned);
        return spawned;
    }
}
module.exports = new LatexLanguageClient();
//# sourceMappingURL=main.js.map