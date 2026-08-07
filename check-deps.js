const fs = require('fs');
const { execSync } = require('child_process');

function checkAndInstall(dir) {
  if (!fs.existsSync(`${dir}/node_modules`)) {
    console.log(`[Setup] Missing dependencies in '${dir}'. Installing now...`);
    // Run npm install for the specific directory
    execSync(dir === '.' ? 'npm install' : `npm --prefix ${dir} install`, { stdio: 'inherit' });
  } else {
    console.log(`[Setup] Dependencies already exist in '${dir}'. Skipping download.`);
  }
}

// Check root, server, and client directories
checkAndInstall('.');
checkAndInstall('./server');
checkAndInstall('./client');
