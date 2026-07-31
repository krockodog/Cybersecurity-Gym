import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Clock, Server, Phone, PlayCircle, ChevronRight, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const bcpDrPlannerMetadata: PBQMetadata = {
  id: 'bcp-dr-planner',
  title: 'BCP/DR Planner',
  description: 'Design business continuity and disaster recovery plans including BIA, RTO/RPO calculations, failover design, and recovery testing.',
  difficulty: 4,
  category: 'CASP+',
  tags: ['bcp', 'disaster-recovery', 'rto', 'rpo', 'business-continuity'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface DRScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SCENARIOS: DRScenario[] = [
  {
    id: 'bia',
    title: 'Business Impact Analysis',
    description: 'An e-commerce company generates $500K/hour in revenue. The payment processing system, customer database, and email system are being assessed. Which has the highest BIA priority?',
    icon: <AlertTriangle size={18} />,
    options: [
      'Email system - communication is essential for all operations',
      'Customer database - contains valuable data assets',
      'Payment processing system - directly tied to revenue generation ($500K/hr loss)',
      'All systems are equally critical',
    ],
    correctIndex: 2,
    explanation: 'BIA prioritizes by financial impact. Payment processing directly generates revenue at $500K/hr, making it the highest priority.',
  },
  {
    id: 'rto-rpo',
    title: 'RTO/RPO Calculation',
    description: 'The payment system has an RPO of 5 minutes and RTO of 15 minutes. Which backup and recovery strategy meets these requirements?',
    icon: <Clock size={18} />,
    options: [
      'Daily full backups with 4-hour restoration from tape',
      'Synchronous replication to hot standby with automated failover and continuous data protection',
      'Hourly incremental backups to cloud storage',
      'Weekly full backups with 24-hour recovery SLA',
    ],
    correctIndex: 1,
    explanation: 'Synchronous replication meets RPO near-zero (< 5 min). Hot standby with automated failover meets RTO < 15 min.',
  },
  {
    id: 'failover',
    title: 'Failover Architecture',
    description: 'Design the failover architecture for a Tier-1 application. Primary site is US-East. Which design provides the best resilience?',
    icon: <Server size={18} />,
    options: [
      'Cold site in the same data center with manual failover',
      'Warm standby in a different AZ within the same region',
      'Active-active deployment across US-East and US-West with global load balancing and automatic DNS failover',
      'Backup to tape shipped to an offsite vault weekly',
    ],
    correctIndex: 2,
    explanation: 'Active-active across regions with global load balancing provides the lowest RTO/RPO and eliminates single region failure risk.',
  },
  {
    id: 'communication',
    title: 'Crisis Communication',
    description: 'A ransomware attack has encrypted production servers. The incident response team is activated. What is the correct communication plan?',
    icon: <Phone size={18} />,
    options: [
      'Immediately notify all employees and customers via email',
      'Keep the incident private until fully resolved',
      'Activate call tree: CISO > IR team > executive leadership > legal > PR > affected parties, using out-of-band communication channels',
      'Post updates on social media in real-time',
    ],
    correctIndex: 2,
    explanation: 'Structured escalation using out-of-band channels (not compromised email) ensures proper notification order and prevents information leakage.',
  },
  {
    id: 'testing',
    title: 'Recovery Testing',
    description: 'Which testing approach best validates the DR plan for a financial services company with regulatory requirements?',
    icon: <PlayCircle size={18} />,
    options: [
      'Tabletop exercise once per year',
      'Full-scale DR test with actual failover annually, quarterly tabletop exercises, monthly automated failover tests, and documented results for regulators',
      'Read-through of the DR plan with management',
      'Test only when the plan is updated',
    ],
    correctIndex: 1,
    explanation: 'A combination of full-scale tests, tabletop exercises, automated tests, and documentation meets both operational and regulatory needs.',
  },
];

const STEP_COLORS = ['#ff3366', '#ffaa00', '#00d4ff', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function BCPDRPlannerPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(SCENARIOS.length).fill(null));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = useCallback((optionIndex: number) => {
    if (completed || answers[currentStep] !== null) return;
    const isCorrect = optionIndex === SCENARIOS[currentStep].correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const correctCount = newAnswers.filter((a, i) => a === SCENARIOS[i].correctIndex).length;
    const newScore = Math.round((correctCount / SCENARIOS.length) * 100);
    setScore(newScore);

    if (currentStep === SCENARIOS.length - 1) {
      setTimeout(() => { setCompleted(true); onComplete?.(newScore); }, 1200);
    } else {
      setTimeout(() => { setCurrentStep(prev => prev + 1); setFeedback(null); }, 1500);
    }
  }, [currentStep, answers, completed, onComplete]);

  const scenario = SCENARIOS[currentStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#06d6a0]" />
          <span className="text-caption text-[#7da0c4] font-display">BCP/DR Planner</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={SCENARIOS.length} score={score} />
      </div>

      {/* Timeline */}
      <div className="mb-6 bg-[#0d1526] border border-[#1a2d45] rounded-xl p-3">
        <div className="flex items-center gap-1">
          {SCENARIOS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <motion.div
                animate={{
                  borderColor: answers[i] !== null ? (answers[i] === SCENARIOS[i].correctIndex ? '#00ff41' : '#ff3366') : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
                  backgroundColor: i === currentStep ? `${STEP_COLORS[i]}10` : '#0a1628',
                }}
                className="flex-1 py-2 px-1 rounded-lg border flex flex-col items-center cursor-pointer"
                onClick={() => !completed && setCurrentStep(i)}
              >
                {answers[i] !== null ? (
                  answers[i] === SCENARIOS[i].correctIndex ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
                ) : (
                  <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{s.icon}</span>
                )}
                <span className="text-[7px] font-display mt-0.5" style={{ color: i === currentStep ? '#e0f2fe' : '#4a6682' }}>
                  {s.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </motion.div>
              {i < SCENARIOS.length - 1 && <ChevronRight size={10} className="text-[#1a2d45] flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${STEP_COLORS[currentStep]}20` }}>
                <span style={{ color: STEP_COLORS[currentStep] }}>{scenario.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">Scenario {currentStep + 1}: {scenario.title}</h3>
                <p className="text-xs text-[#7da0c4]">{scenario.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {scenario.options.map((opt, i) => {
                const isSelected = answers[currentStep] === i;
                const isCorrect = i === scenario.correctIndex && answers[currentStep] !== null;
                const isWrong = isSelected && i !== scenario.correctIndex;
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
                  <p className="text-xs text-[#7da0c4] mt-1">{scenario.explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)]">
                  <p className="text-sm text-[#ff3366] font-display">Incorrect.</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{scenario.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* DR Metrics panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">DR METRICS</h4>

          <div className="space-y-3">
            <div className="p-3 bg-[#0a1628] border border-[#1a2d45] rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#7da0c4] font-display">RTO Target</span>
                <span className="text-xs text-[#ffaa00] font-mono">15 min</span>
              </div>
              <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#ffaa00] rounded-full" animate={{ width: answers[1] !== null ? '100%' : '30%' }} />
              </div>
            </div>

            <div className="p-3 bg-[#0a1628] border border-[#1a2d45] rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#7da0c4] font-display">RPO Target</span>
                <span className="text-xs text-[#00d4ff] font-mono">5 min</span>
              </div>
              <div className="h-2 bg-[#1a2d45] rounded-full overflow-hidden">
                <motion.div className="h-full bg-[#00d4ff] rounded-full" animate={{ width: answers[1] !== null ? '100%' : '20%' }} />
              </div>
            </div>

            <div className="p-3 bg-[#0a1628] border border-[#1a2d45] rounded-lg">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-[#7da0c4] font-display">Revenue at Risk</span>
                <span className="text-xs text-[#ff3366] font-mono">$500K/hr</span>
              </div>
            </div>
          </div>

          <h4 className="text-caption text-[#7da0c4] font-display mt-4 mb-2">PLAN STATUS</h4>
          <div className="space-y-1">
            {SCENARIOS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 py-1">
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
              <p className="text-sm text-[#06d6a0] font-display">DR Plan Complete</p>
              <p className="text-xs text-[#7da0c4]">Readiness: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
