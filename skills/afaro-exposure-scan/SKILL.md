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

1. **The profile path.** The scan uses the person's own name, any other names they have gone by, and their state and city.
2. **The manifests directory.** Each manifest says where that broker's public search lives: a `name_page` block, a `search_url_template`, or a `use_search_box` step, in that order of preference.
3. **A browser.** Every search happens in the person's browser through Claude in Chrome.

Refuse a request to scan for a person who is not the one running the tool.

---

## The framework

The rule that governs every search in this skill, from the project brief:

> Exposure-scan searches only through the broker's public search interface the way a person would: no direct result-endpoint URLs, no request rate beyond a human clicking, no retries on block. On any bot wall or CAPTCHA, stop and hand off.

That sentence decides every question this skill can raise.

**Three outcomes, no fourth.** Each broker ends as `found`, `not_found`, or `not_assessable`. A block, a CAPTCHA, a timeout, a page that will not load, and a search that only sells a report are all `not_assessable`. Guessing is not one of the outcomes.

**Every name the person has used.** A listing sits under whatever name the broker collected, which is often not the one on the profile's `full_name`. Search `full_name` and each entry in `aliases`, one search each, at the pace of a person, and report per name. On one live scan a broker showed a match under a name variant that the `full_name` search missed entirely.

**A block ends that broker.** It does not start a workaround. Move to the next broker and report the block plainly.

**Nothing is kept.** The scan reads a page and records one outcome per broker. Broker results are not saved, copied, summarized into a file, or reused.

---

## Workflow

1. Read the profile. Confirm whose scan this is, in these words: **"This scan is for <profile name>. Confirm you are that person, or their authorized agent with them present."** Wait for the answer before the first search.
2. List the manifests directory and report the derived count. Every `.json` file directly inside it is one broker, and nothing else is: skip any file or folder whose name starts with `_`, which is where the smoke manifest lives and which is not a broker.
3. Build the list of names to search: `full_name`, then each entry in `aliases`.
4. For each broker, in turn, and for each name in that list:
   1. **The name page, where there is one.** If the manifest has a `name_page` whose `shows` is `free_listing` or `teaser`, go to it at the most specific level the profile can fill and the site publishes, following `search-conduct.md` on how it may be reached. Read it and settle the outcome. A 404 at a level the site otherwise supports is `not_found` for that level, not an error. If `consent_modal` is true and a wall appears, stop there the way you would on a search page.
   2. **The search template, second.** If there is no name page, or its `shows` is `funnel`, or it did not load, resolve the placeholders in `search_url_template` and open it. One page load, at the pace of a person clicking.
   3. **The search box, third.** If the manifest carries a `use_search_box` step, or the template returned a 404 or a page that is plainly not a result page, use the box the site shows: type the name into it and run the search the way a person would. A template that has drifted is a finding worth reporting, not something to work around silently.
   4. If the page shows a CAPTCHA or a bot wall, record `not_assessable`, say which, and move on. Do not retry, and do not fall through to another door as a workaround. A block ends that broker.
   5. Read the visible results. Compare against the profile fields the manifest names in `find_listing.match_on` when it has one, otherwise name and state.
   6. Record `found`, `not_found`, or `not_assessable`, and one short reason for anything other than `found` or `not_found`.
5. Report the table, one row per broker per name searched. Offer to hand the `found` brokers to `afaro-orchestrator`.

---

## Failure patterns

- **A near match treated as a match.** Same name, different city, different age. Show it to the person and let them decide. Do not call it `found` on your own.
- **A block treated as `not_found`.** A site that will not show results has not told you anything. That is `not_assessable`.
- **Retrying a blocked broker.** One attempt per broker per scan.
- **Reaching for a search API or a result URL pattern.** A broker's own published name-directory page is the one exception, under the four conditions in `search-conduct.md`. A result endpoint, a JSON path, and a profile URL built from an ID stay out under all of them.
- **Falling through to another door after a block.** A block ends that broker. Trying the name page because the search box was walled is a workaround, whatever it is called.
- **Scanning for a third party.** Stop and say Afaro runs for the person using it.

---

## Output format

A table, one row per broker, in manifest order:

| Broker | Name searched | Outcome | Note |
|---|---|---|---|
| Example Broker | full_name | found | Listing matches name and city |
| Example Broker | alias 1 | not_found | |
| Another Broker | full_name | not_assessable | Bot wall on the search page |

Then one line: how many were found, out of how many brokers checked.

The run log gets the same outcomes in the redacted format the orchestrator uses: broker id, step, outcome, timestamp, and no profile values.

---

## Reference files

- `references/search-conduct.md` - What counts as searching the way a person would, and what a block means. Read before the first search of a scan.
