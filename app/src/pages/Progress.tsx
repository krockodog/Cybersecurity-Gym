// @ts-nocheck
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  Flame,
  Target,
  Clock,
  Lock,
  Award,
  Shield,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import ProgressExportImport from '@/components/ProgressExportImport';
import { ExamStrategist } from '../components/ExamStrategist';

/* ─── easing ─── */
const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
const easeBounce = [0.68, -0.55, 0.265, 1.55] as [number, number, number, number];

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeExpoOut } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeExpoOut } },
};

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const DOMAINS = [
  { name: 'Attacks & Exploits', key: 'attacks_exploits', score: 66, correct: 45, wrong: 23, remaining: 111, color: '#ff3366' },
  { name: 'Planning & Scoping', key: 'planning_scoping', score: 76, correct: 38, wrong: 12, remaining: 105, color: '#ffaa00' },
  { name: 'Information Gathering', key: 'info_gathering', score: 73, correct: 22, wrong: 8, remaining: 70, color: '#00e5ff' },
  { name: 'Tools & Code Analysis', key: 'tools_code', score: 55, correct: 18, wrong: 15, remaining: 87, color: '#a855f7' },
  { name: 'Reporting & Communication', key: 'reporting', score: 69, correct: 8, wrong: 5, remaining: 45, color: '#10b981' },
];

const OVERALL = {
  overallMastery: 64,
  totalQuestionsDone: 234,
  totalQuestions: 727,
  totalStudyHours: 42.25,
  currentStreak: 7,
  examReadiness: 62,
};

const WEEKLY_STUDY = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.0 },
  { day: 'Wed', hours: 0.0 },
  { day: 'Thu', hours: 3.0 },
  { day: 'Fri', hours: 2.0 },
  { day: 'Sat', hours: 3.5 },
  { day: 'Sun', hours: 0.5 },
];

const STUDY_BY_DOMAIN = [
  { name: 'Attacks & Exploits', hours: 14, color: '#ff3366' },
  { name: 'Planning & Scoping', hours: 8, color: '#ffaa00' },
  { name: 'Information Gathering', hours: 7, color: '#00e5ff' },
  { name: 'Tools & Code Analysis', hours: 9, color: '#a855f7' },
  { name: 'Reporting & Communication', hours: 4, color: '#10b981' },
];

const WEAKNESS_DATA: Record<string, Record<string, number>> = {
  attacks_exploits: {
    'SQL Injection': 72,
    XSS: 65,
    'Command Injection': 45,
    'Privilege Escalation': 58,
    'Password Attacks': 80,
    'Network Attacks': 70,
    'Wireless Attacks': 55,
    'Social Engineering': 75,
  },
  planning_scoping: {
    'SOW & Legal': 85,
    'Rules of Engagement': 78,
    Compliance: 70,
    'Testing Types': 82,
    'Impact Analysis': 65,
  },
  info_gathering: {
    'Nmap Scanning': 80,
    'Passive Recon': 75,
    'Vulnerability Scanning': 68,
    'CVSS Scoring': 55,
    'Web App Scanning': 72,
  },
  tools_code: {
    'Python/Scapy': 45,
    PowerShell: 38,
    Wireshark: 62,
    'Burp Suite': 70,
    'Code Analysis': 50,
  },
  reporting: {
    'Executive Summary': 72,
    'CVSS in Reports': 65,
    Remediation: 70,
    'Evidence Collection': 68,
  },
};

