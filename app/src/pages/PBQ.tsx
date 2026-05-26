import { useState, useCallback, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Terminal, Globe, ShieldCheck, Lock, Activity, Wifi, Target,
  Star, Clock, Zap, Trophy, CheckCircle, RotateCcw, ChevronLeft,
  Filter, TrendingUp, Award, Cpu
} from 'lucide-react';
import { PBQ_COMPONENT_MAP } from '../components/pbq';
import { PBQ_METADATA, CATEGORY_CONFIG, PBQ_ACCENT_COLORS } from '../components/pbq/metadata';
import type { PBQMetadata } from '../components/pbq/shared/types';
import { DifficultyStars } from '../components/pbq/shared/ProgressTracker';
import { easeExpoOut } from '../components/pbq/shared/animations';

// ── Types ───────────────────────────────────────────────────────────

type CategoryFilter = 'All' | 'PenTest+' | 'Security+' | 'Network+';
type DifficultyFilter = 'All' | '1' | '2' | '3' | '4' | '5';

interface PBQHistoryRecord {
  pbqId: string;
  title: string;
  score: number;
  date: string;
}

// ── Icon map (string name -> Lucide component) ──────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Network, Terminal, Globe, ShieldCheck, Lock, Activity, Wifi, Target,
};

const CATEGORY_BG: Record<string, string> = {
  'PenTest+': 'rgba(255, 51, 102, 0.08)',
  'Security+': 'rgba(0, 255, 65, 0.08)',
  'Network+': 'rgba(0, 212, 255, 0.08)',
};

// ── localStorage helpers ────────────────────────────────────────────

