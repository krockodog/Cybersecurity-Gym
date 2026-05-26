// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Zap,
  Target,
  Shield,
  Trophy,
  Lock,
  ChevronRight,
  BookOpen,
  Award,
  Clock,
  Terminal,
  Radio,
  TrendingUp,
  Brain,
  Activity,
  Crosshair,
  Scan,
  Code,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  User,
  Star,
  CircleDot,
  Hexagon,
  Cpu,
  Globe,
  Wifi,
  Layers,
  GraduationCap,
  Compass,
  Rocket,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import AnimatedGrid from '../components/AnimatedGrid';
import {
  getPersonalizedWelcomeForName,
  getCurrentAssignment,
  getStudentName,
  getProfessorDisplayName,
  getProfessorColor,
  getRecommendedNextSteps,
  shouldShowOnboarding,
} from '../services/orchestrator';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Professor {
  id: string;
  name: string;
  nickname: string;
  wing: string;
  domain: string;
  color: string;
  avatar: string;
  catchphrase: string;
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
  jarvis: {
    name: string;
    title: string;
    color: string;
    catchphrase: string;
  };
  professors: Professor[];
  wings: Wing[];
}

interface AgentMessage {
  id: number;
  time: string;
  agent: string;
  agentColor: string;
  message: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface SkillDomain {
  name: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  color: string;
}

/* ================================================================== */
/*  User State — loaded from localStorage with fallbacks               */
/* ================================================================== */

function getUserState() {
  const saved = localStorage.getItem('trygit_user_state');
  const defaults = {
    username: getStudentName(),
    level: 7,
    title: 'Shell Shocker',
    xp: 4200,
    xpToNext: 5500,
    streak: 12,
    streakBonus: 1.25,
    totalQuestionsAnswered: 486,
    totalCorrect: 342,
    totalWrong: 144,
    correctRate: 70,
    studyTimeMinutes: 1847,
    rank: 'Gold III',
    examReadiness: 62,
    lastStudyDays: [true, true, true, true, false, true, true],
    wingProgress: {
      pentest: 38,
      linux: 12,
      security: 5,
      network: 0,
      aplus: 0,
      cysa: 0,
      casp: 0,
    },
    avatar: '',
  };
  if (!saved) return defaults;
  try {
    return { ...defaults, ...JSON.parse(saved) };
  } catch {
    return defaults;
  }
}

const levelTitles: Record<number, string> = {
  1: 'Script Kiddie',
  2: 'N00b',
  3: 'Recon Ranger',
  4: 'Exploit Enthusiast',
  5: 'Vuln Hunter',
  6: 'Payload Artisan',
  7: 'Shell Shocker',
  8: 'Lateral Legend',
  9: 'Pivot Master',
  10: 'Elite Pentester',
};

const recentActivities = [
  { type: 'quiz', text: 'Completed PenTest+ quiz: Attacks & Exploits', xp: 25, time: '2 min ago' },
  { type: 'lesson', text: 'Completed lesson: SQL Injection Fundamentals', xp: 50, time: '15 min ago' },
  { type: 'streak', text: '12-day study streak maintained!', xp: 30, time: '1 hour ago' },
  { type: 'badge', text: 'Earned badge: "Linux Ninja"', xp: 100, time: '3 hours ago' },
  { type: 'correct', text: 'PBQ completed: Firewall Rules Configuration', xp: 25, time: '5 hours ago' },
];

const achievements: Achievement[] = [
  { id: 'first-blood', name: 'First Blood', description: 'Answered your first question', icon: 'zap', earned: true, earnedDate: '2026-01-15', rarity: 'common' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day study streak', icon: 'flame', earned: true, earnedDate: '2026-02-01', rarity: 'common' },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day study streak', icon: 'flame', earned: false, rarity: 'rare' },
  { id: 'linux-ninja', name: 'Linux Ninja', description: 'Scored 90% on Linux quiz', icon: 'terminal', earned: true, earnedDate: '2026-03-10', rarity: 'rare' },
  { id: 'pbq-crusher', name: 'PBQ Crusher', description: 'Completed 10 PBQs', icon: 'cpu', earned: true, earnedDate: '2026-03-15', rarity: 'rare' },
  { id: 'expert-hunter', name: 'Expert Hunter', description: 'Reached level 10', icon: 'trophy', earned: false, rarity: 'epic' },
  { id: 'grand-slam', name: 'Grand Slam', description: 'Mastered all domains', icon: 'award', earned: false, rarity: 'legendary' },
  { id: 'night-owl', name: 'Night Owl', description: 'Studied after midnight', icon: 'moon', earned: true, earnedDate: '2026-02-14', rarity: 'common' },
];

const skillDomains: SkillDomain[] = [
  { name: 'Planning & Scoping', score: 55, maxScore: 100, icon: <Compass size={18} />, color: '#10b981' },
  { name: 'Info Gathering', score: 70, maxScore: 100, icon: <Scan size={18} />, color: '#00e5ff' },
  { name: 'Attacks & Exploits', score: 45, maxScore: 100, icon: <Crosshair size={18} />, color: '#ff3366' },
  { name: 'Reporting', score: 60, maxScore: 100, icon: <FileText size={18} />, color: '#8b5cf6' },
  { name: 'Tools & Code', score: 65, maxScore: 100, icon: <Code size={18} />, color: '#a855f7' },
  { name: 'Security Fund.', score: 80, maxScore: 100, icon: <Shield size={18} />, color: '#00ff41' },
  { name: 'Networking', score: 50, maxScore: 100, icon: <Wifi size={18} />, color: '#00d4ff' },
  { name: 'Linux', score: 72, maxScore: 100, icon: <Terminal size={18} />, color: '#ff9500' },
];

const certificationProgress = [
  { name: 'PenTest+', code: 'PT0-003', progress: 38, total: 100, color: '#00ff41', icon: <Crosshair size={16} /> },
  { name: 'LPI 1', code: '101-500', progress: 12, total: 100, color: '#ff9500', icon: <Terminal size={16} /> },
  { name: 'Security+', code: 'SY0-701', progress: 5, total: 100, color: '#00d4ff', icon: <Shield size={16} /> },
  { name: 'Network+', code: 'N10-009', progress: 0, total: 100, color: '#8b5cf6', icon: <Wifi size={16} /> },
  { name: 'CySA+', code: 'CS0-004', progress: 0, total: 100, color: '#ec4899', icon: <Activity size={16} /> },
];

/* ================================================================== */
/*  Animation Utilities                                                */
/* ================================================================== */

const easeExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: easeExpo },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    transition: { duration: 0.3, ease: easeExpo },
  },
};

