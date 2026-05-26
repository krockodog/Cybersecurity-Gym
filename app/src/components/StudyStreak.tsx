import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, Star, TrendingUp } from 'lucide-react';

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

interface StreakData {
  current: number;
  longest: number;
  lastDate: string;
  history: Record<string, number>; // date -> questions answered
  weeklyGoal: number;
  weeklyProgress: number;
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

const getToday = () => new Date().toISOString().split('T')[0];

const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const loadStreakData = (): StreakData => {
  try {
    const saved = localStorage.getItem('trygit_streak');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore parse errors
  }
  return {
    current: 0,
    longest: 0,
    lastDate: '',
    history: {},
    weeklyGoal: 100,
    weeklyProgress: 0,
  };
};

const saveStreakData = (data: StreakData) => {
  localStorage.setItem('trygit_streak', JSON.stringify(data));
};

/* ================================================================== */
/*  Sub-component: WeekVisualization                                   */
/* ================================================================== */

function WeekVisualization({ lastDate }: { lastDate: string }) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const lastStudyDate = lastDate ? new Date(lastDate) : null;

  return (
    <div className="flex gap-1 mt-4">
      {days.map((day, i) => {
        const dayStr = day.toISOString().split('T')[0];
        const isActive = lastStudyDate ? lastStudyDate >= new Date(dayStr) : false;
        const isToday = i === 6;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex-1 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all ${
              isActive
                ? isToday
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-orange-500/40 text-orange-300'
                : 'bg-[#162236] text-[#7da0c4]'
            }`}
            title={day.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
          >
            <span className="text-[10px] opacity-70">
              {day.toLocaleDateString('en', { weekday: 'narrow' })}
            </span>
            {isActive && (
              <Flame size={12} className={isToday ? 'text-white' : 'text-orange-300'} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Sub-component: StreakMilestones                                   */
/* ================================================================== */

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90];

function StreakMilestones({ currentStreak }: { currentStreak: number }) {
  return (
    <div className="flex gap-2 mt-4 flex-wrap">
      {STREAK_MILESTONES.map((milestone) => {
        const achieved = currentStreak >= milestone;
        return (
          <motion.div
            key={milestone}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
              achieved
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                : 'bg-[#162236] text-[#7da0c4] border border-[#1a2d45]'
            }`}
            title={achieved ? `Achieved ${milestone}-day streak!` : `${milestone}-day streak goal`}
          >
            {achieved ? <Trophy size={12} /> : <Star size={12} />}
            {milestone}d
          </motion.div>
        );
      })}
    </div>
  );
}

/* ================================================================== */
/*  Sub-component: WeeklyGoalProgress                                  */
/* ================================================================== */

function WeeklyGoalProgress({ weeklyProgress, weeklyGoal }: { weeklyProgress: number; weeklyGoal: number }) {
  const percent = Math.min((weeklyProgress / weeklyGoal) * 100, 100);

  return (
    <div className="mt-4 p-3 bg-[#0a0e17] rounded-lg border border-[#1a2d45]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">Weekly Goal</span>
        </div>
        <span className="text-sm text-[#e0f2fe] font-medium">
          {weeklyProgress}/{weeklyGoal} questions
        </span>
      </div>
      <div className="h-2 bg-[#162236] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className={`h-full rounded-full ${
            percent >= 100
              ? 'bg-gradient-to-r from-[#00ff41] to-[#00d4ff]'
              : 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]'
          }`}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main StudyStreak Component                                         */
/* ================================================================== */

export function StudyStreak() {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState('');
  const [todayStudied, setTodayStudied] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [weeklyGoal] = useState(100);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const data = loadStreakData();
    setStreak(data.current);
    setLongestStreak(data.longest);
    setLastStudyDate(data.lastDate);
    setWeeklyProgress(data.weeklyProgress);

    // Check if studied today
    const today = getToday();
    setTodayStudied(data.lastDate === today);
  }, []);

  const recordStudySession = () => {
    const today = getToday();
    const yesterday = getYesterday();

    let newStreak = streak;
    if (lastStudyDate === yesterday) {
      newStreak = streak + 1;
    } else if (lastStudyDate !== today) {
      // Streak was broken or first time
      newStreak = 1;
    }

    const newLongest = Math.max(longestStreak, newStreak);
    const newWeeklyProgress = weeklyProgress + 10; // Add 10 questions per study session

    setStreak(newStreak);
    setLongestStreak(newLongest);
    setLastStudyDate(today);
    setTodayStudied(true);
    setWeeklyProgress(newWeeklyProgress);

    const data: StreakData = {
      current: newStreak,
      longest: newLongest,
      lastDate: today,
      history: { ...loadStreakData().history, [today]: (loadStreakData().history[today] || 0) + 10 },
      weeklyGoal,
      weeklyProgress: newWeeklyProgress,
    };
    saveStreakData(data);
  };

  const getStreakMessage = () => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'First day — great start!';
    if (streak < 7) return `${streak} days strong — keep it up!`;
    if (streak < 14) return 'One week! You\'re building a habit!';
    if (streak < 30) return 'Two weeks — unstoppable momentum!';
    return `${streak} days — legendary dedication!`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={streak > 0 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <Flame
              size={32}
              className={streak > 0 ? 'text-orange-400' : 'text-[#7da0c4]'}
            />
          </motion.div>
          <div>
            <h3 className="text-xl font-bold text-[#e0f2fe]">{streak} Day Streak</h3>
            <p className="text-sm text-[#7da0c4]">Longest: {longestStreak} days</p>
          </div>
        </div>

        {!todayStudied ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={recordStudySession}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-lg shadow-orange-500/20"
          >
            I Studied Today!
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 text-green-400"
          >
            <Trophy size={18} />
            <span className="font-medium">Done today!</span>
          </motion.div>
        )}
      </div>

      {/* Streak message */}
      <p className="text-sm text-orange-300/80 mt-2">{getStreakMessage()}</p>

      {/* Week visualization */}
      <WeekVisualization lastDate={lastStudyDate} />

      {/* Toggle details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-[#7da0c4] hover:text-[#00d4ff] transition-colors mt-3 underline"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {/* Details section */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 space-y-3 overflow-hidden"
        >
          {/* Milestones */}
          <StreakMilestones currentStreak={streak} />

          {/* Weekly goal */}
          <WeeklyGoalProgress weeklyProgress={weeklyProgress} weeklyGoal={weeklyGoal} />

          {/* Calendar link hint */}
          <div className="flex items-center gap-2 text-xs text-[#7da0c4]">
            <Calendar size={12} />
            <span>Study sessions are saved locally on this device</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
