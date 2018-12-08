import { ProjectWatcher } from "./config/projectWatcher"
import { GlobalConfig } from "./config/globalConfig"

/**
 * Core functions
 */

export function activate (): void {
  console.log("activating ide-latex")

  const config = new GlobalConfig()

  const project = new ProjectWatcher(config)

  project.findActiveProjectRoot()
}

export function deactivate (): void {
  console.log("deactivating ide-latex")
}

/**
 * Consumers
 */
