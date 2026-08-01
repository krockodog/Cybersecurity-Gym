<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Ollama-Local_AI-000000?style=for-the-badge&logo=ollama&logoColor=white" alt="Ollama" />
  <img src="https://img.shields.io/badge/License-Private-red?style=for-the-badge" alt="License" />
</p>

<h1 align="center">
  <br>
  <code>trygit.me</code> — Cybersecurity Gymnasium
  <br>
</h1>

<p align="center">
  <strong>KI-gestuetztes Lernlabor fuer IT-Sicherheitszertifizierungen</strong><br>
  <em>8 aktive Kurse + 1 Coming Soon &bull; 5.000+ Pruefungsfragen &bull; 44 KI-Agenten &bull; 8 PBQ-Typen &bull; Lokales KI-Tutoring &bull; Gamification</em>
</p>

<p align="center">
  <a href="#klassenraeume--wings">Klassenraeume</a> &bull;
  <a href="#ki-dozenten-19">KI-Dozenten</a> &bull;
  <a href="#ki-tutoren-16">KI-Tutoren</a> &bull;
  <a href="#ki-organizer-8">KI-Organizer</a> &bull;
  <a href="#raeume--features">Raeume</a> &bull;
  <a href="#kurse">Kurse</a> &bull;
  <a href="#tech-stack">Tech Stack</a> &bull;
  <a href="#installation">Installation</a>
</p>

---

## Was ist das Cybersecurity Gymnasium?

Eine vollstaendige **Single-Page-Application** fuer die Vorbereitung auf CompTIA- und Linux-Zertifizierungen. Die Plattform kombiniert echte Pruefungsfragen mit lokalem KI-Tutoring (Ollama), interaktiven Labs, Sprachausgabe und einem vollstaendigen Gamification-System — alles im Browser, ohne Backend.

```text
 +-----------+     +-------------+     +-----------+     +-------------+
 |  Onboard  | --> |  Classroom  | --> | Quiz Lab  | --> | KI-Tutor    |
 |  Wizard   |     |  Grand Hall |     | 3 Modi    |     | 1-zu-1 Chat |
 +-----------+     +-------------+     +-----------+     +-------------+
       |                  |                  |                  |
       v                  v                  v                  v
  Profil &           19 Dozenten       5.000+ Fragen     Ollama Lokal
  Skill-Tree         8 Wings           7 Datenbanken     Voice I/O
       |                  |                  |                  |
       v                  v                  v                  v
 +-----------+     +-------------+     +-----------+     +-------------+
 | Flashcard | --> | PBQ Arena   | --> | Progress  | --> | Kurskatalog |
 | SM-2      |     | 8 Typen     |     | Heatmap   |     | 9 Eintraege |
 +-----------+     +-------------+     +-----------+     +-------------+
       |                  |                  |                  |
       v                  v                  v                  v
  Spaced Rep.        Terminal-Sim     Exam Strategist    Study Guides
  3D-Kartenflip      Netzwerk-Lab    Export/Import       Cheatsheets
```

---

## KI-Agenten-Architektur

Das Gymnasium nutzt ein dreischichtiges KI-System mit insgesamt **44 Agenten**:

```text
                    ┌──────────────┐
                    │    JARVIS    │  Academy AI — Zentralsteuerung
                    │   "The AI"   │  Status-Monitoring, Begruessung
                    └──────┬───────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌─────▼────┐      ┌─────▼────┐
    │ 19 PROF │      │ 16 TUTOR │      │ 8 ORGAN. │
    │ Dozenten│      │ Tutoren  │      │ Organizer│
    └─────────┘      └──────────┘      └──────────┘
    Fachexperten     Je 2 pro Kurs     Klassenmanager
    800+ Woerter     Theorie+Praxis    Progress-Tracking
    System-Prompt    Socratic/Labs     Trigger-basiert
```

---

## Klassenraeume / Wings

Jeder **Wing** ist ein eigenstaendiger Klassenraum mit eigenen Dozenten, Tutoren, einem Organizer, Pruefungsfragen und Domaenen.

### Wing 1: PenTest+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA PenTest+ PT0-003 |
| **Status** | Aktiv |
| **Farbe** | `#ff3366` |
| **Fragen** | 1.161+ |
| **Datenbank** | `pt003_full_database.json` |

**Dozenten (6):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| Professor Cipher | The Ghost | Attacks & Exploits | `#ff3366` |
| Agent Shield | The Architect | Planning & Scoping | `#ffaa00` |
| Dr. Recon | The Invisible Eye | Information Gathering | `#00e5ff` |
| Code Master | The Builder | Tools & Code Analysis | `#a855f7` |
| Director Sage | The Diplomat | Reporting & Communication | `#10b981` |
| Viper | The Red Specter | Red Team Operations | `#dc2626` |

**Tutoren:** Iris Thinkwell (Theorie) + Kyle Hackwright (Praxis)
**Organizer:** Oracle Pentest

**Domaenen:** Planning and Scoping, Information Gathering, Attacks and Exploits, Tools and Code, Reporting, Red Team Operations

---

### Wing 2: Linux Wing

| | |
|:--|:--|
| **Zertifizierung** | LPI 1 & CompTIA Linux+ XK0-006 |
| **Status** | Aktiv (Linux+ ab 80% LPI-1-Mastery) |
| **Farbe** | `#ff9500` |
| **Fragen** | 450 (LPI 1) |
| **Datenbanken** | `lpi1_database.json`, `xk006_database.json` |

**Dozenten (2):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| Benny | Robbenklopper | Linux Administration (LPI 1) | `#ff9500` |
| Tux Tina | The Terminal Wizard | Linux Administration / DevOps / Shell Scripting | `#7c3aed` |

**Tutoren:** Yuki Shellborn (Theorie) + Bash Brody (Praxis)
**Organizer:** Daemon Linux

**Domaenen:** System Architecture, Installation, GNU Commands, Filesystems, Shells, Users, Administration, DevOps

---

### Wing 3: Security+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA Security+ SY0-701 |
| **Status** | Aktiv |
| **Farbe** | `#0066ff` |
| **Fragen** | 850 |
| **Datenbank** | `security_plus_database.json` |

**Dozenten (2):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| Guardian | The Watchtower | Security+ SY0-701 | `#0066ff` |
| Sergeant Harden | The Fortress | Blue Team / Defensive Operations | `#1e40af` |

**Tutoren:** Maya Clearview (Theorie) + Dex Lockhart (Praxis)
**Organizer:** Sentinel Security

**Domaenen:** Threats and Attacks, Cryptography, Network Security, Identity, IR, Blue Team Operations

---

### Wing 4: Network+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA Network+ N10-009 |
| **Status** | Aktiv |
| **Farbe** | `#00d4ff` |
| **Fragen** | 900 |
| **Datenbank** | `network_plus_database.json` |

**Dozenten (2):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| NetRunner | The Weave | Network+ N10-009 | `#00d4ff` |
| Cisco Kate | The Packet Surgeon | Cisco Enterprise Networking | `#059669` |

**Tutoren:** Lena Flowstate (Theorie) + Rex Cablesmith (Praxis)
**Organizer:** Navigator Network

**Domaenen:** Networking Concepts, Infrastructure, Network Operations, Security, Troubleshooting, Cisco Technologies

---

### Wing 5: A+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA A+ 220-1201/1202 |
| **Status** | Aktiv |
| **Farbe** | `#ffaa00` |
| **Fragen** | 700 |
| **Datenbank** | `aplus_database.json` |

**Dozenten (2):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| FixIt | The Mechanic | A+ 220-1201/1202 | `#ffaa00` |
| Tech Mom | The Fixer | A+ Hardware / Software / Support | `#e11d48` |

**Tutoren:** Sophia Brightmind (Theorie) + Max Fixitall (Praxis)
**Organizer:** Atlas A+

**Domaenen:** Mobile Devices, Networking, Hardware, Virtualization, Troubleshooting, OS

