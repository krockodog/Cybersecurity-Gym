import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, ThermometerSun, Monitor, MemoryStick, HardDrive, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const hardwareDiagMetadata: PBQMetadata = {
  id: 'hardware-diag',
  title: 'Hardware Diagnostics Lab',
  description: 'Diagnose hardware issues from symptoms like beep codes, POST errors, no display, overheating, and random reboots. Identify the faulty component and select the correct fix.',
  difficulty: 2,
  category: 'A+',
  tags: ['hardware', 'diagnostics', 'troubleshooting', 'POST', 'beep-codes'],
  xpReward: 40,
  estimatedTime: '8 min',
};

interface Scenario {
  id: string;
  title: string;
  symptoms: string[];
  icon: React.ReactNode;
  options: { label: string; correct: boolean; explanation: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'One Long, Two Short Beeps on Startup',
    symptoms: ['System powers on but no display output', 'One long beep followed by two short beeps (AMI BIOS)', 'All fans spinning, HDD activity light on', 'Monitor works with another machine'],
    icon: <Monitor size={20} className="text-[#00d4ff]" />,
    options: [
      { label: 'Replace the RAM modules', correct: false, explanation: 'RAM issues typically produce repeated short beeps.' },
      { label: 'Reseat or replace the video card (GPU)', correct: true, explanation: 'One long + two short beeps in AMI BIOS indicates a video adapter failure.' },
      { label: 'Replace the power supply unit', correct: false, explanation: 'PSU issues cause no power or intermittent shutdowns, not beep codes.' },
      { label: 'Update the BIOS firmware', correct: false, explanation: 'BIOS updates do not resolve hardware detection failures at POST.' },
    ],
  },
  {
    id: 's2', title: 'Continuous Short Beeps at POST',
    symptoms: ['Machine emits continuous short beeps', 'No operating system loads', 'Recently installed new RAM module', 'System was working before RAM upgrade'],
    icon: <MemoryStick size={20} className="text-[#ffaa00]" />,
    options: [
      { label: 'Replace the CPU', correct: false, explanation: 'CPU failures typically cause no POST at all or a single beep pattern.' },
      { label: 'Check and reseat the RAM modules', correct: true, explanation: 'Continuous short beeps indicate a memory (RAM) error. Reseat or test with known-good modules.' },
      { label: 'Replace the motherboard CMOS battery', correct: false, explanation: 'A dead CMOS battery causes clock resets, not continuous beep codes.' },
      { label: 'Reconnect the hard drive SATA cable', correct: false, explanation: 'Hard drive issues do not produce POST beep codes.' },
    ],
  },
  {
    id: 's3', title: 'System Shuts Down After 10 Minutes',
    symptoms: ['PC shuts down unexpectedly after ~10 minutes of use', 'Happens more quickly under heavy load (gaming)', 'CPU temperature reads 98C in BIOS', 'System restarts normally after cooling'],
    icon: <ThermometerSun size={20} className="text-[#ff3366]" />,
    options: [
      { label: 'Replace the power supply with a higher wattage unit', correct: false, explanation: 'PSU wattage issues cause shutdowns under load but temps would be normal.' },
      { label: 'Reapply thermal paste and verify heatsink is seated properly', correct: true, explanation: '98C is critically high. Dried thermal paste or unseated heatsink causes thermal throttling and shutdown.' },
      { label: 'Replace the motherboard', correct: false, explanation: 'Motherboard replacement is unnecessary when the issue is thermal management.' },
      { label: 'Run chkdsk on the system drive', correct: false, explanation: 'Disk errors cause data corruption, not thermal shutdowns.' },
    ],
  },
  {
    id: 's4', title: 'No Power, No Lights, No Fans',
    symptoms: ['Pressing the power button does nothing', 'No LEDs illuminate on the motherboard', 'No fan spin at all', 'Wall outlet confirmed working with another device'],
    icon: <Cpu size={20} className="text-[#a855f7]" />,
    options: [
      { label: 'Replace the video card', correct: false, explanation: 'A faulty GPU still allows the system to power on (fans, lights).' },
      { label: 'Replace or test the power supply unit (PSU)', correct: true, explanation: 'No power at all with a known-good outlet points to a dead PSU or failed power switch.' },
      { label: 'Reinstall the operating system', correct: false, explanation: 'Software cannot cause a complete failure to power on.' },
      { label: 'Replace the SATA cables', correct: false, explanation: 'Drive cables have no effect on system power delivery.' },
    ],
  },
  {
    id: 's5', title: 'Random Blue Screen and Reboots',
    symptoms: ['Frequent BSOD with WHEA_UNCORRECTABLE_ERROR', 'Crashes happen at random, not during specific tasks', 'MemTest86 reports errors on test pass 3', 'System is two years old, no recent changes'],
    icon: <HardDrive size={20} className="text-[#00ff41]" />,
    options: [
      { label: 'Update Windows and all device drivers', correct: false, explanation: 'Driver updates may help some BSODs, but MemTest86 errors indicate hardware failure.' },
      { label: 'Replace the faulty RAM module identified by MemTest86', correct: true, explanation: 'WHEA errors combined with MemTest86 failures confirm a defective RAM module.' },
      { label: 'Perform a clean Windows installation', correct: false, explanation: 'A clean install cannot fix hardware-level memory errors.' },
      { label: 'Replace the hard drive', correct: false, explanation: 'MemTest86 tests RAM, not storage. The issue is a faulty memory module.' },
    ],
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function HardwareDiagPBQ({ onComplete }: Props) {
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
    const isCorrect = scenario.options[idx].correct;
    if (isCorrect) {
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
      const finalScore = Math.round(((correctCount) / SCENARIOS.length) * 100);
      setCompleted(true);
      onComplete?.(finalScore);
    }
  }, [currentStep, correctCount, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cpu size={16} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">Hardware Diagnostics</span>
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
                <span className="ml-auto text-xs text-[#4a6682]">Scenario {currentStep + 1}/{SCENARIOS.length}</span>
              </div>
              <div className="space-y-2 mb-4">
                {scenario.symptoms.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2 text-sm text-[#c8dce8]">
                    <ChevronRight size={14} className="text-[#00d4ff] mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-[#7da0c4] mb-3">Select the correct diagnosis and fix:</p>
              <div className="space-y-2">
                {scenario.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const showResult = answered;
                  let borderColor = '#1a2d45';
                  let bgColor = 'transparent';
                  if (showResult && opt.correct) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                  else if (showResult && isSelected && !opt.correct) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }
                  else if (isSelected) { borderColor = '#00d4ff'; }

                  return (
                    <motion.button key={i} whileHover={!answered ? { scale: 1.01, x: 4 } : {}} whileTap={!answered ? { scale: 0.99 } : {}}
                      onClick={() => handleSelect(i)}
                      className="w-full text-left px-4 py-3 border rounded-lg text-sm transition-all flex items-center gap-3"
                      style={{ borderColor, backgroundColor: bgColor, color: '#e0f2fe' }}>
                      <span className="text-[#00d4ff] font-mono">{String.fromCharCode(65 + i)}.</span>
                      <span className="flex-1">{opt.label}</span>
                      {showResult && opt.correct && <CheckCircle2 size={16} className="text-[#00ff41]" />}
                      {showResult && isSelected && !opt.correct && <XCircle size={16} className="text-[#ff3366]" />}
                    </motion.button>
                  );
                })}
              </div>
              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-[#1a2d45] rounded-lg bg-[#111d2e]">
                  <p className="text-xs text-[#c8dce8]">{scenario.options[selected!].explanation}</p>
                </motion.div>
              )}
            </div>
            {answered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button onClick={handleNext}
                  className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                  {currentStep < SCENARIOS.length - 1 ? 'Next Scenario' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <Cpu size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Diagnostics Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} hardware issues correctly diagnosed</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
