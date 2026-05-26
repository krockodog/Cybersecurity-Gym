import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeakerButton } from '../components/SpeakerButton';
import {
  Layers,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Flame,
  Brain,
  ChevronDown,
  Trophy,
} from 'lucide-react';

/* ─── easing ─── */
const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

interface FlashcardData {
  id: string;
  deck: string;
  domain: string;
  domainKey: string;
  domainColor?: string;
  front: string;
  hint: string;
  back: string;
  explanation: string;
  eightyTwenty: string;
  difficulty: number;
  interval: number;
  nextReview: string;
  timesReviewed: number;
  timesCorrect: number;
}

function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-xl border border-[#1a2d45] bg-[#0d1526] ${className || ''}`} style={style}>
      {children}
    </div>
  );
}

interface Deck {
  id: string;
  name: string;
  domain: string;
  domainKey: string;
  domainColor: string;
  cards: FlashcardData[];
  mastered: number;
}

interface CardState {
  card: FlashcardData;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: Date;
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════ */

const DECKS: Deck[] = [
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    domain: 'Attacks & Exploits',
    domainKey: 'attacks_exploits',
    domainColor: '#ff3366',
    mastered: 45,
    cards: [
      {
        id: 'fc-sqli-01', deck: 'SQL Injection', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'What Nmap flag performs a TCP SYN scan?',
        hint: 'Think about the stealthiest scan type...',
        back: '-sS (Stealth SYN Scan)',
        explanation: 'SYN scan (-sS) is the default and most popular scan option. It sends SYN packets and waits for responses without completing the TCP handshake, making it stealthier than a full connect scan (-sT).',
        eightyTwenty: 'SYN is the exam\'s favorite scan type. Know -sS, -sT, -sU, -sV.',
        difficulty: 2, interval: 3, nextReview: '2024-03-18T10:00:00', timesReviewed: 4, timesCorrect: 3,
      },
      {
        id: 'fc-sqli-02', deck: 'SQL Injection', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'What are the three main types of Cross-Site Scripting (XSS)?',
        hint: 'One reflects immediately, one stores persistently...',
        back: 'Reflected XSS, Stored XSS, and DOM-based XSS',
        explanation: 'Reflected XSS: malicious script reflects off the server in the immediate response. Stored XSS: script is permanently stored on the server (e.g., in a database). DOM-based XSS: vulnerability exists in client-side JavaScript that modifies the DOM.',
        eightyTwenty: 'Input sanitization = fix for ALL XSS types. Know the difference for the exam.',
        difficulty: 2, interval: 1, nextReview: '2024-03-16T14:00:00', timesReviewed: 2, timesCorrect: 1,
      },
      {
        id: 'fc-sqli-03', deck: 'SQL Injection', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'In CVSS v3.1, what does the "Scope" metric indicate?',
        hint: 'Does the vulnerability affect resources beyond its original scope?',
        back: 'Whether the vulnerability impacts resources beyond its original security scope (Changed vs Unchanged).',
        explanation: 'Scope in CVSS v3.1 measures whether a vulnerability in one component can affect resources in other components. "Changed" means the impact extends beyond the vulnerable component\'s authority. This can increase the base score significantly.',
        eightyTwenty: 'Scope: Changed = higher score. Know Base/Temporal/Environmental metrics.',
        difficulty: 3, interval: 5, nextReview: '2024-03-20T09:00:00', timesReviewed: 6, timesCorrect: 5,
      },
      {
        id: 'fc-sqli-04', deck: 'SQL Injection', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'What is a UNION-based SQL injection attack?',
        hint: 'It combines results from multiple SELECT statements...',
        back: 'A technique that uses the UNION operator to combine results of the original query with data from other tables.',
        explanation: 'UNION-based SQLi leverages the UNION SQL operator to append a malicious SELECT statement to the original query. The attacker can extract data from other tables by matching column numbers and data types.',
        eightyTwenty: 'UNION requires same column count & compatible types. Use ORDER BY to determine columns.',
        difficulty: 2, interval: 2, nextReview: '2024-03-17T10:00:00', timesReviewed: 3, timesCorrect: 2,
      },
      {
        id: 'fc-sqli-05', deck: 'SQL Injection', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'Name three SQL injection mitigation techniques.',
        hint: 'Think parameterized queries, input validation, and escaping...',
        back: 'Parameterized queries, input validation, and stored procedures.',
        explanation: 'Parameterized queries (prepared statements) separate code from data, preventing injection. Input validation rejects malicious characters. Stored procedures encapsulate database logic. Additional: ORM frameworks, WAF rules, least privilege.',
        eightyTwenty: 'Parameterized queries = #1 defense. Never concatenate user input into SQL.',
        difficulty: 1, interval: 4, nextReview: '2024-03-19T10:00:00', timesReviewed: 5, timesCorrect: 5,
      },
      {
        id: 'fc-sqli-06', deck: 'SQL Injection', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'What is the difference between blind SQL injection and error-based SQL injection?',
        hint: 'One relies on error messages, the other on boolean/time differences...',
        back: 'Error-based uses database error messages to extract data. Blind SQLi infers data through boolean (true/false) or time-based responses.',
        explanation: 'Error-based SQLi triggers database errors that reveal information in error messages. Boolean-based blind SQLi asks true/false questions and observes page differences. Time-based blind SQLi uses database delay functions (SLEEP, WAITFOR DELAY) to infer data.',
        eightyTwenty: 'Blind SQLi is slower but just as dangerous. Time-based is the most reliable detection method.',
        difficulty: 3, interval: 1, nextReview: '2024-03-16T10:00:00', timesReviewed: 2, timesCorrect: 1,
      },
    ],
  },
  {
    id: 'xss-csrf',
    name: 'XSS & CSRF',
    domain: 'Attacks & Exploits',
    domainKey: 'attacks_exploits',
    domainColor: '#ff3366',
    mastered: 30,
    cards: [
      {
        id: 'fc-xss-01', deck: 'XSS & CSRF', domain: 'Attacks & Exploits', domainKey: 'attacks_exploits',
        front: 'What is the primary defense against CSRF attacks?',
        hint: 'A token that the attacker cannot predict...',
        back: 'CSRF tokens (anti-CSRF tokens / synchronizer tokens)',
        explanation: 'CSRF tokens are unique, unpredictable values generated by the server and embedded in forms. The server validates the token on submission. Since the attacker cannot read the token (same-origin policy), they cannot forge valid requests.',
        eightyTwenty: 'CSRF token + SameSite cookie attribute = modern defense. Check for both!',
        difficulty: 2, interval: 2, nextReview: '2024-03-17T14:00:00', timesReviewed: 3, timesCorrect: 3,
      },
    ],
  },
  {
    id: 'nmap-mastery',
    name: 'Nmap Mastery',
    domain: 'Information Gathering',
    domainKey: 'info_gathering',
    domainColor: '#00e5ff',
    mastered: 60,
    cards: [
      {
        id: 'fc-nmap-01', deck: 'Nmap Mastery', domain: 'Information Gathering', domainKey: 'info_gathering',
        front: 'What Nmap flag enables OS detection?',
        hint: 'Think "O" for operating system...',
        back: '-O (OS Detection)',
        explanation: 'The -O flag enables Nmap\'s OS detection feature. It sends a series of TCP and UDP packets to examine the target\'s response patterns and match them against a database of known OS fingerprints. Requires root/admin privileges.',
        eightyTwenty: '-O requires root. Combine with -sS for best results. Know: -O, -sV, -A flags.',
        difficulty: 1, interval: 5, nextReview: '2024-03-20T10:00:00', timesReviewed: 6, timesCorrect: 6,
      },
    ],
  },
  {
    id: 'cvss-scoring',
    name: 'CVSS Scoring',
    domain: 'Information Gathering',
    domainKey: 'info_gathering',
    domainColor: '#00e5ff',
    mastered: 25,
    cards: [
      {
        id: 'fc-cvss-01', deck: 'CVSS Scoring', domain: 'Information Gathering', domainKey: 'info_gathering',
        front: 'What are the three metric groups in CVSS v3.1?',
        hint: 'Base, Temporal, and...',
        back: 'Base Score, Temporal Score, and Environmental Score',
        explanation: 'Base Score represents the intrinsic characteristics of a vulnerability. Temporal Score reflects factors that change over time (exploit maturity, remediation level). Environmental Score adjusts the score based on the impact to a specific organization (modified base metrics, requirements).',
        eightyTwenty: 'Base is always calculated. Temporal & Environmental are optional modifiers. Scope: Changed = score boost.',
        difficulty: 2, interval: 1, nextReview: '2024-03-16T10:00:00', timesReviewed: 2, timesCorrect: 1,
      },
    ],
  },
  {
    id: 'sow-legal',
    name: 'SOW & Legal',
    domain: 'Planning & Scoping',
    domainKey: 'planning_scoping',
    domainColor: '#ffaa00',
    mastered: 55,
    cards: [
      {
        id: 'fc-sow-01', deck: 'SOW & Legal', domain: 'Planning & Scoping', domainKey: 'planning_scoping',
        front: 'What document must be signed before starting a penetration test?',
        hint: 'It defines the scope, rules, and legal permissions...',
        back: 'Statement of Work (SOW) and/or Rules of Engagement (RoE)',
        explanation: 'The SOW defines the scope, methodology, timeline, and deliverables. The RoE specifies testing boundaries, authorized techniques, emergency contacts, and escalation procedures. Both must be signed by the client before any testing begins.',
        eightyTwenty: 'SOW = scope & deliverables. RoE = technical boundaries. BOTH must be signed!',
        difficulty: 1, interval: 4, nextReview: '2024-03-19T10:00:00', timesReviewed: 5, timesCorrect: 5,
      },
    ],
  },
  {
    id: 'python-pentest',
    name: 'Python for Pentest',
    domain: 'Tools & Code Analysis',
    domainKey: 'tools_code',
    domainColor: '#a855f7',
    mastered: 20,
    cards: [
      {
        id: 'fc-py-01', deck: 'Python for Pentest', domain: 'Tools & Code Analysis', domainKey: 'tools_code',
        front: 'Which Python library is used for crafting and sending network packets?',
        hint: 'It rhymes with "crabby"...',
        back: 'Scapy',
        explanation: 'Scapy is a powerful Python library for network packet crafting, sending, and analysis. It supports a wide range of protocols and allows building custom packets from scratch. Essential for network penetration testing tasks.',
        eightyTwenty: 'Scapy = packet manipulation. socket = basic networking. requests = HTTP. Know all three!',
        difficulty: 1, interval: 1, nextReview: '2024-03-16T10:00:00', timesReviewed: 2, timesCorrect: 2,
      },
    ],
  },
  {
    id: 'report-writing',
    name: 'Report Writing',
    domain: 'Reporting & Communication',
    domainKey: 'reporting',
    domainColor: '#10b981',
    mastered: 40,
    cards: [
      {
        id: 'fc-rpt-01', deck: 'Report Writing', domain: 'Reporting & Communication', domainKey: 'reporting',
        front: 'What are the two main audiences for a penetration test report?',
        hint: 'One is technical, one is executive...',
        back: 'Technical team and Executive leadership',
        explanation: 'Technical reports contain detailed findings, exploitation steps, evidence, and remediation guidance for IT teams. Executive summaries provide high-level risk assessment, business impact, and strategic recommendations for leadership decision-making.',
        eightyTwenty: 'Always include an Executive Summary. Executives care about risk & business impact, not CVE numbers.',
        difficulty: 1, interval: 3, nextReview: '2024-03-18T10:00:00', timesReviewed: 4, timesCorrect: 4,
      },
    ],
  },
  {
    id: 'all-cards',
    name: 'All Cards',
    domain: 'Mixed',
    domainKey: 'mixed',
    domainColor: '#00d4ff',
    mastered: 35,
    cards: [],
  },
];

