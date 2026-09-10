---
name: afaro-orchestrator
description: "Runs Afaro data removal opt-outs one broker at a time from a local profile, stopping before anything is sent. Use when the user wants to remove a listing or opt out of a people-search site."
---

# Afaro data removal: orchestrator

Runs one broker opt-out at a time from a manifest, using the person's local profile, and stops for them before anything is sent.

---

## When to use

- The user wants to file an opt-out with one or more people-search brokers.
- The user has an Afaro profile file and asks to start, continue, or resume a run.
- The user asks what Afaro would do for a given broker before running it.

## When NOT to use

- The user only wants to know which brokers currently list them. Use `afaro-exposure-scan`.
- The user is rechecking a broker they already filed with. Use `afaro-removal-verify`.
- A broker reappeared, or a broker needs an account, a payment, or an ID. Use `afaro-followup`.
- The user lives in California and wants the single state deletion request. Use `afaro-drop-submit`.

---

## Required inputs

1. **The profile.** By default it is `profile.json` in the workspace folder the person attached for it, a folder outside this repository holding the profile and its `logs/` directory and nothing else. Look in the attached folders for a `profile.json` before asking anything. When two folders are attached, the profile folder is the one that is not the Afaro repository. If no attached folder holds one, ask: the person may have attached the profile to the conversation instead, which works and changes only where the run log goes. Never guess a path, never store the profile in a file inside this repository, and never repeat profile values back in a log.

   **One run reads one profile.** An operator running Afaro for a family holds a file per person, named `profile-<name>.json` in the same folder. When the folder holds more than one, use the one the person named in their request, and ask which if they named none. Never guess from the file names and never read two. Say whose profile was read before the first broker, and if a second person's removals come up, that is a new run.
2. **The manifests directory.** `manifests/` in the attached Afaro folder. Every `.json` file in it is one broker. Derive the list and the count by reading the directory. Never work from a remembered list of brokers. If the Afaro folder is not attached, ask for it before the first broker rather than partway through one; the person attaches folders through the folder picker and nothing else can attach one for them.
3. **A browser.** Steps run through the Claude in Chrome extension, in the person's own browser, in their own session.

If the profile is missing a field a manifest requires, stop and ask the person for it. Never invent a value to satisfy a form.

---

## The framework

Afaro holds four rules that do not bend.

**One broker at a time.** A run is a loop over manifests, and each pass through the loop finishes or stops before the next one starts. There is no batch submit in any mode.

**The gate set.** A manifest step of type `human_gate` carries a `reason`: `captcha`, `bot_wall`, `id_upload`, `phone_verify`, or `submit`. What a mode does with each reason is the only real difference between modes.

| Mode | captcha, bot_wall, id_upload, phone_verify | submit |
|---|---|---|
| `guided` | Stop and hand to the person | Stop and hand to the person |
| `supervised` | Stop and hand to the person | Pass without stopping |

`guided` is the default and the only mode implemented today. If `mode` is `supervised`, stop and say: supervised mode is defined but not enabled yet, so this run needs guided mode. Do not approximate it.

**Nothing is sent without a person saying so in chat.** In guided mode the `submit` gate is a real stop. Print what is about to be sent, wait for the person to answer, and accept only a clear yes. Silence is not a yes. A broker whose opt-out runs over several pages sends something on each one and carries a gate for each send, so a run can stop several times for one broker.

**Every value is written, not assumed.** Each `fill_field` clears the field, writes the value, and reads it back, and reads the page beside it for validation text. A browser that has filled the box already is one reason: on the first live run Chrome had put the operator's own email into a broker's form before the step ran. A form that refuses a value is the other: it says so next to the field, straight away, and that message goes to the person before the next step runs. If the read-back does not match, or the page rejected the value, stop and name the field.

**One click per gate, and no second attempt.** After a click a gate approved, read the page. If nothing happened, stop and log it. A submit that produces no page change is the site refusing, not a click that missed, and clicking again submits the form a second time. On one live run three submits went out before the run stopped itself. There is no retry setting, and a manifest that asks for one is refused.

**A person can act during a pause.** Before making a click a gate approved, check the page has not already moved. If the button is gone or a confirmation has replaced the form, the person did it themselves while answering. Log `submitted_by_person` and carry on from where the page is.

**A yes belongs to the form it was given for.** If the page changed some other way, fields emptied, a reload, a different listing on screen, then what the person approved is not what is in front of you. Refill and gate again. Never refill and click. Deciding the values are the same is the agent's judgment standing in for the person's, on the one question they are there to answer.

**Blocks are handed over, never worked around.** On a CAPTCHA, a bot wall, an ID request, or a phone verification, stop and hand the step to the person. Do not fetch a page another way, do not retry, do not look for a different endpoint.

---

## Workflow

