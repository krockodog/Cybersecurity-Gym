import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Server,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  Zap,
  Target,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Award,
  Star,
  ShieldCheck,
  Unlock,
  ChevronLeft,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  weight: string;
  questionCount: number;
  hints: string[];
}

/* ────────────────────── DOMAIN DATA ────────────────────── */

const DOMAINS: DomainInfo[] = [
  {
    id: '1',
    title: 'System Management',
    color: '#00d4ff',
    weight: '23%',
    questionCount: 12,
    hints: ['LVM/RAID/Storage', 'Kernel modules & params', 'Networking config (ip, nmcli)', 'Boot process & GRUB'],
  },
  {
    id: '2',
    title: 'Security',
    color: '#ff3366',
    weight: '18%',
    questionCount: 10,
    hints: ['SELinux/AppArmor', 'Firewall (nftables/ufw)', 'SSH hardening', 'Encryption (LUKS/GPG)'],
  },
  {
    id: '3',
    title: 'Services & Users',
    color: '#10b981',
    weight: '20%',
    questionCount: 10,
    hints: ['systemd units', 'LDAP/SSSD auth', 'Mail services (Postfix)', 'Web (Apache/Nginx)'],
  },
  {
    id: '4',
    title: 'Automation & Scripting',
    color: '#a855f7',
    weight: '17%',
    questionCount: 8,
    hints: ['Bash/Perl/Python', 'Cron/systemd timers', 'CI/CD basics', 'Infrastructure as Code'],
  },
  {
    id: '5',
    title: 'Troubleshooting',
    color: '#ffaa00',
    weight: '22%',
    questionCount: 10,
    hints: ['Network diag (ss, nmap)', 'Performance (sar, iostat)', 'Log analysis (journalctl)', 'Boot rescue mode'],
  },
];

/* ────────────────────── LOCALSTORAGE HELPERS ────────────────────── */

function getStorageNum(key: string, fallback: number): number {
  const v = localStorage.getItem(key);
  return v ? parseInt(v, 10) : fallback;
}

/* ────────────────────── CONFETTI PARTICLE ────────────────────── */

function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#00d4ff', '#ff3366', '#10b981', '#ffaa00', '#a855f7', '#00ff41'];
  const color = colors[index % colors.length];
  const left = `${(index * 7.3) % 100}%`;
  const delay = (index * 0.1) % 2;
  const duration = 1.5 + (index % 3) * 0.5;

  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 1, scale: 1 }}
      animate={{
        y: [0, 200 + (index % 5) * 50],
        x: [0, Math.sin(index) * 100, -Math.sin(index) * 50],
        opacity: [1, 1, 0],
        scale: [1, 1, 0.5],
        rotate: [0, 360 * (index % 2 === 0 ? 1 : -1)],
      }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className="absolute w-3 h-3 rounded-sm pointer-events-none"
      style={{ left, top: '10%', backgroundColor: color }}
    />
  );
}

/* ────────────────────── STAGGER VARIANTS ────────────────────── */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
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

