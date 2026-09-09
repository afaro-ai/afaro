# Afaro data removal

Afaro is a local-first personal-data removal engine.

It walks a person through removing their own listing from US people-search brokers. The person's data stays in a file on their own machine, and every submission is approved by them before it is sent. One person can also run it for a relative who has no account of their own, as their authorized agent, with a file per person and a signed authorization kept locally.

## How it works

Afaro is a set of skills that run in Claude, with the Claude in Chrome extension driving the browser. Each broker's opt-out is described in a JSON manifest: where its public search is, where its opt-out form is, which profile fields the form needs, the steps to take, and how to check later whether the listing is gone. A manifest is data. No manifest contains code.

The manifests and the schema are data files with no runtime in them, and the skills follow the open Agent Skills specification. What has actually been run, though, is one thing: Claude Desktop with the Claude in Chrome extension. Every claim on this page was checked there. No other runtime has been tried, and until one is, none is claimed.

Every manifest records the broker's public opt-out page it was built from, the date that page was read, and a screenshot of it committed alongside. The validator refuses a manifest that is missing any of the three or whose screenshot is not on disk. Nothing in a manifest may describe anything the capture does not show.

## What it does not do

- It is not a service. There is no hosted component, no account, and no data collection.
- It does not solve CAPTCHAs or work around a site that has blocked automation. When a broker blocks it, the run stops and the step goes to the person.
- It does not make up data. If a form needs a field the profile does not have, the run stops.
- It does not guarantee removal. Removals fail, and listings come back. That is why rechecks are scheduled.
- It searches only through each broker's own public search interface, at the pace of a person clicking. A broker's own name-directory page, the kind published for search engines, may be opened directly where a manifest records its pattern with a capture behind it. Result endpoints, internal JSON paths, and profile URLs built from an ID stay out.

## Safety rules

These hold in every mode.

1. Nothing is submitted without the person confirming it in chat.
2. A CAPTCHA, a bot wall, an ID request, or a phone verification goes to the person. Where it needs answering, the run stops until they answer. Where it clears itself, they are told it happened rather than left to assume nothing did.
3. No value is invented to satisfy a form. A missing field stops the run.
4. Run logs hold a broker id, a step, an outcome, and a timestamp. They never hold profile values.
5. The person's profile is never copied into this repository and is never written to a log.
6. One click per gate. After a click the person approved, the page is read; if nothing happened, the run stops and says so. A submit that produces no page change is the site refusing, and clicking again would submit the form a second time.

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
scripts/check-names.js      the redaction sweep, run against a list kept outside the repo
scripts/serve-smoke.js      serves the smoke page on loopback
.githooks/                  sweeps a commit message, and a branch before it is pushed
manifests/                  one JSON file per broker, with captures/ alongside
manifests/_smoke/           one manifest that drives a page in this repository
profile.example.json        the shape of a profile, filled with placeholder values
skills/                     the five skills
docs/install.md             setup for a non-technical reader
docs/smoke-test.md          the runtime check that comes before any broker
CONTRIBUTING.md             the authoring rules, the sweep, and how to propose a broker
tests/                      validator fixtures, checks, and the smoke page
```

## Running the validator

```
npm install
npm run validate
npm test
```

`npm run validate` reads every `.json` file in `manifests/`, checks it against the schema, checks its provenance fields, and checks that its capture file is present. It reports a count derived from the directory. It makes no network requests.

## The redaction sweep

```
export AFARO_NAME_LIST=<path to your list>
npm run check:names
```

`npm run check:names` reads every tracked text file and fails if any of them holds a value from a list of real people's details. Run it before opening a pull request. It is the check that catches a real name used as an example, which is how one got in.

The list is not in this repository and cannot be. It holds the values being protected, so it lives beside the profiles, outside the working tree, and the sweep refuses a list kept inside. One value per line; blank lines and `#` comments are ignored, so the list can be grouped by person.

A failure names the file and the line and which entry of the list fired, by number. It never prints the value, so a build log and a screen full of output stay clean. Look the number up in your own copy.

