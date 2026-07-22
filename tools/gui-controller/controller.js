'use strict'
const http = require('http')
const { spawn, exec } = require('child_process')
const path = require('path')
const fs = require('fs')

const CTRL_PORT = 3001
const ROOT = path.join(__dirname, '../..')


let appProcess = null
const logBuffer = []
const MAX_LOGS = 500
const sseClients = new Set()

function broadcast(obj) {
  const msg = `data: ${JSON.stringify(obj)}\n\n`
  for (const res of sseClients) { try { res.write(msg) } catch (_) {} }
}

function addLog(raw, type = 'out') {
  const lines = String(raw).split(/\r?\n/).filter(l => l.trim())
  for (const line of lines) {
    const entry = { t: new Date().toLocaleTimeString('zh-TW', { hour12: false }), line, type }
    if (logBuffer.length >= MAX_LOGS) logBuffer.shift()
    logBuffer.push(entry)
    broadcast({ ev: 'log', ...entry })
  }
}

function startApp() {
  if (appProcess) { addLog('⚠ 伺服器已在運行中', 'info'); return }
  addLog('▶ 啟動 Next.js 開發伺服器...', 'info')
  appProcess = spawn('npm run dev', [], { cwd: ROOT, shell: true })
  broadcast({ ev: 'status', running: true, pid: appProcess.pid })
  appProcess.stdout.on('data', d => addLog(d.toString(), 'out'))
  appProcess.stderr.on('data', d => addLog(d.toString(), 'err'))
  appProcess.on('exit', code => {
    addLog(`■ 伺服器已停止 (exit: ${code ?? '—'})`, 'info')
    appProcess = null
    broadcast({ ev: 'status', running: false, pid: null })
  })
}

function stopApp(cb) {
  if (!appProcess) { cb?.(); return }
  const pid = appProcess.pid
  addLog(`■ 正在停止伺服器 (PID: ${pid})...`, 'info')
  exec(`taskkill /pid ${pid} /f /t`, () => {
    appProcess = null
    broadcast({ ev: 'status', running: false, pid: null })
    addLog('✓ 伺服器已停止', 'info')
    cb?.()
  })
}

const HTML = fs.readFileSync(path.join(__dirname, 'controller.html'), 'utf-8')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}


const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const key = `${req.method} ${url.pathname}`

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS); return res.end()
  }

  if (key === 'GET /') {
    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8', ...CORS })
    return res.end(HTML)
  }
  if (key === 'GET /api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', ...CORS })
    return res.end(JSON.stringify({ running: !!appProcess, pid: appProcess?.pid ?? null }))
  }
  if (key === 'GET /api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive', ...CORS })
    res.write(`data: ${JSON.stringify({ ev: 'init', running: !!appProcess, pid: appProcess?.pid ?? null, logs: logBuffer })}\n\n`)
    sseClients.add(res)
    req.on('close', () => sseClients.delete(res))
    return
  }
  if (key === 'POST /api/start') {
    startApp()
    res.writeHead(200, { 'Content-Type': 'application/json', ...CORS })
    return res.end('{"ok":true}')
  }
  if (key === 'POST /api/stop') {
    return stopApp(() => { res.writeHead(200, { 'Content-Type': 'application/json', ...CORS }); res.end('{"ok":true}') })
  }
  res.writeHead(404, CORS); res.end()
})

process.on('SIGINT', () => stopApp(() => process.exit(0)))
process.on('exit', () => { if (appProcess) exec(`taskkill /pid ${appProcess.pid} /f /t`) })

server.listen(CTRL_PORT, '127.0.0.1', () => {
  console.log(`\n🐾  Doggie 控制台已啟動  →  http://localhost:${CTRL_PORT}\n`)
  addLog(`✓ 控制伺服器就緒 (port ${CTRL_PORT})`, 'info')
})
