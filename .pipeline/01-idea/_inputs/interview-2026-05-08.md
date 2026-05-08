# Kickoff interview — Maintenance technicians

**Date:** 2026-05-08
**Participants:** Marek (10y experience, gas/heating), Tomasz (3y, general maintenance)
**Interviewer:** Karolina (PM)
**Location:** ZGM Rybnik break room

---

**Karolina:** Tell me how a typical day looks. Marek, you first.

**Marek:** I come to the office around 7. They print me a list of jobs for the day from Excel. I read it, take the keys for the buildings I need to visit, and go. I have my van. I drive to the first building, do the work, drive to the next, until I'm done — usually 5 PM.

**Karolina:** And what's the actual list look like? What does it say?

**Marek:** Address, what to do — like "check pressure on boiler", "replace seal in basement". Sometimes the manager scribbles a note. Sometimes a phone number for the tenant if I need to get in.

**Tomasz:** For me it's similar but I get more reactive stuff. Tenant called, sink is leaking, I go fix it. So my list changes during the day — they call me on the phone, "drop everything, go to ulica Kościuszki 4".

**Karolina:** How do you record what you did?

**Marek:** I write on the printed list. Done, done, done. Then back at the office I dictate to the secretary or fill in the system. Sometimes I forget what I did three buildings ago. (laughs)

**Tomasz:** Same. And if there's a problem — like, the boiler is leaking and I can't fix it on the spot, I need parts — I write a note, but then it gets lost. Or the manager doesn't see it for two days.

**Karolina:** Photos?

**Marek:** Sometimes I take a photo with my phone. To show "look, the seal is destroyed, that's why I replaced it". But it sits on my phone, no one sees it unless they ask.

**Tomasz:** Or — bigger problem — I do gas inspection, I need to attach a protocol. Right now I write it on paper, give it to the office, they scan it. Takes a week.

**Karolina:** What about ePrzeglądy?

**Marek:** It's the central system. The protocols go there eventually. But I don't touch it directly. Office uploads the scans. So there's a delay — I do the inspection Monday, the central system shows it on Friday.

**Karolina:** What about the buildings without internet? Some of yours are old, basement only, no signal.

**Marek:** A lot of them. Nineteenth century buildings, thick walls. Phone shows no bars. If I had an app that needs internet to mark done, it wouldn't work in half my stops.

**Tomasz:** Same. And I don't want to come back to the office to upload — I want to leave at 5 from the last building.

**Karolina:** If we built you an app — what would be the must-have?

**Marek:** First, the list — accurate, what to do today, with address and notes. Second, mark done with a photo. Third, it has to work without signal.

**Tomasz:** And don't make me type. I have grease on my hands. Tap, tap, photo, next.

**Karolina:** What about new tasks during the day? Marek, your list is mostly fixed. Tomasz, yours changes.

**Tomasz:** Yes — the manager assigns me a new urgent task at 11 AM, I need to see it. Push notification or something.

**Marek:** For me less critical, but the same — sometimes there's a change.

**Karolina:** What if you can't do a task? Like you arrive, parts are missing.

**Marek:** Right now I write a note "no parts, schedule again". And I want to do that fast — not type a paragraph. Maybe a checklist, like "needs parts", "tenant absent", "needs specialist".

**Tomasz:** And then the manager sees it and reschedules.

**Karolina:** Buildings — how do you find them? GPS?

**Marek:** I know all the addresses. But Tomek is new, he sometimes uses Google Maps.

**Tomasz:** A button "show on map" would help.

**Karolina:** Login? You all use the same office computer now?

**Marek:** Different accounts, but we share the screen. On the phone I'd want my own account. So my list is mine.

**Karolina:** And what if you lose the phone?

**Marek:** Don't lose data. Whatever I marked done should be saved on the server. I shouldn't have to redo a day of work because the phone broke.

**Tomasz:** And the photos — I don't want to fill my phone storage. After they sync, they should be removed locally.

**Karolina:** What about gas inspections specifically? Different process?

**Marek:** Yes. After a gas inspection there's a protocol — long form. Boiler model, serial number, pressure readings, my signature. I want to fill it in the app instead of paper, then it goes to ePrzeglądy automatically.

**Karolina:** That's a lot. Is the protocol form a must-have for the first version?

**Marek:** Not for me, I do gas. But the regular task list and photo confirmation — yes, day one.

**Tomasz:** I don't do gas. So for me regular tasks + offline + photos + getting urgent work in real-time = MVP.

**Karolina:** Anything you're worried about?

**Marek:** Battery. If I'm in the field 8 hours and the app drains the battery, I'll stop using it.

**Tomasz:** That my photos sync over mobile data and use up my data plan.

**Marek:** Right — wifi-only sync option.

**Karolina:** Anything else you want to mention?

**Tomasz:** When I report a problem like "the radiator in apartment 5 is not heating" — that should automatically create a follow-up task for someone. Otherwise it's just a note that disappears.

**Marek:** That's manager workflow more than mine, but yes.

**Karolina:** Thanks — this is enough to start. We'll come back with mockups.

---

## Key quotes pulled

- "It has to work without signal" — Marek
- "Don't make me type. I have grease on my hands. Tap, tap, photo, next." — Tomasz
- "I want to leave at 5 from the last building" (no return-to-office sync) — Tomasz
- "Don't lose data. Whatever I marked done should be saved on the server." — Marek
- "Push notification" for new urgent tasks — Tomasz
- "Photos — after they sync, they should be removed locally" — Tomasz
- "Wifi-only sync option" — Marek (battery + mobile data concerns)
- "Show on map" button (for newer technicians) — Tomasz
- Quick-reasons checklist for "task not done": needs parts, tenant absent, needs specialist — Marek

## Scope decisions confirmed in this interview

- Manager web panel — out of scope here (separate spec)
- Gas inspection protocol form — out of scope for MVP (Marek's domain only, can wait)
- Tenant-facing features — out of scope
- Reactive task creation by technician (radiator example) — Marek confirmed it's manager workflow, out of MVP for technician app
