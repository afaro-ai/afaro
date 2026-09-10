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

  // Pages past the first one carry the same burden as the first. A manifest
  // that names a capture it does not have describes a page nobody can check.
  const extras = Array.isArray(manifest.additional_captures) ? manifest.additional_captures : [];
  extras.forEach((entry, index) => {
    if (!entry || typeof entry.path !== 'string' || entry.path === '') return;
    const extraPath = path.resolve(dir, entry.path);
    if (!extraPath.startsWith(path.resolve(dir) + path.sep)) {
      problems.push(`additional_captures[${index}] points outside the manifest directory: ${entry.path}`);
    } else if (!fs.existsSync(extraPath)) {
      problems.push(`additional_captures[${index}] file is absent on disk: ${entry.path}`);
    }
    if (entry.path === manifest.source_capture) {
      problems.push(`additional_captures[${index}] repeats source_capture: ${entry.path}`);
    }
  });

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

  // A broker whose opt-out runs over several pages sends something on each of
  // them, and every send is a place the person approves what is about to go.
  // Submit gates cut the step list into segments: a segment is the steps since
  // the previous submit gate, and what its gate approves is the values filled
  // inside that segment. A one-page broker has one segment and reads exactly as
  // it did before more than one gate was allowed.
  // A manifest that hands the flow over without sending anything has no send to
  // approve. Two shapes reach that: one that types nothing at all, and one that
  // fills a form and stops with the person looking at it. Both end on a
  // handoff, and in both nothing is clicked after a value goes in, so no value
  // can have left the browser. Put a click after the last fill and every rule
  // below applies again.
  const endsInHandoff =
    steps.length > 0 && isStep(steps[steps.length - 1]) && steps[steps.length - 1].type === 'handoff';
  let lastFillOfAll = -1;
  steps.forEach((step, index) => {
    if (isStep(step) && step.type === 'fill_field') lastFillOfAll = index;
  });
  const sendsAfterFilling = steps.some(
    (step, index) =>
      isStep(step) && index > lastFillOfAll && (step.type === 'click' || step.type === 'navigate')
  );
  if (endsInHandoff && (lastFillOfAll === -1 || !sendsAfterFilling)) return problems;

  const gateIndexes = steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => isStep(step) && step.type === 'human_gate' && step.reason === 'submit')
    .map(({ index }) => index);

  if (gateIndexes.length === 0) {
    problems.push('no human_gate step with reason submit, so there is a send path with no approval');
    return problems;
  }

  const lastGateIndex = gateIndexes[gateIndexes.length - 1];

  // Nothing is filled after the last approval. What the person approved is the
  // set of values they were shown, and a field filled afterwards is a value
  // they never saw. This also closes a hole in the check below: with a fill
  // after the gate, the last fill would sit past the gate and the window
  // between them would be empty, so an early send would go unnoticed.
  const lateFill = steps.findIndex(
    (step, index) => isStep(step) && index > lastGateIndex && step.type === 'fill_field'
  );
  if (lateFill !== -1) {
    problems.push(
      `step ${lateFill} fills a field after the submit gate, so the person approved values that are not the ones sent`
    );
  }

  // Once a segment's last field has been filled, nothing may be clicked or
  // navigated to until that segment's gate has passed. Clicks before that point
  // move through the form. A click after it is the send. Checking only the last
  // click would let a manifest send on an earlier click and put a harmless one
  // after the gate. A segment that fills nothing holds no values to protect, so
  // only a fill opens the window.
  let segmentStart = 0;
  for (const gateIndex of gateIndexes) {
    let lastFillIndex = -1;
    for (let index = segmentStart; index < gateIndex; index += 1) {
      if (isStep(steps[index]) && steps[index].type === 'fill_field') lastFillIndex = index;
    }

    if (lastFillIndex !== -1) {
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
    }

    segmentStart = gateIndex + 1;
  }

  // A form that nothing clicks after the gate never sends, and a gate with no
  // send behind it asks the person to approve something that does not happen.
  // An email broker is the exception: the person sends the message themselves.
  if (manifest.method !== 'email') {
    gateIndexes.forEach((gateIndex, position) => {
      const end = position + 1 < gateIndexes.length ? gateIndexes[position + 1] : steps.length;
      const sends = steps.some(
        (step, index) => isStep(step) && index > gateIndex && index < end && step.type === 'click'
      );
      if (sends) return;
      if (end === steps.length) {
        problems.push('no click step after the submit gate, so nothing sends the form');
      } else {
        problems.push(
          `step ${gateIndex} is a submit gate with nothing clicked before the next one, so the person approves a send that does not happen`
        );
      }
    });
  }

  return problems;
}

