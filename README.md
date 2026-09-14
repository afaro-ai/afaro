<img src="assets/afaro-logo-1280.png" alt="Afaro" width="420">

# Afaro: agent skills for personal data removal

Afaro is a local-first personal-data removal engine.

It walks a person through removing their own listing from US people-search brokers. The person's data stays in a file on their own machine, and every submission is approved by them before it is sent. One person can also run it for a relative who has no account of their own, as their authorized agent, with a file per person and a signed authorization kept locally.

## Brokers covered

<!-- brokers:start -->

12 brokers, sorted by how far each manifest carries the flow: through to a sent request first, then handed off partway, then manual, alphabetical within each group. Every cell below is read from that broker's manifest, so this table cannot say anything the catalogue does not.

| Broker | Opt-out method | Flow ends at | Gates you will see | Page last verified |
|---|---|---|---|---|
| Spokeo | Search, then form | Submitted, then a confirmation email | captcha, submit | 2026-09-08 |
| BeenVerified | Search, then form | Handed off: the rest of the flow is not captured | None (nothing is sent) | 2026-09-10 |
| FastBackgroundCheck | Form | Handed off: a link the broker emails | captcha, submit | 2026-09-10 |
| FastPeopleSearch | Form | Handed off: a link the broker emails | captcha, submit | 2026-09-09 |
| Intelius | Form | Handed off: a link the broker emails | submit | 2026-09-10 |
| MyLife | Form | Handed off: the rest of the flow is not captured | None (nothing is sent) | 2026-09-09 |
| Nuwber | Search, then form | Handed off: a link the broker emails | submit | 2026-09-10 |
| PeopleFinders | Form | Handed off: a link the broker emails | captcha, submit | 2026-09-10 |
| PeopleLooker | Search, then form | Handed off: the rest of the flow is not captured | None (nothing is sent) | 2026-09-10 |
| Radaris | Search, then form | Handed off: the rest of the flow is not captured | None (nothing is sent) | 2026-09-09 |
| TruePeopleSearch | Form | Handed off: a link the broker emails | captcha, submit | 2026-09-09 |
| Whitepages | Search, then form | Handed off: the rest of the flow is not captured | submit ×4, phone verify | 2026-09-08 |

<!-- brokers:end -->

Being listed here means one thing: that broker's public opt-out page was captured, and its manifest validates against the schema. It does not mean a removal is guaranteed, and it does not mean the site has ever been run.

<!--
  The block below is written by hand and is NOT generated or checked by CI.
  It records runs, which are facts about somebody's machine rather than facts
  about this repository, so nothing in the tree can verify them. The table
  above is the opposite: generated from manifests/ and checked by CI. Keep the
  two apart, and update this one by hand when a run happens.
-->

### Runs the maintainer has made

**Last updated 2026-09-14.** If that date is old by the time you read it, treat the table as history rather than status.

What the maintainer says, which this repository cannot show you, because run logs are local by design and never committed. Opt-outs filed across four people's profiles on 2026-09-09, 2026-09-10 and 2026-09-14, plus two brokers reached by letter where a form would not take the request.

**The first rechecks, 2026-09-14.** They ran four days late, one person at a time, each after clearing the cache and searching fresh under every name that person uses. Fourteen of the fifteen that were due came back removed: two for one person, six for another, five for a third, and one for the fourth. For one person, Spokeo's and Whitepages' own result counts were each one lower than at filing. The fifteenth is a split, not a failure: the PeopleFinders record that request matched is gone, and a second record for the same person, under a former name in another city, was never filed against. Every listing found removed is checked again on 2026-10-14, because every one of those pages says records come back as new data arrives.

**A broker holds one record per name-and-address combination, and one request clears one record.** So the rows below count requests, and somebody who has moved or changed their name can need more than one on the same broker. That evening a scan under the fourth person's former name turned up records on brokers the earlier round had called clean, and requests went to seven brokers that night, five of which had reported that person clean under their current name. Nuwber was one of the seven, filed for the first time by anyone. Those requests are recorded as filed, not verified: their rechecks fall due 2026-09-16 and 2026-09-17, and MyLife's on 2026-10-14.

The rows are the record. They are counted per broker rather than totalled, because a total is the one number here nothing can check:

