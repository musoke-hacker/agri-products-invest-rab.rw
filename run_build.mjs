import { exec } from 'child_process';
import fs from 'fs';

console.log('Starting build...');
exec('node node_modules/next/dist/bin/next build', (error, stdout, stderr) => {
  let log = stdout + '\n\n' + stderr;
  if (error) {
    log += '\nERROR:\n' + error.message;
  }
  fs.writeFileSync('build_debug.txt', log);
  console.log('Build finished and written to build_debug.txt');
});
