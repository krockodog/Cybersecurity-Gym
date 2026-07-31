import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Shield, Layers, CheckCircle, XCircle, ChevronRight, AlertTriangle, Network, Lock } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const secArchReviewMetadata: PBQMetadata = {
  id: 'sec-arch-review',
  title: 'Security Architecture Review',
  description: 'Review security architectures to identify vulnerabilities, validate compliance, assess defense-in-depth, and review network segmentation.',
  difficulty: 5,
  category: 'CASP+',
  tags: ['architecture', 'review', 'defense-in-depth', 'compliance'],
  xpReward: 70,
  estimatedTime: '12 min',
};

interface ArchReview {
  id: string;
  title: string;
  description: string;
  diagram: string[];
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const REVIEWS: ArchReview[] = [
  {
    id: 'vuln-id',
    title: 'Identify Vulnerabilities',
    description: 'Review this web application architecture. Which vulnerability is the most critical?',
    diagram: ['Internet', '-> WAF (HTTP only)', '-> Load Balancer', '-> Web Servers (no TLS internal)', '-> Database (default creds)'],
    icon: <AlertTriangle size={18} />,
    options: [
      'WAF is only inspecting HTTP, not HTTPS - SSL termination happens after the WAF, leaving encrypted attacks uninspected',
      'Load balancer has no health checks configured',
      'Web servers need more memory',
      'The architecture needs a CDN',
    ],
    correctIndex: 0,
    explanation: 'If TLS terminates after the WAF, encrypted traffic bypasses inspection entirely, allowing encrypted attacks through.',
  },
  {
    id: 'improvements',
    title: 'Recommend Improvements',
    description: 'The architecture lacks several key security controls. Which improvement provides the most security value?',
    diagram: ['DMZ: [Web App]', 'Internal: [App Server] -> [DB]', 'No IDS/IPS', 'No logging/SIEM', 'Flat internal network'],
    icon: <Shield size={18} />,
    options: [
      'Add a CDN for performance',
      'Implement network segmentation, deploy IDS/IPS at boundaries, enable centralized logging with SIEM, and add micro-segmentation between tiers',
      'Increase server CPU and memory',
      'Add a second WAF in the DMZ',
    ],
    correctIndex: 1,
    explanation: 'Segmentation, IDS/IPS, and SIEM address the flat network, lack of monitoring, and missing detection capabilities simultaneously.',
  },
  {
    id: 'compliance',
    title: 'Validate Compliance',
    description: 'This architecture processes credit card transactions. Which PCI DSS compliance gap is most critical?',
    diagram: ['Cardholder Data Environment', '-> Shared VLAN with dev/test', '-> No encryption at rest', '-> Admin access via shared account', '-> Logs retained 30 days'],
    icon: <Eye size={18} />,
    options: [
      'Logs should be retained for 60 days instead of 30',
      'CDE is on a shared VLAN with dev/test, violating network segmentation requirements (PCI DSS Req 1.3)',
      'The architecture needs faster servers',
      'A second firewall would improve compliance',
    ],
    correctIndex: 1,
    explanation: 'PCI DSS requires strict network segmentation of the CDE. Sharing a VLAN with dev/test environments is a critical violation.',
  },
  {
    id: 'defense-depth',
    title: 'Assess Defense-in-Depth',
    description: 'Evaluate the defense-in-depth strategy. Which layer is missing from this architecture?',
    diagram: ['Perimeter: Firewall + WAF', 'Network: VLANs configured', 'Host: AV + EDR', 'Application: Input validation', 'Data: ??? (not configured)'],
    icon: <Layers size={18} />,
    options: [
      'Physical security - server room access controls',
      'Data layer protection - encryption at rest and in transit, DLP, data classification, and access controls',
      'Another perimeter firewall',
      'Additional network VLANs',
    ],
    correctIndex: 1,
    explanation: 'The data protection layer is completely missing. Encryption, DLP, classification, and access controls protect the most valuable asset.',
  },
  {
    id: 'segmentation',
    title: 'Review Segmentation',
    description: 'Review the network segmentation design. Which segmentation issue poses the greatest risk?',
    diagram: ['VLAN 10: Servers + Workstations', 'VLAN 20: IoT devices', 'VLAN 30: Guest WiFi', 'Inter-VLAN routing: Allow All', 'No ACLs between VLANs'],
    icon: <Network size={18} />,
    options: [
      'Guest WiFi should be on VLAN 10',
      'IoT devices need faster connectivity',
      'Inter-VLAN routing allows all traffic with no ACLs - IoT and guest networks can reach server/workstation VLAN directly',
      'More VLANs are needed for scalability',
    ],
    correctIndex: 2,
    explanation: 'Allow-all inter-VLAN routing defeats the purpose of segmentation. IoT and guest networks must be restricted from accessing critical assets.',
  },
];

const STEP_COLORS = ['#ff3366', '#00d4ff', '#ffaa00', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function SecArchReviewPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(REVIEWS.length).fill(null));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = useCallback((optionIndex: number) => {
    if (completed || answers[currentStep] !== null) return;
    const isCorrect = optionIndex === REVIEWS[currentStep].correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const correctCount = newAnswers.filter((a, i) => a === REVIEWS[i].correctIndex).length;
    const newScore = Math.round((correctCount / REVIEWS.length) * 100);
    setScore(newScore);

    if (currentStep === REVIEWS.length - 1) {
      setTimeout(() => { setCompleted(true); onComplete?.(newScore); }, 1200);
    } else {
      setTimeout(() => { setCurrentStep(prev => prev + 1); setFeedback(null); }, 1500);
    }
  }, [currentStep, answers, completed, onComplete]);

