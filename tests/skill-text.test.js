#!/usr/bin/env node
'use strict';

// Checks that a handful of load-bearing rules are still written in the skill
// text.
//
// Most of what this project promises is enforced by the validator, and the
// README's safety table says which. A few rules cannot be: they are about what
// happens at run time, on a page, and the only place they live is the
// instructions a skill reads. Nothing stops those sentences being softened or
// dropped in a tidy-up, and nothing would notice.
//
// So this is deliberately literal. It looks for short distinctive phrases, not
// whole sentences, so a rewording that keeps the rule passes and a rewording
// that loses it fails. If one of these fails and the rule really did move,
// update the phrase here in the same commit and say so.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

const cases = [
  {
    rule: 'finding 23: a yes belongs to the form it was given for',
    file: 'skills/afaro-orchestrator/references/step-types.md',
    phrases: ['Refill and gate again', 'Never refill and click']
  },
  {
    rule: 'finding 23, again where a run actually reads it',
    file: 'skills/afaro-orchestrator/SKILL.md',
    phrases: ['Refill and gate again', 'Never refill and click']
  },
  {
    rule: 'finding 16: the person may have acted during the pause',
    file: 'skills/afaro-orchestrator/references/step-types.md',
    phrases: ['submitted_by_person']
  },
  {
    rule: 'finding 19: one click per gate, and no second attempt',
    file: 'skills/afaro-orchestrator/references/step-types.md',
    phrases: ['One click per gate', 'Do not click again']
  },
  {
    rule: 'finding 1 and 20: clear, write, read back, and read the page beside it',
    file: 'skills/afaro-orchestrator/references/step-types.md',
    phrases: ['clear the field, write the value, read the field back', 'validation text']
  },
  {
    rule: 'finding 18: a bot check that clears itself is still reported',
    file: 'skills/afaro-orchestrator/references/gates-and-modes.md',
    phrases: ['Show it anyway']
  },
  {
    rule: 'finding 17: a link on a confirmation page is never followed',
    file: 'skills/afaro-orchestrator/references/gates-and-modes.md',
    phrases: ['Never follow one']
  },
  {
    rule: 'the blocks that no mode passes',
    file: 'skills/afaro-orchestrator/references/gates-and-modes.md',
    phrases: ['The first four are not passed by any mode']
  },
  {
    rule: 'the name-page carve-out keeps the endpoint ban',
    file: 'skills/afaro-exposure-scan/references/search-conduct.md',
    phrases: ['would a search engine show this URL to a person', 'no profile-detail page built from an ID']
  },
  {
    rule: 'no stranger enters the repository, painted out or not',
    file: 'CONTRIBUTING.md',
    phrases: ['No stranger\'s name enters this repository, painted out or not']
  }
];

let failures = 0;

for (const testCase of cases) {
  const fullPath = path.join(REPO_ROOT, testCase.file);
  let text;
  try {
    text = fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    failures += 1;
    console.error(`FAIL  ${testCase.rule}`);
    console.error(`      cannot read ${testCase.file}`);
    continue;
  }

  const missing = testCase.phrases.filter((phrase) => !text.includes(phrase));
  if (missing.length === 0) {
    console.log(`ok    ${testCase.rule}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${testCase.rule}`);
    console.error(`      ${testCase.file} no longer contains: ${missing.map((m) => JSON.stringify(m)).join(', ')}`);
  }
}

console.log(`\n${cases.length} checks, ${cases.length - failures} passed, ${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
