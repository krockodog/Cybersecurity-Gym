import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, BatteryWarning, Wifi, MonitorSmartphone, Bug, RefreshCw, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const mobileRepairMetadata: PBQMetadata = {
  id: 'mobile-repair',
  title: 'Mobile Device Repair Lab',
  description: 'Troubleshoot mobile device issues including battery drain, connectivity problems, broken screens, malware infections, and sync failures.',
  difficulty: 2,
  category: 'A+',
  tags: ['mobile', 'smartphone', 'troubleshooting', 'repair', 'connectivity'],
  xpReward: 40,
  estimatedTime: '8 min',
};

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  symptoms: string[];
  diagnosticInfo: string;
  options: { label: string; correct: boolean; explanation: string }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Rapid Battery Drain',
    icon: <BatteryWarning size={20} className="text-[#ff3366]" />,
    symptoms: [
      'Battery drops from 100% to 20% in 3 hours',
      'Phone is warm even when idle',
      'Battery usage shows "Screen" at 15% and "Facebook" at 52%',
      'Battery Health reads 89% capacity',
    ],
    diagnosticInfo: 'Battery usage stats show a rogue app consuming excessive background resources.',
    options: [
      { label: 'Replace the battery immediately', correct: false, explanation: '89% health is acceptable. The issue is software, not hardware.' },
      { label: 'Force stop the misbehaving app and restrict its background activity', correct: true, explanation: 'Facebook at 52% battery is abnormal. Force stopping and restricting background activity resolves the drain.' },
      { label: 'Factory reset the device', correct: false, explanation: 'Factory reset is excessive when a specific app is clearly identified as the cause.' },
      { label: 'Disable all location services', correct: false, explanation: 'Location services are not the primary drain when a specific app is consuming 52%.' },
    ],
  },
  {
    id: 's2', title: 'Wi-Fi Keeps Disconnecting',
    icon: <Wifi size={20} className="text-[#ffaa00]" />,
    symptoms: [
      'Wi-Fi connects then drops every few minutes',
      'Other devices on the same network work fine',
      'Problem started after an OS update',
      '"Forget network" and reconnecting does not help',
    ],
    diagnosticInfo: 'The Wi-Fi MAC randomization feature was changed in the latest update, conflicting with the router.',
    options: [
      { label: 'Replace the Wi-Fi antenna hardware', correct: false, explanation: 'Since the issue started after an update, it is software-related, not hardware.' },
      { label: 'Reset network settings and disable MAC randomization for this network', correct: true, explanation: 'Resetting network settings clears corrupt configs. Disabling MAC randomization fixes the router compatibility issue.' },
      { label: 'Change the router to WEP encryption', correct: false, explanation: 'WEP is insecure and deprecated. The issue is MAC randomization, not encryption.' },
      { label: 'Enable airplane mode and disable it repeatedly', correct: false, explanation: 'This is a temporary workaround, not a fix for the underlying MAC randomization conflict.' },
    ],
  },
  {
    id: 's3', title: 'Cracked Screen with Touch Issues',
    icon: <MonitorSmartphone size={20} className="text-[#a855f7]" />,
    symptoms: [
      'Screen has a visible crack in the lower right corner',
      'Touch input is unresponsive in the cracked area',
      'Ghost touches appear randomly across the screen',
      'Display shows color distortion near the crack',
    ],
    diagnosticInfo: 'The digitizer layer is damaged where the crack is, causing phantom touch inputs.',
    options: [
      { label: 'Apply a screen protector to prevent further damage', correct: false, explanation: 'A screen protector cannot fix a damaged digitizer or stop ghost touches.' },
      { label: 'Replace the display assembly (LCD + digitizer)', correct: true, explanation: 'Ghost touches and unresponsive areas require a full display assembly replacement, as the digitizer is integrated with the LCD.' },
      { label: 'Perform a factory reset to recalibrate touch input', correct: false, explanation: 'Software reset cannot fix physical damage to the digitizer hardware.' },
      { label: 'Use an external Bluetooth keyboard as a workaround', correct: false, explanation: 'This does not fix the ghost touches which can trigger unintended actions.' },
    ],
  },
  {
    id: 's4', title: 'Suspected Malware Infection',
    icon: <Bug size={20} className="text-[#ff3366]" />,
    symptoms: [
      'Pop-up ads appear even on the home screen',
      'Unknown apps installed that cannot be found in app drawer',
      'Data usage has tripled with no change in user behavior',
      'Phone is significantly slower than usual',
    ],
    diagnosticInfo: 'A sideloaded APK from an unofficial source installed adware and a background data-exfiltration service.',
    options: [
      { label: 'Install three different antivirus apps for better coverage', correct: false, explanation: 'Multiple AV apps conflict and consume resources. One reputable scanner is sufficient.' },
      { label: 'Boot into safe mode, uninstall suspicious apps, run a malware scan, then disable unknown sources', correct: true, explanation: 'Safe mode disables third-party apps. Removing suspicious apps, scanning, and disabling unknown sources prevents reinfection.' },
      { label: 'Clear the browser cache and cookies only', correct: false, explanation: 'The malware is at the OS level with installed apps, not limited to the browser.' },
      { label: 'Change the phone wallpaper and restart', correct: false, explanation: 'This has no effect on malware. The infection requires proper remediation.' },
    ],
  },
  {
    id: 's5', title: 'Email Sync Failure',
    icon: <RefreshCw size={20} className="text-[#00d4ff]" />,
    symptoms: [
      'Corporate email stopped syncing 2 days ago',
      'Personal Gmail account works fine',
      'Error: "Cannot verify server identity"',
      'IT recently renewed the Exchange server SSL certificate',
    ],
    diagnosticInfo: 'The corporate Exchange certificate was renewed but the device still caches the old certificate fingerprint.',
    options: [
      { label: 'Delete and re-add the corporate email account', correct: true, explanation: 'Removing and re-adding the account forces the device to accept the new SSL certificate and re-establish trust.' },
      { label: 'Install a VPN to bypass the certificate check', correct: false, explanation: 'A VPN does not resolve SSL certificate validation failures.' },
      { label: 'Downgrade the email app to an older version', correct: false, explanation: 'Older versions may have security vulnerabilities and will still fail certificate validation.' },
      { label: 'Disable SSL/TLS encryption for the email account', correct: false, explanation: 'Disabling encryption exposes credentials and email data. Never disable TLS for email.' },
    ],
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function MobileRepairPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
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
      setShowDiag(false);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">Mobile Device Repair</span>
        </div>
        <ProgressTracker current={currentStep + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      {/* Device status bar */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {SCENARIOS.map((s, i) => {
          const status = i < currentStep ? 'fixed' : i === currentStep ? 'active' : 'pending';
          const icons = [
            <BatteryWarning key="b" size={14} />,
            <Wifi key="w" size={14} />,
            <MonitorSmartphone key="m" size={14} />,
            <Bug key="bg" size={14} />,
            <RefreshCw key="r" size={14} />,
          ];
          return (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className={`bg-[#0d1526] border rounded-lg p-2 flex flex-col items-center gap-1 ${
                status === 'active' ? 'border-[#ffaa00]' : status === 'fixed' ? 'border-[#00ff41]' : 'border-[#1a2d45]'
              }`}>
              <span className={status === 'active' ? 'text-[#ffaa00]' : status === 'fixed' ? 'text-[#00ff41]' : 'text-[#4a6682]'}>
                {icons[i]}
              </span>
              <span className="text-[8px] text-[#7da0c4]">{status === 'fixed' ? 'FIXED' : status === 'active' ? 'ACTIVE' : 'QUEUE'}</span>
            </motion.div>
          );
        })}
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

              <div className="space-y-2 mb-4">
                {scenario.symptoms.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-2 text-sm text-[#c8dce8]">
                    <ChevronRight size={14} className="text-[#00d4ff] mt-0.5 flex-shrink-0" />
                    <span>{s}</span>
                  </motion.div>
                ))}
              </div>

              {!showDiag ? (
                <button onClick={() => setShowDiag(true)} className="text-xs text-[#00d4ff] hover:text-[#00ff41] transition-colors mb-4 flex items-center gap-1">
                  <RefreshCw size={12} /> Run diagnostic analysis
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-3 bg-[#111d2e] border border-[#1a2d45] rounded-lg">
                  <p className="text-xs text-[#ffaa00] font-mono">[DIAG] {scenario.diagnosticInfo}</p>
                </motion.div>
              )}

              <p className="text-xs text-[#7da0c4] mb-3">Select the correct repair action:</p>
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
                  <p className="text-xs text-[#c8dce8]">{scenario.options[selected!].explanation}</p>
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
            <Smartphone size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Mobile Repair Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} devices repaired successfully</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
