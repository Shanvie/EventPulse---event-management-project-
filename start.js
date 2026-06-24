const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Event Management System MERN Stack...');
console.log('==================================================');

// Spawn backend server
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Spawn frontend dev server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Manage process termination
backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  process.exit(code);
});

frontend.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
  process.exit(code);
});
