/* ═══════════════════════════════════════════
   Adaptive Learning Dashboard Panel

   Shows: Today's focus, weakness heatmap,
   learning path progress, and AI-driven
   recommendations for the student.
   ═══════════════════════════════════════════ */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Zap,
  BookOpen,
  Clock,
  ChevronRight,
  CheckCircle2,
  Circle,
  Flame,
  BarChart3,
  Lightbulb,
  Dumbbell,
  Layers,
} from 'lucide-react';
import {
  useAdaptiveLearning,
  type PathItem,
  type Milestone,
  type DailyTarget,
} from '../services/adaptive-learning';

/* ─── easing ─── */
const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

/* ─── Animation variants ─── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeExpoOut } },
};

/* ─── Color helpers ─── */
function getUrgencyColor(urgency: number): string {
  if (urgency >= 0.5) return '#ff3366';
  if (urgency >= 0.3) return '#ff7b00';
  if (urgency >= 0.15) return '#ffaa00';
  return '#00ff41';
}

function getUrgencyLabel(urgency: number): string {
  if (urgency >= 0.5) return 'Critical';
  if (urgency >= 0.3) return 'High';
  if (urgency >= 0.15) return 'Moderate';
  return 'On Track';
}

function getReadinessColor(score: number): string {
  if (score >= 0.8) return '#00ff41';
  if (score >= 0.6) return '#ffaa00';
  return '#ff3366';
}

function getReadinessLabel(score: number): string {
  if (score >= 0.8) return 'Ready';
  if (score >= 0.6) return 'Getting There';
  if (score >= 0.4) return 'Needs Work';
  return 'Just Starting';
}

