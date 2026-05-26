// @ts-nocheck
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeakerButton } from '../components/SpeakerButton';
import {
  BookOpen,
  Timer,
  Volume2,
  Lightbulb,
  Flag,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  AlertTriangle,
  Trophy,
  Target,
  RotateCcw,
  Check,
  X,
  VolumeX,
  ClipboardList,
  Award,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────

interface ExamQuestion {
  id: string;
  exam: string;
  type: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  domain: string;
  seq_id: number;
  eighty_twenty_hint?: string;
  difficulty?: number;
  reference?: string;
}

interface Domain8020 {
  weight: string;
  must_know: string[];
  exam_focus: string;
}

interface ExamDB {
  metadata: {
    total_questions: number;
    domain_8020: Record<string, Domain8020>;
    domains: string[];
  };
  questions: ExamQuestion[];
}

interface AnswerRecord {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  hintsUsed: number;
  flagged: boolean;
}

interface SimulatorState {
  mode: 'practice' | 'exam' | 'simulator';
  timeRemaining: number;
  totalTime: number;
  isTimerRunning: boolean;
  flaggedQuestions: number[];
  currentQuestionIndex: number;
  answers: Record<number, number[]>;
  isSubmitted: boolean;
  startTime: number;
}

type QuizMode = 'practice' | 'exam' | 'simulator';
type QuizPhase = 'setup' | 'active' | 'ended';

// ── Domain Colors ───────────────────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  'Attacks and Exploits': '#ff3366',
  'Planning and Scoping': '#ffaa00',
  'Information Gathering and Vulnerability Scanning': '#00e5ff',
  'Tools and Code Analysis': '#a855f7',
  'Reporting and Communication': '#10b981',
  'General': '#7da0c4',
  'dynamic': '#7da0c4',
  'System.Text.Encoding': '#7da0c4',
  '0': '#7da0c4',
};

const DOMAIN_LABELS: Record<string, string> = {
  'Attacks and Exploits': 'Attacks & Exploits',
  'Planning and Scoping': 'Planning & Scoping',
  'Information Gathering and Vulnerability Scanning': 'Info Gathering',
  'Tools and Code Analysis': 'Tools & Code',
  'Reporting and Communication': 'Reporting',
  'General': 'General',
  'dynamic': 'General',
  'System.Text.Encoding': 'General',
  '0': 'General',
};

function getDomainColor(domain: string): string {
  return DOMAIN_COLORS[domain] || '#00d4ff';
}

function getDomainLabel(domain: string): string {
  return DOMAIN_LABELS[domain] || domain;
}

// ── Certification Databases ─────────────────────────────────────────

const CERT_DATABASES: Record<string, string> = {
  pentest: '/exam_database.json',
  security: '/security_plus_database.json',
  cysa: '/cysa_database.json',
  casp: '/casp_database.json',
  network: '/network_plus_database.json',
  aplus: '/aplus_database.json',
  lpi1: '/lpi1_database.json',
};

const CERT_NAMES: Record<string, string> = {
  pentest: 'PenTest+ PT0-002',
  security: 'Security+ SY0-701',
  cysa: 'CySA+ CS0-003',
  casp: 'CASP+ CAS-004',
  network: 'Network+ N10-009',
  aplus: 'A+ Core 1 (220-1101)',
  lpi1: 'LPI 1 (101-500)',
};

// ── Easing ──────────────────────────────────────────────────────────

const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeBounce = [0.68, -0.55, 0.265, 1.55] as [number, number, number, number];

// ── Constants ───────────────────────────────────────────────────────

const SIMULATOR_TIME = 5400; // 90 minutes in seconds
const SIMULATOR_QUESTIONS = 90;
const COMPTIA_PASSING_PCT = 83.33; // 750/900
const EXAM_TIME = 165 * 60; // 165 minutes in seconds
function getStorageKeyProgress(cert: string): string {
  return `trygit-quiz-progress-${cert}`;
}
function getStorageKeyHistory(cert: string): string {
  return `trygit-quiz-history-${cert}`;
}

// ── Utility Functions ───────────────────────────────────────────────

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Save / Load Progress ────────────────────────────────────────────

