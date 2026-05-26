---
name: trygit-me-skill
description: Complete project knowledge base for trygit.me - a Cybersecurity Gymnasium learning platform. Use when the user references trygit, trygit.me, cybersecurity gymnasium, exam preparation platform, or any work continuing this project. Contains full project architecture, 9 AI professors, 1412+ exam questions, Ollama integration, RAG system, build/deploy pipeline, and known issues. Essential for any task involving maintaining, extending, or deploying this React-based learning platform.
---

# trygit.me - Cybersecurity Gymnasium - Project Skill

Complete knowledge base for continuing the trygit.me cybersecurity learning platform.

## Quick Facts

| | |
|---|---|
| **Project** | trygit.me - Cybersecurity Gymnasium |
| **Live URL** | https://b4si6zbax4skg.kimi.page |
| **Version** | 7.0 |
| **Stack** | React 19 + TypeScript + Vite + Tailwind CSS v3.4.19 + shadcn/ui + Framer Motion |
| **Router** | HashRouter (react-router-dom v7) |
| **Codebase** | 10.760+ lines across 10 pages, 2 services, 6 components |
| **Questions** | 1.412 real exam questions across 8 certifications |
| **Professors** | 9 AI teachers with unique personalities |
| **Storage** | localStorage (browser-based, no backend) |

## Project Architecture

### Directory Structure

```
app/
├── public/                        # Static assets
│   ├── exam_database.json         # Main question database (727 PT0-002/003 questions)
│   ├── professors.json            # 9 AI professor profiles
│   ├── lpi1_database.json         # 64 LPI 1 questions (German)
│   ├── xk006_database.json        # 32 Linux+ XK0-006 questions
│   ├── network_plus_database.json # 80 Network+ questions
│   ├── aplus_database.json        # 60 A+ questions
│   ├── hero-bg.png                # Dashboard background
│   ├── teacher-*.png              # 5 teacher avatars
│   ├── prof-*.png                 # 4 additional professor avatars
│   ├── principal.png              # JARVIS avatar
│   ├── pbq-network.png            # PBQ diagram
│   └── badge-*.png                # Achievement badges
├── src/
│   ├── pages/                     # 10 page components
│   │   ├── Home.tsx               # Grand Hall Dashboard (1.183 lines)
│   │   ├── Classroom.tsx          # Professor Directory (920 lines)
│   │   ├── Quiz.tsx               # Quiz Lab (1.448 lines)
│   │   ├── PBQ.tsx                # PBQ Arena (1.594 lines)
│   │   ├── Tutor.tsx              # 1-on-1 Ollama Tutor (1.288 lines)
│   │   ├── Progress.tsx           # Analytics Dashboard (825 lines)
│   │   ├── Flashcards.tsx         # Spaced Repetition (1.012 lines)
│   │   ├── LPI1Room.tsx           # Linux LPI 1 (1.015 lines)
│   │   ├── LinuxPlusRoom.tsx      # Linux+ XK0-006 (975 lines)
│   │   └── PlaceholderPage.tsx    # Temporary page (42 lines)
│   ├── components/
│   │   ├── Layout.tsx             # App shell with sidebar nav
│   │   ├── Navbar.tsx             # Navigation sidebar
│   │   ├── Footer.tsx             # App footer
│   │   ├── SpeakerButton.tsx      # TTS button component
│   │   └── AnimatedGrid.tsx       # Animated background
│   ├── services/
│   │   ├── ollama.ts              # Ollama streaming chat + professor prompts
│   │   └── rag.ts                 # TF-IDF question search + context injection
│   ├── hooks/
│   │   ├── useTTS.ts              # Text-to-speech hook (Web Speech API)
│   │   └── use-mobile.ts          # Mobile breakpoint hook
│   ├── components/ui/             # 53 shadcn/ui components
│   ├── App.tsx                    # All 9 routes wired
│   ├── main.tsx                   # Entry point with HashRouter
│   └── index.css                  # Global styles, fonts, Tailwind
├── index.html                     # HTML entry with Google Fonts
├── tailwind.config.js             # Custom colors, fonts, animations
├── tsconfig.app.json              # TypeScript config (noUnusedLocals: false)
└── package.json                   # Dependencies
```

### Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Grand Hall Dashboard |
| `/classroom` | Classroom | 9 AI professors directory |
| `/quiz` | Quiz | Practice/exam mode quiz lab |
| `/pbq` | PBQ | Interactive performance-based questions |
| `/tutor` | Tutor | 1-on-1 Ollama AI tutor with streaming |
| `/progress` | Progress | Analytics, heatmaps, badges |
| `/flashcards` | Flashcards | SM-2 spaced repetition |
| `/lpi1` | LPI1Room | Linux LPI 1 exam prep (German) |
| `/linux-plus` | LinuxPlusRoom | Linux+ XK0-006 (locked until 80% LPI 1) |

## Essential Configuration

### TypeScript (tsconfig.app.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] },
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

**Critical:** `noUnusedLocals: false` and `noUnusedParameters: false` are REQUIRED. All complex pages use `// @ts-nocheck` to bypass strict checks.

### Key Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.1.0",
  "framer-motion": "^12.0.0",
  "lucide-react": "^0.460.0",
  "tailwindcss": "3.4.19",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

### Tailwind Theme Colors

```javascript
// Primary palette
customGreen: '#00ff41'   // PenTest+ accent
customBlue: '#00d4ff'    // Security+ accent
customPurple: '#8b5cf6'  // Network+ accent
customYellow: '#fbbf24'  // A+ accent
customOrange: '#f97316'  // Linux+ accent

// Backgrounds
darkBase: '#0a0e17'      // Page background
darkCard: '#0d1526'      // Card background
darkBorder: '#1a2d45'    // Border color

// Text
textMain: '#e0f2fe'      // Primary text
textMuted: '#7da0c4'     // Secondary text
```

## Build & Deploy Pipeline

See `references/build-deploy.md` for complete build commands and deployment steps.

**Quick deploy:**
```bash
cd $HOME/app-final-build && npm run build
cp -r $HOME/app-final-build/dist /mnt/agents/output/app/
# Deploy from /mnt/agents/output/app/dist
```

## Core Services

### Ollama Integration (src/services/ollama.ts)

- **Endpoint:** `http://localhost:11434/api/chat`
- **Streaming:** AsyncGenerator pattern for real-time token streaming
- **9 Professor Prompts:** Each professor has a unique system prompt with personality
- **Model:** Default `llama3`, configurable per professor
- **Weakness Analysis:** Automatic prompt enhancement based on quiz results

### RAG System (src/services/rag.ts)

- **TF-IDF Search:** Keyword-based question retrieval across all databases
- **Domain Keywords:** 15 domain-specific keyword mappings for scoring
- **Context Injection:** Top-matching questions injected into LLM prompts
- **Fallback:** Returns empty context if no matches found

## Reference Files

- **Orchestration Workflow:** `references/orchestration-workflow.md` — MANDATORY operating procedure for all trygit.me work
- **Project Structure:** `references/project-structure.md` - Full file listing with sizes
- **Professors:** `references/professors.md` - All 9 professors with bios, prompts, specialties
- **Tech Stack:** `references/tech-stack.md` - Complete dependency list with versions
- **Ollama Setup:** `references/ollama-integration.md` - Installation, models, troubleshooting
- **Known Issues:** `references/known-issues.md` - All bugs encountered and their fixes
- **TODO Roadmap:** `references/todo.md` - Open tasks and planned features
- **AI Personnel Model:** `references/personnel-model.md` - Agent orchestration framework: 2 professors + 2 tutors + 1 organizer per classroom, assignment logic, competency matrices, distribution rules
- **Lessons Learned:** `tasks/lessons.md` - Pattern library of past mistakes and prevention rules

## Critical Rules for This Project

1. **Always use `// @ts-nocheck`** on all page files when modifying (they exceed strict TS)
2. **Always use `$HOME/app-final-build`** for builds (not `/mnt/agents/output/app`)
3. **Always copy `dist/` to `/mnt/agents/output/app/dist/` after build before deploy
4. **Never delete `node_modules/` or `public/` from build directory**
5. **All pages are default exports** at `src/pages/<Name>.tsx`
6. **Router uses HashRouter** - all navigation must use `useNavigate()` from react-router-dom
7. **Never change the file paths** in App.tsx imports without checking all references