---

### Wing 6: CySA+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA CySA+ CS0-003 |
| **Status** | Aktiv |
| **Farbe** | `#ec4899` |
| **Fragen** | 750 |
| **Datenbank** | `cysa_database.json` |

**Dozenten (2):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| Analyst Ghost | The Silent Watcher | CySA+ | `#ec4899` |
| Hunter X | The Tracker | Advanced Threat Hunting | `#4f46e5` |

**Tutoren:** Vera Insight (Theorie) + Trace Huntley (Praxis)
**Organizer:** Chronicle CySA

**Domaenen:** Threat Intelligence, Vulnerability Management, Incident Response, Security Architecture, Reporting and Communication, Threat Hunting

---

### Wing 7: CASP+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA CASP+ CAS-004 |
| **Status** | Aktiv |
| **Farbe** | `#14b8a6` |
| **Fragen** | 600 |
| **Datenbank** | `casp_database.json` |

**Dozenten (2):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| Architect Phantom | The Invisible Shield | CASP+ | `#14b8a6` |
| CISO Nova | The Strategist | Executive Security Leadership | `#0f766e` |

**Tutoren:** Elena Stratagem (Theorie) + Archer Enterprise (Praxis)
**Organizer:** Cipher CASP

**Domaenen:** Enterprise Security Architecture, Security Engineering, Governance Risk Compliance, Security Operations, Executive Leadership

---

### Wing 8: Cloud+ Wing

| | |
|:--|:--|
| **Zertifizierung** | CompTIA Cloud+ CV0-004 & Multi-Cloud Security |
| **Status** | Coming Soon |
| **Farbe** | `#0284c7` |
| **Fragen** | -- |

**Dozenten (1):**

| Dozent | Spitzname | Domaene | Farbe |
|:-------|:----------|:--------|:------|
| Cloud Native Nate | The Sky Builder | Cloud+ / AWS / Azure / GCP / Kubernetes Security | `#0284c7` |

**Tutoren:** Nova Skywise (Theorie) + Stratos Gearhart (Praxis)
**Organizer:** Cumulus Cloud

**Domaenen:** Cloud Architecture, AWS Security, Azure Security, GCP Security, Kubernetes Security, DevSecOps

---

## KI-Dozenten (19)

19 Dozenten mit einzigartiger Persoenlichkeit, 20+ Jahre Fachexpertise und eigenem Kommunikationsstil. Jeder hat einen individuellen **800+ Woerter System-Prompt** fuer das KI-Tutoring mit vollstaendigem Domain-Wissen, Tools, Techniken und Persoenlichkeit.

| # | Dozent | Spitzname | Wing | Domaene | Farbe |
|:-:|:-------|:----------|:-----|:--------|:------|
| 1 | Professor Cipher | The Ghost | PenTest+ | Attacks & Exploits | `#ff3366` |
| 2 | Agent Shield | The Architect | PenTest+ | Planning & Scoping | `#ffaa00` |
| 3 | Dr. Recon | The Invisible Eye | PenTest+ | Information Gathering | `#00e5ff` |
| 4 | Code Master | The Builder | PenTest+ | Tools & Code Analysis | `#a855f7` |
| 5 | Director Sage | The Diplomat | PenTest+ | Reporting & Communication | `#10b981` |
| 6 | Viper | The Red Specter | PenTest+ | Red Team Operations | `#dc2626` |
| 7 | Benny | Robbenklopper | Linux | Linux Administration (LPI 1) | `#ff9500` |
| 8 | Tux Tina | The Terminal Wizard | Linux | Linux / DevOps / Shell Scripting | `#7c3aed` |
| 9 | Guardian | The Watchtower | Security+ | Security+ SY0-701 | `#0066ff` |
| 10 | Sergeant Harden | The Fortress | Security+ | Blue Team / Defensive Ops | `#1e40af` |
| 11 | NetRunner | The Weave | Network+ | Network+ N10-009 | `#00d4ff` |
| 12 | Cisco Kate | The Packet Surgeon | Network+ | Cisco Enterprise Networking | `#059669` |
| 13 | FixIt | The Mechanic | A+ | A+ 220-1201/1202 | `#ffaa00` |
| 14 | Tech Mom | The Fixer | A+ | A+ Hardware / Software / Support | `#e11d48` |
| 15 | Analyst Ghost | The Silent Watcher | CySA+ | CySA+ CS0-003 | `#ec4899` |
| 16 | Hunter X | The Tracker | CySA+ | Advanced Threat Hunting | `#4f46e5` |
| 17 | Architect Phantom | The Invisible Shield | CASP+ | CASP+ CAS-004 | `#14b8a6` |
| 18 | CISO Nova | The Strategist | CASP+ | Executive Security Leadership | `#0f766e` |
| 19 | Cloud Native Nate | The Sky Builder | Cloud+ | Cloud+ / AWS / Azure / GCP | `#0284c7` |

---

## KI-Tutoren (16)

Jede Zertifizierung hat **zwei dedizierte Tutoren** — einen fuer Theorie (Socratic Method, Konzeptaufbau) und einen fuer Praxis (Hands-on Labs, sofortiges Feedback).

| Zertifizierung | Theorie-Tutor | Praxis-Tutor |
|:---------------|:-------------|:-------------|
| **PenTest+ PT0-003** | Iris Thinkwell — "Understand the concept, and the tool becomes obvious." | Kyle Hackwright — "Type it. Break it. Fix it. That is how you learn." |
| **Security+ SY0-701** | Maya Clearview — "Security is not magic — it is methodical thinking." | Dex Lockhart — "Configure it once, understand it forever." |
| **Network+ N10-009** | Lena Flowstate — "Every packet tells a story. Learn to read them." | Rex Cablesmith — "Wire it, ping it, trace it — that is the way." |
| **A+ 220-1201** | Sophia Brightmind — "Hardware and software are just puzzles waiting to be solved." | Max Fixitall — "If it is broken, we fix it. If it works, we optimize it." |
| **Linux LPI-1** | Yuki Shellborn — "The command line is not scary — it is your superpower." | Bash Brody — "Type. Tab. Complete. That is the Linux way." |
| **CySA+ CS0-003** | Vera Insight — "The alert is just the beginning. The analysis tells the story." | Trace Huntley — "Follow the breadcrumbs. Every log tells a tale." |
| **CASP+ CAS-004** | Elena Stratagem — "Strategy without execution is fantasy." | Archer Enterprise — "Architect the solution. Then build it." |
| **Cloud+ CV0-003** | Nova Skywise — "The cloud is just someone else's datacenter — with better APIs." | Stratos Gearhart — "Spin up an instance. Break it. Fix it. Learn." |

---

## KI-Organizer (8)

Jeder Klassenraum hat einen **KI-Organizer** der den Lernfortschritt ueberwacht, bei Inaktivitaet eingreift und den Studienplan anpasst.

| Organizer | Zertifizierung | Triggers | Aufgaben |
|:----------|:---------------|:---------|:---------|
| **Oracle Pentest** | PT0-003 | Low domain score, Inactive 3+ days, Streak at risk | Daily targets, PBQ scheduling, Professor reassignment |
| **Sentinel Security** | SY0-701 | Weak domain, Score drop, Study gap | Domain balance, Flashcard scheduling, Weakness alerts |
| **Navigator Network** | N10-009 | Subnetting missed, Troubleshooting low, Lab incomplete | Concept-lab balance, Troubleshooting drills |
| **Atlas A+** | 220-1201 | Hardware <60%, OS weak, Practice test failed | Hardware/software balance, Lab scheduling |
| **Daemon Linux** | LPI-1 | Command practice missed, Scripting low, Permissions weak | Command practice schedule, Terminal time tracking |
| **Chronicle CySA** | CS0-003 | Log analysis low, SIEM missed, IR playbook incomplete | Log analysis scheduling, Threat intel updates |
| **Cipher CASP** | CAS-004 | Architecture low, Risk weak, Governance missed | Case studies, Risk assessment drills |
| **Cumulus Cloud** | CV0-003 | Cloud concepts weak, Security missed, Architecture low | Multi-cloud lab rotation, Provider comparison drills |