// The click that places a verification call is the call. It sits behind the
// phone_verify gate, never in front of it, so nobody's phone rings before they
// have said go. Everything between the previous gate and this one is unapproved
// by it, which is why a click there is refused.
function checkPhoneVerify(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const isGate = (step) => step && typeof step === 'object' && step.type === 'human_gate';

  steps.forEach((step, index) => {
    if (!isGate(step) || step.reason !== 'phone_verify') return;

    let start = -1;
    for (let before = index - 1; before >= 0; before -= 1) {
      if (isGate(steps[before])) {
        start = before;
        break;
      }
    }

    for (let inner = start + 1; inner < index; inner += 1) {
      const candidate = steps[inner];
      if (candidate && typeof candidate === 'object' && candidate.type === 'click') {
        problems.push(
          `step ${inner} clicks before the phone_verify gate at step ${index}, and the click that places the call sits behind that gate`
        );
      }
    }
  });

  return problems;
}

// A consent dialog stands in front of the flow, so it is answered before
// anything is typed and before anyone approves a send. An accept_terms further
// down the list is a click on a dialog that is no longer the thing in the way.
function checkAcceptTerms(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const isStep = (step) => step && typeof step === 'object';

  steps.forEach((step, index) => {
    if (!isStep(step) || step.type !== 'accept_terms') return;

    const earlierFill = steps.findIndex(
      (other, position) => isStep(other) && position < index && other.type === 'fill_field'
    );
    if (earlierFill !== -1) {
      problems.push(
        `step ${index} accepts terms after step ${earlierFill} filled a field, and a consent dialog is answered before anything is filled`
      );
    }

    const earlierGate = steps.findIndex(
      (other, position) =>
        isStep(other) && position < index && other.type === 'human_gate' && other.reason === 'submit'
    );
    if (earlierGate !== -1) {
      problems.push(
        `step ${index} accepts terms after the submit gate at step ${earlierGate}, and a consent dialog comes before the flow it stands in front of`
      );
    }
  });

  return problems;
}

// The search door has to be a page a person could be sent to, not the address
// the page calls behind its own back. A result endpoint is what reads as
// scraping and what gets a session blocked, and it is the line the name-page
// carve-out is careful not to cross. The test the ruling gives is whether a
// search engine would show this URL to a person.
function endpointProblems(label, value) {
  const problems = [];
  if (typeof value !== 'string' || value === '') return problems;

  let url;
  try {
    url = new URL(value.replace(/\{\{[^}]*\}\}/g, 'x'));
  } catch (error) {
    return problems;
  }
  const pathname = url.pathname || '';

  if (/(^|\/)api(\/|$)/i.test(pathname)) {
    problems.push(`${label} points at an api path, which is an address the page uses and not a page`);
  }
  if (/\.(json|xml)$/i.test(pathname)) {
    problems.push(`${label} ends in a data file rather than a page`);
  }
  if (/(^|\/)(srv|ajax|xhr|rpc|endpoint|service)(\/|$)/i.test(pathname)) {
    problems.push(`${label} points at an internal endpoint rather than a page a person can be sent to`);
  }
  if ((pathname === '' || pathname === '/') && url.search) {
    problems.push(`${label} is a query string with no page behind it`);
  }

  return problems;
}

