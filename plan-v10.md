# PentestGym v10 — Vollständige Plattform-Transformation

## Anforderungen (vom Nutzer bestätigt)

### 1. PT0-003 Fragen — VOLLSTÄNDIG (~350-400)
- Alle Fragen: Multiple-Choice + Multiple-Select
- 5 Domains: Planning, Info Gathering, Attacks, Reporting, Tools
- PBQs: Grafisch animiert, praxisnah

### 2. Onboarding Flow
```
Name eingeben → Einverständniserklärung → Klassenraum (Dashboard) 
→ Skill-Assessment Test → AI-Orchestrator → Professor-Zuweisung
```

### 3. Klassenraum = Dashboard
- Classroom wird Haupt-Dashboard (/)
- Skill-Assessment für KI-Difficulty
- Alte Home → Profil-Seite (/profile)

### 4. localStorage Persistenz

### 5. AI-Orchestrator (sichtbar + Backend)
- Avatar, Sprache, persönliche Begrüßung
- Automatische Professor-Zuweisung

### 6. Study Guide Integration
- Dozenten lernen aus Exambegleiter-Daten
- Prompts erweitern mit vollständigem Domains-Wissen

### Extra: Einverständniserklärung/Richtlinien
- Nach Namenseingabe: klare Richtlinien
- Schüler muss zustimmen bevor er fortfährt

## Subagent-Plan (6 parallele)

| Subagent | Task | Branch |
|----------|------|--------|
| Content_Engineer | 350+ PT0-003 Fragen (MC + MS) | feature/pt003-full |
| PBQ_Visual_Artist | 15 grafisch animierte PBQs | feature/pbq-visual |
| Classroom_Redesigner | Classroom als Dashboard + Skill-Test | feature/classroom-v10 |
| Onboarding_Architect | Name → Einverständnis → Orchestrator | feature/onboarding |
| Profile_Builder | Alte Home → Profil-Seite | feature/profile-page |
| Prompt_Engineer | Dozenten-Prompts mit Study Guide | feature/professor-prompts |