const BADGES = [
  { id: 1, name: 'First Blood', color: '#ff3366', description: 'Answer your first question', earnedDate: '2024-02-15', earned: true },
  { id: 2, name: 'Streak Starter', color: '#ff7b00', description: '3-day study streak', earnedDate: '2024-02-20', earned: true },
  { id: 3, name: 'Week Warrior', color: '#ffaa00', description: '7-day study streak', earnedDate: '2024-03-01', earned: true },
  { id: 4, name: 'Month Master', color: '#00ff41', description: '30-day study streak', earnedDate: null, earned: false },
  { id: 5, name: 'Script Kiddie', color: '#00d4ff', description: 'Reach Level 2', earnedDate: '2024-02-18', earned: true },
  { id: 6, name: 'Recon Ranger', color: '#00e5ff', description: 'Reach Level 3', earnedDate: '2024-02-25', earned: true },
  { id: 7, name: 'Payload Artisan', color: '#a855f7', description: 'Reach Level 6', earnedDate: null, earned: false },
  { id: 8, name: 'Shell Shocker', color: '#8b5cf6', description: 'Reach Level 7', earnedDate: null, earned: false },
  { id: 9, name: 'Elite Pentester', color: '#ff3366', description: 'Reach Level 10', earnedDate: null, earned: false },
  { id: 10, name: 'Perfect Score', color: '#00ff41', description: '100% on a PBQ', earnedDate: null, earned: false },
  { id: 11, name: 'Speed Demon', color: '#ffaa00', description: '50 questions in under 30 min', earnedDate: null, earned: false },
  { id: 12, name: 'Hint Minimalist', color: '#00d4ff', description: '25 questions without hints', earnedDate: null, earned: false },
  { id: 13, name: 'Domain Master', color: '#10b981', description: '80%+ in any domain', earnedDate: '2024-03-05', earned: true },
  { id: 14, name: 'All-Rounder', color: '#00ff41', description: '70%+ in all 5 domains', earnedDate: null, earned: false },
  { id: 15, name: 'Exam Ready', color: '#ffaa00', description: '85%+ exam readiness score', earnedDate: null, earned: false },
];

/* ─── helpers ─── */
function getHeatmapColor(value: number): string {
  if (value >= 85) return '#00ff41';
  if (value >= 70) return '#00d4ff';
  if (value >= 55) return '#ffaa00';
  if (value >= 40) return '#ff7b00';
  return '#ff3366';
}

function getHeatmapLabel(value: number): string {
  if (value >= 85) return 'Mastered';
  if (value >= 70) return 'Good';
  if (value >= 55) return 'Improving';
  if (value >= 40) return 'Needs Work';
  return 'Critical';
}

function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — Progress Hero
   ═══════════════════════════════════════════════════════════ */

