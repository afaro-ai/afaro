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

## The two modes

`mode` lives in the person's profile.

**guided** is the default and is what runs today. Every gate stops, including `submit`. The person sees what is about to be sent and answers before it goes.

**supervised** is Phase 1. It passes `submit` without stopping and queues the other four for the person. It also allows `read_email_confirm` against a mailbox the person connected themselves.

Supervised mode is defined in the schema and in this file so that Phase 1 adds behavior rather than reshaping the manifests. It is not implemented. If a profile asks for it, stop and say so. Do not approximate it by asking for approval once and treating that as approval for the rest of the run.

## Why the gate set is small

Every gate is a place where a person is needed for a reason the tool cannot resolve on its own: a CAPTCHA and a bot wall are the site declining automation, an ID upload and a phone check are the broker verifying a human, and `submit` is the person taking responsibility for a message sent in their name.

Nothing is added to this list to make a run smoother, and nothing is removed from it to make a run faster.

## What is never done

- No CAPTCHA solving, by any means.
- No working around a bot wall, including retries, delays, different URLs, or a request made outside the browser.
- No fabricated value to satisfy a form.
- No submission in guided mode without a clear yes in chat.
