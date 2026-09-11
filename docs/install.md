# Setting up Afaro data removal

This guide is for someone who has not installed anything like this before. It takes about twenty minutes. You do not need to know how to code.

Everything below was checked against Anthropic's own documentation on 2026-09-08, and the setup was run end to end on a Windows machine on the same day. Apps change. If a menu is not where this guide says, look for the nearest thing with the same name and tell whoever gave you this guide.

---

## Step 1. What you need

Three things.

1. **A Claude Pro or Max plan.** Afaro runs in Cowork and needs Claude's computer use, which is what lets Claude work in a browser for you. Computer use in Cowork is on Pro and Max only. Team and Enterprise do not have it at this time, so those plans cannot run Afaro even though they can install the extension.
2. **Google Chrome, with the Claude in Chrome extension installed and signed in to your Claude account.** Not Edge, not Brave, not Safari, and not a phone. The extension only runs in Chrome on a computer, and it does nothing until you sign in to it.
3. **About twenty minutes**, once, plus a few minutes each time you run a removal later.

You do not need to buy anything else. Afaro is free and there is no Afaro account to make.

---

## Step 2. Install the Claude in Chrome extension

1. Open Chrome.
2. Go to the Chrome Web Store and search for Claude in Chrome.
3. Click **Add to Chrome**.
4. **Sign in with your Claude account.** The extension cannot do anything for you until you do.
5. Pin the extension so you can see it, and accept the permissions it asks for.

This extension is what lets Claude click and type on a web page for you, in your own browser, while you watch.

**It asks again for every site.** Permission is granted per website, not once for the whole browser, so each broker's address has to be allowed before Claude can read anything there. The first time a run reaches a new broker you will get a prompt; allow it and the run carries on.

This is worth knowing before your first scan rather than during it. On one real scan seven of nine brokers came back as "could not be assessed", and four of those seven were this and nothing else. Nothing was blocking the tool on them: the sites were fine and the profile was fine, and the extension simply had no permission for those four addresses yet. The other three were real site defences, which is exactly the problem: from the outside the two look the same. If a scan reports a run of sites it could not assess, check this before you look for anything else.

**Use a separate Chrome profile for Afaro, with autofill turned off.** In Chrome, open the profile menu at the top right, choose to add a profile, and in that new profile go to settings and switch off autofill for addresses and payment methods and the offer to save them.

This is not tidiness. On the first real run Chrome had already filled a different email address into a broker's form before Afaro got there, and the address it filled was not the one the removal was for. Afaro now clears every box before it types and reads it back afterwards, and stops if the two do not match. A profile with nothing saved in it means that never comes up.

