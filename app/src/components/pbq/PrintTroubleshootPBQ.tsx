import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, FileWarning, Wifi, Settings, AlertTriangle, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const printTroubleshootMetadata: PBQMetadata = {
  id: 'print-troubleshoot',
  title: 'Printer Troubleshooting Lab',
  description: 'Troubleshoot common printer issues including paper jams, print quality problems, network printing failures, driver errors, and spooler crashes.',
  difficulty: 2,
  category: 'A+',
  tags: ['printer', 'troubleshooting', 'spooler', 'network-printing', 'drivers'],
  xpReward: 35,
  estimatedTime: '7 min',
};

interface StatusIndicator {
  label: string;
  status: 'ok' | 'warn' | 'error';
}

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  indicators: StatusIndicator[];
  steps: { action: string; result: string }[];
  options: { label: string; correct: boolean }[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Recurring Paper Jam',
    icon: <FileWarning size={20} className="text-[#ff3366]" />,
    description: 'A laser printer jams on every 3rd or 4th page. The jam occurs at the fuser assembly exit. Paper is wrinkled and has toner smears.',
    indicators: [
      { label: 'Toner Level', status: 'ok' },
      { label: 'Fuser Unit', status: 'error' },
      { label: 'Paper Tray', status: 'ok' },
      { label: 'Rollers', status: 'warn' },
    ],
    steps: [
      { action: 'Inspect fuser exit rollers', result: 'Exit rollers show wear marks and glazing' },
      { action: 'Check paper specifications', result: 'Paper weight: 75gsm (within spec)' },
    ],
    options: [
      { label: 'Replace the toner cartridge', correct: false },
      { label: 'Replace the fuser assembly and worn exit rollers', correct: true },
      { label: 'Use thinner paper', correct: false },
      { label: 'Clean the laser scanner mirror', correct: false },
    ],
    explanation: 'Worn and glazed fuser exit rollers fail to grip paper correctly, causing jams at the exit point. The fuser assembly is a consumable part that needs periodic replacement.',
  },
  {
    id: 's2', title: 'Faded and Streaky Prints',
    icon: <AlertTriangle size={20} className="text-[#ffaa00]" />,
    description: 'A laser printer produces faded output with vertical white streaks running down the page. The issue affects all print jobs.',
    indicators: [
      { label: 'Toner Level', status: 'warn' },
      { label: 'Drum Unit', status: 'error' },
      { label: 'Fuser Unit', status: 'ok' },
      { label: 'Transfer Belt', status: 'ok' },
    ],
    steps: [
      { action: 'Print test page', result: 'Vertical white lines visible at consistent intervals' },
      { action: 'Remove drum unit and inspect', result: 'Scratches visible on OPC drum surface' },
    ],
    options: [
      { label: 'Shake the toner cartridge and reinstall', correct: false },
      { label: 'Replace the imaging drum unit', correct: true },
      { label: 'Clean the corona wire', correct: false },
      { label: 'Adjust print density to maximum', correct: false },
    ],
    explanation: 'Scratches on the OPC drum cause consistent vertical streaks. While low toner causes fading, the streaks at consistent intervals point to drum damage requiring replacement.',
  },
  {
    id: 's3', title: 'Network Printer Not Found',
    icon: <Wifi size={20} className="text-[#00d4ff]" />,
    description: 'Ten users report they cannot print to a shared network printer. The printer display shows "Ready" with a valid IP address.',
    indicators: [
      { label: 'Printer Status', status: 'ok' },
      { label: 'Network Link', status: 'ok' },
      { label: 'Print Queue', status: 'error' },
      { label: 'DNS Resolution', status: 'error' },
    ],
    steps: [
      { action: 'Ping printer by IP', result: 'Reply from 192.168.1.200: bytes=32 time<1ms' },
      { action: 'Ping printer by hostname', result: 'Ping request could not find host printer01.corp.local' },
    ],
    options: [
      { label: 'Replace the network cable and switch port', correct: false },
      { label: 'Update the DNS record for the printer or configure clients to use the IP address', correct: true },
      { label: 'Reinstall printer drivers on all ten computers', correct: false },
      { label: 'Factory reset the printer', correct: false },
    ],
    explanation: 'The printer responds by IP but not hostname, indicating a DNS resolution failure. Updating the DNS A record or reconfiguring printer ports to use IP instead of hostname resolves the issue.',
  },
  {
    id: 's4', title: 'Driver Incompatibility After Upgrade',
    icon: <Settings size={20} className="text-[#a855f7]" />,
    description: 'After upgrading to Windows 11, a multifunction printer can scan but cannot print. Error: "Driver is unavailable."',
    indicators: [
      { label: 'Scanner Driver', status: 'ok' },
      { label: 'Print Driver', status: 'error' },
      { label: 'USB Connection', status: 'ok' },
      { label: 'OS Compatibility', status: 'warn' },
    ],
    steps: [
      { action: 'Check Device Manager', result: 'Printer shows with yellow warning: incompatible driver' },
      { action: 'Check manufacturer website', result: 'Windows 11 driver available (v4.2.1), currently installed: v3.8.0' },
    ],
    options: [
      { label: 'Downgrade back to Windows 10', correct: false },
      { label: 'Remove the old driver completely and install the Windows 11 compatible driver from manufacturer', correct: true },
      { label: 'Use the Windows built-in generic print driver', correct: false },
      { label: 'Connect the printer via Wi-Fi instead of USB', correct: false },
    ],
    explanation: 'The old v3.8.0 driver is incompatible with Windows 11. A clean removal followed by installing the manufacturer-provided Windows 11 driver (v4.2.1) restores full print functionality.',
  },
  {
    id: 's5', title: 'Print Spooler Crash Loop',
    icon: <RotateCcw size={20} className="text-[#ff3366]" />,
    description: 'The Windows Print Spooler service crashes immediately after starting. No printers are accessible. Restarting the service fails repeatedly.',
    indicators: [
      { label: 'Spooler Service', status: 'error' },
      { label: 'Event Log', status: 'error' },
      { label: 'Spool Folder', status: 'warn' },
      { label: 'Print Processors', status: 'error' },
    ],
    steps: [
      { action: 'Check Event Viewer', result: 'spoolsv.exe faulting module: third-party print processor DLL' },
      { action: 'Check spool directory', result: 'C:\\Windows\\System32\\spool\\PRINTERS\\ contains 847 stuck print jobs' },
    ],
    options: [
      { label: 'Reinstall Windows to fix the spooler', correct: false },
      { label: 'Stop spooler, clear the spool folder, remove the corrupt print processor, restart spooler', correct: true },
      { label: 'Delete all printers from Control Panel', correct: false },
      { label: 'Run System File Checker only', correct: false },
    ],
    explanation: 'Stuck jobs and a corrupt third-party print processor DLL cause the crash loop. Clearing the spool folder and removing the faulty processor allows the spooler to start cleanly.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function PrintTroubleshootPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [revealedDiags, setRevealedDiags] = useState(0);
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
      setRevealedDiags(0);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  const statusColors = { ok: '#00ff41', warn: '#ffaa00', error: '#ff3366' };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Printer size={16} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">Printer Troubleshooting</span>
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

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-3 mb-4">
                {scenario.indicators.map((ind, i) => (
                  <motion.div key={ind.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="px-3 py-1.5 bg-[#0a1628] border rounded-lg flex items-center gap-2"
                    style={{ borderColor: statusColors[ind.status] }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors[ind.status] }} />
                    <span className="text-xs text-[#c8dce8]">{ind.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Diagnostic Steps */}
              <div className="mb-4 space-y-2">
                {scenario.steps.map((step, i) => (
                  <AnimatePresence key={i}>
                    {i <= revealedDiags && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        className="bg-[#111d2e] border border-[#1a2d45] rounded-lg p-3">
                        <p className="text-xs text-[#00d4ff] mb-1 font-mono">$ {step.action}</p>
                        <p className="text-xs text-[#c8dce8] font-mono">{step.result}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
                {revealedDiags < scenario.steps.length - 1 && (
                  <button onClick={() => setRevealedDiags(prev => prev + 1)} className="text-xs text-[#00d4ff] hover:text-[#00ff41] transition-colors flex items-center gap-1">
                    <Settings size={12} /> Run next diagnostic
                  </button>
                )}
              </div>

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
            <Printer size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Troubleshooting Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} printer issues resolved</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
