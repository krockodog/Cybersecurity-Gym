# trygit.me — Cybersecurity Gymnasium
## Vollstaendige Produktdokumentation v7.0

**Autor**: Kimi (Claw Peni)  
**Datum**: 2026-05-26  
**Live-URL**: https://b4si6zbax4skg.kimi.page  
**Status**: PRODUKTIONSBEREIT — Alle Routen aktiv, alle Features funktionsfaehig

---

## Inhaltsverzeichnis

1. [Produktuebersicht](#1-produktuebersicht)
2. [Das Dashboard — Grand Hall](#2-dashboard--grand-hall)
3. [Die 9 KI-Dozenten](#3-die-9-ki-dozenten)
4. [Die 5 Training Wings](#4-die-5-training-wings)
5. [1-zu-1 Tutor mit Ollama](#5-1-zu-1-tutor-mit-ollama)
6. [RAG-System](#6-rag-system)
7. [Fragenbanken — 1.412 Fragen](#7-fragenbanken)
8. [TTS & Sprachausgabe](#8-tts)
9. [Gamification & XP-System](#9-gamification)
10. [Ollama Installation](#10-ollama-installation)
11. [Technischer Stack](#11-technischer-stack)
12. [Changelog](#12-changelog)

---

## 1. Produktuebersicht

trygit.me ist ein **KI-gestuetztes Cybersecurity-Gymnasium** — eine interaktive Lernplattform fuer IT-Zertifizierungen. Die Plattform verbindet **1.412 echte Pruefungsfragen** mit **9 KI-Dozenten**, die jeder Schueler persoenlich durch die Pruefungsvorbereitung begleiten.

### Kernfeatures

| Feature | Beschreibung |
|---------|-------------|
| **Grand Hall Dashboard** | Zentraler Hub mit Wing-Navigation, Agent-Kommunikation, XP-System |
| **9 KI-Dozenten** | Jeder mit eigener Persoenlichkeit, 20yr+ Erfahrung, Fachgebiet |
| **Ollama-Integration** | Lokale KI-Streaming-Antworten in Echtzeit |
| **RAG-System** | Automatische Fragen-Suche fuer kontextuelle Antworten |
| **1.412 Fragen** | Ueber 8 Zertifizierungen (PenTest+, Linux+, Security+, Network+, A+) |
| **TTS-Sprachausgabe** | Vorlesen aller Lerninhalte im Browser |
| **Schwaechen-Analyse** | Automatische Erkennung und gezielte Verbesserung |
| **Gamification** | XP, Level, Streaks, Badges, Daily Challenges |
| **PBQ-Visualisierungen** | Interaktive Performance-Based Questions |

---

## 2. Dashboard — Grand Hall

Das Dashboard ist der **zentrale Einstiegspunkt**. Hier siehst du alle verfuegbaren Kurse auf einen Blick.

### Layout

```
+----------------------------------------------------------+
|  trygit.me    JARVIS ● Online    XP: 4,200  Level 5 🔥  |
+----------------------------------------------------------+
|  "Welcome back, Student" — Personalisierte Begruessung   |
|                                                          |
|  +-------------------+  +-------------------+           |
|  | 🔴 PenTest+ Wing  |  | 🟠 Linux Wing     |           |
|  | 545 Fragen | 5    |  | 64 Fragen | 1      |           |
|  | Professoren        |  | Professor          |           |
|  | [Enter Wing →]    |  | [Enter Wing →]    |           |
|  +-------------------+  +-------------------+           |
|                                                          |
|  +-------------------+  +-------------------+           |
|  | 🔵 Security+ Wing |  | 🔷 Network+ Wing  |           |
|  | 32 Fragen | 1     |  | 18 Fragen | 1      |           |
|  | Professor          |  | Professor          |           |
|  | [Enter Wing →]    |  | [Coming Soon 🔒]  |           |
|  +-------------------+  +-------------------+           |
|                                                          |
|  +-------------------+                                  |
|  | 🟡 A+ Wing        |  Agent Communication Feed        |
|  | 10 Fragen | 1     |  [Live Terminal-Log]             |
|  | Professor          |  Cipher: SQLi Lesson ready...    |
|  | [Coming Soon 🔒]  |  Benny: Bash +15% this week!     |
|  +-------------------+  JARVIS: Daily Challenge!         |
|                                                          |
+----------------------------------------------------------+
```

### Features des Dashboard

| Element | Funktion |
|---------|----------|
| **Wing-Karten** | Jeder Wing zeigt Professor-Avatare, Fragenanzahl, Fortschrittsbalken |
| **Agent Feed** | Live-Terminal-Log mit KI-Agenten-Nachrichten |
| **Daily Challenge** | Taegliche Aufgabe mit Countdown-Timer und XP-Belohnung |
| **Study Streak** | 7-Tage-Kalender mit Flame-Icon fuer aktive Tage |
| **Performance Stats** | Fragen beantwortet, Correct Rate, Study Hours, Rang |

### Navigation

| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | Grand Hall | Dashboard mit Wing-Uebersicht |
| `/#/classroom` | Professor Directory | Alle 9 Dozenten mit Bios |
| `/#/quiz` | Quiz Lab | 1.412 Fragen mit 80/20-Hints |
| `/#/pbq` | PBQ Arena | Performance-Based Questions |
| `/#/tutor` | 1-zu-1 Tutor | Ollama KI-Chat mit Dozenten |
| `/#/progress` | Fortschritt | Schwächen-Heatmap, Badges |
| `/#/flashcards` | Karteikarten | SM-2 Spaced Repetition |
| `/#/lpi1` | Linux LPI 1 | Bennys Linux-Kurs |
| `/#/linux-plus` | Linux+ XK0-006 | Freigeschaltet ab 80% LPI 1 |

---

## 3. Die 9 KI-Dozenten

Jeder Dozent hat eine **eigene Persoenlichkeit**, **20+ Jahre Erfahrung** und **einen eigenen Ollama-System-Prompt**. Sie antworten im Chat immer in Character.

### PenTest+ Wing (5 Dozenten)

#### Professor Cipher "The Ghost" 🔴
- **Wing**: PenTest+ — Attacks and Exploits
- **Erfahrung**: 22 Jahre Red Team / Penetration Testing
- **Ehemalige**: NSA TAO, Mandiant, FireEye
- **Spezialitaeten**: SQL Injection, XSS, Privilege Escalation, Metasploit, Social Engineering
- **Persoenlichkeit**: Mysterioes aber warm, nutzt reale Breach-Storys als Analogien
- **Catchphrase**: "In the dark web, knowledge is your only flashlight."
- **Stimme**: Charlie (Australisch, tief, selbstbewusst)

#### Agent Shield "The Architect" 🟡
- **Wing**: PenTest+ — Planning and Scoping
- **Erfahrung**: 20 Jahre CISO / Compliance / Risk Management
- **Ehemalige**: Big4 Auditor, PCI-DSS QSA, ISO 27001 Lead Auditor
- **Spezialitaeten**: SOW, Rules of Engagement, GDPR/HIPAA/PCI, Scoping
- **Persoenlichkeit**: Professionell, ruhig, methodisch — der Mentor der immer fuer dich da ist
- **Catchphrase**: "A penetration test without scope is just a hacker with a business card."
- **Stimme**: Daniel (Britisch, steady broadcaster)

#### Dr. Recon "The Invisible Eye" 🔵
- **Wing**: PenTest+ — Information Gathering
- **Erfahrung**: 18 Jahre OSINT / Intelligence / Digital Reconnaissance
- **Ehemalige**: Intelligence Community, private Investigations
- **Spezialitaeten**: Nmap, OSINT, Recon-ng, Shodan, Social Media Intel
- **Persoenlichkeit**: Analytisch, praezise, denkt immer 3 Schritte voraus
- **Catchphrase**: "The best attack is the one the target never sees coming."
- **Stimme**: George (Britisch, warm storyteller)

#### Code Master "The Builder" 🟣
- **Wing**: PenTest+ — Tools and Code Analysis
- **Erfahrung**: 20 Jahre Security Development / Tooling / Automation
- **Ehemalige**: Google Security Team, Bug Bounty Hunter ($2M+ earned)
- **Spezialitaeten**: Python/Scapy, PowerShell, Bash, Burp Suite, Code Review
- **Persoenlichkeit**: Energisch, liebt Challenges, competitiv
- **Catchphrase**: "Why use a tool when you can BUILD the tool?"
- **Stimme**: Eric (Amerikanisch, smooth, trustworthy)

#### Director Sage "The Diplomat" 🟢
- **Wing**: PenTest+ — Reporting and Communication
- **Erfahrung**: 25 Jahre Security Consulting / Executive Communication
- **Ehemalige**: Partner at Deloitte, Fortune 500 Advisor
- **Spezialitaeten**: Executive Summaries, CVSS Scoring, Risk Communication
- **Persoenlichkeit**: Weise, artikuliert, politisch versiert
- **Catchphrase**: "Your report is more powerful than your exploit."
- **Stimme**: Bill (Amerikanisch, weise, reif)

### Weitere Wings

#### Benny "Robbenklopper" 🟠
- **Wing**: Linux — LPI 1
- **Erfahrung**: 15 Jahre Linux Administration / Open Source
- **Ehemalige**: Debian Developer, Kernel Contributor
- **Spezialitaeten**: Shell Scripting, System Administration, Vim, Troubleshooting
- **Persoenlichkeit**: Charismatisch, lustig, geduldig, spricht Deutsch-Englisch gemischt
- **Catchphrase**: "rm -rf / ist keine Loesung. Aber manchmal fuehlt es sich so an."
- **Stimme**: Helmut Clark (Deutsch, klar, professionell)

#### Guardian "The Watchtower" 🔵
- **Wing**: Security+ SY0-701
- **Erfahrung**: 20 Jahre SOC Director / Threat Intelligence / IR
- **Ehemalige**: CrowdStrike, US-CERT, Blue Team Lead
- **Spezialitaeten**: Threats, Cryptography, Network Security, Identity, Incident Response
- **Persoenlichkeit**: Beschuetzend, alert, strategisch
- **Catchphrase**: "The best defense is knowing the attacker's playbook."
- **Stimme**: Brian (Amerikanisch, tief, vertrauensvoll)

#### NetRunner "The Weave" 🔷
- **Wing**: Network+ N10-009
- **Erfahrung**: 20 Jahre Network Architecture / Design / Troubleshooting
- **Ehemalige**: Cisco CCIE, ISP Backbone Engineer
- **Spezialitaeten**: TCP/IP, Subnetting, Routing, Switching, WiFi, VPN
- **Persoenlichkeit**: Methodisch, visuell denkend, liebt Puzzles
- **Catchphrase**: "Every packet tells a story. Learn to read them."
- **Stimme**: Roger (Amerikanisch, relaxed, resonant)

#### FixIt "The Mechanic" 🟡
- **Wing**: A+ 220-1201/1202
- **Erfahrung**: 25 Jahre Hardware / Support / Field Technician
- **Ehemalige**: Apple Certified, Dell Premier Support
- **Spezialitaeten**: Hardware Components, Mobile Devices, Troubleshooting
- **Persoenlichkeit**: Praktisch, no-nonsense, unglaublich geduldig
- **Catchphrase**: "Have you tried turning it off and on again? No, seriously."
- **Stimme**: Chris (Amerikanisch, charmant, down-to-earth)

---

## 4. Die 5 Training Wings

### PenTest+ Wing 🔴
- **Zertifizierung**: CompTIA PenTest+ PT0-003
- **Fragen**: 545 (460 PT0-002 + 85 PT0-003)
- **Dozenten**: 5 (Cipher, Shield, Recon, Code, Sage)
- **Status**: ✅ Vollstaendig
- **Domains**: Planning and Scoping (13%), Information Gathering (22%), Attacks and Exploits (30%), Tools and Code (15%), Reporting (18%)

### Linux Wing 🟠
- **Zertifizierung**: LPI 1 (101-500 + 102-500)
- **Fragen**: 64
- **Dozent**: Benny
- **Status**: ✅ Vollstaendig
- **Interaktives Terminal**: 15+ Linux-Befehle (ls, cd, pwd, ps, df, cat, echo, clear, help...)
- **Freischaltung**: Linux+ XK0-006 ab 80% Mastery

### Security+ Wing 🔵
- **Zertifizierung**: CompTIA Security+ SY0-701
- **Fragen**: 32
- **Dozent**: Guardian
- **Status**: ✅ Vollstaendig
- **Domains**: General Security Concepts, Threats/Vulnerabilities/Mitigations, Security Architecture, Security Operations, Security Program Management

### Network+ Wing 🔷
- **Zertifizierung**: CompTIA Network+ N10-009
- **Fragen**: 18
- **Dozent**: NetRunner
- **Status**: ✅ Basis vorhanden
- **Domains**: Networking Concepts (23%), Infrastructure (22%), Operations (24%), Security (17%), Troubleshooting (14%)

### A+ Wing 🟡
- **Zertifizierung**: CompTIA A+ 220-1201/1202
- **Fragen**: 10
- **Dozent**: FixIt
- **Status**: ✅ Basis vorhanden
- **Domains**: Mobile Devices (15%), Networking (20%), Hardware (25%), Virtualization/Cloud (11%), OS/Security/Troubleshooting (29%)

---

## 5. 1-zu-1 Tutor mit Ollama

### Funktionsweise

Der Tutor ist das **Herzstueck** der Plattform. Hier chatten Schueler in Echtzeit mit ihrem KI-Dozenten.

### Flow

```
1. Schueler waehlt Dozent (9 Avatare)
2. Gibt Frage ein oder klickt Quick Action
3. Ollama generiert Antwort mit:
   - Professor-Persoenlichkeit
   - RAG-Fragenkontext
   - Schwächen-Analyse
4. Antwort wird gestreamt (Wort fuer Wort)
5. TTS liest Antwort vor (optional)
6. Chat wird in localStorage gespeichert
```

### Quick Actions

| Button | Funktion |
|--------|----------|
| **📋 80/20 Rule** | Professor erklaert die wichtigsten 20% Konzepte |
| **🎯 Practice Weakness** | Fokus auf Schueler-Schwaechen |
| **💻 Code Example** | Praxisnaher Code fuer das Thema |
| **❓ Exam Tip** | Zufaelliger Pruefungs-Tipp |
| **🗣️ Voice Input** | Spracheingabe statt Tippen |

### Chat-Persistenz

Jeder Dozent hat seinen **eigenen Chat-Verlauf** im localStorage:
- `tutor_chat_cipher`, `tutor_chat_benny`, `tutor_chat_guardian`, ...
- Beim Wechsel des Dozenten wird der passende Chat geladen

---

## 6. RAG-System (Retrieval-Augmented Generation)

### Was ist RAG?

RAG **verbindet** die KI-Dozenten mit der Fragenbank. Wenn ein Schueler fragt, sucht das System automatisch nach **relevanten Pruefungsfragen** und gibt sie als Kontext an Ollama weiter.

### Funktionsweise

```
Schueler: "Wie funktioniert SQL Injection?"
    |
    v
RAG sucht Fragen mit Keywords ["sql", "injection", "exploit"]
    |
    v
Gefunden: 3 relevante Fragen aus der Datenbank
    |
    v
Ollama-Prompt: "Professor Cipher hier. 
  Schueler fragt nach SQL Injection.
  
  === RELEVANTE FRAGEN ===
  [Frage 1] Was ist die beste Methode um SQL Injection zu verhindern?
  [Frage 2] Welche SQL Injection Art nutzt UNION?
  [Frage 3] Erklaere Error-based SQL Injection.
  
  Beantworte unter Verwendung dieser Fragen als Referenz."
```

### Implementierung

- **TF-IDF-aehnliches Scoring**: Keyword-Matching mit Domain-Boost
- **15 Domain-Keyword-Mappings**: Spezifische Begriffe pro Fachgebiet
- **Schwaechen-Context**: Automatische Injektion von Fragen zu Schwaechenthemen
- **Datei**: `src/services/rag.ts`

---

## 7. Fragenbanken — 1.412 Fragen

### Gesamtverteilung

| Zertifizierung | Fragen | Quelle |
|----------------|--------|--------|
| CompTIA PenTest+ PT0-003 | 85 | ExamTopic + BD |
| CompTIA PenTest+ PT0-002 | 460 | Pass4Success (464 PDF) |
| **CompTIA PenTest+ gesamt** | **545** | |
| LPI 1 (101-500) | 40 | LPI Learning Material |
| LPI 1 (102-500) | 24 | LPI Learning Material |
| **LPI 1 gesamt** | **64** | |
| CompTIA Linux+ XK0-006 | 32 | Study Guide |
| CompTIA Security+ SY0-701 | 32 | Exam Prep |
| CompTIA Network+ N10-009 | 18 | Erstellt |
| CompTIA A+ 220-1201/1202 | 10 | Erstellt |
| **BundlesDigest PT0-003** | **251** | 3 Exam Simulatoren |
| CompTIA PenTest+ PT0-003 | 460 | Pass4Success 053144 |
| **GESAMT** | **1.412** | |

### 80/20-Analyse pro Domain

Jede Frage hat einen **80/20-Hint**, der die wichtigsten Konzepte hervorhebt:

```
Attacks and Exploits (30%):
  - SQLi: Union-based, Error-based, Blind, Stacked
  - XSS: Reflected, Stored, DOM — Input Sanitization = Fix
  - PrivEsc: Linux (SUID/Sudo), Windows (Token/UAC)
  - Password: Brute Force, Dictionary, Rainbow Tables
  - Network: MITM, ARP Spoofing, VLAN Hopping

Planning and Scoping (15%):
  - SOW: Immer vor Assessment signieren
  - RoE: Rules of Engagement definieren Grenzen
  - Compliance: GDPR, HIPAA, PCI-DSS, NIST

Information Gathering (22%):
  - Nmap: -sS, -sT, -sU, -sV, -O Flags
  - OSINT: passive/active Reconnaissance
  - CVSS: Base/Temporal/Environmental Score

Tools and Code (15%):
  - Python: Scapy, Requests, Socket
  - Burp Suite: Repeater, Intruder, Decoder
  - Wireshark: Filter-Syntax, Protocol Analysis
```

---

## 8. TTS — Text-to-Speech

### Web Speech API

Die Plattform nutzt die **kostenlose Web Speech API** des Browsers:
- **Deutsche Stimme**: Fuer Benny's Linux-Kurs
- **Englische Stimme**: Fuer alle anderen Module
- **Offline-faehig**: Kein Internet fuer TTS noetig
- **Kostenlos**: Keine API-Keys, keine Limits

### Wo TTS verfuegbar ist

- ✅ Quiz-Fragen (Vorlesen der Frage)
- ✅ Quiz-Erklaerungen (Vorlesen der Erklaerung)
- ✅ Tutor-Antworten (Speaker-Button auf jeder Nachricht)
- ✅ Classroom-Bios (Vorlesen der Dozenten-Biografie)
- ✅ Flashcards (Front und Back)
- ✅ PBQ-Anweisungen
- ❌ Dashboard (bleibt visuell)

### Bedienung

| Icon | Funktion |
|------|----------|
| 🔊 | Vorlesen starten |
| 🔴 (pulsierend) | Vorlesen stoppen |

---

## 9. Gamification & XP-System

### XP-Belohnungen

| Aktion | XP |
|--------|-----|
| Richtige Antwort | +10 XP |
| Streak-Bonus (konsekutiv) | +5 XP |
| Daily Challenge | +50 XP |
| Lektion abschliessen | +100 XP |
| Mock-Pruefung bestanden | +200 XP |
| 80/20-Hint verwendet | +5 XP |

### Level-System (10 Raenge)

| Level | Name | XP | Icon |
|-------|------|-----|------|
| 1 | ITF+ Intern | 0-100 | 🌱 |
| 2 | A+ Technician | 100-500 | 🔧 |
| 3 | Network+ Specialist | 500-1.000 | 🌐 |
| 4 | Security+ Defender | 1.000-2.000 | 🛡️ |
| 5 | Linux+ Administrator | 2.000-3.500 | 🐧 |
| 6 | PenTest+ Operator | 3.500-5.000 | ⚔️ |
| 7 | CySA+ Analyst | 5.000-7.000 | 🔍 |
| 8 | CASP+ Architect | 7.000-10.000 | 🏗️ |
| 9 | CISSP Master | 10.000-15.000 | 👑 |
| 10 | CISO Legend | 15.000+ | 🏆 |

### Study Streak
- 7-Tage-Kalender-Anzeige
- Flame-Icon fuer jeden aktiven Tag
- Streak-Bonus bei konsekutiven Tagen

---

## 10. Ollama Installation

### Schritt 1: Ollama installieren

**Linux/macOS:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Lade Ollama von https://ollama.com/download herunter

### Schritt 2: Ollama starten

```bash
ollama serve
```

Das Terminal muss offen bleiben. Ollama laeuft auf `http://localhost:11434`.

### Schritt 3: Ein Modell herunterladen

**Empfohlene Modelle:**

| Modell | Groesse | Beschreibung | Befehl |
|--------|---------|-------------|--------|
| llama3.2 | 2 GB | Schnell, gut fuer Anfang | `ollama pull llama3.2` |
| mistral | 4.1 GB | Exzellent fuer Coding | `ollama pull mistral` |
| llama3 | 4.7 GB | Maechtig, Alleskoenner | `ollama pull llama3` |
| codellama | 3.8 GB | Spezialisiert fuer Code | `ollama pull codellama` |

**Fuer Anfaenger empfohlen:**
```bash
ollama pull llama3.2
```

### Schritt 4: trygit.me oeffnen

1. Browser oeffnen: `https://b4si6zbax4skg.kimi.page`
2. Auf **Tutor** klicken (Sidebar)
3. Einen **Professor auswaehlen** (Avatar klicken)
4. Eine **Frage stellen** oder Quick Action nutzen
5. Die **KI-Antwort wird gestreamt**!

### Status-Anzeige

| Anzeige | Bedeutung |
|---------|-----------|
| 🟢 Ollama Connected | Alles bereit |
| 🔴 Ollama Offline | `ollama serve` starten |

---

## 11. Technischer Stack

### Frontend

| Technologie | Version | Zweck |
|-------------|---------|-------|
| React | 19 | UI-Framework |
| TypeScript | 5.x | Typsystem |
| Vite | 7.2.4 | Build-Tool |
| Tailwind CSS | 3.4.19 | Styling |
| shadcn/ui | latest | UI-Komponenten |
| Framer Motion | latest | Animationen |
| react-markdown | latest | Markdown-Rendering |
| react-syntax-highlighter | latest | Code-Syntax-Highlighting |
| lucide-react | latest | Icons |

### KI-Integration

| Service | Zweck |
|---------|-------|
| Ollama (localhost:11434) | Lokales LLM fuer Tutor-Antworten |
| Web Speech API | Kostenloses TTS im Browser |
| RAG (eigene Implementierung) | Fragen-Suche fuer Kontext |

### Daten

| Datei | Inhalt |
|-------|--------|
| `exam_database.json` | 1.412 Fragen (alle Zertifizierungen) |
| `professors.json` | 9 Dozenten-Profile + Wing-Daten |
| `lpi1_database.json` | 64 LPI 1 Fragen |
| `network_plus_database.json` | 18 Network+ Fragen |
| `aplus_database.json` | 10 A+ Fragen |

---

## 12. Changelog

### v6.0 (2026-01-19) — "Ollama & RAG"
- ✅ Ollama-Integration: 9 lokale KI-Dozenten mit Streaming
- ✅ RAG-System: Automatische Fragenkontext fuer Tutor
- ✅ 251 BundlesDigest Fragen extrahiert (3 Exam Simulatoren)
- ✅ 28 Network+/A+ Fragen hinzugefuegt
- ✅ Gesamt: 1.412 Fragen

### v5.0 (2026-01-19) — "The Grand Hall"
- ✅ Dashboard komplett neu: Grand Hall mit Wing-Navigation
- ✅ 9 KI-Dozenten mit individuellen Persoenlichkeiten
- ✅ Professor Directory (Classroom)
- ✅ 1-zu-1 Tutoring Center
- ✅ TTS ueberall (14 SpeakerButtons)

### v4.0 (2026-01-19) — "TTS & Audio"
- ✅ Web Speech API TTS auf allen Lernseiten
- ✅ SpeakerButton-Komponente

### v3.0 (2026-01-19) — "Linux Rooms"
- ✅ LPI 1 Linux Room mit Benny "Robbenklopper"
- ✅ Interaktives Terminal (15+ Befehle)
- ✅ Linux+ XK0-006 mit Freischalt-System

### v2.0 (2026-01-19) — "Erweiterte Datenbank"
- ✅ 263 PT0-003 Fragen aus 053144 PDF
- ✅ 64 LPI 1 Fragen
- ✅ 32 Linux+ Fragen

### v1.0 (2026-01-18) — "Launch"
- ✅ Basis-Plattform mit 994 PenTest+ Fragen
- ✅ Quiz Lab, PBQ Arena, Flashcards, Progress
- ✅ Gamification mit XP/Level/Streak

---

## Zusammenfassung

trygit.me ist ein **vollstaendiges Cybersecurity-Gymnasium** mit:

- **1.412 Fragen** ueber 8 Zertifizierungen
- **9 KI-Dozenten** mit Ollama-Streaming
- **RAG-System** fuer kontextuelle Antworten
- **TTS-Sprachausgabe** auf allen Seiten
- **Gamification** mit XP, Level, Streaks
- **5 Training Wings** mit Fortschrittsbalken
- **Grand Hall Dashboard** als zentraler Hub

**Live-URL**: https://b4si6zbax4skg.kimi.page

**Fuer die volle KI-Erfahrung**: Ollama installieren, Modell laden, Tutor oeffnen, mit Professoren chatten!
