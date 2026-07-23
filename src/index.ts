#!/usr/bin/env node
import { Command } from 'commander'
import { registerExtract } from './commands/extract.js'
import { registerSave } from './commands/save.js'
import { registerSession } from './commands/session.js'
import { registerLogin } from './commands/login.js'

const program = new Command()

program
  .name('clipno')
  .description('Save any link to Notion. Extract any URL into structured data.\nhttps://clipno.app')
  .version('0.1.0')

registerExtract(program)
registerSave(program)
registerSession(program)
registerLogin(program)

export default program

program.parseAsync().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)

  if (process.argv.includes('--json')) {
    const code = typeof (err as { code?: unknown })?.code === 'string' ? (err as { code: string }).code : undefined
    process.stderr.write(`${JSON.stringify({ error: message, message, ...(code ? { code } : {}) })}\n`)
  } else {
    process.stderr.write(`Error: ${message}\n`)
  }

  process.exit(1)
})
