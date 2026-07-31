import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, ChevronRight, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const riskMatrixMetadata: PBQMetadata = {
  id: 'risk-matrix',
  title: 'Risk Assessment Matrix',
  description: 'Classify risks by likelihood and impact, calculate risk scores, and recommend appropriate mitigations across enterprise scenarios.',
  difficulty: 4,
  category: 'CASP+',
  tags: ['risk-assessment', 'risk-matrix', 'mitigation'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface RiskScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  options: string[];
  correctIndex: number;
  hint: string;
}

const SCENARIOS: RiskScenario[] = [
  {
    id: 'classify',
    title: 'Risk Classification',
    description: 'A healthcare organization stores unencrypted PHI on an internet-facing server with known CVEs. Classify the overall risk level.',
    context: 'Likelihood: High | Impact: Critical | Data: 50,000 patient records',
    options: ['Low Risk - Acceptable', 'Medium Risk - Monitor', 'High Risk - Mitigate Immediately', 'Critical Risk - Halt Operations & Remediate'],
    correctIndex: 3,
    hint: 'Unencrypted PHI on an internet-facing server with known vulnerabilities represents the highest risk category.',
  },
  {
    id: 'score',
    title: 'Risk Score Calculation',
    description: 'Calculate the quantitative risk score: ALE = SLE x ARO. Asset value: $2M, Exposure Factor: 40%, ARO: 0.5 (once every 2 years). What is the ALE?',
    context: 'SLE = Asset Value x EF | ALE = SLE x ARO',
    options: ['$200,000', '$400,000', '$800,000', '$1,600,000'],
    correctIndex: 1,
    hint: 'SLE = $2M x 0.40 = $800K. ALE = $800K x 0.5 = $400K.',
  },
  {
    id: 'mitigation',
    title: 'Mitigation Strategy',
    description: 'A zero-day vulnerability is discovered in your VPN concentrator. No patch is available. 500 remote employees depend on VPN access. Recommend the best mitigation.',
    context: 'Business continuity is critical | Vulnerability is actively exploited in the wild',
    options: ['Accept the risk and continue operations', 'Transfer risk via cyber insurance', 'Implement network segmentation and deploy alternative remote access (ZTNA)', 'Disable VPN entirely until patch is available'],
    correctIndex: 2,
    hint: 'A compensating control that maintains business operations while reducing exposure is the best approach.',
  },
  {
    id: 'prioritize',
    title: 'Risk Prioritization',
    description: 'Prioritize these four risks for treatment. Which should be addressed FIRST?',
    context: 'Budget allows addressing only one risk per quarter',
    options: [
      'SQL injection in internal HR portal (Low likelihood, Medium impact)',
      'Unpatched RCE in public-facing e-commerce app (High likelihood, Critical impact)',
      'Weak Wi-Fi password in guest network (Medium likelihood, Low impact)',
      'Missing MFA on admin console (Medium likelihood, High impact)',
    ],
    correctIndex: 1,
    hint: 'Highest combined risk score (likelihood x impact) on a public-facing critical system takes priority.',
  },
  {
    id: 'treatment',
    title: 'Risk Treatment Selection',
    description: 'Your organization operates legacy SCADA systems that cannot be patched. The cost to replace exceeds $10M. Select the appropriate risk treatment strategy.',
    context: 'SCADA controls critical manufacturing processes | Replacement timeline: 3 years',
    options: [
      'Risk Avoidance - Shut down SCADA systems',
      'Risk Acceptance - Document and accept residual risk',
      'Risk Mitigation - Air-gap network, add IDS/IPS, implement compensating controls',
      'Risk Transfer - Purchase cyber insurance coverage',
    ],
    correctIndex: 2,
    hint: 'When systems cannot be replaced immediately, compensating controls reduce risk while maintaining operations.',
  },
];

const RISK_COLORS = ['#ff3366', '#ffaa00', '#00d4ff', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function RiskMatrixPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(SCENARIOS.length).fill(null));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleSelect = useCallback((optionIndex: number) => {
    if (completed || answers[currentStep] !== null) return;

    const isCorrect = optionIndex === SCENARIOS[currentStep].correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setShowHint(false);

    const correctCount = newAnswers.filter((a, i) => a === SCENARIOS[i].correctIndex).length;
    const newScore = Math.round((correctCount / SCENARIOS.length) * 100);
    setScore(newScore);

    if (currentStep === SCENARIOS.length - 1) {
      setTimeout(() => {
        setCompleted(true);
        onComplete?.(newScore);
      }, 1200);
    } else {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setFeedback(null);
      }, 1500);
    }
  }, [currentStep, answers, completed, onComplete]);

  const scenario = SCENARIOS[currentStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-[#06d6a0]" />
          <span className="text-caption text-[#7da0c4] font-display">Risk Assessment Matrix</span>
        </div>
        <ProgressTracker
          current={answers.filter(a => a !== null).length}
          total={SCENARIOS.length}
          score={score}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {SCENARIOS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <motion.div
              animate={{
                borderColor: answers[i] !== null
                  ? answers[i] === SCENARIOS[i].correctIndex ? '#00ff41' : '#ff3366'
                  : i === currentStep ? RISK_COLORS[i] : '#1a2d45',
                backgroundColor: answers[i] !== null
                  ? answers[i] === SCENARIOS[i].correctIndex ? 'rgba(0,255,65,0.1)' : 'rgba(255,51,102,0.1)'
                  : i === currentStep ? `${RISK_COLORS[i]}15` : '#0d1526',
              }}
              className="w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer"
              onClick={() => !completed && answers[i] !== null && setCurrentStep(i)}
            >
              {answers[i] !== null ? (
                answers[i] === SCENARIOS[i].correctIndex
                  ? <CheckCircle size={16} className="text-[#00ff41]" />
                  : <XCircle size={16} className="text-[#ff3366]" />
              ) : (
                <span className="text-xs font-display" style={{ color: i === currentStep ? RISK_COLORS[i] : '#4a6682' }}>
                  {i + 1}
                </span>
              )}
            </motion.div>
            {i < SCENARIOS.length - 1 && (
              <ChevronRight size={14} className={answers[i] !== null ? 'text-[#4a6682]' : 'text-[#1a2d45]'} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
        {/* Scenario panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${RISK_COLORS[currentStep]}20` }}>
                <BarChart3 size={18} style={{ color: RISK_COLORS[currentStep] }} />
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">Step {currentStep + 1}: {scenario.title}</h3>
                <p className="text-xs text-[#7da0c4]">{scenario.description}</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-[#0a1628] border border-[#1a2d45] rounded-lg">
              <p className="text-xs text-[#00d4ff] font-mono">{scenario.context}</p>
            </div>

            <div className="space-y-2">
              {scenario.options.map((opt, i) => {
                const isSelected = answers[currentStep] === i;
                const isCorrect = i === scenario.correctIndex && answers[currentStep] !== null;
                const isWrong = isSelected && i !== scenario.correctIndex;
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleSelect(i)}
                    disabled={answers[currentStep] !== null || feedback !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isCorrect ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]'
                      : isWrong ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]'
                      : 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#0a0e17]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className={`text-sm ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {!answers[currentStep] && (
              <button
                onClick={() => setShowHint(!showHint)}
                className="mt-3 text-xs text-[#4a6682] hover:text-[#7da0c4] transition-colors"
              >
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            )}

            <AnimatePresence>
              {showHint && !answers[currentStep] && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mt-2 p-3 border border-[#ffaa00] rounded-lg bg-[rgba(255,170,0,0.05)]">
                  <p className="text-xs text-[#ffaa00]">{scenario.hint}</p>
                </motion.div>
              )}
              {feedback === 'correct' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)] text-center">
                  <p className="text-sm text-[#00ff41] font-display">Correct risk assessment!</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)] text-center">
                  <p className="text-sm text-[#ff3366] font-display">Incorrect. {scenario.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Risk matrix visualization */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">RISK MATRIX</h4>
          <div className="grid grid-cols-5 gap-1">
            {['Critical', 'High', 'Medium', 'Low', 'Negligible'].map((impact, row) => (
              ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'].map((likelihood, col) => {
                const riskLevel = (4 - row) + col;
                const bg = riskLevel >= 6 ? 'rgba(255,51,102,0.3)' : riskLevel >= 4 ? 'rgba(255,170,0,0.3)' : riskLevel >= 2 ? 'rgba(0,212,255,0.2)' : 'rgba(0,255,65,0.15)';
                return (
                  <motion.div
                    key={`${row}-${col}`}
                    className="aspect-square rounded flex items-center justify-center text-[7px] font-mono"
                    style={{ backgroundColor: bg, color: riskLevel >= 6 ? '#ff3366' : riskLevel >= 4 ? '#ffaa00' : '#7da0c4' }}
                    animate={{ scale: currentStep === 0 && riskLevel >= 6 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {riskLevel >= 6 ? 'C' : riskLevel >= 4 ? 'H' : riskLevel >= 2 ? 'M' : 'L'}
                  </motion.div>
                );
              })
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[8px] text-[#4a6682] font-mono">
            <span>Rare</span><span>Likelihood</span><span>Certain</span>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-caption text-[#7da0c4] font-display">RESULTS</h4>
            {SCENARIOS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  answers[i] === null ? 'bg-[#1a2d45]' : answers[i] === s.correctIndex ? 'bg-[#00ff41]' : 'bg-[#ff3366]'
                }`} />
                <span className="text-[10px] text-[#7da0c4]">{s.title}</span>
              </div>
            ))}
          </div>

          {completed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 border border-[#06d6a0] rounded-lg bg-[rgba(6,214,160,0.1)] text-center">
              <Shield size={20} className="text-[#06d6a0] mx-auto mb-1" />
              <p className="text-sm text-[#06d6a0] font-display">Assessment Complete</p>
              <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
