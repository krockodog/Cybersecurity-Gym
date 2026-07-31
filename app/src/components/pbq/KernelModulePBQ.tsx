import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, CheckCircle, XCircle, Terminal, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const kernelModuleMetadata: PBQMetadata = {
  id: 'kernel-module',
  title: 'Kernel Module Manager',
  description: 'Manage Linux kernel modules by loading, unloading, inspecting, and configuring them using lsmod, modprobe, modinfo, rmmod, and /etc/modules.',
  difficulty: 3,
  category: 'Linux+',
  tags: ['kernel', 'modules', 'modprobe', 'lsmod', 'drivers'],
  xpReward: 50,
  estimatedTime: '8 min',
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
    id: 'list-modules',
    title: 'Identify Loaded Modules',
    prompt: 'A network adapter is not functioning. You need to check if the appropriate kernel module is currently loaded. Which command lists all loaded kernel modules?',
    terminalOutput: '$ _\n\nThe NIC eth1 is showing "NO-CARRIER" in ip link output.\nYou suspect the driver module may not be loaded.',
    options: [
      { id: 'a', label: 'lsmod', command: 'lsmod | grep e1000' },
      { id: 'b', label: 'modprobe --list', command: 'modprobe --list' },
      { id: 'c', label: 'cat /proc/devices', command: 'cat /proc/devices' },
      { id: 'd', label: 'dmesg | grep mod', command: 'dmesg | grep mod' },
    ],
    correctId: 'a',
    explanation: 'lsmod reads /proc/modules to display all currently loaded kernel modules. Filtering with grep helps locate a specific driver like e1000.',
  },
  {
    id: 'load-module',
    title: 'Load a Kernel Module',
    prompt: 'The vfat filesystem module is needed to mount a USB drive but is not loaded. Which command loads it with proper dependency resolution?',
    terminalOutput: '$ mount /dev/sdb1 /mnt/usb\nmount: unknown filesystem type \'vfat\'\n\n$ lsmod | grep vfat\n(no output)',
    options: [
      { id: 'a', label: 'insmod vfat', command: 'insmod vfat' },
      { id: 'b', label: 'modprobe vfat', command: 'modprobe vfat' },
      { id: 'c', label: 'depmod vfat', command: 'depmod vfat' },
      { id: 'd', label: 'modinfo --load vfat', command: 'modinfo --load vfat' },
    ],
    correctId: 'b',
    explanation: 'modprobe loads the module and automatically resolves and loads any dependencies. insmod loads a module by path without handling dependencies.',
  },
  {
    id: 'module-info',
    title: 'Inspect Module Details',
    prompt: 'Before loading a third-party module, you need to verify its author, license, and supported parameters. Which command provides this information?',
    terminalOutput: '$ ls /lib/modules/$(uname -r)/extra/\ncustom_net.ko\n\nYou need to inspect this module before loading.',
    options: [
      { id: 'a', label: 'modprobe -v custom_net', command: 'modprobe -v custom_net' },
      { id: 'b', label: 'file custom_net.ko', command: 'file /lib/modules/$(uname -r)/extra/custom_net.ko' },
      { id: 'c', label: 'modinfo custom_net', command: 'modinfo custom_net' },
      { id: 'd', label: 'strings custom_net.ko', command: 'strings custom_net.ko | head' },
    ],
    correctId: 'c',
    explanation: 'modinfo displays metadata embedded in a kernel module including filename, license, author, description, parameters, and dependencies.',
  },
  {
    id: 'remove-module',
    title: 'Remove a Faulty Module',
    prompt: 'A kernel module (nouveau) is conflicting with the proprietary NVIDIA driver. You need to remove it from the running kernel. Which approach is correct?',
    terminalOutput: '$ lsmod | grep nouveau\nnouveau              1863680  3\nmxm_wmi                16384  1 nouveau\ndrm_kms_helper        200704  1 nouveau\n\nModule is in use by 3 other modules.',
    options: [
      { id: 'a', label: 'rmmod nouveau', command: 'rmmod nouveau' },
      { id: 'b', label: 'modprobe -r nouveau', command: 'modprobe -r nouveau' },
      { id: 'c', label: 'modprobe --remove-dependencies nouveau', command: 'modprobe --remove-dependencies nouveau' },
      { id: 'd', label: 'Blacklist then reboot', command: 'echo "blacklist nouveau" >> /etc/modprobe.d/blacklist.conf && reboot' },
    ],
    correctId: 'd',
    explanation: 'When a module has active dependents (use count > 0), it cannot be directly removed. Blacklisting in /etc/modprobe.d/ prevents loading on boot, and a reboot applies the change.',
  },
  {
    id: 'persist-module',
    title: 'Persist Module Across Reboots',
    prompt: 'You loaded the bonding module for NIC teaming. It works now but must survive reboots. Where should you add it for automatic loading?',
    terminalOutput: '$ modprobe bonding mode=802.3ad\n$ lsmod | grep bonding\nbonding               163840  0\n\nModule loaded successfully but will not persist after reboot.',
    options: [
      { id: 'a', label: '/etc/rc.local', command: 'echo "modprobe bonding" >> /etc/rc.local' },
      { id: 'b', label: '/etc/modules-load.d/', command: 'echo "bonding" > /etc/modules-load.d/bonding.conf' },
      { id: 'c', label: '/boot/grub/grub.cfg', command: 'echo "bonding" >> /boot/grub/grub.cfg' },
      { id: 'd', label: '/etc/sysctl.conf', command: 'echo "bonding" >> /etc/sysctl.conf' },
    ],
    correctId: 'b',
    explanation: 'On systemd-based systems, modules listed in /etc/modules-load.d/*.conf are automatically loaded at boot by the systemd-modules-load service.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function KernelModulePBQ({ onComplete }: Props) {
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
    if (correct) {
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
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
          <Cpu size={16} className="text-[#ff9500]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Kernel Module Management</span>
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
