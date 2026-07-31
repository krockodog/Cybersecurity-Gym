import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, Database, ChevronRight, CheckCircle2, XCircle, Layers, RefreshCw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const diskManagementMetadata: PBQMetadata = {
  id: 'disk-management',
  title: 'Disk Management Console',
  description: 'Manage disk partitions including creating, resizing, formatting, RAID configuration, and data recovery across five disk management tasks.',
  difficulty: 3,
  category: 'A+',
  tags: ['disk', 'partitions', 'RAID', 'filesystem', 'storage'],
  xpReward: 45,
  estimatedTime: '9 min',
};

interface DiskAction {
  label: string;
  correct: boolean;
}

interface DiskVisual {
  name: string;
  size: string;
  type: string;
  color: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  disks: DiskVisual[];
  question: string;
  actions: DiskAction[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Create Partitions for Dual Boot',
    description: 'A 500 GB SSD currently has Windows on a single NTFS partition. The user wants to install Linux alongside Windows.',
    disks: [
      { name: 'C:', size: '465 GB', type: 'NTFS', color: '#00d4ff' },
      { name: 'EFI', size: '512 MB', type: 'FAT32', color: '#ffaa00' },
    ],
    question: 'What is the correct sequence of actions?',
    actions: [
      { label: 'Delete the Windows partition, create two equal partitions', correct: false },
      { label: 'Shrink the NTFS partition, create ext4 and swap partitions in unallocated space', correct: true },
      { label: 'Convert the disk to dynamic, then create a spanned volume', correct: false },
      { label: 'Format the entire disk as ext4 and reinstall both OSes', correct: false },
    ],
    explanation: 'Shrinking NTFS preserves Windows data. Linux needs an ext4 root partition and a swap partition in the freed space. The existing EFI partition is shared.',
  },
  {
    id: 's2', title: 'Resize Partition Without Data Loss',
    description: 'A server has a 100 GB data partition (D:) that is 95% full. An adjacent 200 GB partition (E:) is only 10% used. No downtime allowed.',
    disks: [
      { name: 'C:', size: '100 GB', type: 'NTFS', color: '#00d4ff' },
      { name: 'D:', size: '100 GB (95%)', type: 'NTFS', color: '#ff3366' },
      { name: 'E:', size: '200 GB (10%)', type: 'NTFS', color: '#00ff41' },
    ],
    question: 'How do you safely expand D: without data loss?',
    actions: [
      { label: 'Delete partition E: and extend D: into the freed space', correct: false },
      { label: 'Shrink E: from the left side, then extend D: into the adjacent unallocated space', correct: true },
      { label: 'Convert both partitions to dynamic and create a spanned volume', correct: false },
      { label: 'Back up D:, delete it, create a larger partition, and restore', correct: false },
    ],
    explanation: 'Shrinking E: from its left side creates unallocated space adjacent to D:, allowing D: to extend rightward without data loss or downtime.',
  },
  {
    id: 's3', title: 'Configure RAID 5 Array',
    description: 'A file server needs fault tolerance with good read performance using four 2 TB drives. One drive should be able to fail without data loss.',
    disks: [
      { name: 'Disk 0', size: '2 TB', type: 'Unformatted', color: '#7da0c4' },
      { name: 'Disk 1', size: '2 TB', type: 'Unformatted', color: '#7da0c4' },
      { name: 'Disk 2', size: '2 TB', type: 'Unformatted', color: '#7da0c4' },
      { name: 'Disk 3', size: '2 TB', type: 'Unformatted', color: '#7da0c4' },
    ],
    question: 'Which RAID level and configuration is correct?',
    actions: [
      { label: 'RAID 0 (striping) - 8 TB usable, no redundancy', correct: false },
      { label: 'RAID 1 (mirroring) - 2 TB usable, one pair mirrored', correct: false },
      { label: 'RAID 5 (striping with parity) - 6 TB usable, one drive fault tolerance', correct: true },
      { label: 'RAID 10 (stripe of mirrors) - 4 TB usable, requires even number of drives', correct: false },
    ],
    explanation: 'RAID 5 distributes parity across all four drives, providing 6 TB usable (n-1 drives) with single-drive fault tolerance and good read performance.',
  },
  {
    id: 's4', title: 'Format Drive for Cross-Platform Use',
    description: 'A 1 TB external USB drive must work with Windows, macOS, and Linux. Files up to 8 GB must be supported (video editing).',
    disks: [
      { name: 'USB Drive', size: '1 TB', type: 'Unformatted', color: '#a855f7' },
    ],
    question: 'Which filesystem should be used?',
    actions: [
      { label: 'NTFS - Windows native, read-only on macOS', correct: false },
      { label: 'FAT32 - Universal support but 4 GB file size limit', correct: false },
      { label: 'exFAT - Cross-platform support with no practical file size limit', correct: true },
      { label: 'ext4 - Best for Linux, not natively supported by Windows or macOS', correct: false },
    ],
    explanation: 'exFAT supports files over 4 GB and is natively read/write on Windows, macOS, and Linux. It is the correct choice for cross-platform large file support.',
  },
  {
    id: 's5', title: 'Recover Data from Failed RAID',
    description: 'A RAID 1 array (2 x 1 TB mirrors) has one failed drive. The system is still running on the remaining drive. A replacement drive is available.',
    disks: [
      { name: 'Disk 0', size: '1 TB', type: 'RAID 1 (Active)', color: '#00ff41' },
      { name: 'Disk 1', size: '1 TB', type: 'RAID 1 (FAILED)', color: '#ff3366' },
      { name: 'New Disk', size: '1 TB', type: 'Unformatted', color: '#ffaa00' },
    ],
    question: 'What is the correct recovery procedure?',
    actions: [
      { label: 'Back up data, delete array, recreate RAID 1 with both drives', correct: false },
      { label: 'Hot-swap the failed drive with the new drive and rebuild the array', correct: true },
      { label: 'Convert the surviving drive to a basic disk and abandon RAID', correct: false },
      { label: 'Clone the surviving drive to the new drive using dd, then rebuild', correct: false },
    ],
    explanation: 'RAID 1 supports hot-swapping failed drives. The RAID controller automatically rebuilds the mirror onto the replacement drive without data loss or downtime.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function DiskManagementPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const score = Math.round((correctCount / SCENARIOS.length) * 100);

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (scenario.actions[idx].correct) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [answered, scenario]);

