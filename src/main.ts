export function activate (state): void {
  console.log("Activating ide-latex")
  console.log(state)
}

export function deactivate (): void {
  console.log("deactivating")
}
