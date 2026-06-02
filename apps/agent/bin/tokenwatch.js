#!/usr/bin/env node
'use strict'

const { parseArgs } = require('util')
const path = require('path')
const fs = require('fs')
const os = require('os')

const CONFIG_DIR = path.join(os.homedir(), '.tokenwatch')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')
const QUEUE_FILE = path.join(CONFIG_DIR, 'queue.json')

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch { return null }
}

function saveConfig(cfg) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2))
}

const args = process.argv.slice(2)
const command = args[0]

if (command === 'init') {
  const keyIdx = args.indexOf('--key')
  const emailIdx = args.indexOf('--email')
  const nameIdx = args.indexOf('--name')
  const key = keyIdx >= 0 ? args[keyIdx + 1] : null
  const email = emailIdx >= 0 ? args[emailIdx + 1] : null
  const name = nameIdx >= 0 ? args[nameIdx + 1] : null

  if (!key || !key.startsWith('TW_')) {
    console.error('❌  Please provide your API key: tokenwatch init --key TW_xxxx')
    process.exit(1)
  }

  const config = {
    apiKey: key,
    engineerEmail: email ?? '',
    engineerName: name ?? '',
    apiUrl: 'https://tokenwatch.flowlog.dev/api/ingest',
    tools: { claude_code: true, openai_proxy: true },
    reportingInterval: 60,
  }

  saveConfig(config)
  console.log('✅  TokenWatch initialized!')
  console.log(`   Config saved to ${CONFIG_FILE}`)
  console.log('')
  console.log('   Start tracking:  tokenwatch start')
  console.log('   Check status:    tokenwatch status')
} else if (command === 'status') {
  const config = loadConfig()
  if (!config) {
    console.log('❌  Not initialized. Run: tokenwatch init --key TW_xxxx')
    process.exit(1)
  }
  console.log('✅  TokenWatch is configured')
  console.log(`   API Key: ${config.apiKey.slice(0, 8)}...`)
  console.log(`   Engineer: ${config.engineerEmail || '(not set)'}`)
  if (config.engineerName) console.log(`   Name: ${config.engineerName}`)
  try {
    const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'))
    console.log(`   Queued events: ${queue.length}`)
  } catch {
    console.log('   Queued events: 0')
  }
} else if (command === 'start') {
  const config = loadConfig()
  if (!config) {
    console.error('❌  Not initialized. Run: tokenwatch init --key TW_xxxx')
    process.exit(1)
  }
  console.log('🚀  Starting TokenWatch agent...')
  require('../src/agent').start(config)
} else {
  console.log(`
TokenWatch Agent v0.1.0

Usage:
  tokenwatch init --key TW_xxxx [--email you@company.com] [--name "Your Name"]
  tokenwatch start
  tokenwatch status

Commands:
  init    Initialize with your API key
  start   Start the background agent
  status  Check configuration and queue status
`)
}
