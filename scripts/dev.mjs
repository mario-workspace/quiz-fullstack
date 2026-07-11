import { spawn } from 'child_process';
import path from 'path';

const root = path.resolve(__dirname, '..');

function run(name: string, command: string, args: string[], cwd?: string) {
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
run('api', 'npx', ['vite-node', 'apps/api/src/index.ts']);
run('web', 'npx', ['next', 'dev', 'apps/web', '-p', '3000']);