// The name-directory page is the one place a URL may be built from a pattern
// rather than clicked, and it takes two captures to earn that. The A-to-Z bar
// shows the site publishes a directory and names nobody. The person's own name
// page shows what the page holds, blanked like any run capture. A capture of a
// directory letter page is neither: those list strangers by the hundred, and
// blanking a list that long is not something a reviewer can check.
function checkNamePage(manifest, dir) {
  const problems = [];
  const page = manifest.name_page;
  problems.push(...endpointProblems('search_url_template', manifest.search_url_template));
  if (!page || typeof page !== 'object') return problems;

  problems.push(...endpointProblems('name_page.template', page.template));

  for (const field of ['directory_capture', 'page_capture']) {
    const value = page[field];
    if (typeof value !== 'string' || value === '') continue;
    const capturePath = path.resolve(dir, value);
    if (!capturePath.startsWith(path.resolve(dir) + path.sep)) {
      problems.push(`name_page.${field} points outside the manifest directory: ${value}`);
    } else if (!fs.existsSync(capturePath)) {
      problems.push(`name_page.${field} file is absent on disk: ${value}`);
    }
  }

  if (
    typeof page.directory_capture === 'string' &&
    page.directory_capture === page.page_capture
  ) {
    problems.push(
      'name_page names one file for both captures, and the A-to-Z bar and the person\'s own page are two different pages'
    );
  }

  if (typeof page.verified_on === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(page.verified_on)) {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');
    if (page.verified_on > today) {
      problems.push(`name_page.verified_on is in the future: ${page.verified_on}`);
    }
  }

  return problems;
}

// One click per gate. A submit that produces no page change is the site
// refusing, and a second click is a second submission of the same form. A
// manifest cannot ask for one: there is no field for it, and a manifest that
// invents one is refused by name rather than by a schema message about extra
// properties.
function checkNoRetries(manifest) {
  const problems = [];
  const retryish = /^(retry|retries|retry_count|attempts|max_attempts|max_retries|repeat)$/i;

  for (const key of Object.keys(manifest)) {
    if (retryish.test(key)) {
      problems.push(`the manifest declares ${key}, and there is one click per gate with no second attempt`);
    }
  }

  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  steps.forEach((step, index) => {
    if (!step || typeof step !== 'object') return;
    for (const key of Object.keys(step)) {
      if (retryish.test(key)) {
        problems.push(`step ${index} declares ${key}, and there is one click per gate with no second attempt`);
      }
    }
  });

  return problems;
}

// A captcha token can expire in the gap between two gates, which turns a
// correct flow into a failed submission and sends the person round again. A
// combined gate asks once. It is only honest where the captcha gate is the
// step immediately before, because that is the pair it folds together.
function checkCombinedGate(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];

  steps.forEach((step, index) => {
    if (!step || typeof step !== 'object' || step.type !== 'human_gate') return;
    if (step.gate_mode !== 'combined') return;

    if (step.reason !== 'submit') {
      problems.push(`step ${index} is a combined gate with reason ${step.reason}, and only a submit gate folds a captcha into itself`);
      return;
    }

    const before = index > 0 ? steps[index - 1] : null;
    const precededByCaptcha =
      before && typeof before === 'object' && before.type === 'human_gate' && before.reason === 'captcha';
    if (!precededByCaptcha) {
      problems.push(
        `step ${index} is a combined gate with no captcha gate immediately before it, so there is nothing to fold in`
      );
    }
  });

  return problems;
}

