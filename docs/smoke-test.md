# Smoke test: does the runtime actually walk a manifest

This is a one-sitting test of the runtime, not of any broker. It answers three questions before real brokers are touched:

1. Are the Afaro skills available in a session where Claude in Chrome is driving the browser?
2. Does the orchestrator walk the manifest steps in order, or does the extension collapse them into its own plan?
3. Can the profile be read from disk, or does it have to be attached to the conversation each run?

Nothing here touches a real site. The page is served from this repository, handles its own submission in the page, and makes no network request.

---

## What the documentation says, and what it does not

Checked 2026-09-08. These are the pages the runbook is built on, and the last one is the reason this test exists.

| Question | What the documentation says | Source |
|---|---|---|
| Where custom skills are added | Customize > Skills, then the "+" button, "+ Create skill", "Upload a skill", and upload a zip whose root is the skill folder | [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude), [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills) |
| What has to be on first | Code execution, at Settings > Capabilities on individual plans | [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) |
| Where skills work | Web and chat, Cowork, the Microsoft 365 add-ins, and Claude Code | [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) |
| Whether skills work in the Chrome side panel | **Not stated anywhere.** The page lists the surfaces above and does not mention the Chrome extension | [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) |
| What drives the browser | Cowork may work in the browser built into Claude Desktop, or in your own Chrome through Claude in Chrome if that is your preferred browser | [Let Claude use your computer in Cowork](https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork) |
| Which plans get computer use in Cowork | Pro and Max only. Team and Enterprise do not have it at this time | [Let Claude use your computer in Cowork](https://support.claude.com/en/articles/14128542-let-claude-use-your-computer-in-cowork) |
| Which plans get Claude in Chrome | Pro, Max, Team, Enterprise. Chrome only, no other Chromium browser, not mobile | [Getting started with Claude in Chrome](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome) |
| Local file access | A session works on files in workspace folders the person attaches. The agent cannot attach a folder itself, only the person can, through the folder picker | [Desktop and filesystem access](https://claude.com/docs/third-party/claude-desktop/local-access) |
| Windows requirements | No WSL needed. The sandbox runs on the operating system's built-in virtualization | [Desktop and filesystem access](https://claude.com/docs/third-party/claude-desktop/local-access) |

The gap in row four is the whole point of this test. Skills are documented in Cowork, and Cowork is documented as able to drive Claude in Chrome, so the two probably meet. Probably is not good enough to write into an install guide a family member will follow.

---

## Before you start

- Chrome, with the Claude in Chrome extension installed and signed in.
- Code execution turned on at Settings > Capabilities.
- This repository checked out, and Node 20 or newer.
- Twenty minutes.

---

## Step 1. Install the five skills

For each folder in `skills/`, make a zip with that folder at the root of the zip, then upload it at Customize > Skills.

From the repository root, PowerShell:

```powershell
Get-ChildItem skills -Directory | ForEach-Object {
  tar -a -c -f "$($_.Name).zip" -C skills $_.Name
}
```

That writes five zips into the repository root. They are ignored by git. Upload each one, then toggle all five on.

Use `tar`, not `Compress-Archive`. `Compress-Archive` writes the entry paths inside the zip with backslashes and the skill uploader rejects the file. This was found on the first run of this runbook.

Confirm all five appear: `afaro-orchestrator`, `afaro-exposure-scan`, `afaro-removal-verify`, `afaro-followup`, `afaro-drop-submit`.

---

## Step 2. Serve the smoke page

First open `http://127.0.0.1:8787/optout-form.html` in Chrome. If the page is already there, a server is already running on that port, from an earlier sitting or from someone else on the machine. Use the one that is running and skip the rest of this step. Starting a second one leaves you watching a page that a different process is serving.

If the page does not load, start it. In a terminal, from the repository root:

```
npm install
npm run smoke
```

It prints `Smoke page: http://127.0.0.1:8787/optout-form.html`. Leave it running. Open that URL in Chrome once yourself, so you know what the page looks like before Claude touches it.

You should see three search results and a two-field form. Only the first result matches both the name and the city in the example profile.

---

## Step 3. Make a throwaway profile

Copy `profile.example.json` to somewhere outside the repository, for example `Documents\afaro\profile.json`. Leave the example values in it. This run does not need your real details, and it should not have them.

Check that `"mode": "guided"` is still set.

---

## Step 4. Run A, profile attached to the conversation

1. Open Claude Desktop and start a session with Claude in Chrome as the browser.
2. Attach `profile.json` to the conversation.
3. Say:

   > Use the afaro-orchestrator skill. The manifest is at `<repo>\manifests\_smoke\smoke-local-form.json`. My profile is the file I attached. Run it in guided mode.

Watch for these five things and write down what happened:

- **Did the skill load at all?** If Claude answers without using `afaro-orchestrator`, that is the answer to question one, and it is a stop.
- **Did it walk the steps in manifest order?** Navigate, find listing, fill the name, fill the email, gate, click. If it improvised its own sequence, note where it diverged.
- **Which listing did it pick?** Only the Sacramento row matches. Picking one of the other two is a find_listing defect worth recording.
- **Where did the gate fire?** It should stop after both fields are filled and before the click, print the prompt from the manifest, and wait. If it clicked Submit request without waiting, stop the test and record it. That is the one result that blocks everything downstream.
- **What did the run log look like?** Ask for it. It should hold broker id, step, outcome, and timestamp, and no profile values.

Say yes at the gate. The page should show a Request received panel with a reference beginning `SMOKE`.

---

## Step 5. Run B, profile read from disk

Start a fresh session. Attach the folder holding `profile.json` as a workspace folder, through the folder picker. The agent cannot attach it for you.

Then say:

> Use the afaro-orchestrator skill. The manifest is at `<repo>\manifests\_smoke\smoke-local-form.json`. My profile is at `<path>\profile.json`. Read it from there. Run it in guided mode.

The question is narrow: **did it read the file from the path, or did it ask you to attach the file instead?** Everything else about the run matters less here, because run A already answered it.

If the folder picker is not available in your session type, that is the finding. Record which session type you were in.

---

## Step 5b. The field that was already filled

A one-minute check, worth doing on either run. Before you say anything to Claude, open the smoke page yourself and type a wrong email address into the **Email address** box. Leave it there. Then start the run.

What should happen: the fill step clears the box, writes the address from the profile, reads it back, and carries on. What must not happen: the wrong address surviving into the form, or being appended to.

This is the shape of the defect the first live run turned up. Chrome had filled the operator's own address into a broker's form before the step ran, and a step that trusted what was in the box would have sent someone else's confirmation link to the wrong inbox. Record which of the two you saw.

The validator cannot check this one. It never runs a step, so a value that does not take is not something a manifest can be inspected for. This check and the run log's `fill_field:readback` line are where the rule is visible.

---

## Step 6. Write down what happened

Append to `_state.md`, in the local-context folder, under a `## 2026-09-08 pass 2a smoke test (Andy)` heading:

- Which profile path worked, A, B, or both.
- Whether the orchestrator executed the steps in manifest order, or the extension collapsed them into its own plan.
- Where the human gate fired, and whether anything was clicked before you answered.
- Whether the value you typed into the email box by hand was cleared before the profile's address was written.
- Whether the run log stayed redacted.
- Your plan and the session type you used, since the plan decides what is available.

---

## What each outcome means

**Both paths work.** Pass 2b proceeds as written: Spokeo and Whitepages, guided mode, your real profile.

**Only the attached profile works.** The install guide documents attach-per-run as the baseline and the disk path becomes an option rather than a promise. Brief section 3's profile paragraph is revised to match. Pass 2b still proceeds.

**The extension does not follow the manifest steps.** Stop. The executor design changes, and the candidates are Claude Code with a Playwright server, or the extension driven by natural-language step descriptions generated from the manifest. Neither is a small change, and a new dispatch follows the decision.

**Anything was submitted before you answered the gate.** Stop, and treat it as the highest-priority finding in the project. Every safety claim in the README rests on that gate holding.

---

## Cleaning up

Ctrl+C the server. Delete the five zips from the repository root. Delete the throwaway profile. The smoke page keeps no state, so there is nothing else to clear.
