#!/usr/bin/env node
import { Command } from 'commander'

const program = new Command()

program
  .name('clipno')
  .description('Save any link to Notion. Extract any URL into structured data.\nhttps://clipno.app')
  .version('0.1.0')

export default program

program.parseAsync().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err)
  process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
})
