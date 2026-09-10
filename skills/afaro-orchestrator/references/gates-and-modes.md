# Gates and modes

## The five gate reasons

| reason | What it means | Who does it |
|---|---|---|
| `captcha` | The page is asking for a CAPTCHA | The person, always |
| `bot_wall` | The site has blocked automated access | The person, always |
| `id_upload` | The broker wants a government ID or a notarized document | The person, always |
| `phone_verify` | The broker wants a code sent to a phone | The person, always |
| `submit` | The form is filled and about to be sent | The person in guided mode |

The first four are not passed by any mode. There is no setting that turns them off. A build that passes one of them is a defect, not a feature.

A `handoff` step is not a gate, and no mode passes it either. It is where a manifest stops because the broker's flow goes further than its public page showed. Nothing was filed, the outcome is handed off, and no recheck clock starts. Supervised mode does not push past it any more than guided mode does.

An `accept_terms` step is not a gate either. It is a consent or terms dialog standing in front of the flow, and it has a section of its own below.

## Terms and consent dialogs

A terms popup is not a small thing in the way. Three brokers ended a real scan on one before a search had run, and an `accept_terms` step is how a manifest describes one.

Afaro answers it with the most privacy-preserving choice the dialog offers: decline where there is a decline, and the smallest consent it will take where there is not. Reject all, necessary only, whatever that dialog calls it. Never accept everything to get past it faster. Read the step's `warnings` out before clicking, because one control on one of these dialogs opened a paid checkout in a new tab.

**Nothing broader than viewing the public search is ever accepted.** These dialogs are answered to reach a page anyone can reach, and that is the whole of what they are for. A dialog asking for more than that is a stop, whatever the manifest says: an account, a subscription, a payment method, an authorization to run a background check on somebody, a consent to be contacted, an agreement that binds the person as a customer rather than as a visitor. **Stop and say which dialog it was and what it asked for.** Nobody is signed up to anything to reach an opt-out form.

That limit is read off the dialog at run time. A manifest names one control on one dialog as it stood on `verified_on`; whether what is on screen now sits inside the limit is a question about this dialog, today, and it is never assumed from the step being there.

An `accept_terms` step comes before anything is filled and before the submit gate, and the validator holds it there. It may come before the search, which is where these three sit: the dialog stands between the front page and any results, so the step is answered and then the search runs.

## More than one submit gate

A broker whose opt-out runs over several pages sends something on each page. Each of those sends is approved on its own, so a manifest may carry a submit gate per page, and what a gate approves is the values filled since the previous one. Guided mode stops at every one of them.

This is not a way to ask for approval twice for the same send. Between two submit gates something is clicked, or the first gate approved a send that never happened, and the validator refuses that shape.

`phone_verify` has an order of its own. The click that places the call sits behind that gate and never in front of it, because the call reaches a real phone the moment the button is pressed. The validator refuses a click between a `phone_verify` gate and the gate before it.

## A gate that asks once

Some brokers issue a captcha token that expires inside the window between the captcha gate and the submit gate. The person ticks the box, reads the values, says go, and the form is refused because the token died while they were reading. Asking twice is correct and still fails.

For those brokers the manifest sets `gate_mode: combined` on the submit gate, and the two are asked as one: tick the box, check what is about to be sent, say go. The validator allows it only where a captcha gate is the step immediately before, because that is the pair being folded. Nothing is passed and nothing is assumed; the person still answers before anything is sent.

## Bot checks that clear themselves

Some checks pass without the person doing anything. The box ticks itself, the page moves on, and nothing was asked.

Show it anyway. Say that the site put a bot check in the way, that it cleared on its own, and that the run is continuing. A person who is told the tool met a bot check and got past it knows what happened on their own machine. A person who is told nothing has no way to tell that from a tool quietly working around one, which is the thing this project promises never to do.

## Links on a confirmation page

A confirmation page is the end of a broker's flow and the beginning of its sales pitch. One of these pages ends with a link to a paid removal service that pays the broker for the click.

Never follow one. Not to read it, not to check what it says, not to report it. The opt-out finished when the broker confirmed it. An affiliate link, an upsell, a monitoring trial, and a link to a partner are all outside the flow, and a manifest note that names one is there so nobody treats it as the next step.

## The two modes

`mode` lives in the person's profile.

**guided** is the default and is what runs today. Every gate stops, including `submit`. The person sees what is about to be sent and answers before it goes.

**supervised** is Phase 1. It passes `submit` without stopping and queues the other four for the person. It also allows `read_email_confirm` against a mailbox the person connected themselves.

Supervised mode is settled here, and the manifest schema already carries the `read_email_confirm` step and the five gate reasons that supervised mode depends on, so Phase 1 adds behavior rather than reshaping manifests. It is not implemented. `mode` itself is a profile setting, not a manifest field, and there is no profile schema yet. If a profile asks for it, stop and say so. Do not approximate it by asking for approval once and treating that as approval for the rest of the run.

## Why the gate set is small

Every gate is a place where a person is needed for a reason the tool cannot resolve on its own: a CAPTCHA and a bot wall are the site declining automation, an ID upload and a phone check are the broker verifying a human, and `submit` is the person taking responsibility for a message sent in their name.

Nothing is added to this list to make a run smoother, and nothing is removed from it to make a run faster.

## What is never done

- No CAPTCHA solving, by any means.
- No working around a bot wall, including retries, delays, different URLs, or a request made outside the browser.
- No fabricated value to satisfy a form.
- No submission in guided mode without a clear yes in chat.
