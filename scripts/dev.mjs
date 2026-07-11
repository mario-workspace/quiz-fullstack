import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd: cwd ?? root,
    stdio: 'inherit',
    shell: true,
    env: process.env,
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${name} exited with code ${code}`);
      process.exit(code);
    }
  });
  return child;
}

console.log('Starting API and Web servers...');
run('api', 'npx', ['vite-node', 'scripts/start-api.mjs']);
run('web', 'npx', ['next', 'dev', 'apps/web', '-p', '3000']);
