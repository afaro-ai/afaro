#!/usr/bin/env node
'use strict';

// Afaro data removal: manifest validator.
//
// Reads every manifest in a directory, validates it against
// schema/optout.schema.json, and enforces the provenance rule: a manifest is
// only valid if it names the public page it came from, the date that page was
// read, and a capture of that page that is actually present on disk.
//
// This script makes no network requests. It reads files and exits with a code.
//
// Usage:
//   node scripts/validate.js                 validates manifests/
//   node scripts/validate.js --dir some/dir  validates another directory
//   node scripts/validate.js --quiet         only prints failures and the summary

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv/dist/2020');
const addFormats = require('ajv-formats');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schema', 'optout.schema.json');
const PROVENANCE_FIELDS = ['source_url', 'verified_on', 'source_capture'];

function parseArgs(argv) {
  const args = { dir: path.join(REPO_ROOT, 'manifests'), quiet: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dir') {
      const value = argv[i + 1];
      if (!value) throw new Error('--dir needs a path');
      args.dir = path.resolve(process.cwd(), value);
      i += 1;
    } else if (argv[i] === '--quiet') {
      args.quiet = true;
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }
  return args;
}

// Manifests are the .json files directly inside the directory. Captures and
// any nested folders are not manifests. The list is derived from what is on
// disk, never from a hardcoded set of brokers.
function listManifests(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Manifest directory not found: ${dir}`);
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name)
    .sort();
}

function loadValidator() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  return ajv.compile(schema);
}

function describeSchemaError(error) {
  const where = error.instancePath || '(root)';
  return `${where} ${error.message}`;
}

// Checks that do not belong in the schema because they depend on the
// filesystem or on today's date.
function checkProvenance(manifest, fileName, dir) {
  const problems = [];

  for (const field of PROVENANCE_FIELDS) {
    const value = manifest[field];
    if (typeof value !== 'string' || value.trim() === '') {
      problems.push(`missing provenance field: ${field}`);
    }
  }

  if (typeof manifest.source_capture === 'string' && manifest.source_capture !== '') {
    const capturePath = path.resolve(dir, manifest.source_capture);
    const insideDir = capturePath.startsWith(path.resolve(dir) + path.sep);
    if (!insideDir) {
      problems.push(`source_capture points outside the manifest directory: ${manifest.source_capture}`);
    } else if (!fs.existsSync(capturePath)) {
      problems.push(`source_capture file is absent on disk: ${manifest.source_capture}`);
    }
  }

  if (typeof manifest.verified_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(manifest.verified_on)) {
    // Local date, not UTC. verified_on is the day the author read the page
    // where they were sitting, so a UTC comparison flags or misses by a day
    // depending on which side of the line they are on.
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');
    if (manifest.verified_on > today) {
      problems.push(`verified_on is in the future: ${manifest.verified_on}`);
    }
  }

  if (typeof manifest.id === 'string' && manifest.id !== '') {
    const expected = `${manifest.id}.json`;
    if (fileName !== expected) {
      problems.push(`filename does not match id: expected ${expected}`);
    }
  }

  // A broker that demands an account, a payment, a notarized document, or a
  // government ID is not automated. The dispatch calls that method manual.
  if (manifest.id_requirements && manifest.id_requirements.required === true) {
    if (manifest.method !== 'manual') {
      problems.push('id_requirements.required is true, so method must be manual');
    }
  }

  return problems;
}

// The human gate is a property of the manifest, not only of the orchestrator's
// instructions. A manifest that can send anything has to carry the approval
// gate that precedes the send, and the validator refuses one that does not.
function checkGates(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const isStep = (step) => step && typeof step === 'object';

  if (manifest.method === 'manual') {
    const automated = steps.filter((step) => isStep(step) && (step.type === 'click' || step.type === 'fill_field'));
    if (automated.length > 0) {
      problems.push('method manual must not contain fill_field or click steps');
    }
    return problems;
  }

  const submitGates = steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => isStep(step) && step.type === 'human_gate' && step.reason === 'submit');

  if (submitGates.length === 0) {
    problems.push('no human_gate step with reason submit, so there is a send path with no approval');
    return problems;
  }
  if (submitGates.length > 1) {
    problems.push(`${submitGates.length} human_gate steps with reason submit, so it is unclear which send the person approves`);
    return problems;
  }

  const gateIndex = submitGates[0].index;

  // Nothing is filled after the person has approved. What they approved is the
  // set of values they were shown, and a field filled afterwards is a value
  // they never saw. This also closes a hole in the check below: with a fill
  // after the gate, the last fill would sit past the gate and the window
  // between them would be empty, so an early send would go unnoticed.
  const lateFill = steps.findIndex(
    (step, index) => isStep(step) && index > gateIndex && step.type === 'fill_field'
  );
  if (lateFill !== -1) {
    problems.push(
      `step ${lateFill} fills a field after the submit gate, so the person approved values that are not the ones sent`
    );
  }

  // Once the last field has been filled, nothing may be clicked or navigated
  // to until the person has approved. Clicks before that point move through
  // the form. A click after it is the send. Checking only the last click would
  // let a manifest send on an earlier click and put a harmless one after the
  // gate. The search stops at the gate so a fill placed after it cannot push
  // the window shut.
  let lastFillIndex = -1;
  steps.forEach((step, index) => {
    if (isStep(step) && index < gateIndex && step.type === 'fill_field') lastFillIndex = index;
  });

  const earlySend = steps.findIndex(
    (step, index) =>
      isStep(step) &&
      index > lastFillIndex &&
      index < gateIndex &&
      (step.type === 'click' || step.type === 'navigate')
  );
  if (earlySend !== -1) {
    problems.push(
      `step ${earlySend} is a ${steps[earlySend].type} after the last filled field and before the submit gate, so the form can go without approval`
    );
  }

  // A form that nothing clicks after the gate never sends. An email broker is
  // the exception: the person sends the message themselves.
  if (manifest.method !== 'email') {
    const sendsAfterGate = steps.some(
      (step, index) => isStep(step) && index > gateIndex && step.type === 'click'
    );
    if (!sendsAfterGate) {
      problems.push('no click step after the submit gate, so nothing sends the form');
    }
  }

  return problems;
}

// The schema lets a URL point at loopback so the checked-in smoke manifest can
// drive a page served from this repository. That exception is only for the
// smoke manifest: it has to be named smoke-something and live in _smoke. A
// broker manifest pointing at localhost is not a broker manifest.
const LOOPBACK = /^http:\/\/(localhost|127\.0\.0\.1)([:/]|$)/;

function checkLoopback(manifest, dir) {
  const problems = [];
  const isSmoke =
    typeof manifest.id === 'string' &&
    manifest.id.startsWith('smoke-') &&
    path.basename(path.resolve(dir)) === '_smoke';

  const urls = [
    ['home_url', manifest.home_url],
    ['search_url_template', manifest.search_url_template],
    ['optout_url', manifest.optout_url],
    ['source_url', manifest.source_url],
    ['verification.url_template', manifest.verification && manifest.verification.url_template]
  ];
  for (const step of Array.isArray(manifest.steps) ? manifest.steps : []) {
    if (step && typeof step === 'object' && step.type === 'navigate') {
      urls.push(['a navigate step', step.url]);
    }
  }

  for (const [where, value] of urls) {
    if (typeof value === 'string' && LOOPBACK.test(value) && !isSmoke) {
      problems.push(`${where} points at loopback, which only the smoke manifest may do`);
    }
  }

  return problems;
}

// A fill_field can take its value from the listing rather than from the
// profile, which is how a broker that keys its opt-out to one listing URL gets
// filled. That value only exists once a listing has been identified, so the
// step that produces it has to come first.
function checkListingValues(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  let seenFindListing = false;

  steps.forEach((step, index) => {
    if (!step || typeof step !== 'object') return;
    if (step.type === 'find_listing') {
      seenFindListing = true;
      return;
    }
    if (step.type === 'fill_field' && typeof step.value_from_listing === 'string' && !seenFindListing) {
      problems.push(
        `step ${index} fills from the listing, but no find_listing step comes before it, so there is no listing to read`
      );
    }
  });

  return problems;
}

// The orchestrator checks profile_fields_required before it starts a broker, so
// that list has to name every field the steps go on to read. A field the steps
// use but the list omits turns into a stop halfway through a form.
function checkProfileFields(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const declared = new Set(
    Array.isArray(manifest.profile_fields_required) ? manifest.profile_fields_required : []
  );

  const used = new Set();
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue;
    if (step.type === 'fill_field' && typeof step.value_from === 'string') {
      used.add(step.value_from);
    }
    if (step.type === 'find_listing' && Array.isArray(step.match_on)) {
      for (const field of step.match_on) {
        if (typeof field === 'string') used.add(field);
      }
    }
  }

  for (const field of [...used].sort()) {
    if (!declared.has(field)) {
      problems.push(`steps read ${field}, which is not in profile_fields_required`);
    }
  }

  return problems;
}

function validateFile(validate, dir, fileName) {
  const fullPath = path.join(dir, fileName);
  let manifest;

  try {
    manifest = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    return [`not valid JSON: ${error.message}`];
  }

  const problems = [];
  if (!validate(manifest)) {
    for (const error of validate.errors) {
      problems.push(describeSchemaError(error));
    }
  }
  problems.push(...checkProvenance(manifest, fileName, dir));
  problems.push(...checkGates(manifest));
  problems.push(...checkListingValues(manifest));
  problems.push(...checkProfileFields(manifest));
  problems.push(...checkLoopback(manifest, dir));
  return problems;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`afaro validate: ${error.message}`);
    process.exit(2);
  }

  let validate;
  let fileNames;
  try {
    validate = loadValidator();
    fileNames = listManifests(args.dir);
  } catch (error) {
    console.error(`afaro validate: ${error.message}`);
    process.exit(2);
  }

  // Forward slashes so the summary line reads the same on every platform.
  const relativeDir = (path.relative(REPO_ROOT, args.dir) || '.').split(path.sep).join('/');
  let failed = 0;

  for (const fileName of fileNames) {
    const problems = validateFile(validate, args.dir, fileName);
    if (problems.length === 0) {
      if (!args.quiet) console.log(`ok    ${fileName}`);
    } else {
      failed += 1;
      console.error(`FAIL  ${fileName}`);
      for (const problem of problems) {
        console.error(`      ${problem}`);
      }
    }
  }

  const count = fileNames.length;
  const noun = count === 1 ? 'manifest' : 'manifests';
  console.log(`\n${count} ${noun} in ${relativeDir}, ${count - failed} valid, ${failed} failed.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
