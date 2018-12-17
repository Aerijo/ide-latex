function gatherCommandsWithFrequency (text: string): Map<string, number> {
  const commands: Map<string, number> = new Map()

  const searchTerm = /\\([a-zA-Z@]+|.)|%.*/g

  let match = searchTerm.exec(text)
  while (match !== null) {
    if (match[0].charAt(0) === "\\") {
      const command = match[1]
      const count = commands.get(command) || 0
      commands.set(command, count + 1)
    }

    match = searchTerm.exec(text)
  }

  return commands
}
