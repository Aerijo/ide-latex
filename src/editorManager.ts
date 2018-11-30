import { CompositeDisposable } from 'atom'

/**
 * Tracks editors to apply and remove custom behaviour as needed
 */

export class EditorManager {
  subscriptions: CompositeDisposable

  constructor () {
    this.subscriptions = new CompositeDisposable()
  }
}
