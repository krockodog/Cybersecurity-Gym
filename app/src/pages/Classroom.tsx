// @ts-nocheck
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair,
  Shield,
  Search,
  Terminal,
  Wrench,
  Wifi,
  Lock,
  ChevronRight,
  MessageCircle,
  Award,
  Users,
  BookOpen,
  Zap,
  Globe,
  Sparkles,
  GraduationCap,
  Clock,
  Briefcase,
  Quote,
  Flame,
  Target,
  TrendingUp,
  Activity,
  Brain,
  X,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { SkillAssessment } from '../components/SkillAssessment';
import type { AssessmentResult } from '../components/SkillAssessment';
import { ClassroomTeam } from '../components/ClassroomTeam';
import { StudyStreak } from '../components/StudyStreak';
import { AdaptiveLearningPanel } from '../components/AdaptiveLearningPanel';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Professor {
  id: string;
  name: string;
  nickname: string;
  wing: string;
  domain: string;
  experience: string;
  former: string;
  bio: string;
  teaching_style: string;
  personality: string;
  catchphrase: string;
  voice_id: string;
  voice_name: string;
  accent: string;
  color: string;
  avatar: string;
  specialties: string[];
}

interface Wing {
  id: string;
  name: string;
  color: string;
  description: string;
  certification: string;
  status: string;
  professors: string[];
  total_questions: number;
  domains: string[];
}

interface ProfessorsData {
  jarvis: { name: string; title: string; color: string; catchphrase: string };
  professors: Professor[];
  wings: Wing[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const WING_TABS = [
  { id: 'all', label: 'All', color: '#00ff41', icon: Globe },
  { id: 'pentest', label: 'PenTest+', color: '#ff3366', icon: Crosshair },
  { id: 'linux', label: 'Linux', color: '#ff9500', icon: Terminal },
  { id: 'security', label: 'Security+', color: '#0066ff', icon: Shield },
  { id: 'network', label: 'Network+', color: '#00d4ff', icon: Wifi },
  { id: 'aplus', label: 'A+', color: '#ffaa00', icon: Wrench },
  { id: 'cybersecurity-analyst', label: 'CySA+', color: '#ec4899', icon: Search },
  { id: 'advanced-security', label: 'CASP+', color: '#14b8a6', icon: Lock },
];

const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const cardContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, ease: easeExpoOut },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: easeExpoOut },
  }),
};

/* ------------------------------------------------------------------ */
/*  Utility: Get student name from localStorage                       */
/* ------------------------------------------------------------------ */

function getStudentName(): string {
  try {
    return localStorage.getItem('trygit_student_name') || 'Student';
  } catch {
    return 'Student';
  }
}

function getUserStats() {
  try {
    const xp = parseInt(localStorage.getItem('trygit_xp') || '0', 10);
    const level = parseInt(localStorage.getItem('trygit_level') || '1', 10);
    const streak = parseInt(localStorage.getItem('trygit_streak') || '0', 10);
    const answered = parseInt(localStorage.getItem('trygit_questions_answered') || '0', 10);
    return { xp, level, streak, answered };
  } catch {
    return { xp: 0, level: 1, streak: 0, answered: 0 };
  }
}

