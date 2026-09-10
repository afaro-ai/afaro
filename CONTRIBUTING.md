# Contributing to Afaro data removal

Afaro is a catalog. The code is small and mostly a validator; the value is in the broker manifests and in the fact that every one of them can be traced back to a page somebody actually looked at. Most of what follows exists to keep that true.

Read this before your first manifest. It is shorter than it looks.

---

## The one rule everything else serves

**A manifest describes what a capture shows, and nothing else.**

Not what the broker's help article says. Not what the flow looked like last year. Not what you remember. If a detail is not on the image you committed, either capture the page that shows it or leave it out and say you left it out.

This is not caution for its own sake. A manifest is instructions for typing a real person's details into a real form, and the person following them cannot check your work. The capture is how they can.

## Capture first, then write

Two commits per broker, in this order, and not one commit:

1. **Capture the broker's public opt-out page** and commit the image on its own, before any manifest content exists.
2. **Write the manifest from that image** and commit it second.

A single commit cannot show which came first. The two-commit shape is the record, and the place it lives is the branch and the pull request, because this repository squash-merges: on `main` the two collapse into one. So the order is checked while the pull request is open, and the reviewer is what makes it stick. If you are reading `main` and want to see it, the pull request is where to look.

Save captures as `manifests/captures/<id>-optout.jpg` or `.png`. Keep them readable: the whole opt-out section, every field label, and the button in one frame. A cropped image that cuts off the button is not evidence of a button.

If the page does not fit a screen, either view it zoomed out or capture it at two or three scroll positions and join them at those offsets in one visit. Say in the manifest's `notes` which you did. Same for hiding a fixed advertising container that sits across the form: allowed, and disclosed.

### Provenance fields

Every manifest carries three, and the validator refuses one that does not:

| Field | What it holds |
|---|---|
| `source_url` | The broker's public page the manifest was built from |
| `verified_on` | The date that page was read, `YYYY-MM-DD` |
| `source_capture` | Path to the committed image, relative to `manifests/` |

Two more carry the same weight where they apply. `additional_captures` lists further pages the manifest was written from, each with a description and a `blanked` flag saying whether values were painted out of it. All three of those are required, and the validator refuses an entry missing any of them. `name_page` records a broker's own name-directory page, and it takes two captures: the site's A-to-Z bar, which lists letters and names nobody, and the person's own name page from a real run, blanked like any run capture. The pattern goes in with its slugs as placeholders, read off that page's address. A capture of a directory letter page is not one of the two and never will be, because those pages list strangers by the hundred and blanking a list that long is not something a reviewer can check. A pattern you noticed in a search is a lead; until a broker has both captures its block stays absent.

**No stranger's name enters this repository, painted out or not.** That is the harder half of the rule and the one worth remembering: the blanking procedure exists for the person whose run it is, not as a way to admit other people's data by covering it up.

The captured page's own markup counts as visible on it. A CSS fallback in a selector, or the query string a visible search box submits, may be read from the markup of the page you captured, and the manifest says so. A page you did not capture, a help article, and anything you already knew are all out.

### Pages only a real run can reach

Most opt-outs run past their public page, and the second screen appears only after a real submission. Those pages are captured by the person whose run it is, every value of theirs is painted out with solid boxes before the file enters the repository, and the blanked image is committed and listed in `additional_captures`.

If a capture cannot be fully blanked, leave it out and say so. A page nobody has captured is a `handoff`, not a guess.

## One click per gate

A `human_gate` with reason `submit` is a real stop. After the click it approved, read the page. If nothing happened, stop and log it.

Do not click again. A submit that produces no page change is the site refusing, not a click that missed, and a second click is a second submission of the same form. There is no retry setting and there never was; a manifest that invents one is refused by name.

A gate is also a pause, and a person can act during a pause. Before making the click, check the page has not already moved.

## The redaction sweep, and its three edges

No real person's data enters this repository. The sweep is how that is checked rather than hoped for.

```
export AFARO_NAME_LIST=<path to your list>
npm run check:names
npm run hooks:install
```

Your list is a plain text file, one value per line, `#` for comments. It holds the names, addresses, phone numbers, and email addresses of the people whose profiles you work with. It lives beside those profiles, outside the working tree, and the sweep refuses a list that resolves inside the repository. A failure names the file, the line, and which list entry fired, by number, and never the value.

`npm run hooks:install` points git at `.githooks/`, which sweeps a commit message before the commit is written and every message on the branch before a push.

Three edges, and knowing which is which matters more than any of the machinery:

- **Tracked files and commit messages: the machine.** The sweep and the two hooks cover both. Continuous integration runs the tracked-file pass in its no-list mode, which prints a notice rather than pretending to have checked.
- **Pull request bodies: a person.** Nothing here reads them, and a body repeats findings, paths, and examples freely. A read-only review of the body is required before a pull request is opened.
- **Images: a person, always.** No sweep can read a screenshot. Every committed capture is opened and looked at, and every capture blanked from a real run is checked against the unblanked original by someone who did not do the blanking.

The reason to take the two human edges seriously: the first two values this project ever leaked were the same name, and the second one was written by the person who had just spent an hour removing the first. Whoever is closest to a value is the likeliest to carry it into the next thing they write.

## Running the checks

```
npm install
npm run validate        every manifest, against the schema and the provenance rules
npm test                the validator's own self-checks, and the sweep's
npm run validate:smoke  the one manifest that is not a broker
```

`npm run validate` derives the broker count from the directory. Nothing hardcodes a list of brokers, and nothing should.

Fixtures under `tests/fixtures/` are generated from `tests/fixtures/valid/example-broker.json`. After editing that file, run `node tests/make-fixtures.js` and commit the result; continuous integration fails if they have drifted.

Some fixtures are marked permanent in `tests/make-fixtures.js`. They encode a bypass that was once possible, and they stay so that a future change to the gate rules cannot quietly reopen it. Do not remove one to make a change pass.

## Running the smoke test

Before writing a manifest for a real broker, check the runtime actually walks one.

`manifests/_smoke/` holds a manifest that is not a broker. It drives a page checked into `tests/smoke/`, served on loopback by `npm run smoke`, and the page handles its own submission and makes no network request. So a whole run can be watched end to end without touching a real site.

`docs/smoke-test.md` is the runbook. It answers three questions: whether the skills are available, whether the steps run in manifest order, and where the profile can be read from.

## Proposing a broker

1. Open the broker's public opt-out page in one tab. Read it.
2. Capture it and commit the image on its own.
3. Write the manifest from the image. Run `npm run validate`.
4. Run `npm run check:names` with your list.
5. Open a pull request with the two commits, and say in the body what the page states and what it does not.

Say what you could not capture. A manifest that stops at a `handoff` and says why is worth more than one that covers the whole flow by guessing at the half nobody has seen.

Things that will send a manifest back: a selector whose label is not on the capture, a processing window that is not on the page, a step that would need a CAPTCHA solved or a bot wall worked around, and any value belonging to a real person anywhere in the diff.

## What Afaro will not do

These are not preferences and a pull request will not change them.

- No CAPTCHA solving, by any means.
- No working around a bot wall: no retries, no delays, no different URL, no request made outside the browser.
- No fabricated value to satisfy a form. If a required field is unknown, the run stops.
- No submission in guided mode without a clear yes from the person.
- No scraping, warehousing, or redistribution of broker data. The only data touched is the person's own listing.
- No removal guarantees anywhere in the copy.
