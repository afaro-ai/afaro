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
    // Loopback belongs to the smoke manifest alone. A broker manifest pointing
    // at localhost is not a broker manifest.
    dir: 'loopback-outside-smoke',
    capture: true,
    change: (m) => {
      const local = 'http://127.0.0.1:8787/optout-form.html';
      m.home_url = local;
      m.search_url_template = `${local}?name={{full_name}}`;
      m.optout_url = local;
      m.source_url = local;
      for (const step of m.steps) {
        if (step.type === 'navigate') step.url = local;
      }
    }
  },
  {
    dir: 'undeclared-profile-field',
    capture: true,
    change: (m) => {
      m.profile_fields_required = m.profile_fields_required.filter((f) => f !== 'emails');
    }
  },
  {
    // The bypass the click-before-gate fixture covers, wrapped in a second
    // trick: a fill placed after the gate. The old check took the last fill
    // anywhere in the list, so a fill after the gate left an empty window
    // between them and the early send went unseen. Both problems are reported.
    // Stays permanently, by ruling, alongside click-before-gate.
    dir: 'fill-after-gate',
    capture: true,
    change: (m) => {
      const gate = m.steps.findIndex((s) => s.type === 'human_gate');
      m.steps.splice(gate, 0, { type: 'click', selector: { label: 'Submit request' } });
      const moved = m.steps.findIndex((s) => s.type === 'human_gate');
      m.steps.splice(moved + 1, 0, {
        type: 'fill_field',
        selector: { label: 'Email address' },
        value_from: 'emails'
      });
    }
  },
  {
    // A step that fills from the listing, with the step that finds the listing
    // taken away. Nothing produces the URL it would type.
    dir: 'listing-value-without-find-listing',
    capture: true,
    change: (m) => {
      m.steps = m.steps.filter((s) => s.type !== 'find_listing');
    }
  },
  {
    // A handoff with work after it. A handoff is where the manifest stops,
    // so a step after one is a step nobody is watching Afaro take.
    dir: 'handoff-not-terminal',
    capture: true,
    change: (m) => {
      m.steps.push({
        type: 'handoff',
        reason: 'page_not_captured',
        prompt: 'Finish the remaining steps in the browser.'
      });
      m.steps.push({ type: 'click', selector: { label: 'Done' } });
    }
  },
  {
    // No window on the page and nothing saying so. The number would read as
    // the broker's own.
    dir: 'recheck-null-without-flag',
    capture: true,
    change: (m) => {
      m.recheck_after_days = null;
    }
  },
  {
    // The reverse: the page states no window, and a number sits there anyway.
    dir: 'recheck-unstated-with-number',
    capture: true,
    change: (m) => {
      m.recheck_stated = false;
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
