---
name: afaro-followup
description: "Requeues brokers whose listing came back, and hands over brokers needing an ID, a payment, or an account. Use when a listing reappeared or an opt-out is stuck."
---

# Afaro data removal: followup

Handles the two things that happen after a first pass: listings that come back, and brokers that will not take an automated request at all.

---

## When to use

- A broker that was verified as removed is listing the person again.
- An opt-out was filed and the window passed with the listing still there.
- A broker's opt-out needs a government ID, a notarized document, a payment, or an account.
- The user asks what is left to do by hand.

## When NOT to use

- A first opt-out that has not been filed yet. Use `afaro-orchestrator`.
- A recheck whose window has not elapsed. Use `afaro-removal-verify`.
- A first look at who lists the person. Use `afaro-exposure-scan`.

---

## Required inputs

1. **The profile path.**
2. **The verify results** naming the brokers that are `still_listed` or that came back.
3. **The manifests directory**, for `method`, `id_requirements`, and `notes`.

---

## The framework

**Two queues, kept apart.**

The **requeue** holds brokers whose opt-out can be filed again as data: the flow still works, the listing is simply back. These go to `afaro-orchestrator` for another guided pass, with the same gates.

The **manual queue** holds brokers Afaro does not automate. A manifest with `method: manual`, or with `id_requirements.required` true, belongs here. So does any broker whose page now asks for something the manifest does not describe.

**A manual broker gets an exact ask, not a shrug.** The person should be able to act on one paragraph: what the broker wants, where the page is, what they will have to hand over, and what the broker says the timeline is. All of it comes from the captured page, not from memory.

**Nothing is uploaded for the person.** Afaro does not send an ID, does not create an account, and does not pay anything. The person does those, in their own browser, with their own documents.

**A repeat listing is normal.** Brokers refresh from public records. Say so once, plainly, without predicting how often it will happen.

---

## Workflow

1. Read the verify results and sort each broker into the requeue or the manual queue.
2. For the requeue:
   1. Confirm the manifest's `verified_on` is not stale against what the page shows now. If the form has changed, stop and record it as a finding rather than adapting the steps.
   2. Hand the list to `afaro-orchestrator` for a guided pass.
   3. Note that this is a second filing, so the person is not surprised by the repeat.
3. For the manual queue, write one entry per broker in the format below, taken from the manifest and its capture.
4. Report both queues, with counts, and say which needs the person's own time.

---

## Failure patterns

- **Automating a manual broker.** Creating an account, filling a payment form, or uploading an ID is not Afaro's work, in any mode.
- **Filing again into a changed form.** A form that no longer matches the manifest is a finding for the manifest, not something to improvise around.
- **Filing again immediately.** Give the broker its stated window before a second request, and say when that is.
- **Guessing what a broker wants.** If the ask is not on the captured page, say the page needs to be recaptured before advising.
- **Treating a reappearance as a failure of the person.** It is how the brokers work. Say it once and move on.

---

## Output format

Requeue, as a list of broker names with the date each was last filed.

Manual queue, one entry each:

```
Example Broker
What they want: a photo of a government ID with the number covered
Where: https://example.com/opt-out
What you do: upload it on that page, then keep the reference number they show
Their stated timeline: 14 days
Source page read on: 2026-09-08
```

Then one line: how many brokers are requeued, how many need the person's own time.

---

## Reference files

- `references/manual-broker-asks.md` - How to write a manual entry a person can act on, and what may not appear in one. Read before writing the first entry.
