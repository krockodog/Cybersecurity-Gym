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
  <em>8 Kurse &bull; 5.000+ Pruefungsfragen &bull; 9 KI-Dozenten &bull; 8 PBQ-Typen &bull; Lokales KI-Tutoring &bull; Gamification</em>
</p>

<p align="center">
  <a href="#raeume--features">Raeume</a> &bull;
  <a href="#kurse">Kurse</a> &bull;
  <a href="#ki-dozenten">KI-Dozenten</a> &bull;
  <a href="#quiz-lab">Quiz Lab</a> &bull;
  <a href="#pbq-arena">PBQ Arena</a> &bull;
  <a href="#ki-tutor">KI-Tutor</a> &bull;
  <a href="#tech-stack">Tech Stack</a> &bull;
  <a href="#installation">Installation</a>
</p>

---

## Was ist das Cybersecurity Gymnasium?

Eine vollstaendige **Single-Page-Application** fuer die Vorbereitung auf CompTIA- und Linux-Zertifizierungen. Die Plattform kombiniert echte Pruefungsfragen mit lokalem KI-Tutoring (Ollama), interaktiven Labs, Sprachausgabe und einem vollstaendigen Gamification-System — alles im Browser.

```text
 +-----------+     +-------------+     +-----------+     +-------------+
 |  Onboard  | --> |  Classroom  | --> | Quiz Lab  | --> | KI-Tutor    |
 |  Wizard   |     |  Grand Hall |     | 3 Modi    |     | 1-zu-1 Chat |
 +-----------+     +-------------+     +-----------+     +-------------+
       |                  |                  |                  |
       v                  v                  v                  v
  Profil &           9 Dozenten        5.000+ Fragen     Ollama Lokal
  Skill-Tree         8 Wings           7 Datenbanken     Voice I/O
       |                  |                  |                  |
       v                  v                  v                  v
 +-----------+     +-------------+     +-----------+     +-------------+
 | Flashcard | --> | PBQ Arena   | --> | Progress  | --> | Kurskatalog |
 | SM-2      |     | 8 Typen     |     | Heatmap   |     | 8 Kurse     |
 +-----------+     +-------------+     +-----------+     +-------------+
       |                  |                  |                  |
       v                  v                  v                  v
  Spaced Rep.        Terminal-Sim     Exam Strategist    Study Guides
  3D-Kartenflip      Netzwerk-Lab    Export/Import       Cheatsheets
```

---

## Raeume & Features

### Onboarding (`/onboarding`)

Vollbild-Wizard ausserhalb des Layouts. Sammelt initiale Profildaten und schaltet nach Abschluss den Zugang zum Gymnasium frei. Kein Zugriff auf Dashboard oder Classroom ohne abgeschlossenes Onboarding.

---

### Classroom — Grand Hall (`/classroom`)

Das Herzstück der App. Zeigt alle 9 KI-Dozenten, organisiert in 8 Wings (Abteilungen).

| Feature | Beschreibung |
|:--------|:-------------|
| **Welcome Header** | Animierter Typing-Effekt, Echtzeit-Uhr, personalisierte Begruessung |
| **Quick Stats Row** | Beantwortete Fragen, Streak, XP, Level auf einen Blick |
| **Skill Assessment** | Diagnostischer Kompetenztest als Modal — bestimmt Staerken/Schwaechen ueber alle Domaenen |
| **Professor Cards** | 9 Dozenten mit Avatar, Bio, Fachgebiet, Catchphrase — Direktlinks zu Quiz und 1-on-1 Tutoring |
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
| 2 | Packet Monkey |
| 3 | Code Breaker |
| 4 | Crypto Punk |
| 5 | Net Ninja |
| 6 | Shell Warrior |
| 7 | Root Raider |
| 8 | Zero Day Hunter |
| 9 | Kernel King |
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
| **Lokale KI** | Streaming-Antworten von Ollama (Token fuer Token) |
| **Model Selector** | Dropdown zur Auswahl des Ollama-Modells |
| **Pull Model** | Neue Modelle direkt in der App herunterladen |
| **Markdown Rendering** | Vollstaendiges Markdown mit Syntax-Highlighting und Code-Copy-Button |
| **5 Quick Actions** | 80/20 Rule, Practice Weakness, Code Example, Exam Tip, Explain Topic |
| **Voice Input** | Spracheingabe per Web Speech API (Mikrofon) |
| **TTS Output** | Sprachausgabe der KI-Antworten |
| **Weakness Sidebar** | Mastery-Kreise pro Domaene, Focus-Modus-Toggle |
| **Chat Persistence** | Gespraeche pro Professor in localStorage gespeichert |
| **Professor-Persoenlichkeiten** | Jeder Dozent hat eigenen System-Prompt mit Stil und Fachgebiet |

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

