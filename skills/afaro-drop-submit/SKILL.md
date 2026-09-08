---
name: afaro-drop-submit
description: "Scaffold for the single California deletion request through the state DROP platform. Not implemented yet. Use when a California resident asks about the state deletion request."
---

# Afaro data removal: California DROP request

Files one deletion request with California's state platform, which registered data brokers are required to process, instead of one form per broker.

**Status: scaffold. Nothing in this skill runs yet.** The steps below describe what Phase 1 will do. If a person asks for it today, explain what it is, say it is not built, and offer the per-broker guided run instead.

---

## When to use

- The person's profile has `state_of_residence` set to `CA` and they ask about the state deletion request.
- The person asks why they would still file per-broker opt-outs if California has one request.

## When NOT to use

- The person does not live in California. The platform is a California residents' right, and a request from elsewhere is not one Afaro will file.
- The person wants the per-broker opt-outs. Use `afaro-orchestrator`.
- The person wants to know who lists them. Use `afaro-exposure-scan`.

---

## Required inputs

1. **The profile path**, with `state_of_residence` equal to `CA`.
2. **A capture of the current platform page**, read on the day it is used, under the same provenance rule every manifest follows.
3. **The person, present.** The request is theirs, made in their name, and the state platform verifies them directly.

Stop if `state_of_residence` is anything other than `CA`.

---

## The framework

**One request, many brokers.** The state platform takes a single verified deletion request and makes it available to registered data brokers, which are required to process it. That is the reason the skill exists: one request instead of dozens.

**It does not reach everything.** Public-record data is outside what the platform requires brokers to delete, and brokers that are not registered are outside it too. So the per-broker opt-outs still run. A person who files the state request and stops there will still be listed in places.

**The state verifies the person, not Afaro.** Identity checks in the platform belong to the person. Any step asking for identity is a `human_gate` with reason `id_upload` or `phone_verify`, and no mode passes those.

**Nothing is filed on anyone else's behalf.** One person, present, for themselves.

---

## Workflow

Phase 1. Written here so the shape is settled before it is built.

1. Read the profile. Confirm `state_of_residence` is `CA`. Stop if it is not.
2. Confirm with the person that they want the state request in addition to, not instead of, the per-broker opt-outs. Say plainly what the platform does not reach.
3. Open the California Privacy Protection Agency's platform page in the person's browser. Read it as it is today. Do not work from remembered field names.
4. Walk the platform's own steps, gating exactly as a manifest does: every identity check is the person's to complete.
5. Stop at the submit gate. In guided mode the person confirms before anything is sent.
6. Record the outcome in the redacted log: one line, no profile values, no request identifiers that carry personal data.
7. Hand the remaining brokers to `afaro-orchestrator` for the per-broker pass.

Before this is implemented, the platform's page is captured and read the same way a broker's opt-out page is, and this skill is rewritten from that capture rather than from this description.

---

## Failure patterns

- **Treating the state request as the whole job.** It is one part. Public-record data and unregistered brokers remain, and the per-broker opt-outs follow.
- **Filing for a person who does not live in California.** Stop.
- **Filing for somebody who is not present.** Stop.
- **Working from this file instead of the live page.** These notes describe intent. The page decides the steps.
- **Promising a result.** No guarantee is made about what any broker does with the request.

---

## Output format

Not produced yet. When implemented: one line saying the request was submitted and on what date, the platform's own reference if it shows one and it carries no personal data, and the list of brokers still queued for per-broker opt-outs.

---

## Reference files

- `references/drop-scope.md` - What the state platform covers, what it does not, and what has to be verified against the live page before this skill is built.