function loadHistory(): PBQHistoryRecord[] {
  try {
    const raw = localStorage.getItem('trygit-pbq-history-v2');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function saveHistory(history: PBQHistoryRecord[]) {
  try { localStorage.setItem('trygit-pbq-history-v2', JSON.stringify(history)); } catch { /* ignore */ }
}

function loadPBQProgress(): Record<string, { completed: boolean; bestScore: number }> {
  try {
    const raw = localStorage.getItem('trygit-pbq-progress');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

function savePBQProgress(progress: Record<string, { completed: boolean; bestScore: number }>) {
  try { localStorage.setItem('trygit-pbq-progress', JSON.stringify(progress)); } catch { /* ignore */ }
}

// ── Main PBQ Page ───────────────────────────────────────────────────

export default function PBQ() {
  const [selectedPBQ, setSelectedPBQ] = useState<string | null>(null);
  const [history, setHistory] = useState<PBQHistoryRecord[]>(loadHistory);
  const [progress, setProgress] = useState<Record<string, { completed: boolean; bestScore: number }>>(loadPBQProgress);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('All');
  const [showFilters, setShowFilters] = useState(false);

  const selectPBQ = useCallback((id: string) => {
    setSelectedPBQ(id);
  }, []);

  const goBack = useCallback(() => {
    setSelectedPBQ(null);
  }, []);

  const addHistoryEntry = useCallback((pbqId: string, title: string, score: number) => {
    const entry: PBQHistoryRecord = {
      pbqId,
      title,
      score,
      date: new Date().toISOString(),
    };
    const newHistory = [entry, ...history].slice(0, 50);
    setHistory(newHistory);
    saveHistory(newHistory);

    const newProgress = {
      ...progress,
      [pbqId]: {
        completed: true,
        bestScore: Math.max(score, progress[pbqId]?.bestScore || 0),
      },
    };
    setProgress(newProgress);
    savePBQProgress(newProgress);
  }, [history, progress]);

  const handleComplete = useCallback((score: number) => {
    if (!selectedPBQ) return;
    const meta = PBQ_METADATA.find(m => m.id === selectedPBQ);
    if (!meta) return;
    addHistoryEntry(selectedPBQ, meta.title, score);
  }, [selectedPBQ, addHistoryEntry]);

  const filteredPBQs = PBQ_METADATA.filter(pbq => {
    if (categoryFilter !== 'All' && pbq.category !== categoryFilter) return false;
    if (difficultyFilter !== 'All' && pbq.difficulty !== parseInt(difficultyFilter)) return false;
    return true;
  });

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 0;
  const totalXP = Object.entries(progress).reduce((sum, [id, p]) => {
    const meta = PBQ_METADATA.find(m => m.id === id);
    return sum + (p.completed ? (meta?.xpReward || 0) : 0);
  }, 0);

  return (
    <div className="min-h-[100dvh] bg-[#0a0e17] pb-8">
      {/* ── Hero ── */}
      <PBQHero
        completedCount={completedCount}
        totalCount={PBQ_METADATA.length}
        avgScore={avgScore}
        totalXP={totalXP}
      />

      {/* ── PBQ Grid or Active PBQ ── */}
      <AnimatePresence mode="wait">
        {selectedPBQ ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: easeExpoOut }}
            className="mx-6"
          >
            <ActivePBQView
              pbqId={selectedPBQ}
              onBack={goBack}
              onComplete={handleComplete}
              progress={progress[selectedPBQ]}
            />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCategoryFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-display transition-all ${
                      categoryFilter === 'All'
                        ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]'
                        : 'text-[#7da0c4] border border-[#1a2d45] hover:border-[#00d4ff]/30'
                    }`}
                  >
                    All ({PBQ_METADATA.length})
                  </button>
                  {(['PenTest+', 'Security+', 'Network+'] as const).map(cat => {
                    const count = PBQ_METADATA.filter(p => p.category === cat).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(categoryFilter === cat ? 'All' : cat)}
                        className="px-3 py-1.5 rounded-lg text-xs font-display transition-all border"
                        style={{
                          borderColor: categoryFilter === cat ? CATEGORY_CONFIG[cat].color : '#1a2d45',
                          backgroundColor: categoryFilter === cat ? `${CATEGORY_CONFIG[cat].color}15` : 'transparent',
                          color: categoryFilter === cat ? CATEGORY_CONFIG[cat].color : '#7da0c4',
                        }}
                      >
                        {cat} ({count})
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[#7da0c4] border border-[#1a2d45] hover:border-[#00d4ff] transition-all"
                >
                  <Filter size={12} />
                  Filter
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-caption text-[#4a6682] mr-2">Difficulty:</span>
                      {['All', '1', '2', '3', '4', '5'].map(d => (
                        <button
                          key={d}
                          onClick={() => setDifficultyFilter(d as DifficultyFilter)}
                          className={`px-3 py-1 rounded-lg text-xs font-display transition-all ${
                            difficultyFilter === d
                              ? 'bg-[#ffaa00]/15 text-[#ffaa00] border border-[#ffaa00]'
                              : 'text-[#7da0c4] border border-[#1a2d45] hover:border-[#ffaa00]/30'
                          }`}
                        >
                          {d === 'All' ? 'All' : `${d} ${'★'.repeat(parseInt(d))}`}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredPBQs.map((pbq, i) => (
                  <PBQCard
                    key={pbq.id}
                    metadata={pbq}
                    progress={progress[pbq.id]}
                    index={i}
                    onSelect={() => selectPBQ(pbq.id)}
                  />
                ))}
              </div>

              {filteredPBQs.length === 0 && (
                <div className="text-center py-16">
                  <Cpu size={48} className="text-[#1a2d45] mx-auto mb-4" />
                  <p className="text-[#7da0c4] font-display">No PBQs match the selected filters.</p>
                  <button
                    onClick={() => { setCategoryFilter('All'); setDifficultyFilter('All'); }}
                    className="mt-2 text-[#00d4ff] text-sm hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* History */}
            <PBQHistory history={history} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PBQ Card ────────────────────────────────────────────────────────

function PBQCard({
  metadata,
  progress,
  index,
  onSelect,
}: {
  metadata: PBQMetadata;
  progress?: { completed: boolean; bestScore: number };
  index: number;
  onSelect: () => void;
}) {
  const accent = PBQ_ACCENT_COLORS[metadata.id] || '#00d4ff';
  const isCompleted = progress?.completed;
  const bestScore = progress?.bestScore || 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: easeExpoOut }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="relative text-left bg-gradient-to-br from-[#0d1526] to-[#111d2e] border border-[#1a2d45] rounded-xl p-5 transition-shadow hover:shadow-lg group overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 rounded-full transition-all group-hover:left-2 group-hover:right-2"
        style={{ backgroundColor: accent }}
      />

      {/* Category badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-display px-2 py-0.5 rounded-full border"
          style={{
            color: CATEGORY_CONFIG[metadata.category].color,
            borderColor: `${CATEGORY_CONFIG[metadata.category].color}40`,
            backgroundColor: `${CATEGORY_CONFIG[metadata.category].color}10`,
          }}
        >
          {metadata.category}
        </span>
        {isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1"
          >
            <CheckCircle size={14} className="text-[#00ff41]" />
          </motion.div>
        )}
      </div>

      {/* Icon */}
      <PBQIcon id={metadata.id} size={28} accent={accent} />

      {/* Title & Description */}
      <h3 className="font-display font-semibold text-sm text-[#e0f2fe] mb-1 group-hover:text-white transition-colors">
        {metadata.title}
      </h3>
      <p className="text-caption text-[#7da0c4] line-clamp-2 mb-3">
        {metadata.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center justify-between">
        <DifficultyStars level={metadata.difficulty} />
        <span className="text-[10px] text-[#4a6682] font-mono">{metadata.estimatedTime}</span>
      </div>

      {/* XP reward */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1a2d45]">
        <div className="flex items-center gap-1">
          <Zap size={12} style={{ color: accent }} />
          <span className="text-xs font-display" style={{ color: accent }}>
            +{metadata.xpReward} XP
          </span>
        </div>
        {bestScore > 0 && (
          <span className={`text-xs font-display ${bestScore >= 80 ? 'text-[#00ff41]' : bestScore >= 50 ? 'text-[#ffaa00]' : 'text-[#ff3366]'}`}>
            {bestScore}%
          </span>
        )}
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accent}08, transparent 70%)`,
        }}
      />
    </motion.button>
  );
}