/* ─── Animated number ─── */
function AnimatedNumber({
  value,
  suffix = '',
  decimals = 0,
  color = '#e0f2fe',
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  color?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
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
      {decimals === 0 ? Math.round(display) : display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SECTION 1 — AI Learning Hero
   ═══════════════════════════════════════════ */

function AiLearningHero({
  examReadiness,
  dailyQuestions,
  weakDomainCount,
  streak,
}: {
  examReadiness: number;
  dailyQuestions: number;
  weakDomainCount: number;
  streak: number;
}) {
  const readinessPct = Math.round(examReadiness * 100);

  return (
    <motion.div
      variants={cardItemVariants}
      className="relative overflow-hidden rounded-xl border border-[#00ff41]/20 bg-gradient-to-br from-[#0d1526] to-[#111d2e] p-6"
    >
      {/* Decorative background pulse */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#00ff41]/5 blur-3xl" />

      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00ff41]/30 bg-[#00ff41]/10">
            <Brain className="text-[#00ff41]" size={22} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#e0f2fe]">
              AI Learning Intelligence
            </h2>
            <p className="text-caption text-[#7da0c4]">
              Personalized path based on your performance
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full border border-[#00ff41]/30 bg-[#00ff41]/10 px-3 py-1">
            <Zap size={12} className="text-[#00ff41]" />
            <span className="text-xs font-medium text-[#00ff41]">Adaptive</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[#1a2d45] bg-[#0a0e17]/60 p-3 text-center">
            <div className="font-display text-2xl font-bold">
              <AnimatedNumber value={readinessPct} suffix="%" color={getReadinessColor(examReadiness)} />
            </div>
            <div className="text-caption text-[#7da0c4]">Exam Ready</div>
          </div>
          <div className="rounded-lg border border-[#1a2d45] bg-[#0a0e17]/60 p-3 text-center">
            <div className="font-display text-2xl font-bold text-[#00d4ff]">
              <AnimatedNumber value={dailyQuestions} />
            </div>
            <div className="text-caption text-[#7da0c4]">Daily Target</div>
          </div>
          <div className="rounded-lg border border-[#1a2d45] bg-[#0a0e17]/60 p-3 text-center">
            <div className="font-display text-2xl font-bold text-[#ff7b00]">
              {weakDomainCount}
            </div>
            <div className="text-caption text-[#7da0c4]">Weak Domains</div>
          </div>
          <div className="rounded-lg border border-[#1a2d45] bg-[#0a0e17]/60 p-3 text-center">
            <div className="font-display text-2xl font-bold text-[#ffaa00]">
              {streak}
            </div>
            <div className="text-caption text-[#7da0c4]">Day Streak</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 2 — Today's Focus Card
   ═══════════════════════════════════════════ */

function TodaysFocusCard({
  todaysFocus,
  examReadiness,
}: {
  todaysFocus: DailyTarget;
  examReadiness: number;
}) {
  return (
    <motion.div
      variants={cardItemVariants}
      className="rounded-xl border border-[#00ff41]/30 bg-gradient-to-br from-[#0d1526] to-[#162236] p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <Target className="text-[#00ff41]" size={22} />
        <h3 className="font-display text-xl font-bold text-[#e0f2fe]">
          Today&apos;s Focus
        </h3>
        <span className="ml-auto rounded-full border border-[#1a2d45] bg-[#111d2e] px-2.5 py-0.5 text-xs text-[#7da0c4]">
          {todaysFocus.date}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="text-center">
          <div className="font-display text-3xl font-bold text-[#00ff41]">
            {todaysFocus.questions}
          </div>
          <div className="text-sm text-[#7da0c4]">Questions</div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl font-bold text-[#00d4ff]">
            {todaysFocus.domains.length}
          </div>
          <div className="text-sm text-[#7da0c4]">Domains</div>
        </div>
        <div className="text-center">
          <div className="font-display text-3xl font-bold" style={{ color: getReadinessColor(examReadiness) }}>
            {Math.round(examReadiness * 100)}%
          </div>
          <div className="text-sm text-[#7da0c4]">Exam Ready</div>
        </div>
        <div className="text-center">
          <div
            className="font-display text-3xl font-bold"
            style={{ color: todaysFocus.pbqPractice ? '#ec4899' : '#4a6682' }}
          >
            {todaysFocus.pbqPractice ? 'Yes' : 'No'}
          </div>
          <div className="text-sm text-[#7da0c4]">PBQ Practice</div>
        </div>
      </div>

      {/* Focus domains */}
      {todaysFocus.domains.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm text-[#7da0c4]">Priority Domains</div>
          <div className="flex flex-wrap gap-2">
            {todaysFocus.domains.map((domain, i) => (
              <span
                key={i}
                className="rounded-full border border-[#00d4ff]/30 bg-[#00d4ff]/10 px-3 py-1 text-sm text-[#00d4ff]"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Focus areas */}
      {todaysFocus.focusAreas.length > 0 && (
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm text-[#7da0c4]">
            <Lightbulb size={14} className="text-[#ffaa00]" />
            Focus Areas
          </div>
          <div className="flex flex-wrap gap-2">
            {todaysFocus.focusAreas.map((area, i) => (
              <span
                key={i}
                className="rounded-full border border-[#00ff41]/30 bg-[#00ff41]/10 px-3 py-1 text-sm text-[#00ff41]"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 3 — Weakness Alert
   ═══════════════════════════════════════════ */

function WeaknessAlert({
  weakDomains,
}: {
  weakDomains: [string, number][];
}) {
  if (weakDomains.length === 0) {
    return (
      <motion.div
        variants={cardItemVariants}
        className="flex items-center gap-3 rounded-xl border border-[#00ff41]/20 bg-gradient-to-r from-[#00ff41]/5 to-[#00d4ff]/5 p-4"
      >
        <CheckCircle2 className="shrink-0 text-[#00ff41]" size={24} />
        <div>
          <h4 className="font-semibold text-[#00ff41]">All Domains Strong</h4>
          <p className="text-sm text-[#7da0c4]">
            You&apos;re doing great! Focus on retention with spaced repetition.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardItemVariants}
      className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-900/20 to-orange-900/20 p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <AlertTriangle className="shrink-0 text-red-400" size={22} />
        <div>
          <h4 className="font-semibold text-red-300">Focus Areas Detected</h4>
          <p className="text-sm text-red-200/70">
            {weakDomains.length} domain{weakDomains.length > 1 ? 's' : ''} need attention.
            The AI has prioritized these in your learning path.
          </p>
        </div>
      </div>

      {/* Weak domain bars */}
      <div className="space-y-2">
        {weakDomains.slice(0, 4).map(([domain, weakness]) => {
          const weaknessPct = Math.round(weakness * 100);
          return (
            <div key={domain} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-[#e0f2fe]">{domain}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1a2d45]">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: getUrgencyColor(weakness),
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${weaknessPct}%` }}
                  transition={{ duration: 1, ease: easeExpoOut }}
                />
              </div>
              <span
                className="w-16 shrink-0 text-right text-xs font-medium"
                style={{ color: getUrgencyColor(weakness) }}
              >
                {getUrgencyLabel(weakness)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 4 — Priority Queue
   ═══════════════════════════════════════════ */

function PriorityQueueSection({ queue }: { queue: PathItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const displayItems = expanded ? queue : queue.slice(0, 4);

  if (queue.length === 0) {
    return (
      <motion.div variants={cardItemVariants} className="rounded-xl border border-[#1a2d45] bg-[#0d1526]/60 p-6 text-center">
        <Layers size={32} className="mx-auto mb-2 text-[#4a6682]" />
        <p className="text-sm text-[#7da0c4]">No priority items yet. Start answering questions to build your learning path.</p>
      </motion.div>
    );
  }

  return (
    <motion.div variants={cardItemVariants}>
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 size={18} className="text-[#00d4ff]" />
        <h3 className="font-display text-lg font-bold text-[#e0f2fe]">
          Learning Priority Queue
        </h3>
        <span className="rounded-full bg-[#1a2d45] px-2 py-0.5 text-xs text-[#7da0c4]">
          {queue.length} items
        </span>
      </div>

      <div className="space-y-2">
        {displayItems.map((item, i) => (
          <motion.div
            key={`${item.domain}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            className="group flex items-center gap-3 rounded-lg border border-[#1a2d45] bg-[#0d1526]/80 p-3 transition-colors hover:border-[#00d4ff]/30"
          >
            {/* Rank */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#111d2e] font-display text-xs font-bold text-[#7da0c4]">
              {i + 1}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-[#e0f2fe]">
                  {item.domain}
                </span>
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
                  style={{
                    backgroundColor: `${getUrgencyColor(item.urgency)}15`,
                    color: getUrgencyColor(item.urgency),
                    border: `1px solid ${getUrgencyColor(item.urgency)}30`,
                  }}
                >
                  {getUrgencyLabel(item.urgency)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#7da0c4]">
                <span>{item.subdomain}</span>
                <span className="text-[#4a6682]">|</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  {item.estimatedTime} min
                </span>
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight
              size={16}
              className="shrink-0 text-[#4a6682] transition-transform group-hover:translate-x-1 group-hover:text-[#00d4ff]"
            />
          </motion.div>
        ))}
      </div>

      {queue.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 w-full rounded-lg border border-[#1a2d45] py-2 text-center text-sm text-[#7da0c4] transition-colors hover:border-[#00d4ff]/30 hover:text-[#00d4ff]"
        >
          {expanded ? 'Show less' : `Show all ${queue.length} items`}
        </button>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 5 — Milestones
   ═══════════════════════════════════════════ */

function MilestonesSection({ milestones }: { milestones: Milestone[] }) {
  return (
    <motion.div variants={cardItemVariants}>
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={18} className="text-[#00ff41]" />
        <h3 className="font-display text-lg font-bold text-[#e0f2fe]">
          Milestones
        </h3>
      </div>

      <div className="space-y-3">
        {milestones.map((milestone, i) => (
          <div
            key={i}
            className="rounded-lg border border-[#1a2d45] bg-[#0d1526]/80 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {milestone.completed ? (
                  <CheckCircle2 size={18} className="text-[#00ff41]" />
                ) : (
                  <Circle size={18} className="text-[#4a6682]" />
                )}
                <span
                  className={`font-display text-sm font-bold ${
                    milestone.completed ? 'text-[#00ff41]' : 'text-[#e0f2fe]'
                  }`}
                >
                  {milestone.name}
                </span>
              </div>
              <span className="text-xs text-[#7da0c4]">{milestone.targetDate}</span>
            </div>
            <p className="mb-2 text-xs text-[#7da0c4]">{milestone.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {milestone.requirements.map((req, j) => (
                <span
                  key={j}
                  className="rounded-full border border-[#1a2d45] bg-[#111d2e] px-2 py-0.5 text-[0.65rem] text-[#7da0c4]"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   SECTION 6 — Quick Actions
   ═══════════════════════════════════════════ */

function QuickActions() {
  const actions = [
    {
      icon: <Dumbbell size={16} className="text-[#00ff41]" />,
      label: 'Weak Area Drill',
      description: 'Focus on your weakest topics',
      color: '#00ff41',
    },
    {
      icon: <BookOpen size={16} className="text-[#00d4ff]" />,
      label: 'Daily Quiz',
      description: 'Adaptive mixed-domain practice',
      color: '#00d4ff',
    },
    {
      icon: <Flame size={16} className="text-[#ff7b00]" />,
      label: 'PBQ Practice',
      description: 'Performance-based scenarios',
      color: '#ff7b00',
    },
    {
      icon: <Brain size={16} className="text-[#a855f7]" />,
      label: 'AI Tutor',
      description: 'Get personalized help',
      color: '#a855f7',
    },
  ];

  return (
    <motion.div variants={cardItemVariants}>
      <div className="mb-3 flex items-center gap-2">
        <Zap size={18} className="text-[#ffaa00]" />
        <h3 className="font-display text-lg font-bold text-[#e0f2fe]">
          Quick Actions
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className="group flex items-start gap-2.5 rounded-lg border border-[#1a2d45] bg-[#0d1526]/80 p-3 text-left transition-all hover:border-[#00d4ff]/30 hover:bg-[#111d2e]"
          >
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border"
              style={{
                borderColor: `${action.color}30`,
                backgroundColor: `${action.color}10`,
              }}
            >
              {action.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-[#e0f2fe] group-hover:text-[#00d4ff]">
                {action.label}
              </div>
              <div className="text-xs text-[#7da0c4]">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PANEL
   ═══════════════════════════════════════════ */

export function AdaptiveLearningPanel() {
  const { state, todaysFocus } = useAdaptiveLearning();

  const weakDomains = useMemo(
    () => Array.from(state.weakDomains.entries()).sort((a, b) => b[1] - a[1]),
    [state.weakDomains]
  );

  const priorityQueue = useMemo(
    () =>
      Array.from(state.weakDomains.entries())
        .sort((a, b) => b[1] - a[1])
        .map(
          ([domain, weakness]): PathItem => ({
            domain,
            subdomain: getWeakestSubdomainStatic(domain),
            topic: getRecommendedTopicStatic(domain),
            urgency: Math.round(weakness * 100) / 100,
            estimatedTime: getStudyTimeStatic(domain),
            resources: [],
          })
        ),
    [state.weakDomains]
  );

  // Build static milestones for display
  const milestones: Milestone[] = useMemo(() => {
    const daysUntilExam = 30;
    const now = new Date();
    return [
      {
        name: 'Foundation Complete',
        description: 'Score 70%+ in all domains',
        targetDate: new Date(now.getTime() + daysUntilExam * 0.3 * 86400000).toISOString().split('T')[0],
        requirements: ['70% in Planning & Scoping', '70% in Info Gathering', '70% in Attacks'],
        completed: state.examReadiness > 0.7,
      },
      {
        name: 'Attack Mastery',
        description: 'Master Attacks and Exploits domain',
        targetDate: new Date(now.getTime() + daysUntilExam * 0.5 * 86400000).toISOString().split('T')[0],
        requirements: ['80% in Attacks & Exploits', 'Complete 5 PBQs'],
        completed: state.examReadiness > 0.8,
      },
      {
        name: 'Vuln Assessment Ready',
        description: 'Demonstrate scanning & validation skills',
        targetDate: new Date(now.getTime() + daysUntilExam * 0.65 * 86400000).toISOString().split('T')[0],
        requirements: ['75% in Vulnerability Assessment'],
        completed: false,
      },
      {
        name: 'Exam Ready',
        description: 'Consistently score 85%+ across all domains',
        targetDate: new Date(now.getTime() + daysUntilExam * 0.8 * 86400000).toISOString().split('T')[0],
        requirements: ['85% overall readiness', 'All domains 75%+'],
        completed: state.examReadiness >= 0.85,
      },
    ];
  }, [state.examReadiness]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="space-y-6"
    >
      <AiLearningHero
        examReadiness={state.examReadiness}
        dailyQuestions={state.recommendedDailyQuestions}
        weakDomainCount={weakDomains.length}
        streak={state.streakData.current}
      />

      <TodaysFocusCard todaysFocus={todaysFocus} examReadiness={state.examReadiness} />

      <WeaknessAlert weakDomains={weakDomains} />

      <PriorityQueueSection queue={priorityQueue} />

      <MilestonesSection milestones={milestones} />

      <QuickActions />
    </motion.div>
  );
}

/* ─── Static helpers (for useMemo) ───────── */

function getWeakestSubdomainStatic(domain: string): string {
  const map: Record<string, string[]> = {
    'Planning and Scoping': ['SOW & Legal', 'Rules of Engagement', 'Compliance'],
    'Information Gathering': ['Nmap Scanning', 'Passive Recon', 'Vulnerability Scanning'],
    'Attacks and Exploits': ['SQL Injection', 'XSS', 'Command Injection', 'Privilege Escalation'],
    'Vulnerability Assessment': ['Scanning Methods', 'Vuln Validation', 'Risk Prioritization'],
    'Reporting and Communication': ['Executive Summary', 'CVSS in Reports', 'Remediation'],
    'Tools and Code Analysis': ['Python/Scapy', 'PowerShell', 'Wireshark', 'Burp Suite'],
  };
  const subs = map[domain] || ['General'];
  return subs[domain.length % subs.length];
}

function getRecommendedTopicStatic(domain: string): string {
  const topics: Record<string, string> = {
    'Planning and Scoping': 'Scope management & legal compliance',
    'Information Gathering': 'Active & passive reconnaissance',
    'Attacks and Exploits': 'Injection attacks & privilege escalation',
    'Vulnerability Assessment': 'Scanning methods & risk prioritization',
    'Reporting and Communication': 'Executive summaries & CVSS scoring',
    'Tools and Code Analysis': 'Scripting & traffic analysis',
  };
  return topics[domain] || 'General review';
}

function getStudyTimeStatic(domain: string): number {
  const times: Record<string, number> = {
    'Planning and Scoping': 25,
    'Information Gathering': 35,
    'Attacks and Exploits': 45,
    'Vulnerability Assessment': 30,
    'Reporting and Communication': 20,
    'Tools and Code Analysis': 40,
  };
  return times[domain] || 30;
}
