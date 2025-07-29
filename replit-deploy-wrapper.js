#!/usr/bin/env node
// Replit-spezifischer Deployment-Wrapper für Cache-Permission-Fixes

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Replit Deployment Wrapper gestartet...');

// Deployment-optimierte Umgebungsvariablen setzen
process.env.NPM_CONFIG_CACHE = '/tmp/.npm-deployment-cache';
process.env.NPM_CONFIG_TMP = '/tmp';
process.env.NPM_CONFIG_INIT_CACHE = '/tmp/.npm-deployment-init';
process.env.NPM_CONFIG_GLOBALCONFIG = '/tmp/.npmrc-deployment-global';
process.env.NPM_CONFIG_USERCONFIG = '/tmp/.npmrc-deployment-user';
process.env.DISABLE_NPM_CACHE = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.NPM_CONFIG_PROGRESS = 'false';
process.env.NPM_CONFIG_AUDIT = 'false';
process.env.NPM_CONFIG_FUND = 'false';
process.env.NPM_CONFIG_UPDATE_NOTIFIER = 'false';

console.log('✅ Replit-Cache-Variablen gesetzt');

// Cache-Verzeichnisse für Deployment erstellen
const cacheDirectories = [
  '/tmp/.npm-deployment-cache',
  '/tmp/.npm-deployment-init',
  '/tmp/.npm-deployment-global',
  '/tmp/.npm-deployment-user'
];

cacheDirectories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
    console.log(`✅ Erstellt: ${dir}`);
  }
});

// Deployment-optimierte .npmrc erstellen
const npmrcContent = `cache=/tmp/.npm-deployment-cache
tmp=/tmp
init-cache=/tmp/.npm-deployment-init
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
globalconfig=/tmp/.npmrc-deployment-global
userconfig=/tmp/.npmrc-deployment-user`;

fs.writeFileSync('/tmp/.npmrc-deployment', npmrcContent);
fs.writeFileSync('/tmp/.npmrc-deployment-global', 'cache=/tmp/.npm-deployment-cache\ntmp=/tmp\nfund=false');
fs.writeFileSync('/tmp/.npmrc-deployment-user', 'cache=/tmp/.npm-deployment-cache\ntmp=/tmp');

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
    NPM_CONFIG_USERCONFIG: '/tmp/.npmrc-deployment',
    NPM_CONFIG_GLOBALCONFIG: '/tmp/.npmrc-deployment-global'
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