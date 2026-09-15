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

1. **The profile path.** The scan uses the person's own name, every other name they have gone by, their state, their current and prior cities, and any records they have already decided about in `known_records`.
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

**Records, not brokers.** A broker holds one record per name-and-address combination, and one request clears one record. So the scan reports records found, not brokers: one row per distinct listing, keyed by the broker's own address for the record where it shows one, with the name that surfaced it. A broker that returns a record under one name and a different record under another is two rows. The same record surfacing under two names is one row naming both. A clean result under one name says nothing about another: on one real scan five brokers had reported a person clean under their current name while each held a record under a former name.

**Decisions already made stay made.** The profile's `known_records` lists records the person has already looked at, each with a decision: `mine_left`, `mine_filed`, or `not_me`. A found record matching an entry, by the broker's own address where both have one, is reported with that decision and is not raised again as a near match. Where the entry has only a description, show it beside the record and ask whether it is the same one rather than deciding. When the person decides about a record that has no entry, append one in their words and say that you did: the broker, the record's address or a description written with values the profile already holds, today's date, the decision, and their reason. When the profile came as an attachment there is nothing to write to, so give them the entry to add. Nothing from that block goes in a log but the decision word.

**A block ends that broker.** It does not start a workaround. Move to the next broker and report the block plainly.

**Nothing is kept.** The scan reads a page and records one outcome per record found, or per broker and name where nothing was. Broker results are not saved, copied, summarized into a file, or reused. The one thing written back is a `known_records` entry the person decided on.

---

## Workflow

1. Read the profile. Confirm whose scan this is, in these words: **"This scan is for <profile name>. Confirm you are that person, or their authorized agent with them present."** Wait for the answer before the first search.
2. List the manifests directory and report the derived count. Every `.json` file directly inside it is one broker, and nothing else is: skip any file or folder whose name starts with `_`, which is where the smoke manifest lives and which is not a broker.
3. Build the list of names to search: `full_name`, then each entry in `aliases`. If the profile has no `aliases` or no `prior_addresses`, ask before the first search whether the person has gone by another name or lived somewhere else, and say why: the scan can only look for what the profile names, and a record under a former name or a prior city is a record of its own.
4. For each broker, in turn, and for each name in that list:
   1. **The name page, where there is one.** If the manifest has a `name_page` whose `shows` is `free_listing` or `teaser`, go to it at the most specific level the profile can fill and the site publishes, following `search-conduct.md` on how it may be reached. Read it and settle the outcome. A 404 at a level the site otherwise supports is `not_found` for that level, not an error. If `consent_modal` is true and a wall appears, stop there the way you would on a search page.
   2. **The search template, second.** If there is no name page, or its `shows` is `funnel`, or it did not load, resolve the placeholders in `search_url_template` and open it. One page load, at the pace of a person clicking.
   3. **The search box, third.** If the manifest carries a `use_search_box` step, or the template returned a 404 or a page that is plainly not a result page, use the box the site shows: type the name into it and run the search the way a person would. A template that has drifted is a finding worth reporting, not something to work around silently.
   4. If the page shows a CAPTCHA or a bot wall, record `not_assessable`, say which, and move on. Do not retry, and do not fall through to another door as a workaround. A block ends that broker.
   5. Read the visible results. Compare against the profile fields the manifest names in `find_listing.match_on` when it has one, otherwise name and state, and against every address in the profile, current and prior. A close record that is not plainly the person is a near match: check `known_records` first, then read `search-conduct.md` on near matches and let the person decide.
   6. Record each distinct record found as its own row, with the name that surfaced it and its known decision if it has one. Reduce by the broker's own address for the record: two cards at one address are one record, and two addresses are two records. Where nothing matched, record `not_found` or `not_assessable` once for that broker and name, with one short reason for `not_assessable`.
5. Report the table: one row per record found, and one per broker and name where nothing was. Offer to hand the found records, not the brokers, to `afaro-orchestrator`, and say which record under which name each one is. Leave out records marked `mine_left` or `not_me` unless the person asks.

---

## Failure patterns

- **A near match decided by the scan.** A close record is the person's to judge, in either direction. Brokers splice people, so a wrong birth year does not rule a record out and neither does a different city. Show what matches and what does not, and let them decide. Do not call it `found` on your own, and do not leave it out on your own.
- **A broker reported clean because one name came back empty.** A clean result under the current name says nothing about a former one. Search every name in the profile before a broker is reported clean.
- **Two records reported as one row.** Two listings at two addresses are two records even when the name matches, and each needs a request of its own.
- **A known record raised again.** A record listed in `known_records` is reported with its decision, not offered as a new near match.
- **A block treated as `not_found`.** A site that will not show results has not told you anything. That is `not_assessable`.
- **Retrying a blocked broker.** One attempt per broker per scan.
- **Reaching for a search API or a result URL pattern.** A broker's own published name-directory page is the one exception, under the four conditions in `search-conduct.md`. A result endpoint, a JSON path, and a profile URL built from an ID stay out under all of them.
- **Falling through to another door after a block.** A block ends that broker. Trying the name page because the search box was walled is a workaround, whatever it is called.
- **Scanning for a third party.** Stop and say Afaro runs for the person using it.

---

## Output format

A table, brokers in manifest order, with one row per record found and one per broker and name where nothing was:

| Broker | Record | Name searched | Outcome | Note |
|---|---|---|---|---|
| Example Broker | 1 | full_name | found | Listing matches name and current city |
| Example Broker | 2 | alias 1 | found | A second record, under the former name at prior address 1 |
| Example Broker | 3 | alias 1 | found | Known record, reviewed 2026-09-14: mine_left |
| Another Broker | | full_name | not_found | |
| Another Broker | | alias 1 | not_found | |
| Third Broker | | full_name | not_assessable | Bot wall on the search page |

Then one line: how many records were found, on how many brokers, out of how many brokers checked.

The run log gets the same outcomes in the redacted format the orchestrator uses: broker id, step, outcome, timestamp, and no profile values. A record is named by its number and the name field that surfaced it, never by its address, and a known record's line carries its decision word and nothing else from the entry.

---

## Reference files

- `references/search-conduct.md` - What counts as searching the way a person would, and what a block means. Read before the first search of a scan.
