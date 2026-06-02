'use strict'

const fs = require('fs')
const path = require('path')
const os = require('os')

const CONFIG_DIR = path.join(os.homedir(), '.tokenwatch')
const QUEUE_FILE = path.join(CONFIG_DIR, 'queue.json')

function loadQueue() {
  try { return JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8')) } catch { return [] }
}

function saveQueue(events) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(events, null, 2))
}

async function flush(config) {
  const queue = loadQueue()
  if (queue.length === 0) return

  try {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: queue }),
    })

    if (res.ok) {
      saveQueue([])
      console.log(`[TokenWatch] Flushed ${queue.length} events`)
    } else {
      const err = await res.text()
      console.error(`[TokenWatch] Flush failed: ${res.status} ${err}`)
    }
  } catch (e) {
    console.error('[TokenWatch] Network error, events queued:', e.message)
  }
}

function watchClaudeCode(config) {
  // Claude Code writes usage logs to ~/.claude/logs/
  const claudeLogDir = process.env.CLAUDE_LOG_PATH ?? path.join(os.homedir(), '.claude', 'logs')
  if (!fs.existsSync(claudeLogDir)) {
    console.log('[TokenWatch] Claude Code logs directory not found, skipping:', claudeLogDir)
    return
  }

  try {
    const chokidar = require('chokidar')
    const watcher = chokidar.watch(path.join(claudeLogDir, '*.json'), {
      persistent: true,
      ignoreInitial: true,
    })

    watcher.on('add', (filePath) => parseClaudeLog(filePath, config))
    watcher.on('change', (filePath) => parseClaudeLog(filePath, config))
    console.log('[TokenWatch] Watching Claude Code logs:', claudeLogDir)
  } catch {
    console.warn('[TokenWatch] chokidar not available, Claude Code watching disabled')
  }
}

function parseClaudeLog(filePath, config) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const log = JSON.parse(content)

    // Claude Code log format: { usage: { input_tokens, output_tokens }, model, session_id }
    if (!log.usage) return

    const event = {
      engineer_id: config.engineerId ?? null,
      engineer_email: config.engineerEmail ?? null,
      engineer_name: config.engineerName ?? null,
      tool: 'claude_code',
      model: log.model ?? 'claude-sonnet',
      input_tokens: log.usage.input_tokens ?? 0,
      output_tokens: log.usage.output_tokens ?? 0,
      session_id: log.session_id ?? null,
      metadata: { source_file: path.basename(filePath) },
      timestamp: new Date().toISOString(),
    }

    const queue = loadQueue()
    queue.push(event)
    saveQueue(queue)
  } catch {
    // Non-JSON or malformed log, skip
  }
}

function startProxy(config) {
  // Simple HTTP proxy that intercepts OpenAI API calls
  const http = require('http')
  const https = require('https')

  const PORT = 9099

  const server = http.createServer(async (req, res) => {
    const body = await new Promise((resolve) => {
      const chunks = []
      req.on('data', c => chunks.push(c))
      req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    })

    // Forward to OpenAI
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: 'api.openai.com' },
    }

    const proxyReq = https.request(options, (proxyRes) => {
      const chunks = []
      proxyRes.on('data', c => chunks.push(c))
      proxyRes.on('end', () => {
        const responseBody = Buffer.concat(chunks).toString()
        res.writeHead(proxyRes.statusCode, proxyRes.headers)
        res.end(responseBody)

        // Extract token usage from response
        try {
          const json = JSON.parse(responseBody)
          if (json.usage) {
            const tool = req.url.includes('/completions') ? 'codex' : 'chatgpt'
            const event = {
              engineer_id: config.engineerId ?? null,
              engineer_email: config.engineerEmail ?? null,
              engineer_name: config.engineerName ?? null,
              tool,
              model: json.model ?? 'unknown',
              input_tokens: json.usage.prompt_tokens ?? 0,
              output_tokens: json.usage.completion_tokens ?? 0,
              session_id: null,
              metadata: { endpoint: req.url },
              timestamp: new Date().toISOString(),
            }
            const queue = loadQueue()
            queue.push(event)
            saveQueue(queue)
          }
        } catch {}
      })
    })

    proxyReq.on('error', (e) => {
      res.writeHead(502)
      res.end(e.message)
    })

    proxyReq.write(body)
    proxyReq.end()
  })

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[TokenWatch] OpenAI proxy listening on http://localhost:${PORT}`)
    console.log(`             Set: export OPENAI_BASE_URL=http://localhost:${PORT}/openai`)
  })
}

exports.start = function start(config) {
  console.log('[TokenWatch] Agent starting...')

  if (config.tools?.claude_code) {
    watchClaudeCode(config)
  }

  if (config.tools?.openai_proxy) {
    startProxy(config)
  }

  // Flush queue every reportingInterval seconds
  const interval = (config.reportingInterval ?? 60) * 1000
  setInterval(() => flush(config), interval)

  // Also flush on startup if there's a backlog
  flush(config)

  console.log(`[TokenWatch] Running. Reporting every ${config.reportingInterval ?? 60}s`)
}
