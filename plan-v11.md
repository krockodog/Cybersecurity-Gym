# PentestGym v11 — Classroom as Homepage + Full Personnel Model

## Goal
1. `/` shows Classroom directly (no redirect) after onboarding
2. Full 5-agent personnel model: 2 Professors + 2 Tutors + 1 Organizer per classroom
3. New staff: Create Tutors and Organizers for each certification

## Changes

### 1. Route Changes
- `/` → renders `<Classroom />` directly (not redirect)
- Onboarding check happens inside Classroom component
- `/classroom` → kept for compatibility, also renders Classroom

### 2. Orchestrator Extension
- 5-Agenten structure: 2 Professors + 2 Tutors + 1 Organizer
- Tutor assignment: Theory Tutor for concepts, Practice Tutor for tools/labs
- Organizer: Auto-triggers, progress tracking, adaptive scheduling

### 3. New Staff Data
- Tutor profiles (2 per classroom = ~16 tutors)
- Organizer profiles (1 per classroom = ~8 organizers)
- New role types in professor-data.ts

### 4. Classroom UI Enhancement
- Show all 5 agents per classroom in expanded view
- Tutor cards with specialization
- Organizer panel with status indicators

## Subagents
1. **Route_Engineer**: App.tsx routes + orchestrator 5-agent extension
2. **Personnel_Engineer**: Tutor + Organizer data + new prompts
3. **Classroom_Enhancer**: Classroom UI with 5-agent display