1. Find the profile in the attached folders, and ask only if it is not there. Read it. Note its `mode`, and note whether it came from a folder or from an attachment, because that decides where the run log goes.
2. If `mode` is not `guided`, stop with the message above.
3. Confirm whose run this is, in these words: **"This run is for <profile name>. Confirm you are that person, or their authorized agent with them present."** Wait for the answer. If the profile carries an `authorized_agent` block, say so in the same breath: that the operator is acting as their authorized agent, and what `authorization_ref` points at. Say it once and not again. If the profile carries a `contact_email`, that is the address that goes on broker forms in place of the first entry of `emails`, and it is named here too.

If the profile carries a `contact_phone`, say so here as well, in one breath: **verification calls and texts will go to that number, not to the number on the listing, so whoever answers it needs to be around while the run is going.** Add the caveat, because it costs a sentence and saves a wasted afternoon: some brokers refuse a number they read as internet telephony, and a number that works everywhere else can be rejected on one site for that reason alone.

Nothing else about the run changes: every gate behaves the same, and a step that needs the actual person still needs them.
4. List the manifests directory. Every `.json` file directly inside it is one broker, and nothing else is: skip any file or folder whose name starts with `_`, which is where the smoke manifest lives and which is not a broker. Report the derived count, for example "12 brokers available".
5. Ask the person which brokers to run, or confirm running all of them in order.
6. For each broker, in turn:
   1. Read the manifest. Check that every path in `profile_fields_required` is present in the profile. If one is missing, stop and ask.
   2. If `method` is `manual`, do not automate it. Report what the broker requires and hand it to `afaro-followup`.
   3. Walk `steps` in order. See `references/step-types.md` for what each type means.
   4. At every `human_gate`, stop, print the `prompt`, and wait. Resume only after the person answers.
   5. When a `find_listing` step matches more than one result, reduce them to distinct profile URLs, log the reduction on its own line, and say how many listings there are. Run the broker's steps once per distinct listing, and ask before each one. A person can hold several listings on one broker, and each is opted out separately.
   6. Append one redacted line per step to the run log. See `references/run-log-format.md`.
7. After the last broker, print a summary: submitted, handed off, stopped, skipped, and why. A broker whose steps ended on a `handoff` is reported as `handed off at step N`, never as submitted, however far its steps got. Nothing was filed. Say what the person still has to do on the broker's site.
8. Tell the person when each broker is due for a recheck, using `recheck_after_days`, and point them at `afaro-removal-verify`. Two exceptions. When `recheck_stated` is false, `recheck_after_days` is null because the page states no window: wait 30 days, and say in the summary that the broker did not state one, so the 30 is Afaro's number and not theirs. When the broker ended on a `handoff`, give no due date at all, because no clock starts until the person says they finished the flow.

---

## Failure patterns

- **A missing profile field.** Stop and ask. Never fill a form with a value the profile does not hold, and never use a placeholder.
- **A value that does not take.** The field was cleared and written and holds something else. Stop, name the field, and say the value did not take. Do not write it again. Something on the page is fighting the step, and a second attempt sends whichever value wins.
- **A page asking for a reason it did not offer.** Fill only an option the page shows. If the profile's `opt_out_reason` matches none of them, ask the person which one they want. Never pick the nearest.
- **A broker refusing the contact number.** Some will not take a number they read as internet telephony. Stop and hand the broker over the way a `phone_verify` gate does: say the number was refused, say why the site gave if it gave one, and ask for a different number the person can answer. **Never fall back to the number on the listing.** That number belongs to the person whose listing it is, who in operator mode may be somebody else entirely, and putting it in a verification field rings a handset nobody is watching while the code expires.
- **A form that no longer matches the manifest.** The manifest records what a page looked like on `verified_on`. If the page has changed, stop, say which field could not be found, and record it as a finding. Repairing manifests on the fly is a Phase 1 behavior that is not enabled.
- **A step that seems to need a hidden request.** If Claude in Chrome cannot complete a step in the browser, log the finding and stop. Do not reach for a direct fetch.
- **A person answering "whatever you think".** That is not approval for a `submit` gate. Ask again in plain terms.
- **A profile value appearing in a log line.** That is a defect. Log the field name, never the value.

---

## Output format

- **Run log:** one local, redacted file per run in `logs/` inside the profile folder, next to `profile.json`, named `afaro-run-YYYY-MM-DD-HHMM.log`. Create `logs/` if it is not there. Format in `references/run-log-format.md`.
- **When the profile came as an attachment:** there is no folder to write to. Say so at the start of the run, keep the same lines, and deliver the whole log in the chat when the run ends.
- **Chat summary:** one line per broker, in the order they ran, then the recheck dates.
- **Nothing else is written.** No profile copy, no scraped broker data, no cache of search results.

---

## Reference files

- `references/step-types.md` - What each manifest step type means and how to execute it. Read before the first broker of a run.
- `references/gates-and-modes.md` - The gate set, what guided and supervised each do, and what is not enabled yet. Read when the person asks about automation.
- `references/run-log-format.md` - The redacted log line format and what must never appear in it. Read before writing the first log line.