function getStoredAssessment(): AssessmentResult | null {
  try {
    const stored = localStorage.getItem('trygit_skill_assessment');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  CountUp Component                                                  */
/* ------------------------------------------------------------------ */

function CountUp({ target, duration = 1500, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ------------------------------------------------------------------ */
/*  TypingText Component                                               */
/* ------------------------------------------------------------------ */

function TypingText({ text, speed = 45 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [done, setDone] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
        setTimeout(() => setShowCursor(false), 2000);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && showCursor && (
        <span className="inline-block w-[3px] h-[1em] bg-[#00ff41] ml-1 align-middle animate-pulse" />
      )}
    </span>
  );
}

/* ================================================================== */
/*  SECTION 1: Welcome Header (Dashboard Hero)                        */
/* ================================================================== */

function WelcomeHeader({ onAssessmentClick, hasAssessment }: { onAssessmentClick: () => void; hasAssessment: boolean }) {
  const studentName = getStudentName();
  const { xp, level, streak, answered } = getUserStats();
  const xpToNext = level * 1000;
  const xpPercent = Math.min((xp / xpToNext) * 100, 100);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const lastStudyDays = [true, true, true, false, true, true, false]; // placeholder

  const levelTitles: Record<number, string> = {
    1: 'Script Kiddie', 2: 'N00b', 3: 'Recon Ranger', 4: 'Exploit Enthusiast',
    5: 'Vuln Hunter', 6: 'Payload Artisan', 7: 'Shell Shocker', 8: 'Lateral Legend',
    9: 'Pivot Master', 10: 'Elite Pentester',
  };

  return (
    <section className="relative overflow-hidden px-4 sm:px-8 pt-6 pb-4">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f33]/60 via-transparent to-[#0a0e17]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px]"
          style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        {/* Top row: Welcome + Assessment CTA */}
        <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeExpoOut }}
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#e0f2fe] mb-1">
                <TypingText text={`Welcome back, ${studentName}`} speed={45} />
              </h1>
            </motion.div>

            <motion.p
              className="text-sm text-[#7da0c4]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeExpoOut, delay: 0.15 }}
            >
              Day {streak > 0 ? streak : 1} at the{' '}
              <span className="text-[#00ff41]">Cybersecurity Gymnasium</span>
            </motion.p>
          </div>

          <div className="flex items-center gap-3">
            {/* JARVIS Status */}
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a2d45] bg-[#0d1526]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: easeExpoOut, delay: 0.3 }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff41] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff41]" />
              </span>
              <span className="text-xs font-mono text-[#00ff41]">JARVIS Online</span>
            </motion.div>

            {/* Skill Assessment CTA */}
            {!hasAssessment && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: easeExpoOut, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAssessmentClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-xs font-bold uppercase tracking-wider hover:bg-[#00d4ff]/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-all"
              >
                <Brain size={14} />
                Take Assessment
              </motion.button>
            )}

            {hasAssessment && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: easeExpoOut, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAssessmentClick}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff41]/10 border border-[#00ff41]/30 text-[#00ff41] text-xs font-bold uppercase tracking-wider hover:bg-[#00ff41]/20 transition-all"
              >
                <BarChart3 size={14} />
                View Results
              </motion.button>
            )}
          </div>
        </div>

        {/* Middle row: Level badge + XP bar + Streak */}
        <motion.div
          className="flex flex-wrap items-center gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeExpoOut, delay: 0.25 }}
        >
          {/* Level Badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg viewBox="0 0 100 100" className="w-14 h-14">
                <defs>
                  <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff41" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#hexGrad)" stroke="none" />
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fill="#0a0e17" fontSize="32" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
                  {level}
                </text>
              </svg>
            </div>
            <div>
              <div className="text-xs font-mono text-[#00ff41]">{levelTitles[level] || 'Hacker'}</div>
              <div className="text-xs text-[#4a6682]">Level {level}</div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#7da0c4]">
                {xpToNext - xp > 0 ? `${(xpToNext - xp).toLocaleString()} XP to next` : 'Max Level!'}
              </span>
              <span className="text-xs text-[#00ff41] font-mono">
                {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#1a2d45] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #00ff41 0%, #00d4ff 100%)',
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.4)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, ease: easeExpoOut, delay: 0.6 }}
              />
            </div>
          </div>

          {/* Streak Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#ff7b0030] bg-[#ff7b0008]">
            <Flame size={22} className="text-[#ff7b00]" />
            <div>
              <div className="text-sm font-mono font-bold text-[#ff7b00]">{streak}</div>
              <div className="text-xs text-[#7da0c4]">Day Streak</div>
            </div>
          </div>

          {/* Questions Answered */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#00d4ff30] bg-[#00d4ff08]">
            <Target size={22} className="text-[#00d4ff]" />
            <div>
              <div className="text-sm font-mono font-bold text-[#00d4ff]">{answered}</div>
              <div className="text-xs text-[#7da0c4]">Answered</div>
            </div>
          </div>
        </motion.div>

        {/* Study week calendar */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="text-xs text-[#4a6682] mr-1">This week:</span>
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-medium transition-all duration-300 ${
                lastStudyDays[i]
                  ? 'bg-[#00ff4120] text-[#00ff41] border border-[#00ff4140]'
                  : 'bg-[#111d2e] text-[#4a6682] border border-[#1a2d45]'
              }`}
            >
              {day}
            </div>
          ))}
          <span className="text-xs text-[#4a6682] ml-2">
            {lastStudyDays.filter(Boolean).length}/7 days
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  SECTION 2: Quick Stats Row                                        */
/* ================================================================== */

function QuickStatsRow() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { answered } = getUserStats();

  const stats = [
    { icon: <Target size={22} className="text-[#00d4ff]" />, value: answered || 0, label: 'Questions', color: '#00d4ff' },
    { icon: <TrendingUp size={22} className="text-[#00ff41]" />, value: 70, label: 'Correct Rate', suffix: '%', color: '#00ff41' },
    { icon: <BookOpen size={22} className="text-[#ffaa00]" />, value: 5, label: 'Wings Active', color: '#ffaa00' },
    { icon: <Users size={22} className="text-[#8b5cf6]" />, value: 11, label: 'Professors', color: '#8b5cf6' },
  ];

  return (
    <section ref={ref} className="px-4 sm:px-8 py-4">
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={cardContainer}
        initial="hidden"
        animate={isInView ? 'show' : 'hidden'}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={cardItem}
            custom={i}
            whileHover={{ y: -4, borderColor: `${stat.color}40` }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                {stat.icon}
              </div>
              <Activity size={14} className="text-[#1a2d45]" />
            </div>
            <div className="font-mono font-bold text-2xl mb-1" style={{ color: stat.color }}>
              {stat.suffix ? <CountUp target={stat.value} suffix={stat.suffix} /> : <CountUp target={stat.value} />}
            </div>
            <div className="text-xs text-[#7da0c4]">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  SECTION 3: Assessment Banner (if no assessment taken)             */
/* ================================================================== */

function AssessmentBanner({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-4 sm:px-8 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeExpoOut, delay: 0.3 }}
        className="relative overflow-hidden rounded-xl p-5 md:p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(0,255,65,0.05) 100%)',
          border: '1.5px solid rgba(0,212,255,0.2)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-[#00d4ff]/10 border border-[#00d4ff]/20 flex items-center justify-center flex-shrink-0">
              <Brain size={24} className="text-[#00d4ff]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#e0f2fe] mb-0.5">
                Discover Your Starting Point
              </h3>
              <p className="text-sm text-[#7da0c4]">
                Take a 10-question diagnostic to get a personalized learning path recommendation.
                <span className="text-[#00ff41] ml-1">~3 minutes</span>
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className="flex-shrink-0 px-6 py-3 rounded-lg bg-[#00d4ff] text-[#0a0e17] font-bold text-sm uppercase tracking-wider flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
          >
            <Zap size={16} />
            Start Assessment
            <ArrowRight size={14} />
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  SECTION 4: Assessment Results Summary (compact)                   */
/* ================================================================== */

function AssessmentSummary({ result, onRetake }: { result: AssessmentResult; onRetake: () => void }) {
  const levelColor =
    result.recommendedLevel === 'advanced' ? '#00ff41' :
    result.recommendedLevel === 'intermediate' ? '#ffaa00' : '#00d4ff';

  return (
    <section className="px-4 sm:px-8 py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeExpoOut }}
        className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${levelColor}15`, border: `1px solid ${levelColor}30` }}
            >
              <BarChart3 size={24} style={{ color: levelColor }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-bold text-[#e0f2fe]">Assessment Results</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold uppercase"
                  style={{ backgroundColor: `${levelColor}15`, color: levelColor, border: `1px solid ${levelColor}30` }}
                >
                  {result.recommendedLevel}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7da0c4]">
                <span>Score: <strong className="text-[#e0f2fe]">{Math.round(result.overallScore * 100)}%</strong></span>
                {result.weakDomains.length > 0 && (
                  <span>Focus: <strong className="text-[#ff3366]">{result.weakDomains.join(', ')}</strong></span>
                )}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetake}
            className="flex-shrink-0 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#00d4ff]/40 hover:text-[#e0f2fe] transition-all"
          >
            <Brain size={14} />
            Retake
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  SECTION 5: Wing Filter Tabs (existing)                            */
/* ================================================================== */

function WingFilterTabs({ activeTab, onTabChange, counts }: { activeTab: string; onTabChange: (t: string) => void; counts: Record<string, number> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: easeExpoOut }}
      className="flex flex-wrap justify-center gap-3"
    >
      {WING_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(tab.id)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
            style={{
              backgroundColor: isActive ? tab.color : 'transparent',
              color: isActive ? '#0a0e17' : '#7da0c4',
              border: `1.5px solid ${isActive ? tab.color : '#1a2d45'}`,
              boxShadow: isActive ? `0 0 20px ${tab.color}40` : 'none',
            }}
          >
            <Icon size={15} />
            {tab.label}
            {counts[tab.id] !== undefined && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: isActive ? 'rgba(10,14,23,0.3)' : `${tab.color}20`,
                  color: isActive ? '#0a0e17' : tab.color,
                }}>
                {counts[tab.id]}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

/* ================================================================== */
/*  SECTION 6: ProfessorCard (existing, enhanced)                     */
/* ================================================================== */

function ProfessorCard({ professor, index }: { professor: Professor; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleStartSession = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      localStorage.setItem('trygit_selected_professor', professor.id);
      navigate('/tutor');
    },
    [navigate, professor.id]
  );

  const handleQuiz = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate('/quiz');
    },
    [navigate]
  );

  return (
    <motion.div
      variants={cardItem}
      custom={index}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      layout
    >
      <motion.div
        whileHover={{ scale: 1.02, y: -6 }}
        transition={{ duration: 0.35, ease: easeExpoOut }}
        className="relative overflow-hidden rounded-2xl cursor-pointer h-full"
        style={{
          background: 'linear-gradient(155deg, #0e1524 0%, #111d2e 50%, #0d1526 100%)',
          borderWidth: '1.5px',
          borderStyle: 'solid',
          borderColor: isHovered ? professor.color : '#1a2d45',
          boxShadow: isHovered
            ? `0 8px 40px ${professor.color}25, 0 0 60px ${professor.color}10, 0 2px 12px rgba(0,0,0,0.4)`
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
          style={{
            backgroundColor: professor.color,
            opacity: isHovered ? 1 : 0.3,
            boxShadow: isHovered ? `0 0 12px ${professor.color}` : 'none',
          }}
        />

        {/* Hover glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${professor.color}12 0%, transparent 70%)` }}
        />

        <div className="relative z-10 p-6 md:p-7">
          {/* Header: Avatar + Name */}
          <div className="flex items-start gap-5 mb-5">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="flex-shrink-0"
            >
              <div className="relative"
                style={{
                  padding: '3px',
                  borderRadius: '50%',
                  background: `conic-gradient(${professor.color}, ${professor.color}88, ${professor.color})`,
                }}
              >
                <img
                  src={professor.avatar}
                  alt={professor.name}
                  className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full object-cover bg-[#0a0e17]"
                  style={{ border: '3px solid #0a0e17' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-[90px] h-[90px] md:w-[110px] md:h-[110px] rounded-full items-center justify-center bg-[#111d2e] hidden"
                  style={{ border: `2px solid ${professor.color}40` }}>
                  <GraduationCap size={36} style={{ color: professor.color }} />
                </div>
              </div>
            </motion.div>

            <div className="flex-1 min-w-0 pt-1">
              <h3 className="text-xl md:text-2xl font-bold text-[#e0f2fe] leading-tight mb-1">
                {professor.name}
              </h3>
              <p className="text-sm font-semibold tracking-wide mb-2" style={{ color: professor.color }}>
                &ldquo;{professor.nickname}&rdquo;
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${professor.color}18`,
                  color: professor.color,
                  border: `1px solid ${professor.color}30`,
                }}>
                <Zap size={12} />
                {professor.domain}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-4" style={{ backgroundColor: `${professor.color}20` }} />

          {/* Experience */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="flex-shrink-0" style={{ color: professor.color }} />
              <span className="text-[#7da0c4]">{professor.experience}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase size={14} className="flex-shrink-0" style={{ color: professor.color }} />
              <span className="text-[#5a7a9a]">Former: {professor.former}</span>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm italic text-[#8ab4c7] leading-relaxed mb-4 line-clamp-3">
            &ldquo;{professor.bio}&rdquo;
          </p>

          {/* Divider */}
          <div className="h-px w-full mb-4" style={{ backgroundColor: `${professor.color}15` }} />

          {/* Teaching Style */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles size={13} style={{ color: professor.color }} />
              <span className="text-xs font-bold uppercase tracking-wider text-[#5a7a9a]">Teaching Style</span>
            </div>
            <p className="text-sm text-[#7da0c4] leading-relaxed line-clamp-2">{professor.teaching_style}</p>
          </div>

          {/* Catchphrase */}
          <div className="relative rounded-xl p-4 mb-5 overflow-hidden"
            style={{ backgroundColor: `${professor.color}0D`, border: `1px solid ${professor.color}25` }}>
            <Quote size={18} className="absolute top-2 left-2 opacity-20" style={{ color: professor.color }} />
            <p className="text-sm font-semibold italic text-center relative z-10" style={{ color: professor.color }}>
              &ldquo;{professor.catchphrase}&rdquo;
            </p>
          </div>

          {/* Divider */}
          <div className="h-px w-full mb-4" style={{ backgroundColor: `${professor.color}15` }} />

          {/* Specialties */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Award size={13} style={{ color: professor.color }} />
              <span className="text-xs font-bold uppercase tracking-wider text-[#5a7a9a]">Specialties</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {professor.specialties.map((s) => (
                <motion.span
                  key={s}
                  whileHover={{ scale: 1.08, y: -1 }}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 cursor-default"
                  style={{ backgroundColor: `${professor.color}12`, color: professor.color, border: `1px solid ${professor.color}20` }}>
                  {s}
                </motion.span>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStartSession}
              className="flex-1 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-1.5"
              style={{
                background: 'transparent',
                border: `1.5px solid ${professor.color}`,
                color: professor.color,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = professor.color;
                el.style.color = '#0a0e17';
                el.style.boxShadow = `0 0 24px ${professor.color}50`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.backgroundColor = 'transparent';
                el.style.color = professor.color;
                el.style.boxShadow = 'none';
              }}
            >
              <MessageCircle size={14} />
              1-on-1
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuiz}
              className="flex-1 py-3 px-3 rounded-xl font-bold text-xs uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-1.5 border border-[#1a2d45] text-[#7da0c4] hover:border-[#00ff41]/50 hover:text-[#00ff41]"
            >
              <BookOpen size={14} />
              Quiz
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  SECTION 7: Wing Overview Cards (existing)                         */
/* ================================================================== */

function WingOverviewCard({ wing, professorCount, index }: { wing: Wing; professorCount: number; index: number }) {
  const isActive = wing.status === 'active';

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-xl p-5 cursor-default group"
      style={{
        background: 'linear-gradient(145deg, #0e1524 0%, #111d2e 100%)',
        borderWidth: '1.5px',
        borderStyle: 'solid',
        borderColor: `${wing.color}25`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-1.5" style={{ backgroundColor: wing.color }} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${wing.color}08 0%, transparent 70%)` }}
      />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wing.color, boxShadow: `0 0 8px ${wing.color}60` }} />
          <h4 className="text-lg font-bold text-[#e0f2fe]">{wing.name}</h4>
        </div>
        <p className="text-xs text-[#5a7a9a] mb-4 leading-relaxed">{wing.description}</p>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <Users size={13} style={{ color: wing.color }} />
            <span className="text-xs text-[#7da0c4]">
              <strong className="text-[#e0f2fe]">{professorCount}</strong> Prof
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} style={{ color: wing.color }} />
            <span className="text-xs text-[#7da0c4]">
              <strong className="text-[#e0f2fe]">{wing.total_questions || '–'}</strong> Qs
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <Award size={13} className="text-[#5a7a9a]" />
          <span className="text-xs text-[#5a7a9a]">{wing.certification}</span>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase"
          style={{
            backgroundColor: isActive ? `${wing.color}18` : '#ff336618',
            color: isActive ? wing.color : '#ff3366',
            border: `1px solid ${isActive ? wing.color : '#ff3366'}30`,
          }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: isActive ? wing.color : '#ff3366' }} />
          {isActive ? 'Active' : 'Soon'}
        </span>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  SECTION 8: Skill Assessment Modal                                 */
/* ================================================================== */

function AssessmentModal({ isOpen, onClose, onComplete }: { isOpen: boolean; onClose: () => void; onComplete: (r: AssessmentResult) => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,14,23,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: easeExpoOut }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#1a2d45] p-6 md:p-8"
            style={{ background: 'linear-gradient(155deg, #0e1524 0%, #111d2e 50%, #0d1526 100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#5a7a9a] hover:text-[#e0f2fe] hover:bg-[#162236] transition-all z-10"
            >
              <X size={18} />
            </button>

            <SkillAssessment onComplete={onComplete} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  MAIN CLASSROOM DASHBOARD                                          */
/* ================================================================== */

export default function Classroom() {
  const [activeTab, setActiveTab] = useState('all');
  const [data, setData] = useState<ProfessorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const navigate = useNavigate();

  /* ── Load data ── */
  useEffect(() => {
    let cancelled = false;
    fetch('/professors.json')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setData({ jarvis: json.jarvis, professors: json.professors, wings: json.wings });
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load professors.json:', err);
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  /* ── Load stored assessment ── */
  useEffect(() => {
    const stored = getStoredAssessment();
    if (stored) setAssessmentResult(stored);
  }, []);

  /* ── Filter professors ── */
  const filteredProfessors = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'all') return data.professors;
    return data.professors.filter((p) => p.wing === activeTab);
  }, [data, activeTab]);

  /* ── Tab counts ── */
  const tabCounts = useMemo(() => {
    if (!data) return {};
    const counts: Record<string, number> = { all: data.professors.length };
    WING_TABS.forEach((tab) => {
      if (tab.id !== 'all') counts[tab.id] = data.professors.filter((p) => p.wing === tab.id).length;
    });
    return counts;
  }, [data]);

  /* ── Recommended professor ── */
  const recommendedProfessor = useMemo(() => {
    if (!data || !assessmentResult?.weakDomains.length) return null;
    // Find professor whose domain matches a weak domain
    return data.professors.find((p) =>
      assessmentResult.weakDomains.some((wd) =>
        p.domain.toLowerCase().includes(wd.toLowerCase()) ||
        wd.toLowerCase().includes(p.domain.toLowerCase())
      )
    ) || null;
  }, [data, assessmentResult]);

  /* ── Selected certification for team display ── */
  const selectedCert = useMemo(() => {
    if (!data || activeTab === 'all') return null;
    const wing = data.wings.find((w) => w.id === activeTab);
    return wing?.certification || null;
  }, [data, activeTab]);

  /* ── Handlers ── */
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAssessmentComplete = useCallback((result: AssessmentResult) => {
    setAssessmentResult(result);
    setShowAssessment(false);
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-2 border-[#00ff41] border-t-transparent rounded-full" />
          <p className="text-sm text-[#5a7a9a] font-medium tracking-wide">Loading Dashboard...</p>
        </motion.div>
      </main>
    );
  }

  /* ── Error ── */
  if (!data) {
    return (
      <main className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#ff3366] font-bold text-lg mb-2">Failed to Load</p>
          <p className="text-[#5a7a9a] text-sm mb-4">Could not load dashboard data.</p>
          <button onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-[#00ff41] text-[#0a0e17] font-bold text-sm">Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0e17]">
      {/* Study Streak */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <StudyStreak />
      </section>

      {/* Adaptive Learning Intelligence */}
      <section className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <AdaptiveLearningPanel />
      </section>

      {/* ── Assessment Modal ── */}
      <AssessmentModal
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        onComplete={handleAssessmentComplete}
      />

      {/* ============================================================ */}
      {/*  Section 1: Welcome Header                                   */}
      {/* ============================================================ */}
      <WelcomeHeader
        onAssessmentClick={() => setShowAssessment(true)}
        hasAssessment={!!assessmentResult}
      />

      {/* ============================================================ */}
      {/*  Section 2: Quick Stats                                      */}
      {/* ============================================================ */}
      <QuickStatsRow />

      {/* ============================================================ */}
      {/*  Section 3: Assessment Banner / Summary                      */}
      {/* ============================================================ */}
      {!assessmentResult && <AssessmentBanner onStart={() => setShowAssessment(true)} />}
      {assessmentResult && (
        <AssessmentSummary
          result={assessmentResult}
          onRetake={() => setShowAssessment(true)}
        />
      )}

      {/* ============================================================ */}
      {/*  Section 4: Recommended Professor (based on assessment)       */}
      {/* ============================================================ */}
      {recommendedProfessor && (
        <section className="px-4 sm:px-8 py-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeExpoOut }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-1 h-6 bg-[#00d4ff] rounded-full" />
            <h2 className="text-xl font-bold text-[#e0f2fe]">Recommended for You</h2>
            <span className="text-xs text-[#7da0c4]">Based on your assessment</span>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProfessorCard professor={recommendedProfessor} index={0} />
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  Section 5: Professor Grid Hero                              */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-8 pb-6">
        <div className="absolute inset-0">
          <div className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse at 20% 30%, rgba(0,255,65,0.05) 0%, transparent 50%),
                                radial-gradient(ellipse at 80% 20%, rgba(0,212,255,0.04) 0%, transparent 50%),
                                radial-gradient(ellipse at 50% 80%, rgba(255,51,102,0.03) 0%, transparent 50%)`,
            }}
          />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,255,65,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,255,65,0.3) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeExpoOut }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em] bg-[#00ff41]10 text-[#00ff41] border border-[#00ff41]25">
              <Sparkles size={14} />
              trygit.me Cybersecurity Gymnasium
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeExpoOut }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#e0f2fe] mb-4 tracking-tight"
          >
            <TypingText text="Meet Your Professors" speed={40} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base md:text-lg text-[#7da0c4] max-w-[640px] mx-auto mb-8 leading-relaxed"
          >
            <strong className="text-[#00ff41]">{data.professors.length} world-class AI professors</strong>.
            {' '}Decades of experience. One goal: <span className="text-[#e0f2fe]">your certification</span>.
          </motion.p>

          <WingFilterTabs activeTab={activeTab} onTabChange={handleTabChange} counts={tabCounts} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-6"
            >
              <span className="text-sm text-[#5a7a9a]">
                Showing <strong className="text-[#e0f2fe]">{filteredProfessors.length}</strong> professor
                {filteredProfessors.length !== 1 ? 's' : ''}
                {activeTab !== 'all' && (
                  <>
                    {' '}in{' '}
                    <strong style={{ color: WING_TABS.find((t) => t.id === activeTab)?.color }}>
                      {WING_TABS.find((t) => t.id === activeTab)?.label}
                    </strong>
                  </>
                )}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 6: Professor Cards Grid                             */}
      {/* ============================================================ */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={cardContainer}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredProfessors.map((professor, index) => (
              <ProfessorCard key={professor.id} professor={professor} index={index} />
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredProfessors.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <GraduationCap size={48} className="mx-auto text-[#1a2d45] mb-4" />
            <p className="text-[#5a7a9a] font-medium">No professors found in this wing yet.</p>
          </motion.div>
        )}
      </section>

      {/* ============================================================ */}
      {/*  Section 6.5: 5-Agent Team Display (when cert selected)       */}
      {/* ============================================================ */}
      <AnimatePresence>
        {selectedCert && (
          <motion.section
            key={`team-${activeTab}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
            className="max-w-[1280px] mx-auto px-6 md:px-8 pb-8"
          >
            <ClassroomTeam certification={selectedCert} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/*  Section 7: Wing Overview                                     */}
      {/* ============================================================ */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 pb-16 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: easeExpoOut }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-6 bg-[#00ff41] rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold text-[#e0f2fe]">Wing Overview</h2>
          </div>
          <p className="text-sm text-[#5a7a9a] ml-4">
            Seven specialized wings. Each leads to a different certification path.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        >
          {data.wings.map((wing, index) => {
            const professorCount = data.professors.filter((p) => p.wing === wing.id).length;
            return (
              <WingOverviewCard key={wing.id} wing={wing} professorCount={professorCount} index={index} />
            );
          })}
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  Section 8: CTA Footer                                        */}
      {/* ============================================================ */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeExpoOut }}
          className="relative overflow-hidden rounded-2xl p-8 md:p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, #0e1524 0%, #111d2e 100%)',
            border: '1.5px solid #1a2d45',
          }}
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,65,0.06) 0%, transparent 60%)' }}
          />
          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: 'rgba(0,255,65,0.08)', border: '2px solid rgba(0,255,65,0.2)' }}
            >
              <MessageCircle size={28} className="text-[#00ff41]" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#e0f2fe] mb-3">Ready to Start Learning?</h3>
            <p className="text-sm md:text-base text-[#7da0c4] max-w-[480px] mx-auto mb-6 leading-relaxed">
              Choose any professor above and begin a personalized 1-on-1 tutoring session.
              Your certification journey starts with a single conversation.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,65,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/tutor')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-[0.12em] bg-[#00ff41] text-[#0a0e17] transition-all duration-300"
            >
              <Zap size={18} />
              Enter the Tutoring Room
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