---

## Raeume & Features

### Onboarding (`/onboarding`)

Vollbild-Wizard ausserhalb des Layouts (3 Schritte). Kein Zugriff auf Dashboard oder Classroom ohne abgeschlossenes Onboarding.

| Schritt | Beschreibung |
|:--------|:-------------|
| **1. Name** | Namenseingabe, gespeichert in localStorage |
| **2. Academy Guidelines** | 5 aufklappbare Richtlinien (Learning, AI Content, Ethical Use, Privacy, No Guarantee) + Consent-Checkbox |
| **3. AI Orchestrator** | Typing-Effekt-Begruessung, JARVIS-Vorstellung, "Enter the Academy"-Button |

---

### Classroom — Grand Hall (`/classroom`)

Das Herzstueck der App. Zeigt alle 19 KI-Dozenten, organisiert in 8 Wings (Klassenraeume).

| Feature | Beschreibung |
|:--------|:-------------|
| **Welcome Header** | Animierter Typing-Effekt, JARVIS-Status ("Online"), personalisierte Begruessung |
| **Quick Stats Row** | Beantwortete Fragen, Streak, XP, Level auf einen Blick mit CountUp-Animation |
| **JARVIS Status** | Pulsierende gruene LED mit "JARVIS Online"-Anzeige |
| **Skill Assessment** | Diagnostischer Kompetenztest als Modal — bestimmt Staerken/Schwaechen ueber alle Domaenen |
| **Professor Cards** | 19 Dozenten mit Avatar, Bio, Fachgebiet, Catchphrase — Direktlinks zu Quiz und 1-on-1 Tutoring |
| **Wing Filter** | 8 Tabs: All, PenTest+, Linux, Security+, Network+, A+, CySA+, CASP+ |
| **Wing Overview Cards** | Ueberblickskarten pro Wing mit Zertifizierungs-Infos |
| **Classroom Team** | 5-Agenten-Team zugewiesen fuer den gewaehlten Zertifizierungspfad |
| **Study Streak** | Kalender-Heatmap mit Streak-Tracking und Streak-Freeze |
| **Adaptive Learning Panel** | Analysiert Quiz-Historie, empfiehlt Fokus-Bereiche und naechste Schritte |

---

### Profil-Dashboard (`/profile`)

1.775 Zeilen — das umfangreichste Modul der App.

| Sektion | Beschreibung |
|:--------|:-------------|
| **Student Header** | Avatar, Name, Titel, Einschreibungsdatum, Lernstunden |
| **XP & Level System** | Fortschrittsbalken, 10 Level (Script Kiddie → Elite Pentester), XP bis naechstes Level |
| **Skill Tree** | 8 Skill-Domaenen als Radar-Darstellung mit Mastery-Prozenten |
| **Achievement Badges** | 8+ Badges in 4 Seltenheitsstufen (Common, Rare, Epic, Legendary) mit Fortschritt |
| **Study Stats** | Beantwortete Fragen, Trefferquote, Sessions, Durchschnittsdauer |
| **Zertifizierungsfortschritt** | Fortschrittsbalken fuer 5 Zertifizierungen |
| **KI-Orchestrator Panel** | Zugewiesener Professor, Fokus-Domaenen, empfohlene naechste Schritte |
| **Wing Navigation** | 7 Wing-Karten zur Navigation — einige als "Coming Soon" gesperrt |
| **Daily Challenge** | Taegliche Aufgabe mit Countdown-Timer und Abschluss-Status |
| **Agent Communication Feed** | Terminal-artiger Feed mit KI-Agenten-Kommunikation |
| **Recent Activity** | Chronologischer Log der letzten Aktionen |

**10 XP-Level:**

| Level | Titel |
|:-----:|:------|
| 1 | Script Kiddie |
| 2 | N00b |
| 3 | Recon Ranger |
| 4 | Exploit Enthusiast |
| 5 | Vuln Hunter |
| 6 | Payload Artisan |
| 7 | Shell Shocker |
| 8 | Lateral Legend |
| 9 | Pivot Master |
| 10 | Elite Pentester |

---

### Quiz Lab (`/quiz`)

Drei Pruefungsmodi mit 7 Zertifizierungs-Datenbanken und ueber 5.000 Fragen.

**Modi:**

| Modus | Beschreibung |
|:------|:-------------|
| **Practice** | Ohne Timer, Hints aktiv, Erklaerungen nach jeder Antwort |
| **Exam** | 165-Minuten-Countdown, keine Hints, Erklaerungen erst am Ende |
| **Simulator** | CompTIA-Pruefungssimulation: 90 Fragen, 90 Minuten, 750/900 Bestehensgrenze |

**Features:**

| Feature | Beschreibung |
|:--------|:-------------|
| **Question Flagging** | Fragen zur Wiederholung markieren |
| **Question Grid** | Visuelles Raster aller Fragen — beantwortet/markiert/aktuell |
| **80/20 Hints** | Pareto-Prinzip-Tipps (max. 5 pro Session) |
| **Keyboard Shortcuts** | Pfeiltasten Navigation, Ziffern fuer Antworten, F=Flaggen, H=Hint |
| **Sprachausgabe (TTS)** | Fragen und Erklaerungen vorlesen lassen |
| **Timer-Warnungen** | Visuelle/akustische Warnung bei 5 Min und 1 Min |
| **Domain Breakdown** | Domaenen-weise Auswertung im Ergebnis |
| **Simulator Score Report** | CompTIA-konformer Score-Report mit Domaenen-Analyse |
| **Progress Persistence** | Fortschritt in localStorage speichern/laden/loeschen |
| **Quiz-Historie** | Letzte 20 Pruefungen mit Datum, Score, Modus, Zertifizierung |

---

### PBQ Arena (`/pbq`)

8 interaktive Performance-Based Question Typen mit Kategorie- und Schwierigkeitsfiltern.

| PBQ-Typ | Beschreibung |
|:--------|:-------------|
| **CertChainPBQ** | Zertifikatsketten validieren und Trust Chains verifizieren |
| **ExploitChainPBQ** | Mehrstufige Exploit-Ketten in korrekter Reihenfolge aufbauen |
| **FirewallVisualPBQ** | Visueller Firewall-Rule-Builder — Allow/Deny-Regeln konfigurieren |
| **LogRadarPBQ** | Log-Analyse — Bedrohungen und Anomalien in Log-Eintraegen identifizieren |
| **NetworkTopologyPBQ** | Netzwerk-Topologie entwerfen und analysieren |
| **TerminalPBQ** | Terminal-Challenges — korrekte Befehle in simulierter Shell ausfuehren |
| **WebVulnHotspotPBQ** | Web-Schwachstellen per Hotspot-Klick identifizieren |
| **WirelessAttackPBQ** | Wireless-Angriffsvektoren erkennen und klassifizieren |

Stats-Hero, PBQ-Historie (max. 50 Eintraege), Bestleistungs-Tracking, XP pro PBQ.

---

### KI-Tutor (`/tutor`)

1-zu-1 Chat mit lokaler KI (Ollama) — kein Cloud-Zwang, volle Privatsphaere.

