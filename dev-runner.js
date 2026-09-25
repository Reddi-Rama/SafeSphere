import { spawn, execSync } from 'node:child_process';

// Ensure no stale uvicorn process is occupying port 8001
try {
  execSync('fuser -k 8001/tcp || pkill -f "uvicorn backend.main:app" || true', { stdio: 'ignore' });
} catch {
  // Ignore errors if nothing was running
}

let backend = null;
let isShuttingDown = false;

function startBackend() {
  if (isShuttingDown) return;
  backend = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '0.0.0.0', '--port', '8001'], {
    stdio: 'inherit',
    env: process.env
  });

  backend.on('error', (err) => {
    console.warn('Backend process error:', err);
  });

  backend.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.log(`Backend exited (${code || signal}). Restarting in 1s...`);
      setTimeout(startBackend, 1000);
    }
  });
}

startBackend();

// Start Vite dev server for frontend on port 3000
const vite = spawn('npx', ['vite', 'frontend', '--config', 'frontend/vite.config.js', '--port', '3000', '--host', '0.0.0.0'], {
  stdio: 'inherit',
  env: process.env
});

vite.on('exit', (code) => {
  isShuttingDown = true;
  if (backend) backend.kill();
  process.exit(code || 0);
});

function cleanup() {
  isShuttingDown = true;
  if (backend) backend.kill();
  vite.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

