# Plan: Restore All Missing Features to Master Branch

## Problem
6 critical v9 features are missing from master branch — they exist on v9-final but were lost during v11 merge:
- `src/services/openrouter.ts` — OpenRouter API client (6 free LLM models)
- `src/services/llm.ts` — Unified LLM service (orchestrates Ollama + OpenRouter)
- `src/services/adaptive-learning.ts` — Adaptive learning engine (weakness analysis, exam readiness)
- `src/components/AdaptiveLearningPanel.tsx` — Learning dashboard UI
- `src/components/ExamStrategist.tsx` — Study planner + exam tips
- `src/components/StudyStreak.tsx` — Gamified streak tracker

## Steps
1. Extract all 6 files from v9-final branch
2. Examine each file for v11 compatibility (imports, API changes)
3. Update any broken imports or API references
4. Add integration points into existing pages (Classroom.tsx, Progress.tsx, Profile.tsx)
5. Build and verify
6. Commit to master
7. Push to GitHub (force all branches synced)
8. Deploy

## Verification
- All 6 files present in src/ tree
- Build succeeds without errors
- GitHub master branch has all files
