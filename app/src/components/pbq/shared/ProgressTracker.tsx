import { motion } from 'framer-motion';
import { Star, Trophy } from 'lucide-react';
import type { Difficulty } from './types';

interface ProgressTrackerProps {
  current: number;
  total: number;
  score: number;
  streak?: number;
}

export function ProgressTracker({ current, total, score, streak = 0 }: ProgressTrackerProps) {
  const percentage = Math.round((current / total) * 100);
  const stars = score >= 90 ? 3 : score >= 60 ? 2 : score > 0 ? 1 : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 bg-[#1a2d45] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00ff41, #00d4ff)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: easeExpoOut }}
          />
        </div>
        <span className="text-caption text-[#7da0c4] font-display">{current}/{total}</span>
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: i <= stars ? 1 : 0.5, rotate: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <Star
              size={16}
              className={i <= stars ? 'text-[#ffaa00] fill-[#ffaa00]' : 'text-[#1a2d45]'}
            />
          </motion.div>
        ))}
      </div>

      {streak > 1 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-1 px-2 py-0.5 bg-[rgba(255,170,0,0.15)] border border-[#ffaa00] rounded-full"
        >
          <Trophy size={12} className="text-[#ffaa00]" />
          <span className="text-caption text-[#ffaa00] font-display">{streak}x</span>
        </motion.div>
      )}
    </div>
  );
}

export function DifficultyStars({ level }: { level: Difficulty }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= level ? 'text-[#ffaa00] fill-[#ffaa00]' : 'text-[#1a2d45]'}
        />
      ))}
    </div>
  );
}

const easeExpoOut = [0.16, 1, 0.3, 1] as [number, number, number, number];
