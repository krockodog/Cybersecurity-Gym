import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Globe, Shield, Lock, Link2, ChevronRight, CheckCircle, XCircle, Server } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const vpcDesignerMetadata: PBQMetadata = {
  id: 'vpc-designer',
  title: 'VPC Network Designer',
  description: 'Design a VPC with proper subnet layout, route tables, NACLs, security groups, and VPC peering configurations.',
  difficulty: 4,
  category: 'Cloud+',
  tags: ['vpc', 'subnets', 'nacl', 'security-groups', 'peering'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface VPCStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const STEPS: VPCStep[] = [
  {
    id: 'subnets',
    title: 'Subnet Layout',
    description: 'Design subnets for a 3-tier web app in 2 AZs. VPC CIDR: 10.0.0.0/16. Which layout is correct?',
    icon: <Network size={18} />,
    options: [
      'Single subnet 10.0.0.0/16 for all tiers',
      'Public: 10.0.1.0/24, 10.0.2.0/24 (AZ-a,b); Private App: 10.0.3.0/24, 10.0.4.0/24; Private DB: 10.0.5.0/24, 10.0.6.0/24',
      'Two subnets: 10.0.0.0/17 public, 10.0.128.0/17 private',
      'Six /28 subnets for minimal IP usage',
    ],
    correctIndex: 1,
    explanation: 'Separate public/private subnets per tier across 2 AZs provides isolation, redundancy, and proper security boundaries.',
  },
  {
    id: 'routes',
    title: 'Route Tables',
    description: 'Configure route tables for the VPC. Public subnets need internet access; private subnets need outbound-only internet for updates. Which configuration is correct?',
    icon: <Globe size={18} />,
    options: [
      'Single route table with 0.0.0.0/0 -> IGW for all subnets',
      'Public RT: 0.0.0.0/0 -> IGW; Private RT: 0.0.0.0/0 -> NAT Gateway; DB RT: local routes only (no internet)',
      'No route tables needed; VPC handles routing automatically',
      'All traffic routed through a VPN gateway',
    ],
    correctIndex: 1,
    explanation: 'Public subnets route to IGW for direct internet access. Private subnets use NAT Gateway for outbound only. DB subnets stay isolated.',
  },
  {
    id: 'nacl',
    title: 'Network ACLs',
    description: 'Configure NACLs for the public subnet. Web servers run on port 443. Which NACL configuration is correct?',
    icon: <Shield size={18} />,
    options: [
      'Inbound: Allow All; Outbound: Allow All',
      'Inbound: Allow TCP 443 from 0.0.0.0/0, Allow TCP 1024-65535 (ephemeral) from 10.0.0.0/16; Outbound: Allow TCP 1024-65535 to 0.0.0.0/0, Allow TCP to private subnets',
      'Inbound: Deny All; Outbound: Deny All',
      'Inbound: Allow TCP 80 only; Outbound: Allow All',
    ],
    correctIndex: 1,
    explanation: 'NACLs are stateless - both inbound rules (443 + ephemeral for responses) and outbound rules (ephemeral responses + internal traffic) must be explicit.',
  },
  {
    id: 'sg',
    title: 'Security Groups',
    description: 'Configure security groups for the 3-tier architecture. How should inter-tier communication be controlled?',
    icon: <Lock size={18} />,
    options: [
      'Single security group allowing all ports for all tiers',
      'Web SG: Allow 443 from 0.0.0.0/0; App SG: Allow 8080 from Web SG only; DB SG: Allow 3306 from App SG only',
      'Allow all traffic between VPC CIDR range',
      'Use IP addresses instead of security group references',
    ],
    correctIndex: 1,
    explanation: 'Chaining security groups by reference (not IP) creates a secure, maintainable tier-to-tier access model following least privilege.',
  },
  {
    id: 'peering',
    title: 'VPC Peering',
    description: 'Connect a production VPC (10.0.0.0/16) to a shared services VPC (172.16.0.0/16) for centralized logging. Which configuration is correct?',
    icon: <Link2 size={18} />,
    options: [
      'Create peering connection and allow all traffic between VPCs',
      'Use a public internet connection between VPCs',
      'Create peering connection with route entries in both VPCs, restrict security groups to allow only syslog (UDP 514) and HTTPS (443) to logging endpoints',
      'Deploy a VPN tunnel between VPCs',
    ],
    correctIndex: 2,
    explanation: 'VPC peering with restricted routes and security groups limits cross-VPC traffic to only the required logging protocols and endpoints.',
  },
];

const STEP_COLORS = ['#00d4ff', '#ffaa00', '#ff3366', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function VPCDesignerPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(STEPS.length).fill(null));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = useCallback((optionIndex: number) => {
    if (completed || answers[currentStep] !== null) return;
    const isCorrect = optionIndex === STEPS[currentStep].correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
    setFeedback(isCorrect ? 'correct' : 'wrong');

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
          <Network size={16} className="text-[#00b4d8]" />
          <span className="text-caption text-[#7da0c4] font-display">VPC Network Designer</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={STEPS.length} score={score} />
      </div>

      {/* Step flow */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <motion.div animate={{
                borderColor: answers[i] !== null ? (answers[i] === STEPS[i].correctIndex ? '#00ff41' : '#ff3366') : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
              }}
              className="w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer bg-[#0d1526]"
              onClick={() => !completed && setCurrentStep(i)}>
              {answers[i] !== null ? (
                answers[i] === STEPS[i].correctIndex ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
              ) : (
                <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{s.icon}</span>
              )}
            </motion.div>
            {i < STEPS.length - 1 && <ChevronRight size={12} className="text-[#1a2d45]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
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

        {/* VPC diagram */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">VPC ARCHITECTURE</h4>
          <div className="bg-[#0a1628] border border-[#1a2d45] rounded-lg p-3">
            <div className="text-center mb-2">
              <span className="text-[10px] text-[#00d4ff] font-mono">VPC 10.0.0.0/16</span>
            </div>
            {[
              { label: 'Public Subnets', cidr: '10.0.1-2.0/24', color: '#00ff41', items: ['ALB', 'NAT GW'] },
              { label: 'Private App Subnets', cidr: '10.0.3-4.0/24', color: '#ffaa00', items: ['App Servers'] },
              { label: 'Private DB Subnets', cidr: '10.0.5-6.0/24', color: '#ff3366', items: ['RDS Multi-AZ'] },
            ].map((subnet, i) => (
              <motion.div key={subnet.label}
                animate={{ borderColor: currentStep === 0 ? subnet.color : answers[0] !== null ? '#1a2d45' : '#1a2d45' }}
                className="border rounded-lg p-2 mb-2 bg-[#0d1526]">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-display" style={{ color: subnet.color }}>{subnet.label}</span>
                  <span className="text-[8px] text-[#4a6682] font-mono">{subnet.cidr}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  {subnet.items.map(item => (
                    <div key={item} className="flex items-center gap-1">
                      <Server size={8} className="text-[#4a6682]" />
                      <span className="text-[8px] text-[#7da0c4]">{item}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[7px] text-[#4a6682]">AZ-a</span>
                    <span className="text-[7px] text-[#4a6682]">AZ-b</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <h4 className="text-caption text-[#7da0c4] font-display mt-3 mb-2">DESIGN STATUS</h4>
          <div className="space-y-1">
            {STEPS.map((s, i) => (
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
              className="mt-4 p-3 border border-[#00b4d8] rounded-lg bg-[rgba(0,180,216,0.1)] text-center">
              <Network size={20} className="text-[#00b4d8] mx-auto mb-1" />
              <p className="text-sm text-[#00b4d8] font-display">VPC Design Complete</p>
              <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
