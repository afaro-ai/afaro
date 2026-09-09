#!/usr/bin/env node
'use strict';

// Runs scripts/check-names.js against fixture trees and checks the exit code
// and the reason. The list of values to look for never lives in this
// repository, so the list this test uses is written to a temporary directory
// and deleted afterwards. Its entries are invented, and one of the checks is
// that the script refuses a list kept inside the repository at all.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'check-names.js');

const LIST = [
  '# Invented values. A real list holds real ones and stays out of git.',
  'Quill',
  'Marisol Quillfeather',
  '555-0142',
  ''
].join('\n');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'afaro-names-'));
const listPath = path.join(tempDir, 'redaction-list.txt');
fs.writeFileSync(listPath, LIST);

const insideRepoList = path.join(REPO_ROOT, 'tests', 'fixtures', 'names-list-in-repo.txt');

// A throwaway repository, so the commit-message sweep can be checked against
// real commits rather than a stub. Three commits: the last one carries a value
// from the list in its message, the one before it does not.
const messageRepo = path.join(tempDir, 'messages');
function git(...args) {
  spawnSync('git', ['-c', 'user.email=checks@example.com', '-c', 'user.name=Checks', ...args], {
    cwd: messageRepo,
    encoding: 'utf8'
  });
}
fs.mkdirSync(messageRepo);
git('init', '-q');
fs.writeFileSync(path.join(messageRepo, 'a.txt'), 'one\n');
git('add', '-A');
git('commit', '-q', '-m', 'First commit, nothing in the message');
fs.writeFileSync(path.join(messageRepo, 'a.txt'), 'two\n');
git('add', '-A');
git('commit', '-q', '-m', 'Second commit, still nothing in the message');
fs.writeFileSync(path.join(messageRepo, 'a.txt'), 'three\n');
git('add', '-A');
git('commit', '-q', '-m', 'Third commit, and Quill is in this message');

const cases = [
  {
    name: 'a tree with nothing to find passes, and a bare word does not match inside a longer one',
    args: ['--list', listPath, '--dir', 'tests/fixtures/names-clean'],
    exitCode: 0,
    expect: 'Nothing matched.'
  },
  {
    name: 'a bare word standing on its own is found',
    args: ['--list', listPath, '--dir', 'tests/fixtures/names-hit'],
    exitCode: 1,
    expect: 'matches list entry 1'
  },
  {
    name: 'a value written across two spaces is found',
    args: ['--list', listPath, '--dir', 'tests/fixtures/names-hit'],
    exitCode: 1,
    expect: 'matches list entry 2'
  },
  {
    name: 'a number written with different separators is found',
    args: ['--list', listPath, '--dir', 'tests/fixtures/names-hit'],
    exitCode: 1,
    expect: 'matches list entry 3'
  },
  {
    name: 'a match never prints the value it matched',
    args: ['--list', listPath, '--dir', 'tests/fixtures/names-hit'],
    exitCode: 1,
    refute: ['Quill', 'Marisol', '555']
  },
  {
    name: 'a file named after somebody is found by its name',
    args: ['--list', listPath, '--dir', 'tests/fixtures/names-filename'],
    exitCode: 1,
    expect: 'the file name matches list entry 1'
  },
  {
    name: 'no list is not a pass',
    args: ['--dir', 'tests/fixtures/names-clean'],
    exitCode: 2,
    expect: 'the sweep did not run'
  },
  {
    name: 'no list with --allow-missing-list says so and passes',
    args: ['--dir', 'tests/fixtures/names-clean', '--allow-missing-list'],
    exitCode: 0,
    expect: 'this is not a failure here'
  },
  {
    name: 'one file on its own is swept, which is what the commit-msg hook does',
    args: ['--list', listPath, '--file', 'tests/fixtures/names-hit/doc.md'],
    exitCode: 1,
    expect: 'matches list entry 1'
  },
  {
    name: 'one clean file on its own passes',
    args: ['--list', listPath, '--file', 'tests/fixtures/names-clean/doc.md'],
    exitCode: 0,
    expect: 'Nothing matched.'
  },
  {
    name: 'a commit message carrying a value is found',
    args: ['--list', listPath, '--dir', messageRepo, '--commits', 'HEAD~1..HEAD'],
    exitCode: 1,
    expect: 'line 1: matches list entry 1'
  },
  {
    name: 'a range of clean commit messages passes',
    args: ['--list', listPath, '--dir', messageRepo, '--commits', 'HEAD~2..HEAD~1'],
    exitCode: 0,
    expect: 'Nothing matched.'
  },
  {
    name: 'a commit message match names the commit and never the value',
    args: ['--list', listPath, '--dir', messageRepo, '--commits', 'HEAD~1..HEAD'],
    exitCode: 1,
    expect: 'commit ',
    refute: ['Quill', 'Marisol', '555']
  },
  {
    name: 'a list kept inside this repository is refused',
    args: ['--list', insideRepoList, '--dir', 'tests/fixtures/names-clean'],
    exitCode: 2,
    expect: 'inside this repository'
  }
];

let failures = 0;

fs.writeFileSync(insideRepoList, 'Quill\n');

for (const testCase of cases) {
  const result = spawnSync(process.execPath, [SCRIPT, ...testCase.args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, AFARO_NAME_LIST: '' }
  });
  const output = `${result.stdout}${result.stderr}`;
  const codeOk = result.status === testCase.exitCode;
  const textOk = testCase.expect ? output.includes(testCase.expect) : true;
  const refuteOk = (testCase.refute || []).every((value) => !output.includes(value));

  if (codeOk && textOk && refuteOk) {
    console.log(`ok    ${testCase.name}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${testCase.name}`);
    if (!codeOk) console.error(`      expected exit ${testCase.exitCode}, got ${result.status}`);
    if (!textOk) console.error(`      expected output to contain: ${testCase.expect}`);
    if (!refuteOk) console.error('      output printed a value it should never print');
    console.error(output.split('\n').map((line) => `      | ${line}`).join('\n'));
  }
}

fs.rmSync(insideRepoList, { force: true });
fs.rmSync(tempDir, { recursive: true, force: true });

console.log(`\n${cases.length} checks, ${cases.length - failures} passed, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
