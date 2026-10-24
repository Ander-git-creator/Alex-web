const { spawn } = require('node:child_process');
const net = require('node:net');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const logFile = path.join(root, 'artifacts', 'local-site.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });
function log(message) {
  if (fs.existsSync(logFile) && fs.statSync(logFile).size > 2 * 1024 * 1024) {
    fs.renameSync(logFile, `${logFile}.previous`);
  }
  fs.appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`);
}

// A named pipe prevents multiple login/start commands launching competing servers.
const singleton = net.createServer(socket => socket.end());
singleton.on('error', error => {
  if (error.code !== 'EADDRINUSE') log(`Supervisor: ${error.message}`);
  process.exit(error.code === 'EADDRINUSE' ? 0 : 1);
});
singleton.listen('\\\\.\\pipe\\xiaofeng-portfolio-5173', () => {
  let child = null;
  let failures = 0;
  let checking = false;
  let stopping = false;
  let retry;

  function start() {
    if (stopping || child) return;
    log('Starting local website on http://127.0.0.1:5173');
    child = spawn(process.execPath, [
      path.join(root, 'node_modules', 'vite', 'bin', 'vite.js'),
      '--host', '127.0.0.1', '--port', '5173', '--strictPort',
    ], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    const player = child;
    player.stdout.on('data', data => log(data.toString().trim()));
    player.stderr.on('data', data => log(data.toString().trim()));
    player.on('error', error => log(`Server: ${error.message}`));
    player.on('close', code => {
      if (child === player) child = null;
      log(`Server exited (${code}); retrying in 5 seconds`);
      if (!stopping) retry = setTimeout(start, 5000);
    });
    failures = 0;
  }

  const health = setInterval(() => {
    if (checking || !child) return;
    checking = true;
    let finished = false;
    const finish = healthy => {
      if (finished) return;
      finished = true;
      checking = false;
      failures = healthy ? 0 : failures + 1;
      if (failures >= 3 && child) {
        log('Three failed health checks; restarting server');
        failures = 0;
        child.kill();
      }
    };
    const request = http.get('http://127.0.0.1:5173/', response => {
      response.resume();
      finish(response.statusCode === 200);
    });
    request.setTimeout(5000, () => request.destroy(new Error('Health check timeout')));
    request.on('error', () => finish(false));
  }, 10000);

  function stop() {
    stopping = true;
    clearTimeout(retry);
    clearInterval(health);
    child?.kill();
    singleton.close(() => process.exit(0));
  }
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  start();
});
