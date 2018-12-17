export const enum LVL {
  SILLY,
  LOG,
  WARN,
  ERROR
}

interface LogItem {
  level: LVL,
  displayed: boolean
  msg: any[]
}

export class Logger {
  logLevel: number

  private history: LogItem[]
  private index = 0
  private hasLooped = false
  private readonly maxHistorySize: number

  constructor (logLevel = LVL.LOG, maxHistorySize=100) {
    this.logLevel = logLevel
    this.maxHistorySize = maxHistorySize
    this.history = []
  }

  clear (): void {
    this.history = []
  }

  add (level: LVL, ...args: any): void {
    const display = this.shouldDisplay(level)
    const item = {
      level,
      displayed: display,
      msg: args
    }

    this.addToHistory(item)

    if (display) {
      switch (level) {
        case LVL.ERROR: console.error(args); break
        case LVL.WARN: console.warn(args); break
        default: console.log(args); break
      }
    }
  }

  log (...args: any): void {
    this.add(LVL.LOG, ...args)
  }

  warn (...args: any): void {
    this.add(LVL.WARN, ...args)
  }

  error (...args: any): void {
    this.add(LVL.ERROR, ...args)
  }

  addToHistory (item: LogItem): void {
    if (this.index > this.maxHistorySize) {
      this.index = 0
      this.hasLooped = true
    }
    this.history[this.index] = item
    this.index += 1
  }

  getHistory (): LogItem[] {
    if (!this.hasLooped) return this.history.slice()

    return this.history
      .slice(this.index, this.maxHistorySize)
      .concat(this.history.slice(0, this.index))
  }

  shouldDisplay (level: LVL): boolean {
    return level >= this.logLevel
  }
}
