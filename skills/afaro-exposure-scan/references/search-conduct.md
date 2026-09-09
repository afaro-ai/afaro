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

1. **The pattern is recorded in the manifest** in a `name_page` block, with a capture of the directory path a person clicks to reach it and the date that path was read. A pattern noticed in a live search is a lead. A pattern with a captured directory path behind it is provenance.
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

## One person only

Afaro scans for the person running it. If a request names somebody else, stop and say so. A family member runs their own copy, on their own machine, under their own account, with their own profile.