Filterbarer Katalog aller 8 Zertifizierungskurse.

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

## KI-Dozenten

9 Dozenten mit einzigartiger Persoenlichkeit, 20+ Jahre Fachexpertise und eigenem Kommunikationsstil. Jeder hat einen individuellen System-Prompt fuer das KI-Tutoring.

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
| **Ollama (Lokal)** | Streaming-Chat mit lokalen LLMs — keine Cloud, volle Privatsphaere |
| **OpenRouter** | Alternativer LLM-Provider (Cloud) |
| **RAG** | Retrieval-Augmented Generation fuer kontextbasierte Antworten |
| **KI-Orchestrator** | Personalisierte Professor-Zuweisung und Lernpfad-Generierung |
| **Adaptive Learning** | Algorithmus analysiert Performance und empfiehlt Lernpfade |
| **Exam Strategist** | Score-Prognose, Studienplan, Zeitverteilung pro Domaene |

### Sprache & Audio

| Feature | Beschreibung |
|:--------|:-------------|
| **Text-to-Speech** | Fragen, Antworten und Erklaerungen vorlesen (Web Speech API) |
| **Voice Input** | Spracheingabe im Tutor per Mikrofon |
| **SpeakerButton** | Universelle TTS-Komponente in Quiz, Tutor, Flashcards, LPI1, Linux+ |

### 80/20 Pareto-System

Durchgaengiges Konzept: Die 20% des Wissens, die 80% der Pruefung abdecken.

- **Quiz**: Max. 5 Hints pro Session
- **Flashcards**: Pareto-Tipps auf der Kartenrueckseite
- **Tutor**: Quick Action "80/20 Rule"
- **Linux Rooms**: Integrierte 80/20 Hints

---

## Tech Stack

```text
Frontend          React 19 + TypeScript 5.9
Build             Vite 7.2
Styling           Tailwind CSS 3.4 + shadcn/ui (Radix Primitives)
Animationen       Framer Motion 12
Routing           React Router DOM 7.15 (HashRouter)
State             localStorage (kein Backend)
KI                Ollama (lokal) + OpenRouter (Cloud)
Markdown          react-markdown 10 + remark-gfm
Charts            Recharts 2.15
Icons             Lucide React
TTS               Web Speech API
Flashcards        SM-2 Spaced Repetition (eigene Implementierung)
```

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

