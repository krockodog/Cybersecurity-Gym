# Project Structure Reference

## File Inventory

### Pages (src/pages/)

| File | Lines | Description |
|------|-------|-------------|
| Home.tsx | 1.183 | Grand Hall Dashboard. XP display, 5 wing cards, stats, quick actions, daily challenge, activity feed. Uses Framer Motion for entrance animations. |
| Classroom.tsx | 920 | Professor Directory. Grid of 9 professor cards with avatars, bios, specialties, "Talk to Professor" buttons. Color-coded by wing. |
| Quiz.tsx | 1.448 | Quiz Lab. Practice/exam mode, 80/20 hint system, question navigation grid, TTS, domain filtering, detailed results with explanations. |
| PBQ.tsx | 1.594 | PBQ Arena. 5 interactive PBQ types: network topology, firewall rules, terminal simulation, code review, attack path flows. |
| Tutor.tsx | 1.288 | 1-on-1 Ollama Tutor. Professor selector, streaming chat with markdown support, weakness sidebar, quick action buttons, chat persistence. |
| Progress.tsx | 825 | Analytics Dashboard. XP charts, domain distribution, weakness heatmap, study time tracking, 15 badges, exam readiness gauge. |
| Flashcards.tsx | 1.012 | Spaced Repetition. SM-2 algorithm, 3D flip cards, deck selector, confidence rating (Again/Hard/Good/Easy), due cards accordion. |
| LPI1Room.tsx | 1.015 | Linux LPI 1 Room. 64 questions across 7 domains, German UI, domain completion tracking, terminal training component. |
| LinuxPlusRoom.tsx | 975 | Linux+ XK0-006 Room. 32 questions, locked until 80% LPI 1 mastery, unlock animation, prerequisite check. |
| PlaceholderPage.tsx | 42 | Temporary page for unimplemented routes. |

### Services (src/services/)

| File | Lines | Description |
|------|-------|-------------|
| ollama.ts | 236 | Ollama streaming chat. 9 professor system prompts, weakness-aware prompt enhancement, connection status check. |
| rag.ts | 198 | TF-IDF question search. Keyword scoring, domain keyword mappings, context formatting, RAG-enhanced system prompt creation. |

### Components (src/components/)

| File | Lines | Description |
|------|-------|-------------|
| Layout.tsx | ~80 | App shell. Wraps all pages with Navbar + Footer + main content area. |
| Navbar.tsx | ~120 | Sidebar navigation. 9 route links with icons, active state highlighting, mobile hamburger. |
| Footer.tsx | ~40 | App footer with version info and links. |
| SpeakerButton.tsx | ~45 | TTS button. Uses useTTS hook. Shows Volume2/VolumeX icon. |
| AnimatedGrid.tsx | ~60 | Animated background grid effect for dashboard. |

### Hooks (src/hooks/)

| File | Lines | Description |
|------|-------|-------------|
| useTTS.ts | ~50 | Text-to-speech hook. Web Speech API, German voice preferred, 0.9x rate. |
| use-mobile.ts | ~25 | Mobile breakpoint detection hook. |

### Public Assets

| File | Size | Description |
|------|------|-------------|
| exam_database.json | 1.6 MB | 727 PenTest+ PT0-002/003 questions |
| professors.json | 12 KB | 9 professor profiles with full metadata |
| lpi1_database.json | 34 KB | 64 LPI 1 questions (German) |
| xk006_database.json | 16 KB | 32 Linux+ XK0-006 questions |
| network_plus_database.json | 16 KB | 80 Network+ questions |
| aplus_database.json | 16 KB | 60 A+ questions |
| hero-bg.png | 1.7 MB | Dashboard background image |
| teacher-cipher.png | 1.8 MB | Professor Cipher avatar |
| teacher-code.png | 2.1 MB | Code Master avatar |
| teacher-recon.png | 1.8 MB | Dr. Recon avatar |
| teacher-sage.png | 1.5 MB | Director Sage avatar |
| teacher-shield.png | 1.6 MB | Agent Shield avatar |
| prof-*.png | ~1.7 MB each | Additional professor avatars |
| principal.png | 1.9 MB | JARVIS avatar |

## Database Schema

### exam_database.json

```typescript
interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number[];      // indices of correct answers
  explanation: string;
  domain: string;          // e.g., "Attacks and Exploits"
  subdomain: string;       // e.g., "SQL Injection"
  difficulty: number;      // 1-5
  questionType: string;    // "multiple_choice" | "multiple_select" | "hotspot" | "drag_drop"
  source: string;          // "P4S" | "ExamTopic" | "BundlesDigest"
  certification: string;   // "PT0-002" | "PT0-003"
  eightyTwenty: string;    // Strategic hint (80/20 rule)
}
```

### professors.json

```typescript
interface Professor {
  id: string;              // e.g., "cipher"
  name: string;            // e.g., "Professor Cipher"
  nickname: string;        // e.g., "The Code Breaker"
  wing: string;            // e.g., "penetration-testing"
  domain: string;          // e.g., "PenTest+"
  experience: string;      // e.g., "20+ years"
  formerRoles: string[];   // Previous job titles
  bio: string;             // Full biography text
  teachingStyle: string;   // e.g., "Challenge-based"
  personality: string;     // e.g., "Intense but fair"
  catchphrase: string;     // e.g., "Every system has a weakness."
  voiceId: string;         // TTS voice identifier
  accent: string;          // e.g., "American"
  color: string;           // Hex color code
  avatar: string;          // Image filename
  specialties: string[];   // List of expertise areas
}
```

### lpi1_database.json

```typescript
interface LPIQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  domain: string;          // e.g., "Systemarchitektur"
  domainKey: string;       // e.g., "101"
  eightyTwenty: string;
  difficulty: number;
}
```
