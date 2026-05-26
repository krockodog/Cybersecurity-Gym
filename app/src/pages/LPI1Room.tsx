import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  Zap,
  Flame,
  ChevronDown,
  ChevronUp,
  Play,
  Award,
  Target,
  Keyboard,
  Star,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { useTTS } from '../hooks/useTTS';

/* ────────────────────── DATA TYPES ────────────────────── */

interface Question {
  id: number;
  domain: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  hint8020: string;
}

interface QuizData {
  version: string;
  exam: string;
  domains: { id: string; title: string; weight: string }[];
  questions: Question[];
}

interface DomainInfo {
  id: string;
  title: string;
  color: string;
  questionCount: number;
  hints: string[];
  mastery: number;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

/* ────────────────────── DOMAIN DATA ────────────────────── */

const DOMAINS: DomainInfo[] = [
  {
    id: '101',
    title: 'Systemarchitektur',
    color: '#ff3366',
    questionCount: 8,
    hints: ['lspci/lsusb/lscpu → Hardware-Info', '/proc & /sys → Kernel-Interfaces', 'Runlevels 0-6 + systemd targets', 'shutdown/reboot/halt → System anhalten'],
    mastery: 0,
  },
  {
    id: '102',
    title: 'Linux-Installation',
    color: '#ffaa00',
    questionCount: 8,
    hints: ['fdisk/gdisk/parted → Partitionierung', 'LVM: pvcreate→vgcreate→lvcreate', 'mkfs.ext4/mount/fstab', 'apt/yum/rpm/dpkg → Paketverwaltung'],
    mastery: 0,
  },
  {
    id: '103',
    title: 'GNU-Unix-Befehle',
    color: '#00ff41',
    questionCount: 16,
    hints: ['ls/cd/pwd/cp/mv/rm/find', 'grep/sed/awk/cut/sort/uniq', 'tar/gzip/zip → Archivierung', 'ps/top/kill → Prozesse', 'chmod/chown/umask → Rechte'],
    mastery: 0,
  },
  {
    id: '104',
    title: 'Dateisysteme',
    color: '#00d4ff',
    questionCount: 8,
    hints: ['FHS: /etc/var/usr/home/tmp/opt', 'fsck/df/du/mount', 'ext4/XFS/Btrfs → Journaling-FS'],
    mastery: 0,
  },
  {
    id: '105',
    title: 'Shells & Skripte',
    color: '#a855f7',
    questionCount: 8,
    hints: ['#!/bin/bash Shebang', 'if/for/while/case', '$?$#@ → Parameter', 'export/source/alias'],
    mastery: 0,
  },
  {
    id: '106',
    title: 'Benutzerverwaltung',
    color: '#ff7b00',
    questionCount: 8,
    hints: ['useradd/usermod/userdel', '/etc/passwd/shadow/group', 'passwd/chage', 'sudo/su'],
    mastery: 0,
  },
  {
    id: '107',
    title: 'Systemadministration',
    color: '#10b981',
    questionCount: 8,
    hints: ['systemctl/journalctl/cron/at', 'ip/ss/ping/traceroute', 'date/timedatectl', 'mail/apache/nginx'],
    mastery: 0,
  },
];

/* ────────────────────── TERMINAL COMMANDS ────────────────────── */

const TERMINAL_RESPONSES: Record<string, string> = {
  ls: 'Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos',
  pwd: '/home/benny',
  whoami: 'benny',
  date: new Date().toLocaleString('de-DE'),
  'uname -a': 'Linux lpi1-study 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux',
  'cat /etc/os-release': 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nPRETTY_NAME="Ubuntu 22.04.3 LTS"',
  'df -h': 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  38% /\ntmpfs           2.0G  180M  1.8G  10% /run',
  'free -h': '              total        used        free\nMem:           7.7Gi       2.1Gi       4.2Gi\nSwap:          2.0Gi       0.0Ki       2.0Gi',
  'ps aux': 'USER       PID %CPU %MEM COMMAND\nroot         1  0.0  0.1 systemd\nbenny     1234  0.2  1.5 bash\nbenny     5678  0.1  2.3 vim lernen.txt',
  top: '[Mock] Top - sorted by CPU. Press q to quit.',
  'echo': '',
  'echo hello': 'hello',
  'echo $SHELL': '/bin/bash',
  'echo $HOME': '/home/benny',
  'echo $PATH': '/usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games',
  clear: '__CLEAR__',
  help: 'Verfuegbare Befehle:\n  ls, pwd, whoami, date, uname -a\n  cat /etc/os-release, df -h, free -h\n  ps aux, top, echo, clear, help',
  'ls -la': 'total 128\ndrwxr-xr-x 18 benny benny 4096 Jan 15 09:23 .\ndrwxr-xr-x  3 root  root  4096 Jan 10 14:00 ..\n-rw-r--r--  1 benny benny  220 Jan 10 14:01 .bash_logout\n-rw-r--r--  1 benny benny 3771 Jan 10 14:01 .bashrc',
  'ls -lh': 'total 64K\ndrwxr-xr-x 2 benny benny 4.0K Jan 15 10:00 Desktop\ndrwxr-xr-x 2 benny benny 4.0K Jan 14 16:30 Documents',
  cd: '',
  'cd ..': '',
  'cd ~': '',
  'cd /': '',
};

/* ────────────────────── LOCALSTORAGE HELPERS ────────────────────── */

function getStorageNum(key: string, fallback: number): number {
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : fallback;
}

function setStorage(key: string, value: number): void {
  localStorage.setItem(key, String(value));
}

/* ────────────────────── STAGGER VARIANTS ────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ═══════════════════════ SPEAKER BUTTON ═══════════════════════ */

function SpeakerButton({ text, label }: { text: string; label?: string }) {
  const { speaking, speak, stop } = useTTS();
  const isSpeaking = speaking && label ? true : speaking;
  return (
    <button
      onClick={() => speaking ? stop() : speak(text)}
      className="p-2 rounded-lg border border-[#1a2d45] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all text-[#7da0c4]"
      title={speaking ? "Stop" : "Read aloud"}
    >
      {speaking ? <VolumeX size={18} className="animate-pulse text-[#ff3366]" /> : <Volume2 size={18} />}
    </button>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function LPI1Room() {
  const { speaking, speak, stop } = useTTS();
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [mastery, setMastery] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [showHint, setShowHint] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [domainQuestions, setDomainQuestions] = useState<Question[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const historyIdxRef = useRef(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── load quiz data ── */
  useEffect(() => {
    fetch('/lpi1_database.json')
      .then((r) => r.json())
      .then((d: QuizData) => setQuizData(d))
      .catch(() => null);
  }, []);

  /* ── load progress ── */
  useEffect(() => {
    setMastery(getStorageNum('lpi1_mastery', 0));
    setAnswered(getStorageNum('lpi1_answered', 0));
    setStreak(getStorageNum('lpi1_streak', 0));
    // Init terminal
    setTerminalLines([{ type: 'output', text: 'Willkommen im LPI 1 Terminal! Tippe "help" fuer Befehle.' }]);
  }, []);

  /* ── save progress ── */
  useEffect(() => {
    setStorage('lpi1_mastery', mastery);
    setStorage('lpi1_answered', answered);
    setStorage('lpi1_streak', streak);
  }, [mastery, answered, streak]);

  /* ── start quiz for a domain ── */
  const startQuiz = useCallback(
    (domainId: string) => {
      if (!quizData) return;
      const questions = quizData.questions.filter((q) => q.domain === domainId);
      if (questions.length === 0) {
        // fallback: use all questions if none match
        setDomainQuestions(quizData.questions.slice(0, 8));
      } else {
        setDomainQuestions(questions);
      }
      setActiveDomain(domainId);
      setCurrentQ(0);
      setSelectedOption(null);
      setShowResult(false);
      setCorrectCount(0);
      setQuizStarted(true);
      setQuizFinished(false);
      setShowHint(false);
    },
    [quizData]
  );

  /* ── submit answer ── */
  const submitAnswer = useCallback(() => {
    if (selectedOption === null) return;
    const q = domainQuestions[currentQ];
    const correct = selectedOption === q.answer;
    if (correct) {
      setCorrectCount((c) => c + 1);
      setMastery((m) => Math.min(100, m + 2));
    }
    setAnswered((a) => a + 1);
    setStreak((s) => (correct ? s + 1 : 0));
    setShowResult(true);
  }, [selectedOption, domainQuestions, currentQ]);

  /* ── next question ── */
  const nextQuestion = useCallback(() => {
    if (currentQ + 1 >= domainQuestions.length) {
      setQuizFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelectedOption(null);
      setShowResult(false);
      setShowHint(false);
    }
  }, [currentQ, domainQuestions.length]);

  /* ── reset quiz ── */
  const resetQuiz = useCallback(() => {
    setQuizStarted(false);
    setActiveDomain(null);
    setCurrentQ(0);
    setSelectedOption(null);
    setShowResult(false);
    setCorrectCount(0);
    setQuizFinished(false);
    setShowHint(false);
  }, []);

  /* ── terminal handlers ── */
  const handleTerminalSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cmd = terminalInput.trim();
      if (!cmd) return;

      const newLines: TerminalLine[] = [{ type: 'input', text: `benny@lpi1:~$ ${cmd}` }];

      if (cmd === 'clear' || cmd === 'cls') {
        setTerminalLines([]);
        setTerminalInput('');
        setHistory((h) => [...h, cmd]);
        historyIdxRef.current = -1;
        return;
      }

      // Check exact match first, then prefix match for echo
      let response = TERMINAL_RESPONSES[cmd];
      if (response === undefined && cmd.startsWith('echo ')) {
        response = cmd.slice(5);
      }
      if (response === undefined && cmd.startsWith('cd ')) {
        response = '';
      }
      if (response === undefined) {
        response = `bash: ${cmd.split(' ')[0]}: Kommando nicht gefunden. Tippe "help".`;
        newLines.push({ type: 'error', text: response });
      } else {
        if (response) newLines.push({ type: 'output', text: response });
      }

      setTerminalLines((prev) => [...prev, ...newLines]);
      setTerminalInput('');
      setHistory((h) => [...h, cmd]);
      historyIdxRef.current = -1;

      requestAnimationFrame(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    },
    [terminalInput]
  );

  /* ── terminal keyboard ── */
  const handleTerminalKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIdx = historyIdxRef.current === -1 ? history.length - 1 : Math.max(0, historyIdxRef.current - 1);
        historyIdxRef.current = newIdx;
        setTerminalInput(history[newIdx] || '');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIdx = historyIdxRef.current === -1 ? -1 : Math.min(history.length - 1, historyIdxRef.current + 1);
        if (newIdx === -1 || newIdx >= history.length - 1) {
          historyIdxRef.current = -1;
          setTerminalInput('');
        } else {
          historyIdxRef.current = newIdx + 1;
          setTerminalInput(history[newIdx + 1] || '');
        }
      }
    },
    [history]
  );

  /* ── typing animation for benny's welcome ── */
  const welcomeText = "Moin! Ich bin Benny — dein Linux-Dozent. Willkommen im Terminal! \ud83d\udc27";
  const [typedText, setTypedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= welcomeText.length) {
        setTypedText(welcomeText.slice(0, i));
        i++;
      } else {
        setTypingDone(true);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  /* ── get active domain info ── */
  const activeDomainInfo = DOMAINS.find((d) => d.id === activeDomain);

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] text-[#e0f2fe]">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden px-6 pt-10 pb-8">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #ff9500 0px, transparent 1px, transparent 2px, #ff9500 3px), repeating-linear-gradient(90deg, #ff9500 0px, transparent 1px, transparent 2px, #ff9500 3px)',
          backgroundSize: '50px 50px',
        }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Benny Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex-shrink-0"
            >
              <div className="w-[120px] h-[120px] rounded-full border-[3px] border-[#ff9500] shadow-[0_0_30px_rgba(255,149,0,0.4)] overflow-hidden">
                <img src="/benny_avatar.png" alt="Benny" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            {/* Title + Speech Bubble */}
            <div className="flex-1 min-w-[280px]">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl md:text-4xl font-bold mb-3"
                style={{ textShadow: '0 0 20px rgba(255,149,0,0.5)' }}
              >
                <span style={{ color: '#ff9500' }}>LPI 1</span>
                <span className="text-[#e0f2fe]"> — Linux Professional Institute</span>
              </motion.h1>

              {/* Speech Bubble */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-[#162236] border border-[#1a2d45] rounded-xl px-5 py-4 max-w-xl"
              >
                <div className="font-terminal text-sm text-[#00ff41] leading-relaxed">
                  {typedText}
                  {!typingDone && <span className="animate-cursor-blink">_</span>}
                </div>
                <button
                  className="absolute top-3 right-3 p-2 rounded-lg border border-[#1a2d45] hover:border-[#00d4ff] hover:text-[#00d4ff] transition-all text-[#7da0c4]"
                  title={speaking ? "Stop" : "Read aloud"}
                  onClick={() => speaking ? stop() : speak(welcomeText)}
                >
                  {speaking ? <VolumeX size={16} className="animate-pulse text-[#00ff41]" /> : <Volume2 size={16} />}
                </button>
              </motion.div>
            </div>

            {/* Stat Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3 flex-shrink-0"
            >
              <StatCard icon={<CheckCircle size={18} />} label="Beantwortet" value={String(answered)} color="#00d4ff" />
              <StatCard icon={<Target size={18} />} label="Mastery" value={`${mastery}%`} color="#ff9500" />
              <StatCard icon={<Flame size={18} />} label="Streak" value={`${streak} Tage`} color="#ff3366" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BENNY TEACHER CARD ── */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden"
            style={{ borderLeftWidth: 4, borderLeftColor: '#ff9500' }}
          >
            <div className="p-6 flex gap-5 flex-wrap items-start">
              <div className="w-16 h-16 rounded-full border-2 border-[#ff9500] overflow-hidden flex-shrink-0 shadow-[0_0_15px_rgba(255,149,0,0.3)]">
                <img src="/benny_avatar.png" alt="Benny" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-[250px]">
                <h3 className="font-display font-bold text-lg text-[#ff9500]">
                  Benny &quot;Robbenklopper&quot;
                </h3>
                <p className="text-xs text-[#7da0c4] font-body mb-2">
                  Dein Linux-Mentor | LPI Certified | Terminal-Freak
                </p>
                <p className="text-sm text-[#e0f2fe] font-body leading-relaxed mb-3">
                  Moin! Ich bin Benny — dein Linux-Dozent. Seit 10 Jahren lebe ich in der Shell. Egal ob du ein Noob bist oder schon <code className="text-[#ff3366] bg-[#162236] px-1 rounded">rm -rf /</code> probiert hast — ich bring dich zum LPI 1 durch!
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {['Shell Scripting', 'Systemadministration', 'Troubleshooting', 'Vim-Ninja'].map((s) => (
                    <span key={s} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#162236] text-[#ff9500] border border-[#ff9500]/30">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-terminal italic text-[#00ff41]">
                  &ldquo;In der Shell gibt es keine GUI — nur du und die Macht!&rdquo;
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DOMAIN CARDS GRID ── */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} className="text-[#ff9500]" />
            <h2 className="font-display text-xl font-bold text-[#e0f2fe]">Lern-Domains (101–107)</h2>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {DOMAINS.map((domain) => (
              <motion.div
                key={domain.id}
                variants={cardVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5 relative overflow-hidden group cursor-pointer"
                style={{ borderLeftWidth: 3, borderLeftColor: domain.color }}
                onClick={() => startQuiz(domain.id)}
              >
                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `inset 0 0 30px ${domain.color}15` }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${domain.color}15` }}
                      >
                        <Terminal size={18} style={{ color: domain.color }} />
                      </div>
                      <div>
                        <span className="font-display font-bold text-lg" style={{ color: domain.color }}>
                          {domain.id}
                        </span>
                        <h3 className="font-body font-semibold text-sm text-[#e0f2fe]">{domain.title}</h3>
                      </div>
                    </div>
                    <span className="text-caption text-[#4a6682]">{domain.questionCount} Fragen</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7da0c4]">Mastery</span>
                      <span style={{ color: domain.color }}>{Math.min(100, mastery)}%</span>
                    </div>
                    <div className="h-2 bg-[#162236] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, mastery)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: domain.color }}
                      />
                    </div>
                  </div>

                  {/* 80/20 Hints preview */}
                  <div className="mb-3 space-y-0.5">
                    {domain.hints.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[#7da0c4]">
                        <Zap size={10} className="mt-0.5 flex-shrink-0 text-[#ffaa00]" />
                        <span>{h}</span>
                      </div>
                    ))}
                    {domain.hints.length > 2 && (
                      <span className="text-[10px] text-[#4a6682] ml-4">+{domain.hints.length - 2} mehr</span>
                    )}
                  </div>

                  <button
                    className="w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110"
                    style={{ backgroundColor: `${domain.color}20`, color: domain.color, border: `1px solid ${domain.color}40` }}
                  >
                    <Play size={14} /> Start Lesson
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── MODE TOGGLE ── */}
      <section className="px-6 pb-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-sm text-[#7da0c4] font-body">Modus:</span>
          <div className="flex bg-[#162236] rounded-lg p-0.5">
            <button
              onClick={() => setMode('practice')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'practice' ? 'bg-[#ff9500] text-[#0a0e17]' : 'text-[#7da0c4] hover:text-[#e0f2fe]'}`}
            >
              Practice
            </button>
            <button
              onClick={() => setMode('exam')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'exam' ? 'bg-[#ff3366] text-[#0a0e17]' : 'text-[#7da0c4] hover:text-[#e0f2fe]'}`}
            >
              Exam
            </button>
          </div>
        </div>
      </section>

      {/* ── QUIZ INTERFACE ── */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          {!quizStarted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-[#0d1526] border border-[#1a2d45] rounded-xl"
            >
              <Terminal size={48} className="text-[#ff9500] mx-auto mb-4 opacity-60" />
              <h3 className="font-display text-lg text-[#e0f2fe] mb-2">Waehle eine Domain zum Ueben</h3>
              <p className="text-sm text-[#7da0c4] mb-6">Klicke auf eine Domain-Karte oben oder starte hier ein {mode === 'exam' ? 'Exam' : 'Practice'}-Quiz.</p>
              <button
                onClick={() => startQuiz('103')}
                className="px-6 py-3 rounded-lg bg-[#ff9500] text-[#0a0e17] font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
              >
                <Play size={16} /> Mit Domain 103 starten
              </button>
            </motion.div>
          ) : quizFinished ? (
            <QuizResults
              correct={correctCount}
              total={domainQuestions.length}
              onRetry={resetQuiz}
              domain={activeDomainInfo}
            />
          ) : (
            <QuizCard
              question={domainQuestions[currentQ]}
              currentQ={currentQ}
              totalQ={domainQuestions.length}
              selectedOption={selectedOption}
              showResult={showResult}
              showHint={showHint}
              mode={mode}
              domainColor={activeDomainInfo?.color || '#ff9500'}
              onSelect={setSelectedOption}
              onSubmit={submitAnswer}
              onNext={nextQuestion}
              onToggleHint={() => setShowHint((h) => !h)}
              onNavigate={setCurrentQ}
            />
          )}
        </div>
      </section>

      {/* ── INTERACTIVE TERMINAL ── */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setShowTerminal((s) => !s)}
            className="flex items-center gap-2 text-sm text-[#7da0c4] hover:text-[#00ff41] transition-colors mb-3"
          >
            <Keyboard size={16} />
            Interaktives Terminal
            {showTerminal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {showTerminal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-[#0d1117] border border-[#1a2d45] rounded-xl overflow-hidden">
                  {/* Terminal header */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#1a2d45]">
                    <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffaa00]" />
                    <div className="w-3 h-3 rounded-full bg-[#00ff41]" />
                    <span className="text-xs text-[#4a6682] ml-2 font-terminal">benny@lpi1: ~</span>
                  </div>

                  {/* Terminal output */}
                  <div className="p-4 h-64 overflow-y-auto font-terminal text-xs">
                    {terminalLines.map((line, i) => (
                      <div key={i}>
                        {line.type === 'input' ? (
                          <span className="text-[#ff9500]">{line.text}</span>
                        ) : line.type === 'error' ? (
                          <span className="text-[#ff3366]">{line.text}</span>
                        ) : (
                          <pre className="text-[#00ff41] whitespace-pre-wrap">{line.text}</pre>
                        )}
                      </div>
                    ))}
                    <div ref={terminalEndRef} />
                  </div>

                  {/* Terminal input */}
                  <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-t border-[#1a2d45]">
                    <span className="text-[#ff9500] font-terminal text-xs flex-shrink-0">benny@lpi1:~$</span>
                    <input
                      ref={inputRef}
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      onKeyDown={handleTerminalKeyDown}
                      className="flex-1 bg-transparent text-[#00ff41] font-terminal text-xs outline-none placeholder:text-[#4a6682]"
                      placeholder="Befehl eingeben..."
                      autoFocus
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ═════════════════════ SUB-COMPONENTS ═════════════════════ */

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg px-4 py-2.5 flex items-center gap-3 min-w-[140px]">
      <span style={{ color }}>{icon}</span>
      <div>
        <div className="font-display font-bold text-sm text-[#e0f2fe]">{value}</div>
        <div className="text-[10px] text-[#4a6682] font-body">{label}</div>
      </div>
    </div>
  );
}

function QuizCard({
  question,
  currentQ,
  totalQ,
  selectedOption,
  showResult,
  showHint,
  domainColor,
  onSelect,
  onSubmit,
  onNext,
  onToggleHint,
  onNavigate,
}: {
  question: Question;
  currentQ: number;
  totalQ: number;
  selectedOption: number | null;
  showResult: boolean;
  showHint: boolean;
  mode: 'practice' | 'exam';
  domainColor: string;
  onSelect: (i: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  onToggleHint: () => void;
  onNavigate: (i: number) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      key={question.id}
      className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden"
      style={{ borderTopWidth: 3, borderTopColor: domainColor }}
    >
      {/* Quiz header */}
      <div className="px-5 py-3 bg-[#111d2e] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-terminal text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${domainColor}20`, color: domainColor }}>
            {question.domain}
          </span>
          <span className="text-xs text-[#7da0c4]">
            Frage {currentQ + 1} / {totalQ}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalQ }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: i === currentQ ? domainColor : i < currentQ ? '#10b981' : '#1a2d45',
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <p className="font-body text-[#e0f2fe] leading-relaxed flex-1">{question.question}</p>
          <SpeakerButton text={question.question} label={`Question ${currentQ + 1}`} />
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let borderColor = '#1a2d45';
            let bgColor = 'transparent';
            if (showResult) {
              if (i === question.answer) {
                borderColor = '#00ff41';
                bgColor = '#00ff4110';
              } else if (i === selectedOption && i !== question.answer) {
                borderColor = '#ff3366';
                bgColor = '#ff336610';
              }
            } else if (i === selectedOption) {
              borderColor = domainColor;
              bgColor = `${domainColor}10`;
            }

            return (
              <button
                key={i}
                onClick={() => !showResult && onSelect(i)}
                disabled={showResult}
                className="w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center gap-3"
                style={{ borderColor, backgroundColor: bgColor }}
              >
                <span
                  className="w-7 h-7 rounded-md flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                  style={{
                    backgroundColor: showResult
                      ? i === question.answer
                        ? '#00ff4120'
                        : i === selectedOption
                          ? '#ff336620'
                          : '#162236'
                      : i === selectedOption
                        ? `${domainColor}20`
                        : '#162236',
                    color: showResult
                      ? i === question.answer
                        ? '#00ff41'
                        : i === selectedOption
                          ? '#ff3366'
                          : '#7da0c4'
                      : i === selectedOption
                        ? domainColor
                        : '#7da0c4',
                  }}
                >
                  {letter}
                </span>
                <span className="text-sm text-[#e0f2fe]">{opt}</span>
                {showResult && i === question.answer && <CheckCircle size={16} className="text-[#00ff41] ml-auto flex-shrink-0" />}
                {showResult && i === selectedOption && i !== question.answer && <XCircle size={16} className="text-[#ff3366] ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Hint section */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#162236] border border-[#ffaa00]/30 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star size={12} className="text-[#ffaa0s0]" />
                  <span className="text-xs font-bold text-[#ffaa00]">80/20 Hint</span>
                </div>
                <p className="text-xs text-[#7da0c4]">{question.hint8020 || question.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {!showResult ? (
            <>
              <button
                onClick={onToggleHint}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-[#ffaa00]/30 text-[#ffaa00] hover:bg-[#ffaa0s0]/10 transition-all flex items-center gap-1.5"
              >
                <HelpCircle size={12} /> {showHint ? 'Hint aus' : '80/20 Hint'}
              </button>
              <button
                onClick={onSubmit}
                disabled={selectedOption === null}
                className="px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: domainColor, color: '#0a0e17' }}
              >
                Absenden
              </button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-xs text-[#7da0c4]">
                  {selectedOption === question.answer ? (
                    <span className="text-[#00ff41] font-medium flex items-center gap-1">
                      <CheckCircle size={12} /> Richtig!
                    </span>
                  ) : (
                    <span className="text-[#ff3366] font-medium flex items-center gap-1">
                      <XCircle size={12} /> Falsch. Richtige Antwort: {String.fromCharCode(65 + question.answer)}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-[#7da0c4] italic flex-1">{question.explanation}</p>
                  <SpeakerButton text={question.explanation} label="Explanation" />
                </div>
              </div>
              <button
                onClick={onNext}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-[#00ff41] text-[#0a0e17] hover:brightness-110 transition-all flex items-center gap-2"
              >
                Weiter <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Question navigation grid */}
      <div className="px-5 py-3 bg-[#111d2e] border-t border-[#1a2d45] flex flex-wrap gap-1">
        {Array.from({ length: totalQ }).map((_, i) => (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className="w-7 h-7 rounded-md font-display text-xs flex items-center justify-center transition-all"
            style={{
              backgroundColor: i === currentQ ? `${domainColor}30` : '#162236',
              color: i === currentQ ? domainColor : '#7da0c4',
              border: i === currentQ ? `1px solid ${domainColor}` : '1px solid transparent',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function QuizResults({
  correct,
  total,
  onRetry,
  domain,
}: {
  correct: number;
  total: number;
  onRetry: () => void;
  domain?: DomainInfo;
}) {
  const percentage = Math.round((correct / total) * 100);
  const passed = percentage >= 80;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
      >
        {passed ? <Trophy size={56} className="text-[#ffaa00] mx-auto mb-4" /> : <Award size={56} className="text-[#00d4ff] mx-auto mb-4" />}
      </motion.div>

      <h3 className="font-display text-2xl font-bold text-[#e0f2fe] mb-2">
        {passed ? 'Domain abgeschlossen!' : 'Uebung beendet'}
      </h3>

      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="font-display text-4xl font-bold" style={{ color: passed ? '#00ff41' : '#ffaa00' }}>
          {correct}/{total}
        </span>
        <span className="text-lg text-[#7da0c4]">({percentage}%)</span>
      </div>

      <div className="h-3 bg-[#162236] rounded-full max-w-xs mx-auto mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.3 }}
          className="h-full rounded-full"
          style={{ backgroundColor: passed ? '#00ff41' : '#ffaa00' }}
        />
      </div>

      {passed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-[#00ff41] mb-4"
        >
          Super! Du bist bereit fuer die naechste Domain!
        </motion.p>      )}

      <button
        onClick={onRetry}
        className="px-6 py-3 bg-[#162236] hover:bg-[#1a2d45] border border-[#00d4ff]/30 rounded-lg transition-colors inline-flex items-center gap-2 text-[#00d4ff]"
      >
        <RotateCcw size={18} />
        Neu starten
      </button>
    </motion.div>
  );
}
