import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/classroom': 'Classroom',
  '/quiz': 'Quiz Lab',
  '/pbq': 'PBQ Arena',
  '/tutor': 'AI Tutor',
  '/progress': 'Progress',
  '/flashcards': 'Flashcards',
};

export default function PlaceholderPage() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Page';

  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6"
        >
          <Construction size={64} className="text-[#ffaa00] mx-auto" />
        </motion.div>
        <h1 className="text-h2 text-[#e0f2fe] mb-2">{title}</h1>
        <p className="text-body text-[#7da0c4]">Coming Soon</p>
        <div className="mt-8 flex items-center justify-center gap-2 text-caption text-[#4a6682]">
          <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
          Under Construction
        </div>
      </motion.div>
    </div>
  );
}
