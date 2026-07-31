import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorX, AlertTriangle, Search, CheckCircle2, XCircle, ChevronRight, RotateCcw, Gauge } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const osTroubleshootMetadata: PBQMetadata = {
  id: 'os-troubleshoot',
  title: 'OS Troubleshooting Simulator',
  description: 'Troubleshoot common operating system issues including BSOD errors, boot failures, slow performance, driver conflicts, and update failures through diagnostic steps.',
  difficulty: 2,
  category: 'A+',
  tags: ['os', 'troubleshooting', 'windows', 'BSOD', 'boot'],
  xpReward: 40,
  estimatedTime: '8 min',
};

interface DiagStep {
  action: string;
  result: string;
}

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  diagnosticSteps: DiagStep[];
  question: string;
  options: { label: string; correct: boolean }[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Blue Screen: IRQL_NOT_LESS_OR_EQUAL',
    icon: <MonitorX size={20} className="text-[#00d4ff]" />,
    description: 'A workstation crashes with a BSOD showing IRQL_NOT_LESS_OR_EQUAL after a new network adapter was installed.',
    diagnosticSteps: [
      { action: 'Check Event Viewer', result: 'BugCheck 0x0000000A referencing ndis.sys' },
      { action: 'Run Driver Verifier', result: 'Fault detected in RTL8168.sys (Realtek NIC driver)' },
      { action: 'Check Device Manager', result: 'Network adapter shows yellow exclamation mark' },
    ],
    question: 'What is the correct resolution?',
    options: [
      { label: 'Run sfc /scannow to repair system files', correct: false },
      { label: 'Roll back or update the network adapter driver', correct: true },
      { label: 'Increase the virtual memory page file size', correct: false },
      { label: 'Replace the RAM modules', correct: false },
    ],
    explanation: 'The IRQL BSOD with ndis.sys and a flagged NIC driver confirms a driver-level conflict. Rolling back or updating the driver resolves it.',
  },
  {
    id: 's2', title: 'Boot Failure: "No bootable device found"',
    icon: <AlertTriangle size={20} className="text-[#ff3366]" />,
    description: 'After a power outage, a PC displays "No bootable device found" on startup.',
    diagnosticSteps: [
      { action: 'Enter BIOS Setup', result: 'Boot order shows USB as first, SSD not listed' },
      { action: 'Check SATA connections', result: 'SATA cable to SSD is loose' },
      { action: 'Reconnect cable and recheck BIOS', result: 'SSD now detected: Samsung 970 EVO 500GB' },
    ],
    question: 'What steps resolve this issue?',
    options: [
      { label: 'Reinstall the operating system', correct: false },
      { label: 'Reseat the SATA cable and set SSD as first boot device', correct: true },
      { label: 'Replace the motherboard CMOS battery', correct: false },
      { label: 'Flash the BIOS to the latest version', correct: false },
    ],
    explanation: 'The loose SATA cable prevented SSD detection. Reseating the cable and correcting boot order resolves the issue without data loss.',
  },
  {
    id: 's3', title: 'Slow Performance After Update',
    icon: <Gauge size={20} className="text-[#ffaa00]" />,
    description: 'A laptop became extremely slow after a major Windows feature update. Applications take minutes to launch.',
    diagnosticSteps: [
      { action: 'Open Task Manager', result: 'Disk usage at 100% - Windows Search Indexer and Windows Update running' },
      { action: 'Check Resource Monitor', result: 'SearchIndexer.exe reading thousands of files, WudfHost consuming high I/O' },
      { action: 'Check Windows Update', result: 'Post-update optimization: "Working on updates 45%... Do not turn off"' },
    ],
    question: 'What is the appropriate action?',
    options: [
      { label: 'Immediately roll back the update using System Restore', correct: false },
      { label: 'Allow post-update indexing and optimization to complete, then monitor', correct: true },
      { label: 'Replace the hard drive with an SSD immediately', correct: false },
      { label: 'Disable Windows Search and Windows Update services permanently', correct: false },
    ],
    explanation: 'Post-update indexing and optimization cause temporary high disk usage. Waiting for completion is the correct first step before further diagnosis.',
  },
  {
    id: 's4', title: 'Driver Conflict: Audio Not Working',
    icon: <Search size={20} className="text-[#a855f7]" />,
    description: 'After installing a USB audio interface, the built-in speakers stopped working entirely. No sound from any output.',
    diagnosticSteps: [
      { action: 'Check Sound Settings', result: 'Default output device changed to "USB Audio CODEC"' },
      { action: 'Open Device Manager', result: 'Two audio devices present, built-in shows "This device cannot start (Code 10)"' },
      { action: 'Check driver dates', result: 'USB audio driver (2024) conflicts with Realtek HD Audio driver (2022)' },
    ],
    question: 'What resolves the audio conflict?',
    options: [
      { label: 'Uninstall both audio drivers and let Windows reinstall them', correct: false },
      { label: 'Set built-in speakers as default and update the Realtek driver', correct: true },
      { label: 'Disable the USB audio interface in BIOS', correct: false },
      { label: 'Run the Windows audio troubleshooter only', correct: false },
    ],
    explanation: 'A Code 10 error with an outdated driver needs an update. Setting the correct default output device and updating the conflicting driver resolves both issues.',
  },
  {
    id: 's5', title: 'Windows Update Failure: Error 0x80070002',
    icon: <RotateCcw size={20} className="text-[#00ff41]" />,
    description: 'Windows Update repeatedly fails with error 0x80070002. The system has not received updates for 3 months.',
    diagnosticSteps: [
      { action: 'Check Windows Update logs', result: 'SoftwareDistribution folder corrupted - hash mismatch errors' },
      { action: 'Run sfc /scannow', result: 'Windows Resource Protection found corrupt files but was unable to fix some' },
      { action: 'Run DISM /Online /Cleanup-Image /CheckHealth', result: 'Component store corruption detected' },
    ],
    question: 'What is the correct repair sequence?',
    options: [
      { label: 'Perform a clean Windows installation', correct: false },
      { label: 'Run DISM /RestoreHealth first, then sfc /scannow, then retry updates', correct: true },
      { label: 'Delete System32 folder and restore from backup', correct: false },
      { label: 'Disable Windows Update and use manual update packages', correct: false },
    ],
    explanation: 'DISM /RestoreHealth repairs the component store using Windows Update sources. After that, sfc can fix remaining file corruption, enabling updates to proceed.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function OSTroubleshootPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const score = Math.round((correctCount / SCENARIOS.length) * 100);

  const revealNext = useCallback(() => {
    if (revealedSteps < scenario.diagnosticSteps.length) {
      setRevealedSteps(prev => prev + 1);
    }
  }, [revealedSteps, scenario]);

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (scenario.options[idx].correct) {
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
      setRevealedSteps(0);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MonitorX size={16} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">OS Troubleshooting</span>
        </div>
        <ProgressTracker current={currentStep + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                {scenario.icon}
                <h3 className="text-base font-semibold text-[#e0f2fe]">{scenario.title}</h3>
                <span className="ml-auto text-xs text-[#4a6682]">{currentStep + 1}/{SCENARIOS.length}</span>
              </div>
              <p className="text-sm text-[#c8dce8] mb-4">{scenario.description}</p>

              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-[#7da0c4] uppercase">Diagnostic Steps</h4>
                  {revealedSteps < scenario.diagnosticSteps.length && (
                    <button onClick={revealNext} className="text-xs text-[#00d4ff] hover:text-[#00ff41] transition-colors flex items-center gap-1">
                      <Search size={12} /> Run next diagnostic
                    </button>
                  )}
                </div>
                {scenario.diagnosticSteps.map((step, i) => (
                  <AnimatePresence key={i}>
                    {i < revealedSteps && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-[#111d2e] border border-[#1a2d45] rounded-lg p-3">
                        <p className="text-xs text-[#00d4ff] mb-1 font-mono">$ {step.action}</p>
                        <p className="text-xs text-[#c8dce8] font-mono">{step.result}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>

              <p className="text-xs text-[#7da0c4] mb-3">{scenario.question}</p>
              <div className="space-y-2">
                {scenario.options.map((opt, i) => {
                  let borderColor = '#1a2d45';
                  let bgColor = 'transparent';
                  if (answered && opt.correct) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                  else if (answered && selected === i && !opt.correct) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }

                  return (
                    <motion.button key={i} whileHover={!answered ? { scale: 1.01, x: 4 } : {}} whileTap={!answered ? { scale: 0.99 } : {}}
                      onClick={() => handleSelect(i)}
                      className="w-full text-left px-4 py-3 border rounded-lg text-sm transition-all flex items-center gap-3"
                      style={{ borderColor, backgroundColor: bgColor, color: '#e0f2fe' }}>
                      <span className="text-[#00d4ff] font-mono">{String.fromCharCode(65 + i)}.</span>
                      <span className="flex-1">{opt.label}</span>
                      {answered && opt.correct && <CheckCircle2 size={16} className="text-[#00ff41]" />}
                      {answered && selected === i && !opt.correct && <XCircle size={16} className="text-[#ff3366]" />}
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
            {answered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button onClick={handleNext} className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                  {currentStep < SCENARIOS.length - 1 ? 'Next Scenario' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <MonitorX size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Troubleshooting Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} OS issues correctly resolved</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
