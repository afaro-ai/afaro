# Run log format

The run log exists so a person can see what happened and so the gate set can be checked against real runs before Phase 1 makes anything unattended. It is not analytics, and it never leaves the machine.

## Where it goes

`logs/` inside the profile folder, next to `profile.json`. That folder sits outside the repository, wherever the person put it. Create `logs/` if it is not there. One file per run, named `afaro-run-YYYY-MM-DD-HHMM.log`. The repository ignores `logs/` so a stray copy inside the working tree still stays untracked.

When the profile came as an attachment to the conversation rather than in an attached folder, there is no profile folder and so no log location. Say that at the start of the run, keep the same lines in the same format, and give the person the whole log in the chat at the end. Do not write it anywhere inside the repository instead.

## The line format

Four fields, tab separated, one line per step.

```
timestamp	broker_id	step	outcome
```

- `timestamp` is ISO 8601 local time.
- `broker_id` is the manifest `id`.
- `step` is the step type, plus the gate reason when the type is `human_gate`, for example `human_gate:submit`. Two step markers name something narrower than a type: `find_listing:dedupe` and `fill_field:readback`.
- `outcome` is one of `ok`, `stopped`, `not_found`, `skipped`, `error`, `approved`, `declined`, `submitted_by_person`.

`submitted_by_person` is for a click a gate approved that the person had already made themselves while answering. It says the step happened and that Afaro did not do it, which is the difference between a record and a guess.

## Two lines worth writing on purpose

**The dedupe.** When a search returns more than one match, the reduction to distinct profile URLs gets its own line, and the counts go on a following `#` line. A count is not a profile value, and the line is how a person sees that two results were one listing rather than two.

```
2026-09-09T10:14:19	example-broker	find_listing:dedupe	ok
# 3 results matched, 2 distinct listings
```

**The read-back.** Every fill clears the field, writes the value, and reads it back. When the field does not hold what was written, the run stops there and the line says so by field path, never by value.

```
2026-09-09T10:14:41	example-broker	fill_field:readback	error
# the field did not hold the value that was written: emails
```

**A value the page refused.** When validation text appears beside a field after a fill, the line records that the page said something, and the comment names the field. The page's own wording goes to the person on screen, not into the log, because it can repeat the value back.

```
2026-09-09T10:15:02	example-broker	fill_field:rejected	stopped
# the page showed validation text beside: phones
```

**A name page's address.** A name page's URL has the person's name in it, so the URL itself never goes in the log. What goes in is the shape, with the slugs written back as placeholders. That line is what a manifest's `name_page.template` is later read from.

```
2026-09-09T10:12:40	example-broker	name_page	ok
# /people/{{name_slug}}/{{state_slug}}/
```

**A click the person made first.** A gate is a pause and a person can act during one.

```
2026-09-09T10:16:11	example-broker	click	submitted_by_person
# the page had already moved when the yes came back
```

## What a run looks like

```
2026-09-08T10:14:02	example-broker	navigate	ok
2026-09-08T10:14:19	example-broker	find_listing	ok
2026-09-08T10:14:41	example-broker	fill_field	ok
2026-09-08T10:14:44	example-broker	fill_field	ok
2026-09-08T10:15:02	example-broker	human_gate:submit	approved
2026-09-08T10:15:05	example-broker	click	ok
2026-09-08T10:15:07	example-broker	wait_for_email_confirm	stopped
```

## What never appears in a log

No name, alias, address, phone number, email address, date of birth, relative, or listing URL. No form values of any kind. No screenshots.

When a step needs to record which field was involved, record the field path and not its value:

```
2026-09-08T10:16:20	example-broker	fill_field	error
2026-09-08T10:16:20	example-broker	missing_field:current_address.line1	stopped
```

A log line holding a profile value is a defect. Fix the line, and say so in the run summary.

## Errors

An `error` outcome is followed by one plain sentence on the next line, prefixed with `#`, describing what could not be done. Keep broker page text out of it beyond the label that was being looked for.
