import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Network, Eye, CheckCircle, XCircle, ChevronRight, Fingerprint } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const zeroTrustMetadata: PBQMetadata = {
  id: 'zero-trust',
  title: 'Zero Trust Architecture Designer',
  description: 'Design a Zero Trust architecture by identifying trust boundaries, configuring micro-segmentation, and implementing continuous verification.',
  difficulty: 5,
  category: 'CASP+',
  tags: ['zero-trust', 'architecture', 'micro-segmentation'],
  xpReward: 70,
  estimatedTime: '12 min',
};

interface ZTStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const STEPS: ZTStep[] = [
  {
    id: 'boundaries',
    title: 'Identify Trust Boundaries',
    description: 'Your enterprise has on-prem data centers, AWS cloud, and remote workers. Which approach best defines trust boundaries in Zero Trust?',
    icon: <Network size={18} />,
    options: [
      'Define perimeter at the corporate firewall only',
      'Treat every network segment as untrusted; enforce identity verification at each resource',
      'Trust internal networks, verify external connections',
      'Use VPN to extend the trusted perimeter to remote workers',
    ],
    correctIndex: 1,
    explanation: 'Zero Trust eliminates implicit trust. Every access request must be verified regardless of network location.',
  },
  {
    id: 'microseg',
    title: 'Configure Micro-Segmentation',
    description: 'The database tier contains PII and financial data. How should you implement micro-segmentation for the application stack?',
    icon: <Lock size={18} />,
    options: [
      'Place all tiers in the same VLAN with a shared firewall',
      'Segment by department using VLANs only',
      'Implement per-workload segmentation with identity-aware policies between web, app, and DB tiers',
      'Use a single security group allowing all internal traffic',
    ],
    correctIndex: 2,
    explanation: 'Per-workload micro-segmentation with identity-aware policies enforces least privilege between each tier.',
  },
  {
    id: 'privilege',
    title: 'Implement Least Privilege',
    description: 'A DevOps engineer needs access to production Kubernetes clusters. Which access model best implements least privilege?',
    icon: <Fingerprint size={18} />,
    options: [
      'Grant permanent admin access to all clusters',
      'Provide JIT (Just-In-Time) access with time-bound elevated privileges and MFA, logged and auditable',
      'Share a service account with the DevOps team',
      'Grant read-only access with sudo escalation available',
    ],
    correctIndex: 1,
    explanation: 'JIT access with time-bound privileges, MFA, and audit logging follows Zero Trust least privilege principles.',
  },
  {
    id: 'verification',
    title: 'Set Up Continuous Verification',
    description: 'After initial authentication, how should the system continuously verify user sessions?',
    icon: <Eye size={18} />,
    options: [
      'Verify once at login and trust the session for 24 hours',
      'Require re-authentication every 30 minutes regardless of activity',
      'Evaluate device posture, user behavior, location, and risk score continuously; step up auth when anomalies are detected',
      'Use static API keys for service-to-service communication',
    ],
    correctIndex: 2,
    explanation: 'Continuous adaptive verification evaluates multiple signals and adjusts authentication requirements dynamically.',
  },
  {
    id: 'validate',
    title: 'Validate Architecture',
    description: 'Which validation approach best confirms the Zero Trust architecture is functioning correctly?',
    icon: <ShieldCheck size={18} />,
    options: [
      'Annual penetration test only',
      'Automated policy compliance checks, continuous monitoring, red team exercises, and lateral movement testing',
      'Review firewall logs quarterly',
      'Conduct a single architecture review before deployment',
    ],
    correctIndex: 1,
    explanation: 'Comprehensive validation includes automated checks, continuous monitoring, and active testing of lateral movement prevention.',
  },
];

