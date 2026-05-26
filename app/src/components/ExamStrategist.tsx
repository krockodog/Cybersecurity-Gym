import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Timer, Target, Brain, TrendingUp, Award,
  Calendar, Zap, BookOpen, AlertCircle, CheckCircle
} from 'lucide-react';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface Milestone {
  week: number;
  title: string;
  target: string;
  completed: boolean;
}

interface StudyPlan {
  examDate: Date;
  daysRemaining: number;
  dailyTarget: number;
  weeklyMilestones: Milestone[];
  overallProgress: number;
}

/* ================================================================== */
/*  30-60-90 Day Study Plans                                           */
/* ================================================================== */

const STUDY_PLANS: Record<string, StudyPlan> = {
  '30-day': {
    examDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    daysRemaining: 30,
    dailyTarget: 40,
    weeklyMilestones: [
      { week: 1, title: 'Foundation Sprint', target: 'Complete all domain quizzes once', completed: false },
      { week: 2, title: 'Weakness Attack', target: 'Focus on sub-70% domains', completed: false },
      { week: 3, title: 'PBQ Mastery', target: 'Complete all PBQ simulations', completed: false },
      { week: 4, title: 'Exam Simulation', target: '3 full exams at 85%+', completed: false }
    ],
    overallProgress: 0
  },
  '60-day': {
    examDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    daysRemaining: 60,
    dailyTarget: 25,
    weeklyMilestones: [
      { week: 1, title: 'Domain Exploration', target: 'Complete all domains', completed: false },
      { week: 2, title: 'Deep Dive', target: 'Master 2 weakest domains', completed: false },
      { week: 3, title: 'PBQ Introduction', target: 'Complete 5 PBQs', completed: false },
      { week: 4, title: 'Midpoint Review', target: 'First full exam simulation', completed: false },
      { week: 5, title: 'Advanced Topics', target: 'Master remaining weak areas', completed: false },
      { week: 6, title: 'Final Sprint', target: '3 full exams at 85%+', completed: false }
    ],
    overallProgress: 0
  },
  '90-day': {
    examDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    daysRemaining: 90,
    dailyTarget: 15,
    weeklyMilestones: [
      { week: 1, title: 'Orientation', target: 'Complete 1 quiz per domain', completed: false },
      { week: 2, title: 'Building Foundations', target: 'All domains above 60%', completed: false },
      { week: 3, title: 'Deep Learning', target: 'Focus on weakest domain', completed: false },
      { week: 4, title: 'PBQ Practice', target: 'Complete 3 PBQs', completed: false },
      { week: 5, title: 'First Checkpoint', target: 'Full exam at 70%+', completed: false },
      { week: 6, title: 'Strengthening', target: 'All domains above 75%', completed: false },
      { week: 7, title: 'Intensive PBQs', target: 'All PBQ types completed', completed: false },
      { week: 8, title: 'Mock Exams', target: '2 full exams at 80%+', completed: false },
      { week: 9, title: 'Final Review', target: 'All domains above 85%', completed: false },
      { week: 10, title: 'Exam Readiness', target: '3 consecutive 85%+ exams', completed: false }
    ],
    overallProgress: 0
  }
};

/* ================================================================== */
/*  Exam Day Tips Data                                                 */
/* ================================================================== */

const EXAM_TIPS = [
  { icon: Timer, text: 'You have 165 minutes for 85 questions — ~1.9 min per question' },
  { icon: AlertCircle, text: 'Flag uncertain questions and review at the end' },
  { icon: Target, text: 'PBQs first — they\'re worth more points' },
  { icon: Brain, text: 'Get 8 hours of sleep before exam day' },
  { icon: Award, text: 'Passing score is 750/900 (~83%) — aim for 85%' },
  { icon: TrendingUp, text: 'Review flagged questions 3 times before the exam' }
];

/* ================================================================== */
/*  Sub-component: CountdownTimer                                      */
/* ================================================================== */

