# Writing a manual broker entry

A manual entry is the handoff. The person reads it once and knows what to do without opening the manifest.

## The five lines

1. **Broker name**, as the brand appears on the site.
2. **What they want.** The exact thing the page asks for: a government ID, a notarized affidavit, an account, a fee.
3. **Where.** The `optout_url` from the manifest.
4. **What you do.** The action, in one sentence, plus anything the person should keep, such as a reference number.
5. **Their stated timeline**, from `recheck_after_days`, and the date the page was read, from `verified_on`.

## Where the words come from

The captured page, and nothing else. If a detail is not visible in the capture, it does not go in the entry. When the person needs something the capture does not cover, say the page needs to be read and captured again before advising.

## What never appears

- Advice to hand over more than the page asks for.
- A guess at what the broker will accept.
- A characterization of the broker. Brokers are described factually, and no broker is called good or bad.
- A promise about the outcome or the timing.
- Any profile value. The entry says which document type is needed, never the person's details.

## Redaction advice worth giving

When a broker asks for a government ID, the page often accepts a copy with parts covered. If the captured page says so, say so, and quote the page's own wording. If it does not say so, do not invent permission to redact.

## When the ask changes

If the person reports that the page now asks for something different, that is a manifest finding. Record it, and leave the manifest alone until it is recaptured and rewritten under the usual authoring rule.
