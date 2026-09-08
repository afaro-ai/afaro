# Manifests

One JSON file per broker, named `<id>.json`, validated against `../schema/optout.schema.json`. Captures live in `captures/`.

This directory is empty in pass 1. The first batch is written in pass 2.

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

## Ordering

The first batch is the ten non-LTVCO brokers named in the project brief. They are verified live and merged before any second-batch manifest is created. The second batch is authored last, in a separate commit, using the same schema and the same workflow, with no special handling and no extra comments.

## Captures

`captures/` holds one image per manifest. Keep them readable. A capture is the evidence that the manifest describes a real public page on a real date, so a cropped image that cuts off the form is not enough.
