#!/usr/bin/env node
'use strict';

// Rebuilds every fixture directory from tests/fixtures/valid/example-broker.json.
//
// The fixtures are committed files, so a reviewer can read them without running
// anything. This script exists so they cannot drift from the one manifest they
// are all variations of. Run it after editing the valid fixture:
//
//   node tests/make-fixtures.js && npm test

const fs = require('fs');
const path = require('path');

const FIXTURES = path.join(__dirname, 'fixtures');
const BASE = path.join(FIXTURES, 'valid', 'example-broker.json');

// A 1x1 transparent PNG. A fixture needs a real file on disk, not a real
// screenshot of anyone's listing.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const base = JSON.parse(fs.readFileSync(BASE, 'utf8'));

const cases = [
  {
    dir: 'missing-source-url',
    capture: true,
    change: (m) => { delete m.source_url; }
  },
  {
    dir: 'missing-verified-on',
    capture: true,
    change: (m) => { delete m.verified_on; }
  },
  {
    dir: 'missing-source-capture',
    capture: true,
    change: (m) => { delete m.source_capture; }
  },
  {
    dir: 'absent-capture-file',
    capture: false,
    change: () => {}
  },
  {
    dir: 'bad-human-gate-reason',
    capture: true,
    change: (m) => { m.steps.find((s) => s.type === 'human_gate').reason = 'skip_gate'; }
  },
  {
    dir: 'no-submit-gate',
    capture: true,
    change: (m) => { m.steps = m.steps.filter((s) => s.type !== 'human_gate'); }
  },
  {
    // A send click placed before the gate, with a harmless one after it.
    dir: 'click-before-gate',
    capture: true,
    change: (m) => {
      const gate = m.steps.findIndex((s) => s.type === 'human_gate');
      m.steps.splice(gate, 0, { type: 'click', selector: { label: 'Submit request' } });
      m.steps.push({ type: 'click', selector: { label: 'Done' } });
    }
  },
  {
    dir: 'no-send-after-gate',
    capture: true,
    change: (m) => { m.steps = m.steps.filter((s) => s.type !== 'click'); }
  },
  {
    // A broker wanting a government ID is method manual, and a manual manifest
    // may not fill or click anything.
    dir: 'manual-with-click',
    capture: true,
    change: (m) => {
      m.method = 'manual';
      m.id_requirements = {
        required: true,
        kinds: ['government_id'],
        note: 'The page asks for a photo of a government ID.'
      };
    }
  },
  {
    dir: 'undeclared-profile-field',
    capture: true,
    change: (m) => {
      m.profile_fields_required = m.profile_fields_required.filter((f) => f !== 'emails');
    }
  }
];

for (const testCase of cases) {
  const dir = path.join(FIXTURES, testCase.dir);
  fs.mkdirSync(dir, { recursive: true });
  const manifest = JSON.parse(JSON.stringify(base));
  testCase.change(manifest);
  fs.writeFileSync(path.join(dir, 'example-broker.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const captures = path.join(dir, 'captures');
  if (testCase.capture) {
    fs.mkdirSync(captures, { recursive: true });
    fs.writeFileSync(path.join(captures, 'example-broker-optout.png'), PNG);
  } else if (fs.existsSync(captures)) {
    fs.rmSync(captures, { recursive: true });
  }
}

fs.mkdirSync(path.join(FIXTURES, 'valid', 'captures'), { recursive: true });
fs.writeFileSync(path.join(FIXTURES, 'valid', 'captures', 'example-broker-optout.png'), PNG);

fs.mkdirSync(path.join(FIXTURES, 'empty'), { recursive: true });
fs.writeFileSync(path.join(FIXTURES, 'empty', '.gitkeep'), '');

console.log(`${cases.length + 2} fixture directories rebuilt from tests/fixtures/valid.`);
