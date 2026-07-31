<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge" alt="License" />
</p>

<h1 align="center">
  <br>
  <code>trygit.me</code> — Cybersecurity Gymnasium
  <br>
</h1>

<p align="center">
  <strong>KI-gestuetztes Lernlabor fuer IT-Sicherheitszertifizierungen</strong><br>
  <em>8 Kurse &bull; 5.000+ Pruefungsfragen &bull; 9 KI-Dozenten &bull; Interaktive Labs</em>
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#kurse">Kurse</a> &bull;
  <a href="#tech-stack">Tech Stack</a> &bull;
  <a href="#installation">Installation</a> &bull;
  <a href="#projektstruktur">Struktur</a> &bull;
  <a href="#screenshots">Screenshots</a>
</p>

---

## Was ist das Cybersecurity Gymnasium?

Eine vollstaendige **Single-Page-Application** fuer die Vorbereitung auf CompTIA- und Linux-Zertifizierungen. Die Plattform kombiniert echte Pruefungsfragen mit KI-Tutoring, interaktiven Labs und einem Gamification-System — alles im Browser, ohne Backend.

```text
 +-----------+     +-------------+     +-----------+     +-------------+
 |  Kurse    | --> | Exam        | --> | KI-Tutor  | --> | Fortschritt |
 |  Katalog  |     | Simulator   |     | 1-zu-1    |     | & Analyse   |
 +-----------+     +-------------+     +-----------+     +-------------+
       |                  |                  |                  |
       v                  v                  v                  v
  8 Zertifi-        5.000+ Fragen     9 KI-Dozenten     Schwaechen-
  zierungen         mit Erklaerung    mit Persoen-       Heatmap &
                                      lichkeit           Badges
```

---

## Features

### Lernen

| Feature | Beschreibung |
|:--------|:-------------|
| **Exam Simulator** | Realistische Pruefungssimulation mit Timer, Flagging und detaillierter Auswertung |
| **Domain Practice** | Gezieltes Training nach Pruefungsdomaenen mit gewichteter Verteilung |
| **KI-Tutoring** | 1-zu-1 Chat mit 9 KI-Dozenten — jeder mit eigener Persoenlichkeit und Fachgebiet |
| **Flashcards** | SM-2 Spaced-Repetition-System mit automatischer Wiederholungsplanung |
| **PBQs** | Performance-Based Questions mit interaktiven Netzwerk- und Terminal-Simulationen |
| **Study Guides** | Kapitelweise Lernmaterialien mit Cheatsheets (Nmap, Metasploit, Subnetting u.a.) |
| **Kurskatalog** | Filterbarer Katalog aller 8 Zertifizierungskurse mit Suchfunktion und Sortierung |

### Gamification & Fortschritt

| Feature | Beschreibung |
|:--------|:-------------|
| **XP-System** | Punkte fuer jede richtige Antwort, Level-Aufstieg |
| **Study Streak** | 7-Tage-Kalender mit Streak-Tracking |
| **Schwaechen-Analyse** | Automatische Erkennung und gezieltes Nachtraining |
| **Badges** | Abzeichen fuer Meilensteine und besondere Leistungen |
| **Progress Export** | Fortschrittsdaten exportieren und importieren (JSON) |

---

## Kurse

<table>
  <thead>
    <tr>
      <th>Kurs</th>
      <th>Zertifizierung</th>
      <th>Level</th>
      <th>Fragen</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>PenTest+ PT0-003</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>1.161</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>Security+ SY0-701</strong></td>
      <td>CompTIA</td>
      <td>Entry-Level</td>
      <td>850</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>CySA+ CS0-003</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>750</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>CASP+ CAS-005</strong></td>
      <td>CompTIA</td>
      <td>Advanced</td>
      <td>600</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>Network+ N10-009</strong></td>
      <td>CompTIA</td>
      <td>Entry-Level</td>
      <td>900</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>A+ Core 1 &amp; 2</strong></td>
      <td>CompTIA</td>
      <td>Beginner</td>
      <td>700</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>LPI Linux Essentials</strong></td>
      <td>LPI</td>
      <td>Beginner</td>
      <td>450</td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>Cloud+ CV0-004</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>--</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>

---

## Die 9 KI-Dozenten

Jeder Dozent besitzt eine einzigartige Persoenlichkeit, 20+ Jahre Fachexpertise und einen eigenen Kommunikationsstil.

| Dozent | Spezialgebiet | Stil |
|:-------|:-------------|:-----|
| **Professor Cipher** "The Ghost" | Attacks & Exploits, Red Teaming | Mysterioes, nutzt echte Breach-Storys |
| **Agent Shield** "The Architect" | Planning & Scoping, Compliance | Professionell, methodisch |
| **Dr. Recon** "The Invisible Eye" | OSINT, Reconnaissance | Analytisch, denkt 3 Schritte voraus |
| **Commander Patch** "The Fixer" | Vulnerability Management | Ruhig unter Druck, pragmatisch |
| **Sentinel Nova** "The Watcher" | Reporting & Communication | Empathisch, strukturiert |
| **Professor Phoenix** | Security+, Enterprise Security | Erfahren, geduldig |
| **Agent Bluefield** | CySA+, SOC Operations | Detailorientiert, wachsam |
| **Commander Bastion** | CASP+, Enterprise Architecture | Strategisch, visionaer |
| **Benny "The Penguin"** | Linux, Shell, Systemadministration | Locker, humorvoll, hands-on |