| Feature | Beschreibung |
|:--------|:-------------|
| **Lokale KI** | Streaming-Antworten von Ollama (Token fuer Token) ueber `http://localhost:11434` |
| **Cloud-Fallback** | OpenRouter als alternativer LLM-Provider (Cloud) |
| **Model Selector** | Dropdown zur Auswahl des Ollama-Modells |
| **Pull Model** | Neue Modelle direkt in der App herunterladen |
| **19 System-Prompts** | Jeder Dozent hat einen 800+ Woerter System-Prompt mit Domain-Wissen, Tools und Persoenlichkeit |
| **Markdown Rendering** | Vollstaendiges Markdown mit Syntax-Highlighting und Code-Copy-Button |
| **5 Quick Actions** | 80/20 Rule, Practice Weakness, Code Example, Exam Tip, Explain Topic |
| **Voice Input** | Spracheingabe per Web Speech API (Mikrofon) |
| **TTS Output** | Sprachausgabe der KI-Antworten |
| **Weakness Sidebar** | Mastery-Kreise pro Domaene, Focus-Modus-Toggle |
| **Chat Persistence** | Gespraeche pro Professor in localStorage gespeichert |

---

### Flashcards (`/flashcards`)

SM-2 Spaced Repetition System mit 3D-Kartenflip-Animation.

| Feature | Beschreibung |
|:--------|:-------------|
| **SM-2 Algorithmus** | Industriestandard-Algorithmus fuer optimale Wiederholungsintervalle |
| **4 Bewertungsstufen** | Again (1), Hard (3), Good (4), Easy (5) |
| **7 Themen-Decks + All** | Organisiert nach Zertifizierungsdomaenen |
| **3D Card Flip** | CSS 3D-Transform fuer realistische Kartenanimation |
| **80/20 Tips** | Pareto-Prinzip-Tipps auf der Kartenrueckseite |
| **Session-Statistiken** | Gelernte Karten, Trefferquote, Zeit |
| **Due Cards Liste** | Faellige Karten basierend auf SM-2 Intervallen |
| **Keyboard Shortcuts** | Space=Umdrehen, 1-4=Bewerten, Pfeiltasten=Navigieren |

---

### Linux LPI 1 Room (`/lpi1`)

Dedizierter Raum fuer LPI Linux Essentials mit integriertem Terminal-Emulator.

| Feature | Beschreibung |
|:--------|:-------------|
| **7 Deutsche Domaenen** | Systemarchitektur, Paketmanagement, GNU-Befehle, Dateisysteme, Shell-Scripting, Desktops, Admin |
| **Terminal-Emulator** | ~20 Mock-Befehle: ls, cd, cat, grep, chmod, ps, kill, df, man u.a. |
| **Command History** | Pfeil-hoch/runter fuer Befehlshistorie |
| **Practice & Exam Mode** | Ungetimed mit Hints oder getimte Pruefungssimulation |
| **Domain-Quizzing** | Einzelne Domaenen gezielt trainieren |
| **Mastery Tracking** | Pro-Domaene Mastery-Prozentsatz in localStorage |
| **TTS** | Fragen vorlesen per SpeakerButton |

---

### Linux+ Room (`/linux-plus`)

**Freigeschaltet ab 80% LPI-1-Mastery.** Zeigt vorher einen Lock-Screen mit aktuellem Fortschritt.

| Feature | Beschreibung |
|:--------|:-------------|
| **Unlock-Gate** | 80% LPI-1-Mastery erforderlich |
| **Confetti-Animation** | Canvas-basierte Konfetti-Animation beim ersten Freischalten |
| **5 Domaenen** | System Management (22%), Security (21%), Scripting/Containers (19%), Troubleshooting (20%), Networking (18%) |
| **Gleiche Quiz-Mechanik** | Practice/Exam, 80/20 Hints, TTS, Mastery/XP/Streak |

---

### Kurskatalog (`/courses`)

Filterbarer Katalog aller 9 Kurseintraege (8 aktive + 1 Coming Soon).

| Feature | Beschreibung |
|:--------|:-------------|
| **Volltextsuche** | Ueber Titel, Exam-Code, Kategorie, Beschreibung |
| **9 Kategorie-Filter** | All, Offensive Security, Defensive Security, Blue Team, Enterprise, Networking, IT Fundamentals, Linux, Cloud |
| **3 Sortieroptionen** | Alphabetisch, Beliebtheit, Fragenanzahl |
| **Responsive Grid** | 1/2/3-spaltig mit animierten Karten |
| **Coming Soon** | Inaktive Kurse (Cloud+) entsprechend gekennzeichnet |

---

### Kursdetail (`/courses/:courseId`)

7 Tabs pro Kurs mit vollstaendigem Lernmaterial.

| Tab | Beschreibung |
|:----|:-------------|
| **Overview** | Beschreibung, Key Features, Domaenen-Gewichtung, Dozent, Pruefungsdetails |
| **Exam Simulators** | Links zu Practice/Exam/Simulator-Modi |
| **Domain Practice** | Pro-Domaene Quiz-Launcher mit Gewichtung |
| **Study Guide** | Aufklappbare Kapitel pro Domaene, Markdown mit Syntax-Highlighting |
| **Flashcards** | Link zum Flashcard-System fuer diese Zertifizierung |
| **PBQs** | Performance-Based Questions fuer diese Zertifizierung |
| **Cheatsheets** | Markdown-Cheatsheets: Nmap, Metasploit, Subnetting u.a. |

---

### Progress & Analyse (`/progress`)

| Feature | Beschreibung |
|:--------|:-------------|
| **Progress Hero** | Gesamt-Statistiken: Fragen, Trefferquote, Streak, XP |
| **Domain Breakdown** | Horizontale Fortschrittsbalken pro Domaene |
| **Weekly Study Chart** | Recharts-Balkendiagramm der letzten 7 Tage |
| **Study by Domain Chart** | Lernverteilung ueber alle Domaenen |
| **Schwaechen-Heatmap** | Farbcodiertes Raster (Rot=Schwach, Gelb=Mittel, Gruen=Stark) |
| **Badge Gallery** | 15+ Badges mit Freischalt-Status und Fortschritt |
| **Exam Strategist** | KI-gestuetzte Pruefungsstrategie: Reihenfolge, Zeitverteilung, Score-Prognose, Studienplan |
| **Fortschritts-Export/Import** | Alle Daten als JSON exportieren/importieren mit Merge/Overwrite |

---

## Kurse

<table>
  <thead>
    <tr>
      <th>Kurs</th>
      <th>Zertifizierung</th>
      <th>Level</th>
      <th>Fragen</th>
      <th>Datenbank</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>PenTest+ PT0-003</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>1.161+</td>
      <td><code>pt003_full_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>Security+ SY0-701</strong></td>
      <td>CompTIA</td>
      <td>Entry-Level</td>
      <td>850</td>
      <td><code>security_plus_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>CySA+ CS0-003</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>750</td>
      <td><code>cysa_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>CASP+ CAS-005</strong></td>
      <td>CompTIA</td>
      <td>Advanced</td>
      <td>600</td>
      <td><code>casp_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>Network+ N10-009</strong></td>
      <td>CompTIA</td>
      <td>Entry-Level</td>
      <td>900</td>
      <td><code>network_plus_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>A+ Core 1 &amp; 2</strong></td>
      <td>CompTIA</td>
      <td>Beginner</td>
      <td>700</td>
      <td><code>aplus_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>LPI Linux Essentials</strong></td>
      <td>LPI</td>
      <td>Beginner</td>
      <td>450</td>
      <td><code>lpi1_database.json</code></td>
      <td>Aktiv</td>
    </tr>
    <tr>
      <td><strong>Linux+ XK0-006</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>--</td>
      <td><code>xk006_database.json</code></td>
      <td>Freigeschaltet ab 80% LPI 1</td>
    </tr>
    <tr>
      <td><strong>Cloud+ CV0-004</strong></td>
      <td>CompTIA</td>
      <td>Intermediate</td>
      <td>--</td>
      <td>--</td>
      <td>Coming Soon</td>
    </tr>
  </tbody>
</table>

---

## Querschnitts-Features

### Gamification

