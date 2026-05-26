# AI Personnel Model — Agent Orchestration Framework

> **Version:** 1.0
> **Scope:** All certification classrooms
> **Structure:** 2 Professors + 2 Tutors + 1 Organizer per classroom

---

## 1. Unified Classroom Structure

Every classroom follows the **same organizational pattern**, regardless of certification:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLASSROOM [Certification]                  │
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │   PROFESSOR 1    │    │   PROFESSOR 2    │                │
│  │   (Lead)         │    │   (Support)      │                │
│  │                  │    │                  │                │
│  │ • Domain Expert  │    │ • Domain Expert  │                │
│  │ • Lecture Design │    │ • Lab Creation   │                │
│  │ • Assessment     │    │ • Mentoring      │                │
│  └──────────────────┘    └──────────────────┘                │
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐                │
│  │     TUTOR 1      │    │     TUTOR 2      │                │
│  │   (Theory)       │    │   (Practice)     │                │
│  │                  │    │                  │                │
│  │ • Concept Explan.│    │ • Hands-on Labs  │                │
│  │ • Weakness Fix   │    │ • Tool Training  │                │
│  │ • 1-on-1 Chat    │    │ • PBQ Guidance   │                │
│  └──────────────────┘    └──────────────────┘                │
│                                                               │
│         ┌──────────────────────────┐                         │
│         │      ORGANIZER           │                         │
│         │  (Background)            │                         │
│         │                          │                         │
│         │ • Progress Tracking      │                         │
│         │ • Adaptive Scheduling    │                         │
│         │ • Resource Allocation    │                         │
│         │ • Exam Readiness Monitor │                         │
│         └──────────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Role Definitions & Competencies

### 2.1 PROFESSOR (Dozent)

**Count per classroom:** 2
**Primary function:** Subject matter expertise, curriculum delivery, assessment design

#### Professor 1 — Lead Professor
| Competency | Description |
|------------|-------------|
| **Domain Mastery** | Deep expertise in all exam objectives of the certification |
| **Curriculum Design** | Structures learning paths from beginner to exam-ready |
| **Assessment Creation** | Builds quizzes, PBQs, and flashcards aligned to exam |
| **Lecture Delivery** | Explains complex concepts clearly with real-world examples |
| **80/20 Analysis** | Identifies high-yield topics (20% effort → 80% results) |
| **RAG Integration** | Uses exam questions as context for AI answers |

#### Professor 2 — Support Professor
| Competency | Description |
|------------|-------------|
| **Lab Design** | Creates practical exercises and hands-on scenarios |
| **Student Mentoring** | Provides encouragement and personalized guidance |
| **Alternative Explanations** | Explains concepts from different angles when needed |
| **Tool Demonstration** | Shows live usage of tools (Nmap, Metasploit, etc.) |
| **Exam Strategy** | Teaches test-taking techniques and time management |
| **Career Guidance** | Connects certification to real job roles |

### 2.2 TUTOR (Tutor)

**Count per classroom:** 2
**Primary function:** Individual student support, weakness remediation, practical training

#### Tutor 1 — Theory Tutor
| Competency | Description |
|------------|-------------|
| **Concept Breakdown** | Simplifies complex topics into digestible pieces |
| **Weakness Analysis** | Identifies and targets student knowledge gaps |
| **Socratic Method** | Asks leading questions to guide self-discovery |
| **Spaced Repetition** | Manages flashcard decks and review schedules |
| **Chat Support** | Available for 1-on-1 text conversations |
| **Explanation Adaptation** | Adjusts explanation depth to student level |

#### Tutor 2 — Practice Tutor
| Competency | Description |
|------------|-------------|
| **Hands-on Labs** | Guides through practical exercises step-by-step |
| **Tool Training** | Teaches exact commands, flags, and syntax |
| **PBQ Coaching** | Walks through performance-based questions |
| **Command Reference** | Provides ready-to-use command cheat sheets |
| **Error Troubleshooting** | Helps debug when labs don't work as expected |
| **Simulation Practice** | Runs mock scenarios to build muscle memory |

### 2.3 ORGANIZER (Background Organizer)

**Count per classroom:** 1
**Primary function:** Administrative coordination, adaptive scheduling, progress monitoring