/* ================================================================== */
/*  Sub-component: TypingText                                          */
/* ================================================================== */

function TypingText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);
    const timer = setInterval(() => {
      idxRef.current += 1;
      if (idxRef.current <= text.length) {
        setDisplayed(text.slice(0, idxRef.current));
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!done && (
        <span className="inline-block w-[2px] h-[1em] bg-[#00ff41] ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

/* ================================================================== */
/*  Sub-component: CountUp                                             */
/* ================================================================== */

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

/* ================================================================== */
/*  Section 1: Student Header (NEW — replaces old Hero)                */
/* ================================================================== */

function StudentHeader() {
  const userState = getUserState();
  const welcomeMessage = getPersonalizedWelcomeForName(userState.username);
  const assignment = getCurrentAssignment();

  return (
    <section className="relative px-4 sm:px-8 pt-6 pb-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f33]/60 via-transparent to-[#0a0e17]" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px]"
             style={{ background: 'radial-gradient(circle, rgba(0,255,65,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <motion.div
              className="relative flex-shrink-0"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeExpo }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#162236] border-2 border-[#00ff41] flex items-center justify-center overflow-hidden"
                   style={{ boxShadow: '0 0 20px rgba(0,255,65,0.2)' }}>
                {userState.avatar ? (
                  <img src={userState.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-[#00ff41]" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0d1526] border border-[#00ff41] flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ff41]" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeExpo }}
              >
                <h1 className="text-h2 text-[#e0f2fe] mb-1">
                  <TypingText text={welcomeMessage} speed={40} />
                </h1>
              </motion.div>

              <motion.p
                className="text-body-sm text-[#7da0c4]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: easeExpo, delay: 0.15 }}
              >
                Day {userState.streak} at the Cybersecurity Gymnasium &middot;{' '}
                <span className="text-[#00ff41]">{userState.rank}</span>
              </motion.p>
            </div>
          </div>

          {/* JARVIS + Professor Status */}
          <motion.div
            className="flex flex-col items-end gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: easeExpo, delay: 0.3 }}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1a2d45] bg-[#0d1526]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff41] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00ff41]" />
              </span>
              <span className="text-caption font-display text-[#00ff41]">JARVIS Online</span>
            </div>
            {assignment && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#1a2d45] bg-[#0d1526]">
                <GraduationCap size={12} style={{ color: getProfessorColor(assignment.primaryProfessor) }} />
                <span className="text-caption text-[#7da0c4]">
                  Prof: <span style={{ color: getProfessorColor(assignment.primaryProfessor) }}>
                    {getProfessorDisplayName(assignment.primaryProfessor)}
                  </span>
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  Section 2: XP & Level Display (Enhanced)                           */
/* ================================================================== */

function XPLevelDisplay() {
  const userState = getUserState();
  const xpPercent = (userState.xp / userState.xpToNext) * 100;
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <section className="px-4 sm:px-8 py-4">
      <motion.div
        className="gradient-card border border-[#1a2d45] rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeExpo, delay: 0.1 }}
      >
        <div className="flex flex-wrap items-center gap-6">
          {/* Level Badge */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: easeExpo, delay: 0.2 }}
          >
            <div className="relative">
              <svg viewBox="0 0 100 100" className="w-16 h-16">
                <defs>
                  <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ff41" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
                <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill="url(#hexGrad)" stroke="none" />
                <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fill="#0a0e17" fontSize="32" fontFamily="'JetBrains Mono', monospace" fontWeight="800">
                  {userState.level}
                </text>
              </svg>
            </div>
            <div>
              <div className="text-caption font-display text-[#00ff41]">{userState.title}</div>
              <div className="text-caption text-[#4a6682]">Level {userState.level} of 10</div>
              <div className="text-caption text-[#7da0c4] mt-0.5">
                Next: <span className="text-[#00d4ff]">{levelTitles[userState.level + 1] || 'Max Level'}</span>
              </div>
            </div>
          </motion.div>

          {/* XP Progress Bar */}
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-caption text-[#7da0c4]">
                <Zap size={12} className="inline mr-1" />
                +{(userState.xpToNext - userState.xp).toLocaleString()} XP to Level {userState.level + 1}
              </span>
              <span className="text-xp text-[#00ff41]">
                {userState.xp.toLocaleString()} / {userState.xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="w-full h-3 bg-[#1a2d45] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: 'linear-gradient(90deg, #00ff41 0%, #00d4ff 100%)',
                  boxShadow: '0 0 10px rgba(0, 255, 65, 0.4)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, ease: easeExpo, delay: 0.6 }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              </motion.div>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-caption text-[#4a6682]">{Math.round(xpPercent)}% complete</span>
              <span className="text-caption text-[#4a6682]">
                <Flame size={10} className="inline mr-0.5 text-[#ff7b00]" />
                {userState.streakBonus}x streak bonus active
              </span>
            </div>
          </div>

          {/* Streak + Week */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ff7b0030] bg-[#ff7b0008]">
              <Flame size={22} className="text-[#ff7b00]" />
              <div>
                <div className="text-sm font-display font-bold text-[#ff7b00]">{userState.streak}</div>
                <div className="text-caption text-[#7da0c4]">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Study Streak Calendar */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a2d45]">
          <span className="text-caption text-[#4a6682] mr-1">This week:</span>
          {weekDays.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-caption font-display font-medium transition-all duration-300 ${
                userState.lastStudyDays[i]
                  ? 'bg-[#00ff4120] text-[#00ff41] border border-[#00ff4140]'
                  : 'bg-[#111d2e] text-[#4a6682] border border-[#1a2d45]'
              }`}
              title={userState.lastStudyDays[i] ? 'Studied' : 'No activity'}
            >
              {day}
            </motion.div>
          ))}
          <span className="text-caption text-[#4a6682] ml-2">
            {userState.lastStudyDays.filter(Boolean).length}/7 days
          </span>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 3: Skill Tree (NEW)                                        */
/* ================================================================== */

function SkillTree() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-[#00d4ff]" />
          <h2 className="text-h2 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
            Skill Tree
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111d2e] border border-[#1a2d45]">
          <Star size={14} className="text-[#ffaa00]" />
          <span className="text-caption text-[#7da0c4]">
            Avg: {Math.round(skillDomains.reduce((a, d) => a + d.score, 0) / skillDomains.length)}%
          </span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {skillDomains.map((domain, i) => {
          const percent = (domain.score / domain.maxScore) * 100;
          const isWeak = domain.score < 60;
          const isStrong = domain.score >= 80;
          return (
            <motion.div
              key={domain.name}
              variants={itemVariants}
              whileHover={{ y: -3, borderColor: `${domain.color}40` }}
              className="gradient-card border border-[#1a2d45] rounded-xl p-4 cursor-default"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${domain.color}15`, color: domain.color }}
                >
                  {domain.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body-sm font-medium text-[#e0f2fe] truncate">{domain.name}</div>
                </div>
                {isStrong && <Award size={14} className="text-[#ffaa00] flex-shrink-0" />}
                {isWeak && <AlertCircle size={14} className="text-[#ff3366] flex-shrink-0" />}
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${domain.color}, ${domain.color}cc)`,
                      boxShadow: `0 0 8px ${domain.color}60`,
                    }}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${percent}%` } : {}}
                    transition={{ duration: 1, ease: easeExpo, delay: 0.2 + i * 0.08 }}
                  />
                </div>
                <span className="text-caption font-display font-medium" style={{ color: domain.color }}>
                  {domain.score}%
                </span>
              </div>

              <div className="text-caption text-[#4a6682]">
                {isStrong ? 'Mastered' : isWeak ? 'Needs focus' : 'Improving'}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 4: Achievement Badges (NEW)                                */
/* ================================================================== */

const rarityColors: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: '#4a668215', border: '#4a668240', text: '#7da0c4' },
  rare: { bg: '#00d4ff15', border: '#00d4ff40', text: '#00d4ff' },
  epic: { bg: '#a855f715', border: '#a855f740', text: '#a855f7' },
  legendary: { bg: '#ffaa0015', border: '#ffaa0040', text: '#ffaa00' },
};

function AchievementBadges() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <div className="flex items-center gap-2">
          <Trophy size={20} className="text-[#ffaa00]" />
          <h2 className="text-h2 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
            Achievement Badges
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111d2e] border border-[#1a2d45]">
          <Award size={14} className="text-[#ffaa00]" />
          <span className="text-caption text-[#7da0c4]">{earnedCount}/{achievements.length}</span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {achievements.map((badge, i) => {
          const rarity = rarityColors[badge.rarity] || rarityColors.common;
          return (
            <motion.div
              key={badge.id}
              variants={itemVariants}
              whileHover={badge.earned ? { y: -3, scale: 1.02 } : {}}
              className={`relative border rounded-xl p-4 text-center transition-all duration-300 ${
                badge.earned
                  ? 'cursor-default'
                  : 'opacity-50 grayscale-[0.6]'
              }`}
              style={{
                backgroundColor: badge.earned ? rarity.bg : '#111d2e',
                borderColor: badge.earned ? rarity.border : '#1a2d45',
              }}
            >
              {!badge.earned && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <Lock size={18} className="text-[#4a6682]" />
                </div>
              )}
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{
                  backgroundColor: badge.earned ? `${rarity.border}` : '#1a2d45',
                  color: badge.earned ? rarity.text : '#4a6682',
                }}
              >
                {badge.icon === 'zap' && <Zap size={24} />}
                {badge.icon === 'flame' && <Flame size={24} />}
                {badge.icon === 'terminal' && <Terminal size={24} />}
                {badge.icon === 'cpu' && <Cpu size={24} />}
                {badge.icon === 'trophy' && <Trophy size={24} />}
                {badge.icon === 'award' && <Award size={24} />}
                {badge.icon === 'moon' && <Clock size={24} />}
              </div>
              <div className="text-body-sm font-medium text-[#e0f2fe] mb-0.5">{badge.name}</div>
              <div className="text-caption text-[#4a6682] mb-2">{badge.description}</div>
              <span
                className="inline-block text-[10px] px-2 py-0.5 rounded-full font-display uppercase tracking-wider"
                style={{
                  backgroundColor: badge.earned ? rarity.border : '#1a2d45',
                  color: badge.earned ? rarity.text : '#4a6682',
                }}
              >
                {badge.rarity}
              </span>
              {badge.earned && badge.earnedDate && (
                <div className="text-[10px] text-[#4a6682] mt-1">{badge.earnedDate}</div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 5: Study Stats (NEW)                                       */
/* ================================================================== */

function StudyStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const userState = getUserState();

  const stats = [
    {
      icon: <Target size={22} className="text-[#00d4ff]" />,
      value: userState.totalQuestionsAnswered,
      label: 'Questions Answered',
      color: '#00d4ff',
    },
    {
      icon: <TrendingUp size={22} className="text-[#00ff41]" />,
      value: userState.correctRate,
      label: 'Accuracy Rate',
      suffix: '%',
      color: '#00ff41',
    },
    {
      icon: <CheckCircle size={22} className="text-[#00ff41]" />,
      value: userState.totalCorrect,
      label: 'Correct Answers',
      color: '#00ff41',
    },
    {
      icon: <XCircle size={22} className="text-[#ff3366]" />,
      value: userState.totalWrong,
      label: 'Wrong Answers',
      color: '#ff3366',
    },
    {
      icon: <Clock size={22} className="text-[#ffaa00]" />,
      value: Math.floor(userState.studyTimeMinutes / 60),
      label: 'Study Hours',
      suffix: 'h',
      color: '#ffaa00',
    },
    {
      icon: <BookOpen size={22} className="text-[#8b5cf6]" />,
      value: Math.floor(userState.studyTimeMinutes / 45),
      label: 'Study Sessions',
      color: '#8b5cf6',
    },
    {
      icon: <Flame size={22} className="text-[#ff7b00]" />,
      value: userState.streak,
      label: 'Day Streak',
      color: '#ff7b00',
    },
    {
      icon: <Activity size={22} className="text-[#ec4899]" />,
      value: userState.examReadiness,
      label: 'Exam Readiness',
      suffix: '%',
      color: '#ec4899',
    },
  ];

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center gap-2 mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <BarChartIcon />
        <h2 className="text-h2 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
          Study Stats
        </h2>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            whileHover={{ y: -4, borderColor: `${stat.color}40` }}
            className="gradient-card border border-[#1a2d45] rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                {stat.icon}
              </div>
              <Activity size={14} className="text-[#1a2d45]" />
            </div>
            <div className="font-display font-bold text-2xl mb-1" style={{ color: stat.color }}>
              <CountUp target={stat.value} suffix={stat.suffix || ''} />
            </div>
            <div className="text-caption text-[#7da0c4]">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function BarChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

/* ================================================================== */
/*  Section 6: Certification Progress (NEW)                            */
/* ================================================================== */

function CertificationProgress() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center gap-2 mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <GraduationCap size={20} className="text-[#00ff41]" />
        <h2 className="text-h2 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
          Certification Progress
        </h2>
      </motion.div>

      <motion.div
        className="gradient-card border border-[#1a2d45] rounded-xl p-5"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        <div className="space-y-4">
          {certificationProgress.map((cert, i) => {
            const percent = Math.round((cert.progress / cert.total) * 100);
            return (
              <motion.div key={cert.code} variants={itemVariants} className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cert.color}15`, color: cert.color }}
                >
                  {cert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-body-sm font-medium text-[#e0f2fe]">{cert.name}</span>
                      <span className="text-caption text-[#4a6682] ml-2">{cert.code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-caption font-display" style={{ color: cert.color }}>
                        {percent}%
                      </span>
                      <span className="text-caption text-[#4a6682]">
                        {cert.progress}/{cert.total}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-[#1a2d45] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${cert.color}, ${cert.color}cc)`,
                        boxShadow: `0 0 8px ${cert.color}60`,
                      }}
                      initial={{ width: 0 }}
                      animate={isInView ? { width: `${percent}%` } : {}}
                      transition={{ duration: 1, ease: easeExpo, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 7: AI Orchestrator Panel (NEW)                             */
/* ================================================================== */

function AIOrchestratorPanel() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const assignment = getCurrentAssignment();
  const recommendedSteps = getRecommendedNextSteps();
  const navigate = useNavigate();

  // If no assignment yet, show a prompt to take assessment
  if (!assignment) {
    return (
      <section ref={ref} className="px-4 sm:px-8 py-6">
        <motion.div
          className="gradient-card border border-[#00ff4140] rounded-xl p-6 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: easeExpo }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-10"
               style={{ background: 'radial-gradient(circle at top right, #00ff41, transparent 60%)' }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#00ff4115] border border-[#00ff4130] flex items-center justify-center flex-shrink-0">
              <Rocket size={28} className="text-[#00ff41]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-h3 text-[#e0f2fe] mb-1">Start Your Personalized Journey</h3>
              <p className="text-body-sm text-[#7da0c4]">
                Take a quick skill assessment to get matched with your ideal professor and personalized study plan.
              </p>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              className="px-5 py-2.5 rounded-lg font-display font-medium text-sm uppercase tracking-wider border border-[#00ff4150] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0a0e17] transition-all duration-300 flex items-center gap-2 flex-shrink-0"
            >
              Begin Assessment <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  const primaryColor = getProfessorColor(assignment.primaryProfessor);
  const primaryName = getProfessorDisplayName(assignment.primaryProfessor);

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center gap-2 mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <Sparkles size={20} className="text-[#00ff41]" />
        <h2 className="text-h2 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
          AI Orchestrator
        </h2>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff41] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff41]" />
        </span>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {/* Primary Professor Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="gradient-card border rounded-xl p-5 lg:col-span-1"
          style={{ borderColor: `${primaryColor}40`, borderLeftWidth: '4px', borderLeftColor: primaryColor }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="text-caption text-[#7da0c4]">Primary Professor</div>
              <div className="text-body font-display font-medium" style={{ color: primaryColor }}>
                {primaryName}
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-caption text-[#7da0c4]">Difficulty</span>
              <span
                className="text-caption font-display px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: assignment.difficulty === 'advanced' ? '#ff336615' : assignment.difficulty === 'intermediate' ? '#00d4ff15' : '#00ff4115',
                  color: assignment.difficulty === 'advanced' ? '#ff3366' : assignment.difficulty === 'intermediate' ? '#00d4ff' : '#00ff41',
                }}
              >
                {assignment.difficulty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-[#7da0c4]">Daily Target</span>
              <span className="text-caption font-display text-[#00ff41]">{assignment.dailyQuestionTarget} questions</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-caption text-[#7da0c4]">PBQ Frequency</span>
              <span className="text-caption font-display text-[#ffaa00]">Every {assignment.pbqFrequency} days</span>
            </div>
          </div>

          {assignment.secondaryProfessors.length > 0 && (
            <div className="pt-3 border-t border-[#1a2d45]">
              <div className="text-caption text-[#4a6682] mb-2">Also assigned:</div>
              <div className="flex flex-wrap gap-2">
                {assignment.secondaryProfessors.map((pid) => (
                  <span
                    key={pid}
                    className="text-caption px-2 py-1 rounded-lg border"
                    style={{
                      borderColor: `${getProfessorColor(pid)}30`,
                      color: getProfessorColor(pid),
                      backgroundColor: `${getProfessorColor(pid)}10`,
                    }}
                  >
                    {getProfessorDisplayName(pid)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Focus Domains */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="gradient-card border border-[#1a2d45] rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Crosshair size={18} className="text-[#00d4ff]" />
            <h3 className="text-body font-display font-medium text-[#e0f2fe]">Focus Domains</h3>
          </div>
          <div className="space-y-3">
            {assignment.focusDomains.map((domain, i) => {
              const colors = ['#ff3366', '#ffaa00', '#00d4ff'];
              return (
                <div key={domain} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors[i]}15`, color: colors[i] }}
                  >
                    <Target size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-body-sm text-[#e0f2fe] truncate">{domain}</div>
                  </div>
                  <div className="text-caption font-display" style={{ color: colors[i] }}>
                    P{i + 1}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/quiz')}
            className="w-full mt-4 py-2 rounded-lg font-display text-xs uppercase tracking-wider border border-[#00d4ff30] text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0a0e17] transition-all duration-300"
          >
            Practice Focus Areas
          </button>
        </motion.div>

        {/* Recommended Next Steps */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3 }}
          className="gradient-card border border-[#1a2d45] rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Rocket size={18} className="text-[#ffaa00]" />
            <h3 className="text-body font-display font-medium text-[#e0f2fe]">Recommended Next Steps</h3>
          </div>
          <div className="space-y-2">
            {recommendedSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: easeExpo }}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-[#111d2e] border border-[#1a2d45]"
              >
                <ChevronRight size={14} className="text-[#00ff41] mt-0.5 flex-shrink-0" />
                <span className="text-body-sm text-[#e0f2fe]">{step}</span>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => navigate('/classroom')}
            className="w-full mt-4 py-2 rounded-lg font-display text-xs uppercase tracking-wider border border-[#00ff4150] text-[#00ff41] hover:bg-[#00ff41] hover:text-[#0a0e17] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Go to Classroom <ArrowRight size={12} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 8: Wing Navigation                                         */
/* ================================================================== */

const wingRouteMap: Record<string, string> = {
  pentest: '/classroom',
  linux: '/lpi1',
  security: '/classroom',
  network: '/classroom',
  aplus: '/classroom',
  cysa: '/classroom',
  casp: '/classroom',
};

const wingComingSoon: Record<string, boolean> = {
  pentest: false,
  linux: false,
  security: false,
  network: true,
  aplus: true,
  cysa: true,
  casp: true,
};

function WingCard({
  wing,
  professors,
  professorMap,
}: {
  wing: Wing;
  professors: Professor[];
  professorMap: Map<string, Professor>;
}) {
  const navigate = useNavigate();
  const userState = getUserState();
  const wingProfs = wing.professors.map((pid) => professorMap.get(pid)).filter(Boolean) as Professor[];
  const isComingSoon = wingComingSoon[wing.id] || wing.total_questions === 0;
  const progress = userState.wingProgress[wing.id as keyof typeof userState.wingProgress] || 0;

  const handleClick = () => {
    if (!isComingSoon) {
      navigate(wingRouteMap[wing.id] || '/classroom');
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="rest"
      whileHover={isComingSoon ? {} : 'hover'}
      animate="rest"
      onClick={handleClick}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br from-[#0d1526] to-[#111d2e] transition-all duration-300 ${
        isComingSoon
          ? 'border-[#1a2d45] cursor-not-allowed opacity-70'
          : 'cursor-pointer hover:shadow-lg'
      }`}
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: wing.color,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      <motion.div
        variants={cardHoverVariants}
        className="p-5 h-full"
      >
        {isComingSoon && (
          <div className="absolute inset-0 bg-[#0a0e17]/70 z-20 flex flex-col items-center justify-center backdrop-blur-[2px]">
            <Lock size={32} className="text-[#4a6682] mb-2" />
            <span className="text-body-sm font-display text-[#4a6682]">Coming Soon</span>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-h3 text-[#e0f2fe] mb-1" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
              {wing.name}
            </h3>
            <p className="text-caption text-[#7da0c4]">{wing.certification}</p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${wing.color}15`, border: `1px solid ${wing.color}30` }}
          >
            <Sparkles size={20} style={{ color: wing.color }} />
          </div>
        </div>

        <p className="text-body-sm text-[#7da0c4] mb-4">{wing.description}</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {wingProfs.slice(0, 5).map((prof) => (
              <div
                key={prof.id}
                className="w-8 h-8 rounded-full border-2 border-[#0a0e17] overflow-hidden flex-shrink-0"
                title={prof.name}
                style={{ boxShadow: `0 0 8px ${prof.color}40` }}
              >
                <img
                  src={prof.avatar}
                  alt={prof.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          <span className="text-caption text-[#4a6682] ml-1">
            {wing.professors.length} Professor{wing.professors.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium"
              style={{
                backgroundColor: `${wing.color}15`,
                color: wing.color,
                border: `1px solid ${wing.color}30`,
              }}
            >
              <BookOpen size={11} />
              {wing.total_questions > 0 ? `${wing.total_questions} Questions` : 'Questions Coming'}
            </span>
            {!isComingSoon && (
              <span className="text-caption font-display text-[#00ff41]">{progress}%</span>
            )}
          </div>

          {!isComingSoon && (
            <div className="w-full h-1.5 bg-[#1a2d45] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${wing.color}, ${wing.color}cc)`,
                  boxShadow: `0 0 8px ${wing.color}60`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: easeExpo, delay: 0.3 }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {wing.domains.slice(0, 3).map((d) => (
            <span key={d} className="text-caption px-2 py-0.5 rounded bg-[#1a2d45] text-[#7da0c4]">
              {d}
            </span>
          ))}
          {wing.domains.length > 3 && (
            <span className="text-caption px-2 py-0.5 rounded bg-[#1a2d45] text-[#4a6682]">
              +{wing.domains.length - 3}
            </span>
          )}
        </div>

        <button
          disabled={isComingSoon}
          className={`w-full py-2.5 rounded-lg font-display font-medium text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 ${
            isComingSoon
              ? 'bg-[#1a2d45] text-[#4a6682] cursor-not-allowed'
              : 'border hover:text-[#0a0e17] active:scale-[0.98]'
          }`}
          style={
            isComingSoon
              ? {}
              : {
                  borderColor: `${wing.color}50`,
                  color: wing.color,
                }
          }
          onMouseEnter={(e) => {
            if (!isComingSoon) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = wing.color;
              (e.currentTarget as HTMLButtonElement).style.borderColor = wing.color;
            }
          }}
          onMouseLeave={(e) => {
            if (!isComingSoon) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${wing.color}50`;
            }
          }}
        >
          Enter Wing <ArrowRight size={14} />
        </button>
      </motion.div>

      {!isComingSoon && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"
          style={{
            boxShadow: `inset 0 0 0 1px ${wing.color}40, 0 0 30px ${wing.color}15`,
          }}
        />
      )}
    </motion.div>
  );
}

function WingNavigation({
  wings,
  professors,
  professorMap,
}: {
  wings: Wing[];
  professors: Professor[];
  professorMap: Map<string, Professor>;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center justify-between mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <div>
          <h2 className="text-h2 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)' }}>
            Training Wings
          </h2>
          <p className="text-caption text-[#7da0c4] mt-1">
            Choose your specialization path
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111d2e] border border-[#1a2d45]">
          <Terminal size={14} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4]">{wings.length} Wings</span>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {wings.map((wing) => (
          <WingCard
            key={wing.id}
            wing={wing}
            professors={professors}
            professorMap={professorMap}
          />
        ))}
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 9: Agent Communication Feed                                */
/* ================================================================== */

const initialAgentMessages: AgentMessage[] = [
  { id: 1, time: '10:23', agent: 'Professor Cipher', agentColor: '#ff3366', message: 'Preparing your SQL Injection lesson...' },
  { id: 2, time: '10:24', agent: 'Benny', agentColor: '#ff9500', message: 'Your bash skills improved 15% this week!' },
  { id: 3, time: '10:25', agent: 'JARVIS', agentColor: '#00ff41', message: 'Daily challenge available — earn 50 XP' },
  { id: 4, time: '10:26', agent: 'Guardian', agentColor: '#0066ff', message: 'I noticed you struggled with cryptography. Extra practice added.' },
  { id: 5, time: '10:27', agent: 'Dr. Recon', agentColor: '#00e5ff', message: 'New OSINT challenge unlocked in Information Gathering.' },
  { id: 6, time: '10:28', agent: 'JARVIS', agentColor: '#00ff41', message: 'Your PenTest+ exam readiness is now 62%. Keep pushing!' },
  { id: 7, time: '10:29', agent: 'Director Sage', agentColor: '#10b981', message: 'Remember: a finding without a fix is just complaining.' },
  { id: 8, time: '10:30', agent: 'Code Master', agentColor: '#a855f7', message: 'New Python scripting lab available in Tools & Code.' },
];

const extraMessages: AgentMessage[] = [
  { id: 101, time: '10:31', agent: 'Agent Shield', agentColor: '#ffaa00', message: 'Compliance framework quiz updated with new GDPR questions.' },
  { id: 102, time: '10:32', agent: 'Benny', agentColor: '#ff9500', message: 'rm -rf / ist keine Lösung. Aber manchmal fühlt es sich so an.' },
  { id: 103, time: '10:33', agent: 'JARVIS', agentColor: '#00ff41', message: 'Streak bonus activated: +25% XP on all completed lessons.' },
  { id: 104, time: '10:34', agent: 'NetRunner', agentColor: '#00d4ff', message: 'Network+ Wing will be available next week. Stay tuned!' },
  { id: 105, time: '10:35', agent: 'Guardian', agentColor: '#0066ff', message: 'Threat detection simulation ready. Are you prepared?' },
  { id: 106, time: '10:36', agent: 'FixIt', agentColor: '#ffaa00', message: 'Have you tried turning it off and on again? No, seriously.' },
  { id: 107, time: '10:37', agent: 'Professor Cipher', agentColor: '#ff3366', message: 'In the dark web, knowledge is your only flashlight.' },
  { id: 108, time: '10:38', agent: 'JARVIS', agentColor: '#00ff41', message: 'Weekly report: 42 questions answered, 78% accuracy.' },
];

function AgentCommunicationFeed() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AgentMessage[]>(initialAgentMessages);
  const [activeMessageIds, setActiveMessageIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!isInView) return;
    initialAgentMessages.forEach((msg, i) => {
      setTimeout(() => {
        setActiveMessageIds((prev) => new Set(prev).add(msg.id));
      }, i * 200);
    });
  }, [isInView]);

  useEffect(() => {
    if (!isInView) return;
    let extraIndex = 0;
    const interval = setInterval(() => {
      if (extraIndex < extraMessages.length) {
        const newMsg = {
          ...extraMessages[extraIndex],
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        };
        setMessages((prev) => [...prev.slice(-15), newMsg]);
        setActiveMessageIds((prev) => new Set(prev).add(newMsg.id));
        extraIndex++;
      } else {
        extraIndex = 0;
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        className="flex items-center gap-2 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
      >
        <Radio size={18} className="text-[#00ff41]" />
        <h3 className="text-h3 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
          Agent Communications
        </h3>
        <span className="relative flex h-2 w-2 ml-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff41] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff41]" />
        </span>
      </motion.div>

      <motion.div
        className="gradient-terminal border border-[#1a2d45] rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo, delay: 0.1 }}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-[#0d1117] border-b border-[#1a2d45]">
          <div className="w-3 h-3 rounded-full bg-[#ff3366]" />
          <div className="w-3 h-3 rounded-full bg-[#ffaa00]" />
          <div className="w-3 h-3 rounded-full bg-[#00ff41]" />
          <span className="text-caption text-[#4a6682] ml-2 font-display">agent_feed.log</span>
        </div>

        <div ref={scrollRef} className="p-4 h-[260px] overflow-y-auto scrollbar-thin space-y-1">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: easeExpo }}
                className="text-terminal leading-relaxed py-0.5"
              >
                <span className="text-[#4a6682]">[{msg.time}]</span>{' '}
                <span style={{ color: msg.agentColor, fontWeight: 600 }}>{msg.agent}</span>
                <span className="text-[#4a6682]">: </span>
                <span className="text-[#7da0c4]">{msg.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="text-terminal text-[#00ff41] animate-pulse mt-1">_</div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 10: Daily Challenge Card                                   */
/* ================================================================== */

function DailyChallenge() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState({ hours: 14, minutes: 32, seconds: 18 });
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: easeExpo }}
        className="mb-4"
      >
        <h3 className="text-h3 text-[#e0f2fe]" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
          Daily Challenge
        </h3>
      </motion.div>

      <motion.div
        className="gradient-card border rounded-xl p-6 relative overflow-hidden"
        style={{ borderColor: '#ffaa0060' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, ease: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number], delay: 0.1 }}
      >
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ boxShadow: 'inset 0 0 30px rgba(255, 170, 0, 0.1)' }}
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Trophy size={24} className="text-[#ffaa00]" />
              <h4 className="text-h3 text-[#ffaa00]" style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}>
                Today&apos;s Challenge
              </h4>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ff7b0015] border border-[#ff7b0030]">
              <Clock size={14} className="text-[#ff7b00]" />
              <span className="text-caption font-display font-medium text-[#ff7b00]">
                Resets in {pad(countdown.hours)}:{pad(countdown.minutes)}:{pad(countdown.seconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium"
                  style={{ backgroundColor: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.3)' }}
                >
                  <Crosshair size={12} /> Attacks & Exploits
                </span>
                <span className="text-caption text-[#00ff41] flex items-center gap-1">
                  <Award size={12} /> +50 XP
                </span>
              </div>

              <p className="text-body text-[#e0f2fe] mb-2">
                A penetration tester discovers a web application with an input field vulnerable to SQL injection. 
                The backend uses MySQL. Craft a UNION-based payload to extract the database version.
              </p>

              <p className="text-body-sm text-[#7da0c4] italic">
                Difficulty: Intermediate &bull; Est. time: 10 min
              </p>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => { setAccepted(true); setTimeout(() => navigate('/quiz'), 500); }}
                disabled={accepted}
                className={`px-6 py-3 rounded-lg font-display font-medium text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  accepted
                    ? 'bg-[#00ff41] text-[#0a0e17]'
                    : 'border hover:bg-[#ffaa00] hover:text-[#0a0e17] active:scale-95'
                }`}
                style={
                  accepted
                    ? { boxShadow: '0 0 20px rgba(0, 255, 65, 0.4)' }
                    : { borderColor: '#ffaa00', color: '#ffaa00' }
                }
              >
                {accepted ? (
                  <><CheckCircle size={16} /> Accepted!</>
                ) : (
                  <>Accept Challenge <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Section 11: Recent Activity                                        */
/* ================================================================== */

function RecentActivity() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  const activityConfig: Record<string, { icon: React.ReactNode; bg: string; iconColor: string }> = {
    quiz: { icon: <Brain size={16} />, bg: 'bg-[rgba(0,212,255,0.15)]', iconColor: 'text-[#00d4ff]' },
    correct: { icon: <CheckCircle size={16} />, bg: 'bg-[rgba(0,255,65,0.15)]', iconColor: 'text-[#00ff41]' },
    incorrect: { icon: <XCircle size={16} />, bg: 'bg-[rgba(255,51,102,0.15)]', iconColor: 'text-[#ff3366]' },
    streak: { icon: <Flame size={16} />, bg: 'bg-[rgba(255,123,0,0.15)]', iconColor: 'text-[#ff7b00]' },
    lesson: { icon: <BookOpen size={16} />, bg: 'bg-[rgba(0,212,255,0.15)]', iconColor: 'text-[#00d4ff]' },
    badge: { icon: <Award size={16} />, bg: 'bg-[rgba(139,92,246,0.15)]', iconColor: 'text-[#8b5cf6]' },
  };

  return (
    <section ref={ref} className="px-4 sm:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <motion.h3
          className="text-h3 text-[#e0f2fe]"
          style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: easeExpo }}
        >
          Recent Activity
        </motion.h3>
      </div>

      <motion.div
        className="gradient-card border border-[#1a2d45] rounded-xl overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
      >
        {recentActivities.map((activity, i) => {
          const config = activityConfig[activity.type] || activityConfig.correct;
          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeExpo, delay: i * 0.05 } },
              }}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-[#1a2d45] last:border-b-0 hover:bg-[#111d2e] transition-colors duration-200"
            >
              <div className={`w-9 h-9 rounded-lg ${config.bg} flex items-center justify-center ${config.iconColor} flex-shrink-0`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm text-[#e0f2fe] truncate">{activity.text}</p>
              </div>
              {activity.xp > 0 && (
                <span className="text-caption font-display font-medium text-[#00ff41] flex-shrink-0">
                  +{activity.xp} XP
                </span>
              )}
              <span className="text-caption text-[#4a6682] flex-shrink-0">{activity.time}</span>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}

/* ================================================================== */
/*  Main Profile Component                                             */
/* ================================================================== */

export default function Profile() {
  const [data, setData] = useState<ProfessorsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/professors.json')
      .then((res) => res.json())
      .then((json: ProfessorsData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load professors.json:', err);
        setLoading(false);
      });
  }, []);

  const professorMap = useCallback(() => {
    if (!data) return new Map<string, Professor>();
    const map = new Map<string, Professor>();
    data.professors.forEach((p) => map.set(p.id, p));
    return map;
  }, [data])();

  if (loading) {
    return (
      <div className="relative min-h-[100dvh] flex items-center justify-center">
        <AnimatedGrid />
        <div className="relative z-10 text-center">
          <motion.div
            className="w-12 h-12 border-2 border-[#00ff41] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-body-sm text-[#7da0c4] font-display">Loading Profile...</p>
        </div>
      </div>
    );
  }

  const wings = data?.wings || [];
  const professors = data?.professors || [];

  return (
    <div className="relative min-h-[100dvh] pb-8">
      <AnimatedGrid />
      <div className="relative z-10">
        {/* 1. Student Header */}
        <StudentHeader />

        {/* 2. XP & Level Display */}
        <XPLevelDisplay />

        {/* 3. Skill Tree */}
        <SkillTree />

        {/* 4. Achievement Badges */}
        <AchievementBadges />

        {/* 5. Study Stats */}
        <StudyStats />

        {/* 6. Certification Progress */}
        <CertificationProgress />

        {/* 7. AI Orchestrator Panel */}
        <AIOrchestratorPanel />

        {/* 8. Wing Navigation */}
        <WingNavigation wings={wings} professors={professors} professorMap={professorMap} />

        {/* 9. Daily Challenge */}
        <DailyChallenge />

        {/* 10. Agent Communications */}
        <AgentCommunicationFeed />

        {/* 11. Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