const ALL_CARDS: FlashcardData[] = DECKS.filter((d) => d.id !== 'all-cards').flatMap((d) => d.cards);

// Populate "All Cards" deck
DECKS.find((d) => d.id === 'all-cards')!.cards = [...ALL_CARDS];

/* ═══════════════════════════════════════════════════════════
   SM-2 ALGORITHM
   ═══════════════════════════════════════════════════════════ */

function sm2Calculate(interval: number, repetitions: number, easeFactor: number, quality: number) {
  let newInterval: number;
  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
  }

  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  return { interval: newInterval, repetitions: newRepetitions, easeFactor: newEaseFactor };
}

const RATING_CONFIG = [
  { label: 'Again', quality: 1, interval: '< 1 min', color: '#ff3366', bg: 'rgba(255,51,102,0.1)', border: '#ff3366', tooltip: "You didn't know this" },
  { label: 'Hard', quality: 3, interval: '1 day', color: '#ff7b00', bg: 'rgba(255,123,0,0.1)', border: '#ff7b00', tooltip: 'You struggled with this' },
  { label: 'Good', quality: 4, interval: '3 days', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: '#00d4ff', tooltip: 'You knew this well' },
  { label: 'Easy', quality: 5, interval: '7 days', color: '#00ff41', bg: 'rgba(0,255,65,0.1)', border: '#00ff41', tooltip: 'You knew this perfectly' },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENT: 3D Flip Card
   ═══════════════════════════════════════════════════════════ */

function FlashcardFace({
  card,
  index,
  total,
  isFlipped,
  onFlip,
}: {
  card: FlashcardData;
  index: number;
  total: number;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="w-full max-w-[700px] mx-auto cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      >
        {/* FRONT */}
        <div
          className="w-full rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(145deg, #0d1526, #111d2e)',
            border: '1px solid #1a2d45',
          }}
        >
          <div className="flex items-center justify-between w-full mb-6">
            <span
              className="text-badge px-3 py-1 rounded-full"
              style={{ backgroundColor: `${card.domainColor}20`, color: card.domainColor, border: `1px solid ${card.domainColor}40` }}
            >
              {card.domain}
            </span>
            <span className="text-caption text-[#4a6682] font-display">
              {index + 1}/{total}
            </span>
          </div>

          <div className="flex items-start gap-3 w-full justify-center max-w-xl mb-4">
            <h3 className="text-h3 text-[#e0f2fe] font-body">{card.front}</h3>
            <SpeakerButton text={card.front} size={16} />
          </div>

          {card.hint && (
            <p className="text-body-sm text-[#7da0c4] italic mb-6">{card.hint}</p>
          )}

          <div className="mt-auto pt-6">
            <span className="text-caption text-[#4a6682]">Click or press Space to reveal</span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 w-full rounded-2xl p-8 flex flex-col items-center justify-center text-center"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(145deg, #111d2e, #162236)',
            border: '1px solid #00ff41',
            boxShadow: '0 0 30px rgba(0,255,65,0.1)',
          }}
        >
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-badge text-[#00ff41] font-display tracking-wider">ANSWER</span>
            <span className="text-caption text-[#4a6682] font-display">{index + 1}/{total}</span>
          </div>

          <div className="flex items-start gap-3 w-full justify-center max-w-xl mb-4">
            <h3 className="text-h3 text-[#e0f2fe] font-body">{card.back}</h3>
            <SpeakerButton text={`${card.back}. ${card.explanation}`} size={16} />
          </div>

          <p className="text-body text-[#7da0c4] mb-4 max-w-xl">{card.explanation}</p>

          {card.eightyTwenty && (
            <div
              className="text-badge px-3 py-2 rounded-lg mb-3"
              style={{ backgroundColor: 'rgba(255,170,0,0.1)', color: '#ffaa00', border: '1px solid rgba(255,170,0,0.3)' }}
            >
              80/20: {card.eightyTwenty}
            </div>
          )}

          <div className="text-caption text-[#00d4ff] mt-2">
            Also study related concepts
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Confidence Rating Buttons
   ═══════════════════════════════════════════════════════════ */

function ConfidenceRating({ onRate, disabled }: { onRate: (ratingIndex: number) => void; disabled: boolean }) {
  return (
    <div className="max-w-[700px] mx-auto mt-6">
      <p className="text-body-sm text-[#7da0c4] text-center mb-3">How well did you know this?</p>
      <div className="grid grid-cols-4 gap-2">
        {RATING_CONFIG.map((r, i) => (
          <motion.button
            key={r.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3, ease: easeExpoOut }}
            disabled={disabled}
            onClick={() => onRate(i)}
            className="relative py-3 px-2 rounded-lg border text-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{
              backgroundColor: r.bg,
              borderColor: r.border,
              color: r.color,
            }}
          >
            <div className="font-display text-sm font-bold mb-1">{r.label}</div>
            <div className="text-[0.625rem] text-[#7da0c4] opacity-70 group-hover:opacity-100">{r.interval}</div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg px-2 py-1 text-[0.625rem] text-[#7da0c4] whitespace-nowrap shadow-xl">
                {r.tooltip}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Progress Dots
   ═══════════════════════════════════════════════════════════ */

function ProgressDots({ current, total }: { current: number; total: number }) {
  const dots = Array.from({ length: Math.min(total, 12) }, (_, i) => i);
  const offset = Math.max(0, Math.min(current - 5, total - 12));

  return (
    <div className="flex items-center gap-1.5">
      {dots.map((i) => {
        const realIndex = i + offset;
        if (realIndex >= total) return null;
        const isCurrent = realIndex === current;
        const isReviewed = realIndex < current;

        return (
          <motion.div
            key={realIndex}
            className="rounded-full transition-all duration-200"
            style={{
              width: isCurrent ? 10 : 6,
              height: isCurrent ? 10 : 6,
              backgroundColor: isCurrent ? '#00ff41' : isReviewed ? '#00d4ff' : '#1a2d45',
            }}
            animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Session Complete
   ═══════════════════════════════════════════════════════════ */

function SessionComplete({
  sessionStats,
  onRestart,
  onChangeDeck,
}: {
  sessionStats: { studied: number; correct: number; again: number; hard: number; good: number; easy: number };
  onRestart: () => void;
  onChangeDeck: () => void;
}) {
  const accuracy = sessionStats.studied > 0 ? Math.round((sessionStats.correct / sessionStats.studied) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: easeExpoOut }}
      className="max-w-[700px] mx-auto"
    >
      <Card
        className="p-8 text-center"
        style={{
          background: 'linear-gradient(145deg, #0d1526, #111d2e)',
          border: '1px solid #00ff41',
          boxShadow: '0 0 40px rgba(0,255,65,0.1)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: easeExpoOut }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00ff41] bg-opacity-10 flex items-center justify-center"
        >
          <Trophy size={32} className="text-[#00ff41]" />
        </motion.div>

        <h2 className="text-h2 text-[#e0f2fe] mb-2">Session Complete!</h2>
        <p className="text-body text-[#7da0c4] mb-6">Great work! Here&apos;s how you did:</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111d2e] rounded-lg p-3 border border-[#1a2d45]">
            <div className="text-xp text-[#00d4ff] text-xl">{sessionStats.studied}</div>
            <div className="text-caption text-[#7da0c4]">Cards Studied</div>
          </div>
          <div className="bg-[#111d2e] rounded-lg p-3 border border-[#1a2d45]">
            <div className="text-xp text-[#00ff41] text-xl">{accuracy}%</div>
            <div className="text-caption text-[#7da0c4]">Accuracy</div>
          </div>
          <div className="bg-[#111d2e] rounded-lg p-3 border border-[#1a2d45]">
            <div className="text-xp text-[#ffaa00] text-xl">{sessionStats.again + sessionStats.hard}</div>
            <div className="text-caption text-[#7da0c4]">Needs Review</div>
          </div>
          <div className="bg-[#111d2e] rounded-lg p-3 border border-[#1a2d45]">
            <div className="text-xp text-[#a855f7] text-xl">{sessionStats.good + sessionStats.easy}</div>
            <div className="text-caption text-[#7da0c4]">Mastered</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRestart}
            className="px-5 py-2.5 rounded border border-[#00ff41] text-[#00ff41] font-display text-sm hover:bg-[#00ff41] hover:text-[#0a0e17] transition-all duration-200"
          >
            <RotateCcw size={14} className="inline mr-2" />
            Study Again
          </button>
          <button
            onClick={onChangeDeck}
            className="px-5 py-2.5 rounded border border-[#00d4ff] text-[#00d4ff] font-display text-sm hover:bg-[#00d4ff] hover:text-[#0a0e17] transition-all duration-200"
          >
            <Layers size={14} className="inline mr-2" />
            Change Deck
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Deck Selector
   ═══════════════════════════════════════════════════════════ */

function DeckSelector({
  decks,
  activeDeckId,
  onSelect,
}: {
  decks: Deck[];
  activeDeckId: string;
  onSelect: (deckId: string) => void;
}) {
  return (
    <div className="px-8 py-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {decks.map((deck, i) => {
          const isActive = deck.id === activeDeckId;
          return (
            <motion.button
              key={deck.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3, ease: easeExpoOut }}
              onClick={() => onSelect(deck.id)}
              className="flex-shrink-0 min-w-[180px] rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: '#0d1526',
                border: isActive ? `1px solid #00d4ff` : `1px solid #1a2d45`,
                boxShadow: isActive ? '0 0 15px rgba(0,212,255,0.15)' : 'none',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Layers size={16} style={{ color: deck.domainColor }} />
                <span className="text-body-sm text-[#e0f2fe] font-body font-medium truncate">{deck.name}</span>
              </div>
              <div className="text-caption text-[#7da0c4]">{deck.cards.length} cards</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-caption text-[#00ff41]">{deck.mastered}% mastered</span>
                {deck.mastered < 100 && deck.id !== 'all-cards' && (
                  <span
                    className="text-[0.625rem] px-2 py-0.5 rounded-full font-display"
                    style={{ backgroundColor: `${deck.domainColor}20`, color: deck.domainColor }}
                  >
                    {Math.max(1, Math.floor(deck.cards.length * (100 - deck.mastered) / 100))} due
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Study Stats Row
   ═══════════════════════════════════════════════════════════ */

function StudyStatsRow({
  stats,
}: {
  stats: { cardsMastered: number; cardsDueToday: number; studyStreak: number; retentionRate: number };
}) {
  return (
    <div className="px-8 py-4">
      <div className="max-w-[800px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Cards Mastered', value: stats.cardsMastered, color: '#00ff41', icon: <Check size={16} /> },
          { label: 'Due Today', value: stats.cardsDueToday, color: '#ffaa00', icon: <Clock size={16} /> },
          { label: 'Study Streak', value: `${stats.studyStreak} days`, color: '#00d4ff', icon: <Flame size={16} /> },
          { label: 'Retention Rate', value: `${stats.retentionRate}%`, color: '#a855f7', icon: <Brain size={16} /> },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: easeExpoOut }}
          >
            <Card className="bg-gradient-to-br from-[#0d1526] to-[#111d2e] border-[#1a2d45] p-3 text-center hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-center gap-1 mb-1" style={{ color: s.color }}>
                {s.icon}
              </div>
              <div className="font-display text-xl font-bold" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-caption text-[#7da0c4]">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT: Due Cards Accordion
   ═══════════════════════════════════════════════════════════ */

function DueCardsList({ deck }: { deck: Deck }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const dueCards = deck.cards.filter((c) => {
    const nextReview = new Date(c.nextReview);
    return nextReview <= new Date();
  });

  if (dueCards.length === 0) return null;

  return (
    <div className="px-8 pb-8">
      <div className="max-w-[800px] mx-auto">
        <h3 className="text-h3 text-[#e0f2fe] text-lg mb-3">Due for Review</h3>
        <div className="space-y-2">
          {dueCards.map((card, i) => {
            const isExpanded = expandedId === card.id;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="rounded-lg border border-[#1a2d45] bg-[#0d1526] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : card.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#111d2e] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="w-4 h-4 accent-[#00ff41] rounded"
                  />
                  <span className="flex-1 text-body-sm text-[#e0f2fe] truncate">{card.front}</span>
                  <span className="text-caption text-[#ffaa00] flex-shrink-0">Due now</span>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={14} className="text-[#4a6682]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: easeExpoOut }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3 pl-11">
                        <div className="text-caption text-[#00ff41] font-display mb-1">{card.back}</div>
                        <div className="text-caption text-[#7da0c4]">{card.explanation}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function Flashcards() {
  const [activeDeckId, setActiveDeckId] = useState('sql-injection');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [direction, setDirection] = useState(0);
  const [cardStates, setCardStates] = useState<Record<string, CardState>>({});
  const [sessionStats, setSessionStats] = useState({
    studied: 0,
    correct: 0,
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  });

  const activeDeck = DECKS.find((d) => d.id === activeDeckId) || DECKS[0];
  const currentCard = activeDeck.cards[cardIndex];
  const totalCards = activeDeck.cards.length;

  // Initialize card states
  useEffect(() => {
    const states: Record<string, CardState> = {};
    DECKS.forEach((deck) => {
      deck.cards.forEach((card) => {
        states[card.id] = {
          card,
          interval: card.interval,
          easeFactor: 2.5,
          repetitions: card.timesReviewed,
          nextReview: new Date(card.nextReview),
        };
      });
    });
    setCardStates(states);
  }, []);

  const handleFlip = useCallback(() => {
    if (!sessionComplete) {
      setIsFlipped((f) => !f);
    }
  }, [sessionComplete]);

  const handleRate = useCallback(
    (ratingIndex: number) => {
      if (!currentCard) return;

      const rating = RATING_CONFIG[ratingIndex];
      const state = cardStates[currentCard.id];
      const newStats = { ...sessionStats };

      newStats.studied += 1;
      if (ratingIndex === 2 || ratingIndex === 3) newStats.correct += 1;
      if (ratingIndex === 0) newStats.again += 1;
      if (ratingIndex === 1) newStats.hard += 1;
      if (ratingIndex === 2) newStats.good += 1;
      if (ratingIndex === 3) newStats.easy += 1;

      setSessionStats(newStats);

      if (state) {
        const result = sm2Calculate(state.interval, state.repetitions, state.easeFactor, rating.quality);
        setCardStates((prev) => ({
          ...prev,
          [currentCard.id]: {
            ...state,
            interval: result.interval,
            repetitions: result.repetitions,
            easeFactor: result.easeFactor,
            nextReview: new Date(Date.now() + result.interval * 24 * 60 * 60 * 1000),
          },
        }));
      }

      // Move to next card
      if (cardIndex < totalCards - 1) {
        setIsFlipped(false);
        setDirection(1);
        setTimeout(() => {
          setCardIndex((i) => i + 1);
        }, 150);
      } else {
        setIsFlipped(false);
        setSessionComplete(true);
      }
    },
    [cardIndex, currentCard, totalCards, cardStates, sessionStats]
  );

  const handlePrev = useCallback(() => {
    if (cardIndex > 0 && !sessionComplete) {
      setIsFlipped(false);
      setDirection(-1);
      setTimeout(() => {
        setCardIndex((i) => i - 1);
      }, 150);
    }
  }, [cardIndex, sessionComplete]);

  const handleNext = useCallback(() => {
    if (cardIndex < totalCards - 1 && !sessionComplete) {
      setIsFlipped(false);
      setDirection(1);
      setTimeout(() => {
        setCardIndex((i) => i + 1);
      }, 150);
    }
  }, [cardIndex, totalCards, sessionComplete]);

  const handleSelectDeck = useCallback((deckId: string) => {
    setActiveDeckId(deckId);
    setCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setSessionStats({ studied: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 });
  }, []);

  const handleRestart = useCallback(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setSessionStats({ studied: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (sessionComplete) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleFlip();
          break;
        case '1':
          if (isFlipped) handleRate(0);
          break;
        case '2':
          if (isFlipped) handleRate(1);
          break;
        case '3':
          if (isFlipped) handleRate(2);
          break;
        case '4':
          if (isFlipped) handleRate(3);
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'ArrowRight':
          if (!isFlipped) {
            handleNext();
          }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleFlip, handleRate, handlePrev, handleNext, isFlipped, sessionComplete]);

  return (
    <main className="min-h-screen bg-[#0a0e17]">
      {/* Header */}
      <section className="px-8 py-5 border-b border-[#1a2d45] flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-h2 text-[#e0f2fe]"
          >
            Flashcards
          </motion.h1>
          <p className="text-body-sm text-[#7da0c4]">
            {activeDeck.name} — {activeDeck.domain}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void [...activeDeck.cards].sort(() => Math.random() - 0.5);
              // In real app, would update deck order
              setCardIndex(0);
              setIsFlipped(false);
            }}
            className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1a2d45] flex items-center justify-center text-[#7da0c4] hover:text-[#e0f2fe] hover:border-[#00d4ff] transition-all"
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button
            onClick={handleRestart}
            className="w-10 h-10 rounded-lg bg-[#111d2e] border border-[#1a2d45] flex items-center justify-center text-[#7da0c4] hover:text-[#ff3366] hover:border-[#ff3366] transition-all"
            title="Reset Progress"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </section>

      {/* Deck Selector */}
      <DeckSelector decks={DECKS} activeDeckId={activeDeckId} onSelect={handleSelectDeck} />

      {/* Session info bar */}
      <div className="px-8 py-2 flex items-center justify-center gap-4 text-caption text-[#7da0c4]">
        <span>
          Session: <span className="text-[#00d4ff] font-display">{Math.min(sessionStats.studied + 1, totalCards)}</span>/{totalCards} cards
        </span>
        <span>|</span>
        <span>
          Mode: <span className="text-[#e0f2fe]">Review All</span>
        </span>
      </div>

      {/* Flashcard Viewer */}
      <section className="px-8 py-6">
        {!sessionComplete && currentCard ? (
          <>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${activeDeckId}-${cardIndex}`}
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -50 }}
                transition={{ duration: 0.3, ease: easeExpoOut }}
              >
                <FlashcardFace
                  card={currentCard}
                  index={cardIndex}
                  total={totalCards}
                  isFlipped={isFlipped}
                  onFlip={handleFlip}
                />
              </motion.div>
            </AnimatePresence>

            {/* Confidence Rating */}
            {isFlipped && (
              <ConfidenceRating onRate={handleRate} disabled={false} />
            )}

            {/* Navigation */}
            <div className="max-w-[700px] mx-auto mt-6 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={cardIndex === 0}
                className="flex items-center gap-1 text-body-sm text-[#7da0c4] hover:text-[#e0f2fe] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <ProgressDots current={cardIndex} total={totalCards} />

              <button
                onClick={handleNext}
                disabled={cardIndex === totalCards - 1 || isFlipped}
                className="flex items-center gap-1 text-body-sm text-[#7da0c4] hover:text-[#e0f2fe] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : sessionComplete ? (
          <SessionComplete
            sessionStats={sessionStats}
            onRestart={handleRestart}
            onChangeDeck={() => setSessionComplete(false)}
          />
        ) : (
          <div className="text-center text-[#7da0c4] py-20">No cards available in this deck.</div>
        )}
      </section>

      {/* Study Stats */}
      <StudyStatsRow
        stats={{
          cardsMastered: 156,
          cardsDueToday: 42,
          studyStreak: 5,
          retentionRate: 78,
        }}
      />

      {/* Due Cards */}
      <DueCardsList deck={activeDeck} />
    </main>
  );
}