| Feature | Beschreibung |
|:--------|:-------------|
| **XP-System** | Punkte fuer Quizze, Flashcards, PBQs, Daily Challenges |
| **10 Level** | Script Kiddie → Elite Pentester |
| **Study Streak** | 7-Tage-Kalender mit Streak-Tracking und Streak-Freeze |
| **Streak-Bonus** | XP-Multiplikator fuer aufeinanderfolgende Lerntage |
| **15+ Badges** | 4 Seltenheitsstufen: Common, Rare, Epic, Legendary |
| **Daily Challenge** | Taegliche Aufgabe mit Countdown-Timer |
| **Schwaechen-Analyse** | Automatische Erkennung und gezieltes Nachtraining |

### KI-Integration

| Feature | Beschreibung |
|:--------|:-------------|
| **JARVIS** | Academy AI — Zentralsteuerung, Status-Monitoring, Begruessung |
| **19 Dozenten** | Fachexperten mit 800+ Woerter System-Prompts |
| **16 Tutoren** | Je 2 pro Zertifizierung (Theorie + Praxis) |
| **8 Organizer** | Klassenmanager mit Trigger-basiertem Progress-Tracking |
| **Ollama (Lokal)** | Streaming-Chat mit lokalen LLMs — keine Cloud, volle Privatsphaere |
| **OpenRouter** | Alternativer LLM-Provider (Cloud) |
| **RAG** | Retrieval-Augmented Generation fuer kontextbasierte Antworten |
| **KI-Orchestrator** | Personalisierte Professor-Zuweisung und Lernpfad-Generierung |
| **Adaptive Learning** | Algorithmus analysiert Performance und empfiehlt Lernpfade |
| **Exam Strategist** | Score-Prognose, Studienplan, Zeitverteilung pro Domaene |

---

### Dual-LLM-Backend (`llm.ts`)

Einheitliche Abstraktionsschicht die Ollama und OpenRouter zu einem Backend verschmilzt — mit automatischem Failover.

```text
                          ┌───────────────┐
                          │    llm.ts     │   Unified Streaming API
                          │  streamLLM()  │   Backend + Fallback Config
                          └───────┬───────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
             ┌──────▼──────┐             ┌──────▼──────┐
             │   Ollama    │             │ OpenRouter  │
             │ localhost:  │  Fallback   │ 6 kostenlose│
             │   11434     │ ◄─────────► │   Modelle   │
             └─────────────┘             └─────────────┘
```

**OpenRouter Free-Modelle (6):**

| Modell | Qualitaet | Speed | Kontext |
|:-------|:---------:|:-----:|:-------:|
| **Nemotron 70B** | 10 | 6 | 128K |
| **DeepSeek V3** | 9 | 7 | 64K |
| **Llama 3.1 8B** | 7 | 9 | 128K |
| **Mistral 7B** | 7 | 10 | 32K |
| **Gemma 2 9B** | 6 | 9 | 8K |
| **Qwen 2.5 7B** | 6 | 9 | 32K |

Default-Backend ist OpenRouter (kein lokales Setup noetig). Ollama dient als Fallback oder kann manuell als primaeres Backend gesetzt werden.

---

### RAG — Retrieval-Augmented Generation (`rag.ts`)

TF-IDF-aehnliches Keyword-Scoring das Pruefungsfragen aus allen Datenbanken kontextgenau in Professor-Antworten einbettet.

| Feature | Beschreibung |
|:--------|:-------------|
| **Keyword-Scoring** | Gewichtete Suche: Question (10), Domain (8), Explanation (5), Options (3) |
| **Domain-Keywords** | 15+ domainspezifische Keyword-Listen (PenTest+, Security+, Linux) |
| **Domain-Boost** | +15 Punkte wenn Frage und Keyword aus gleicher Domaene stammen |
| **Kontext-Injektion** | Top-3 relevante Fragen werden dem System-Prompt angehaengt |
| **Weakness-Context** | Schwaechen-basierte Fragen fuer personalisiertes Tutoring |
| **Preloading** | Fragendatenbanken werden beim App-Start vorgeladen |

---

### Adaptive Learning Engine (`adaptive-learning.ts`)

Vollstaendige Lern-Intelligenz die Studentenleistung analysiert und personalisierte Lernpfade generiert.

| Feature | Beschreibung |
|:--------|:-------------|
| **Domain-Gewichtung** | CompTIA-offizielle Gewichtung: Attacks 30%, Info Gathering 22%, Planning 14%, etc. |
| **Subdomain-Mapping** | 30+ Subdomains (SQL Injection, Nmap Scanning, CVSS Scoring, etc.) |
| **Priority Queue** | Urgency-sortierte Lernpfade mit geschaetzter Studienzeit pro Thema |
| **Exam Readiness** | Gewichteter Score (0-100%) ueber alle Domaenen |
| **Learning Rate** | Fragen/Stunde — passt sich automatisch an Lerngeschwindigkeit an |
| **Daily Targets** | 15-50 Fragen/Tag, basierend auf Schwaechen-Anzahl |
| **Milestone-System** | 4 Meilensteine: Foundation → Attack Mastery → Vuln Ready → Exam Ready |
| **Streak-Tracking** | Current/Longest Streak mit automatischer Tages-Erkennung |
| **5-Minuten-Refresh** | State aktualisiert sich alle 300 Sekunden automatisch |

---

### KI-Orchestrator (`orchestrator.ts`)

JARVIS weist jedem Studenten basierend auf dem Skill Assessment ein optimales 5-Agenten-Team zu.

```text
 Assessment → schwachste Domaene → Professor-Mapping → Team-Zuweisung

 Beispiel (PenTest+):
 ┌─────────────────────────────────────────────────────┐
 │  Professor 1:  Professor Cipher (Lead)              │
 │  Professor 2:  Red Viper (Support)                  │
 │  Tutor 1:      Iris Thinkwell (Theorie)             │
 │  Tutor 2:      Kyle Hackwright (Praxis)             │
 │  Organizer:    Oracle Pentest (automatisch)         │
 └─────────────────────────────────────────────────────┘
```

| Feature | Beschreibung |
|:--------|:-------------|
| **12 Domain-Mappings** | Jede Domaene hat 2 Professor-Kandidaten |
| **Level-Zuweisung** | Beginner → geduldigerer Professor, Advanced → Experte |
| **Daily Targets** | 15 (Beginner), 25 (Intermediate), 40 (Advanced) Fragen/Tag |
| **PBQ-Frequenz** | Alle 2 (Advanced), 3 (Intermediate), 4 (Beginner) Tage |
| **Tutor-Routing** | Keyword-Analyse routet Fragen zu Theory- oder Practice-Tutor |
| **Trigger-System** | Organizer prueft Streak, Exam Readiness, Weak Domains automatisch |
| **Personalisierte Begruessung** | 4 rotierende Nachrichten basierend auf Assignment und Wochentag |

---

### Exam Strategist (Detail)

Umfassende Pruefungsvorbereitung mit 3 vorgefertigten Studienplaenen und Live-Countdown.

**30-60-90-Tage-Studienplaene:**

| Plan | Fragen/Tag | Meilensteine | Strategie |
|:-----|:----------:|:------------:|:----------|
| **30-Tage** | 40 | 4 Wochen | Foundation Sprint → Weakness Attack → PBQ Mastery → Exam Simulation |
| **60-Tage** | 25 | 6 Wochen | Domain Exploration → Deep Dive → PBQ Intro → Midpoint → Advanced → Sprint |
| **90-Tage** | 15 | 10 Wochen | Orientation → Foundation → Deep Learning → PBQ Practice → Checkpoints → Final |

| Feature | Beschreibung |
|:--------|:-------------|
| **Live-Countdown** | Sekunden-genauer Countdown zum Pruefungsdatum (Tage/Stunden/Minuten/Sekunden) |
| **Milestone-Tracker** | Klickbare Wochen-Meilensteine mit Fortschrittsbalken |
| **Daily Target Card** | Heutiger Fortschritt vs. Tages-Ziel mit +5/+10 Quick-Buttons |
| **Exam Day Tips** | 6 strategische Tipps (Zeitverteilung, PBQ-Reihenfolge, Flagging, Schlaf) |
| **Motivations-Zitate** | Taegliches Zitat (6 rotierende, in localStorage persistiert) |
| **Pruefungsdatum-Picker** | Datum frei waehlbar, gespeichert in localStorage |

