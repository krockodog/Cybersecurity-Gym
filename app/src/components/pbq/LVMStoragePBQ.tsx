import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HardDrive, CheckCircle, XCircle, Terminal, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const lvmStorageMetadata: PBQMetadata = {
  id: 'lvm-storage',
  title: 'LVM Storage Manager',
  description: 'Manage Logical Volume Manager storage including physical volumes, volume groups, logical volumes, extending, and snapshots.',
  difficulty: 4,
  category: 'Linux+',
  tags: ['lvm', 'storage', 'pvcreate', 'vgcreate', 'lvcreate'],
  xpReward: 55,
  estimatedTime: '9 min',
};

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  terminalOutput: string;
  options: { id: string; label: string; command: string }[];
  correctId: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'pv-create',
    title: 'Initialize Physical Volumes',
    prompt: 'Two new disks /dev/sdb and /dev/sdc have been attached for LVM use. What is the first step to prepare them for LVM?',
    terminalOutput: '$ lsblk\nNAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT\nsda      8:0    0   50G  0 disk\n|-sda1   8:1    0   49G  0 part /\n|-sda2   8:2    0    1G  0 part [SWAP]\nsdb      8:16   0  100G  0 disk\nsdc      8:32   0  100G  0 disk',
    options: [
      { id: 'a', label: 'pvcreate /dev/sdb /dev/sdc', command: 'pvcreate /dev/sdb /dev/sdc' },
      { id: 'b', label: 'vgcreate data /dev/sdb /dev/sdc', command: 'vgcreate data /dev/sdb /dev/sdc' },
      { id: 'c', label: 'fdisk /dev/sdb', command: 'fdisk /dev/sdb' },
      { id: 'd', label: 'mkfs.ext4 /dev/sdb', command: 'mkfs.ext4 /dev/sdb' },
    ],
    correctId: 'a',
    explanation: 'pvcreate initializes block devices as LVM physical volumes by writing an LVM label. This must be done before creating volume groups.',
  },
  {
    id: 'vg-create',
    title: 'Create Volume Group',
    prompt: 'Physical volumes are ready on /dev/sdb and /dev/sdc. Create a volume group named "datastore" combining both disks.',
    terminalOutput: '$ pvs\n  PV         VG   Fmt  Attr PSize   PFree\n  /dev/sdb        lvm2 ---  100.00g 100.00g\n  /dev/sdc        lvm2 ---  100.00g 100.00g',
    options: [
      { id: 'a', label: 'lvcreate -n datastore /dev/sdb /dev/sdc', command: 'lvcreate -n datastore /dev/sdb /dev/sdc' },
      { id: 'b', label: 'vgcreate datastore /dev/sdb /dev/sdc', command: 'vgcreate datastore /dev/sdb /dev/sdc' },
      { id: 'c', label: 'vgextend datastore /dev/sdb /dev/sdc', command: 'vgextend datastore /dev/sdb /dev/sdc' },
      { id: 'd', label: 'mdadm --create datastore /dev/sdb /dev/sdc', command: 'mdadm --create /dev/md0 --level=0 /dev/sdb /dev/sdc' },
    ],
    correctId: 'b',
    explanation: 'vgcreate creates a volume group from one or more physical volumes. The combined space becomes a pool from which logical volumes can be allocated.',
  },
  {
    id: 'lv-create',
    title: 'Create Logical Volume',
    prompt: 'Create a 50GB logical volume named "appdata" from the "datastore" volume group for application storage.',
    terminalOutput: '$ vgs\n  VG        #PV #LV #SN Attr   VSize   VFree\n  datastore   2   0   0 wz--n- 199.99g 199.99g',
    options: [
      { id: 'a', label: 'lvcreate -L 50G -n appdata datastore', command: 'lvcreate -L 50G -n appdata datastore' },
      { id: 'b', label: 'lvcreate -l 50 -n appdata datastore', command: 'lvcreate -l 50 -n appdata datastore' },
      { id: 'c', label: 'lvextend -L 50G datastore/appdata', command: 'lvextend -L 50G datastore/appdata' },
      { id: 'd', label: 'vgcreate -s 50G appdata', command: 'vgcreate -s 50G appdata' },
    ],
    correctId: 'a',
    explanation: 'lvcreate -L specifies size in human-readable units (G for gigabytes), -n names the logical volume. The last argument is the volume group to allocate from.',
  },
  {
    id: 'lv-extend',
    title: 'Extend Logical Volume',
    prompt: 'The appdata volume is running out of space. Extend it by 30GB and resize the ext4 filesystem in a single command.',
    terminalOutput: '$ df -h /mnt/appdata\nFilesystem                    Size  Used Avail Use% Mounted on\n/dev/mapper/datastore-appdata  49G   47G  2.0G  96% /mnt/appdata\n\n$ vgs\n  VG        #PV #LV #SN Attr   VSize   VFree\n  datastore   2   1   0 wz--n- 199.99g 149.99g',
    options: [
      { id: 'a', label: 'lvextend + resize2fs', command: 'lvextend -L +30G /dev/datastore/appdata && resize2fs /dev/datastore/appdata' },
      { id: 'b', label: 'lvextend -r -L +30G', command: 'lvextend -r -L +30G /dev/datastore/appdata' },
      { id: 'c', label: 'lvresize -L 80G', command: 'lvresize -L 80G /dev/datastore/appdata' },
      { id: 'd', label: 'vgextend +30G datastore', command: 'vgextend +30G datastore' },
    ],
    correctId: 'b',
    explanation: 'lvextend -r (--resizefs) extends the logical volume and resizes the filesystem in one step. The + prefix adds to the current size rather than setting an absolute size.',
  },
  {
    id: 'lv-snapshot',
    title: 'Create LVM Snapshot',
    prompt: 'Before a risky database migration, create a 10GB snapshot of the appdata volume for rollback purposes.',
    terminalOutput: '$ lvs\n  LV      VG        Attr       LSize  Pool Origin Data%\n  appdata datastore -wi-ao---- 80.00g\n\n$ vgs\n  VG        #PV #LV #SN Attr   VSize   VFree\n  datastore   2   1   0 wz--n- 199.99g 119.99g',
    options: [
      { id: 'a', label: 'lvcreate snapshot', command: 'lvcreate -s -L 10G -n appdata_snap /dev/datastore/appdata' },
      { id: 'b', label: 'lvconvert snapshot', command: 'lvconvert --type snapshot /dev/datastore/appdata' },
      { id: 'c', label: 'cp -a snapshot', command: 'cp -a /dev/datastore/appdata /dev/datastore/appdata_snap' },
      { id: 'd', label: 'vgsnapshot create', command: 'vgsnapshot -L 10G datastore appdata' },
    ],
    correctId: 'a',
    explanation: 'lvcreate -s creates a snapshot volume. The -L flag sets the snapshot size (space for changed blocks), and the origin volume is specified as the last argument.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function LVMStoragePBQ({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const scenario = SCENARIOS[step];

  const handleSelect = useCallback((optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const correct = optionId === scenario.correctId;
    const newResults = [...results, correct];
    setResults(newResults);
    if (correct) setStreak(s => s + 1); else setStreak(0);
    const newScore = Math.round((newResults.filter(Boolean).length / SCENARIOS.length) * 100);
    setScore(newScore);
    if (step === SCENARIOS.length - 1) {
      setCompleted(true);
      onComplete?.(newScore);
    }
  }, [answered, scenario, results, step, onComplete]);

  const handleNext = useCallback(() => {
    if (step < SCENARIOS.length - 1) {
      setStep(s => s + 1);
      setSelected(null);
      setAnswered(false);
    }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setStreak(0);
    setCompleted(false);
    setResults([]);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HardDrive size={16} className="text-[#ff9500]" />
          <span className="text-sm text-[#7da0c4] font-semibold">LVM Storage Management</span>
        </div>
        <ProgressTracker current={step + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[rgba(255,149,0,0.15)] text-[#ff9500] rounded text-xs font-semibold">
                Step {step + 1}/{SCENARIOS.length}
              </span>
              <h3 className="text-sm text-[#e0f2fe] font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-[#c8dce8] mb-4">{scenario.prompt}</p>

            <div className="bg-[#050d18] border border-[#1a2d45] rounded-lg p-3 mb-4 font-mono text-xs text-[#00ff41] whitespace-pre-wrap">
              <div className="flex items-center gap-2 mb-2 text-[#4a6682]">
                <Terminal size={12} />
                <span>Terminal Output</span>
              </div>
              {scenario.terminalOutput}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenario.options.map(option => {
                const isSelected = selected === option.id;
                const isCorrect = option.id === scenario.correctId;
                let borderColor = '#1a2d45';
                let bgColor = '#111d2e';
                if (answered) {
                  if (isCorrect) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                  else if (isSelected) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }
                }
                return (
                  <motion.button
                    key={option.id}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(option.id)}
                    disabled={answered}
                    className="p-3 rounded-lg border text-left transition-all"
                    style={{ borderColor, backgroundColor: bgColor }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {answered && isCorrect && <CheckCircle size={14} className="text-[#00ff41]" />}
                      {answered && isSelected && !isCorrect && <XCircle size={14} className="text-[#ff3366]" />}
                      <span className="text-xs text-[#e0f2fe] font-semibold">{option.label}</span>
                    </div>
                    <code className="text-[10px] text-[#7da0c4] font-mono">{option.command}</code>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4"
              >
                <p className="text-sm text-[#c8dce8]">{scenario.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e0f2fe] font-semibold">Lab Complete</p>
                  <p className="text-xs text-[#7da0c4]">
                    You scored {score}% ({results.filter(Boolean).length}/{SCENARIOS.length} correct)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold" style={{ color: score >= 80 ? '#00ff41' : score >= 60 ? '#ffaa00' : '#ff3366' }}>
                    {score}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3">
            {completed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-sm hover:border-[#ff9500] transition-colors"
              >
                <RotateCcw size={14} />
                Retry
              </motion.button>
            )}
            {answered && !completed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff9500] text-[#0a1628] text-sm font-semibold hover:brightness-110 transition-all"
              >
                Next
                <ChevronRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
