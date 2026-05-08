---
id: PRODUCT-001
created: 2026-05-08
version: 1
---

# Property Maintenance Platform

## Target segment

Property management organisations in Poland that operate housing portfolios with in-house maintenance teams. Users are field technicians servicing residential and commercial buildings, often in older stock with poor connectivity. Geography: Poland, with Polish-language source material translated to English in this artifact.

## Personas

### P-01 — Marek
- **Role**: Senior maintenance technician, gas/heating specialist (10 years experience)
- **Context**: Visits 4–8 buildings per day in a routed schedule. Spends most of the day in basements, technical rooms, and external utility areas. Drives a company van between sites.
- **Goals**:
  - Know what to do at each stop without phoning the office
  - Record completion the moment work is finished, not at end of day
  - Leave the last building of the day and go home — no return-to-office step
- **Frustrations**:
  - Paper task lists get lost or forgotten between buildings (`_inputs/interview-2026-05-08.md:L23`)
  - No connectivity in many basements; current systems require online input (`_inputs/interview-2026-05-08.md:L57`)
  - Gas inspection protocols travel through office for a week before reaching ePrzeglądy (`_inputs/interview-2026-05-08.md:L51`)
- **Tech literacy**: Medium — comfortable with smartphone, uses banking and messaging apps; not comfortable with complex forms.
- **Quote**: "It has to work without signal." `_inputs/interview-2026-05-08.md:L57`

### P-02 — Tomasz
- **Role**: General maintenance technician (3 years experience)
- **Context**: Reactive workload — schedule shifts during the day as urgent tenant requests come in. Often called by phone mid-route to reroute. Hands frequently dirty (grease, water).
- **Goals**:
  - See newly assigned urgent work in real time without phone calls
  - Mark tasks done with minimal typing — preferably tap and photo only
  - Sync at end of day from home or last building, not from the office
- **Frustrations**:
  - Phone tag with manager when an urgent task comes in (`_inputs/interview-2026-05-08.md:L41`)
  - Typing on phone with grease-covered hands (`_inputs/interview-2026-05-08.md:L77`)
  - Photos sit on personal device with no path back to the office (`_inputs/interview-2026-05-08.md:L37`)
- **Tech literacy**: Medium-High — younger, uses Google Maps, social media, banking.
- **Quote**: "Don't make me type. I have grease on my hands. Tap, tap, photo, next." `_inputs/interview-2026-05-08.md:L77`

## Glossary

### Building
- **Definition**: A managed residential or commercial property identified by street address; the unit at which tasks are scoped and grouped on the technician's list.
- **Source**: `_inputs/interview-2026-05-08.md:L11` — *"Address, what to do — like 'check pressure on boiler'"*
- **Synonyms**: site, property
- **Used in**: idea.md, prd.md, user-journeys.md, data-model.md

### ePrzeglądy
- **Definition**: External central inspection-management system operated by a third party; receives gas inspection protocols and other regulated check records.
- **Source**: `_inputs/interview-2026-05-08.md:L47` — *"It's the central system. The protocols go there eventually."*
- **Synonyms**: e-inspections (English), central inspection system
- **Used in**: idea.md, prd.md, api-contracts.md

### Konserwator
- **Definition**: Polish term for a maintenance technician — the primary user of this app. Field worker responsible for servicing buildings on assigned routes.
- **Source**: `_inputs/brief.md:L9` — *"Maintenance technicians (konserwatorzy) who work in the field"*
- **Synonyms**: technician, maintenance worker, facility staff
- **Used in**: idea.md, prd.md, personas

### Task
- **Definition**: A discrete unit of work assigned to a technician at a specific building; has a status (pending, done, blocked) and may require a photo as completion proof.
- **Source**: `_inputs/interview-2026-05-08.md:L29` — *"I write on the printed list. Done, done, done."*
- **Synonyms**: job, work item
- **Used in**: prd.md, functional-requirements.md, user-journeys.md, data-model.md
