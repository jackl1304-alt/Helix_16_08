#!/usr/bin/env node
// Replit-spezifischer Deployment-Wrapper für Cache-Permission-Fixes

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Replit Deployment Wrapper gestartet...');

// Replit-spezifische Umgebungsvariablen setzen
process.env.NPM_CONFIG_CACHE = '/tmp/.npm-cache-replit';
process.env.NPM_CONFIG_TMP = '/tmp';
process.env.NPM_CONFIG_INIT_CACHE = '/tmp/.npm-init-replit';
process.env.DISABLE_NPM_CACHE = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_UPDATE_NOTIFIER = 'false';

console.log('✅ Replit-Cache-Variablen gesetzt');

// Cache-Verzeichnisse für Replit erstellen
const cacheDirectories = [
  '/tmp/.npm-cache-replit',
  '/tmp/.npm-init-replit',
  '/tmp/.npm-global-replit',
  '/tmp/.npm-user-replit'
];

cacheDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    console.log(`✅ Erstellt: ${dir}`);
  }
});

// Replit-optimierte .npmrc erstellen
const npmrcContent = `cache=/tmp/.npm-cache-replit
tmp=/tmp
init-cache=/tmp/.npm-init-replit
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
globalconfig=/tmp/.npmrc-global-replit
userconfig=/tmp/.npmrc-user-replit`;

fs.writeFileSync('/tmp/.npmrc-replit', npmrcContent);
fs.writeFileSync('/tmp/.npmrc-global-replit', 'cache=/tmp/.npm-cache-replit\ntmp=/tmp\nfund=false');
fs.writeFileSync('/tmp/.npmrc-user-replit', 'cache=/tmp/.npm-cache-replit\ntmp=/tmp');

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
    NPM_CONFIG_USERCONFIG: '/tmp/.npmrc-replit'
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