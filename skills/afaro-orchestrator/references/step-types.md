# Manifest step types

Eight step types exist. A manifest lists them in order under `steps`. Nothing else is executable: a manifest is data, and this file is the only place that says what the data means.

Profile placeholders appear inside double braces, for example `{{full_name}}` or `{{current_address.state}}`. Resolve them from the profile at the moment the step runs. If a placeholder has no value in the profile, stop.

---

## navigate

Fields: `url`, optional `note`.

Open the URL in the browser through Claude in Chrome. Resolve placeholders first. Never rewrite the URL into an API path, a JSON endpoint, or a result URL the site did not hand you.

## find_listing

Fields: `match_on`, `on_not_found`, optional `note`.

Read the search results the browser is showing and decide whether one of them is the person, by comparing the profile fields named in `match_on`. Show the candidate to the person and let them confirm which listing is theirs when more than one is close.

`on_not_found` is `stop` or `continue`. `stop` ends this broker and reports `not_found`. `continue` moves to the next step, which is what brokers with a blind opt-out form need.

Never open a result by constructing its URL. Click it the way a person would.

Keep the address of the listing you settled on. Brokers that opt out one listing at a time ask for that URL on their form, and `fill_field` reads it back through `from_listing`. Keep it in the run, not in the log.

## fill_field

Fields: `selector`, then exactly one of `value_from`, `value_literal`, or `from_listing`, optional `note`.

`selector.label` is the visible label on the page as it appeared on `verified_on`. Find the control by that label first. `selector.css` is a fallback and is expected to drift.

`value_from` is a profile field path. `value_literal` is a fixed value the page itself offers, such as a reason code in a dropdown.

`from_listing` takes the value from the listing the earlier `find_listing` step identified, not from the profile. `url` is that listing's address as the browser shows it, and further attributes of the result are added when a captured page asks for one. It exists because a broker that keys its opt-out to one listing asks for that URL and no profile holds it. The validator refuses a manifest that fills from the listing without a `find_listing` step before it. Never type a description of a value into a form: if the value is not known, stop.

A value taken from the listing never appears in a run log, the same as a profile value. Log the step and the outcome, never the URL.

If the field cannot be found, stop. Do not fill the nearest similar field.

## click

Fields: `selector`, optional `note`.

Click the control with that visible label.

Clicks before the submit gate move through the form. The click that sends it comes after the gate. The validator holds that shape: once the last `fill_field` has run, no `click` and no `navigate` may appear until the submit gate has passed, and a manifest that is not `method: email` must click something after the gate.

## wait_for_email_confirm

Fields: `expect_from`, `timeout_minutes`, optional `note`.

The broker says it sends a confirmation email. Tell the person who it comes from and what to do with it. They open their own mail and click the link. Afaro does not touch their mailbox in this step.

## read_email_confirm

Fields: `expect_from`, `link_text`, `timeout_minutes`, optional `note`.

Phase 1. When the person has connected their own mailbox, find the confirmation message, open the link, and record the result.

Not enabled today. If a manifest reaches this step, treat it as `wait_for_email_confirm`: tell the person which message to look for and let them open it. Say plainly that the automatic version is not built yet.

## human_gate

Fields: `reason`, `prompt`, optional `note`.

Stop. Print `prompt`. Wait for the person.

`reason` is one of `captcha`, `bot_wall`, `id_upload`, `phone_verify`, `submit`. See `gates-and-modes.md` for which mode passes which reason. Guided mode passes none of them.

## handoff

Fields: `reason`, `prompt`, optional `note`.

The manifest stops here and the broker's flow does not. Print `prompt`, tell the person the broker is theirs to finish, and end this broker.

`reason` says why the manifest stops: `page_not_captured` when the rest of the flow was not on the page the manifest was written from, `requires_listing_url` when the flow cannot go on without a listing URL that is not available, `requires_email_link` when it completes in a link the broker emails.

Three things follow, and none of them bends:

- The outcome for this broker is `handed off at step N`, never `submitted`. Nothing was filed.
- No recheck clock starts. `afaro-removal-verify` counts from the day the person says they finished, not from this run.
- It is the last step. The validator refuses a manifest with anything after a handoff, and refuses more than one.

Ask the person what each remaining step asked for and record it. That is how the manifest gets longer on the next pass, from a page someone actually saw.
