import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, ShieldOff, Siren, Search, Box, Trash2, RefreshCcw, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const incidentMetadata: PBQMetadata = {
  id: 'incident-response',
  title: 'Incident Response Simulation',
  description: 'Respond to a live security incident following the NIST Incident Response lifecycle. Make the right call at each phase to contain and remediate the threat.',
  difficulty: 4,
  category: 'Security+',
  tags: ['incident-response', 'nist', 'ir-lifecycle'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface IRStep {
  id: string;
  phase: string;
  icon: React.ReactNode;
  situation: string;
  alert: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number | null;
  completed: boolean;
}

const INITIAL_STEPS: IRStep[] = [
  {
    id: 'preparation',
    phase: 'Preparation',
    icon: <BookOpen size={18} />,
    situation: 'Your organization is establishing its security posture. The CISO asks you to prioritize one preparation activity before any incidents occur.',
    alert: 'PRE-INCIDENT: Audit reveals no IR plan exists. SOC team has no documented procedures.',
    options: [
      'Install additional firewalls on all segments',
      'Develop an incident response plan with communication procedures and runbooks',
      'Hire more security analysts immediately',
      'Begin monitoring dark web for threat intelligence',
    ],
    correctIndex: 1,
    explanation: 'NIST SP 800-61 emphasizes that preparation starts with a documented IR plan including policies, procedures, and communication plans before technical controls.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'detection',
    phase: 'Detection & Analysis',
    icon: <Search size={18} />,
    situation: 'The SIEM alerts on anomalous activity. Multiple failed login attempts from an internal IP are followed by a successful login to a domain admin account at 3 AM.',
    alert: 'ALERT: Brute-force pattern detected on DC01. Source: 10.0.1.47. Account: domain_admin. 847 failed attempts, then success at 03:14 UTC.',
    options: [
      'Immediately disable the domain_admin account and shut down DC01',
      'Correlate with other log sources, verify if the login is legitimate, and classify the incident severity',
      'Send an email to the security team to investigate in the morning',
      'Block IP 10.0.1.47 at the firewall and close the ticket',
    ],
    correctIndex: 1,
    explanation: 'Detection and Analysis requires correlating alerts across sources, verifying the incident is real (not a false positive), and classifying severity before taking containment action.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'containment',
    phase: 'Containment',
    icon: <Box size={18} />,
    situation: 'Analysis confirms this is a real attack. The compromised workstation (10.0.1.47) is exfiltrating data to an external C2 server. The attacker has domain admin credentials.',
    alert: 'CONFIRMED: Active data exfiltration to 185.220.101.33:443. Lateral movement detected to FILE-SRV01 and DB-SRV02. 3 additional accounts compromised.',
    options: [
      'Wipe all compromised systems immediately to remove the threat',
      'Isolate compromised systems from the network, capture forensic images, and reset compromised credentials',
      'Shut down the entire corporate network to prevent further spread',
      'Contact the attacker and negotiate to stop the breach',
    ],
    correctIndex: 1,
    explanation: 'Containment involves isolating affected systems while preserving evidence. Forensic images must be captured before any remediation. Credential resets prevent further lateral movement.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'eradication',
    phase: 'Eradication',
    icon: <Trash2 size={18} />,
    situation: 'Systems are isolated and forensic images captured. Analysis reveals a rootkit on the compromised workstation and a backdoor service installed on the domain controller.',
    alert: 'FORENSICS: Rootkit (Diamorphine) found on WKS-047. Backdoor service "WinUpdate_Svc" on DC01. Registry persistence keys in HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run.',
    options: [
      'Run antivirus scans on all affected systems and remove detected threats',
      'Rebuild compromised systems from known-good images, remove all persistence mechanisms, and patch the exploited vulnerability',
      'Delete the suspicious files and registry keys manually, then monitor',
      'Restore all systems from the most recent backup',
    ],
    correctIndex: 1,
    explanation: 'Eradication requires rebuilding from clean images (rootkits cannot be reliably cleaned), removing all persistence mechanisms, and patching the vulnerability that enabled initial access.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'recovery',
    phase: 'Recovery',
    icon: <RefreshCcw size={18} />,
    situation: 'Compromised systems have been rebuilt. Clean backups have been verified. You need to bring systems back online safely.',
    alert: 'STATUS: 4 systems rebuilt, 12 accounts reset, vulnerability patched. Backup integrity verified for FILE-SRV01 data. Ready for recovery phase.',
    options: [
      'Bring all systems online simultaneously and resume normal operations',
      'Restore systems in phases with enhanced monitoring, validate each system before proceeding to the next',
      'Keep all systems offline for 30 days to ensure the attacker is gone',
      'Restore only the domain controller and allow users to rebuild their own workstations',
    ],
    correctIndex: 1,
    explanation: 'Recovery should be phased and monitored. Each restored system is validated before the next is brought online. Enhanced monitoring detects any remaining compromise.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'lessons',
    phase: 'Lessons Learned',
    icon: <BookOpen size={18} />,
    situation: 'All systems are restored and operational. The incident has been fully resolved. Management wants to ensure this does not happen again.',
    alert: 'RESOLVED: Incident closed after 72 hours. Total affected: 4 systems, 15 accounts, ~2GB data accessed. No confirmed data loss.',
    options: [
      'Close the incident ticket and move on to the next priority',
      'Blame the user whose workstation was compromised and require retraining for that individual only',
      'Conduct a post-incident review with all stakeholders, document findings, update the IR plan, and implement preventive controls',
      'Purchase new security tools to prevent similar attacks',
    ],
    correctIndex: 2,
    explanation: 'Lessons Learned involves a formal review with all stakeholders, documenting the timeline and decisions, updating the IR plan with improvements, and implementing controls to prevent recurrence.',
    selectedIndex: null,
    completed: false,
  },
];

const PHASE_COLORS = ['#00d4ff', '#ffaa00', '#ff3366', '#a855f7', '#00ff41', '#06d6a0'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function IncidentResponsePBQ({ onComplete }: Props) {
  const [steps, setSteps] = useState<IRStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [threatLevel, setThreatLevel] = useState<'low' | 'elevated' | 'high' | 'critical' | 'contained'>('low');

  const selectOption = useCallback((optionIndex: number) => {
    if (completed || steps[currentStep].completed || feedback !== null) return;

    const step = steps[currentStep];
    const isCorrect = optionIndex === step.correctIndex;

    setSteps(prev => prev.map((s, i) =>
      i === currentStep ? { ...s, selectedIndex: optionIndex, completed: isCorrect } : s
    ));

    if (isCorrect) {
      setFeedback('correct');
      const newScore = Math.round(((currentStep + 1) / steps.length) * 100);
      setScore(newScore);

      // Threat level progression
      const levels: Array<'low' | 'elevated' | 'high' | 'critical' | 'contained'> = ['elevated', 'high', 'critical', 'critical', 'contained', 'contained'];
      setThreatLevel(levels[currentStep]);

      if (currentStep === steps.length - 1) {
        setCompleted(true);
        onComplete?.(newScore);
      } else {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setFeedback(null);
        }, 1600);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setSteps(prev => prev.map((s, i) =>
          i === currentStep ? { ...s, selectedIndex: null } : s
        ));
        setFeedback(null);
      }, 1500);
    }
  }, [steps, currentStep, completed, feedback, onComplete]);

  const completedCount = steps.filter(s => s.completed).length;
  const threatColors = { low: '#00ff41', elevated: '#ffaa00', high: '#ff8c00', critical: '#ff3366', contained: '#00ff41' };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Siren size={16} className="text-[#ff3366]" />
          <span className="text-caption text-[#7da0c4] font-display">NIST IR Lifecycle Simulation</span>
        </div>
        <ProgressTracker current={completedCount} total={steps.length} score={score} />
      </div>

      {/* Threat Level Banner */}
      <motion.div
        animate={{
          borderColor: threatColors[threatLevel],
          boxShadow: `0 0 15px ${threatColors[threatLevel]}30`,
        }}
        className="mb-4 px-4 py-2 rounded-lg border bg-[#0d1526] flex items-center justify-center gap-3"
      >
        {threatLevel === 'contained' ? (
          <ShieldCheck size={16} style={{ color: threatColors[threatLevel] }} />
        ) : (
          <ShieldAlert size={16} style={{ color: threatColors[threatLevel] }} />
        )}
        <span className="text-xs font-display" style={{ color: threatColors[threatLevel] }}>
          THREAT LEVEL: {threatLevel.toUpperCase()}
        </span>
      </motion.div>

      {/* Phase Timeline */}
      <div className="flex items-center justify-center gap-1 mb-5 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            <motion.div
              animate={{
                borderColor: step.completed ? '#00ff41' : i === currentStep ? PHASE_COLORS[i] : '#1a2d45',
                backgroundColor: step.completed ? 'rgba(0,255,65,0.1)' : i === currentStep ? `${PHASE_COLORS[i]}12` : '#0d1526',
              }}
              className="w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !completed && i <= currentStep && setCurrentStep(i)}
            >
              <span style={{ color: step.completed ? '#00ff41' : i === currentStep ? PHASE_COLORS[i] : '#4a6682' }}>
                {step.completed ? <ShieldCheck size={14} /> : step.icon}
              </span>
              <span className="text-[7px] font-display mt-0.5 text-[#7da0c4] max-w-[48px] truncate text-center">
                {step.phase.split(' ')[0]}
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <ChevronRight size={12} className={step.completed ? 'text-[#00ff41]' : 'text-[#1a2d45]'} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-4">
        {/* Active Phase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${PHASE_COLORS[currentStep]}20` }}
              >
                <span style={{ color: PHASE_COLORS[currentStep] }}>{steps[currentStep].icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">
                  Phase {currentStep + 1}: {steps[currentStep].phase}
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#c8dce8] mb-3 leading-relaxed">{steps[currentStep].situation}</p>

            {/* Alert Box */}
            <div className="bg-[#0a0e17] border border-[#1a2d45] rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#ffaa00] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#ffaa00] font-mono leading-relaxed">{steps[currentStep].alert}</p>
            </div>

            {/* Options */}
            <div className="space-y-2">
              {steps[currentStep].options.map((opt, i) => {
                const step = steps[currentStep];
                const isSelected = step.selectedIndex === i;
                const isCorrect = step.correctIndex === i && step.completed;
                const isWrong = isSelected && !step.completed && feedback === 'wrong';

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectOption(i)}
                    disabled={step.completed || feedback !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isCorrect
                        ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]'
                        : isWrong
                          ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]'
                          : 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#0a0e17]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className={`text-sm ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>
                        {opt}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)]"
                >
                  <p className="text-sm text-[#00ff41] font-display">Correct response!</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{steps[currentStep].explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)] text-center"
                >
                  <p className="text-sm text-[#ff3366] font-display">Not the best response for this phase. Try again.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* IR Timeline Panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-4 flex items-center gap-2">
            <Siren size={12} className="text-[#ff3366]" />
            INCIDENT TIMELINE
          </h4>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#1a2d45]" />
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 ml-6 mb-4 relative"
              >
                <motion.div
                  animate={{
                    backgroundColor: step.completed ? '#00ff41' : i === currentStep ? PHASE_COLORS[i] : '#1a2d45',
                    boxShadow: step.completed ? '0 0 8px rgba(0,255,65,0.4)' : i === currentStep ? `0 0 8px ${PHASE_COLORS[i]}40` : 'none',
                  }}
                  className="absolute -left-[27px] w-3 h-3 rounded-full"
                />
                <div className="flex-1">
                  <p className={`text-xs font-display ${step.completed ? 'text-[#00ff41]' : i === currentStep ? 'text-[#e0f2fe]' : 'text-[#4a6682]'}`}>
                    {step.phase}
                  </p>
                  {step.completed && (
                    <p className="text-[10px] text-[#7da0c4] mt-0.5">
                      {step.options[step.correctIndex].substring(0, 55)}...
                    </p>
                  )}
                  {i === currentStep && !step.completed && (
                    <motion.p
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-[10px] text-[#ffaa00] mt-0.5"
                    >
                      Awaiting response...
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)] text-center"
            >
              <ShieldCheck size={20} className="text-[#00ff41] mx-auto mb-1" />
              <p className="text-sm text-[#00ff41] font-display">Incident Resolved</p>
              <p className="text-xs text-[#7da0c4] mt-1">All 6 NIST IR phases completed</p>
              <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