// ── Active PBQ View ─────────────────────────────────────────────────

function ActivePBQView({
  pbqId,
  onBack,
  onComplete,
  progress,
}: {
  pbqId: string;
  onBack: () => void;
  onComplete: (score: number) => void;
  progress?: { completed: boolean; bestScore: number };
}) {
  const metadata = PBQ_METADATA.find(m => m.id === pbqId);
  const Component = PBQ_COMPONENT_MAP[pbqId];

  if (!metadata || !Component) {
    return (
      <div className="text-center py-16">
        <p className="text-[#ff3366] font-display">PBQ not found</p>
        <button onClick={onBack} className="mt-4 text-[#00d4ff] text-sm hover:underline">Go back</button>
      </div>
    );
  }

  const accent = PBQ_ACCENT_COLORS[pbqId] || '#00d4ff';

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 border border-[#1a2d45] rounded-lg text-[#7da0c4] text-sm hover:border-[#00d4ff] hover:text-[#e0f2fe] transition-all"
          >
            <ChevronLeft size={16} />
            Back
          </motion.button>
          <div>
            <div className="flex items-center gap-2">
              <PBQIcon id={pbqId} size={20} color={accent} />
              <h2 className="text-h3 text-[#e0f2fe] font-display">{metadata.title}</h2>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span
                className="text-[10px] font-display px-2 py-0.5 rounded-full border"
                style={{
                  color: CATEGORY_CONFIG[metadata.category].color,
                  borderColor: `${CATEGORY_CONFIG[metadata.category].color}40`,
                }}
              >
                {metadata.category}
              </span>
              <DifficultyStars level={metadata.difficulty} />
              <span className="text-caption text-[#4a6682]">{metadata.estimatedTime}</span>
              {progress?.completed && (
                <span className="text-caption text-[#00ff41] flex items-center gap-1">
                  <Trophy size={12} /> Best: {progress.bestScore}%
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 border border-[#1a2d45] rounded-lg text-[#7da0c4] text-sm hover:border-[#00d4ff] transition-all"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* PBQ Content */}
      <div className="bg-[#0d1117] border border-[#1a2d45] rounded-xl p-6 relative overflow-hidden min-h-[500px]">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] scanlines" />
        {/* Subtle glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none opacity-20"
          style={{ background: `radial-gradient(circle, ${accent}20, transparent 70%)` }}
        />

        <div className="relative z-10">
          <Suspense fallback={<PBQLoadingSkeleton />}>            <Component onComplete={onComplete} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────

function PBQLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#1a2d45] rounded w-1/3" />
      <div className="h-4 bg-[#1a2d45] rounded w-2/3" />
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="h-64 bg-[#1a2d45] rounded-xl" />
        <div className="space-y-3">
          <div className="h-20 bg-[#1a2d45] rounded-lg" />
          <div className="h-20 bg-[#1a2d45] rounded-lg" />
          <div className="h-20 bg-[#1a2d45] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────

function PBQHero({
  completedCount,
  totalCount,
  avgScore,
  totalXP,
}: {
  completedCount: number;
  totalCount: number;
  avgScore: number;
  totalXP: number;
}) {
  const mastery = completedCount === 0 ? 'Beginner' : avgScore >= 90 ? 'Elite' : avgScore >= 70 ? 'Advanced' : avgScore >= 50 ? 'Intermediate' : 'Beginner';
  const masteryColor = mastery === 'Elite' ? '#ffaa00' : mastery === 'Advanced' ? '#a855f7' : mastery === 'Intermediate' ? '#00d4ff' : '#7da0c4';

  return (
    <div className="relative gradient-hero border-b border-[#1a2d45] px-6 py-8 overflow-hidden">
      <div className="absolute inset-0 gradient-blue-glow pointer-events-none" />

      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display text-[#00d4ff] font-display mb-2"
        >
          PBQ Arena
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-body text-[#7da0c4] max-w-[600px] mb-6"
        >
          Performance Based Questions — interactive, scenario-driven challenges. Master these hands-on
          simulators to ace your certification exams.
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-[540px]">
          {[
            { label: 'PBQs Completed', value: `${completedCount}/${totalCount}`, color: '#00d4ff', icon: <CheckCircle size={16} /> },
            { label: 'Avg Score', value: `${avgScore}%`, color: '#00ff41', icon: <TrendingUp size={16} /> },
            { label: 'Mastery', value: mastery, color: masteryColor, icon: <Award size={16} /> },
            { label: 'XP Earned', value: `${totalXP}`, color: '#ffaa00', icon: <Zap size={16} /> },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-3 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: stat.color }}>
                {stat.icon}
                <p className="font-display font-bold text-lg" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <p className="text-caption text-[#7da0c4]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex gap-2"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1 border border-[#00d4ff] rounded-full text-xs text-[#00d4ff]">
            <Zap size={12} />
            Recommended: Start with Network Topology
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 border border-[#ffaa00] rounded-full text-xs text-[#ffaa00]">
            <Star size={12} />
            8 Interactive Simulators
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// ── History ─────────────────────────────────────────────────────────

function PBQHistory({ history }: { history: PBQHistoryRecord[] }) {
  if (history.length === 0) return null;

  return (
    <div className="px-6 mt-8">
      <h3 className="text-h4 text-[#e0f2fe] mb-4 font-display flex items-center gap-2">
        <Clock size={16} className="text-[#7da0c4]" />
        Attempt History
      </h3>
      <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a2d45] bg-[#111d2e]">
                <th className="px-4 py-2 text-left text-caption text-[#4a6682] font-display">PBQ</th>
                <th className="px-4 py-2 text-left text-caption text-[#4a6682] font-display">Score</th>
                <th className="px-4 py-2 text-left text-caption text-[#4a6682] font-display">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((entry, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[#1a2d45]/50 hover:bg-[#111d2e]"
                >
                  <td className="px-4 py-2 text-[#e0f2fe] font-display text-xs">{entry.title}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-display font-bold ${
                      entry.score >= 80 ? 'text-[#00ff41]' : entry.score >= 50 ? 'text-[#ffaa00]' : 'text-[#ff3366]'
                    }`}>
                      {entry.score}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-caption text-[#4a6682] font-mono">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── PBQ Icon Renderer ───────────────────────────────────────────────

function PBQIcon({ id, size, accent, color }: { id: string; size: number; accent?: string; color?: string }) {
  const c = color || accent || '#00d4ff';
  switch (id) {
    case 'network-topology': return <Network size={size} color={c} />;
    case 'terminal-sim': return <Terminal size={size} color={c} />;
    case 'web-vuln-hotspot': return <Globe size={size} color={c} />;
    case 'firewall-rules': return <ShieldCheck size={size} color={c} />;
    case 'cert-chain': return <Lock size={size} color={c} />;
    case 'log-radar': return <Activity size={size} color={c} />;
    case 'wireless-attack': return <Wifi size={size} color={c} />;
    case 'exploit-chain': return <Target size={size} color={c} />;
    default: return <Cpu size={size} color={c} />;
  }
}
