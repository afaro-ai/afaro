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

**Crop to the claims, not to the tidy frame.** A frame that ends on a clean edge is worth nothing if a sentence the manifest cites falls outside it. Three manifests written in one pass each carried a claim their own capture refused: two said the page states things the frame had stopped just short of, and all three said the page states no relationship to any other site while the frame said in as many words that the data comes from elsewhere. So read every claim in the manifest against the image before you commit either one. A true claim the image cannot support is an unproven claim, and to a stranger it reads exactly like one copied from somewhere else.

### Provenance fields

Every manifest carries three, and the validator refuses one that does not:

| Field | What it holds |
|---|---|
| `source_url` | The broker's public page the manifest was built from |
| `verified_on` | The date that page was read, `YYYY-MM-DD` |
| `source_capture` | Path to the committed image, relative to `manifests/` |

Two more carry the same weight where they apply. `additional_captures` lists further pages the manifest was written from, each with a description and a `blanked` flag saying whether values were painted out of it. All three of those are required, and the validator refuses an entry missing any of them. `name_page` records a broker's own name-directory page, and it takes two captures: the site's A-to-Z bar, which lists letters and names nobody, and the person's own name page from a real run, blanked like any run capture. The pattern goes in with its slugs as placeholders, read off that page's address. A capture of a directory letter page is not one of the two and never will be, because those pages list strangers by the hundred and blanking a list that long is not something a reviewer can check. A pattern you noticed in a search is a lead; until a broker has both captures its block stays absent.

**A verification code or a one-time link never enters this repository**, blanked or otherwise. They sit in the same list as names, addresses, phone numbers and email addresses, and they are worse in one way: a code on a screenshot looks like furniture rather than like somebody's data, so it survives a blanking pass that catches every name. Two captures from real runs were held back for this, one showing a code beside an email address and one showing a code beside the operator's number. A single-use link is the same thing written as a URL. If a screen you need carries one, the honest options are to crop it out or to leave the screen uncaptured and say so.

**No stranger's name enters this repository, painted out or not.** That is the harder half of the rule and the one worth remembering: the blanking procedure exists for the person whose run it is, not as a way to admit other people's data by covering it up.

### Which side of the form a value comes from

A profile holds two kinds of value and the difference decides what a step may read.

- **What brokers list the person under.** `phones`, `prior_addresses`, `aliases`, an old `current_address`. These match a listing. They are frequently out of date, and that is the point: a listing is out of date too.
- **What the person can actually answer.** `contact_email` and `contact_phone`. These reach somebody who is sitting there.

They are often not the same, and for anyone who has moved they are usually not. A step that fills a contact box from the listing side sends a code to a handset nobody is holding; a step that matches a listing from the contact side finds nothing. The validator holds a marked field to its source, and the next section is about the box where that marker is easiest to leave off.

### The two phone boxes

A phone box on a broker's form is one of two things, and the difference decides whose handset rings.

- **A number the broker will call or text**, to check it is really you. That comes from `contact_phone`, and the fill step carries `phone_field: "contact"`.
- **The number as it stands on the listing** being removed, which is how the right record gets found. That comes from `phones`, and the fill step carries `phone_field: "listing"`.

The validator holds each to its source once the marker is there. What it cannot catch is the marker missing: a fill from `phones` with no `phone_field` passes, and if that box was a verification field the call goes to the person whose listing it is, who in operator mode may be in another house and not expecting it.

So read the page before you write the step. **Only mark it where the captured page says which it is**, and where the page does not say, leave the marker out and put the reason in a note. Two manifests carry a marker today, one of each kind, and a third names `phones` among its required fields with no phone step at all because the form that asks for one arrives by email and nobody has captured it. That third one says so in its notes, which is the shape to copy when a page has not told you.

The captured page's own markup counts as visible on it. A CSS fallback in a selector, or the query string a visible search box submits, may be read from the markup of the page you captured, and the manifest says so. A page you did not capture, a help article, and anything you already knew are all out.

### Pages only a real run can reach

Most opt-outs run past their public page, and the second screen appears only after a real submission. Those pages are captured by the person whose run it is, every value of theirs is painted out with solid boxes before the file enters the repository, and the blanked image is committed and listed in `additional_captures`.

If a capture cannot be fully blanked, leave it out and say so. A page nobody has captured is a `handoff`, not a guess.

**Where that check cannot be performed, do not commit the capture at all.** A blanked run capture has to be checked against its unblanked original by a second reviewer, and for some flows that original can never be in this repository: a broker whose opt-out runs through an account puts the identity the account belongs to on every screen. A reviewer can say nothing legible survives; nobody without the original can say the blanking covered everything. A frame nobody can clear is worth less than a plain sentence saying the knowledge came from a run, so write the sentence and leave the image out.

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
npm test                the validator's self-checks, the sweep's, and the skill-text checks
npm run validate:smoke  the one manifest that is not a broker
npm run brokers:table   rewrite the README's broker table from manifests/
npm run brokers:check   fail if that table is out of date, which is what CI runs
```

If you add or change a manifest, run `npm run brokers:table` in the same commit. The table in the README is generated, CI checks it, and nothing between its markers is edited by hand. The block under it about runs is the opposite: hand-written, unchecked, and not yours to update unless you made the run.

The skill-text checks are literal on purpose. A few rules are about what happens on a page at run time and cannot be expressed in a schema, so the only place they live is the instructions a skill reads. The test looks for short distinctive phrases so a rewording that keeps a rule passes and one that loses it fails. If it fails and the rule genuinely moved, update the phrase in the same commit and say so.

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

**Try every control on the page before you record a broker as having no route.** Not only the form: the buttons above it, the links beside it, anything that changes what the page shows. One broker in this catalogue was written off as a closed circle after six submissions failed across two days, and the working route was a button at the top of the same page. The form that kept failing was the right form rendered without a key that arrives by email, so it could never have worked, and nothing on the page said so. A broker that looks broken and a broker whose door is somewhere else look identical from the form.

**A broker enters through its own opt-out page and no other door.** Seeing one named in an advertisement, or linked from another broker's results, or listed on somebody's roundup, tells you a name exists. It is a lead, not provenance, and it says nothing about what that site's opt-out page asks for. Open the page yourself, capture it, and write from that. A manifest that started as a sighting reads exactly like one that started as a page, which is why the rule is about where you went rather than how careful you were.

Say what you could not capture. A manifest that stops at a `handoff` and says why is worth more than one that covers the whole flow by guessing at the half nobody has seen.

Things that will send a manifest back: a selector whose label is not on the capture, a processing window that is not on the page, a step that would need a CAPTCHA solved or a bot wall worked around, and any value belonging to a real person anywhere in the diff.

## Contribution terms

Contributions are accepted under the MIT license in `LICENSE`. By opening a pull request you agree your work goes in under those terms.

The capture rule is part of those terms, not a style preference: public opt-out pages only, included only so a reader can verify the manifest against the page it was built from, and no stranger's name in any image or file.

## What Afaro will not do

These are not preferences and a pull request will not change them.

- No CAPTCHA solving, by any means.
- No working around a bot wall: no retries, no delays, no different URL, no request made outside the browser.
- No fabricated value to satisfy a form. If a required field is unknown, the run stops.
- No submission in guided mode without a clear yes from the person.
- No scraping, warehousing, or redistribution of broker data. The only data touched is the person's own listing.
- No removal guarantees anywhere in the copy.