Reference: [Getting started with Claude in Chrome](https://support.claude.com/en/articles/12012173-getting-started-with-claude-in-chrome).

---

## Step 3. Turn on file creation

Afaro's skills need Claude's code execution and file creation setting turned on.

1. Open Claude's settings.
2. Go to **Capabilities** and turn on code execution and file creation.

Reference: [Create and edit files with Claude](https://support.claude.com/en/articles/12111783-create-and-edit-files-with-claude).

---

## Step 4. Add the Afaro skills

Afaro is five skills. Each one is uploaded as its own zip file, and the skill folder has to sit at the very top of the zip.

1. Download the Afaro files to your computer. This guide calls that the Afaro folder.
2. Open a terminal in the Afaro folder and run these five lines. They write five zip files into the folder. On Windows that is PowerShell; on a Mac it is Terminal, and the same five lines work there unchanged.

   ```powershell
   tar -a -c -f "afaro-orchestrator.zip" -C skills afaro-orchestrator
   tar -a -c -f "afaro-exposure-scan.zip" -C skills afaro-exposure-scan
   tar -a -c -f "afaro-removal-verify.zip" -C skills afaro-removal-verify
   tar -a -c -f "afaro-followup.zip" -C skills afaro-followup
   tar -a -c -f "afaro-drop-submit.zip" -C skills afaro-drop-submit
   ```

3. In Claude, go to **Customize**, then **Skills**, then the **+** button, then **+ Create skill**, then **Upload a skill**, and upload one zip.
4. Turn the skill on.
5. Repeat for the other four.

Use `tar` as written above. Do not use PowerShell's `Compress-Archive` for this. It writes the folder paths inside the zip with backslashes, and the uploader rejects the file.

Confirm all five are listed and switched on: `afaro-orchestrator`, `afaro-exposure-scan`, `afaro-removal-verify`, `afaro-followup`, `afaro-drop-submit`.

One thing worth knowing: skills you add in the Claude app are yours alone, and they do not carry over to other places Claude runs. If you use Claude somewhere else too, you would add them there separately.

Reference: [How to create custom skills](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills).

---

## Step 5. Make your profile folder

Your profile is one small file with the details brokers list about you. It lives on your computer in a folder of its own.

1. Make a new folder **outside the Afaro folder**, at the top of a drive or in your Documents. Name it `afaro-local` if you want a name to copy.
2. Find `profile.example.json` in the Afaro folder. Copy it into your new folder and name the copy `profile.json`. If you are going to run Afaro for other people as well, name each file `profile-<name>.json` instead, one per person.
3. Open it in any text editor and replace the example details with your own.

Keep that folder for your profile only. `profile.json` is the one file you put there. Afaro makes a `logs` folder inside it for its own record of each run, and nothing else belongs in it.

Why it sits outside the Afaro folder: the Afaro folder is a copy of a public project, and your details never go into it, not even by accident.

What goes in the profile: your full name, any other names you have gone by, your date of birth, your current address, addresses you have lived at before, your phone numbers, your email addresses, the state you live in, and the relatives brokers tend to list next to you.

Why previous addresses and relatives: that is how the brokers connect their records, and how you tell which listing is yours.

Leave `"mode": "guided"` as it is. Guided means Claude stops and asks you before it sends anything.

Four fields near the bottom of the example are optional.

- `opt_out_reason` is your standing answer to a broker that asks why you want your listing removed. Some of them make you pick from a short list. Afaro matches what you put here against the list on the page and asks you if none of them fits. It never picks one for you.
- `contact_phone` is the number a broker will ring or text to check it is really you. A couple of them do this, and the call comes within the minute. Put the number you will be holding while the run happens. `phones` is a different thing: those are the numbers on your listing, which is how the right listing gets found, and Afaro never puts them in a box a broker will ring.
- `contact_email` and `authorized_agent` are for the case in the next section, where one person runs Afaro for someone else. If you are doing your own removals, delete both lines and leave `emails` as the address brokers write to.

If you are doing your own removals, `contact_phone` is still worth filling in. It is your own number either way, and it is the one Afaro reaches for when a page asks for a number to ring, so the two never get mixed up.

---

## Step 6. Attach your two folders at the start of every session

Claude can only read folders you hand it. It cannot pick one for itself, so this is on you, every session, before you say anything else.

At the start of a session, attach **two** workspace folders through the folder picker:

1. Your profile folder, the one holding `profile.json`.
2. The Afaro folder, so Claude can read the broker files it works from.

Attach both. With only one of them, a run stops partway to ask for the other.

**If you cannot attach folders**, there is a fallback: attach `profile.json` to the conversation itself, the way you would attach a file to any message. Runs work this way. The one thing you lose is the run log. With no folder to write into, Claude has nowhere to save it, so it gives you the log in the chat, and it is gone once you close the conversation. Attaching the folders is the better way round.

Reference: [Desktop and filesystem access](https://claude.com/docs/third-party/claude-desktop/local-access).

---

## Step 7. Know what happens to your data

Read this part before you start.

- Your profile file stays on your computer. Afaro has no server, no account, and nowhere to send it.
- When you run a removal, Claude reads your profile as part of the conversation, and that conversation goes to Anthropic's systems the way any Claude conversation does. That is how Claude works, and it is true of anything you type into Claude.
- Afaro's own record of a run holds only the broker's name, the step, whether it worked, and the time. It never holds your name, address, phone number, or anything else about you.
- Nobody else's information belongs in your profile. One file is one person. If you are doing this for a relative as well, they get their own file, and the next section is about that.

---

## Step 8. Your first run

1. Open Cowork in the Claude app and start a session with Claude in Chrome as the browser.
2. Attach your two folders, as in step 6.
3. Say: **run an Afaro exposure scan**.
4. Claude opens each broker's own search page and tells you which ones list you. The only thing that leaves your browser in this step is the search itself, your name and usually a city, the same words you would type into that site's own search box. No request is filed and no form is sent.
5. When you are ready, say: **run the Afaro opt-outs for the brokers that found me**.

From then on Claude works one broker at a time and stops at every point where you are needed. You will see the filled-in form before anything is sent, and it waits for you to say yes.

It also stops if a site shows a puzzle to prove you are human, puts up a block, asks for a photo of your ID, or wants to text you a code. Those are yours to do. Claude will not try to get around any of them.

---

## Step 9. What to expect afterwards

Removals take time. Some brokers state how long they take, from a day or two to several weeks, and Afaro tracks that. Others say nothing about it, and Afaro waits a set period before checking and tells you the broker never gave a number.

Some brokers hand part of the job back to you. Their opt-out runs through several screens, and only the first is on the page Afaro was built from. Claude fills in what it can, stops, and tells you what is left to do in the browser. Those are not counted as filed until you say you finished them.

Some removals do not work the first time. Some listings come back later, because brokers rebuild their records from public sources. Afaro rechecks on a schedule and tells you what it finds. Nobody can promise a listing stays gone.

Some brokers will not take a request through a form at all. They want a photo of an ID, a notarized document, an account, or a fee. Afaro will not do any of those for you. It hands you a short note saying exactly what that broker wants and where to do it, and you decide whether it is worth it.

---

## Running Afaro for someone else

Some people have nobody to do this for them: no Claude account, no email, or no wish to sit in front of a browser for an afternoon. One person can run Afaro for them. That person is called the operator here, and the rules below are what keep it honest rather than convenient.

**One file per person.** `<name>.json` in your local profile folder, one for each person, never mixed and never in the Afaro folder. One run is one person's file. Do not start a second person's removals in the same conversation.

**Written permission, before anything is filed.** You are acting as that person's authorized agent, which is the same footing the paid removal services use. Get a one-page authorization signed by them and keep it in your local folder with their profile. A typed full name and a ticked consent box on a private form is a valid signature for this; a signed PDF through a free e-signature service is only needed if a particular broker asks for one. Put a pointer to that file in the profile:

```json
"authorized_agent": {
  "name": "Your name",
  "email": "the address you use for their removals",
  "authorization_ref": "the file name or form response id of their signed authorization"
}
```

When that block is present, Afaro says so once at the start of the run, names whose listings it is working on, and says what `authorization_ref` points at. It does not change anything else. Every gate still stops.

**An address you control, for each person.** Brokers reply by email and some finish the job through a link they send. If the person has no email, use plus-addressing on your own mailbox, a different suffix per person, and put it in their profile as `contact_email`. Afaro puts that address on broker forms in place of the first entry in `emails`. This is your mailbox acting for a relative, not a service anyone operates.

**An email address of their own, for some brokers.** Several tie a request to an address that has not been used before, so one shared family inbox serves exactly one person and the second request is refused. Three brokers in the catalogue work this way today. If the person you are helping has no address of their own, the honest answers are to skip those brokers or to write to the broker directly, and Afaro will say which ones stopped and why. Working around it by inventing an address is not one of the options: these brokers send the link that finishes the request to that address, and a request nobody can finish is not a request. Giving each person an address of their own is the single change that unlocks the most brokers in operator mode.

**A number you can answer, for each person.** Some brokers verify by ringing a number and reading out a code, and the call comes within the minute. Put a number you will actually be holding into their profile as `contact_phone`. Afaro uses it wherever a page asks for a number the broker will ring, and it never uses the numbers in `phones` for that: those are the person's own, they are how a listing gets matched, and in operator mode they ring somebody who is not sitting with you.

One thing to know before you rely on it: some brokers refuse a number they read as internet telephony, and a number that works everywhere else can be rejected on one site for that reason alone. If that happens Afaro stops and asks you for a different number. It does not quietly try the number on the listing.

**The steps that are still theirs.** A photo of an ID, and a phone verification, need the actual person. Whitepages, for one, calls a phone and asks for a code read back. Afaro stops before that call is placed and tells you what is about to happen, and the person whose number it is has to be holding the phone. Do not answer those steps on someone's behalf.

**Starting a run for one person.** Attach their profile folder and the Afaro folder, then say which of them this run is for:

> Run the Afaro opt-outs using the profile for Jane at `<path>\profile-jane.json`. Guided mode.

Naming the file in the first message is what stops the wrong profile being picked up when several sit in the same folder. Afaro reads one profile per run and will say whose it read before it starts.

---

## If something goes wrong

- **Claude does not seem to know about Afaro.** Check the five skills are switched on in settings, and that you are in a Cowork session with Claude in Chrome as the browser.
- **Claude asks you to attach a folder partway through a run.** One of the two folders in step 6 was not attached. Attach it and start the run again.
- **Claude says it cannot find a field on a form.** The broker changed the page. That is expected over time. Tell whoever maintains your copy of Afaro which broker it was.
- **A site blocks the browser.** Afaro stops there on purpose. You can go to that site yourself and use its opt-out form by hand.
- **You are not sure whether something was sent.** Ask Claude to show the run summary. It lists every broker and what happened.
- **You cannot find your run log.** It is in the `logs` folder inside your profile folder, one file per run. If you used the fallback in step 6 and attached the profile file instead of the folder, there is no log on disk and the log was in the chat.
