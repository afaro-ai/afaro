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

**Nothing is sent without a person saying so in chat.** In guided mode the `submit` gate is a real stop. Print what is about to be sent, wait for the person to answer, and accept only a clear yes. Silence is not a yes.

**Blocks are handed over, never worked around.** On a CAPTCHA, a bot wall, an ID request, or a phone verification, stop and hand the step to the person. Do not fetch a page another way, do not retry, do not look for a different endpoint.

---

## Workflow

1. Find the profile in the attached folders, and ask only if it is not there. Read it. Note its `mode`, and note whether it came from a folder or from an attachment, because that decides where the run log goes.
2. If `mode` is not `guided`, stop with the message above.
3. List the manifests directory. Report the derived count, for example "12 brokers available".
4. Ask the person which brokers to run, or confirm running all of them in order.
5. For each broker, in turn:
   1. Read the manifest. Check that every path in `profile_fields_required` is present in the profile. If one is missing, stop and ask.
   2. If `method` is `manual`, do not automate it. Report what the broker requires and hand it to `afaro-followup`.
   3. Walk `steps` in order. See `references/step-types.md` for what each type means.
   4. At every `human_gate`, stop, print the `prompt`, and wait. Resume only after the person answers.
   5. Append one redacted line per step to the run log. See `references/run-log-format.md`.
6. After the last broker, print a summary: submitted, handed over, stopped, skipped, and why. A broker whose manifest carries `person_finishes_on_site: true` is never reported as submitted, however far its steps got. Its steps end before the broker's flow does, so it is handed over, with what the person still has to do on the broker's site.
7. Tell the person when each broker is due for a recheck, using `recheck_after_days`, and point them at `afaro-removal-verify`. Two things that number does not always mean. When the manifest carries `recheck_after_days_from_page: false`, the page states no window and the number is a waiting period, so say that rather than attributing it to the broker. When the manifest carries `person_finishes_on_site: true`, nothing was filed by this run, so give no due date and say the count starts when the person finishes the flow.

---

## Failure patterns

- **A missing profile field.** Stop and ask. Never fill a form with a value the profile does not hold, and never use a placeholder.
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