| Broker | What happened |
|---|---|
| BeenVerified | The online form refused a shared email address on 2026-09-10, and a written request went to their privacy team that day, covering PeopleLooker too. Its deadline is about 2026-10-25. A second person's online request on 2026-09-14 did not go through either, and a letter for it is drafted and not yet sent. |
| FastBackgroundCheck | Filed once, 2026-09-10, and removed at the 2026-09-14 recheck. Filed once more on 2026-09-14, for a record under a former name. |
| FastPeopleSearch | Filed four times, 2026-09-09 and 2026-09-10, and all four removed at the 2026-09-14 rechecks. Filed once more on 2026-09-14, for a record under a former name. |
| Intelius | Filed once, 2026-09-10, as an account suppression rather than a form. Their page states one suppression covers four sites, this one among them. Recheck due 2026-10-11. A card for a second person, judged theirs despite a wrong birth year, was left alone on purpose on 2026-09-14: this suppression binds an address to one date of birth for good. |
| MyLife | Filed three times, 2026-09-10. The site states no window, so the rechecks use Afaro's 30-day default and fall due 2026-10-10 and 2026-10-11. Filed once more on 2026-09-14, for a record under a former name, due 2026-10-14. |
| Nuwber | Filed for the first time by anyone on 2026-09-14, twice, for two records under one person's former name. Its terms dialog had stopped every scan since 2026-09-09. This run got past it, most likely by the person answering it by hand, and the manifest still has no step for the dialog because nobody has captured it. A third record was judged theirs and left alone on purpose, because each request here needs an email address the site has not had before. |
| PeopleFinders | Six submissions failed across two days against a form that can never succeed, and a written request went to them on 2026-09-10 describing that. Once the working route was found, filed four times the same day. At the 2026-09-14 rechecks three were removed and the fourth was the split described above. The second record in that split was filed the same evening. |
| PeopleLooker | Same company and system as BeenVerified. Covered by that written request. A record for a second person, judged theirs despite a wrong birth date, is named in the drafted letter. |
| Radaris | Scanned only. Blocked by a human-verification check. |
| Spokeo | Filed three times, 2026-09-09 and 2026-09-10. The first was gone on a later scan, and the other two were removed at the 2026-09-14 rechecks. Filed once more on 2026-09-14, for a record under a former name. |
| TruePeopleSearch | Filed twice, 2026-09-10, and both removed at the 2026-09-14 rechecks. Filed once more on 2026-09-14, for a record under a former name. |
| Whitepages | Filed three times, 2026-09-09 and 2026-09-10. The first was gone on a later scan, and the other two were removed at the 2026-09-14 rechecks. |

## What it looks like

Every image below is the smoke test, which is Afaro running against a fake people-search page served from this repository, with the example profile. No real broker, no real person, nothing sent anywhere.

The three page frames are the fake page itself: `npm run smoke` serves it and any browser will show you the same thing. The chat frame needs the runtime Afaro actually runs in, which `docs/smoke-test.md` sets out.

<img src="assets/readme/smoke-gate-chat.png" alt="Afaro stopping at the submit gate, listing the two values it is about to send, and waiting for a yes" width="820">

*The part that matters. The run stops at the submit gate, prints both values it is about to send, and waits. Nothing goes until a person answers. This is the smoke test against the local fake page, using the example profile.*

<img src="assets/readme/smoke-1-search.png" alt="The fake directory page with three example listings and an empty removal form" width="660">

*Before the run: the fake page's own results and its empty form. Smoke test, local page, example profile.*

<img src="assets/readme/smoke-2-filled.png" alt="The same form filled from the example profile, stopped before the submit button is pressed" width="660">

*The form filled from the profile, held here while the gate above waits. Still the smoke test, still the local page and the example profile.*

<img src="assets/readme/smoke-3-submitted.png" alt="The fake page showing a request received panel with a reference beginning SMOKE" width="660">

*After the yes. The fake page handles its own submission and says so; the reference begins `SMOKE`, from a separate run of the same test; the fake page mints a new reference each time. Smoke test, local page, example profile, and nothing left the machine.*

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

These hold in every mode. The second column says what holds each one, because a rule enforced by a schema and a rule written down for a skill to follow are not the same promise, and you should be able to tell which you are getting.

