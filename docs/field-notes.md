# Field notes

What real runs turned up, newest first. One entry per session.

This is not a changelog and not a release note. `docs/releases/` records what
shipped at a tag; this records what was learned between tags, which is mostly
brokers behaving in ways no page describes.

Every entry is the maintainer's account of runs on their own machines. Run
logs are local by design and never committed, so nothing here is checkable
against this repository the way a manifest is. Numbers of brokers, manifests
and checks are; these are not. No profile values, no run-log contents, and no
capture that a reviewer has not cleared.

---

## 2026-09-10, evening: twelve brokers, four people, and the limits of running it for somebody

Opt-outs are now filed for four people across two days, on every broker in
the catalogue except the two still blocked. The evening's filings ran against
twelve manifests rather than nine, which is worth its own line: the local
checkout was three brokers behind and two scans had already run against the
old set before anyone noticed. Pull before a sitting, and
check the manifest count in the first scan's output.

**Intelius is not a form.** It is a PeopleConnect account. The person proves
control of an email address the record already carries, follows a link, and
reaches a screen called Control whose dropdown sets the background report to
suppressed. Nothing is ever filled in with a name or an address. Their own
page states that one suppression covers Intelius, TruthFinder, Instant
Checkmate and US Search, which is the first case in this catalogue where one
filing clears several sites, and it is stated rather than inferred.

Two things fell out of that. The manifest now carries the catalogue's first
syndication note, cited to the capture the sentence is legible on. And an
existing account turns out not to be a suppression: one record already held a
date of birth under an old address while the report was still set to
displayed. Somebody who opened an account years ago and assumes they are
covered is not.

**A phone-verification gate cannot be answered by the operator.** Whitepages'
affirmation says the person is associated with the number being rung, so the
operator's own contact number is not an answer there, whoever is at the
keyboard. The person needs a number that is theirs and needs to be holding
it. The orchestrator says this at the gate now and stops the broker if there
isn't one, rather than offering a number that would make the affirmation
untrue.

**A shared inbox serves exactly one person.** Three brokers tie a request to
an email address not used before, so the second family member to try is
refused. One of them refused a shared address outright and a written request
went to their privacy team instead. The decision was to skip those brokers
for anyone without their own address rather than work around it, and the
install guide now says so. Giving each person an address of their own is the
single change that would unlock the most brokers in operator mode.

**Two brokers reached by letter rather than by form** this week, both under a
45-day statutory window: one whose form refused a shared address, and one
whose form was failing before its working route was found. That is a category
the catalogue can record but not drive, and it is the maintainer's to chase.

**Verification codes are a new kind of value to keep out.** Two run captures
were held back: one showed a code beside an email address, one a code beside
the operator's number. A code on a screenshot looks like page furniture
rather than like somebody's data, so it survives a blanking pass that catches
every name. Codes and one-time links are now named in the capture rules
alongside names, addresses, phones and emails.

Also learned, and not acted on: one broker's scan showed two result cards for
the same person, one without an age. They are treated as two listings until a
run proves they resolve to one profile URL.

---

## 2026-09-10, evening: the PeopleFinders door

**Six failed submissions across two days were one cause, and it was not an
outage.** The Record Suppression Form at the bottom of PeopleFinders'
opt-out page is the form the emailed link opens, rendered without the
one-time key that link carries. Submitted directly it returns the site's own
server error and greys out its own button. It can never succeed. Two of those
six attempts were typed by hand, which is how thoroughly it looks like a
broken site rather than a closed door.

The working route was a button at the top of the same page. Four opt-outs
were filed through it that evening, each person answering their own gates.

The rule that came out of it is in the authoring guide now: try every control
on the page before recording a broker as having no route. A broker whose form
is broken and a broker whose door is somewhere else look identical from the
form.

Two details no page states. The emailed link is single-use, so opening it to
see what it looks like expires it and a new one has to be requested. And the
State/Region box on that form is a dropdown with 55 options wearing a class
called `text-input`, so it renders like a plain box and anything that types
into it is typing into a select.

A written request under the Colorado Privacy Act had already gone out that
afternoon describing the lower form's failure. It stands as sent and
accurately described what happened, but the circle had a door, so it is not
grounds for escalating against this broker.

---

## 2026-09-10, afternoon: a maintainer's own rescan, and which values match a listing

A scan of the maintainer's own name came back listed on three of nine. He had
opted out of the top brokers by hand years ago and does not recall which, so
the reading is coarse but real: over a multi-year window some removals held
and some did not. A later six-broker rescan came back clean on three sites
while both parents were listed on all three, same household and address,
which is the same finding from the other side.

Two near matches, different middle name and different relatives and different
age, were correctly judged not him and left alone.

**A profile holds two kinds of value and they are often not the same.** The
address and phone a broker lists somebody under are frequently not the ones
that reach them, and for anyone who has moved they usually are not. The skill
asked which to use rather than picking, which is an earlier finding working
one broker wider. What changed here is guidance: `phones`, `prior_addresses`
and `aliases` are the listing side and are allowed to be stale, because the
listing is stale; `contact_email` and `contact_phone` are the side that
reaches somebody who is sitting there.

One broker states no processing window at all, so its recheck uses Afaro's
own 30-day default, and the run says out loud that the 30 is Afaro's number
and not the broker's. By that evening a second broker had joined it.

---

## 2026-09-10, morning: a second family member, and an alias that matters

A scan for one person returned listings only under their full name; the short
name everybody calls them returned a different person entirely. That is live
evidence for searching aliases and for matching on more than a name, and it
is the kind of thing a catalogue cannot learn from a page.

Seven brokers came back as not assessable in an earlier scan, and four of
those seven were nobody's fault but the setup's: the browser extension is
permitted per website, and four of those sites had never been allowed.
Nothing was blocking the tool on those four. The install guide now says this
before the first scan, because a run of unassessable sites reads exactly
like a run of site defences, and here more than half of one was.

The three that genuinely were defended that morning stayed defended: two
behind terms dialogs and one behind a human-verification check. One of the
three came off that list the same evening, when its opt-out turned out to run
through an account rather than through the search. They still have no
manifest steps for those dialogs, because nobody has captured them.

---

## 2026-09-09: the first filings, and what a page says versus what it does

The first opt-outs filed end to end, and the first evidence that a manifest
can be right about a page and wrong about a flow.

**A gate approves one specific filled form.** If the page changes during the
pause, the yes no longer applies to what is on screen: fields emptied, a
reload, a different listing. The rule that came out of it is to refill and
gate again, never to refill and click, because refilling on the grounds that
the values are the same substitutes the tool's judgment for the person's on
the one question they are there to answer.

**Some bot checks clear themselves.** The box ticks itself and the page moves
on. The run says so anyway: a person who is told the tool met a bot check and
got past it knows what happened on their own machine, and a person told
nothing has no way to tell that from a tool quietly working around one.

**A confirmation page can end in an advertisement.** One ends with a link to
a paid removal service. It is never followed.

**A phone box on a removal form is not obviously one thing.** It may locate
the record or it may reach the person, and one emailed form got the contact
number because that was the likelier reading of a page nobody had captured.
The likelier reading is still a guess. Where a capture does not settle it,
the run asks which number to use and never picks.
