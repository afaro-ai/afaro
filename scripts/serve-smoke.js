#!/usr/bin/env node
'use strict';

// Serves tests/smoke/ on loopback so the smoke manifest has a page to drive.
//
//   npm run smoke
//
// Binds 127.0.0.1 only, serves the two files in tests/smoke/ and nothing else,
// and has no dependencies. Stop it with Ctrl+C.

const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'tests', 'smoke');
const PORT = Number(process.env.AFARO_SMOKE_PORT || 8787);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png'
};

const server = http.createServer((request, response) => {
  const requested = decodeURIComponent((request.url || '/').split('?')[0]);
  const relative = requested === '/' ? 'optout-form.html' : requested.replace(/^\/+/, '');
  const fullPath = path.resolve(ROOT, relative);

  // Serve out of tests/smoke/ and nowhere else.
  if (fullPath !== ROOT && !fullPath.startsWith(ROOT + path.sep)) {
    response.writeHead(403, { 'content-type': 'text/plain' });
    response.end('Outside the smoke directory.\n');
    return;
  }

  fs.readFile(fullPath, (error, body) => {
    if (error) {
      response.writeHead(404, { 'content-type': 'text/plain' });
      response.end('Not found.\n');
      return;
    }
    response.writeHead(200, {
      'content-type': TYPES[path.extname(fullPath)] || 'application/octet-stream',
      'cache-control': 'no-store'
    });
    response.end(body);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Smoke page: http://127.0.0.1:${PORT}/optout-form.html`);
  console.log('Leave this running. Ctrl+C stops it.');
});
