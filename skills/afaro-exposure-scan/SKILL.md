---
name: afaro-exposure-scan
description: "Checks which people-search brokers list a person, using each broker's own public search box. Use when the user asks who has their data or where they are listed."
---

# Afaro data removal: exposure scan

Finds which brokers currently show a listing for the person, using the broker's own public search interface and nothing else.

---

## When to use

- The user asks which sites are showing their personal information.
- The user wants a starting picture before filing any opt-outs.
- The orchestrator needs to know whether a broker lists the person before running its opt-out steps.

## When NOT to use

- The user wants to file the opt-out itself. Use `afaro-orchestrator`.
- The user is rechecking a broker they already filed with and is waiting on the broker's processing window. Use `afaro-removal-verify`.
- The user wants to look up somebody else. Afaro searches for the person running it, and for nobody else.

---

## Required inputs

1. **The profile path.** The scan uses the person's own name, state, and city.
2. **The manifests directory.** Each manifest's `search_url_template` says where that broker's public search lives.
3. **A browser.** Every search happens in the person's browser through Claude in Chrome.

Refuse a request to scan for a person who is not the one running the tool.

---

## The framework

The rule that governs every search in this skill, from the project brief:

> Exposure-scan searches only through the broker's public search interface the way a person would: no direct result-endpoint URLs, no request rate beyond a human clicking, no retries on block. On any bot wall or CAPTCHA, stop and hand off.

That sentence decides every question this skill can raise.

**Three outcomes, no fourth.** Each broker ends as `found`, `not_found`, or `not_assessable`. A block, a CAPTCHA, a timeout, or a page that will not load is `not_assessable`. Guessing is not one of the outcomes.

**A block ends that broker.** It does not start a workaround. Move to the next broker and report the block plainly.

**Nothing is kept.** The scan reads a page and records one outcome per broker. Broker results are not saved, copied, summarized into a file, or reused.

---

## Workflow

1. Read the profile. Confirm with the person that this is a scan for themselves.
2. List the manifests directory and report the derived count.
3. For each broker, in turn:
   1. Resolve the placeholders in `search_url_template` from the profile.
   2. Open it in the browser. One page load, at the pace of a person clicking.
   3. If the page shows a CAPTCHA or a bot wall, record `not_assessable`, say which, and move on. Do not retry.
   4. Read the visible results. Compare against the profile fields the manifest names in `find_listing.match_on` when it has one, otherwise name and state.
   5. Record `found`, `not_found`, or `not_assessable`, and one short reason for anything other than `found` or `not_found`.
4. Report the table. Offer to hand the `found` brokers to `afaro-orchestrator`.

---

## Failure patterns

- **A near match treated as a match.** Same name, different city, different age. Show it to the person and let them decide. Do not call it `found` on your own.
- **A block treated as `not_found`.** A site that will not show results has not told you anything. That is `not_assessable`.
- **Retrying a blocked broker.** One attempt per broker per scan.
- **Reaching for a search API or a result URL pattern.** The public search box is the only door this skill uses.
- **Scanning for a third party.** Stop and say Afaro runs for the person using it.

---

## Output format

A table, one row per broker, in manifest order:

| Broker | Outcome | Note |
|---|---|---|
| Example Broker | found | Listing matches name and city |
| Another Broker | not_assessable | Bot wall on the search page |

Then one line: how many were found, out of how many brokers checked.

The run log gets the same outcomes in the redacted format the orchestrator uses: broker id, step, outcome, timestamp, and no profile values.

---

## Reference files

- `references/search-conduct.md` - What counts as searching the way a person would, and what a block means. Read before the first search of a scan.