---

### Sprache & Audio

| Feature | Beschreibung |
|:--------|:-------------|
| **ElevenLabs TTS** | Premium-Sprachausgabe ueber ElevenLabs API mit 9 professor-spezifischen Stimmen |
| **Professor-Voices** | Jeder Professor hat eine eigene ElevenLabs-Stimme (Antoni, Domi, Rachel, Josh, Bella, Elli, Arnold) |
| **Web Speech Fallback** | Automatischer Fallback auf Browser-TTS wenn ElevenLabs fehlschlaegt |
| **Voice Input** | Spracheingabe im Tutor per Web Speech API (Mikrofon) |
| **SpeakerButton** | Universelle TTS-Komponente in Quiz, Tutor, Flashcards, LPI1, Linux+ |
| **Abort-Steuerung** | Laufende Sprachausgabe jederzeit stoppbar (AbortController) |

**ElevenLabs Voice-Mapping:**

| Professor | Voice | Charakter |
|:----------|:------|:----------|
| Professor Cipher | Antoni | Herausfordernd, maennlich |
| Agent Shield | Domi | Ruhig, schuetzend, weiblich |
| Dr. Recon | Arnold | Analytisch, maennlich |
| Code Master | Josh | Praktisch, maennlich |
| Director Sage | Rachel | Weise, weiblich |
| Professor Fixit | Elli | Ermutigend, weiblich |
| Professor Guardian | Bella | Vorsichtig, weiblich |
| NetRunner | Antoni | Technisch, maennlich |
| Benny | Josh | Geduldig, maennlich |

---

### Navigation (`Navbar.tsx`)

Kollabierbares Seitenleisten-Menue mit Hover-Erweiterung und kontextabhaengiger Hervorhebung.

| Feature | Beschreibung |
|:--------|:-------------|
| **Hover-Expand** | 72px kollabiert → 240px bei Maus-Hover mit Framer Motion |
| **Active-Indicator** | Animierter gruener Balken (layoutId) zeigt aktive Route |
| **8 Haupt-Links** | Dashboard, Classroom, Kurse, Quiz Lab, PBQ Arena, Tutor, Progress, Flashcards |
| **CySA+ Lab** | Direktlink zu `/quiz?cert=cysa` mit pinkem Akzent |
| **CASP+ Lab** | Direktlink zu `/quiz?cert=casp` mit teal Akzent |
| **Linux-Sektion** | Aufklappbare Sub-Navigation mit LPI 1 und Linux+ XK0-006 |
| **Lock-Anzeige** | Linux+ zeigt Lock-Icon + "80%" wenn LPI-1-Mastery < 80% |
| **XP-Footer** | Aktueller XP-Stand und Level am unteren Rand |

---

### 80/20 Pareto-System

Durchgaengiges Konzept: Die 20% des Wissens, die 80% der Pruefung abdecken.

- **Quiz**: Max. 5 Hints pro Session
- **Flashcards**: Pareto-Tipps auf der Kartenrueckseite
- **Tutor**: Quick Action "80/20 Rule"
- **Linux Rooms**: Integrierte 80/20 Hints

---

### Protected Routes & Guards

| Feature | Beschreibung |
|:--------|:-------------|
| **Onboarding-Guard** | `/` und `/classroom` leiten zu `/onboarding` um wenn `trygit_onboarding_complete` nicht gesetzt |
| **Linux+ Unlock-Gate** | `/linux-plus` zeigt Lock-Screen bis `lpi1_mastery >= 80` |
| **Onboarding-Ausschluss** | `/onboarding` liegt ausserhalb des Layout (kein Navbar, kein Footer) |

### PBQ-Details

Jeder PBQ-Typ hat eigene Metadaten fuer XP, Zeitschaetzung und Schwierigkeit.

| PBQ | Kategorie | Schwierigkeit | XP | Zeit |
|:----|:----------|:-------------:|:--:|:----:|
| Network Topology Analyzer | PenTest+ | 3/5 | 50 | 8 min |
| Interactive Terminal | PenTest+ | 3/5 | 60 | 10 min |
| Web Vulnerability Scanner | Security+ | 2/5 | 40 | 6 min |
| Firewall Rule Architect | Security+ | 4/5 | 55 | 10 min |
| Certificate Chain Validator | Security+ | 3/5 | 45 | 7 min |
| Log Analysis Radar | Security+ | 4/5 | 55 | 10 min |
| Wireless Attack Visualizer | PenTest+ | 3/5 | 50 | 8 min |
| Exploit Chain Builder | PenTest+ | 5/5 | 70 | 12 min |

Alle PBQ-Komponenten werden per `React.lazy()` geladen und mit `Suspense` gerendert.

---

## Tech Stack

### Core

| Technologie | Version | Zweck |
|:------------|:--------|:------|
| **React** | 19.2.0 | UI-Framework (Client-Side SPA) |
| **TypeScript** | 5.9.3 | Typsicheres JavaScript |
| **Vite** | 7.2.4 | Build-Tool und Dev-Server |
| **Tailwind CSS** | 3.4.19 | Utility-First CSS |
| **React Router DOM** | 7.15.1 | Client-Side Routing (BrowserRouter) |
| **Framer Motion** | 12.40.0 | Animationen und Layout-Transitionen |

### UI-Bibliotheken

| Paket | Version | Zweck |
|:------|:--------|:------|
| **shadcn/ui** | -- | Radix-basierte Komponenten (40+ Primitives) |
| **Radix UI** | diverse | Barrierefreie Primitives (Accordion, Dialog, Tabs, Tooltip, etc.) |
| **Lucide React** | 0.562.0 | 1.500+ SVG-Icons |
| **cmdk** | 1.1.1 | Command-Palette (⌘K) |
| **Sonner** | 2.0.7 | Toast-Benachrichtigungen |
| **Vaul** | 1.1.2 | Drawer-Komponente |
| **Embla Carousel** | 8.6.0 | Karussell-Slider |
| **react-resizable-panels** | 4.2.2 | Anpassbare Panel-Layouts |
| **input-otp** | 1.4.2 | OTP-Eingabefelder |

### Daten & Rendering

| Paket | Version | Zweck |
|:------|:--------|:------|
| **Recharts** | 2.15.4 | Diagramme (Bar, Line, Radar, Pie) |
| **react-markdown** | 10.1.0 | Markdown-Rendering im Tutor-Chat |
| **remark-gfm** | 4.0.1 | GitHub-Flavored Markdown (Tabellen, Checklisten) |
| **react-syntax-highlighter** | 16.1.1 | Code-Syntax-Highlighting |
| **react-day-picker** | 9.13.0 | Kalender-Datumsauswahl |
| **date-fns** | 4.1.0 | Datumsformatierung |

### Formulare & Validierung

| Paket | Version | Zweck |
|:------|:--------|:------|
| **react-hook-form** | 7.70.0 | Formular-Handling |
| **@hookform/resolvers** | 5.2.2 | Schema-Validierung fuer react-hook-form |
| **Zod** | 4.3.5 | Schema-Deklaration und Validierung |

### Utility

| Paket | Version | Zweck |
|:------|:--------|:------|
| **clsx** | 2.1.1 | Bedingte CSS-Klassen |
| **tailwind-merge** | 3.4.0 | Tailwind-Klassen-Merge ohne Konflikte |
| **class-variance-authority** | 0.7.1 | Komponenten-Varianten (shadcn/ui) |
| **next-themes** | 0.4.6 | Theme-Provider |

### KI & Audio

