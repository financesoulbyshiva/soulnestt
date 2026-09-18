const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

function run(workspace, color) {
  const child = spawn('npm', ['run', 'dev', '--workspace', workspace], {
    cwd: root,
    shell: true,
  });
  child.stdout.on('data', (d) => process.stdout.write(`\x1b[${color}m[${workspace}]\x1b[0m ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`\x1b[${color}m[${workspace}]\x1b[0m ${d}`));
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) process.exitCode = code;
  });
  return child;
}

const children = [run('backend', '36'), run('frontend', '35')];

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    children.forEach((c) => c.kill());
    process.exit();
  });
}