const STEP_COLORS = ['#00d4ff', '#ff3366', '#ffaa00', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ZeroTrustPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(STEPS.length).fill(null));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [trustLevel, setTrustLevel] = useState(0);

  const handleSelect = useCallback((optionIndex: number) => {
    if (completed || answers[currentStep] !== null) return;

    const isCorrect = optionIndex === STEPS[currentStep].correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) setTrustLevel(prev => prev + 20);

    const correctCount = newAnswers.filter((a, i) => a === STEPS[i].correctIndex).length;
    const newScore = Math.round((correctCount / STEPS.length) * 100);
    setScore(newScore);

    if (currentStep === STEPS.length - 1) {
      setTimeout(() => { setCompleted(true); onComplete?.(newScore); }, 1200);
    } else {
      setTimeout(() => { setCurrentStep(prev => prev + 1); setFeedback(null); }, 1500);
    }
  }, [currentStep, answers, completed, onComplete]);

  const step = STEPS[currentStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#06d6a0]" />
          <span className="text-caption text-[#7da0c4] font-display">Zero Trust Architecture</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={STEPS.length} score={score} />
      </div>

      {/* Trust level meter */}
      <div className="mb-4 flex items-center justify-center gap-3">
        <span className="text-[10px] text-[#4a6682] font-display">TRUST MATURITY</span>
        <div className="h-2 w-48 bg-[#1a2d45] rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #ff3366, #ffaa00, #00ff41)' }}
            animate={{ width: `${trustLevel}%` }} transition={{ duration: 0.8 }} />
        </div>
        <span className="text-[10px] text-[#7da0c4] font-mono">{trustLevel}%</span>
      </div>

      {/* Step flow */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <motion.div
              animate={{
                borderColor: answers[i] !== null ? (answers[i] === STEPS[i].correctIndex ? '#00ff41' : '#ff3366') : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
                backgroundColor: answers[i] !== null ? (answers[i] === STEPS[i].correctIndex ? 'rgba(0,255,65,0.1)' : 'rgba(255,51,102,0.1)') : i === currentStep ? `${STEP_COLORS[i]}15` : '#0d1526',
              }}
              className="w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !completed && answers[i] !== null && setCurrentStep(i)}
            >
              {answers[i] !== null ? (
                answers[i] === STEPS[i].correctIndex ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
              ) : (
                <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{s.icon}</span>
              )}
              <span className="text-[7px] font-display mt-0.5" style={{ color: '#7da0c4' }}>{s.title.substring(0, 10)}</span>
            </motion.div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className={answers[i] !== null ? 'text-[#4a6682]' : 'text-[#1a2d45]'} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${STEP_COLORS[currentStep]}20` }}>
                <span style={{ color: STEP_COLORS[currentStep] }}>{step.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">Step {currentStep + 1}: {step.title}</h3>
                <p className="text-xs text-[#7da0c4]">{step.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {step.options.map((opt, i) => {
                const isSelected = answers[currentStep] === i;
                const isCorrect = i === step.correctIndex && answers[currentStep] !== null;
                const isWrong = isSelected && i !== step.correctIndex;
                return (
                  <motion.button key={i} whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(i)} disabled={answers[currentStep] !== null || feedback !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isCorrect ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]' : isWrong ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]' : 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#0a0e17]'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>{String.fromCharCode(65 + i)}.</span>
                      <span className={`text-sm ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)]">
                  <p className="text-sm text-[#00ff41] font-display">Correct!</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{step.explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)]">
                  <p className="text-sm text-[#ff3366] font-display">Incorrect.</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{step.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Architecture visualization */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">ZERO TRUST LAYERS</h4>
          <div className="space-y-2">
            {['Identity Verification', 'Device Trust', 'Network Segmentation', 'Application Access', 'Data Protection'].map((layer, i) => {
              const isActive = i <= currentStep;
              const isCorrect = answers[i] !== null && answers[i] === STEPS[i]?.correctIndex;
              return (
                <motion.div key={layer} animate={{ borderColor: isCorrect ? '#00ff41' : isActive ? STEP_COLORS[i] : '#1a2d45' }}
                  className="p-3 border rounded-lg bg-[#0a1628]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={12} style={{ color: isCorrect ? '#00ff41' : isActive ? STEP_COLORS[i] : '#4a6682' }} />
                      <span className="text-xs font-display" style={{ color: isActive ? '#e0f2fe' : '#4a6682' }}>{layer}</span>
                    </div>
                    {isCorrect && <CheckCircle size={12} className="text-[#00ff41]" />}
                  </div>
                  <motion.div className="mt-1 h-1 bg-[#1a2d45] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: isCorrect ? '#00ff41' : STEP_COLORS[i] }}
                      animate={{ width: isCorrect ? '100%' : isActive ? '50%' : '0%' }} transition={{ duration: 0.5 }} />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {completed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 border border-[#06d6a0] rounded-lg bg-[rgba(6,214,160,0.1)] text-center">
              <ShieldCheck size={20} className="text-[#06d6a0] mx-auto mb-1" />
              <p className="text-sm text-[#06d6a0] font-display">Architecture Complete</p>
              <p className="text-xs text-[#7da0c4]">Maturity Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