  const review = REVIEWS[currentStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-[#06d6a0]" />
          <span className="text-caption text-[#7da0c4] font-display">Security Architecture Review</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={REVIEWS.length} score={score} />
      </div>

      {/* Review step indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {REVIEWS.map((r, i) => (
          <div key={r.id} className="flex items-center gap-1">
            <motion.div animate={{
                borderColor: answers[i] !== null ? (answers[i] === REVIEWS[i].correctIndex ? '#00ff41' : '#ff3366') : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
              }}
              className="w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer bg-[#0d1526]"
              onClick={() => !completed && setCurrentStep(i)}>
              {answers[i] !== null ? (
                answers[i] === REVIEWS[i].correctIndex ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
              ) : (
                <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{r.icon}</span>
              )}
            </motion.div>
            {i < REVIEWS.length - 1 && <ChevronRight size={12} className="text-[#1a2d45]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${STEP_COLORS[currentStep]}20` }}>
                <span style={{ color: STEP_COLORS[currentStep] }}>{review.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">Review {currentStep + 1}: {review.title}</h3>
                <p className="text-xs text-[#7da0c4]">{review.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {review.options.map((opt, i) => {
                const isSelected = answers[currentStep] === i;
                const isCorrect = i === review.correctIndex && answers[currentStep] !== null;
                const isWrong = isSelected && i !== review.correctIndex;
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
                  <p className="text-sm text-[#00ff41] font-display">Correct finding!</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{review.explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)]">
                  <p className="text-sm text-[#ff3366] font-display">Incorrect finding.</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{review.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Architecture diagram */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">ARCHITECTURE DIAGRAM</h4>
          <div className="bg-[#0a1628] border border-[#1a2d45] rounded-lg p-4">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {review.diagram.map((line, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-2 py-1.5">
                    {line.startsWith('->') ? (
                      <>
                        <div className="w-4 flex justify-center"><ChevronRight size={10} className="text-[#4a6682]" /></div>
                        <span className={`text-xs font-mono ${line.includes('???') || line.includes('no ') || line.includes('No ') || line.includes('default') || line.includes('Shared') || line.includes('Allow All') || line.includes('Flat') || line.includes('HTTP only')
                          ? 'text-[#ff3366]' : 'text-[#c8dce8]'}`}>
                          {line.substring(3)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock size={10} style={{ color: STEP_COLORS[currentStep] }} />
                        <span className={`text-xs font-mono ${line.includes('???') || line.includes('No ') || line.includes('no ') || line.includes('Allow All') || line.includes('Flat')
                          ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>
                          {line}
                        </span>
                      </>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <h4 className="text-caption text-[#7da0c4] font-display mt-4 mb-2">FINDINGS</h4>
          <div className="space-y-1">
            {REVIEWS.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 py-1">
                <div className={`w-2 h-2 rounded-full ${
                  answers[i] === null ? 'bg-[#1a2d45]' : answers[i] === r.correctIndex ? 'bg-[#00ff41]' : 'bg-[#ff3366]'
                }`} />
                <span className="text-[10px] text-[#7da0c4]">{r.title}</span>
                {answers[i] !== null && answers[i] === r.correctIndex && (
                  <span className="text-[8px] text-[#00ff41] ml-auto">IDENTIFIED</span>
                )}
              </div>
            ))}
          </div>

          {completed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 border border-[#06d6a0] rounded-lg bg-[rgba(6,214,160,0.1)] text-center">
              <Eye size={20} className="text-[#06d6a0] mx-auto mb-1" />
              <p className="text-sm text-[#06d6a0] font-display">Review Complete</p>
              <p className="text-xs text-[#7da0c4]">Accuracy: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
