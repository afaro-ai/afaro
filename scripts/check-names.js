#!/usr/bin/env node
'use strict';

// Afaro data removal: the redaction sweep.
//
// A second agent read every tracked text file on pass 2c and found a real
// person's first name used as a worked example in the install guide. It was
// one word with nothing attached to it, and it still broke the rule that no
// real person's data enters this repository. A person reading carefully found
// it; the next one might not. This script is that sweep, run every time.
//
// The list of values to look for is not in this repository and never can be,
// because the list is itself the thing being protected. It lives on the
// maintainer's machine, next to the profiles, and its path comes in through
// AFARO_NAME_LIST or --list.
//
// This script makes no network requests, and it never prints a value it
// matched. A failure names the file, the line, and which entry of the list
// fired, by number. Look the number up in your own copy.
//
// Usage:
//   node scripts/check-names.js                     tracked files, list from AFARO_NAME_LIST
//   node scripts/check-names.js --list <path>       a list somewhere else
//   node scripts/check-names.js --dir <path>        a directory instead of the tracked set
//   node scripts/check-names.js --file <path>       one file, which is what the commit-msg hook sweeps
//   node scripts/check-names.js --commits <range>   the message of every commit in a range
//   node scripts/check-names.js --allow-missing-list  say so and pass, for CI and the hooks
//
// With --commits, --dir names the repository to read the commits from rather
// than a tree to walk. That is only for the self-checks; a hook wants neither.
//
// Exit codes:
//   0  swept, nothing found, or the list was absent and --allow-missing-list was given
//   1  something was found
//   2  the sweep did not run, which is not the same as passing

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

// Images are swept by a person looking at them, not by this script. Every
// committed capture is opened and looked at as part of a review, which is one
// of the three edges CONTRIBUTING.md names.
const BINARY_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.ico', '.pdf', '.zip', '.woff', '.woff2', '.ttf'
]);

function parseArgs(argv) {
  const args = {
    list: process.env.AFARO_NAME_LIST || null,
    dir: null,
    file: null,
    commits: null,
    allowMissingList: false
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--list') {
      args.list = argv[i + 1];
      if (!args.list) throw new Error('--list needs a path');
      i += 1;
    } else if (argv[i] === '--dir') {
      args.dir = argv[i + 1];
      if (!args.dir) throw new Error('--dir needs a path');
      i += 1;
    } else if (argv[i] === '--file') {
      args.file = argv[i + 1];
      if (!args.file) throw new Error('--file needs a path');
      i += 1;
    } else if (argv[i] === '--commits') {
      args.commits = argv[i + 1];
      if (!args.commits) throw new Error('--commits needs a range');
      i += 1;
    } else if (argv[i] === '--allow-missing-list') {
      args.allowMissingList = true;
    } else {
      throw new Error(`Unknown argument: ${argv[i]}`);
    }
  }
  return args;
}

// One value per line. Blank lines and lines starting with # are skipped, so a
// maintainer can group the list by person and say who each block belongs to.
function loadList(listPath) {
  const resolved = path.resolve(process.cwd(), listPath);
  if (resolved.startsWith(REPO_ROOT + path.sep)) {
    throw new Error(
      'the list is inside this repository, which is the one place it must never be'
    );
  }
  const lines = fs.readFileSync(resolved, 'utf8').split(/\r?\n/);
  const entries = [];
  lines.forEach((line, index) => {
    const value = line.trim();
    if (value === '' || value.startsWith('#')) return;
    entries.push({ value, listLine: index + 1 });
  });
  return { resolved, entries };
}