| Rule | Held by |
|---|---|
| Nothing is submitted without the person confirming it in chat | **Validator**, for the shape: a manifest that can send anything carries a submit gate, nothing is filled after the last one, and nothing is clicked between the last fill and the gate. **Orchestrator instruction** for honouring the stop at run time |
| A CAPTCHA, a bot wall, an ID request, or a phone verification goes to the person. Where it needs answering the run stops; where it clears itself they are told it happened | **Schema**, which fixes the five gate reasons. **Validator**, which keeps the click that places a verification call behind its gate. **Orchestrator instruction** for the rest |
| No value is invented to satisfy a form. A missing field stops the run | **Orchestrator instruction.** The validator's nearest help is forcing every field the steps read into `profile_fields_required`, refusing a choice the captured page does not offer, and refusing the authorized-agent answer written in as a fixed value rather than read from the profile |
| Run logs hold a broker id, a step, an outcome, and a timestamp, and never profile values | **Orchestrator instruction.** Nothing reads a log to check it. CI refuses a tracked one |
| The person's profile is never copied into this repository and never written to a log | **Repository guard**: the ignore rules, the CI check on tracked files, and the redaction sweep. **Reviewer** for the images, which no sweep can read |
| One click per gate | **Validator**, which refuses a manifest declaring a retry, by name. **Orchestrator instruction** for reading the page after the click |

Two of the six rest on an instruction alone: no invented value, and what a run log may hold. Nothing reads a running skill to check either. That is the honest shape of it: a skill can be told what not to do, and the validator can only refuse a manifest that asks for it.

## The skills

| Skill | What it does |
|---|---|
| `afaro-orchestrator` | Runs one opt-out at a time, one record at a time, and stops at every gate |
| `afaro-exposure-scan` | Finds the records brokers hold for the person, under every name in the profile |
| `afaro-removal-verify` | Rechecks after the broker's stated window |
| `afaro-followup` | Requeues listings that came back, hands over brokers needing an ID, a payment, or an account |
| `afaro-drop-submit` | California state deletion request. Scaffold, not implemented |

## Layout

```
schema/optout.schema.json   the manifest schema, JSON Schema 2020-12
schema/profile.schema.json  the profile schema, which a person can check their own file against
scripts/validate.js         the validator, run by CI on pull requests and on main
scripts/check-names.js      the redaction sweep, run against a list kept outside the repo
scripts/brokers-table.js    regenerates the broker table above from manifests/
scripts/serve-smoke.js      serves the smoke page on loopback
.githooks/                  sweeps a commit message, and a branch before it is pushed
manifests/                  one JSON file per broker, with captures/ alongside
manifests/_smoke/           one manifest that drives a page in this repository
profile.example.json        the shape of a profile, filled with placeholder values
skills/                     the five skills
docs/field-notes.md         what real runs turned up, newest first
docs/install.md             setup for a non-technical reader
docs/smoke-test.md          the runtime check that comes before any broker
docs/releases/              what shipped in each release, and what did not
assets/                     the logo, the app mark, the social preview, and the
                            smoke-test screenshots the README shows
CONTRIBUTING.md             the authoring rules, the sweep, and how to propose a broker
LICENSE                     MIT, and what it does not cover
tests/                      validator fixtures, checks, and the smoke page
```

## Running the validator

```
npm install
npm run validate
npm test
npm run brokers:table
npm run validate:profile
```

`npm run validate` reads the `.json` files sitting directly in `manifests/`, one per broker, checks each against the schema, checks its provenance fields, and checks that its capture file is present. It does not descend into subdirectories, so the one manifest in `manifests/_smoke/` is checked by `npm run validate:smoke` instead. It reports a count derived from the directory and makes no network requests.

`npm run validate:profile` checks `profile.example.json` against `schema/profile.schema.json`. Pointed at your own file, `node scripts/validate.js --profile <path>` does the same on your own machine, and a failure names the block and the entry by number without printing any value from the file, or the file's name.

`npm test` runs three suites: the validator's own checks, the redaction sweep's, and a literal check that a handful of run-time rules are still written in the skill text. That last one exists because those rules cannot be enforced by a schema, so nothing else would notice them being softened away.

`npm run brokers:table` rewrites the broker table in this file from `manifests/`. `npm run brokers:check` fails if it is out of date, which is what CI runs. Nothing between the table's markers is edited by hand.

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
- **Images: a person, always.** No sweep can read a screenshot. Every committed capture is opened and checked by eye, and every capture blanked from a real run is reviewed by a second read-only agent against the unblanked original. That review is required by the authoring rules, and it is done by a person or a read-only agent. No check in this repository can enforce it, which is why it is written down rather than wired up.

