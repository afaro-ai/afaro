# Run log format

The run log exists so a person can see what happened and so the gate set can be checked against real runs before Phase 1 makes anything unattended. It is not analytics, and it never leaves the machine.

## Where it goes

A `logs/` directory outside the repository, next to the person's profile. One file per run, named `afaro-run-YYYY-MM-DD-HHMM.log`. The repository ignores `logs/` so a stray copy inside the working tree still stays untracked.

## The line format

Four fields, tab separated, one line per step.

```
timestamp	broker_id	step	outcome
```

- `timestamp` is ISO 8601 local time.
- `broker_id` is the manifest `id`.
- `step` is the step type, plus the gate reason when the type is `human_gate`, for example `human_gate:submit`.
- `outcome` is one of `ok`, `stopped`, `not_found`, `skipped`, `error`, `approved`, `declined`.

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