  const handleNext = useCallback(() => {
    if (currentStep < SCENARIOS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">Disk Management</span>
        </div>
        <ProgressTracker current={currentStep + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-[#00d4ff]" />
                  <span className="text-sm font-semibold text-[#e0f2fe]">{scenario.title}</span>
                </div>
                <span className="text-xs text-[#4a6682]">{currentStep + 1}/{SCENARIOS.length}</span>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#c8dce8] mb-4">{scenario.description}</p>

                {/* Disk visualization */}
                <div className="mb-5 space-y-2">
                  <h4 className="text-xs text-[#7da0c4] uppercase flex items-center gap-2">
                    <Layers size={12} /> Current Disk Layout
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {scenario.disks.map((disk, i) => (
                      <motion.div key={disk.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                        className="flex-1 min-w-[100px] bg-[#0a1628] border rounded-lg p-3 text-center"
                        style={{ borderColor: disk.color }}>
                        <div className="w-8 h-8 rounded mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${disk.color}20` }}>
                          <HardDrive size={16} style={{ color: disk.color }} />
                        </div>
                        <p className="text-xs font-semibold text-[#e0f2fe]">{disk.name}</p>
                        <p className="text-[10px] text-[#7da0c4]">{disk.size}</p>
                        <p className="text-[10px] font-mono" style={{ color: disk.color }}>{disk.type}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#7da0c4] mb-3">{scenario.question}</p>
                <div className="space-y-2">
                  {scenario.actions.map((action, i) => {
                    let borderColor = '#1a2d45';
                    let bgColor = 'transparent';
                    if (answered && action.correct) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                    else if (answered && selected === i && !action.correct) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }

                    return (
                      <motion.button key={i} whileHover={!answered ? { scale: 1.01, x: 4 } : {}} whileTap={!answered ? { scale: 0.99 } : {}}
                        onClick={() => handleSelect(i)}
                        className="w-full text-left px-4 py-3 border rounded-lg text-sm transition-all flex items-center gap-3"
                        style={{ borderColor, backgroundColor: bgColor, color: '#e0f2fe' }}>
                        <span className="text-[#00d4ff] font-mono">{String.fromCharCode(65 + i)}.</span>
                        <span className="flex-1">{action.label}</span>
                        {answered && action.correct && <CheckCircle2 size={16} className="text-[#00ff41]" />}
                        {answered && selected === i && !action.correct && <XCircle size={16} className="text-[#ff3366]" />}
                      </motion.button>
                    );
                  })}
                </div>

                {answered && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-[#1a2d45] rounded-lg bg-[#111d2e]">
                    <p className="text-xs text-[#c8dce8]">{scenario.explanation}</p>
                  </motion.div>
                )}
              </div>
            </div>

            {answered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button onClick={handleNext} className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                  {currentStep < SCENARIOS.length - 1 ? 'Next Task' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <HardDrive size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Disk Management Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} tasks completed correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