---

## Tech Stack

```text
Frontend          React 19 + TypeScript 5.9
Build             Vite 7.2
Styling           Tailwind CSS 3.4 + shadcn/ui (Radix Primitives)
Animationen       Framer Motion 12
Routing           React Router DOM 7.15 (HashRouter)
State             localStorage (kein Backend)
Markdown          react-markdown 10 + remark-gfm
Charts            Recharts 2.15
Icons             Lucide React
Flashcards        SM-2 Spaced Repetition (eigene Implementierung)
```

---

## Installation

```bash
# Repository klonen
git clone https://github.com/krockodog/Cybersecurity-Gym.git
cd Cybersecurity-Gym/app

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App laeuft dann unter `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## Projektstruktur

```text
Cybersecurity-Gym/
├── app/
│   ├── public/
│   │   ├── courses.json            # Kurskatalog-Daten (8 Kurse)
│   │   └── *.json                  # Fragendatenbanken
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn/ui Basiskomponenten
│   │   │   ├── onboarding/         # Onboarding-Flow
│   │   │   ├── pbq/                # PBQ-Komponenten
│   │   │   ├── Navbar.tsx          # Hauptnavigation
│   │   │   ├── Layout.tsx          # App-Layout mit Sidebar
│   │   │   ├── Footer.tsx          # Footer
│   │   │   ├── StudyStreak.tsx     # Streak-Tracking
│   │   │   ├── SkillAssessment.tsx # Kompetenz-Analyse
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Classroom.tsx       # Dashboard / Grand Hall
│   │   │   ├── Courses.tsx         # Kurskatalog
│   │   │   ├── CourseDetail.tsx    # Kursdetailseite
│   │   │   ├── Quiz.tsx            # Exam Simulator
│   │   │   ├── PBQ.tsx             # Performance-Based Questions
│   │   │   ├── Tutor.tsx           # KI-Tutor Chat
│   │   │   ├── Flashcards.tsx      # SM-2 Karteikarten
│   │   │   ├── Progress.tsx        # Fortschritt & Analyse
│   │   │   ├── Profile.tsx         # Benutzerprofil
│   │   │   ├── LPI1Room.tsx        # Linux LPI 1 Kurs
│   │   │   └── LinuxPlusRoom.tsx   # Linux+ XK0-006
│   │   └── App.tsx                 # Router-Konfiguration
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── *.json                          # Exam-Datenbanken (Root)
└── README.md
```

---

## Routen

| Route | Seite | Beschreibung |
|:------|:------|:-------------|
| `/` | Grand Hall | Dashboard mit Kursueberblick |
| `/classroom` | Klassenzimmer | Dozenten-Directory |
| `/courses` | Kurskatalog | Alle 8 Kurse filtern & durchsuchen |
| `/courses/:courseId` | Kursdetails | Module, Domains, Cheatsheets |
| `/quiz` | Exam Simulator | Pruefungssimulation mit Timer |
| `/pbq` | PBQ Arena | Interaktive Labs |
| `/tutor` | KI-Tutor | 1-zu-1 Chat mit Dozenten |
| `/flashcards` | Karteikarten | SM-2 Spaced Repetition |
| `/progress` | Fortschritt | Heatmap, Badges, Statistiken |
| `/profile` | Profil | Benutzereinstellungen |
| `/lpi1` | Linux LPI 1 | Bennys Linux-Kurs |
| `/linux-plus` | Linux+ | Freigeschaltet ab 80% LPI 1 |

---

## Design

Die App nutzt ein dunkles Cybersecurity-Theme:

| Element | Wert |
|:--------|:-----|
| Hintergrund | `#0a0e17` |
| Akzent Gruen | `#00ff41` |
| Akzent Cyan | `#00d4ff` |
| Rahmen | `#1a2d45` |
| Text primaer | `#ffffff` |
| Text sekundaer | `#7da0c4` |
| Schrift Display | System Sans-Serif |
| Schrift Terminal | Monospace |

---

## Datenmodell

Alle Nutzerdaten werden clientseitig in `localStorage` gespeichert — kein Backend, kein Account noetig.

```text
localStorage Keys:
├── trygit_onboarding_complete     # Onboarding-Status
├── trygit-quiz-progress-{cert}    # Quiz-Fortschritt pro Kurs
├── trygit-flashcards-{cert}       # Flashcard-Daten mit SM-2 Werten
├── trygit-streak-data             # Study Streak Kalender
├── trygit-xp                      # XP und Level
└── trygit-badges                  # Freigeschaltete Badges
```

---

## Mitwirken

Pull Requests sind willkommen. Bitte stelle sicher, dass:

1. `npm run build` fehlerfrei durchlaeuft
2. `npm run lint` keine Fehler zeigt
3. Das bestehende Design-System beibehalten wird
4. Neue Routen in `App.tsx` und der Navbar registriert werden

---

<p align="center">
  <sub>Gebaut mit React, TypeScript und einer Leidenschaft fuer Cybersecurity-Ausbildung.</sub><br>
  <sub>&copy; 2026 trygit.me</sub>
</p>
