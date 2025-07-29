#!/usr/bin/env node
// Replit-optimierter Server-Start für Produktionsumgebung

import { spawn } from 'child_process';

console.log('🚀 Replit Server Start mit Cache-Optimierungen...');

// Deployment-optimierte Produktions-Umgebungsvariablen
process.env.NODE_ENV = 'production';
process.env.NPM_CONFIG_CACHE = '/tmp/.npm-deployment-cache';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
process.env.PORT = process.env.PORT || '5000';
process.env.NPM_CONFIG_GLOBALCONFIG = '/tmp/.npmrc-deployment-global';
process.env.NPM_CONFIG_USERCONFIG = '/tmp/.npmrc-deployment-user';

console.log('✅ Produktions-Umgebung konfiguriert');
console.log(`🌐 Server startet auf Port ${process.env.PORT}`);

// Server-Prozess starten
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: process.env
});

serverProcess.on('close', (code) => {
  console.log(`Server beendet mit Code ${code}`);
  process.exit(code);
});

serverProcess.on('error', (err) => {
  console.error('Server-Fehler:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Server wird heruntergefahren...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server wird beendet...');
  serverProcess.kill('SIGTERM');
});