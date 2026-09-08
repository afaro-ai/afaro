# California DROP: scope and open questions

This file records what the skill is for and what has to be checked before it is built. It is not a description of the platform's current screens, and it is not a substitute for reading the page.

## What it is

California's Delete Request and Opt-out Platform, run by the California Privacy Protection Agency. A California resident makes one verified deletion request. Data brokers registered with the state are required to access the platform and process the requests they find there.

Brokers were required to begin processing requests from the platform on 2026-08-01.

## Why per-broker opt-outs still run

Two gaps, both material to a person deciding what to do:

1. **Public-record data.** The deletion right does not extend to information drawn from public records in the way the per-broker opt-out forms often do. A listing can survive the state request and still come down through the broker's own form.
2. **Unregistered brokers.** The platform reaches brokers registered with the state. A site that has not registered is not reached by it.

So the order Afaro suggests to a California resident is: file the state request, then run the per-broker opt-outs for the remainder, then verify.

## What must be verified before implementation

Every item here is checked against the live page, on the day the skill is written, and captured the same way a broker manifest's source page is captured.

- The current URL of the platform and of the consumer-facing request flow.
- What the platform asks for, field by field, and which of those are identity checks.
- How the platform verifies a person, and what it asks them to upload or confirm.
- What the platform returns after a submission, and whether any reference it gives carries personal data.
- What the platform states about timing and about what brokers are required to do.
- What the platform states about public-record data, in its own words, so the gap above is described from the page and not from this file.

## What is settled regardless of what the page says

- California residents only.
- The person is present and files for themselves.
- Every identity step is a human gate that no mode passes.
- Guided mode stops before submission.
- No guarantee language about any outcome.
- The redacted log holds no profile values and no personal reference numbers.
