# Manifest step types

Ten step types exist. A manifest lists them in order under `steps`. Nothing else is executable: a manifest is data, and this file is the only place that says what the data means.

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

### More than one match

A search can return the same person more than once. Two result cards can also be two views of one profile, which is why the rule is about addresses and not about cards.

1. Collect every result that matches `match_on`.
2. Reduce them to distinct profile URLs. Two cards that open the same URL are one listing.
3. Log the reduction on its own line, `find_listing:dedupe`, with the counts on a following `#` line. Counts are not profile values.
4. Say how many distinct listings there are and run the broker's steps once per listing, asking the person before each one. Nothing is filed for a listing they did not agree to.

A person can hold several listings on one broker and each is opted out on its own. Never merge them into a single request, and never run the second one without asking.

## fill_field

Fields: `selector`, then exactly one of `value_from`, `value_literal`, or `from_listing`, optional `note`.

`selector.label` is the visible label on the page as it appeared on `verified_on`. Find the control by that label first. `selector.css` is a fallback and is expected to drift.

Fill in three moves, every time: clear the field, write the value, read the field back. If what the field holds afterwards is not what was written, stop and say which field and that the value did not take. Do not write it again and do not carry on.

Read the page as well as the field. A form that rejects a value says so next to it, and it says so straight away rather than at the end. After each fill, look for validation text that has appeared near the field, and if there is any, show it to the person before the next step runs. A value the page has rejected is a stop, not something to work around by reshaping it and trying again.

The reason is not theoretical. On the first live run Chrome had already filled the operator's own email address into a broker's form before the step ran. A step that had trusted what was in the box would have sent a stranger's confirmation link to the wrong inbox. Clearing first is what makes the value the profile's, and reading back is what proves it.

`value_from` is a profile field path. `value_literal` is a fixed value the page itself offers, such as a reason code in a dropdown.

Two profile rules apply when the value is resolved.

- `emails` resolves to `contact_email` when the profile has one, and to the first entry of `emails` otherwise. In operator mode the contact address is the operator's, so broker replies and confirmation links reach the person who is doing the work.
- `contact_phone` is the number a broker will ring or text. It does not fall back to `phones` and `phones` does not fall back to it. If a step needs it and the profile has none, stop and ask for one. A confirmation link arriving in the wrong inbox can be forwarded; a verification call ringing an unattended handset cannot, and the code expires while nobody answers.
- `opt_out_reason` is the person's standing answer to a broker that asks why. It is optional, and a manifest that reads it names it in `profile_fields_required` like any other field.

`format` says how the value is written into the box when the box wants a shape the profile does not keep. `digits` strips everything that is not a digit, which is what a phone field that refuses brackets and dashes needs; `lowercase` lowers the case; `as_is` is the default and the same as leaving it out. The profile keeps the value the way a person writes it, and the step does the shaping, so a phone number stays readable in the one place a person looks at it. The read-back checks the shaped value, not the profile's. `digits` on a value taken from the listing is refused, because a URL with everything but its digits removed is not a URL.

`phone_field` says which kind of phone box this is, and only appears where the captured page says. `contact` is a number the broker will ring or text, and it comes from `contact_phone`. `listing` is the number as it stands on the listing being removed, and it comes from `phones`. The validator holds both to their source. Where the page does not make the distinction, leave the marker out and say so in a note: a phone box on a removal form is not obviously one or the other, and guessing puts a stranger's call on somebody's handset or a wrong number on a removal request. A missing marker is not a default. **Ask which number to use and never pick.** Say the page does not make it clear and what each answer would mean, and fill the one the person names.

`choices` lists the options the captured page offers, word for word, and appears only when the capture shows them. When it is there, the value filled has to be one of them and the validator refuses anything else. When a page offers a set the capture did not show, the manifest names no value: match the profile's `opt_out_reason` against what the page shows at the time, and if nothing matches, stop and ask the person to choose. Never invent a reason a broker did not offer, and never pick one because it looks closest.

`agent_value_literal` is for one control and one question: forms that ask whether the request comes from the person themselves or from someone acting for them. The answer is not the manifest's to give. `value_literal` holds the answer for the person, `agent_value_literal` holds the answer for an operator, both in the page's own words from `choices`, and the run picks between them on one test: does the profile carry an `authorized_agent` block. Nothing else decides it, and the person is told which answer went in.

The agent answer never goes in `value_literal`. A manifest that writes it there tells every broker the request is an agent's, whoever is at the keyboard and whatever the profile says, and the validator refuses it by name. The check reads the answer's own words, so a page whose wording is unusual enough to trip it needs the note to say so rather than a workaround.

Where choosing the agent answer opens fields the manifest does not describe, do not carry `agent_value_literal` at all. Two manifests are in exactly that position: the agent answer reveals agent name and email boxes that are on no capture, so both leave the field out and stop, and their notes say why. A capability that walks a run into an undescribed form is worse than the stop it replaces.

`from_listing` takes the value from the listing the earlier `find_listing` step identified, not from the profile. `url` is that listing's address as the browser shows it, and further attributes of the result are added when a captured page asks for one. It exists because a broker that keys its opt-out to one listing asks for that URL and no profile holds it. The validator refuses a manifest that fills from the listing without a `find_listing` step before it. Never type a description of a value into a form: if the value is not known, stop.

A value taken from the listing never appears in a run log, the same as a profile value. Log the step and the outcome, never the URL.

