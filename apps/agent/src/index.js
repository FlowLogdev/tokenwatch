'use strict'

const { start } = require('./agent')

/**
 * SDK entry point for manual tracking:
 * const { track } = require('tokenwatch-agent')
 * track({ tool: 'custom', model: 'gpt-4o', inputTokens: 1200, outputTokens: 340 })
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

const CONFIG_FILE = path.join(os.homedir(), '.tokenwatch', 'config.json')
const QUEUE_FILE = path.join(os.homedir(), '.tokenwatch', 'queue.json')

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch { return null }
}

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')) } catch { return [] }
}

function saveQueue(events) {
  fs.mkdirSync(path.dirname(QUEUE_FILE), { recursive: true })
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(events, null, 2))
}

/**
 * Manually track a usage event.
 * @param {object} event
 * @param {string} event.tool - tool name (e.g. 'custom', 'claude_code')
 * @param {string} [event.model] - model name
 * @param {number} [event.inputTokens] - input token count
 * @param {number} [event.outputTokens] - output token count
 * @param {string} [event.sessionId] - session identifier
 * @param {object} [event.metadata] - arbitrary metadata
 */
function track({ tool, model, inputTokens, outputTokens, sessionId, metadata }) {
  const config = loadConfig()
  if (!config) {
    console.warn('[TokenWatch] Not configured. Run: tokenwatch init --key TW_xxxx')
    return
  }

  const queue = loadQueue()
  queue.push({
    engineer_id: config.engineerId ?? null,
    engineer_email: config.engineerEmail ?? null,
    engineer_name: config.engineerName ?? null,
    tool,
    model: model ?? 'unknown',
    input_tokens: inputTokens ?? 0,
    output_tokens: outputTokens ?? 0,
    session_id: sessionId ?? null,
    metadata: metadata ?? null,
    timestamp: new Date().toISOString(),
  })
  saveQueue(queue)
}

module.exports = { start, track }