| Technologie | Beschreibung |
|:------------|:-------------|
| **Ollama** | Lokales LLM-Hosting (localhost:11434) — keine Cloud noetig |
| **OpenRouter** | Cloud-LLM-Provider mit 6 kostenlosen Modellen |
| **ElevenLabs** | Premium Text-to-Speech mit 9 professor-spezifischen Stimmen |
| **Web Speech API** | Browser-native Spracheingabe (STT) und Fallback-Sprachausgabe (TTS) |

### State-Management

Kein globaler State-Manager — alle Nutzerdaten werden clientseitig in **localStorage** persistiert (70+ Keys). Die App funktioniert vollstaendig ohne Backend, ohne Account, ohne Internet (bei Ollama).

---

## Installation

```bash
git clone https://github.com/krockodog/Cybersecurity-Gym.git
cd Cybersecurity-Gym/app
npm install
npm run dev
```

Die App laeuft dann unter `http://localhost:5173`.

### Mit KI-Tutoring (optional)

Fuer lokales KI-Tutoring muss Ollama auf dem gleichen Rechner laufen. Die App verbindet sich mit `http://localhost:11434`.

```bash
# 1. Ollama installieren (https://ollama.ai)
# 2. Ollama starten
ollama serve

# 3. Ein Modell herunterladen (z.B. llama3.1)
ollama pull llama3.1

# 4. In der App: Tutor oeffnen → Modell aus dem Dropdown waehlen
#    Neue Modelle koennen auch direkt in der App per "Pull Model" geladen werden
```

Alternativ kann OpenRouter als Cloud-Backend verwendet werden — die Konfiguration erfolgt in der App.

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
│   │   ├── courses.json                # Kurskatalog (9 Eintraege)
│   │   ├── professors.json             # 19 Dozenten + 8 Wings + JARVIS
│   │   ├── pt003_full_database.json    # PenTest+ PT0-003 (1.161 Fragen)
│   │   ├── exam_database.json          # Allgemeine Pruefungsfragen
│   │   ├── security_plus_database.json # Security+ SY0-701
│   │   ├── cysa_database.json          # CySA+ CS0-003
│   │   ├── casp_database.json          # CASP+ CAS-004
│   │   ├── network_plus_database.json  # Network+ N10-009
│   │   ├── aplus_database.json         # A+ 220-1201/1202
│   │   ├── lpi1_database.json          # LPI Linux Essentials
│   │   ├── xk006_database.json         # Linux+ XK0-006
│   │   └── *.png                       # Professor-Avatare
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                     # 40+ shadcn/ui Radix-Primitives
│   │   │   ├── onboarding/
│   │   │   │   └── OnboardingFlow.tsx  # 3-Schritte-Wizard (Vollbild)
│   │   │   ├── pbq/
│   │   │   │   ├── index.ts            # React.lazy() Exports (8 PBQs)
│   │   │   │   ├── metadata.ts         # PBQ-Metadaten (XP, Difficulty, Time)
│   │   │   │   ├── CertChainPBQ.tsx
│   │   │   │   ├── ExploitChainPBQ.tsx
│   │   │   │   ├── FirewallVisualPBQ.tsx
│   │   │   │   ├── LogRadarPBQ.tsx
│   │   │   │   ├── NetworkTopologyPBQ.tsx
│   │   │   │   ├── TerminalPBQ.tsx
│   │   │   │   ├── WebVulnHotspotPBQ.tsx
│   │   │   │   ├── WirelessAttackPBQ.tsx
│   │   │   │   └── shared/
│   │   │   │       ├── types.ts          # PBQ-Interfaces
│   │   │   │       ├── animations.ts     # Framer Motion Presets
│   │   │   │       ├── FeedbackOverlay.tsx  # Richtig/Falsch-Overlay
│   │   │   │       └── ProgressTracker.tsx  # PBQ-Fortschrittsanzeige
│   │   │   ├── Navbar.tsx              # Seitennavigation (72px→240px)
│   │   │   ├── Layout.tsx              # Navbar + Outlet + Footer
│   │   │   ├── Footer.tsx              # Branding-Footer
│   │   │   ├── SkillAssessment.tsx     # 10-Fragen Diagnostik-Test
│   │   │   ├── AdaptiveLearningPanel.tsx  # Urgency/Readiness Empfehlungen
│   │   │   ├── ExamStrategist.tsx      # 30/60/90-Tage Studienplaene
│   │   │   ├── StudyStreak.tsx         # 7-Tage-Kalender-Heatmap
│   │   │   ├── ClassroomTeam.tsx       # 5-Agenten-Team Grid
│   │   │   ├── ProgressExportImport.tsx  # JSON Export/Import (v7.1)
│   │   │   ├── SpeakerButton.tsx       # Universelle TTS-Komponente
│   │   │   └── AnimatedGrid.tsx        # Hintergrund-Raster + Glow
│   │   ├── pages/
│   │   │   ├── Classroom.tsx           # Grand Hall (1.329 Zeilen)
│   │   │   ├── Profile.tsx             # Profil-Dashboard (1.775 Zeilen)
│   │   │   ├── Courses.tsx             # Kurskatalog (Filter, Suche)
│   │   │   ├── CourseDetail.tsx         # Kursdetail (7 Tabs)
│   │   │   ├── Quiz.tsx                # Quiz Lab (1.987 Zeilen)
│   │   │   ├── PBQ.tsx                 # PBQ Arena (8 Typen)
│   │   │   ├── Tutor.tsx               # KI-Tutor Chat (1.288 Zeilen)
│   │   │   ├── Flashcards.tsx          # SM-2 Karteikarten
│   │   │   ├── Progress.tsx            # Fortschritt & Analyse
│   │   │   ├── LPI1Room.tsx            # Linux LPI 1 + Terminal
│   │   │   ├── LinuxPlusRoom.tsx       # Linux+ (ab 80% LPI 1)
│   │   │   └── PlaceholderPage.tsx     # Coming-Soon-Platzhalter
│   │   ├── services/
│   │   │   ├── ollama.ts               # Ollama Streaming + 19 System-Prompts
│   │   │   ├── openrouter.ts           # OpenRouter SSE + 6 Free Models
│   │   │   ├── llm.ts                  # Unified LLM-Abstraktionsschicht
│   │   │   ├── rag.ts                  # TF-IDF Keyword-Scoring (5 DBs)
│   │   │   ├── adaptive-learning.ts    # Adaptiver Lernalgorithmus (679 Z.)
│   │   │   ├── orchestrator.ts         # KI-Orchestrator JARVIS (357 Z.)
│   │   │   ├── professor-data.ts       # 19 Dozenten-Definitionen
│   │   │   ├── tutor-data.ts           # 16 Tutoren (Theorie + Praxis)
│   │   │   └── organizer-data.ts       # 8 KI-Organizer-Definitionen
│   │   ├── hooks/
│   │   │   ├── useTTS.ts              # ElevenLabs + Web Speech API
│   │   │   └── use-mobile.ts          # Mobile-Viewport-Erkennung
│   │   ├── lib/
│   │   │   └── utils.ts               # cn() — clsx + tailwind-merge
│   │   ├── main.tsx                    # React-Root + BrowserRouter
│   │   ├── App.tsx                     # Router (13 Routen)
│   │   └── index.css                   # Design-Tokens + Type-Scale
│   ├── package.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
└── README.md
```

---

## Routen

| Route | Seite | Beschreibung |
|:------|:------|:-------------|
| `/onboarding` | Onboarding | Vollbild-Wizard (ausserhalb Layout) |
| `/` | Grand Hall | Dashboard mit 19 Dozenten, Streak, Adaptive Learning |
| `/classroom` | Classroom | Grand Hall (Alias) |
| `/profile` | Profil | XP, Level, Badges, Skill Tree, Daily Challenge, Agent Feed |
| `/courses` | Kurskatalog | 9 Kurseintraege mit Suche, Filter, Sortierung |
| `/courses/:courseId` | Kursdetails | 7 Tabs: Overview, Simulators, Practice, Guide, Cards, PBQs, Cheatsheets |
| `/quiz` | Quiz Lab | 3 Modi, 7 Datenbanken, 5.000+ Fragen |
| `/pbq` | PBQ Arena | 8 interaktive PBQ-Typen |
| `/tutor` | KI-Tutor | 1-zu-1 Chat mit Ollama, Voice I/O |
| `/flashcards` | Karteikarten | SM-2 Spaced Repetition, 3D-Flip |
| `/progress` | Fortschritt | Heatmap, Charts, Badges, Exam Strategist, Export |
| `/lpi1` | Linux LPI 1 | 7 Domaenen + Terminal-Emulator |
| `/linux-plus` | Linux+ XK0-006 | Freigeschaltet ab 80% LPI 1 |

---

## Design-System

### Farbpalette (Hex Design-Tokens)

| Token | Hex | Zweck |
|:------|:----|:------|
| `--bg-primary` | `#0a0e17` | Haupthintergrund |
| `--bg-secondary` | `#0d1526` | Karten, Navbar |
| `--bg-tertiary` | `#111d2e` | Erhoeht (Hover) |
| `--bg-elevated` | `#162236` | Modals, Popover |
| `--accent-green` | `#00ff41` | Primaer-Akzent (Erfolg, XP, aktiv) |
| `--accent-blue` | `#00d4ff` | Sekundaer-Akzent (Links, Hover) |
| `--accent-purple` | `#8b5cf6` | PBQ, Code-Hervorhebung |
| `--accent-orange` | `#ff7b00` | Linux-Sektion |
| `--accent-red` | `#ff3366` | PenTest+, Fehler, Destruktiv |
| `--text-primary` | `#e0f2fe` | Haupttext |
| `--text-secondary` | `#7da0c4` | Sekundaertext |
| `--text-muted` | `#4a6682` | Gedaempfter Text, Platzhalter |
| `--border-subtle` | `#1a2d45` | Standard-Rahmen |
| `--border-active` | `#00d4ff` | Aktiver Rahmen |
| `--border-green` | `#00ff41` | Erfolgs-Rahmen |

