# Afaro data removal

Afaro is a local-first personal-data removal engine.

It walks a person through removing their own listing from US people-search brokers. The person's data stays in a file on their own machine, and every submission is approved by them before it is sent.

## How it works

Afaro is a set of skills that run in Claude, with the Claude in Chrome extension driving the browser. Each broker's opt-out is described in a JSON manifest: where its public search is, where its opt-out form is, which profile fields the form needs, the steps to take, and how to check later whether the listing is gone. A manifest is data. No manifest contains code.

Every manifest records the broker's public opt-out page it was built from, the date that page was read, and a screenshot of it committed alongside. The validator refuses a manifest that is missing any of the three or whose screenshot is not on disk. Nothing in a manifest may describe anything the capture does not show.

## What it does not do

- It is not a service. There is no hosted component, no account, and no data collection.
- It does not solve CAPTCHAs or work around a site that has blocked automation. When a broker blocks it, the run stops and the step goes to the person.
- It does not make up data. If a form needs a field the profile does not have, the run stops.
- It does not guarantee removal. Removals fail, and listings come back. That is why rechecks are scheduled.
- It searches only through each broker's own public search interface, at the pace of a person clicking.

## Safety rules

These hold in every mode.

1. Nothing is submitted without the person confirming it in chat.
2. A CAPTCHA, a bot wall, an ID request, or a phone verification stops the run and goes to the person.
3. No value is invented to satisfy a form. A missing field stops the run.
4. Run logs hold a broker id, a step, an outcome, and a timestamp. They never hold profile values.
5. The person's profile is never copied into this repository and is never written to a log.

## The skills

| Skill | What it does |
|---|---|
| `afaro-orchestrator` | Runs one broker's opt-out at a time and stops at every gate |
| `afaro-exposure-scan` | Finds which brokers currently list the person |
| `afaro-removal-verify` | Rechecks after the broker's stated window |
| `afaro-followup` | Requeues listings that came back, hands over brokers needing an ID, a payment, or an account |
| `afaro-drop-submit` | California state deletion request. Scaffold, not implemented |

## Layout

```
schema/optout.schema.json   the manifest schema, JSON Schema 2020-12
scripts/validate.js         the validator, run by CI on every push
scripts/serve-smoke.js      serves the smoke page on loopback
manifests/                  one JSON file per broker, with captures/ alongside
manifests/_smoke/           one manifest that drives a page in this repository
profile.example.json        the shape of a profile, filled with placeholder values
skills/                     the five skills
docs/install.md             setup for a non-technical reader
docs/smoke-test.md          the runtime check that comes before any broker
tests/                      validator fixtures, checks, and the smoke page
```

## Running the validator

```
npm install
npm run validate
npm test
```

`npm run validate` reads every `.json` file in `manifests/`, checks it against the schema, checks its provenance fields, and checks that its capture file is present. It reports a count derived from the directory. It makes no network requests.

## The smoke test

`manifests/_smoke/` holds one manifest that is not a broker. It drives a page checked into `tests/smoke/`, served on loopback by `npm run smoke`, so a whole run can be watched end to end without touching a real site. The page handles its own submission and makes no network request.

A loopback URL is allowed in that manifest and refused everywhere else, which the validator enforces and the fixtures cover.

`docs/smoke-test.md` is the runbook. Run it before any broker manifest is written.

## Your profile

Copy `profile.example.json` into a folder of its own outside this repository and fill in your own details. That folder holds `profile.json` and the `logs/` directory the orchestrator writes to, and nothing else. Attach it and this repository as workspace folders at the start of a session; the orchestrator looks for `profile.json` in the attached folders before it asks for anything. The repository ignores `profile.json` and `profile.*.json` so a copy left in the working tree stays untracked.

During a run, your profile is part of the conversation with Claude, which means it passes through Anthropic's API. Afaro stores nothing and sends nothing anywhere else. `docs/install.md` says this in plain words for a first-time reader.

## Status

Phase 0, in progress. The schema, the validator, and the skill scaffolds are in place, and the first broker manifests are being added one at a time, each written from a capture of that broker's public opt-out page. Run `npm run validate` for the count. No opt-out has been filed with a real broker yet.
