import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Database, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const forensicsMetadata: PBQMetadata = {
  id: 'forensics',
  title: 'Digital Forensics Lab',
  description: 'Perform digital forensics tasks including evidence collection, chain of custody, disk imaging, memory analysis, and artifact recovery.',
  difficulty: 4,
  category: 'CySA+',
  tags: ['forensics', 'evidence', 'chain-of-custody', 'disk-imaging', 'memory-analysis'],
  xpReward: 55,
  estimatedTime: '9 min',
};

interface EvidenceItem {
  label: string;
  value: string;
  type: 'procedure' | 'artifact' | 'tool' | 'finding';
}

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  evidence: EvidenceItem[];
  options: { id: string; label: string; detail: string }[];
  correctId: string;
  explanation: string;
}

const typeColors: Record<string, string> = {
  procedure: '#00d4ff',
  artifact: '#ffaa00',
  tool: '#a855f7',
  finding: '#00ff41',
};

const SCENARIOS: Scenario[] = [
  {
    id: 'evidence-collection',
    title: 'Evidence Collection Order',
    prompt: 'You arrive at a scene with a running suspect workstation. In what order should you collect volatile evidence to preserve the most ephemeral data first?',
    evidence: [
      { label: 'CPU Registers', value: 'Most volatile - lost on any state change', type: 'artifact' },
      { label: 'RAM Contents', value: 'Running processes, network connections, encryption keys', type: 'artifact' },
      { label: 'Disk Cache', value: 'Filesystem cache, swap space', type: 'artifact' },
      { label: 'Hard Drive', value: 'Persistent storage - files, logs, registry', type: 'artifact' },
      { label: 'Removable Media', value: 'USB drives, SD cards, external drives', type: 'artifact' },
    ],
    options: [
      { id: 'a', label: 'Most volatile first: Registers > RAM > Cache > Disk > Removable', detail: 'Follow RFC 3227 order of volatility from most to least volatile' },
      { id: 'b', label: 'Hard drive first, then work backward', detail: 'Disk contains the most evidence, prioritize it' },
      { id: 'c', label: 'Power off immediately, then image the disk', detail: 'Prevent any further changes by killing power' },
      { id: 'd', label: 'Removable media first as it can be easily hidden', detail: 'Secure physical evidence that could be destroyed' },
    ],
    correctId: 'a',
    explanation: 'RFC 3227 establishes the order of volatility: collect the most volatile evidence first (registers, cache, RAM) before it is lost, then proceed to less volatile sources (disk, removable media).',
  },
  {
    id: 'chain-of-custody',
    title: 'Chain of Custody Documentation',
    prompt: 'A forensic image has been acquired. Which documentation element is most critical for the evidence to be admissible in court?',
    evidence: [
      { label: 'Acquisition Tool', value: 'FTK Imager v4.7.1', type: 'tool' },
      { label: 'Image Format', value: 'E01 (Expert Witness Format)', type: 'procedure' },
      { label: 'Source Drive', value: 'Samsung 870 EVO 1TB, S/N: S5XXNX0R123456', type: 'artifact' },
      { label: 'MD5 Hash', value: '7f83b1657ff1fc53b92dc18148a1d65d', type: 'finding' },
      { label: 'SHA-256 Hash', value: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', type: 'finding' },
    ],
    options: [
      { id: 'a', label: 'Cryptographic hash verification at every transfer', detail: 'Hash values must match at acquisition and each custody transfer to prove integrity' },
      { id: 'b', label: 'Using the most expensive forensic tool', detail: 'Commercial tools are more trusted than open source' },
      { id: 'c', label: 'Storing evidence on the fastest storage', detail: 'Speed ensures timely analysis' },
      { id: 'd', label: 'Password-protecting the image file', detail: 'Encryption prevents unauthorized access' },
    ],
    correctId: 'a',
    explanation: 'Cryptographic hash verification is the cornerstone of digital evidence integrity. If the hash changes at any point in the chain of custody, the evidence may be deemed tampered with and inadmissible.',
  },
  {
    id: 'disk-imaging',
    title: 'Forensic Disk Imaging',
    prompt: 'You need to create a forensic image of a suspect hard drive. Which approach maintains forensic soundness?',
    evidence: [
      { label: 'Target', value: '/dev/sdb - 500GB Western Digital, S/N: WD-XXXX1234', type: 'artifact' },
      { label: 'Write Blocker', value: 'Tableau T35u hardware write blocker connected', type: 'tool' },
      { label: 'Destination', value: '/evidence/case2025-001/ on forensic workstation', type: 'procedure' },
      { label: 'Requirement', value: 'Must be verifiable and court-admissible', type: 'procedure' },
    ],
    options: [
      { id: 'a', label: 'dd with write blocker and hash verification', detail: 'dd if=/dev/sdb | tee image.raw | sha256sum > hash.txt (through write blocker)' },
      { id: 'b', label: 'cp -a /dev/sdb /evidence/', detail: 'Copy the device node to preserve all attributes' },
      { id: 'c', label: 'Mount and copy files of interest', detail: 'Mount the drive read-write and copy relevant files' },
      { id: 'd', label: 'Use dd without write blocker', detail: 'dd is forensically sound by itself, write blocker is optional' },
    ],
    correctId: 'a',
    explanation: 'A hardware write blocker prevents any writes to the source drive. dd creates a bit-for-bit image, and simultaneously hashing during acquisition provides immediate integrity verification.',
  },
  {
    id: 'memory-analysis',
    title: 'Memory Forensics',
    prompt: 'A RAM dump was captured from a compromised server. Which Volatility plugin output reveals active malware beaconing?',
    evidence: [
      { label: 'Memory Dump', value: 'memdump.raw - 16GB captured with WinPMem', type: 'artifact' },
      { label: 'Profile', value: 'Win10x64_19041 (Windows 10 20H1)', type: 'procedure' },
      { label: 'Suspicious Process', value: 'svchost32.exe (PID 4892) - note: legitimate is svchost.exe', type: 'finding' },
      { label: 'Parent Process', value: 'PID 4892 parent is explorer.exe (unusual for svchost)', type: 'finding' },
    ],
    options: [
      { id: 'a', label: 'netscan - shows active network connections per process', detail: 'Reveals which processes have established connections to external IPs (C2 beaconing)' },
      { id: 'b', label: 'filescan - lists open file handles', detail: 'Shows files accessed by each process' },
      { id: 'c', label: 'hivelist - enumerates registry hives', detail: 'Shows loaded registry hives in memory' },
      { id: 'd', label: 'timeliner - creates a timeline', detail: 'Generates a chronological event timeline' },
    ],
    correctId: 'a',
    explanation: 'netscan reveals active and recently closed network connections per process, directly showing C2 beaconing activity (IP, port, connection state) linked to the suspicious svchost32.exe process.',
  },
  {
    id: 'artifact-recovery',
    title: 'Artifact Recovery and Analysis',
    prompt: 'During examination, you need to recover evidence of a deleted file that was used for data exfiltration. Which artifact is most reliable?',
    evidence: [
      { label: 'MFT Entry', value: '$MFT record shows deleted file "exfil_data.7z" (512MB)', type: 'artifact' },
      { label: 'USN Journal', value: 'Records file creation, rename to "temp.dat", and deletion', type: 'artifact' },
      { label: 'Prefetch', value: '7Z.EXE-A1B2C3D4.pf shows 7z.exe was executed 3 times', type: 'artifact' },
      { label: 'ShimCache', value: 'AppCompatCache shows WinSCP.exe execution (SFTP client)', type: 'artifact' },
      { label: 'Disk Sectors', value: 'File data may be partially overwritten by new allocations', type: 'finding' },
    ],
    options: [
      { id: 'a', label: 'NTFS $MFT + $UsnJrnl combined analysis', detail: 'MFT metadata + USN Journal timeline provides complete file lifecycle even after deletion' },
      { id: 'b', label: 'File carving from unallocated space', detail: 'Recover the actual file content from disk sectors' },
      { id: 'c', label: 'Windows Event Logs only', detail: 'Security event logs track all file operations' },
      { id: 'd', label: 'Registry LastWrite timestamps', detail: 'Registry keys show when applications were last used' },
    ],
    correctId: 'a',
    explanation: 'The $MFT retains metadata (filename, timestamps, size) for deleted files until the record is reused. The $UsnJrnl provides a change journal showing creation, modification, and deletion events with timestamps.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ForensicsPBQ({ onComplete }: Props) {
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
    if (step === SCENARIOS.length - 1) { setCompleted(true); onComplete?.(newScore); }
  }, [answered, scenario, results, step, onComplete]);

  const handleNext = useCallback(() => {
    if (step < SCENARIOS.length - 1) { setStep(s => s + 1); setSelected(null); setAnswered(false); }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep(0); setScore(0); setSelected(null); setAnswered(false);
    setStreak(0); setCompleted(false); setResults([]);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-[#e63946]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Digital Forensics Lab</span>
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
              <span className="px-2 py-0.5 bg-[rgba(230,57,70,0.15)] text-[#e63946] rounded text-xs font-semibold">
                Step {step + 1}/{SCENARIOS.length}
              </span>
              <h3 className="text-sm text-[#e0f2fe] font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-[#c8dce8] mb-4">{scenario.prompt}</p>

            <div className="bg-[#050d18] border border-[#1a2d45] rounded-lg p-3 mb-4 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3 text-[#4a6682] text-xs">
                <Database size={12} />
                <span>Evidence Items</span>
              </div>
              <div className="space-y-2 min-w-[400px]">
                {scenario.evidence.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-xs"
                  >
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0 capitalize"
                      style={{ color: typeColors[item.type], backgroundColor: `${typeColors[item.type]}15` }}
                    >
                      {item.type}
                    </span>
                    <span className="text-[#4a6682] font-semibold shrink-0 w-28">{item.label}</span>
                    <span className="text-[#c8dce8] font-mono text-[11px]">{item.value}</span>
                  </motion.div>
                ))}
              </div>
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
                    <p className="text-[10px] text-[#7da0c4]">{option.detail}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#c8dce8]">{scenario.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            {completed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-sm hover:border-[#e63946] transition-colors">
                <RotateCcw size={14} /> Retry
              </motion.button>
            )}
            {answered && !completed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e63946] text-white text-sm font-semibold hover:brightness-110 transition-all">
                Next <ChevronRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