| Competency | Description |
|------------|-------------|
| **Progress Tracking** | Monitors XP, streaks, accuracy per domain |
| **Adaptive Scheduling** | Adjusts daily targets based on performance |
| **Resource Allocation** | Routes student to right professor/tutor based on needs |
| **Exam Readiness Monitor** | Calculates exam readiness score |
| **Milestone Management** | Tracks 30-60-90 day plan progress |
| **Intervention Trigger** | Alerts when student falls behind schedule |
| **Report Generation** | Creates progress reports for self-assessment |

---

## 3. Orchestrator Distribution Logic

### 3.1 Assignment Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Student    │────→│ Onboarding   │────→│ Skill Assessment │
│  Enters      │     │ (Name+Rules) │     │ (10 Questions)   │
└──────────────┘     └──────────────┘     └──────────────────┘
                                                   │
                                                   ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Begins     │←────│  Orchestrator│←────│ Weakness Analysis│
│   Learning   │     │  Assigns     │     │ (Domain Scores)  │
│              │     │  Professor   │     └──────────────────┘
└──────────────┘     └──────────────┘
```

### 3.2 Professor Assignment Matrix

| Weakest Domain | Assigned Professor 1 | Assigned Professor 2 | Classroom |
|----------------|---------------------|---------------------|-----------|
| Attacks & Exploits | Cipher (Lead) | Viper (Support) | PenTest+ |
| Information Gathering | Recon (Lead) | NetRunner (Support) | Network+ |
| Planning & Scoping | Sage (Lead) | Phantom (Support) | CASP+ |
| Reporting | Sage (Lead) | CISO Nova (Support) | CASP+ |
| Tools & Code Analysis | Code Master (Lead) | Ghost (Support) | Security+ |
| Security Fundamentals | Shield (Lead) | Harden (Support) | Security+ |
| Hardware/Software | Tech Mom (Lead) | Fixit (Support) | A+ |
| Linux Administration | Benny (Lead) | Tux Tina (Support) | Linux+ |
| Threat Analysis | Ghost (Lead) | Hunter X (Support) | CySA+ |
| Cloud Security | Guardian (Lead) | Cloud Native Nate (Support) | Cloud+ |

### 3.3 Tutor Assignment Logic

```typescript
// Tutor routing based on student question type
function assignTutor(question: string, context: 'theory' | 'practice'): Tutor {
  if (context === 'theory' || isConceptual(question)) {
    return getTutor1(); // Theory Tutor
  }
  if (context === 'practice' || isToolCommand(question)) {
    return getTutor2(); // Practice Tutor
  }
  // Default: both tutors collaborate
  return getCollaborativeResponse();
}

function isConceptual(q: string): boolean {
  const theoryKeywords = ['what is', 'why', 'explain', 'difference between', 'concept'];
  return theoryKeywords.some(kw => q.toLowerCase().includes(kw));
}

function isToolCommand(q: string): boolean {
  const practiceKeywords = ['how to', 'command', 'flag', 'nmap', 'metasploit', 'syntax', 'usage'];
  return practiceKeywords.some(kw => q.toLowerCase().includes(kw));
}
```

### 3.4 Organizer Auto-Actions

| Trigger | Organizer Action |
|---------|-----------------|
| Student scores < 50% in domain | Assign Professor 1 for that domain |
| 3-day streak broken | Send motivational message, adjust daily target down |
| 7-day streak achieved | Unlock bonus content, increase daily target |
| Exam readiness > 85% | Suggest exam booking, activate review mode |
| PBQ score < 60% | Schedule extra PBQ practice, notify Practice Tutor |
| Student inactive 3+ days | Send re-engagement message, reduce daily target |
| All domains > 80% | Trigger "Exam Ready" milestone celebration |

---

## 4. Certification-Specific Staffing

### 4.1 PenTest+ Classroom (6 sub-rooms)

| Room | Focus | Professor 1 | Professor 2 | Tutor 1 | Tutor 2 | Organizer |
|------|-------|-------------|-------------|---------|---------|-----------|
| PenTest+ Core | Full PT0-003 | Cipher | Viper | Theory | Practice | Auto |
| Planning | Scoping & ROE | Sage | Phantom | Theory | Practice | Auto |
| Recon | OSINT & Scanning | Recon | NetRunner | Theory | Practice | Auto |
| Attacks | Exploits & Tools | Cipher | Viper | Theory | Practice | Auto |
| Reporting | CVSS & Writing | Sage | CISO Nova | Theory | Practice | Auto |
| PBQ Lab | Hands-on Sim | Viper | Code Master | Theory | Practice | Auto |

### 4.2 Cloud+ Classroom (1 room)

| Room | Focus | Professor 1 | Professor 2 | Tutor 1 | Tutor 2 | Organizer |
|------|-------|-------------|-------------|---------|---------|-----------|
| Cloud Security | CV0-003 | Guardian | Cloud Native Nate | Theory | Practice | Auto |

### 4.3 Other Classrooms

| Classroom | Professor 1 | Professor 2 | Count |
|-----------|-------------|-------------|-------|
| Security+ SY0-701 | Shield | Harden | 5 rooms |
| Network+ N10-009 | Recon | Cisco Kate | 5 rooms |
| A+ 220-1201/1202 | Tech Mom | Fixit | 4 rooms |
| Linux+ / LPI 1 | Benny | Tux Tina | 2 rooms |
| CySA+ CS0-003 | Ghost | Hunter X | 2 rooms |
| CASP+ CAS-004 | Phantom | CISO Nova | 2 rooms |

---

## 5. Orchestrator Configuration

### 5.1 Capacity Management

```typescript
interface OrchestratorConfig {
  // Maximum students per professor before overflow
  maxStudentsPerProfessor: 50;
  