// The search box is a search, not a submission. It goes in front of the form
// the way a consent dialog does, so it can never become a way to put values on
// a page and send them before the person has approved anything.
function checkUseSearchBox(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const isStep = (step) => step && typeof step === 'object';

  steps.forEach((step, index) => {
    if (!isStep(step) || step.type !== 'use_search_box') return;

    const earlierFill = steps.findIndex(
      (other, position) => isStep(other) && position < index && other.type === 'fill_field'
    );
    if (earlierFill !== -1) {
      problems.push(
        `step ${index} uses the search box after step ${earlierFill} filled a field, and a search comes before the form`
      );
    }

    const earlierGate = steps.findIndex(
      (other, position) =>
        isStep(other) && position < index && other.type === 'human_gate' && other.reason === 'submit'
    );
    if (earlierGate !== -1) {
      problems.push(
        `step ${index} uses the search box after the submit gate at step ${earlierGate}, and a search comes before the form`
      );
    }
  });

  return problems;
}

// A page that offers a fixed set of reasons offers those and no others. When
// the capture shows the set, the manifest lists it, and the value it fills has
// to be one of them. This is the check that keeps a reason nobody was offered
// out of a broker's form.
function checkChoices(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];

  steps.forEach((step, index) => {
    if (!step || typeof step !== 'object' || step.type !== 'fill_field') return;

    // Stripping a listing address down to its digits destroys it. format is
    // for a profile value the box wants written a particular way.
    if (step.format === 'digits' && typeof step.from_listing === 'string') {
      problems.push(`step ${index} would strip the listing address down to its digits`);
    }

    if (!Array.isArray(step.choices)) return;
    if (typeof step.value_literal !== 'string') return;
    if (!step.choices.includes(step.value_literal)) {
      problems.push(
        `step ${index} fills a value that is not one of the choices the captured page offers`
      );
    }
  });

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
    if (step.type === 'fill_field' && typeof step.from_listing === 'string' && !seenFindListing) {
      problems.push(
        `step ${index} fills from the listing, but no find_listing step comes before it, so there is no listing to read`
      );
    }
  });

  return problems;
}

// handoff says the manifest stops before the broker's flow does. It is the
// last thing that happens, because anything after it would be a step the
// person is no longer watching Afaro take.
function checkHandoff(manifest) {
  const problems = [];
  const steps = Array.isArray(manifest.steps) ? manifest.steps : [];
  const handoffs = steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step && typeof step === 'object' && step.type === 'handoff');

  if (handoffs.length > 1) {
    problems.push(`${handoffs.length} handoff steps, so it is unclear where the manifest stops`);
    return problems;
  }
  if (handoffs.length === 1 && handoffs[0].index !== steps.length - 1) {
    problems.push(
      `step ${handoffs[0].index} is a handoff with ${steps.length - 1 - handoffs[0].index} step(s) after it, and a handoff is where the manifest ends`
    );
  }

  return problems;
}

// A broker that states no processing window has no number to copy. The pair
// says so out loud rather than leaving a figure of the author's looking like
// the broker's own.
function checkRecheckWindow(manifest) {
  const problems = [];
  const days = manifest.recheck_after_days;
  const stated = manifest.recheck_stated;

  if (days === null && stated !== false) {
    problems.push('recheck_after_days is null, so recheck_stated must be false');
  }
  if (stated === false && days !== null) {
    problems.push('recheck_stated is false, so recheck_after_days must be null and the wait left to the orchestrator');
  }

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
    if (step.type === 'use_search_box' && Array.isArray(step.inputs)) {
      for (const input of step.inputs) {
        if (input && typeof input.value_from === 'string') used.add(input.value_from);
      }
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
  problems.push(...checkPhoneVerify(manifest));
  problems.push(...checkAcceptTerms(manifest));
  problems.push(...checkChoices(manifest));
  problems.push(...checkNamePage(manifest, dir));
  problems.push(...checkNoRetries(manifest));
  problems.push(...checkCombinedGate(manifest));
  problems.push(...checkUseSearchBox(manifest));
  problems.push(...checkListingValues(manifest));
  problems.push(...checkHandoff(manifest));
  problems.push(...checkRecheckWindow(manifest));
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