function saveProgress(answers: AnswerRecord[], mode: QuizMode, cert: string) {
  try {
    localStorage.setItem(getStorageKeyProgress(cert), JSON.stringify({ answers, mode, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

function clearProgress(cert: string) {
  try { localStorage.removeItem(getStorageKeyProgress(cert)); } catch { /* ignore */ }
}

function saveToHistory(result: { score: number; total: number; mode: QuizMode; domains: Record<string, { correct: number; total: number }>; timeTaken?: number }, cert: string) {
  try {
    const raw = localStorage.getItem(getStorageKeyHistory(cert));
    const history = raw ? JSON.parse(raw) : [];
    history.unshift({ ...result, date: new Date().toISOString() });
    if (history.length > 20) history.pop();
    localStorage.setItem(getStorageKeyHistory(cert), JSON.stringify(history));
  } catch { /* ignore */ }
}

// ── Sub-Components ─────────────────────────────────────────────────

// ---- Hint Modal ----
function HintModal({
  isOpen,
  onClose,
  hint,
  domainHint,
}: {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
  domainHint?: Domain8020;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-[rgba(10,14,23,0.85)] backdrop-blur-[8px] z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0d1526] border border-[#ffaa00] rounded-[16px] p-8 max-w-lg w-full shadow-[0_0_30px_rgba(255,170,0,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} className="text-[#ffaa00]" />
          <h3 className="font-display font-bold text-sm text-[#ffaa00] uppercase tracking-wider">
            80/20 HINT
          </h3>
        </div>
        <p className="text-body text-[#e0f2fe] mb-6 leading-relaxed">{hint}</p>
        {domainHint && (
          <div className="border border-[#ffaa00] rounded-[6px] p-4 bg-[rgba(255,170,0,0.05)]">
            <p className="text-caption text-[#ffaa00] font-bold mb-2">KEY CONCEPTS FOR THIS DOMAIN</p>
            <ul className="space-y-1">
              {domainHint.must_know.slice(0, 4).map((item, i) => (
                <li key={i} className="text-body-sm text-[#e0f2fe] flex items-start gap-2">
                  <span className="text-[#ffaa00] mt-1">-</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-caption text-[#4a6682] mt-3">Domain weight: {domainHint.weight}</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 border border-[#1a2d45] rounded-[4px] text-[#7da0c4] text-sm hover:border-[#00d4ff] hover:text-[#e0f2fe] transition-all duration-200"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ---- Question Grid Overlay ----
function QuestionGridOverlay({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answers,
  onJump,
  questions: _questions,
  mode,
  onReviewFlagged,
}: {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  answers: AnswerRecord[];
  onJump: (index: number) => void;
  questions: ExamQuestion[];
  mode: QuizMode;
  onReviewFlagged?: () => void;
}) {
  if (!isOpen) return null;

  const flaggedIndices = answers.map((a, i) => (a?.flagged ? i : -1)).filter((i) => i !== -1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-[rgba(10,14,23,0.9)] z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0d1526] border border-[#1a2d45] rounded-[12px] max-w-[600px] w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h4 text-[#e0f2fe] font-display">Question Grid</h3>
          {mode === 'simulator' && flaggedIndices.length > 0 && onReviewFlagged && (
            <button
              onClick={() => { onReviewFlagged(); onClose(); }}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#ff7b00] rounded-[4px] text-[#ff7b00] text-xs font-display hover:bg-[rgba(255,123,0,0.1)] transition-all"
            >
              <Flag size={12} />
              Review Flagged ({flaggedIndices.length})
            </button>
          )}
        </div>
        <div className="grid grid-cols-10 gap-2">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const answer = answers[i];
            const isCurrent = i === currentIndex;
            const isCorrect = answer?.isCorrect;
            const isAnswered = !!answer?.selectedAnswer;
            const isFlagged = answer?.flagged;

            let bgClass = 'bg-[#1a2d45] text-[#7da0c4]';
            if (isCurrent) bgClass = 'border-2 border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.1)]';
            else if (isCorrect) bgClass = 'bg-[#00ff41] text-[#0a0e17]';
            else if (isAnswered && !isCorrect) bgClass = 'bg-[#ff3366] text-[#0a0e17]';

            return (
              <button
                key={i}
                onClick={() => { onJump(i); onClose(); }}
                className={`relative w-8 h-8 rounded-[4px] text-xs font-display font-medium flex items-center justify-center hover:scale-110 transition-transform duration-150 ${bgClass}`}
              >
                {i + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff7b00]" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 text-caption text-[#7da0c4] flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#1a2d45]" /> Unanswered</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#00ff41]" /> Correct</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#ff3366]" /> Wrong</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border border-[#00d4ff]" /> Current</span>
          {mode === 'simulator' && (
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#ff7b00]" /> Flagged</span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- End Exam Modal ----
function EndExamModal({
  isOpen,
  onConfirm,
  onCancel,
  mode,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  mode?: QuizMode;
}) {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[rgba(10,14,23,0.85)] backdrop-blur-[8px] z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-[#0d1526] border border-[#1a2d45] rounded-[16px] p-8 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={24} className="text-[#ffaa00]" />
          <h3 className="text-h4 text-[#e0f2fe] font-display">
            {mode === 'simulator' ? 'End Exam?' : 'End Session?'}
          </h3>
        </div>
        <p className="text-body-sm text-[#7da0c4] mb-6">
          {mode === 'simulator'
            ? 'Are you sure you want to end this exam? Your score will be calculated and you cannot resume.'
            : 'Are you sure you want to end this session? Your progress will be saved to history.'}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-[#1a2d45] rounded-[4px] text-[#7da0c4] text-sm hover:border-[#00d4ff] hover:text-[#e0f2fe] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-[#ff3366] rounded-[4px] text-[#ff3366] text-sm hover:bg-[#ff3366] hover:text-[#0a0e17] transition-all"
          >
            {mode === 'simulator' ? 'Submit Exam' : 'End Session'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---- Timer Warning Banner ----
function TimerWarning({ message, color }: { message: string; color: 'yellow' | 'red' }) {
  const borderColor = color === 'yellow' ? 'border-[#ffaa00]' : 'border-[#ff3366]';
  const textColor = color === 'yellow' ? 'text-[#ffaa00]' : 'text-[#ff3366]';
  const bgColor = color === 'yellow' ? 'bg-[rgba(255,170,0,0.1)]' : 'bg-[rgba(255,51,102,0.1)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-16 left-0 right-0 z-40 flex items-center justify-center ${bgColor} border-b ${borderColor} py-2 px-4`}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className={`flex items-center gap-2 text-sm font-display font-bold uppercase tracking-wider ${textColor}`}
      >
        <AlertTriangle size={16} />
        {message}
      </motion.div>
    </motion.div>
  );
}

// ── Main Quiz Component ─────────────────────────────────────────────

export default function Quiz() {
  // -- URL param for certification selection --
  const [searchParams] = useSearchParams();
  const cert = searchParams.get('cert') || 'pentest';
  const dbUrl = CERT_DATABASES[cert] || CERT_DATABASES.pentest;
  const certName = CERT_NAMES[cert] || CERT_NAMES.pentest;

  // -- Data loading --
  const [db, setDb] = useState<ExamDB | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -- Quiz state --
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [mode, setMode] = useState<QuizMode>('practice');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(EXAM_TIME);
  const [timerRunning, setTimerRunning] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const maxHints = 5;
  const [questionCount, setQuestionCount] = useState(50);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [includePBQs, setIncludePBQs] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [direction, setDirection] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [warning15Shown, setWarning15Shown] = useState(false);
  const [warning5Shown, setWarning5Shown] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // -- Load exam database --
  useEffect(() => {
    setIsLoading(true);
    fetch(dbUrl)
      .then((res) => res.json())
      .then((data: ExamDB) => {
        setDb(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [dbUrl]);

  // -- Timer --
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setPhase('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeRemaining]);

  // -- Timer warnings --
  useEffect(() => {
    if (mode !== 'simulator' || phase !== 'active') return;

    if (timeRemaining <= 15 * 60 && !warning15Shown) {
      setWarning15Shown(true);
    }
    if (timeRemaining <= 5 * 60 && !warning5Shown) {
      setWarning5Shown(true);
    }
  }, [timeRemaining, mode, phase, warning15Shown, warning5Shown]);

  // -- Keyboard shortcuts --
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phase !== 'active') return;
      if (showHint || showGrid || showEndConfirm) return;

      const currentQ = questions[currentIndex];
      if (!currentQ) return;

      // Number keys 1-5 select options
      const num = parseInt(e.key);
      if (num >= 1 && num <= currentQ.options.length && !hasSubmitted) {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        setSelectedOption(letters[num - 1]);
      }
      // H for hint
      if (e.key === 'h' || e.key === 'H') {
        if (mode === 'practice' && !hasSubmitted) {
          handleShowHint();
        }
      }
      // Enter to submit or next
      if (e.key === 'Enter') {
        if (!hasSubmitted && selectedOption) {
          handleSubmit();
        } else if (hasSubmitted) {
          goToNext();
        }
      }
      // F to flag
      if (e.key === 'f' || e.key === 'F') {
        handleFlag();
      }
      // Arrow keys to navigate
      if (e.key === 'ArrowRight' && hasSubmitted) {
        goToNext();
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToPrev();
      }
      // Esc closes modals
      if (e.key === 'Escape') {
        setShowHint(false);
        setShowGrid(false);
        setShowEndConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // -- Derived state --
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const score = answers.filter((a) => a.isCorrect).length;
  const answeredCount = answers.filter((a) => a.selectedAnswer).length;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const domainBreakdown = useMemo(() => {
    const map: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      const ans = answers[i];
      if (!map[q.domain]) map[q.domain] = { correct: 0, total: 0 };
      map[q.domain].total++;
      if (ans?.selectedAnswer) {
        if (ans.isCorrect) map[q.domain].correct++;
      }
    });
    return map;
  }, [questions, answers]);

  const timeTaken = useMemo(() => {
    if (mode === 'simulator' && startTime > 0) {
      const totalTime = mode === 'simulator' ? SIMULATOR_TIME : EXAM_TIME;
      return totalTime - timeRemaining;
    }
    return 0;
  }, [mode, startTime, timeRemaining]);

  // -- Start quiz --
  const startQuiz = useCallback(() => {
    if (!db) return;

    let pool = [...db.questions];

    // Filter by domain
    if (selectedDomains.length > 0) {
      pool = pool.filter((q) => selectedDomains.includes(q.domain));
    }

    // Exclude PBQs unless included
    if (!includePBQs) {
      pool = pool.filter((q) => q.type === 'multiple_choice' || q.type === 'multiple_select');
    }

    // Shuffle and limit
    pool = shuffleArray(pool);

    // For simulator mode, always use 90 questions; use 'All' means pool.length
    const allQuestionCount = db.metadata.total_questions;
    const count = mode === 'simulator' ? SIMULATOR_QUESTIONS : (questionCount !== allQuestionCount ? questionCount : pool.length);
    pool = pool.slice(0, Math.min(count, pool.length));

    setQuestions(pool);
    setCurrentIndex(0);
    setAnswers(
      pool.map((q) => ({
        questionId: q.id,
        selectedAnswer: '',
        isCorrect: false,
        hintsUsed: 0,
        flagged: false,
      }))
    );
    setSelectedOption(null);
    setHasSubmitted(false);
    setHintCount(0);
    setWarning15Shown(false);
    setWarning5Shown(false);
    setStartTime(Date.now());
    setPhase('active');

    if (mode === 'exam') {
      setTimeRemaining(EXAM_TIME);
      setTimerRunning(true);
    } else if (mode === 'simulator') {
      setTimeRemaining(SIMULATOR_TIME);
      setTimerRunning(true);
    } else {
      setTimeRemaining(EXAM_TIME);
      setTimerRunning(false);
    }
  }, [db, selectedDomains, includePBQs, questionCount, mode]);

  // -- End quiz --
  const endQuiz = useCallback(() => {
    setTimerRunning(false);
    setPhase('ended');
    const totalTime = mode === 'simulator' ? SIMULATOR_TIME : EXAM_TIME;
    saveToHistory({
      score,
      total: questions.length,
      mode,
      domains: domainBreakdown,
      timeTaken: totalTime - timeRemaining,
    }, cert);
    clearProgress(cert);
  }, [score, questions.length, mode, domainBreakdown, timeRemaining, cert]);

  // -- Navigation --
  const goToQuestion = useCallback(
    (index: number) => {
      if (index < 0 || index >= questions.length) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      const ans = answers[index];
      setSelectedOption(ans?.selectedAnswer || null);
      setHasSubmitted(!!ans?.selectedAnswer);
    },
    [questions.length, currentIndex, answers]
  );

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      goToQuestion(currentIndex + 1);
    } else {
      endQuiz();
    }
  }, [currentIndex, questions.length, goToQuestion, endQuiz]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      goToQuestion(currentIndex - 1);
    }
  }, [currentIndex, goToQuestion]);

  // -- Review flagged questions --
  const goToNextFlagged = useCallback(() => {
    const flaggedIndices = answers.map((a, i) => (a?.flagged ? i : -1)).filter((i) => i !== -1);
    if (flaggedIndices.length === 0) return;
    // Find the next flagged question after current index
    const nextFlagged = flaggedIndices.find((i) => i > currentIndex);
    if (nextFlagged !== undefined) {
      goToQuestion(nextFlagged);
    } else {
      // Wrap around to the first flagged
      goToQuestion(flaggedIndices[0]);
    }
  }, [answers, currentIndex, goToQuestion]);

  // -- Submit answer --
  const handleSubmit = useCallback(() => {
    if (!selectedOption || !currentQuestion || hasSubmitted) return;

    const isCorrect = selectedOption === currentQuestion.correct_answer;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedOption,
      isCorrect,
      hintsUsed: currentAnswer?.hintsUsed || 0,
      flagged: currentAnswer?.flagged || false,
    };
    setAnswers(newAnswers);
    setHasSubmitted(true);
    saveProgress(newAnswers, mode, cert);
  }, [selectedOption, currentQuestion, hasSubmitted, answers, currentIndex, currentAnswer, mode, cert]);

  // -- Show hint --
  const handleShowHint = useCallback(() => {
    if (hintCount < maxHints) {
      setShowHint(true);
      if (mode === 'practice') {
        setHintCount((prev) => prev + 1);
        const newAnswers = [...answers];
        if (newAnswers[currentIndex]) {
          newAnswers[currentIndex] = {
            ...newAnswers[currentIndex],
            hintsUsed: (newAnswers[currentIndex].hintsUsed || 0) + 1,
          };
          setAnswers(newAnswers);
        }
      }
    }
  }, [hintCount, maxHints, mode, answers, currentIndex]);

  // -- Flag question --
  const handleFlag = useCallback(() => {
    const newAnswers = [...answers];
    if (newAnswers[currentIndex]) {
      newAnswers[currentIndex] = {
        ...newAnswers[currentIndex],
        flagged: !newAnswers[currentIndex].flagged,
      };
      setAnswers(newAnswers);
    }
  }, [answers, currentIndex]);

  // -- Loading state --
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-body-sm text-[#7da0c4]">Loading {certName} Database...</p>
        </div>
      </div>
    );
  }

  // -- Phase: SETUP --
  if (phase === 'setup') {
    return <QuizSetup db={db!} onStart={startQuiz} mode={mode} setMode={setMode} questionCount={questionCount} setQuestionCount={setQuestionCount} selectedDomains={selectedDomains} setSelectedDomains={setSelectedDomains} includePBQs={includePBQs} setIncludePBQs={setIncludePBQs} cert={cert} certName={certName} />;
  }

  // -- Phase: ENDED --
  if (phase === 'ended') {
    // Use simulator score report for simulator mode
    if (mode === 'simulator') {
      return (
        <SimulatorScoreReport
          score={score}
          total={questions.length}
          domainBreakdown={domainBreakdown}
          answers={answers}
          questions={questions}
          timeTaken={timeTaken}
          onRetry={() => { setPhase('setup'); clearProgress(cert); }}
        />
      );
    }
    return (
      <ExamResults
        score={score}
        total={questions.length}
        mode={mode}
        domainBreakdown={domainBreakdown}
        answers={answers}
        questions={questions}
        onRetry={() => { setPhase('setup'); clearProgress(cert); }}
      />
    );
  }

  // -- Phase: ACTIVE --
  // Timer color: green (>30 min), yellow (10-30 min), red (<10 min)
  const timerColor =
    timeRemaining < 600
      ? 'text-[#ff3366]'
      : timeRemaining < 1800
        ? 'text-[#ffaa00]'
        : 'text-[#e0f2fe]';

  // Pulse animation when under 5 minutes
  const timerPulse = timeRemaining < 300;

  // Show timer for exam and simulator modes
  const showTimer = mode === 'exam' || mode === 'simulator';
  const useShortTimerFormat = mode === 'simulator';

  const domainColor = currentQuestion ? getDomainColor(currentQuestion.domain) : '#00d4ff';
  const domainLabel = currentQuestion ? getDomainLabel(currentQuestion.domain) : '';

  const flaggedCount = answers.filter((a) => a?.flagged).length;

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] pb-20">
      {/* Timer Warning Banners */}
      <AnimatePresence>
        {warning15Shown && timeRemaining > 5 * 60 && (
          <TimerWarning message="15 minutes remaining" color="yellow" />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {warning5Shown && timeRemaining > 0 && (
          <TimerWarning message="5 minutes remaining!" color="red" />
        )}
      </AnimatePresence>

      {/* ── Quiz Header ── */}
      <div className="sticky top-0 z-30 h-16 bg-[rgba(13,21,38,0.95)] backdrop-blur-[12px] border-b border-[#1a2d45] px-6 flex items-center justify-between">
        {/* Mode */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-[4px] text-xs font-display font-bold uppercase tracking-wider border ${
            mode === 'practice'
              ? 'border-[#00ff41] text-[#00ff41]'
              : mode === 'exam'
                ? 'border-[#ffaa00] text-[#ffaa00]'
                : 'border-[#ff3366] text-[#ff3366]'
          }`}>
            {mode === 'practice' ? 'Practice Mode' : mode === 'exam' ? 'Exam Mode' : 'Simulator Mode'}
          </span>
          {mode === 'simulator' && flaggedCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-[4px] text-xs font-display border border-[#ff7b00] text-[#ff7b00]">
              <Flag size={10} />
              {flaggedCount}
            </span>
          )}
        </div>

        {/* Timer */}
        {showTimer && (
          <motion.div
            className={`font-display font-bold text-lg ${timerColor} ${timerPulse ? 'animate-pulse' : ''}`}
            animate={timerPulse ? { scale: [1, 1.05, 1] } : {}}
            transition={timerPulse ? { duration: 1, repeat: Infinity } : {}}
          >
            <span className="flex items-center gap-2">
              <Timer size={18} />
              {useShortTimerFormat ? formatTimeShort(timeRemaining) : formatTime(timeRemaining)}
            </span>
          </motion.div>
        )}

        {/* Question Counter */}
        <div className="text-center">
          <span className="text-sm text-[#7da0c4] font-body">
            Question {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-32 h-1 bg-[#1a2d45] rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full gradient-progress rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Score */}
        <div className="font-display text-sm">
          <span className="text-[#00ff41]">{score}</span>
          <span className="text-[#7da0c4]"> / </span>
          <span className="text-[#ff3366]">{answeredCount - score}</span>
          <span className="text-[#4a6682] ml-1">({questions.length > 0 ? Math.round((score / questions.length) * 100) : 0}%)</span>
        </div>

        {/* End button */}
        <button
          onClick={() => setShowEndConfirm(true)}
          className="px-3 py-1 border border-[#ff3366] rounded-[4px] text-[#ff3366] text-xs font-display uppercase hover:bg-[#ff3366] hover:text-[#0a0e17] transition-all"
        >
          {mode === 'simulator' ? 'Submit' : 'End'}
        </button>
      </div>

      {/* ── Question Card ── */}
      <div className="max-w-[900px] mx-auto mt-8 px-6">
        <AnimatePresence mode="wait" custom={direction}>
          {currentQuestion && (
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.3, ease: easeExpoOut }}
            >
              {/* Question Container */}
              <div
                className={`relative bg-[#0d1117] border rounded-[8px] p-8 overflow-hidden transition-all duration-300 ${
                  hasSubmitted && currentAnswer?.isCorrect
                    ? 'border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.2)]'
                    : hasSubmitted && !currentAnswer?.isCorrect
                      ? 'border-[#ff3366]'
                      : 'border-[#1a2d45]'
                }`}
              >
                {/* Scanline overlay */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background:
                      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.02) 2px, rgba(0,255,65,0.02) 4px)',
                  }}
                />

                {/* Question Header */}
                <div className="relative z-10">
                  {/* Row 1: badges */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[#00d4ff] text-[#0a0e17] font-display font-bold text-xs">
                      Q{currentIndex + 1}
                    </span>
                    <span
                      className="px-3 py-1 rounded-full border text-xs font-display font-medium"
                      style={{ borderColor: domainColor, color: domainColor }}
                    >
                      {domainLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-[#1a2d45] text-[#7da0c4] text-xs font-body">
                      {currentQuestion.type === 'multiple_choice'
                        ? 'Multiple Choice'
                        : currentQuestion.type === 'multiple_select'
                          ? 'Multiple Select'
                          : currentQuestion.type === 'drag_drop'
                            ? 'Drag & Drop'
                            : currentQuestion.type === 'hotspot'
                              ? 'Hotspot'
                              : currentQuestion.type}
                    </span>
                    {currentAnswer?.flagged && (
                      <span className="px-2 py-1 rounded-full border border-[#ff7b00] text-[#ff7b00] text-xs flex items-center gap-1">
                        <Flag size={10} /> Flagged
                      </span>
                    )}
                  </div>

                  {/* Row 2: question text */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-start gap-3 flex-1">
                      <p className="text-body text-[#e0f2fe] leading-[1.7] flex-1">
                        {currentQuestion.question}
                      </p>
                      <SpeakerButton text={currentQuestion.question} />
                    </div>
                    <button
                      onClick={() => setAudioOn(!audioOn)}
                      className="flex-shrink-0 p-2 rounded-[8px] bg-[#111d2e] border border-[#1a2d45] text-[#00d4ff] hover:border-[#00d4ff] transition-all"
                      title="Toggle audio narration"
                    >
                      {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => {
                      const letters = ['A', 'B', 'C', 'D', 'E'];
                      const letter = letters[idx] || String.fromCharCode(65 + idx);
                      const isSelected = selectedOption === letter;
                      const isCorrect = letter === currentQuestion.correct_answer;
                      const isWrongSelected = hasSubmitted && isSelected && !isCorrect;

                      let optionClass = 'bg-[#111d2e] border-[#1a2d45]';
                      let letterClass = 'border-[#1a2d45] text-[#7da0c4]';

                      if (hasSubmitted && isCorrect) {
                        optionClass = 'bg-[rgba(0,255,65,0.1)] border-[#00ff41]';
                        letterClass = 'bg-[#00ff41] text-[#0a0e17]';
                      } else if (isWrongSelected) {
                        optionClass = 'bg-[rgba(255,51,102,0.1)] border-[#ff3366]';
                        letterClass = 'bg-[#ff3366] text-[#0a0e17]';
                      } else if (isSelected && !hasSubmitted) {
                        optionClass = 'bg-[rgba(0,212,255,0.08)] border-[#00d4ff]';
                        letterClass = 'bg-[#00d4ff] text-[#0a0e17]';
                      }

                      return (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06, duration: 0.3 }}
                          onClick={() => !hasSubmitted && setSelectedOption(letter)}
                          disabled={hasSubmitted}
                          className={`w-full flex items-center gap-4 p-4 rounded-[6px] border text-left transition-all duration-200 hover:border-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)] disabled:cursor-default ${optionClass}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-full border flex items-center justify-center font-display font-medium text-xs flex-shrink-0 ${letterClass}`}
                          >
                            {letter}
                          </span>
                          <span className="text-[#e0f2fe] text-[0.9375rem] font-body flex-1">
                            {option}
                          </span>
                          {hasSubmitted && isCorrect && (
                            <CheckCircle size={20} className="text-[#00ff41] flex-shrink-0" />
                          )}
                          {isWrongSelected && (
                            <XCircle size={20} className="text-[#ff3366] flex-shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1a2d45]">
                    <div className="flex items-center gap-3">
                      {mode === 'practice' && (
                        <button
                          onClick={handleShowHint}
                          disabled={hintCount >= maxHints || hasSubmitted}
                          className="flex items-center gap-2 px-4 py-2 border border-[#ffaa00] rounded-[4px] text-[#ffaa00] text-sm hover:bg-[rgba(255,170,0,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Lightbulb size={16} />
                          80/20 Hint
                        </button>
                      )}
                      {/* Flag button - always visible */}
                      <button
                        onClick={handleFlag}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-[4px] text-sm transition-all ${
                          currentAnswer?.flagged
                            ? 'border-[#ff7b00] text-[#ff7b00]'
                            : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#ff7b00] hover:text-[#ff7b00]'
                        }`}
                        title="Flag for review (F)"
                      >
                        <Flag size={16} />
                        {currentAnswer?.flagged ? 'Flagged' : 'Flag'}
                      </button>
                      {mode === 'practice' && (
                        <span className="text-caption text-[#4a6682]">
                          {hintCount}/{maxHints} hints used
                        </span>
                      )}
                    </div>

                    <button
                      onClick={hasSubmitted ? goToNext : handleSubmit}
                      disabled={!selectedOption && !hasSubmitted}
                      className={`px-6 py-3 border rounded-[4px] text-sm font-display font-medium uppercase tracking-wider transition-all ${
                        hasSubmitted
                          ? 'border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0a0e17] hover:shadow-[0_0_20px_rgba(0,255,65,0.3)]'
                          : 'border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0a0e17] hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {hasSubmitted
                        ? currentIndex < questions.length - 1
                          ? 'Next'
                          : mode === 'simulator' ? 'Submit Exam' : 'Finish'
                        : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Feedback Panel (Practice Mode) */}
              {hasSubmitted && mode === 'practice' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: easeExpoOut }}
                  className="mt-4 bg-[#0d1526] border border-[#1a2d45] rounded-[8px] p-6"
                >
                  {currentAnswer?.isCorrect ? (
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle size={24} className="text-[#00ff41]" />
                      <span className="text-h4 text-[#00ff41]">Correct! Well done.</span>
                      <span className="ml-auto text-xs font-display font-bold text-[#00ff41] bg-[rgba(0,255,65,0.15)] px-2 py-1 rounded">
                        +{currentAnswer?.hintsUsed ? 5 : 10} XP
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle size={24} className="text-[#ff3366]" />
                      <span className="text-h4 text-[#ff3366]">
                        Incorrect. The correct answer was {currentQuestion.correct_answer}.
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h4 className="font-display font-semibold text-sm text-[#e0f2fe] mb-2">Explanation</h4>
                    <p className="text-body-sm text-[#7da0c4] leading-relaxed whitespace-pre-line">
                      {currentQuestion.explanation}
                    </p>
                    <div className="flex items-start gap-2 mt-2">
                      <SpeakerButton text={currentQuestion.explanation || ''} size={16} />
                      <span className="text-caption text-[#7da0c4]">Read explanation</span>
                    </div>
                  </div>

                  {currentQuestion.eighty_twenty_hint && (
                    <div className="border border-[#ffaa00] rounded-[6px] p-4 bg-[rgba(255,170,0,0.05)]">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb size={16} className="text-[#ffaa00]" />
                        <span className="font-display font-bold text-xs text-[#ffaa00] uppercase">
                          80/20 Key Concept
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <p className="text-body-sm text-[#e0f2fe] flex-1">{currentQuestion.eighty_twenty_hint}</p>
                        <SpeakerButton text={currentQuestion.eighty_twenty_hint} size={16} />
                      </div>
                    </div>
                  )}

                  {currentQuestion.reference && (
                    <p className="mt-4 text-caption text-[#4a6682]">
                      Reference: {currentQuestion.reference}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="fixed bottom-0 left-0 right-0 h-14 bg-[rgba(13,21,38,0.95)] backdrop-blur-[12px] border-t border-[#1a2d45] px-6 flex items-center justify-between z-30" style={{ marginLeft: 72 }}>
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 border border-[#1a2d45] rounded-[4px] text-[#7da0c4] text-sm hover:border-[#00d4ff] hover:text-[#e0f2fe] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {/* Review Flagged button - simulator mode only */}
          {mode === 'simulator' && flaggedCount > 0 && (
            <button
              onClick={goToNextFlagged}
              className="flex items-center gap-2 px-4 py-2 border border-[#ff7b00] rounded-[4px] text-[#ff7b00] text-sm hover:bg-[rgba(255,123,0,0.1)] transition-all"
              title="Jump to next flagged question"
            >
              <Flag size={14} />
              Review Flagged
            </button>
          )}
          <button
            onClick={() => setShowGrid(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[#1a2d45] rounded-[4px] text-[#7da0c4] text-sm hover:border-[#00d4ff] hover:text-[#e0f2fe] transition-all"
          >
            <Grid3x3 size={16} />
            Question Grid
          </button>
        </div>

        <button
          onClick={hasSubmitted ? goToNext : () => { if (selectedOption) handleSubmit(); }}
          disabled={!hasSubmitted && !selectedOption}
          className="flex items-center gap-2 px-4 py-2 border border-[#00ff41] rounded-[4px] text-[#00ff41] text-sm hover:bg-[#00ff41] hover:text-[#0a0e17] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasSubmitted
            ? currentIndex < questions.length - 1
              ? 'Next'
              : mode === 'simulator' ? 'Submit Exam' : 'Finish'
            : 'Submit'}
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {showHint && (
          <HintModal
            isOpen={showHint}
            onClose={() => setShowHint(false)}
            hint={currentQuestion?.eighty_twenty_hint || 'No hint available for this question.'}
            domainHint={
              currentQuestion?.domain && db?.metadata?.domain_8020
                ? db.metadata.domain_8020[currentQuestion.domain]
                : undefined
            }
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGrid && (
          <QuestionGridOverlay
            isOpen={showGrid}
            onClose={() => setShowGrid(false)}
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            onJump={goToQuestion}
            questions={questions}
            mode={mode}
            onReviewFlagged={goToNextFlagged}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEndConfirm && (
          <EndExamModal
            isOpen={showEndConfirm}
            onConfirm={() => { setShowEndConfirm(false); endQuiz(); }}
            onCancel={() => setShowEndConfirm(false)}
            mode={mode}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Quiz Setup Component ────────────────────────────────────────────

function QuizSetup({
  db,
  onStart,
  mode,
  setMode,
  questionCount,
  setQuestionCount,
  selectedDomains,
  setSelectedDomains,
  includePBQs,
  setIncludePBQs,
  cert,
  certName,
}: {
  db: ExamDB;
  onStart: () => void;
  mode: QuizMode;
  setMode: (m: QuizMode) => void;
  questionCount: number;
  setQuestionCount: (n: number) => void;
  selectedDomains: string[];
  setSelectedDomains: (d: string[]) => void;
  includePBQs: boolean;
  setIncludePBQs: (v: boolean) => void;
  cert: string;
  certName: string;
}) {
  const allDomains = db.metadata.domains.filter(
    (d) => d !== 'dynamic' && d !== 'System.Text.Encoding' && d !== '0'
  );

  const allQuestionCount = db.metadata.total_questions;
  const countOptions = [10, 25, 50, 90, allQuestionCount];
  const countLabels = ['10', '25', '50', '90', `All (${allQuestionCount})`];

  const toggleDomain = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] px-6 py-12">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeExpoOut }}
        className="max-w-[800px] mx-auto text-center mb-12"
      >
        <h1 className="text-h1 text-[#00ff41] mb-3 font-display">{certName} Quiz Lab</h1>
        <p className="text-body text-[#7da0c4]">
          Master the {db.metadata.total_questions} exam questions for {certName} with practice mode, timed exams, and 80/20 hints.
        </p>
      </motion.div>

      <div className="max-w-[800px] mx-auto">
        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Practice Mode Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0, duration: 0.5, ease: easeExpoOut }}
            onClick={() => setMode('practice')}
            className={`text-left p-6 rounded-[12px] border-2 transition-all duration-200 hover:scale-[1.02] ${
              mode === 'practice'
                ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)] shadow-[0_0_30px_rgba(0,255,65,0.1)]'
                : 'border-[#1a2d45] bg-[linear-gradient(145deg,#0d1526,#111d2e)] hover:border-[rgba(0,255,65,0.5)]'
            }`}
          >
            <BookOpen size={40} className="text-[#00ff41] mb-4" />
            <h2 className="text-h3 text-[#00ff41] mb-3 font-display">Practice Mode</h2>
            <ul className="space-y-2 mb-6">
              {['80/20 hints available', 'Immediate explanations', 'No time pressure', 'Flag questions for review', 'Audio narration available'].map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-2 text-caption text-[#7da0c4]"
                >
                  <Check size={12} className="text-[#00ff41] flex-shrink-0" />
                  {f}
                </motion.li>
              ))}
            </ul>
          </motion.button>

          {/* Exam Mode Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: easeExpoOut }}
            onClick={() => setMode('exam')}
            className={`text-left p-6 rounded-[12px] border-2 transition-all duration-200 hover:scale-[1.02] ${
              mode === 'exam'
                ? 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)] shadow-[0_0_30px_rgba(255,170,0,0.1)]'
                : 'border-[#1a2d45] bg-[linear-gradient(145deg,#0d1526,#111d2e)] hover:border-[rgba(255,170,0,0.5)]'
            }`}
          >
            <Timer size={40} className="text-[#ffaa00] mb-4" />
            <h2 className="text-h3 text-[#ffaa00] mb-3 font-display">Exam Mode</h2>
            <ul className="space-y-2 mb-6">
              {[
                { text: '165-minute timer', ok: true },
                { text: 'Up to 90 questions', ok: true },
                { text: 'No hints', ok: false },
                { text: 'Explanations at end only', ok: false },
                { text: 'Pass/fail scoring', ok: true },
              ].map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-2 text-caption text-[#7da0c4]"
                >
                  {f.ok ? (
                    <Check size={12} className="text-[#00ff41] flex-shrink-0" />
                  ) : (
                    <X size={12} className="text-[#ff3366] flex-shrink-0" />
                  )}
                  {f.text}
                </motion.li>
              ))}
            </ul>
          </motion.button>

          {/* Simulator Mode Card */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: easeExpoOut }}
            onClick={() => setMode('simulator')}
            className={`text-left p-6 rounded-[12px] border-2 transition-all duration-200 hover:scale-[1.02] ${
              mode === 'simulator'
                ? 'border-[#ff3366] bg-[rgba(255,51,102,0.05)] shadow-[0_0_30px_rgba(255,51,102,0.1)]'
                : 'border-[#1a2d45] bg-[linear-gradient(145deg,#0d1526,#111d2e)] hover:border-[rgba(255,51,102,0.5)]'
            }`}
          >
            <ClipboardList size={40} className="text-[#ff3366] mb-4" />
            <h2 className="text-h3 text-[#ff3366] mb-3 font-display">Simulator</h2>
            <ul className="space-y-2 mb-6">
              {[
                { text: '90-minute timer', ok: true },
                { text: '90 questions (CompTIA)', ok: true },
                { text: 'No hints', ok: false },
                { text: 'Flag for review', ok: true },
                { text: 'Detailed score report', ok: true },
                { text: '750/900 passing score', ok: true },
              ].map((f, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-2 text-caption text-[#7da0c4]"
                >
                  {f.ok ? (
                    <Check size={12} className="text-[#00ff41] flex-shrink-0" />
                  ) : (
                    <X size={12} className="text-[#ff3366] flex-shrink-0" />
                  )}
                  {f.text}
                </motion.li>
              ))}
            </ul>
          </motion.button>
        </div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: easeExpoOut }}
          className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-10"
        >
          <h3 className="text-h4 text-[#e0f2fe] mb-6 font-display">Custom Settings</h3>

          {/* Question Count - hidden in simulator mode */}
          {mode !== 'simulator' && (
            <div className="mb-6">
              <label className="text-sm text-[#7da0c4] mb-3 block">Number of Questions</label>
              <div className="flex gap-3 flex-wrap">
                {countOptions.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setQuestionCount(c)}
                    className={`px-4 py-2 rounded-[4px] border text-sm font-display transition-all ${
                      questionCount === c
                        ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                        : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#00d4ff]'
                    }`}
                  >
                    {countLabels[i]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Simulator Mode Info Banner */}
          {mode === 'simulator' && (
            <div className="mb-6 border border-[#ff3366] rounded-[8px] p-4 bg-[rgba(255,51,102,0.05)]">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardList size={16} className="text-[#ff3366]" />
                <span className="text-sm font-display font-bold text-[#ff3366] uppercase tracking-wider">
                  CompTIA Exam Simulator
                </span>
              </div>
              <p className="text-caption text-[#7da0c4]">
                This mode simulates real CompTIA exam conditions: 90 questions, 90 minutes, no hints, no explanations until the end. Passing score is 750/900 (83.3%). Flag questions to review them later.
              </p>
            </div>
          )}

          {/* Domain Filter */}
          <div className="mb-6">
            <label className="text-sm text-[#7da0c4] mb-3 block">Domains</label>
            <div className="flex gap-3 flex-wrap">
              {allDomains.map((d) => {
                const color = getDomainColor(d);
                const isSelected = selectedDomains.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDomain(d)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[4px] border text-sm transition-all ${
                      isSelected
                        ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#e0f2fe]'
                        : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#00d4ff]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {getDomainLabel(d)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Include PBQs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncludePBQs(!includePBQs)}
              className={`w-10 h-6 rounded-full transition-all relative ${
                includePBQs ? 'bg-[#00ff41]' : 'bg-[#1a2d45]'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  includePBQs ? 'left-5' : 'left-1'
                }`}
              />
            </button>
            <label className="text-sm text-[#7da0c4]">Include PBQ-style questions</label>
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={onStart}
            className="px-12 py-4 border border-[#00ff41] rounded-[4px] text-[#00ff41] text-lg font-display font-medium uppercase tracking-wider hover:bg-[#00ff41] hover:text-[#0a0e17] hover:shadow-[0_0_30px_rgba(0,255,65,0.3)] transition-all duration-200"
          >
            {mode === 'practice' ? 'Start Practice Session' : mode === 'exam' ? 'Start Exam Simulation' : 'Start CompTIA Exam Simulator'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Exam Results Component ──────────────────────────────────────────

function ExamResults({
  score,
  total,
  mode,
  domainBreakdown,
  onRetry,
}: {
  score: number;
  total: number;
  mode: QuizMode;
  domainBreakdown: Record<string, { correct: number; total: number }>;
  answers?: AnswerRecord[];
  questions?: ExamQuestion[];
  onRetry: () => void;
}) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 75;

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] px-6 py-12">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeExpoOut }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: easeBounce }}
          >
            {passed ? (
              <Trophy size={64} className="text-[#00ff41] mx-auto mb-4" />
            ) : (
              <Target size={64} className="text-[#ffaa00] mx-auto mb-4" />
            )}
          </motion.div>
          <h1 className="text-h1 text-[#e0f2fe] mb-2 font-display">
            {mode === 'exam' ? 'Exam Complete' : 'Session Complete'}
          </h1>
          <p className={`text-h2 font-display ${passed ? 'text-[#00ff41]' : 'text-[#ffaa00]'}`}>
            {passed ? 'You Passed!' : 'Keep Practicing!'}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: easeExpoOut }}
          className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-8"
        >
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <svg className="w-32 h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2d45" strokeWidth="8" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={passed ? '#00ff41' : '#ffaa00'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${percentage * 2.51} 251`}
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                  initial={{ strokeDasharray: '0 251' }}
                  animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
                  transition={{ delay: 0.5, duration: 1.5, ease: easeExpoOut }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-2xl text-[#e0f2fe]">{percentage}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-h3 text-[#00ff41] font-display">{score}</p>
              <p className="text-caption text-[#7da0c4]">Correct</p>
            </div>
            <div>
              <p className="text-h3 text-[#ff3366] font-display">{total - score}</p>
              <p className="text-caption text-[#7da0c4]">Incorrect</p>
            </div>
            <div>
              <p className="text-h3 text-[#e0f2fe] font-display">{total}</p>
              <p className="text-caption text-[#7da0c4]">Total</p>
            </div>
          </div>
        </motion.div>

        {/* Domain Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: easeExpoOut }}
          className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-8"
        >
          <h3 className="text-h4 text-[#e0f2fe] mb-6 font-display">Domain Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(domainBreakdown).map(([domain, stats], i) => {
              const color = getDomainColor(domain);
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, ease: easeExpoOut }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#e0f2fe] font-body">{getDomainLabel(domain)}</span>
                    <span className="text-sm font-display" style={{ color }}>
                      {stats.correct}/{stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 1, ease: easeExpoOut }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recommendations */}
        {mode === 'practice' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: easeExpoOut }}
            className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-8"
          >
            <h3 className="text-h4 text-[#e0f2fe] mb-4 font-display">Recommendations</h3>
            <ul className="space-y-2">
              {percentage < 50 && (
                <li className="flex items-center gap-2 text-body-sm text-[#7da0c4]">
                  <AlertTriangle size={14} className="text-[#ffaa00] flex-shrink-0" />
                  Focus on fundamentals. Review the 80/20 hints for each domain.
                </li>
              )}
              {percentage >= 50 && percentage < 75 && (
                <li className="flex items-center gap-2 text-body-sm text-[#7da0c4]">
                  <Target size={14} className="text-[#00d4ff] flex-shrink-0" />
                  You are close to passing. Focus on your weakest domains shown above.
                </li>
              )}
              {percentage >= 75 && (
                <li className="flex items-center gap-2 text-body-sm text-[#00ff41]">
                  <CheckCircle size={14} className="flex-shrink-0" />
                  Excellent work! Try an exam simulation to test under timed conditions.
                </li>
              )}
              <li className="flex items-center gap-2 text-body-sm text-[#7da0c4]">
                <RotateCcw size={14} className="text-[#00d4ff] flex-shrink-0" />
                  Review incorrect answers in the Quiz Lab with explanations enabled.
              </li>
            </ul>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-8 py-3 border border-[#00ff41] rounded-[4px] text-[#00ff41] font-display font-medium uppercase tracking-wider hover:bg-[#00ff41] hover:text-[#0a0e17] hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all"
          >
            <RotateCcw size={16} />
            New Session
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ── Simulator Score Report Component ────────────────────────────────

function SimulatorScoreReport({
  score,
  total,
  domainBreakdown,
  answers,
  questions,
  timeTaken,
  onRetry,
}: {
  score: number;
  total: number;
  domainBreakdown: Record<string, { correct: number; total: number }>;
  answers: AnswerRecord[];
  questions: ExamQuestion[];
  timeTaken: number;
  onRetry: () => void;
}) {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  const passed = percentage >= COMPTIA_PASSING_PCT;
  const scaledScore = Math.round(100 + (percentage / 100) * 800); // CompTIA scale: 100-900

  // Per-domain stats
  const domainStats = useMemo(() => {
    const stats: Record<string, { correct: number; total: number; questions: number[] }> = {};
    questions.forEach((q, i) => {
      if (!stats[q.domain]) {
        stats[q.domain] = { correct: 0, total: 0, questions: [] };
      }
      stats[q.domain].total++;
      stats[q.domain].questions.push(i);
      if (answers[i]?.isCorrect) {
        stats[q.domain].correct++;
      }
    });
    return stats;
  }, [questions, answers]);

  const hours = Math.floor(timeTaken / 3600);
  const minutes = Math.floor((timeTaken % 3600) / 60);
  const seconds = timeTaken % 60;

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] px-6 py-12">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeExpoOut }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: easeBounce }}
          >
            {passed ? (
              <Award size={72} className="text-[#00ff41] mx-auto mb-4" />
            ) : (
              <ClipboardList size={72} className="text-[#ffaa00] mx-auto mb-4" />
            )}
          </motion.div>
          <h1 className="text-h1 text-[#e0f2fe] mb-2 font-display">CompTIA Exam Complete</h1>
          <p className={`text-h2 font-display ${passed ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
            {passed ? 'Congratulations — You Passed!' : 'Did Not Pass'}
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: easeExpoOut }}
          className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-caption text-[#7da0c4] mb-1">Scaled Score</p>
              <p className={`text-h1 font-display ${passed ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                {scaledScore}
              </p>
              <p className="text-caption text-[#4a6682]">/ 900</p>
            </div>
            <div>
              <p className="text-caption text-[#7da0c4] mb-1">Raw Score</p>
              <p className="text-h1 text-[#e0f2fe] font-display">{percentage.toFixed(1)}%</p>
              <p className="text-caption text-[#4a6682]">{score}/{total}</p>
            </div>
            <div>
              <p className="text-caption text-[#7da0c4] mb-1">Passing Score</p>
              <p className="text-h1 text-[#ffaa00] font-display">750</p>
              <p className="text-caption text-[#4a6682]">/ 900 (83.3%)</p>
            </div>
            <div>
              <p className="text-caption text-[#7da0c4] mb-1">Time Taken</p>
              <p className="text-h1 text-[#e0f2fe] font-display">
                {hours > 0 ? `${hours}h ` : ''}{minutes}m {seconds.toString().padStart(2, '0')}s
              </p>
              <p className="text-caption text-[#4a6682]">/ 90 min</p>
            </div>
          </div>

          {/* Pass/Fail Indicator */}
          <div className="mt-6 flex items-center justify-center">
            <div className={`px-6 py-3 rounded-[8px] border-2 ${
              passed
                ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]'
                : 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]'
            }`}>
              <span className={`text-h4 font-display ${passed ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                {passed ? 'STATUS: PASSED' : 'STATUS: FAILED'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Domain Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: easeExpoOut }}
          className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-8"
        >
          <h3 className="text-h4 text-[#e0f2fe] mb-6 font-display">Domain Breakdown</h3>

          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 text-caption text-[#4a6682] font-display uppercase tracking-wider mb-3 px-4">
            <span className="col-span-4">Domain</span>
            <span className="col-span-2 text-center">Correct</span>
            <span className="col-span-2 text-center">Score</span>
            <span className="col-span-3">Performance</span>
            <span className="col-span-1 text-center">Status</span>
          </div>

          <div className="space-y-3">
            {Object.entries(domainStats).map(([domain, stats], i) => {
              const color = getDomainColor(domain);
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              const domainPassed = pct >= COMPTIA_PASSING_PCT;

              return (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, ease: easeExpoOut }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center bg-[rgba(13,21,38,0.5)] rounded-[8px] p-4"
                >
                  {/* Domain Name */}
                  <div className="col-span-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-[#e0f2fe] font-body">{getDomainLabel(domain)}</span>
                  </div>

                  {/* Correct/Total */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-display text-[#e0f2fe]">
                      {stats.correct}/{stats.total}
                    </span>
                  </div>

                  {/* Percentage */}
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-display" style={{ color }}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="col-span-3">
                    <div className="h-2.5 bg-[#1a2d45] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 1, ease: easeExpoOut }}
                      />
                    </div>
                  </div>

                  {/* Pass/Fail */}
                  <div className="col-span-1 text-center">
                    <span className={`text-xs font-display font-bold uppercase ${
                      domainPassed ? 'text-[#00ff41]' : 'text-[#ff3366]'
                    }`}>
                      {domainPassed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: easeExpoOut }}
          className="bg-[linear-gradient(145deg,#0d1526,#111d2e)] border border-[#1a2d45] rounded-[12px] p-8 mb-8"
        >
          <h3 className="text-h4 text-[#e0f2fe] mb-4 font-display">Exam Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[rgba(13,21,38,0.5)] rounded-[8px]">
              <p className="text-h3 text-[#00ff41] font-display">{score}</p>
              <p className="text-caption text-[#7da0c4]">Correct</p>
            </div>
            <div className="text-center p-4 bg-[rgba(13,21,38,0.5)] rounded-[8px]">
              <p className="text-h3 text-[#ff3366] font-display">{total - score}</p>
              <p className="text-caption text-[#7da0c4]">Incorrect</p>
            </div>
            <div className="text-center p-4 bg-[rgba(13,21,38,0.5)] rounded-[8px]">
              <p className="text-h3 text-[#e0f2fe] font-display">
                {answers.filter((a) => a?.flagged).length}
              </p>
              <p className="text-caption text-[#7da0c4]">Flagged</p>
            </div>
            <div className="text-center p-4 bg-[rgba(13,21,38,0.5)] rounded-[8px]">
              <p className="text-h3 text-[#e0f2fe] font-display">
                {total - answers.filter((a) => a?.selectedAnswer).length}
              </p>
              <p className="text-caption text-[#7da0c4]">Unanswered</p>
            </div>
          </div>
          {total - answers.filter((a) => a?.selectedAnswer).length > 0 && (
            <p className="mt-4 text-body-sm text-[#ffaa00] flex items-center gap-2">
              <AlertTriangle size={14} />
              You left {total - answers.filter((a) => a?.selectedAnswer).length} question{total - answers.filter((a) => a?.selectedAnswer).length > 1 ? 's' : ''} unanswered. Unanswered questions count as incorrect.
            </p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-8 py-3 border border-[#00ff41] rounded-[4px] text-[#00ff41] font-display font-medium uppercase tracking-wider hover:bg-[#00ff41] hover:text-[#0a0e17] hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all"
          >
            <RotateCcw size={16} />
            Retake Exam
          </button>
        </motion.div>
      </div>
    </div>
  );
}
