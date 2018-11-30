import { CompositeDisposable, TextEditor } from 'atom'

/**
 * Tracks editors to apply and remove custom behaviour as needed
 */

export class EditorManager {
  subscriptions: CompositeDisposable
  watchedEditors: Set<TextEditor>

  constructor () {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(
      atom.workspace.observeTextEditors(editor => {
        this.handleObservedEditor(editor)
      }),
    )
    this.watchedEditors = new Set()
  }

  handleObservedEditor(editor: TextEditor): void {
    if (this.watchedEditors.has(editor)) return
    this.watchedEditors.add(editor)

    console.log("hello world")
  }
}