These three, and the rest of the authoring rules, are in `CONTRIBUTING.md`.

## The smoke test

`manifests/_smoke/` holds one manifest that is not a broker. It drives a page checked into `tests/smoke/`, served on loopback by `npm run smoke`, so a whole run can be watched end to end without touching a real site. The page handles its own submission and makes no network request.

A loopback URL is allowed in that manifest and refused everywhere else, which the validator enforces and the fixtures cover.

`docs/smoke-test.md` is the runbook. Run it before any broker manifest is written.

## Your profile

Copy `profile.example.json` into a folder of its own outside this repository and fill in your own details. That folder holds `profile.json` and the `logs/` directory the orchestrator writes to, and nothing else. Attach it and this repository as workspace folders at the start of a session; the orchestrator looks for `profile.json` in the attached folders before it asks for anything. The repository ignores every file whose name starts with `profile`, apart from the example, so a copy left in the working tree stays untracked.

One person can run Afaro for a relative who has no Claude account or no email of their own. That is one profile file per person, a signed authorization from each of them kept beside their file, and a contact address and a contact number the operator controls. `docs/install.md` has the rules and the four optional profile fields it uses.

A profile has to carry every name the person has gone by and every city they have lived in, because a broker keeps a record per name and address and the scan can only look for what the profile names. Two blocks in it are written by Afaro rather than by you. `email_use` notes which address went to which broker, for the brokers that take one request per address, so a spent address is not offered twice. `known_records` notes a decision you made about a record, so a later scan reports it instead of asking again. Nothing in either leaves the profile.

During a run, your profile is part of the conversation with Claude, which means it passes through Anthropic's API. Afaro writes nothing outside the profile folder and sends nothing anywhere else. That is an instruction the skills follow rather than something a check proves, and the safety table above says which promises are which. `docs/install.md` says this in plain words for a first-time reader.

## Status

Phase 0, in progress.

What this repository can show you, and you can check yourself:

- Every broker manifest validates against the schema and was written from a capture committed alongside it, on the date recorded in that file. `npm run validate` reports the count, derived from the directory.
- Most of them stop before their broker's flow does, on a `handoff` step, because the rest of that flow sits behind a real listing and nobody has captured it. Those report as handed off rather than submitted, and no recheck clock starts until the person says they finished.
- The example profile validates against a profile schema, which a person can also run against their own file without it printing anything from that file.
- The checks that guard all of this run with `npm test`.

What the maintainer says, which this repository cannot show you, because run logs are local by design and never committed:

- As of 2026-09-14: opt-outs filed in guided mode across four people's profiles on eleven of the twelve brokers in the table above, all but Radaris. Two of the eleven, BeenVerified and PeopleLooker, went by letter because their online form would not take the request. The table gives it broker by broker.
- Every filing rechecked once its window had passed has come back removed, fourteen of fifteen on 2026-09-14 with the fifteenth clearing the record it named, and that holds per record rather than per broker: a broker can hold a second record under a former name or a prior city, and a removal of the first says nothing about it.
- One broker is still blocked by its own defence, a human-verification check, and has no steps for it because nobody has captured it. Nuwber's terms dialog did not stop a run on 2026-09-14, and it still has no step for the same reason.
- One broker could not be reached over HTTPS at all, across three passes, and so has no manifest rather than a guessed one.
- The table above under **Brokers covered** carries the same runs broker by broker, with the date it was last updated.

What those runs turned up is in **[docs/field-notes.md](docs/field-notes.md)**: brokers filed, bugs found in their own flows, routes that turned out to be closed, and what each one changed in the schema or the skills.

`CONTRIBUTING.md` has the authoring rules if you want to add a broker.

**The name.** Afaro comes from the Greek *aphairein*, to take away. Pronounced a-FAR-oh.

## License

The skills, the schema, the validator, the manifests, the documentation, and everything under `assets/`, which is the artwork and the smoke-test screenshots, are MIT licensed. `LICENSE` has the terms.

The screenshots under `manifests/captures/` are a different thing and are not covered by that. They are images of third-party websites' public pages, and they are here for one reason: so a reader can check that each manifest matches the page it was built from. Whatever rights exist in those pages belong to the site operators, not to this project. The MIT license covers this repository's own work and does not purport to license anybody else's page content.

None of this is legal advice.
