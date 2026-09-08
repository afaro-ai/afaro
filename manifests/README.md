# Manifests

One JSON file per broker, named `<id>.json`, validated against `../schema/optout.schema.json`. Captures live in `captures/`.

Manifests are added one broker at a time, each with its capture committed before the manifest is written. The count of brokers is whatever this directory holds; nothing hardcodes a list.

## The authoring rule

Every manifest is built from the broker's public opt-out page only.

1. Open the broker's opt-out page in a browser.
2. Capture the page. Save it as `captures/<id>-optout.png`.
3. Commit the capture.
4. Write the manifest from what the capture shows.

No step, field, selector, or note may describe anything that is not visible on the captured page. If the flow needs a detail the capture does not show, capture the page that does show it and reference that instead.

`source_url` is the page. `verified_on` is the date it was read. `source_capture` is the path to the capture, relative to this directory. The validator fails a manifest missing any of the three, and fails one whose capture file is not on disk.

## What the validator also enforces

- The filename matches the manifest `id`.
- `verified_on` is not in the future.
- A manifest that can send anything carries a `human_gate` step with reason `submit`, and the last `click` step comes after it.
- A broker requiring an ID, a notarized document, an account, or a payment has `method: manual` and no `fill_field` or `click` steps. Afaro does not automate those brokers.
- Every profile field the steps read is named in `profile_fields_required`.
- A step that fills a field from the listing has a `find_listing` step before it, because the listing URL does not exist until one has been found.

## Two fields for what a page did not say

A capture only proves what a page shows. These two record where a manifest had to go past it, so the skills do not present a choice of the author's as the broker's own.

- `recheck_after_days_from_page: false` means the page states no processing window and the number is a waiting period the author chose. `afaro-removal-verify` then says the broker gave no window instead of quoting the number as theirs.
- `person_finishes_on_site: true` means the steps stop before the broker's flow does, because the rest of that flow is not on the public opt-out page. `afaro-orchestrator` reports the broker as handed over rather than submitted, and no recheck is counted until the person says they finished.

Leave both out when neither applies. Absent means the number came from the page and the steps carry the request to the end.

## Captures

`captures/` holds one image per manifest. Keep them readable. A capture is the evidence that the manifest describes a real public page on a real date, so a cropped image that cuts off the form is not enough.