  // Overflow handling: when >50 students, clone professor persona
  overflowStrategy: 'clone' | 'queue' | 'redirect';
  
  // Tutor availability: always available (AI), but quality drops
  // if too many concurrent conversations
  maxConcurrentChatsPerTutor: 10;
  
  // Organizer batch processing interval
  organizerCheckInterval: 300; // seconds
  
  // Intervention thresholds
  interventionThresholds: {
    lowActivity: 3,     // days
    lowScore: 0.5,      // 50%
    streakRisk: 1,      // day before streak breaks
  };
}
```

### 5.2 Qualification Gap Response

When the Orchestrator detects a gap:

| Gap Type | Response |
|----------|----------|
| No professor for domain | Use RAG fallback + generic professor prompt |
| Student struggling with basics | Route to Tech Mom (most patient) |
| Advanced student bored | Route to Viper or Phantom (challenging) |
| Student needs German | Route to Benny (German-speaking) |
| Student prefers female prof | Route to Shield, Sage, Guardian, Ghost, Tech Mom, etc. |
| Tool-specific question | Route to Code Master (tools expert) |

### 5.3 Dynamic Rebalancing

```
Daily at 00:00 UTC:
  1. Load all student progress data
  2. Identify weak domains per student
  3. Reassign primary professor if needed
  4. Adjust daily question targets
  5. Check for inactive students → send re-engagement
  6. Update milestone statuses
  7. Generate daily focus recommendations
```

---

## 6. Implementation in Code

### 6.1 Key Files

| File | Purpose |
|------|---------|
| `src/services/orchestrator.ts` | Core orchestration logic |
| `src/services/professor-data.ts` | All 19 professor profiles |
| `src/services/adaptive-learning.ts` | Learning engine + organizer |
| `src/components/SkillAssessment.tsx` | 10-question diagnostic test |
| `src/pages/Classroom.tsx` | Dashboard with professor grid |

### 6.2 localStorage Keys

| Key | Data |
|-----|------|
| `trygit_student_name` | Student's name |
| `trygit_onboarding_complete` | Onboarding finished flag |
| `trygit_consent_given` | Consent accepted flag |
| `trygit_skill_assessment` | Assessment result object |
| `trygit_orchestrator_assignment` | Professor assignment object |
| `trygit_adaptive_state` | Learning engine state |
| `trygit_streak` | Study streak data |
| `trygit_progress_[cert]` | Per-certification progress |

---

## 7. Optimization Roadmap

### Current State
- ✅ 19 professors defined
- ✅ Orchestrator assigns based on weakness
- ✅ 5-1 personnel structure per classroom
- ✅ Adaptive learning engine active
- ✅ Skill assessment implemented

### Optimizations Needed
- [ ] Professor cloning for high-traffic classrooms
- [ ] Cross-classroom tutor sharing during peak hours
- [ ] Predictive intervention (before student falls behind)
- [ ] Professor performance scoring (which professor helps most)
- [ ] Automatic curriculum updates when exam objectives change
- [ ] Peer study groups (match students at same level)
- [ ] Parent/mentor dashboard for progress monitoring
