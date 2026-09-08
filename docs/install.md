# Setting up Afaro data removal

This guide is for someone who has not installed anything like this before. It takes about twenty minutes. You do not need to know how to code.

Everything below was checked against Anthropic's own documentation on 2026-09-08. Apps change. If a menu is not where this guide says, look for the nearest thing with the same name and tell whoever gave you this guide.

---

## Step 1. What you need

Three things.

1. **A paid Claude plan.** Pro, Max, Team, or Enterprise. Afaro needs the Claude in Chrome extension, and that extension is only available on paid plans.
2. **Google Chrome.** Not Edge, not Brave, not Safari, and not a phone. The extension only runs in Chrome on a computer.
3. **About twenty minutes**, once, plus a few minutes each time you run a removal later.

You do not need to buy anything else. Afaro is free and there is no account to make.

---

## Step 2. Install the Claude in Chrome extension

1. Open Chrome.
2. Go to the Chrome Web Store and search for Claude in Chrome.
3. Click **Add to Chrome**.
4. Sign in with your Claude account.
5. Pin the extension so you can see it, and accept the permissions it asks for.

This extension is what lets Claude click and type on a web page for you, in your own browser, while you watch.

Reference: [Getting started with Claude in Chrome](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome).

---

## Step 3. Turn on file creation

Afaro's skills need Claude's code execution and file creation setting turned on.

1. Open Claude's settings.
2. Find the setting for creating and editing files, and turn it on.

If you are on a Team or Enterprise plan and cannot find it, your organization's owner controls it.

Reference: [Create and edit files with Claude](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude).

---

## Step 4. Add the Afaro skills

Afaro is five skills. You add each one the same way.

1. Download the Afaro files to your computer.
2. For each folder inside `skills/`, make a zip file of that folder. The folder itself has to be at the top of the zip, not inside another folder.
3. In Claude's settings, find **Skills**, then **Add**, and upload the zip.
4. Turn the skill on.
5. Repeat for the other four.

The five are `afaro-orchestrator`, `afaro-exposure-scan`, `afaro-removal-verify`, `afaro-followup`, and `afaro-drop-submit`.

One thing worth knowing: skills you add in the Claude app are yours alone, and they do not carry over to other places Claude runs. If you use Claude somewhere else too, you would add them there separately.

Reference: [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills).

---

## Step 5. Make your profile

Your profile is one small file with the details brokers list about you. It lives on your computer, in a folder you pick. It is the only place your information is written down.

1. Find `profile.example.json` in the Afaro files.
2. Copy it somewhere you will remember, such as your Documents folder, and name the copy `profile.json`.
3. Open it in any text editor and replace the example details with your own.

What goes in it: your full name, any other names you have gone by, your date of birth, your current address, addresses you have lived at before, your phone numbers, your email addresses, the state you live in, and the relatives brokers tend to list next to you.

Why previous addresses and relatives: that is how the brokers connect their records, and how you tell which listing is yours.

Leave `"mode": "guided"` as it is. Guided means Claude stops and asks you before it sends anything.

---

## Step 6. Know what happens to your data

Read this part before you start.

- Your profile file stays on your computer. Afaro has no server, no account, and nowhere to send it.
- When you run a removal, Claude reads your profile as part of the conversation, and that conversation goes to Anthropic's systems the way any Claude conversation does. That is how Claude works, and it is true of anything you type into Claude.
- Afaro's own records of a run hold only the broker's name, the step, whether it worked, and the time. They never hold your name, address, phone number, or anything else about you.
- Nobody else's information belongs in your profile. Afaro removes listings for the person using it. A family member runs their own copy with their own file.

---

## Step 7. Your first run

1. Open Chrome and start a Claude conversation with the extension active.
2. Say: **run an Afaro exposure scan**.
3. Claude asks where your profile is. Tell it, or attach the file to the conversation.
4. Claude opens each broker's own search page and tells you which ones list you. It does not send anything in this step.
5. When you are ready, say: **run the Afaro opt-outs for the brokers that found me**.

From then on Claude works one broker at a time and stops at every point where you are needed. You will see the filled-in form before anything is sent, and it waits for you to say yes.

It also stops if a site shows a puzzle to prove you are human, puts up a block, asks for a photo of your ID, or wants to text you a code. Those are yours to do. Claude will not try to get around any of them.

---

## Step 8. What to expect afterwards

Removals take time. Each broker states its own window, usually one to six weeks, and Afaro tracks it for you.

Some removals do not work the first time. Some listings come back later, because brokers rebuild their records from public sources. Afaro rechecks on a schedule and tells you what it finds. Nobody can promise a listing stays gone.

Some brokers will not take a request through a form at all. They want a photo of an ID, a notarized document, an account, or a fee. Afaro will not do any of those for you. It hands you a short note saying exactly what that broker wants and where to do it, and you decide whether it is worth it.

---

## If something goes wrong

- **Claude says it cannot find a field on a form.** The broker changed the page. That is expected over time. Tell whoever maintains your copy of Afaro which broker it was.
- **A site blocks the browser.** Afaro stops there on purpose. You can go to that site yourself and use its opt-out form by hand.
- **Claude does not seem to know about Afaro.** Check the skills are switched on in settings, and that you are in a conversation with the Chrome extension active.
- **You are not sure whether something was sent.** Ask Claude to show the run summary. It lists every broker and what happened.