// A bare word is matched on its own boundaries. Short given names sit inside
// ordinary words often enough that a check without boundaries cries wolf, and
// a check that cries wolf gets switched off. Anything with a space or a
// punctuation mark in it is matched as written. A value holding seven or more
// digits is also matched digits-only, so a phone number written with dots
// still trips a list that writes it with dashes.
function buildMatchers(entries) {
  return entries.map((entry, index) => {
    const number = index + 1;
    const value = entry.value;
    const digits = value.replace(/\D/g, '');
    const isBareWord = /^[A-Za-z0-9]+$/.test(value);

    const patterns = [];
    if (isBareWord) {
      patterns.push(new RegExp(`\\b${escapeRegExp(value)}\\b`, 'i'));
    } else {
      patterns.push(new RegExp(escapeRegExp(value).replace(/\s+/g, '\\s+'), 'i'));
    }

    return {
      number,
      digits: digits.length >= 7 ? digits : null,
      test(line, lineDigits) {
        for (const pattern of patterns) {
          if (pattern.test(line)) return true;
        }
        if (this.digits && lineDigits.includes(this.digits)) return true;
        return false;
      }
    };
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function trackedFiles(workingDir) {
  const output = execFileSync('git', ['ls-files', '-z'], {
    cwd: workingDir,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024
  });
  return output.split('\0').filter((name) => name !== '');
}

// git ls-files does not reach a commit message, and a message is written in
// the same sitting as the code it describes, by the same person, in the same
// frame of mind. The first two values this sweep ever caught were one in a
// source comment and one in the message of the commit that added it.
function commitMessages(workingDir, range) {
  const shas = execFileSync('git', ['rev-list', range], {
    cwd: workingDir,
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024
  })
    .split('\n')
    .map((sha) => sha.trim())
    .filter((sha) => sha !== '');

  return shas.map((sha) => ({
    sha,
    short: sha.slice(0, 8),
    lines: execFileSync('git', ['log', '-1', '--format=%B', sha], {
      cwd: workingDir,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024
    }).split(/\r?\n/)
  }));
}

function walk(dir, base, found) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, base, found);
    } else if (entry.isFile()) {
      found.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return found;
}

function isProbablyText(fullPath) {
  if (BINARY_EXTENSIONS.has(path.extname(fullPath).toLowerCase())) return false;
  let handle;
  try {
    handle = fs.openSync(fullPath, 'r');
    const buffer = Buffer.alloc(8000);
    const read = fs.readSync(handle, buffer, 0, 8000, 0);
    return !buffer.subarray(0, read).includes(0);
  } catch (error) {
    return false;
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
  }
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`afaro check-names: ${error.message}`);
    process.exit(2);
  }

  if (!args.list) {
    const lines = [
      'afaro check-names: no list, so the sweep did not run.',
      '  Point AFARO_NAME_LIST at the file of values to look for. It belongs',
      '  beside the profiles, outside this repository, and it is never committed.'
    ];
    if (args.allowMissingList) {
      lines.push('  Running with --allow-missing-list, so this is not a failure here.');
      lines.push('  It is still the author\'s job to run the sweep before opening a PR.');
      console.log(lines.join('\n'));
      process.exit(0);
    }
    console.error(lines.join('\n'));
    process.exit(2);
  }

  let list;
  try {
    list = loadList(args.list);
  } catch (error) {
    console.error(`afaro check-names: cannot read the list: ${error.message}`);
    process.exit(2);
  }

  if (list.entries.length === 0) {
    console.error('afaro check-names: the list is empty, so the sweep did not run.');
    process.exit(2);
  }

  const matchers = buildMatchers(list.entries);
  const scanLines = (lines, label, problems) => {
    lines.forEach((line, index) => {
      if (line === '') return;
      const lineDigits = line.replace(/\D/g, '');
      for (const matcher of matchers) {
        if (matcher.test(line, lineDigits)) {
          problems.push(`${label}${index + 1}: matches list entry ${matcher.number}`);
        }
      }
    });
  };

  if (args.commits) {
    const workingDir = args.dir ? path.resolve(process.cwd(), args.dir) : REPO_ROOT;
    let commits;
    try {
      commits = commitMessages(workingDir, args.commits);
    } catch (error) {
      console.error(`afaro check-names: cannot read commits: ${error.message}`);
      process.exit(2);
    }
    const problems = [];
    for (const commit of commits) {
      scanLines(commit.lines, `commit ${commit.short} line `, problems);
    }
    console.log(
      `afaro check-names: ${list.entries.length} entries, ${commits.length} commit message(s) swept in ${args.commits}.`
    );
    report(problems);
  }

  if (args.file) {
    const fullPath = path.resolve(process.cwd(), args.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`afaro check-names: no such file: ${args.file}`);
      process.exit(2);
    }
    const problems = [];
    scanLines(fs.readFileSync(fullPath, 'utf8').split(/\r?\n/), `${args.file}:`, problems);
    console.log(`afaro check-names: ${list.entries.length} entries, 1 file swept.`);
    report(problems);
  }

  let base = REPO_ROOT;
  let files;
  try {
    if (args.dir) {
      base = path.resolve(process.cwd(), args.dir);
      files = walk(base, base, []);
    } else {
      files = trackedFiles(REPO_ROOT);
    }
  } catch (error) {
    console.error(`afaro check-names: cannot list files: ${error.message}`);
    process.exit(2);
  }

  const problems = [];
  let scanned = 0;
  let skipped = 0;

  for (const name of files) {
    const fullPath = path.join(base, name);
    if (!fs.existsSync(fullPath)) continue;

    // A file named after somebody is a leak too.
    const nameDigits = name.replace(/\D/g, '');
    for (const matcher of matchers) {
      if (matcher.test(name, nameDigits)) {
        problems.push(`${name}: the file name matches list entry ${matcher.number}`);
      }
    }

    if (!isProbablyText(fullPath)) {
      skipped += 1;
      continue;
    }

    scanned += 1;
    scanLines(fs.readFileSync(fullPath, 'utf8').split(/\r?\n/), `${name}:`, problems);
  }

  const scope = args.dir ? `${args.dir}` : 'the tracked set';
  console.log(
    `afaro check-names: ${list.entries.length} entries, ${scanned} text files swept in ${scope}, ${skipped} binary files left to a person.`
  );
  report(problems);
}

// Always the same shape, whatever was swept, and never the value.
function report(problems) {
  if (problems.length === 0) {
    console.log('Nothing matched.');
    process.exit(0);
  }
  console.error(`\n${problems.length} match(es). The value is not printed; look the entry up in your own list.`);
  for (const problem of problems) {
    console.error(`  ${problem}`);
  }
  process.exit(1);
}

main();