function CountdownTimer({ targetDate }: { targetDate: Date | null }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const target = targetDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.minutes },
        { label: 'Secs', value: timeLeft.seconds },
      ].map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-[#0a0e17] border border-[#1a2d45] rounded-lg py-2">
            <div className="text-2xl font-bold text-[#00ff41] font-mono">
              {unit.value > 99 ? unit.value : pad(unit.value)}
            </div>
          </div>
          <div className="text-caption text-[#7da0c4] mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Sub-component: StudyPlanSelector                                   */
/* ================================================================== */

function StudyPlanSelector({
  selectedPlan,
  onPlanChange,
}: {
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
}) {
  return (
    <div className="flex gap-2 mt-4 justify-center flex-wrap">
      {Object.keys(STUDY_PLANS).map((planKey) => (
        <button
          key={planKey}
          onClick={() => onPlanChange(planKey)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedPlan === planKey
              ? 'bg-[#00ff41] text-[#0a0e17]'
              : 'bg-[#162236] text-[#7da0c4] border border-[#1a2d45] hover:border-[#00d4ff]/30'
          }`}
        >
          {planKey.replace('-', ' ')}
        </button>
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Sub-component: MilestoneTracker                                    */
/* ================================================================== */

function MilestoneTracker({
  milestones,
  show,
}: {
  milestones: Milestone[];
  show: boolean;
}) {
  const [milestoneState, setMilestoneState] = useState<Milestone[]>(milestones);

  useEffect(() => {
    setMilestoneState(milestones);
  }, [milestones]);

  const toggleMilestone = (index: number) => {
    setMilestoneState((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      return updated;
    });
  };

  const completedCount = milestoneState.filter((m) => m.completed).length;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#e0f2fe] flex items-center gap-2">
              <Target size={18} className="text-[#fbbf24]" />
              Study Plan Milestones
            </h3>
            <span className="text-caption text-[#7da0c4]">
              {completedCount}/{milestoneState.length} completed
            </span>
          </div>

          {/* Milestone progress bar */}
          <div className="h-2 bg-[#0a0e17] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / milestoneState.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#fbbf24] to-[#00ff41] rounded-full"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            />
          </div>

          {milestoneState.map((milestone, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              onClick={() => toggleMilestone(i)}
              className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                milestone.completed
                  ? 'bg-green-900/20 border-green-500/30'
                  : 'bg-[#0d1526] border-[#1a2d45] hover:border-[#00d4ff]/30'
              }`}
            >
              <div
                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  milestone.completed
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-[#162236] text-[#7da0c4]'
                }`}
              >
                {milestone.completed ? <CheckCircle size={18} /> : <span className="text-sm">{milestone.week}</span>}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium transition-all ${milestone.completed ? 'text-green-400 line-through' : 'text-[#e0f2fe]'}`}>
                  {milestone.title}
                </h4>
                <p className="text-sm text-[#7da0c4]">{milestone.target}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================================================================== */
/*  Sub-component: DailyTargetCard                                     */
/* ================================================================== */

function DailyTargetCard({
  dailyTarget,
  selectedPlan,
  overallProgress,
  daysLeft,
}: {
  dailyTarget: number;
  selectedPlan: string;
  overallProgress: number;
  daysLeft: number;
}) {
  const [todayProgress, setTodayProgress] = useState(() => {
    const saved = localStorage.getItem('trygit_daily_progress');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      if (data.date === today) return data.answered;
    }
    return 0;
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('trygit_daily_progress', JSON.stringify({ date: today, answered: todayProgress }));
  }, [todayProgress]);

  const progressPercent = Math.min((todayProgress / dailyTarget) * 100, 100);
  const isMet = todayProgress >= dailyTarget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.2 }}
      className="bg-gradient-to-r from-[#162236] to-[#0d1526] border border-[#1a2d45] rounded-xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Zap className="text-[#fbbf24]" size={24} />
          <div>
            <h4 className="font-semibold text-[#e0f2fe]">Daily Target</h4>
            <p className="text-sm text-[#7da0c4]">Based on your {selectedPlan.replace('-', ' ')} plan</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#fbbf24]">
            {todayProgress}/{dailyTarget}
          </div>
          <div className="text-sm text-[#7da0c4]">questions/day</div>
        </div>
      </div>

      {/* Quick adjust buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => setTodayProgress((p: number) => Math.max(0, p - 5))}
          className="px-3 py-1 bg-[#0a0e17] border border-[#1a2d45] rounded text-sm text-[#7da0c4] hover:text-[#e0f2fe] transition-colors"
        >
          -5
        </button>
        <button
          onClick={() => setTodayProgress((p: number) => p + 5)}
          className="px-3 py-1 bg-[#0a0e17] border border-[#1a2d45] rounded text-sm text-[#7da0c4] hover:text-[#e0f2fe] transition-colors"
        >
          +5
        </button>
        <button
          onClick={() => setTodayProgress((p: number) => p + 10)}
          className="px-3 py-1 bg-[#0a0e17] border border-[#1a2d45] rounded text-sm text-[#7da0c4] hover:text-[#e0f2fe] transition-colors"
        >
          +10
        </button>
        {isMet && (
          <span className="flex items-center gap-1 text-green-400 text-sm font-medium ml-auto">
            <CheckCircle size={14} /> Target met!
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="h-2 bg-[#0a0e17] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className={`h-full rounded-full ${
              isMet
                ? 'bg-gradient-to-r from-[#00ff41] to-[#00d4ff]'
                : 'bg-gradient-to-r from-[#fbbf24] to-[#ff7b00]'
            }`}
          />
        </div>
        <div className="flex justify-between mt-1 text-sm">
          <span className="text-[#7da0c4]">{Math.round(progressPercent)}% of daily goal</span>
          <span className="text-[#7da0c4]">{daysLeft} days left</span>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Sub-component: ExamTipsGrid                                        */
/* ================================================================== */

function ExamTipsGrid() {
  return (
    <div className="bg-gradient-to-br from-[#0d1526] to-[#162236] border border-[#1a2d45] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-[#e0f2fe] mb-4 flex items-center gap-2">
        <BookOpen size={18} className="text-[#00d4ff]" />
        Exam Day Tips
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {EXAM_TIPS.map((tip, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="flex items-start gap-3 p-3 bg-[#162236]/50 rounded-lg hover:bg-[#162236] transition-colors"
          >
            <tip.icon size={18} className="text-[#00d4ff] shrink-0 mt-0.5" />
            <span className="text-sm text-[#e0f2fe]">{tip.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Sub-component: MotivationalQuote                                   */
/* ================================================================== */

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

function MotivationalQuote() {
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const saved = localStorage.getItem('trygit_quote_index');
    const savedDate = localStorage.getItem('trygit_quote_date');
    const today = new Date().toISOString().split('T')[0];
    if (saved && savedDate === today) {
      return parseInt(saved, 10);
    }
    const newIndex = Math.floor(Math.random() * QUOTES.length);
    localStorage.setItem('trygit_quote_index', String(newIndex));
    localStorage.setItem('trygit_quote_date', today);
    return newIndex;
  });

  const quote = QUOTES[quoteIndex];

  const refreshQuote = () => {
    const newIndex = Math.floor(Math.random() * QUOTES.length);
    setQuoteIndex(newIndex);
    localStorage.setItem('trygit_quote_index', String(newIndex));
    localStorage.setItem('trygit_quote_date', new Date().toISOString().split('T')[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#162236] to-[#0d1526] border border-[#00d4ff]/20 rounded-xl p-6 text-center"
    >
      <motion.p
        key={quoteIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-lg italic text-[#e0f2fe] mb-2"
      >
        &ldquo;{quote.text}&rdquo;
      </motion.p>
      <p className="text-sm text-[#7da0c4] mb-3">— {quote.author}</p>
      <button
        onClick={refreshQuote}
        className="text-xs text-[#00d4ff] hover:text-[#00ff41] transition-colors underline"
      >
        New Quote
      </button>
    </motion.div>
  );
}

/* ================================================================== */
/*  Main ExamStrategist Component                                      */
/* ================================================================== */

export function ExamStrategist() {
  const [selectedPlan, setSelectedPlan] = useState('60-day');
  const [examDate, setExamDate] = useState<Date | null>(() => {
    const saved = localStorage.getItem('trygit_exam_date');
    return saved ? new Date(saved) : null;
  });
  const [showPlanner, setShowPlanner] = useState(false);

  const plan = STUDY_PLANS[selectedPlan];
  const daysLeft = examDate
    ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : plan.daysRemaining;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setExamDate(date);
    if (date) {
      localStorage.setItem('trygit_exam_date', date.toISOString());
    } else {
      localStorage.removeItem('trygit_exam_date');
    }
  };

  const handlePlanChange = (planKey: string) => {
    setSelectedPlan(planKey);
    setShowPlanner(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="text-[#00ff41]" size={28} />
          <h2 className="text-2xl font-bold text-[#e0f2fe]">Exam Strategist</h2>
        </div>
        <button
          onClick={() => setShowPlanner(!showPlanner)}
          className="px-4 py-2 bg-[#162236] border border-[#00d4ff]/30 rounded-lg text-[#00d4ff] hover:bg-[#1a2d45] transition-colors"
        >
          {showPlanner ? 'Hide Planner' : 'Study Planner'}
        </button>
      </div>

      {/* Countdown Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="bg-gradient-to-br from-[#0d1526] to-[#162236] border border-[#1a2d45] rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-[#00d4ff]" size={20} />
            <span className="text-[#7da0c4]">Exam Date</span>
          </div>
          <input
            type="date"
            value={examDate?.toISOString().split('T')[0] || ''}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            className="bg-[#162236] border border-[#1a2d45] rounded-lg px-3 py-1 text-[#e0f2fe] focus:outline-none focus:border-[#00d4ff]/50"
          />
        </div>

        {/* Live countdown timer */}
        <CountdownTimer targetDate={examDate} />

        {/* Plan Selector */}
        <StudyPlanSelector selectedPlan={selectedPlan} onPlanChange={handlePlanChange} />
      </motion.div>

      {/* Motivational Quote */}
      <MotivationalQuote />

      {/* Study Plan Milestones */}
      <MilestoneTracker milestones={plan.weeklyMilestones} show={showPlanner} />

      {/* Daily Target */}
      <DailyTargetCard
        dailyTarget={plan.dailyTarget}
        selectedPlan={selectedPlan}
        overallProgress={plan.overallProgress}
        daysLeft={daysLeft}
      />

      {/* Exam Tips */}
      <ExamTipsGrid />
    </div>
  );
}
