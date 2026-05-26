# TODO Roadmap

## High Priority

### More Exam Questions
- **Status:** 1.412 questions available, 12.443+ more on BundlesDigest
- **Action:** Extract additional questions from BundlesDigest using curl-based scraping
- **Sources:**
  - CompTIA Security+ SY0-701 (estimated 500+ questions available)
  - CompTIA Network+ N10-009 (estimated 400+ questions available)
  - CompTIA A+ 220-1101/1102 (estimated 600+ questions available)
  - CompTIA CySA+ CS0-003 (new questions needed)
  - CompTIA CASP+ CAS-004 (new questions needed)
- **Effort:** Medium (requires BundlesDigest login + HTML scraping)

### ElevenLabs TTS Integration
- **Status:** Web Speech API is working but quality is limited
- **Action:** Replace Web Speech API with ElevenLabs API for professional voices
- **API Key:** User provided `sk_75f0f2d5116025abf0a9a1f82dec04670fb402cc4e23a646` (previously showed "Free Tier disabled")
- **Note:** Check if ElevenLabs free tier is available again or use alternative voice services
- **Effort:** Low (API integration is straightforward)

### AI Agent Intercommunication
- **Status:** Planned, not implemented
- **Action:** Create a system where multiple AI professors "talk to each other" about student progress
- **Concept:** Simulated terminal log showing professor discussions
- **Example:** "Professor Cipher: 'Student struggled with SQLi today.' Agent Shield: 'I should cover parameterized queries in my next session.'"
- **Effort:** Medium (requires state sharing between professor contexts)

## Medium Priority

### CySA+ Wing
- **Status:** Not started
- **Action:** Add CySA+ (Cybersecurity Analyst) certification wing
- **Components needed:**
  - Database JSON with CySA+ questions
  - Professor profile for CySA+
  - Professor avatar image
  - Wing color: pick new distinct color
  - Add to Dashboard, Classroom, Quiz, Tutor
- **Effort:** High (new database + UI integration across all pages)

### CASP+ Wing
- **Status:** Not started
- **Action:** Add CASP+ (Advanced Security Practitioner) certification wing
- **Same components as CySA+ wing**
- **Effort:** High

### Server+ Wing
- **Status:** Not started
- **Action:** Add Server+ certification wing
- **Effort:** High

### Cloud+ Wing Expansion
- **Status:** Basic questions exist, no dedicated UI
- **Action:** Add Cloud+ as a full wing in the Dashboard with professor
- **Effort:** Medium

### PBQ Type Expansion
- **Status:** 5 PBQ types implemented
- **Action:** Add more PBQ types:
  - Log analysis and correlation
  - Certificate management
  - Wireless network auditing
  - Firewall configuration (iptables/Windows)
  - Docker/container security scenarios
- **Effort:** Medium per PBQ type

### Mobile Responsiveness
- **Status:** Basic responsive, needs improvement
- **Action:** Improve mobile experience:
  - Sidebar → hamburger menu on mobile
  - Card grid → single column on small screens
  - Quiz → full-width question cards
  - Tutor chat → full-screen chat view
- **Effort:** Medium

## Low Priority

### Dark Theme Toggle
- **Status:** Only dark theme exists
- **Action:** Add light theme option
- **Note:** Current dark cyberpunk theme is a core design decision
- **Effort:** High (requires redesigning all colors)

### Backend with User Accounts
- **Status:** No backend, all data in localStorage
- **Action:** Add optional backend for:
  - User accounts and authentication
  - Cloud-sync of progress across devices
  - Leaderboard and social features
  - Admin panel for content management
- **Note:** Requires external hosting (not possible in sandbox)
- **Effort:** Very High

### PDF Export
- **Status:** Not started
- **Action:** Export features:
  - Flashcards as printable PDF
  - Quiz questions as study guide PDF
  - Progress report as PDF
- **Effort:** Medium

### Exam Simulator Timer
- **Status:** Basic timer exists
- **Action:** Add realistic exam conditions:
  - CompTIA-style 90-minute timer
  - 90 questions in 90 minutes simulation
  - Bookmark and review flagged questions
  - Score report with domain breakdown
- **Effort:** Low-Medium

### Import/Export Progress
- **Status:** Not started
- **Action:** Allow users to:
  - Export their progress as JSON file
  - Import progress on a new device/browser
- **Effort:** Low

## Completed Tasks

| Task | Version | Date |
|------|---------|------|
| Initial PenTest+ question extraction | v1.0 | 2026-01 |
| Dashboard with 5 wings | v2.0 | 2026-01 |
| Quiz Lab with 80/20 hints | v2.0 | 2026-01 |
| PBQ Arena with 5 types | v2.0 | 2026-01 |
| Classroom with 5 professors | v3.0 | 2026-01 |
| 1-on-1 Tutor | v3.0 | 2026-01 |
| Progress Analytics | v4.0 | 2026-01 |
| Flashcards with SM-2 | v4.0 | 2026-01 |
| LPI 1 Room with Benny | v5.0 | 2026-01 |
| Linux+ Room with lock mechanic | v5.0 | 2026-01 |
| TTS for all pages | v5.0 | 2026-01 |
| Grand Hall redesign | v6.0 | 2026-05 |
| Professor Directory redesign | v6.0 | 2026-05 |
| 9 Professors + JARVIS | v6.0 | 2026-05 |
| Ollama Integration | v6.0 | 2026-05 |
| RAG System | v6.0 | 2026-05 |
| All routes wired | v7.0 | 2026-05-26 |

## Feature Request: User-Contributed Content

Consider allowing users to:
- Submit their own questions
- Create custom flashcard decks
- Share study notes
- Rate and comment on questions
