# Search conduct

The constraint, stated once and not paraphrased anywhere else:

> Exposure-scan searches only through the broker's public search interface the way a person would: no direct result-endpoint URLs, no request rate beyond a human clicking, no retries on block. On any bot wall or CAPTCHA, stop and hand off.

## What that allows

- Loading the broker's own search page.
- Filling the search box the site shows, using the person's own details.
- Reading the results the site returns.
- Clicking a result link the page itself renders, when the manifest calls for it.

## What that rules out

- Building a result URL from a pattern instead of clicking the link.
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
