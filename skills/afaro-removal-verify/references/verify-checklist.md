# Recheck checklist

Work through this once per broker that is due.

## Before the check

- [ ] The broker was actually filed. A run that ended on a `handoff` filed nothing, so the date comes from the person saying they finished the flow, and without that the broker is not due.
- [ ] The submission date for this broker is recorded, not assumed.
- [ ] Today is on or after submission date plus `recheck_after_days`, or plus 30 days when `recheck_stated` is false and there is no number to add.
- [ ] The manifest's `verification` block has been read, including `success_when`.
- [ ] The profile fields the check needs are present.

## During the check

- [ ] The broker's own search page or status page was opened in the browser.
- [ ] No result URL was constructed, and no internal endpoint was called.
- [ ] One attempt. A block ends the check for this broker.
- [ ] The page was read as it appears to a person, including any note the broker shows about pending requests.

## Reading the result

- [ ] `removed` only when the page matches `success_when`.
- [ ] `still_listed` when the listing is there, in any form.
- [ ] `not_assessable` for a CAPTCHA, a bot wall, an error page, or a page that would not load.
- [ ] A partial listing, with fewer fields than before, is `still_listed`.
- [ ] A listing under a variation of the name, matching the same person, is `still_listed`. Note the variation so the manifest's `match_on` can be revisited.

## After the check

- [ ] Outcome recorded in the redacted log: broker id, step, outcome, timestamp.
- [ ] Next recheck date set, including for brokers that came back `removed`.
- [ ] Anything `still_listed` handed to `afaro-followup` with what the page showed.
- [ ] Nothing was promised about the future state of any listing.

## What to tell the person

Say what the page shows today and what happens next. A removal that worked can be undone by the broker's next data refresh, which is why every removed broker still gets a next date.
