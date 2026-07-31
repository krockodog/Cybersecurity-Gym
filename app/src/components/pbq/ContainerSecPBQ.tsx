import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Search, Shield, Network, Key, FileSearch, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const containerSecMetadata: PBQMetadata = {
  id: 'container-sec',
  title: 'Container Security',
  description: 'Secure container environments by scanning images, configuring runtime security, implementing network policies, and managing secrets.',
  difficulty: 3,
  category: 'Cloud+',
  tags: ['containers', 'kubernetes', 'docker', 'runtime-security'],
  xpReward: 50,
  estimatedTime: '10 min',
};

interface ContainerScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
  finding: string;
}

const SCENARIOS: ContainerScenario[] = [
  {
    id: 'scan',
    title: 'Image Scanning',
    description: 'A CI/CD pipeline builds Docker images. The base image is ubuntu:latest. How should container images be secured before deployment?',
    icon: <Search size={18} />,
    options: [
      'Deploy images directly from Docker Hub without scanning',
      'Scan images in CI/CD with Trivy/Snyk, use minimal base images (distroless/Alpine), enforce no critical CVEs policy, and sign images with cosign',
      'Run antivirus on the container host only',
      'Use the latest tag for all base images to get automatic patches',
    ],
    correctIndex: 1,
    explanation: 'Automated scanning, minimal base images, CVE gates, and image signing create a secure supply chain for container images.',
    finding: '47 CVEs found in ubuntu:latest',
  },
  {
    id: 'runtime',
    title: 'Runtime Security',
    description: 'Configure runtime security for production Kubernetes pods. Which settings enforce the strongest security posture?',
    icon: <Shield size={18} />,
    options: [
      'Run containers as root with privileged: true for compatibility',
      'Set runAsNonRoot: true, readOnlyRootFilesystem: true, drop ALL capabilities, set allowPrivilegeEscalation: false, use seccomp/AppArmor profiles',
      'Use default Kubernetes security settings',
      'Disable security contexts to avoid application issues',
    ],
    correctIndex: 1,
    explanation: 'Non-root, read-only filesystem, dropped capabilities, and mandatory security profiles minimize the container attack surface.',
    finding: 'Privileged container detected',
  },
  {
    id: 'network-policy',
    title: 'Network Policies',
    description: 'A microservices architecture has frontend, API, and database pods. How should Kubernetes NetworkPolicies be configured?',
    icon: <Network size={18} />,
    options: [
      'No network policies needed; Kubernetes handles isolation',
      'Allow all ingress and egress for simplicity',
      'Default deny all, then allow: frontend -> API (port 8080), API -> DB (port 5432), frontend -> Internet (port 443), deny all other inter-pod traffic',
      'Block only external traffic; allow all internal communication',
    ],
    correctIndex: 2,
    explanation: 'Default-deny with explicit allow rules implements least privilege networking, preventing lateral movement between microservices.',
    finding: 'No network policies defined',
  },
  {
    id: 'secrets',
    title: 'Secrets Management',
    description: 'Application containers need database credentials and API keys. How should secrets be managed in Kubernetes?',
    icon: <Key size={18} />,
    options: [
      'Store secrets as environment variables in the Dockerfile',
      'Hardcode credentials in application config files committed to Git',
      'Use external secrets manager (Vault/AWS SM) with CSI driver, enable encryption at rest for etcd, rotate secrets automatically, mount as tmpfs volumes',
      'Store credentials in Kubernetes ConfigMaps',
    ],
    correctIndex: 2,
    explanation: 'External secrets managers with CSI drivers, etcd encryption, auto-rotation, and tmpfs mounts provide defense-in-depth for secrets.',
    finding: 'Secrets stored in env vars',
  },
  {
    id: 'audit',
    title: 'Container Config Audit',
    description: 'Audit the container configuration for compliance. Which tool and approach provides the most comprehensive audit?',
    icon: <FileSearch size={18} />,
    options: [
      'Manual review of each Dockerfile',
      'Run CIS Kubernetes Benchmark with kube-bench, scan with OPA/Gatekeeper policies, audit with Falco for runtime anomalies, and integrate results into SIEM',
      'Check container logs for errors periodically',
      'Use kubectl describe to review pod configurations',
    ],
    correctIndex: 1,
    explanation: 'CIS benchmarks, policy enforcement with OPA, runtime detection with Falco, and SIEM integration provide comprehensive audit coverage.',
    finding: 'CIS benchmark: 23 failures',
  },
];

const STEP_COLORS = ['#00d4ff', '#ff3366', '#ffaa00', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ContainerSecPBQ({ onComplete }: Props) {
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
          <Box size={16} className="text-[#00b4d8]" />
          <span className="text-caption text-[#7da0c4] font-display">Container Security</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={SCENARIOS.length} score={score} />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {SCENARIOS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1">
            <motion.div animate={{
                borderColor: answers[i] !== null ? (answers[i] === SCENARIOS[i].correctIndex ? '#00ff41' : '#ff3366') : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
              }}
              className="w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer bg-[#0d1526]"
              onClick={() => !completed && setCurrentStep(i)}>
              {answers[i] !== null ? (
                answers[i] === SCENARIOS[i].correctIndex ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
              ) : (
                <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{s.icon}</span>
              )}
            </motion.div>
            {i < SCENARIOS.length - 1 && <ChevronRight size={12} className="text-[#1a2d45]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
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

        {/* Scan results panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45] flex items-center gap-2">
            <Box size={12} className="text-[#00b4d8]" />
            <span className="text-caption text-[#7da0c4] font-display">Security Scan</span>
          </div>
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="p-3 bg-[#0a1628] border border-[#ff3366] rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse" />
                    <span className="text-[10px] text-[#ff3366] font-display">FINDING</span>
                  </div>
                  <p className="text-xs text-[#e0f2fe] font-mono">{scenario.finding}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <h4 className="text-caption text-[#7da0c4] font-display mb-2">SECURITY LAYERS</h4>
            <div className="space-y-2">
              {SCENARIOS.map((s, i) => {
                const status = answers[i] === null ? 'unchecked' : answers[i] === s.correctIndex ? 'secure' : 'vulnerable';
                return (
                  <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg" style={{
                    backgroundColor: status === 'secure' ? 'rgba(0,255,65,0.05)' : status === 'vulnerable' ? 'rgba(255,51,102,0.05)' : '#0a1628',
                  }}>
                    <span style={{ color: STEP_COLORS[i] }}>{s.icon}</span>
                    <div className="flex-1">
                      <p className="text-[10px] text-[#e0f2fe] font-display">{s.title}</p>
                      <p className="text-[9px]" style={{ color: status === 'secure' ? '#00ff41' : status === 'vulnerable' ? '#ff3366' : '#4a6682' }}>
                        {status === 'secure' ? 'Hardened' : status === 'vulnerable' ? 'Vulnerable' : 'Pending scan'}
                      </p>
                    </div>
                    {status !== 'unchecked' && (
                      status === 'secure' ? <CheckCircle size={12} className="text-[#00ff41]" /> : <XCircle size={12} className="text-[#ff3366]" />
                    )}
                  </div>
                );
              })}
            </div>

            {completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 p-3 border border-[#00b4d8] rounded-lg bg-[rgba(0,180,216,0.1)] text-center">
                <Shield size={20} className="text-[#00b4d8] mx-auto mb-1" />
                <p className="text-sm text-[#00b4d8] font-display">Scan Complete</p>
                <p className="text-xs text-[#7da0c4]">Security Score: {score}%</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
