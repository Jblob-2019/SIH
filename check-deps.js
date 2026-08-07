const fs = require('fs');
const { execSync } = require('child_process');

function checkAndInstall(dir) {
  let missing = false;
  
  if (fs.existsSync(`${dir}/package.json`)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      
      for (const dep of Object.keys(deps)) {
        if (!fs.existsSync(`${dir}/node_modules/${dep}`)) {
          missing = true;
          break;
        }
      }
    } catch (e) {
      missing = true; // Fallback to install on read error
    }
  } else {
    // If no package.json, we don't need to install
    return;
  }

  if (missing || !fs.existsSync(`${dir}/node_modules`)) {
    console.log(`[Setup] Missing or incomplete dependencies in '${dir}'. Installing now...`);
    execSync(dir === '.' ? 'npm install' : `npm --prefix ${dir} install`, { stdio: 'inherit' });
  } else {
    console.log(`[Setup] Dependencies verified successfully in '${dir}'.`);
  }
}

// Check root, server, and client directories
checkAndInstall('.');
checkAndInstall('./server');
checkAndInstall('./client');
