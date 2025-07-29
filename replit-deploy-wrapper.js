#!/usr/bin/env node
// Replit-spezifischer Deployment-Wrapper für Cache-Permission-Fixes

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Replit Deployment Wrapper gestartet...');

// Set NPM_CONFIG_CACHE environment variable and additional variables for Node.js module access
process.env.NPM_CONFIG_CACHE = '/tmp/.npm-isolated-cache';
process.env.NPM_CONFIG_TMP = '/tmp';
process.env.NPM_CONFIG_INIT_CACHE = '/tmp/.npm-isolated-init';
process.env.NPM_CONFIG_GLOBALCONFIG = '/tmp/.npmrc-isolated-global';
process.env.NPM_CONFIG_USERCONFIG = '/tmp/.npmrc-isolated-user';
process.env.NPM_CONFIG_PREFIX = '/tmp/.npm-isolated-prefix';
process.env.NPM_CONFIG_STORE_DIR = '/tmp/.npm-isolated-store';
process.env.DISABLE_NPM_CACHE = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --max-semi-space-size=1024';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_UPDATE_NOTIFIER = 'false';
process.env.NODE_PATH = '';
process.env.HOME_CACHE_DIR = '/tmp/.cache-isolated';
process.env.XDG_CACHE_HOME = '/tmp/.cache-isolated';

console.log('✅ Replit-Cache-Variablen gesetzt');

// Clear cache and create completely writable directories before build
const cacheDirectories = [
  '/tmp/.npm-isolated-cache',
  '/tmp/.npm-isolated-init', 
  '/tmp/.npm-isolated-global',
  '/tmp/.npm-isolated-user',
  '/tmp/.npm-isolated-prefix',
  '/tmp/.npm-isolated-store',
  '/tmp/.cache-isolated'
];

cacheDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    console.log(`✅ Erstellt: ${dir}`);
  }
});

// Create isolated npmrc files in writable directory
const npmrcContent = `cache=/tmp/.npm-isolated-cache
tmp=/tmp
init-cache=/tmp/.npm-isolated-init
prefix=/tmp/.npm-isolated-prefix
store-dir=/tmp/.npm-isolated-store
fund=false
audit=false
update-notifier=false
disable-opencollective=true
progress=false
loglevel=warn
prefer-offline=false
unsafe-perm=true
cache-max=0
cache-min=0
package-lock=false
shrinkwrap=false
globalconfig=/tmp/.npmrc-isolated-global
userconfig=/tmp/.npmrc-isolated-user
prefer-online=true
unsafe-perm=true`;

fs.writeFileSync('/tmp/.npmrc-isolated', npmrcContent);
fs.writeFileSync('/tmp/.npmrc-isolated-global', 'cache=/tmp/.npm-isolated-cache\ntmp=/tmp\nprefix=/tmp/.npm-isolated-prefix\nstore-dir=/tmp/.npm-isolated-store\nfund=false\naudit=false\nprefer-online=true\nunsafe-perm=true');
fs.writeFileSync('/tmp/.npmrc-isolated-user', 'cache=/tmp/.npm-isolated-cache\ntmp=/tmp\nfund=false\naudit=false');

console.log('✅ Replit-NPM-Konfiguration erstellt');

// Problematische Cache-Verzeichnisse sicher entfernen
const cleanupPaths = ['node_modules/.cache', path.join(process.env.HOME || '', '.npm/_cacache')];
cleanupPaths.forEach(p => {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log(`✅ Entfernt: ${p}`);
    }
  } catch (err) {
    console.log(`⚠️  Warnung bei ${p}: ${err.message}`);
  }
});

// Build-Prozess mit Replit-Optimierungen starten
console.log('🏗️  Starte Build-Prozess mit Replit-Optimierungen...');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NPM_CONFIG_USERCONFIG: '/tmp/.npmrc-isolated-user',
    NPM_CONFIG_GLOBALCONFIG: '/tmp/.npmrc-isolated-global'
  }
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Replit-Build erfolgreich abgeschlossen!');
    process.exit(0);
  } else {
    console.error('❌ Build-Fehler aufgetreten');
    process.exit(code);
  }
});

buildProcess.on('error', (err) => {
  console.error('❌ Build-Prozess-Fehler:', err);
  process.exit(1);
});