### HSL-Tokens (shadcn/ui Kompatibel)

```text
--background:    220 40% 5%       --primary:         145 100% 50%
--foreground:    202 94% 94%      --secondary:       193 100% 50%
--card:          220 35% 8%       --destructive:     345 100% 60%
--muted:         215 30% 15%      --border:          213 35% 18%
--accent:        215 30% 15%      --ring:            193 100% 50%
```

### Typografie

4 Schriftfamilien mit 10 Utility-Klassen und responsivem Type-Scale:

| Klasse | Schrift | Groesse | Gewicht |
|:-------|:--------|:--------|:--------|
| `.font-display` | JetBrains Mono | -- | -- |
| `.font-body` | Inter | -- | -- |
| `.font-terminal` | JetBrains Mono | -- | -- |
| `.font-decorative` | Share Tech Mono | -- | -- |
| `.text-display` | JetBrains Mono | `clamp(2.5rem, 5vw, 4.5rem)` | 800 |
| `.text-h1` | JetBrains Mono | `clamp(2rem, 4vw, 3.5rem)` | 700 |
| `.text-h2` | JetBrains Mono | `clamp(1.5rem, 3vw, 2.5rem)` | 700 |
| `.text-h3` | JetBrains Mono | `clamp(1.25rem, 2vw, 1.75rem)` | 600 |
| `.text-h4` | Inter | `1.125rem` | 600 |
| `.text-body` | Inter | `1rem` | 400 |
| `.text-body-sm` | Inter | `0.875rem` | 400 |
| `.text-caption` | Inter | `0.75rem` | 500 |
| `.text-terminal` | JetBrains Mono | `0.8125rem` | 400 |
| `.text-xp` | JetBrains Mono | `0.875rem` | 700 |
| `.text-badge` | JetBrains Mono | `0.6875rem` | 700 |

### Easing-Variablen

| Variable | Wert | Einsatz |
|:---------|:-----|:--------|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard-Transitionen |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Bounce-Effekte (Badges, XP) |
| `--ease-expo-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Schnelle Exits (Modals) |
| `--ease-smooth` | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` | Sanfte Uebergaenge |

### Gradient-Utilities

| Klasse | Beschreibung |
|:-------|:-------------|
| `.gradient-hero` | 3-Punkt-Verlauf fuer Hero-Bereiche |
| `.gradient-green-glow` | Radiales gruenes Leuchten |
| `.gradient-blue-glow` | Radiales blaues Leuchten |
| `.gradient-card` | Karten-Hintergrund (`#0d1526` → `#111d2e`) |
| `.gradient-terminal` | Terminal-Hintergrund (dunkel) |
| `.gradient-progress` | Gruen-nach-Cyan Fortschrittsbalken |
| `.gradient-rainbow` | 5-Farben-Regenbogen (Achievement-Highlights) |

### Spezialeffekte

| Klasse | Beschreibung |
|:-------|:-------------|
| `.scanlines` | CRT-Scanline-Overlay (rgba gruen, 2px Streifen) |
| `.grid-bg` | 50px Raster-Hintergrund (Cyan-Linien) |
| `.glitch-text` | Hover-Glitch-Effekt (Rot/Cyan Text-Shadow) |
| `.stat-card` | Hover-animierte Statistik-Karten mit Border-Glow |
| `.scrollbar-thin` | Schmale benutzerdefinierte Scrollbar (6px) |

---

## Datenmodell

Alle Nutzerdaten werden clientseitig in `localStorage` gespeichert — kein Backend, kein Account noetig.

```text
localStorage Keys:
├── Onboarding
│   ├── trygit_onboarding_complete     # Onboarding abgeschlossen (boolean)
│   ├── trygit_student_name            # Name des Studenten
│   └── trygit_consent_given           # Academy Guidelines akzeptiert
├── Fortschritt
│   ├── trygit_xp                      # XP-Punkte
│   ├── trygit_level                   # Aktuelles Level (1-10)
│   ├── trygit_streak                  # Study Streak (Tage)
│   ├── trygit_questions_answered      # Gesamt beantwortete Fragen
│   ├── trygit_user_state              # Profil-Dashboard State (JSON)
│   └── trygit_daily_progress          # Taeglicher Fortschritt
├── Quiz & Flashcards
│   ├── trygit-quiz-progress-{cert}    # Quiz-Fortschritt pro Kurs
│   ├── trygit-quiz-history            # Quiz-Historie (max. 20)
│   ├── quiz_results                   # Quiz-Ergebnisse (Tutor-Kontext)
│   └── trygit-flashcards-{cert}       # Flashcard SM-2 Daten
├── PBQ
│   ├── trygit-pbq-history-v2          # PBQ-Verlauf
│   └── trygit-pbq-progress            # PBQ-Fortschritt
├── KI & Assessment
│   ├── trygit_skill_assessment        # Kompetenztest-Ergebnisse
│   ├── trygit_difficulty              # Schwierigkeitseinstellung
│   ├── trygit_selected_professor      # Ausgewaehlter Dozent
│   ├── trygit_orchestrator_assignment # KI-Orchestrator Zuweisung
│   └── trygit-tutor-chat-{prof}       # Chat-Historie pro Professor
├── Linux
│   ├── lpi1_mastery                   # LPI-1 Mastery (Unlock-Gate)
│   ├── lpi1_results                   # LPI-1 Ergebnisse
│   ├── xk006_mastery                  # Linux+ Mastery
│   ├── xk006_answered                 # Linux+ beantwortete Fragen
│   ├── xk006_streak                   # Linux+ Streak
│   └── xk006_celebration_seen         # Freischaltungs-Animation gesehen
├── Exam Strategist
│   ├── trygit_exam_date               # Pruefungsdatum
│   ├── trygit_quote_index             # Motivations-Zitat Index
│   └── trygit_quote_date              # Letztes Zitat-Datum
└── Badges
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
  <sub>&copy; 2024-2026 trygit.me</sub>
</p>