If the field cannot be found, stop. Do not fill the nearest similar field.

## accept_terms

Fields: `selector`, optional `warnings`, optional `note`.

A consent or terms dialog standing in front of the flow. Click the control the manifest names, which is the one that declines, or consents to the least the dialog allows.

The default is the most privacy-preserving choice on offer, always. Decline where there is a decline. Where there is none, take the smallest consent the dialog will accept: reject all, necessary only, or whatever that dialog calls it. Never accept everything to get past it faster, and never agree to a setting the person was not shown.

`warnings` says what else the dialog does. Read it out before clicking. One control on one of these dialogs opened a paid checkout in a new tab, so a control that costs money or signs someone up is named there and is never the one clicked.

**Nothing broader than viewing the public search is ever accepted.** A dialog that asks for an account, a payment method, an authorization to run a background check, or an agreement binding the person as a customer is a stop, whatever the manifest says. Say which dialog it was and what it asked for. The full rule is in `gates-and-modes.md`.

It comes first: before anything is filled and before the submit gate. The validator holds it there. It may sit before the search, which is where a dialog standing between a front page and its results goes.

What a manifest needs to carry one: the decline or minimal-consent control in `selector`, with the visible label the dialog shows, and the dialog on a capture. Most of these open with the page, so `source_capture` shows them; one reached later in a flow goes in `additional_captures` like any other. A dialog nobody has captured gets no step. Three brokers stop a scan on a terms popup today and none of them carries one, because guessing at a control on a dialog nobody has seen is how a tool clicks Accept All on somebody's behalf.

## use_search_box

Fields: `inputs`, optional `url`, optional `submit`, optional `note`.

Search through the box the site shows, rather than through an address. This is the door for a broker whose `search_url_template` has drifted, or was never a page to begin with: open `url` if it is given, type each of `inputs` into the box its selector names, and run the search with `submit` or from the box itself.

It comes first, before anything is filled on a form and before the submit gate, and the validator holds it there. A search is not a submission. It must never become a way to put values on a page and send them before the person has approved anything.

What leaves the browser here is the search itself, the words a person would type into that site's own box. That is the exposure scan's design as the brief has it, and it is the one place data reaches a broker with no gate in front of it. Say so when a run starts with one.

## click

Fields: `selector`, optional `note`.

Click the control with that visible label.

**One click per gate, and no second attempt.** After a click that a gate approved, read the page. If it did not respond, stop and log it. Do not click again. A submit that produces no page change is the site refusing, not a click that missed, and a second click is a second submission of the same form. Three submits on one form is a retry however it is reached. A manifest cannot ask for a retry either: there is no field for it and the validator refuses one by name.

**After a yes, read the page before acting on it.** A gate is a pause, and a person can act during a pause. Before the click a gate approved, check whether the page has already moved.

If the person finished it themselves, the button is gone or a confirmation has replaced the form. Log `submitted_by_person` and carry on from where the page actually is. Never repeat what has already been done.

If the page has changed some other way, the yes no longer applies to what is on screen. Fields emptied, the page reloaded, a different listing showing: any of those means the form the person approved is not the form in front of you. **Refill and gate again.** Never refill and click.

That is not caution for its own sake. A yes approves one specific filled form, the one whose values were printed at the gate. Refilling and clicking on the grounds that the values are the same substitutes the agent's judgment for the person's, on the one question the person is there to answer.

Clicks before a submit gate move through the form. The click that sends comes after the gate. Brokers whose opt-out runs over several pages send something on each page, so a manifest may carry more than one submit gate, and each one approves the values filled since the previous one. The validator holds that shape per segment: once the last `fill_field` before a gate has run, no `click` and no `navigate` may appear until that gate has passed; nothing is filled after the last gate; and a manifest that is not `method: email` clicks something after every gate.

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

`gate_mode: combined` on a submit gate folds the captcha gate immediately before it into the same prompt: tick the box, check the values, say go, in one exchange. It exists because some brokers issue a captcha token that expires inside the window between two separate gates, so a correct two-gate flow submits with a dead token and the person is sent round again. It is only valid on a submit gate with a captcha gate directly before it, and the validator holds both conditions. Everything else about the gate is unchanged: it is still a real stop, and silence is still not a yes.

`phone_verify` carries one extra rule. The click that places the call sits behind the gate, never in front of it, because that click makes a phone ring. The validator refuses a click between a `phone_verify` gate and the gate before it. Tell the person the call is placed the moment the button is pressed, and that they answer it and read the code back themselves.

## handoff

Fields: `reason`, `prompt`, optional `note`.

The manifest stops here and the broker's flow does not. Print `prompt`, tell the person the broker is theirs to finish, and end this broker.

`reason` says why the manifest stops: `page_not_captured` when the rest of the flow was not on the page the manifest was written from, `requires_listing_url` when the flow cannot go on without a listing URL that is not available, `requires_email_link` when it completes in a link the broker emails.

Three things follow, and none of them bends:

- The outcome for this broker is `handed off at step N`, never `submitted`. Nothing was filed.
- No recheck clock starts. `afaro-removal-verify` counts from the day the person says they finished, not from this run.
- It is the last step. The validator refuses a manifest with anything after a handoff, and refuses more than one.

Ask the person what each remaining step asked for and record it. That is how the manifest gets longer on the next pass, from a page someone actually saw.
