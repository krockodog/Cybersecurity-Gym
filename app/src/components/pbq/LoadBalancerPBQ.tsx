import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Activity, Lock, Zap, ArrowUpDown, ChevronRight, CheckCircle, XCircle, Shield } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const loadBalancerMetadata: PBQMetadata = {
  id: 'load-balancer',
  title: 'Load Balancer Configuration',
  description: 'Configure load balancers including type selection, health checks, SSL termination, sticky sessions, and auto-scaling integration.',
  difficulty: 3,
  category: 'Cloud+',
  tags: ['load-balancer', 'ssl', 'health-checks', 'auto-scaling'],
  xpReward: 50,
  estimatedTime: '10 min',
};

interface LBStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const STEPS: LBStep[] = [
  {
    id: 'type',
    title: 'Choose LB Type',
    description: 'A web application serves HTTP/HTTPS traffic with WebSocket support and needs path-based routing to different microservices. Which load balancer type is appropriate?',
    icon: <ArrowUpDown size={18} />,
    options: [
      'Network Load Balancer (Layer 4) for raw TCP performance',
      'Application Load Balancer (Layer 7) with path-based routing rules, WebSocket support, and HTTP/2',
      'Classic Load Balancer for backward compatibility',
      'DNS round-robin without a load balancer',
    ],
    correctIndex: 1,
    explanation: 'ALB operates at Layer 7, supports path-based routing, WebSocket, HTTP/2, and is designed for modern microservices architectures.',
  },
  {
    id: 'health',
    title: 'Configure Health Checks',
    description: 'The application has a /health endpoint that verifies database connectivity and returns 200 when healthy. Configure health checks.',
    icon: <Activity size={18} />,
    options: [
      'Check TCP port 80 every 60 seconds',
      'HTTP health check on /health, interval 15s, timeout 5s, healthy threshold 3, unhealthy threshold 2, expected HTTP 200',
      'Ping ICMP to each instance every 30 seconds',
      'No health checks needed; auto-scaling handles failures',
    ],
    correctIndex: 1,
    explanation: 'HTTP health checks verify application-level health. Short intervals with proper thresholds balance quick detection with avoiding false positives.',
  },
  {
    id: 'ssl',
    title: 'SSL Termination',
    description: 'Configure SSL/TLS for the load balancer. The application handles sensitive financial data. Which approach is correct?',
    icon: <Lock size={18} />,
    options: [
      'No SSL needed; use HTTP throughout',
      'SSL termination at LB only; HTTP to backend servers',
      'SSL termination at ALB with ACM-managed certificate, enforce TLS 1.2+ security policy, HTTPS redirect (HTTP 301), and re-encrypt to backends via HTTPS',
      'Self-signed certificates on each backend server only',
    ],
    correctIndex: 2,
    explanation: 'End-to-end encryption with ACM certificates, TLS 1.2+ enforcement, HTTPS redirect, and backend re-encryption protects data in transit completely.',
  },
  {
    id: 'sticky',
    title: 'Sticky Sessions',
    description: 'The application uses server-side sessions stored in memory. Users report being logged out randomly. How should session persistence be configured?',
    icon: <Server size={18} />,
    options: [
      'Enable duration-based sticky sessions with 1-hour cookie lifetime',
      'Migrate to externalized sessions (Redis/ElastiCache) for stateless backends, removing the need for sticky sessions entirely',
      'Disable the load balancer and use a single server',
      'Use IP hash-based routing permanently',
    ],
    correctIndex: 1,
    explanation: 'Externalized session storage makes backends stateless, enabling true load balancing without sticky session limitations.',
  },
  {
    id: 'autoscale',
    title: 'Auto-Scaling Integration',
    description: 'Configure auto-scaling for the backend instances behind the ALB. Traffic peaks 10x during sales events. Which configuration is optimal?',
    icon: <Zap size={18} />,
    options: [
      'Manually add instances before known peak events',
      'Scale based on CPU utilization only with a 5-minute cooldown',
      'Target tracking on ALB RequestCountPerTarget, step scaling for CPU/memory, scheduled scaling for known peaks, connection draining (300s), and warm pool for faster launches',
      'Keep maximum capacity running at all times',
    ],
    correctIndex: 2,
    explanation: 'Multiple scaling policies, scheduled scaling, connection draining, and warm pools handle variable traffic efficiently while maintaining availability.',
  },
];

const STEP_COLORS = ['#00d4ff', '#00ff41', '#ffaa00', '#a855f7', '#ff3366'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function LoadBalancerPBQ({ onComplete }: Props) {
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
          <ArrowUpDown size={16} className="text-[#00b4d8]" />
          <span className="text-caption text-[#7da0c4] font-display">Load Balancer Configuration</span>
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

        {/* LB visualization */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">LB ARCHITECTURE</h4>
          <div className="bg-[#0a1628] border border-[#1a2d45] rounded-lg p-3 space-y-2">
            {/* Internet */}
            <div className="text-center">
              <span className="text-[10px] text-[#7da0c4] font-mono">Internet Traffic</span>
            </div>
            <div className="flex justify-center"><div className="w-px h-4 bg-[#1a2d45]" /></div>

            {/* ALB */}
            <motion.div animate={{
                borderColor: answers[0] !== null ? (answers[0] === STEPS[0].correctIndex ? '#00ff41' : '#ff3366') : '#00d4ff',
                boxShadow: currentStep === 0 ? '0 0 10px rgba(0,212,255,0.2)' : 'none',
              }}
              className="border-2 rounded-lg p-2 bg-[#0d1526] text-center">
              <ArrowUpDown size={14} className="text-[#00d4ff] mx-auto" />
              <span className="text-[9px] text-[#e0f2fe] font-display block">Application LB</span>
              <span className="text-[7px] text-[#4a6682] font-mono">Layer 7 | HTTPS</span>
            </motion.div>

            <div className="flex justify-center"><div className="w-px h-3 bg-[#1a2d45]" /></div>

            {/* Health check indicator */}
            <div className="flex items-center justify-center gap-2">
              <motion.div animate={{ backgroundColor: answers[1] !== null ? '#00ff41' : '#ffaa00' }}
                className="w-2 h-2 rounded-full" />
              <span className="text-[8px] text-[#7da0c4] font-mono">Health: /health (15s interval)</span>
            </div>

            <div className="flex justify-center"><div className="w-px h-3 bg-[#1a2d45]" /></div>

            {/* Target group */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(i => (
                <motion.div key={i} className="border border-[#1a2d45] rounded p-1 bg-[#0d1526] text-center"
                  animate={{ borderColor: answers[4] !== null ? '#00ff41' : '#1a2d45' }}>
                  <Server size={10} className="text-[#4a6682] mx-auto" />
                  <span className="text-[7px] text-[#7da0c4] font-mono">Instance {i}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <h4 className="text-caption text-[#7da0c4] font-display mt-3 mb-2">CONFIG STATUS</h4>
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
              <Shield size={20} className="text-[#00b4d8] mx-auto mb-1" />
              <p className="text-sm text-[#00b4d8] font-display">LB Configured</p>
              <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
