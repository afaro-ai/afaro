# Search conduct

The constraint, stated once and not paraphrased anywhere else:

> Exposure-scan searches only through the broker's public search interface the way a person would: no direct result-endpoint URLs, no request rate beyond a human clicking, no retries on block. On any bot wall or CAPTCHA, stop and hand off.

## What that allows

- Loading the broker's own search page.
- Filling the search box the site shows, using the person's own details.
- Reading the results the site returns.
- Clicking a result link the page itself renders, when the manifest calls for it.

## Name-directory pages, the one carve-out

Most brokers publish name-directory pages: static pages keyed by a name, and sometimes a state or a city, that the site puts out for search engines and public linking. They are reached from an A-to-Z bar in the site's own footer, and they show the same free listing the search results would, without the funnel and sometimes without the consent wall.

A page like that may be opened from its pattern rather than clicked to, under four conditions, all of them:

1. **The pattern is recorded in the manifest** in a `name_page` block, with two captures behind it and the date they were read. The first is the site's own A-to-Z bar, which lists letters and names nobody. The second is the person's own name page, reached in a real run and blanked the way every run capture is. The pattern is read from that page's own address and written into the manifest with the slugs put back as placeholders, so no name reaches the manifest or the log.

   A capture of a directory letter page is not one of the two and cannot become one. Those pages list strangers by the hundred, and a promise to have blanked a thousand names is not something a reviewer can check. No stranger's name enters this repository, painted out or not.

   A pattern noticed in a live search is a lead. Until a broker has both captures its block stays absent.
2. **Only the profile's own names go into it.** One person, the names they have used, the places they have lived. No enumeration, no walking a letter, no list of anybody else.
3. **One request per page, at the pace of a person.** No retries. A bot wall or a funnel ends that broker as `not_assessable`, the same as anywhere else.
4. **Result endpoints stay banned.** No JSON or XHR path, no API-shaped URL, no profile-detail page built from an ID. Those are what reads as scraping and what gets a session blocked, and none of them is a page a site publishes to be linked to.

The test, when it is not obvious: **would a search engine show this URL to a person.** A surname directory page, yes. A results endpoint with a session token, no.

The carve-out exists because the ban was written against constructed result URLs, and a page the broker publishes for crawlers is not one. It is not a way to reach anything else.

## What that rules out

- Building a result URL from a pattern instead of clicking the link, except for the name-directory pages carved out above.
- Calling a JSON or XHR endpoint the page uses internally.
- Loading pages faster than a person would work through them.
- Retrying anything after a block, with or without a delay.
- Changing headers, user agent, or session details to look like a different visitor.
- Using a proxy, a cache, or a third party to fetch a page the browser was refused.

## When a page blocks

Record `not_assessable`, note whether it was a CAPTCHA or a bot wall, and go to the next broker. Tell the person at the end which brokers could not be assessed and that they can check those by hand in their own browser.

A block is information. It is not a problem to solve.

## Whose scan this is

Afaro scans for one person at a time, and that person is either the one running it or somebody who has asked them to. Two cases, and nothing else.

**The person themselves.** They run it on their own machine, under their own account, with their own profile.

**An operator acting for them.** One person can run Afaro for a relative who has no account of their own, as their authorized agent, with a signed authorization kept beside that person's profile file. **They have to be present while it runs.** The scan is about them, the outcome is theirs to read, and a step that needs them cannot be answered by somebody else.

Confirm which of the two before the first search, in the words the skill gives, and wait for the answer. A request to scan somebody who has not asked and is not there is neither case: stop and say so.

One profile per scan either way. Never search two people in one run, and never carry a name from one person's scan into another's.

Every rule above about conduct holds the same in both cases. Acting for somebody does not buy a faster pace, a retry after a block, or a door the doctrine does not allow.
