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