A bare word is matched on its own boundaries, a value with spaces or punctuation is matched as written, and a value holding seven or more digits is also matched digits-only, so a number written with dots trips a list that writes it with dashes. File names are checked as well as contents.

With no list configured the sweep does not run, and it says so and exits 2 rather than reporting a pass. Continuous integration runs it with `--allow-missing-list`, because the list must never reach a build machine; that run prints the same notice and passes, and the real sweep stays the author's job.

### The hooks

```
npm run hooks:install
```

That points git at `.githooks/`, which holds two.

`commit-msg` sweeps the message before the commit is written. A commit message is not a tracked file, so `git ls-files` never reaches it, and a message is written in the same sitting as the code it describes, by the same person. The first two values this sweep ever caught were one in a source comment and one in the message of the commit that added it.

`pre-push` sweeps the message of every commit on the branch that the remote has not seen. It catches the ones written before the hooks were installed, the ones amended past them, and anything rebased in from elsewhere.

Both run with `--allow-missing-list`, so somebody without a list can still commit and push. The notice they print is the signal that the sweep did not run.

### What the machine catches, and what a person must

Three edges, worth knowing before trusting any of it.

- **Tracked files and commit messages: the machine.** The sweep and the two hooks cover both, and continuous integration runs the tracked-file pass in its no-list mode.
- **Pull request bodies: a person.** Nothing here reads them. A pull request body is written outside the repository and can repeat anything, so a read-only review of the body is a required step before a pull request is opened.
- **Images: a person, always.** No sweep can read a screenshot. Every committed capture is opened and checked by eye, and every capture blanked from a real run is reviewed by a second read-only agent against the unblanked original. That review is required, not advisory.

These three, and the rest of the authoring rules, are in `CONTRIBUTING.md`.

## The smoke test

`manifests/_smoke/` holds one manifest that is not a broker. It drives a page checked into `tests/smoke/`, served on loopback by `npm run smoke`, so a whole run can be watched end to end without touching a real site. The page handles its own submission and makes no network request.

A loopback URL is allowed in that manifest and refused everywhere else, which the validator enforces and the fixtures cover.

`docs/smoke-test.md` is the runbook. Run it before any broker manifest is written.

## Your profile

Copy `profile.example.json` into a folder of its own outside this repository and fill in your own details. That folder holds `profile.json` and the `logs/` directory the orchestrator writes to, and nothing else. Attach it and this repository as workspace folders at the start of a session; the orchestrator looks for `profile.json` in the attached folders before it asks for anything. The repository ignores every file whose name starts with `profile`, apart from the example, so a copy left in the working tree stays untracked.

One person can run Afaro for a relative who has no Claude account or no email of their own. That is one profile file per person, a signed authorization from each of them kept beside their file, and a contact address the operator controls. `docs/install.md` has the rules and the three optional profile fields it uses.

During a run, your profile is part of the conversation with Claude, which means it passes through Anthropic's API. Afaro stores nothing and sends nothing anywhere else. `docs/install.md` says this in plain words for a first-time reader.

## Status

Phase 0, in progress. The schema, the validator, and the skill scaffolds are in place, and broker manifests are being added one at a time, each written from a capture of that broker's public opt-out page. Run `npm run validate` for the count.

The first opt-outs have been filed. Three brokers have been run end to end on a real profile in guided mode: two of them are gone from the sites' own searches, and the third is filed with a recheck scheduled. A fourth stopped itself with nothing filed when the site returned an error, which is what it is supposed to do. What all of those runs turned up went back into the schema, the skills, and the manifests, which is most of what this repository is.

Several manifests stop before their broker's flow does, because the rest of that flow is behind a real listing and nobody has captured it. Those report as handed off rather than submitted, and no recheck clock starts until the person says they finished. One broker could not be reached at all over HTTPS and has no manifest rather than a guessed one.

`CONTRIBUTING.md` has the authoring rules if you want to add a broker.
