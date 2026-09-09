#!/usr/bin/env node
'use strict';

// Runs scripts/validate.js against each fixture directory and checks both the
// exit code and the reason it gave. A validator that fails for the wrong
// reason is not doing its job.

const { spawnSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate.js');

const cases = [
  {
    name: 'an empty manifests directory passes',
    dir: 'tests/fixtures/empty',
    exitCode: 0,
    expect: '0 manifests'
  },
  {
    name: 'a complete manifest with its capture on disk passes',
    dir: 'tests/fixtures/valid',
    exitCode: 0,
    expect: '1 manifest in tests/fixtures/valid, 1 valid, 0 failed.'
  },
  {
    name: 'a manifest with no source_url fails',
    dir: 'tests/fixtures/missing-source-url',
    exitCode: 1,
    expect: 'missing provenance field: source_url'
  },
  {
    name: 'a manifest with no verified_on fails',
    dir: 'tests/fixtures/missing-verified-on',
    exitCode: 1,
    expect: 'missing provenance field: verified_on'
  },
  {
    name: 'a manifest with no source_capture fails',
    dir: 'tests/fixtures/missing-source-capture',
    exitCode: 1,
    expect: 'missing provenance field: source_capture'
  },
  {
    name: 'a manifest whose capture file is absent fails',
    dir: 'tests/fixtures/absent-capture-file',
    exitCode: 1,
    expect: 'source_capture file is absent on disk'
  },
  {
    name: 'a human_gate reason outside the enum fails',
    dir: 'tests/fixtures/bad-human-gate-reason',
    exitCode: 1,
    expect: 'must be equal to one of the allowed values'
  },
  {
    name: 'a manifest with no submit gate fails',
    dir: 'tests/fixtures/no-submit-gate',
    exitCode: 1,
    expect: 'no human_gate step with reason submit'
  },
  {
    name: 'a click after the last filled field but before the gate fails',
    dir: 'tests/fixtures/click-before-gate',
    exitCode: 1,
    expect: 'before the submit gate, so the form can go without approval'
  },
  {
    name: 'a manifest with nothing to click after the gate fails',
    dir: 'tests/fixtures/no-send-after-gate',
    exitCode: 1,
    expect: 'no click step after the submit gate'
  },
  {
    name: 'a manual broker that still clicks and fills fails',
    dir: 'tests/fixtures/manual-with-click',
    exitCode: 1,
    expect: 'method manual must not contain fill_field or click steps'
  },
  {
    name: 'a field the steps read but do not declare fails',
    dir: 'tests/fixtures/undeclared-profile-field',
    exitCode: 1,
    expect: 'steps read emails, which is not in profile_fields_required'
  },
  {
    name: 'a field filled after the submit gate fails',
    dir: 'tests/fixtures/fill-after-gate',
    exitCode: 1,
    expect: 'fills a field after the submit gate'
  },
  {
    name: 'a fill after the gate does not hide an early send',
    dir: 'tests/fixtures/fill-after-gate',
    exitCode: 1,
    expect: 'before the submit gate, so the form can go without approval'
  },
  {
    name: 'a fill from the listing with no find_listing before it fails',
    dir: 'tests/fixtures/listing-value-without-find-listing',
    exitCode: 1,
    expect: 'no find_listing step comes before it'
  },
  {
    name: 'a step after a handoff fails',
    dir: 'tests/fixtures/handoff-not-terminal',
    exitCode: 1,
    expect: 'a handoff is where the manifest ends'
  },
  {
    name: 'a null recheck window with nothing saying the page stated none fails',
    dir: 'tests/fixtures/recheck-null-without-flag',
    exitCode: 1,
    expect: 'recheck_after_days is null, so recheck_stated must be false'
  },
  {
    name: 'an unstated recheck window carrying a number anyway fails',
    dir: 'tests/fixtures/recheck-unstated-with-number',
    exitCode: 1,
    expect: 'recheck_stated is false, so recheck_after_days must be null'
  },
  {
    name: 'a consent dialog answered after a field was filled fails',
    dir: 'tests/fixtures/accept-terms-after-fill',
    exitCode: 1,
    expect: 'a consent dialog is answered before anything is filled'
  },
  {
    name: 'a reason the captured page does not offer fails',
    dir: 'tests/fixtures/literal-outside-choices',
    exitCode: 1,
    expect: 'not one of the choices the captured page offers'
  },
  {
    name: 'the click that places the verification call, put before its gate, fails',
    dir: 'tests/fixtures/call-click-before-phone-gate',
    exitCode: 1,
    expect: 'the click that places the call sits behind that gate'
  },
  {
    name: 'a submit gate with nothing sent before the next one fails',
    dir: 'tests/fixtures/gate-with-no-send',
    exitCode: 1,
    expect: 'the person approves a send that does not happen'
  },
  {
    name: 'a second capture named in the manifest and absent on disk fails',
    dir: 'tests/fixtures/absent-additional-capture',
    exitCode: 1,
    expect: 'additional_captures[0] file is absent on disk'
  },
  {
    name: 'a manifest that types nothing and hands the flow over needs no submit gate',
    dir: 'tests/fixtures/handoff-only',
    exitCode: 0,
    expect: '1 manifest in tests/fixtures/handoff-only, 1 valid, 0 failed.'
  },
  {
    name: 'a two-page flow with one approval per send passes',
    dir: 'tests/fixtures/two-page-flow',
    exitCode: 0,
    expect: '1 manifest in tests/fixtures/two-page-flow, 1 valid, 0 failed.'
  },
  {
    name: 'a loopback URL outside the smoke manifest fails',
    dir: 'tests/fixtures/loopback-outside-smoke',
    exitCode: 1,
    expect: 'points at loopback, which only the smoke manifest may do'
  },
  {
    name: 'the smoke manifest itself passes',
    dir: 'manifests/_smoke',
    exitCode: 0,
    expect: '1 manifest in manifests/_smoke, 1 valid, 0 failed.'
  }
];

let failures = 0;

for (const testCase of cases) {
  const result = spawnSync(process.execPath, [VALIDATOR, '--dir', testCase.dir], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  });
  const output = `${result.stdout}${result.stderr}`;
  const codeOk = result.status === testCase.exitCode;
  const textOk = output.includes(testCase.expect);

  if (codeOk && textOk) {
    console.log(`ok    ${testCase.name}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${testCase.name}`);
    if (!codeOk) console.error(`      expected exit ${testCase.exitCode}, got ${result.status}`);
    if (!textOk) console.error(`      expected output to contain: ${testCase.expect}`);
    console.error(output.split('\n').map((line) => `      | ${line}`).join('\n'));
  }
}

console.log(`\n${cases.length} checks, ${cases.length - failures} passed, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
