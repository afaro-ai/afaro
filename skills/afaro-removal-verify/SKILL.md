---
name: afaro-removal-verify
description: "Rechecks brokers after their stated processing window and reports whether the listing is gone or still there. Use when the user asks if a removal worked, or wants to check on opt-outs they filed."
---

# Afaro data removal: removal verify

Rechecks a broker once its stated processing window has passed, and reports whether the listing is still there.

---

## When to use

- The user filed an opt-out and wants to know whether it took effect.
- A broker's `recheck_after_days` window has elapsed since the submission.
- The user asks for the status of everything they have filed.

## When NOT to use

- Nothing has been filed yet. Use `afaro-exposure-scan` for a first picture.
- The window has not passed yet. Say when it does and stop. Checking early tells the person nothing and adds traffic for no reason.
- A listing came back after being removed. That is `afaro-followup`.

---

## Required inputs

1. **The profile path.**
2. **The run log or the person's own record** of which brokers were submitted and when.
3. **The manifests directory**, for `verification` and `recheck_after_days`.

If there is no record of a submission for a broker, say so rather than assuming one happened.

---

## The framework

**The window is the broker's own number where the broker states one.** `recheck_after_days` is copied from the broker's public page. Waiting it out is the whole point of this skill. Do not shorten it because the person is impatient, and say plainly that some brokers take longer than they state.

Some pages state no window at all. Those manifests carry `recheck_stated: false` and a null `recheck_after_days`. Wait 30 days, and say plainly that the broker stated no window and 30 is Afaro's number. Never present it as the broker's own.

**A broker that ended on a handoff is not a filed request.** A manifest whose last step is `handoff` stops before the broker's flow does, and the run that reached it filed nothing. Do not start a window from that run. Ask the person whether they finished the flow and on what day, and count from the day they give. Until they answer, the broker is not on the due list.

**Verification follows the manifest.** `verification.method` is `search`, `email`, or `status_page`, and `verification.success_when` says in plain words what a removed listing looks like.

**Two outcomes and an honest third.** `removed`, `still_listed`, or `not_assessable`. The same search conduct rule as the exposure scan applies here: the broker's public search interface, at the pace of a person, no retries on a block.

**Removals fail and listings reappear.** Report what the page shows today, without predicting what it will show next month.

---

## Workflow

1. Read the profile and the submission record.
2. Build the due list: every broker whose submission date plus `recheck_after_days` is on or before today. Report which brokers are not due yet and when they will be.
3. For each due broker:
   1. Follow `verification.method`.
      - `search`: repeat the exposure scan for that broker only.
      - `status_page`: open `verification.url_template` with the placeholders resolved.
      - `email`: ask the person whether the broker's confirmation or completion mail arrived.
   2. Compare what the page shows against `verification.success_when`.
   3. Record `removed`, `still_listed`, or `not_assessable`.
4. Report the table. For anything `still_listed`, offer `afaro-followup`.
5. Set the next recheck for anything `removed`, so a listing that comes back is caught.

---

## Failure patterns

- **Checking before the window.** Tell the person the date and wait.
- **Treating a block as a removal.** A page that will not load is `not_assessable`, never `removed`.
- **Treating a changed listing as a removal.** Fewer fields showing is not the same as gone. Read `success_when` and hold to it.
- **Promising it will stay gone.** It might not. Say what is true today and schedule the next check.

---

## Output format

| Broker | Filed | Window | Outcome |
|---|---|---|---|
| Example Broker | 2026-08-20 | 14 days | removed |

Then the next recheck date per broker, and one line naming anything still listed.

Log lines use the orchestrator's redacted format: broker id, step, outcome, timestamp, no profile values.

---

## Reference files

- `references/verify-checklist.md` - The recheck runbook and the rules for reading a result honestly. Read before the first recheck of a session.