```bash
# Ollama installieren (https://ollama.ai)
ollama serve

# Ein Modell herunterladen
ollama pull llama3.1

# Dann in der App den Tutor oeffnen — Ollama wird automatisch erkannt
```

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
│   │   ├── courses.json              # Kurskatalog (8 Kurse)
│   │   ├── professors.json           # 9 Dozenten + Wings + JARVIS
│   │   ├── pt003_full_database.json  # PenTest+ PT0-003
│   │   ├── security_plus_database.json
│   │   ├── cysa_database.json
│   │   ├── casp_database.json
│   │   ├── network_plus_database.json
│   │   ├── aplus_database.json
│   │   ├── lpi1_database.json
│   │   ├── xk006_database.json       # Linux+ XK0-006
│   │   └── *.png                     # Professor-Avatare
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui Basiskomponenten
│   │   │   ├── onboarding/           # Onboarding-Wizard
│   │   │   ├── pbq/                  # 8 PBQ-Typen + Shared
│   │   │   ├── Navbar.tsx            # Seitennavigation mit Wings
│   │   │   ├── Layout.tsx            # App-Layout (Navbar + Outlet)
│   │   │   ├── SkillAssessment.tsx   # Diagnostischer Kompetenztest
│   │   │   ├── AdaptiveLearningPanel.tsx  # Lernempfehlungen
│   │   │   ├── ExamStrategist.tsx    # Pruefungsstrategie-KI
│   │   │   ├── StudyStreak.tsx       # Streak-Kalender-Heatmap
│   │   │   ├── ClassroomTeam.tsx     # 5-Agenten-Team-Anzeige
│   │   │   ├── ProgressExportImport.tsx  # JSON Export/Import
│   │   │   ├── SpeakerButton.tsx     # TTS-Komponente
│   │   │   └── AnimatedGrid.tsx      # Hintergrund-Animation
│   │   ├── pages/
│   │   │   ├── Classroom.tsx         # Grand Hall (1.329 Zeilen)
│   │   │   ├── Profile.tsx           # Profil-Dashboard (1.775 Zeilen)
│   │   │   ├── Courses.tsx           # Kurskatalog
│   │   │   ├── CourseDetail.tsx      # Kursdetail (7 Tabs)
│   │   │   ├── Quiz.tsx              # Quiz Lab (1.987 Zeilen)
│   │   │   ├── PBQ.tsx               # PBQ Arena (8 Typen)
│   │   │   ├── Tutor.tsx             # KI-Tutor Chat (1.288 Zeilen)
│   │   │   ├── Flashcards.tsx        # SM-2 Karteikarten
│   │   │   ├── Progress.tsx          # Fortschritt & Analyse
│   │   │   ├── LPI1Room.tsx          # Linux LPI 1 + Terminal
│   │   │   └── LinuxPlusRoom.tsx     # Linux+ (ab 80% LPI 1)
│   │   ├── services/
│   │   │   ├── ollama.ts             # Ollama LLM-Integration
│   │   │   ├── openrouter.ts         # OpenRouter API
│   │   │   ├── llm.ts               # LLM-Abstraktionsschicht
│   │   │   ├── rag.ts               # Retrieval-Augmented Generation
│   │   │   ├── adaptive-learning.ts  # Adaptiver Lernalgorithmus
│   │   │   ├── orchestrator.ts       # KI-Orchestrator
│   │   │   └── professor-data.ts     # Dozenten-Definitionen
│   │   ├── hooks/
│   │   │   ├── useTTS.ts            # Text-to-Speech Hook
│   │   │   └── use-mobile.ts        # Mobile-Erkennung
│   │   └── App.tsx                   # Router (13 Routen)
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
| `/` | Grand Hall | Dashboard mit Dozenten, Streak, Adaptive Learning |
| `/classroom` | Classroom | Grand Hall (Alias) |
| `/profile` | Profil | XP, Level, Badges, Skill Tree, Daily Challenge, Agent Feed |
| `/courses` | Kurskatalog | 8 Kurse mit Suche, Filter, Sortierung |
| `/courses/:courseId` | Kursdetails | 7 Tabs: Overview, Simulators, Practice, Guide, Cards, PBQs, Cheatsheets |
| `/quiz` | Quiz Lab | 3 Modi, 7 Datenbanken, 5.000+ Fragen |
| `/pbq` | PBQ Arena | 8 interaktive PBQ-Typen |
| `/tutor` | KI-Tutor | 1-zu-1 Chat mit Ollama, Voice I/O |
| `/flashcards` | Karteikarten | SM-2 Spaced Repetition, 3D-Flip |
| `/progress` | Fortschritt | Heatmap, Charts, Badges, Exam Strategist, Export |
| `/lpi1` | Linux LPI 1 | 7 Domaenen + Terminal-Emulator |
| `/linux-plus` | Linux+ XK0-006 | Freigeschaltet ab 80% LPI 1 |

---

## Design

| Element | Wert |
|:--------|:-----|
| Hintergrund | `#0a0e17` |
| Akzent Gruen | `#00ff41` |
| Akzent Cyan | `#00d4ff` |
| Rahmen | `#1a2d45` |
| Text primaer | `#ffffff` |
| Text sekundaer | `#7da0c4` |

---

## Datenmodell

Alle Nutzerdaten werden clientseitig in `localStorage` gespeichert — kein Backend, kein Account noetig.

```text
localStorage Keys:
├── trygit_onboarding_complete     # Onboarding-Status
├── trygit-quiz-progress-{cert}    # Quiz-Fortschritt pro Kurs
├── trygit-quiz-history            # Quiz-Historie (max. 20)
├── trygit-flashcards-{cert}       # Flashcard SM-2 Daten
├── trygit-streak-data             # Study Streak Kalender
├── trygit-xp                      # XP und Level
├── trygit-badges                  # Freigeschaltete Badges
├── trygit-skill-assessment        # Kompetenztest-Ergebnisse
├── trygit-tutor-chat-{prof}       # Chat-Historie pro Professor
├── lpi1_mastery                   # LPI-1 Mastery (Unlock-Gate)
└── trygit-pbq-history             # PBQ-Verlauf und Bestleistungen
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
