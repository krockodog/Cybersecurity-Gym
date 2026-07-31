import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, Cpu, Lock, HardDrive, CheckCircle2, XCircle, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const biosConfigMetadata: PBQMetadata = {
  id: 'bios-config',
  title: 'BIOS/UEFI Configuration Lab',
  description: 'Configure BIOS/UEFI settings including boot order, Secure Boot, virtualization, TPM, and system passwords across five configuration tasks.',
  difficulty: 3,
  category: 'A+',
  tags: ['BIOS', 'UEFI', 'boot-order', 'secure-boot', 'TPM'],
  xpReward: 45,
  estimatedTime: '8 min',
};

interface BiosSetting {
  name: string;
  currentValue: string;
  options: string[];
  correctValue: string;
}

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  objective: string;
  settings: BiosSetting[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Configure Boot Order for OS Install',
    icon: <HardDrive size={20} className="text-[#00d4ff]" />,
    objective: 'Set up the boot order to install Windows from a USB drive, then boot from the NVMe SSD afterward.',
    settings: [
      { name: 'Boot Option #1', currentValue: 'NVMe SSD', options: ['NVMe SSD', 'USB Drive', 'Network PXE', 'DVD-ROM'], correctValue: 'USB Drive' },
      { name: 'Boot Option #2', currentValue: 'DVD-ROM', options: ['NVMe SSD', 'USB Drive', 'Network PXE', 'DVD-ROM'], correctValue: 'NVMe SSD' },
      { name: 'Boot Mode', currentValue: 'Legacy', options: ['Legacy', 'UEFI', 'CSM'], correctValue: 'UEFI' },
    ],
    explanation: 'USB must be first for installation media. UEFI mode is required for GPT partitioning and modern Windows features.',
  },
  {
    id: 's2', title: 'Enable Secure Boot for Windows 11',
    icon: <Shield size={20} className="text-[#00ff41]" />,
    objective: 'Configure UEFI Secure Boot and TPM to meet Windows 11 hardware requirements.',
    settings: [
      { name: 'Secure Boot', currentValue: 'Disabled', options: ['Disabled', 'Enabled'], correctValue: 'Enabled' },
      { name: 'Secure Boot Mode', currentValue: 'Custom', options: ['Standard', 'Custom'], correctValue: 'Standard' },
      { name: 'TPM 2.0', currentValue: 'Disabled', options: ['Disabled', 'Enabled'], correctValue: 'Enabled' },
    ],
    explanation: 'Windows 11 requires Secure Boot in Standard mode with TPM 2.0 enabled. Custom mode is for key management by advanced users.',
  },
  {
    id: 's3', title: 'Enable Virtualization Support',
    icon: <Cpu size={20} className="text-[#a855f7]" />,
    objective: 'Enable hardware virtualization for running VMs with Hyper-V and Docker Desktop.',
    settings: [
      { name: 'Intel VT-x / AMD-V', currentValue: 'Disabled', options: ['Disabled', 'Enabled'], correctValue: 'Enabled' },
      { name: 'VT-d / IOMMU', currentValue: 'Disabled', options: ['Disabled', 'Enabled'], correctValue: 'Enabled' },
      { name: 'Hyper-Threading', currentValue: 'Disabled', options: ['Disabled', 'Enabled'], correctValue: 'Enabled' },
    ],
    explanation: 'VT-x/AMD-V enables CPU virtualization. VT-d/IOMMU allows direct device access from VMs. Hyper-Threading improves VM performance.',
  },
  {
    id: 's4', title: 'Set BIOS Security Passwords',
    icon: <Lock size={20} className="text-[#ffaa00]" />,
    objective: 'Secure the system by configuring appropriate password protections. The supervisor password should restrict BIOS access, and the user password should be required at boot.',
    settings: [
      { name: 'Supervisor Password', currentValue: 'Not Set', options: ['Not Set', 'Set'], correctValue: 'Set' },
      { name: 'User Password', currentValue: 'Not Set', options: ['Not Set', 'Set'], correctValue: 'Set' },
      { name: 'Password on Boot', currentValue: 'Disabled', options: ['Disabled', 'Enabled'], correctValue: 'Enabled' },
    ],
    explanation: 'Supervisor password prevents unauthorized BIOS changes. User password at boot prevents unauthorized system access. Both layers are needed for physical security.',
  },
  {
    id: 's5', title: 'Configure Power and Performance',
    icon: <Settings size={20} className="text-[#00d4ff]" />,
    objective: 'Configure a workstation for maximum performance: enable XMP for RAM, set the CPU profile to performance, and disable power-saving features that throttle the CPU.',
    settings: [
      { name: 'XMP Profile', currentValue: 'Disabled', options: ['Disabled', 'Profile 1', 'Profile 2'], correctValue: 'Profile 1' },
      { name: 'CPU Power Profile', currentValue: 'Power Saving', options: ['Power Saving', 'Balanced', 'Performance'], correctValue: 'Performance' },
      { name: 'C-States', currentValue: 'Enabled', options: ['Disabled', 'Enabled'], correctValue: 'Disabled' },
    ],
    explanation: 'XMP Profile 1 runs RAM at rated speeds. Performance CPU profile prevents throttling. Disabling C-States prevents power-saving sleep states that add latency.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function BIOSConfigPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const score = Math.round((correctCount / SCENARIOS.length) * 100);

  const handleSettingChange = useCallback((settingName: string, value: string) => {
    if (submitted) return;
    setSelections(prev => ({ ...prev, [settingName]: value }));
  }, [submitted]);

  const handleSubmit = useCallback(() => {
    const allCorrect = scenario.settings.every(s => (selections[s.name] || s.currentValue) === s.correctValue);
    setSubmitted(true);
    if (allCorrect) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [scenario, selections]);

  const handleNext = useCallback(() => {
    if (currentStep < SCENARIOS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelections({});
      setSubmitted(false);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">BIOS/UEFI Configuration</span>
        </div>
        <ProgressTracker current={currentStep + (submitted ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            {/* BIOS Header Bar */}
            <div className="bg-[#0a0e17] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
                <div className="flex items-center gap-2">
                  {scenario.icon}
                  <span className="text-sm font-semibold text-[#e0f2fe]">{scenario.title}</span>
                </div>
                <span className="text-xs text-[#4a6682]">Task {currentStep + 1}/{SCENARIOS.length}</span>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#c8dce8] mb-5">{scenario.objective}</p>

                <div className="space-y-3">
                  {scenario.settings.map((setting, i) => {
                    const currentVal = selections[setting.name] || setting.currentValue;
                    const isCorrect = currentVal === setting.correctValue;

                    return (
                      <motion.div key={setting.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 bg-[#0d1526] border rounded-lg"
                        style={{ borderColor: submitted ? (isCorrect ? '#00ff41' : '#ff3366') : '#1a2d45' }}>
                        <div className="flex items-center gap-2">
                          {submitted ? (
                            isCorrect ? <CheckCircle2 size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
                          ) : (
                            currentVal !== setting.currentValue ? <ToggleRight size={14} className="text-[#00d4ff]" /> : <ToggleLeft size={14} className="text-[#4a6682]" />
                          )}
                          <span className="text-sm text-[#c8dce8]">{setting.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {setting.options.map(opt => (
                            <button key={opt} onClick={() => handleSettingChange(setting.name, opt)}
                              disabled={submitted}
                              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                                currentVal === opt
                                  ? 'bg-[#00d4ff] text-[#0a0e17] font-bold'
                                  : 'bg-[#1a2d45] text-[#7da0c4] hover:bg-[#243b5c]'
                              } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {submitted && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-[#1a2d45] rounded-lg bg-[#111d2e]">
                    <p className="text-xs text-[#c8dce8]">{scenario.explanation}</p>
                    {submitted && (
                      <p className="text-xs mt-2 font-mono" style={{ color: scenario.settings.every(s => (selections[s.name] || s.currentValue) === s.correctValue) ? '#00ff41' : '#ffaa00' }}>
                        {scenario.settings.filter(s => (selections[s.name] || s.currentValue) === s.correctValue).length}/{scenario.settings.length} settings correct
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {!submitted && (
                <button onClick={handleSubmit} className="px-5 py-2 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm hover:bg-[rgba(0,212,255,0.1)] transition-all">
                  Apply Settings
                </button>
              )}
              {submitted && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button onClick={handleNext} className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                    {currentStep < SCENARIOS.length - 1 ? 'Next Task' : 'Finish'} <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <Settings size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Configuration Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} BIOS tasks configured correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
