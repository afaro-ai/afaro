#!/usr/bin/env node
'use strict';

// Afaro data removal: the README's broker table.
//
// Every cell comes from a field in that broker's manifest. Nothing here knows
// anything about a broker that is not written down and backed by a capture, so
// the table cannot drift from the catalogue: it is regenerated from it.
//
// What it deliberately does not say: whether anybody has run the broker, or
// whether a removal worked. Those are facts about runs, not about manifests,
// and the block under the table is where they live, written by hand and
// labelled as testimony.
//
// Usage:
//   node scripts/brokers-table.js           rewrite the table in README.md
//   node scripts/brokers-table.js --check   fail if README.md is out of date

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MANIFEST_DIR = path.join(REPO_ROOT, 'manifests');
const README = path.join(REPO_ROOT, 'README.md');
const START = '<!-- brokers:start -->';
const END = '<!-- brokers:end -->';

const METHOD = {
  form: 'Form',
  email: 'Email',
  search_then_form: 'Search, then form',
  manual: 'Manual'
};

const GATE = {
  captcha: 'captcha',
  bot_wall: 'bot wall',
  id_upload: 'ID upload',
  phone_verify: 'phone verify',
  submit: 'submit'
};

const HANDOFF = {
  page_not_captured: 'the rest of the flow is not captured',
  requires_listing_url: 'it needs a listing URL',
  requires_email_link: 'a link the broker emails'
};

// Brokers are the .json files sitting directly in manifests/. A name beginning
// with an underscore is not a broker, which is where the smoke manifest lives
// and which the validator and both skills already skip.
function readManifests() {
  return fs
    .readdirSync(MANIFEST_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_'))
    .map((entry) => JSON.parse(fs.readFileSync(path.join(MANIFEST_DIR, entry.name), 'utf8')));
}

// Where the manifest stops, in the words a person reading the README needs
// rather than the words the schema uses.
function endsAt(manifest) {
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const last = steps[steps.length - 1];
  if (!last) return 'Nothing';
  if (last.type === 'handoff') {
    const why = HANDOFF[last.reason] || last.reason;
    return `Handed off: ${why}`;
  }
  if (last.type === 'wait_for_email_confirm') return 'Submitted, then a confirmation email';
  if (last.type === 'click') return 'Submitted';
  return last.type;
}

// The gate reasons in the order the manifest raises them, counted where a
// broker asks more than once, because four submit gates is a fact about what a
// person is in for and one is a different experience.
function gates(manifest) {
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const order = [];
  const counts = new Map();

  for (const step of steps) {
    if (!step || step.type !== 'human_gate') continue;
    const label = GATE[step.reason] || step.reason;
    if (!counts.has(label)) order.push(label);
    counts.set(label, (counts.get(label) || 0) + 1);
  }

  if (order.length === 0) return 'None (nothing is sent)';
  return order.map((label) => (counts.get(label) > 1 ? `${label} ×${counts.get(label)}` : label)).join(', ');
}

function buildTable(manifests) {
  const rows = manifests
    .slice()
    .sort((a, b) => String(a.name).localeCompare(String(b.name)))
    .map((m) =>
      `| ${m.name} | ${METHOD[m.method] || m.method} | ${endsAt(m)} | ${gates(m)} | ${m.verified_on} |`
    );

  const count = rows.length;
  const noun = count === 1 ? 'broker' : 'brokers';

  return [
    START,
    '',
    `${count} ${noun}. Every cell below is read from that broker's manifest, so this table cannot say anything the catalogue does not.`,
    '',
    '| Broker | Opt-out method | Flow ends at | Gates you will see | Page last verified |',
    '|---|---|---|---|---|',
    ...rows,
    '',
    END
  ].join('\n');
}

function splice(readme, table) {
  const from = readme.indexOf(START);
  const to = readme.indexOf(END);
  if (from === -1 || to === -1) {
    throw new Error(`README.md is missing the ${START} / ${END} markers`);
  }
  if (to < from) {
    throw new Error(`README.md has ${END} before ${START}`);
  }
  return readme.slice(0, from) + table + readme.slice(to + END.length);
}

function main() {
  const check = process.argv.includes('--check');
  let readme;
  let table;

  try {
    readme = fs.readFileSync(README, 'utf8');
    table = buildTable(readManifests());
  } catch (error) {
    console.error(`afaro brokers-table: ${error.message}`);
    process.exit(2);
  }

  let updated;
  try {
    updated = splice(readme, table);
  } catch (error) {
    console.error(`afaro brokers-table: ${error.message}`);
    process.exit(2);
  }

  if (check) {
    if (updated === readme) {
      console.log('afaro brokers-table: the table in README.md matches the manifests.');
      process.exit(0);
    }
    console.error('afaro brokers-table: the table in README.md is out of date.');
    console.error('  Run: npm run brokers:table');
    console.error('  Nothing between the markers is edited by hand; it is generated from manifests/.');
    process.exit(1);
  }

  if (updated === readme) {
    console.log('afaro brokers-table: already current, nothing written.');
    process.exit(0);
  }

  fs.writeFileSync(README, updated);
  console.log('afaro brokers-table: README.md updated.');
}

main();
