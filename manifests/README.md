# Manifests

One JSON file per broker, named `<id>.json`, validated against `../schema/optout.schema.json`. Captures live in `captures/`.

Manifests are added one broker at a time, each with its capture committed before the manifest is written. The count of brokers is whatever this directory holds; nothing hardcodes a list.

## The authoring rule

Every manifest is built from the broker's public opt-out page only.

1. Open the broker's opt-out page in one browser tab.
2. Capture the page. Save it as `captures/<id>-optout.png`, or `.jpg`.
3. Commit the capture on its own, before any manifest content is written. That commit is what shows the capture came first.
4. Write the manifest from what the capture shows, and commit it second.

Two commits per broker, capture then manifest, is the rule and not a preference. A single commit cannot show which came first.

No step, field, selector, or note may describe anything that is not visible on the captured page. If the flow needs a detail the capture does not show, capture the page that does show it and reference that instead.

The captured page's own markup counts as visible on it. A css fallback in a selector, or the query string a visible search box submits, may be read from the markup of the page that was captured, and the manifest says in its `notes` or a step `note` that this is where the value came from. Nothing else does: a page you did not capture, a help article, and anything you already knew about the broker are all out.

`source_url` is the page. `verified_on` is the date it was read. `source_capture` is the path to the capture, relative to this directory. The validator fails a manifest missing any of the three, and fails one whose capture file is not on disk.

## Pages only a real run can reach

Most opt-outs run past their public page. The second screen and everything after it appears only once a real listing has been submitted, so nobody can capture it from the outside, and the first two manifests stopped at the public page for that reason.

The way past it is the same rule with one more step in front. A page reachable only inside a real run is captured by the person whose run it is, every value of theirs is painted out before the file enters the repository, and the blanked image is committed and listed in `additional_captures`:

```json
"additional_captures": [
  { "path": "captures/example-step2.jpg", "of": "Step 2 of 5, reached in a person's run on 2026-09-09", "blanked": true }
]
```

The validator fails a manifest naming a capture that is not on disk, and fails one that lists its `source_capture` again. What does not change: steps written from those pages are written from the blanked images and nothing else, and a page nobody has captured yet is a `handoff`, not a guess.

Blanking is solid boxes over every value belonging to the person: name, address, phone, email, and any code or reference the page printed. The unblanked originals never enter the repository, not even in a commit that is later amended. They are staged in `incoming/`, which is ignored, and that folder is deleted once the blanked files are committed.

A fact stated only on a page nobody has captured, such as a processing window printed on an acceptance screen, is not written as though a capture backed it. Say in `notes` where it came from and that no capture exists yet.

## What the validator also enforces

- The filename matches the manifest `id`.
- `verified_on` is not in the future.
- A manifest that can send anything carries a `human_gate` step with reason `submit`, and the last `click` step comes after it.
- A broker requiring an ID, a notarized document, an account, or a payment has `method: manual` and no `fill_field` or `click` steps. Afaro does not automate those brokers.
- Every profile field the steps read is named in `profile_fields_required`.
- No field is filled after the last submit gate, because the person approved the values they were shown.
- A step that fills a field from the listing has a `find_listing` step before it, because the listing URL does not exist until one has been found.
- A `handoff` is the last step, and there is at most one.
- A null `recheck_after_days` pairs with `recheck_stated: false`, and neither appears without the other.
- Each page of a multi-page flow carries its own submit gate, and between two gates something is clicked. A gate with no send behind it asks for approval of nothing.
- The click that places a verification call sits behind the `phone_verify` gate, never in front of it.
- An `accept_terms` step comes before anything is filled and before the submit gate, because a consent dialog stands in front of the flow rather than inside it.
- A `fill_field` that lists the `choices` the page offers fills one of them and nothing else.
- Every capture named in `additional_captures` is on disk.

## Where a page stops short

A capture only proves what a page shows. Two things record where the page ran out, so no skill presents a choice of the author's as the broker's own.

- **The broker states no processing window.** `recheck_after_days` is `null` and `recheck_stated` is `false`. The orchestrator then waits 30 days and says that 30 is Afaro's number, not the broker's. Leave both out when the page does state a window; absent means the number is the broker's own.
- **The broker's flow goes further than its public page showed.** The manifest ends on a `handoff` step carrying a `reason`: `page_not_captured`, `requires_listing_url`, or `requires_email_link`. The outcome for that broker is `handed off at step N`, never submitted, and no recheck clock starts until the person says they finished. A handoff is terminal: one per manifest, nothing after it.

Both exist so the README's claims stay true when a broker does not fit. Neither is a way to describe a flow nobody has seen.

## Captures

`captures/` holds one image per manifest. Keep them readable. A capture is the evidence that the manifest describes a real public page on a real date, so a cropped image that cuts off the form is not enough.