export default function LinuxPlusRoom() {
  const { speaking, speak, stop } = useTTS();
  const navigate = useNavigate();
  const [lpi1Mastery, setLpi1Mastery] = useState(0);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  /* Quiz state */
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [domainQuestions, setDomainQuestions] = useState<Question[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  /* Stats */
  const [answered, setAnswered] = useState(0);
  const [mastery, setMastery] = useState(0);
  const [streak, setStreak] = useState(0);

  /* ── load data ── */
  useEffect(() => {
    const lpiM = getStorageNum('lpi1_mastery', 0);
    setLpi1Mastery(lpiM);
    const isUnlocked = lpiM >= 80;
    setUnlocked(isUnlocked);

    if (isUnlocked) {
      const hasSeenCelebration = localStorage.getItem('xk006_celebration_seen');
      if (!hasSeenCelebration) {
        setShowCelebration(true);
        localStorage.setItem('xk006_celebration_seen', '1');
        setTimeout(() => setShowCelebration(false), 4000);
      }
    }

    setAnswered(getStorageNum('xk006_answered', 0));
    setMastery(getStorageNum('xk006_mastery', 0));
    setStreak(getStorageNum('xk006_streak', 0));

    fetch('/xk006_database.json')
      .then((r) => r.json())
      .then((d: QuizData) => setQuizData(d))
      .catch(() => null);
  }, []);

  /* ── start quiz ── */
  const startQuiz = useCallback(
    (domainId: string) => {
      if (!quizData) return;
      const questions = quizData.questions.filter((q) => q.domain === domainId);
      if (questions.length === 0) {
        setDomainQuestions(quizData.questions.slice(0, 10));
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
      setMastery((m) => Math.min(100, m + 3));
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

  /* ── save progress ── */
  useEffect(() => {
    if (mastery > 0) localStorage.setItem('xk006_mastery', String(mastery));
    if (answered > 0) localStorage.setItem('xk006_answered', String(answered));
    if (streak > 0) localStorage.setItem('xk006_streak', String(streak));
  }, [mastery, answered, streak]);

  const activeDomainInfo = DOMAINS.find((d) => d.id === activeDomain);

  /* ═══════════════════════ LOCKED STATE ═══════════════════════ */

  if (!unlocked) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0e17] text-[#e0f2fe] relative overflow-hidden">
        {/* Server rack background visualization */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          {Array.from({ length: 12 }).map((_, col) => (
            <div key={col} className="absolute flex flex-col gap-4" style={{ left: `${8 + col * 8}%`, top: 0, bottom: 0 }}>
              {Array.from({ length: 20 }).map((_, row) => (
                <motion.div
                  key={row}
                  className="w-6 h-1 rounded-full"
                  style={{
                    backgroundColor: (col + row) % 3 === 0 ? '#00d4ff' : '#1a2d45',
                    boxShadow: (col + row) % 3 === 0 ? '0 0 8px #00d4ff' : 'none',
                  }}
                  animate={{ opacity: (col + row) % 3 === 0 ? [0.4, 1, 0.4] : 0.3 }}
                  transition={{ duration: 2 + (col % 3), repeat: Infinity, delay: col * 0.2 }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Unlock animation particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#00d4ff]"
              style={{ left: `${Math.random() * 100}%`, top: `${30 + Math.random() * 40}%` }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-[100dvh] px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-lg"
          >
            {/* Lock Icon */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6 inline-block"
            >
              <div className="w-24 h-24 rounded-2xl bg-[#162236] border-2 border-[#1a2d45] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,212,255,0.15)]">
                <Lock size={44} className="text-[#00d4ff]" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl font-bold mb-3"
            >
              <span className="text-[#00d4ff]">Linux+ XK0-006</span>
              <span className="block text-lg text-[#7da0c4] font-medium mt-1">Locked</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="flex items-start gap-3">
                <p className="text-sm text-[#7da0c4] font-body">
                  Complete LPI 1 with 80% mastery to unlock this room.
                  <br />
                  Enterprise Linux, Security, Automation & Troubleshooting await.
                </p>
                <SpeakerButton text="Complete LPI 1 with 80% mastery to unlock this room. Enterprise Linux, Security, Automation and Troubleshooting await." label="Welcome" />
              </div>
            </motion.div>

            {/* Progress bar showing LPI 1 progress */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#7da0c4]">Dein LPI 1 Fortschritt</span>
                <span className="font-display text-sm font-bold" style={{ color: lpi1Mastery >= 80 ? '#00ff41' : '#ffaa00' }}>
                  {lpi1Mastery}% / 80%
                </span>
              </div>
              <div className="h-3 bg-[#162236] rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, lpi1Mastery)}%` }}
                  transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: lpi1Mastery >= 80 ? '#00ff41' : '#ffaa00',
                    boxShadow: lpi1Mastery >= 80 ? '0 0 10px rgba(0,255,65,0.5)' : '0 0 10px rgba(255,170,0,0.3)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#4a6682]">{80 - Math.min(80, lpi1Mastery)}% bis zum Unlock</span>
                {lpi1Mastery >= 60 && lpi1Mastery < 80 && (
                  <span className="text-[10px] text-[#ffaa00]">Fast geschafft!</span>
                )}
              </div>
            </motion.div>

            {/* Preview of what awaits */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-2 mb-6"
            >
              {['Enterprise Linux', 'Security Hardening', 'Automation', 'Troubleshooting'].map((tag) => (
                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-[#162236] text-[#00d4ff] border border-[#00d4ff]/20 opacity-50">
                  {tag}
                </span>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/lpi1')}
              className="px-6 py-3 rounded-lg bg-[#00d4ff] text-[#0a0e17] font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
            >
              <ChevronLeft size={16} /> Zurueck zu LPI 1
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════ UNLOCKED STATE ═══════════════════════ */

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] text-[#e0f2fe] relative">
      {/* Celebration confetti */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
            {Array.from({ length: 30 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-[#0d1526]/90 border border-[#00d4ff] rounded-2xl px-8 py-6 text-center backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                >
                  <Unlock size={48} className="text-[#00d4ff] mx-auto mb-3" />
                </motion.div>
                <h2 className="font-display text-2xl font-bold text-[#e0f2fe] mb-1">Room Unlocked!</h2>
                <p className="text-sm text-[#00d4ff]">CompTIA Linux+ XK0-006</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-10 pb-8">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #00d4ff 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-start gap-6 flex-wrap">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-shrink-0"
            >
              <div className="w-[100px] h-[100px] rounded-full border-[3px] border-[#00d4ff] shadow-[0_0_30px_rgba(0,212,255,0.4)] overflow-hidden flex items-center justify-center bg-[#162236]">
                <ShieldCheck size={48} className="text-[#00d4ff]" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-[280px]">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-3xl md:text-4xl font-bold mb-2"
                style={{ textShadow: '0 0 20px rgba(0,212,255,0.5)' }}
              >
                <span style={{ color: '#00d4ff' }}>CompTIA Linux+</span>
                <span className="text-[#e0f2fe]"> XK0-006</span>
              </motion.h1>
              <div className="flex items-start gap-3 mb-4">
                <p className="text-sm text-[#7da0c4] font-body flex-1">
                  Enterprise Linux Administration — Advanced server management, security hardening & automation
                </p>
                <SpeakerButton text="Enterprise Linux Administration — Advanced server management, security hardening and automation" label="Welcome" />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {['Enterprise Grade', 'Hands-on Labs', 'Performance Based'].map((badge) => (
                  <span key={badge} className="text-[10px] px-2.5 py-1 rounded-full bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20">
                    {badge}
                  </span>
                ))}
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
              <StatCard icon={<Target size={18} />} label="Mastery" value={`${mastery}%`} color="#00d4ff" />
              <StatCard icon={<Flame size={18} />} label="Streak" value={`${streak} Tage`} color="#10b981" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Domain Cards Grid */}
      <section className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Server size={20} className="text-[#00d4ff]" />
            <h2 className="font-display text-xl font-bold text-[#e0f2fe]">XK0-006 Domains</h2>
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
                        <Server size={18} style={{ color: domain.color }} />
                      </div>
                      <div>
                        <span className="font-terminal text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: `${domain.color}20`, color: domain.color }}>
                          {domain.weight}
                        </span>
                        <h3 className="font-body font-semibold text-sm text-[#e0f2fe] mt-0.5">{domain.title}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#4a6682] mb-3">
                    <span>{domain.questionCount} Fragen</span>
                    <span>Gewichtung {domain.weight}</span>
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

                  {/* Hints preview */}
                  <div className="mb-3 space-y-0.5">
                    {domain.hints.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[#7da0c4]">
                        <Zap size={10} className="mt-0.5 flex-shrink-0 text-[#ffaa00]" />
                        <span>{h}</span>
                      </div>
                    ))}
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

      {/* Quiz Interface */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          {!quizStarted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-[#0d1526] border border-[#1a2d45] rounded-xl"
            >
              <Server size={48} className="text-[#00d4ff] mx-auto mb-4 opacity-60" />
              <h3 className="font-display text-lg text-[#e0f2fe] mb-2">Waehle eine Domain</h3>
              <p className="text-sm text-[#7da0c4] mb-6">Klicke auf eine Domain-Karte oben, um das Quiz zu starten.</p>
              <button
                onClick={() => startQuiz('1')}
                className="px-6 py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2 mx-auto"
                style={{ backgroundColor: '#00d4ff', color: '#0a0e17' }}
              >
                <Play size={16} /> Mit System Management starten
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
              domainColor={activeDomainInfo?.color || '#00d4ff'}
              onSelect={setSelectedOption}
              onSubmit={submitAnswer}
              onNext={nextQuestion}
              onToggleHint={() => setShowHint((h) => !h)}
              onNavigate={setCurrentQ}
            />
          )}
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
      {/* Header */}
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

        {/* Hint */}
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
                  <Star size={12} className="text-[#ffaa00]" />
                  <span className="text-xs font-bold text-[#ffaa00]">80/20 Hint</span>
                </div>
                <p className="text-xs text-[#7da0c4]">{question.hint8020 || question.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!showResult ? (
            <>
              <button
                onClick={onToggleHint}
                className="px-3 py-2 rounded-lg text-xs font-medium border border-[#ffaa00]/30 text-[#ffaa00] hover:bg-[#ffaa00]/10 transition-all flex items-center gap-1.5"
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

      {/* Navigation grid */}
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
        {passed ? 'Domain gemeistert!' : 'Uebung beendet'}
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
          Hervorragend! Enterprise-Level erreicht!
        </motion.p>
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="px-5 py-2.5 rounded-lg text-sm font-bold bg-[#162236] text-[#e0f2fe] border border-[#1a2d45] hover:border-[#00d4ff] transition-all flex items-center gap-2"
        >
          <RotateCcw size={14} /> Neue Runde
        </button>
        {passed && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:brightness-110"
            style={{ backgroundColor: domain?.color || '#00d4ff', color: '#0a0e17' }}
          >
            <ArrowRight size={14} /> Weiter
          </button>
        )}
      </div>
    </motion.div>
  );
}