function AnimatedNumber({ value, suffix = '', color = '#e0f2fe', decimals = 0 }: { value: number; suffix?: string; color?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return (
    <span style={{ color }}>
      {decimals === 0 ? Math.round(display) : display.toFixed(decimals)}{suffix}
    </span>
  );
}

function ProgressHero() {
  const stats = [
    { label: 'Overall Mastery', value: OVERALL.overallMastery, suffix: '%', color: '#00ff41', icon: <Target size={20} /> },
    { label: 'Questions Done', value: OVERALL.totalQuestionsDone, suffix: ` / ${OVERALL.totalQuestions}`, color: '#00d4ff', icon: <BarChart3 size={20} /> },
    { label: 'Study Time', value: OVERALL.totalStudyHours, suffix: '', color: '#00ff41', icon: <Clock size={20} />, isHours: true },
    { label: 'Current Streak', value: OVERALL.currentStreak, suffix: ' days', color: '#ff7b00', icon: <Flame size={20} /> },
  ];

  return (
    <section className="gradient-hero px-8 pt-8 pb-8 border-b border-[#1a2d45]">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpoOut }}
          className="text-h2 text-[#e0f2fe]"
        >
          Progress Report
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeExpoOut, delay: 0.1 }}
        >
          <ProgressExportImport />
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={cardItemVariants}>
            <Card className="bg-gradient-to-br from-[#0d1526] to-[#111d2e] border-[#1a2d45] p-5">
              <div className="flex items-center gap-3 mb-2">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-body-sm text-[#7da0c4] font-body">{s.label}</span>
              </div>
              <div className="font-display text-[2rem] font-bold">
                {s.isHours ? (
                  <span style={{ color: s.color }}>{formatHours(s.value)}</span>
                ) : (
                  <AnimatedNumber value={s.value} suffix={s.suffix} color={s.color} />
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-body text-[#7da0c4] font-body max-w-3xl"
      >
        You&apos;re making solid progress! Your strongest domain is{' '}
        <span style={{ color: '#ffaa00' }}>Planning &amp; Scoping</span>.
        Focus on{' '}
        <span style={{ color: '#a855f7' }}>Tools &amp; Code Analysis</span>{' '}
        to improve your weakest area.
      </motion.p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2 — Domain Mastery
   ═══════════════════════════════════════════════════════════ */

function RadialProgress({ percentage, color, size = 100 }: { percentage: number; color: string; size?: number }) {
  const [progress, setProgress] = useState(0);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    const t = setTimeout(() => setProgress(percentage), 300);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a2d45" strokeWidth={stroke} />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        transform={`rotate(-90 ${cx} ${cy})`}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - (progress / 100) * circumference }}
        transition={{ duration: 1.2, ease: easeExpoOut }}
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={color} fontSize="1.25rem" fontWeight="700" fontFamily="JetBrains Mono, monospace">
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10 overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`M ${data.map((d, i) => `${(i / (data.length - 1)) * 100} ${40 - (d / 100) * 40}`).join(' L ')}`}
        fill={`url(#grad-${color.replace('#', '')})`}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DomainMastery() {
  const sparklineData: Record<string, number[]> = {
    attacks_exploits: [55, 58, 60, 62, 63, 65, 66],
    planning_scoping: [68, 70, 72, 73, 74, 75, 76],
    info_gathering: [65, 67, 68, 70, 71, 72, 73],
    tools_code: [42, 44, 46, 48, 50, 52, 55],
    reporting: [62, 64, 65, 66, 67, 68, 69],
  };

  return (
    <section className="px-8 py-8">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeExpoOut }}
        className="text-h2 text-[#e0f2fe] mb-6"
      >
        Domain Mastery
      </motion.h2>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4"
      >
        {DOMAINS.map((d) => (
          <motion.div key={d.key} variants={cardItemVariants}>
            <Card className="bg-gradient-to-br from-[#0d1526] to-[#111d2e] border-[#1a2d45] p-5 hover:border-opacity-50 transition-all duration-300 hover:-translate-y-0.5 group"
              style={{ borderColor: 'rgba(26, 45, 69, 1)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={18} style={{ color: d.color }} />
                <h3 className="text-h4 text-[#e0f2fe] text-sm">{d.name}</h3>
              </div>

              <div className="flex justify-center mb-3">
                <RadialProgress percentage={d.score} color={d.color} />
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
                <div className="text-[#00ff41] font-display">Correct: {d.correct}</div>
                <div className="text-[#ff3366] font-display">Wrong: {d.wrong}</div>
                <div className="text-[#e0f2fe] font-display">Acc: {d.score}%</div>
                <div className="text-[#7da0c4] font-display">Rem: {d.remaining}</div>
              </div>

              <div className="mb-3 opacity-60">
                <Sparkline data={sparklineData[d.key]} color={d.color} />
              </div>

              <button className="text-caption font-display text-xs flex items-center gap-1 transition-colors duration-200 group-hover:opacity-100 opacity-70"
                style={{ color: d.color }}>
                Study This Domain <ChevronRight size={12} />
              </button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — Weakness Heatmap
   ═══════════════════════════════════════════════════════════ */

function WeaknessHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ topic: string; value: number } | null>(null);

  const domainKeys = Object.keys(WEAKNESS_DATA);
  const allEntries: { topic: string; value: number; domainColor: string; domainName: string }[] = [];
  domainKeys.forEach((key) => {
    const domain = DOMAINS.find((d) => d.key === key);
    Object.entries(WEAKNESS_DATA[key]).forEach(([topic, value]) => {
      allEntries.push({ topic, value, domainColor: domain?.color || '#00d4ff', domainName: domain?.name || '' });
    });
  });

  return (
    <section className="px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeExpoOut }}
      >
        <h2 className="text-h2 text-[#e0f2fe] mb-1">Weakness Heatmap</h2>
        <p className="text-caption text-[#7da0c4] mb-6">Identify your weakest areas to focus your study time</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-wrap gap-2"
      >
        {allEntries.map((entry, i) => {
          const color = getHeatmapColor(entry.value);
          return (
            <motion.div
              key={entry.topic}
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                show: { opacity: 1, scale: 1, transition: { delay: i * 0.02, duration: 0.3, ease: easeExpoOut } },
              }}
              className="relative"
              onMouseEnter={() => setHoveredCell(entry)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              <div
                className="w-[100px] h-[48px] rounded-md flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 hover:ring-1 hover:ring-white"
                style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
              >
                <span className="text-caption text-[#e0f2fe] truncate px-1">{entry.topic}</span>
              </div>
              {hoveredCell?.topic === entry.topic && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0d1526] border border-[#1a2d45] rounded-lg px-3 py-2 shadow-xl z-10 whitespace-nowrap">
                  <div className="text-caption text-[#e0f2fe] font-display">{entry.topic}</div>
                  <div className="text-caption text-[#7da0c4]">{entry.domainName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xp" style={{ color }}>{entry.value}%</span>
                    <span className="text-caption text-[#7da0c4]">{getHeatmapLabel(entry.value)}</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="flex items-center gap-3 mt-6 flex-wrap"
      >
        <span className="text-caption text-[#7da0c4]">Critical</span>
        <div className="flex rounded-full overflow-hidden h-2 w-48">
          <div className="flex-1" style={{ backgroundColor: '#ff3366' }} />
          <div className="flex-1" style={{ backgroundColor: '#ff7b00' }} />
          <div className="flex-1" style={{ backgroundColor: '#ffaa00' }} />
          <div className="flex-1" style={{ backgroundColor: '#00d4ff' }} />
          <div className="flex-1" style={{ backgroundColor: '#00ff41' }} />
        </div>
        <span className="text-caption text-[#7da0c4]">Mastered</span>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — Study Time Tracking
   ═══════════════════════════════════════════════════════════ */

function StudyTimeTracking() {
  const totalWeek = WEEKLY_STUDY.reduce((a, b) => a + b.hours, 0);
  const totalAll = STUDY_BY_DOMAIN.reduce((a, b) => a + b.hours, 0);

  return (
    <section className="px-8 py-8">
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeExpoOut }}
        className="text-h2 text-[#e0f2fe] mb-6"
      >
        Study Time
      </motion.h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-[#0d1526] to-[#111d2e] border-[#1a2d45] p-5">
            <h3 className="text-body-sm text-[#7da0c4] mb-4 font-body">Weekly Study Hours</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={WEEKLY_STUDY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2d45" />
                <XAxis dataKey="day" stroke="#4a6682" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4a6682" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1526', border: '1px solid #1a2d45', borderRadius: '8px' }}
                  itemStyle={{ color: '#e0f2fe', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}
                  formatter={(value: number) => [`${value}h`, 'Hours']}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {WEEKLY_STUDY.map((_, i) => (
                    <Cell key={i} fill="url(#studyGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="studyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#00ff41" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-caption text-[#7da0c4] mt-3 text-center">
              Total this week: <span className="text-[#00ff41] font-display">{formatHours(totalWeek)}</span>
            </p>
          </Card>
        </motion.div>

        {/* Study by Domain */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-br from-[#0d1526] to-[#111d2e] border-[#1a2d45] p-5">
            <h3 className="text-body-sm text-[#7da0c4] mb-4 font-body">Study by Domain</h3>
            <div className="space-y-3">
              {STUDY_BY_DOMAIN.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-caption text-[#e0f2fe] w-[180px] truncate">{d.name}</span>
                  <div className="flex-1 h-4 bg-[#1a2d45] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(d.hours / 16) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: easeExpoOut }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                  </div>
                  <span className="text-xp text-[#e0f2fe] w-12 text-right">{d.hours}h</span>
                </div>
              ))}
            </div>
            <p className="text-caption text-[#7da0c4] mt-4 text-center">
              Total: <span className="text-[#00ff41] font-display">{formatHours(totalAll)}</span>
            </p>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — Achievement Badges
   ═══════════════════════════════════════════════════════════ */

function BadgeCard({ badge }: { badge: typeof BADGES[0] }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeBounce } },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-xl p-3 text-center transition-all duration-300 ${
        badge.earned
          ? 'border'
          : 'border border-[#1a2d45] opacity-50 grayscale'
      }`}
      style={badge.earned ? {
        backgroundColor: '#0d1526',
        borderColor: badge.color,
        boxShadow: isHovered ? `0 0 20px ${badge.color}30` : 'none',
      } : {
        backgroundColor: '#0d1526',
      }}
    >
      {/* Glow pulse for earned */}
      {badge.earned && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `0 0 15px ${badge.color}20` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-10">
        <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center"
          style={badge.earned ? { backgroundColor: `${badge.color}15`, color: badge.color } : { color: '#4a6682' }}>
          {badge.earned ? <Award size={24} /> : <Lock size={20} />}
        </div>
        <div className="text-caption font-display text-[#e0f2fe] truncate mb-1" style={badge.earned ? {} : { color: '#4a6682' }}>
          {badge.earned ? badge.name : '???'}
        </div>
        {badge.earned && (
          <>
            <div className="text-[0.625rem] text-[#7da0c4] leading-tight mb-1 line-clamp-2">{badge.description}</div>
            {badge.earnedDate && (
              <div className="text-[0.625rem] text-[#4a6682]">
                Earned {new Date(badge.earnedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

function AchievementBadges() {
  const earnedCount = BADGES.filter((b) => b.earned).length;

  return (
    <section className="px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeExpoOut }}
      >
        <h2 className="text-h2 text-[#e0f2fe] mb-1">Achievements</h2>
        <p className="text-caption text-[#7da0c4] mb-6">{earnedCount}/{BADGES.length} unlocked</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3"
      >
        {BADGES.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — Exam Readiness Gauge
   ═══════════════════════════════════════════════════════════ */

function ExamReadinessGauge() {
  const [progress, setProgress] = useState(0);
  const score = OVERALL.examReadiness;

  useEffect(() => {
    const t = setTimeout(() => setProgress(score), 500);
    return () => clearTimeout(t);
  }, [score]);

  // Semi-circular gauge SVG
  const size = 220;
  const cx = size / 2;
  const cy = size * 0.75;
  const r = size * 0.35;
  const strokeWidth = 12;
  const arcLength = Math.PI * r;

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#00ff41';
    if (s >= 60) return '#ffaa00';
    return '#ff3366';
  };

  const scoreColor = getScoreColor(progress);

  return (
    <section className="px-8 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeExpoOut }}
      >
        <Card className="bg-gradient-to-br from-[#0d1526] to-[#111d2e] border-[#1a2d45] p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Gauge */}
            <div className="flex-shrink-0">
              <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
                {/* Track */}
                <path
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none"
                  stroke="#1a2d45"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                {/* Fill */}
                <motion.path
                  d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={arcLength}
                  initial={{ strokeDashoffset: arcLength }}
                  animate={{ strokeDashoffset: arcLength - (progress / 100) * arcLength }}
                  transition={{ duration: 1.5, ease: easeExpoOut }}
                />
                {/* Needle */}
                <motion.line
                  x1={cx} y1={cy} x2={cx} y2={cy - r + strokeWidth}
                  stroke={scoreColor}
                  strokeWidth={3}
                  strokeLinecap="round"
                  initial={{ transform: `rotate(-90deg, ${cx}, ${cy})` }}
                  animate={{ transform: `rotate(${-90 + (progress / 100) * 180}deg, ${cx}, ${cy})` }}
                  transition={{ duration: 1.5, ease: easeExpoOut }}
                />
                {/* Center dot */}
                <circle cx={cx} cy={cy} r={5} fill={scoreColor} />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff3366" />
                    <stop offset="50%" stopColor="#ffaa00" />
                    <stop offset="100%" stopColor="#00ff41" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="text-center -mt-4">
                <div className="font-display text-[2.5rem] font-extrabold" style={{ color: scoreColor }}>
                  {Math.round(progress)}%
                </div>
                <div className="text-h4 text-[#e0f2fe]">Exam Readiness</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 w-full">
              <h3 className="text-h4 text-[#e0f2fe] mb-4">Readiness Breakdown</h3>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#111d2e] border border-[#1a2d45] flex items-center justify-center">
                    <BarChart3 size={16} className="text-[#00d4ff]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-body-sm text-[#e0f2fe]">Question Coverage</div>
                    <div className="text-caption text-[#7da0c4]">{Math.round((OVERALL.totalQuestionsDone / OVERALL.totalQuestions) * 100)}% of {OVERALL.totalQuestions} questions attempted</div>
                    <div className="h-1.5 bg-[#1a2d45] rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-[#00d4ff] rounded-full transition-all duration-1000"
                        style={{ width: `${(OVERALL.totalQuestionsDone / OVERALL.totalQuestions) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#111d2e] border border-[#1a2d45] flex items-center justify-center">
                    <Target size={16} className="text-[#ff3366]" />
                  </div>
                  <div>
                    <div className="text-body-sm text-[#e0f2fe]">Domain Balance</div>
                    <div className="text-caption text-[#7da0c4]">Weakest: <span style={{ color: '#a855f7' }}>Tools &amp; Code Analysis (55%)</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#111d2e] border border-[#1a2d45] flex items-center justify-center">
                    <TrendingUp size={16} className="text-[#00ff41]" />
                  </div>
                  <div>
                    <div className="text-body-sm text-[#e0f2fe]">Accuracy Trend</div>
                    <div className="text-caption text-[#00ff41]">+5% this week</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1a2d45] pt-4">
                <h4 className="text-h4 text-[#e0f2fe] mb-3">Recommended Next Steps</h4>
                <ol className="space-y-2">
                  {[
                    'Study Tools & Code Analysis — your weakest domain',
                    'Complete the Firewall Rules PBQ scenario',
                    'Review 80/20 hints for SQL Injection questions',
                  ].map((rec, i) => (
                    <li key={i} className="flex items-center gap-3 text-body-sm text-[#7da0c4]">
                      <span className="w-5 h-5 rounded-full bg-[#111d2e] border border-[#1a2d45] flex items-center justify-center text-[0.625rem] text-[#e0f2fe] font-display flex-shrink-0">
                        {i + 1}
                      </span>
                      {rec}
                      <button className="text-[#00d4ff] text-caption font-display ml-auto hover:underline">Go →</button>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-4 text-body-sm text-[#7da0c4]">
                At your current pace, you&apos;ll be exam-ready by{' '}
                <span className="font-display text-[#00ff41]">May 15, 2025</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function Progress() {
  return (
    <main className="min-h-screen bg-[#0a0e17]">
      <ProgressHero />
      <DomainMastery />
      <WeaknessHeatmap />
      <StudyTimeTracking />
      <AchievementBadges />
      <ExamReadinessGauge />
      <ExamStrategist />
    </main>
  );
}
