# Tech Stack Reference

## Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime |
| React | 19.0.0 | UI framework |
| React DOM | 19.0.0 | DOM renderer |
| TypeScript | ~5.6.0 | Type system |
| Vite | 7.2.4 | Build tool / dev server |

## Routing

| Technology | Version | Purpose |
|------------|---------|---------|
| react-router-dom | 7.1.0 | HashRouter for SPA navigation |

**Important:** Uses `HashRouter` (not BrowserRouter) because the deployment is a static site.

## Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| tailwind-merge | 2.6.0 | Merge Tailwind classes without conflicts |
| clsx | 2.1.1 | Conditional class names |
| class-variance-authority | 0.7.1 | Component variant management (shadcn) |

## Animation

| Technology | Version | Purpose |
|------------|---------|---------|
| framer-motion | 12.0.0 | Page transitions, animations, AnimatePresence |

## UI Components

| Technology | Version | Purpose |
|------------|---------|---------|
| shadcn/ui | latest | 53 pre-installed components (card, button, dialog, etc.) |
| lucide-react | 0.460.0 | Icon library |
| @radix-ui/* | various | Headless UI primitives for shadcn |

## State Management

No external state library — all state is managed with:
- React `useState`, `useReducer`, `useContext`
- localStorage for persistence

## Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| @vitejs/plugin-react | 4.3.0 | Vite React plugin |
| eslint | ~9.0.0 | Linting |
| @types/react | ~19.0.0 | React type definitions |
| @types/react-dom | ~19.0.0 | React DOM type definitions |

## Google Fonts (loaded in index.html)

- **Inter** (300-700) — Primary UI font
- **JetBrains Mono** (400-800) — Code, monospace text
- **Share Tech Mono** — Display/headline font

## Data Storage

- **localStorage** — All user data (progress, XP, streaks, chat history, flashcard state)
- **No backend** — Entirely client-side

## File Paths Reference

```
# Build commands
cd $HOME/app-final-build && npm run build

# Deploy source
cp -r $HOME/app-final-build/dist /mnt/agents/output/app/
# Then deploy from /mnt/agents/output/app/dist

# Source code master
/mnt/agents/output/app/

# Build directory
$HOME/app-final-build/

# Documentation
/mnt/agents/output/TRYGIT_ME_ANLEITUNG.md
/mnt/agents/output/TRYGIT_ME_PRODUKT_DOKUMENTATION.md
```

## Environment Constraints

- **No backend server possible** — sandbox limitation
- **No database** — all data in localStorage
- **No server-side rendering** — static SPA only
- **No API keys stored** — Ollama runs locally, TTS uses browser API
