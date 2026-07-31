import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Key, FileCheck, RefreshCw, Search, ChevronRight, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const pkiInfraMetadata: PBQMetadata = {
  id: 'pki-infra',
  title: 'PKI Infrastructure Designer',
  description: 'Design a PKI infrastructure including CA hierarchy, certificate templates, revocation mechanisms, key management, and audit procedures.',
  difficulty: 5,
  category: 'CASP+',
  tags: ['pki', 'certificates', 'ca-hierarchy', 'key-management'],
  xpReward: 70,
  estimatedTime: '12 min',
};

interface PKITask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TASKS: PKITask[] = [
  {
    id: 'ca-hierarchy',
    title: 'Design CA Hierarchy',
    description: 'Design the CA hierarchy for a multinational corporation with regulatory requirements across EU, US, and APAC. Which design is most appropriate?',
    icon: <Lock size={18} />,
    options: [
      'Single root CA issuing all certificates directly',
      'Offline root CA with regional intermediate CAs (EU, US, APAC), each with policy-constrained issuing CAs',
      'Two root CAs in active-active configuration',
      'Cloud-managed CA with no offline root',
    ],
    correctIndex: 1,
    explanation: 'An offline root with regional intermediates provides security, regulatory compliance, and operational isolation per jurisdiction.',
  },
  {
    id: 'templates',
    title: 'Certificate Templates',
    description: 'Configure certificate templates for the organization. A web server template is needed. Which settings are correct?',
    icon: <FileCheck size={18} />,
    options: [
      'Key usage: Digital Signature + Key Encipherment, EKU: Server Authentication, RSA 2048, 1-year validity',
      'Key usage: All purposes, EKU: Any, RSA 1024, 5-year validity',
      'Key usage: Digital Signature only, EKU: Client Authentication, RSA 4096, 2-year validity',
      'Key usage: Key Encipherment, EKU: Code Signing, ECDSA P-256, 90-day validity',
    ],
    correctIndex: 0,
    explanation: 'Web server certificates need Digital Signature + Key Encipherment for TLS, Server Auth EKU, minimum RSA 2048, and reasonable validity.',
  },
  {
    id: 'revocation',
    title: 'CRL/OCSP Implementation',
    description: 'Implement certificate revocation checking. The environment has 50,000 certificates. Which approach is best?',
    icon: <RefreshCw size={18} />,
    options: [
      'CRL only, published every 24 hours via LDAP',
      'OCSP responder with stapling support, backed by CRL as fallback, with delta CRLs for real-time revocation',
      'No revocation checking; rely on short-lived certificates only',
      'Manual certificate revocation via email notifications',
    ],
    correctIndex: 1,
    explanation: 'OCSP with stapling provides real-time status checks efficiently, while CRL fallback and delta CRLs ensure availability and timeliness.',
  },
  {
    id: 'key-mgmt',
    title: 'Key Management',
    description: 'Establish key management for the root CA and issuing CAs. Which practice is most secure?',
    icon: <Key size={18} />,
    options: [
      'Store root CA key on the CA server hard drive with strong ACLs',
      'Use a single HSM for all CA keys',
      'Root CA key in FIPS 140-2 Level 3 HSM (offline), issuing CA keys in network-attached HSMs with m-of-n key ceremony',
      'Export root CA key to encrypted USB drives stored in a safe',
    ],
    correctIndex: 2,
    explanation: 'Root key in offline FIPS 140-2 Level 3 HSM with key ceremony provides the highest assurance. Issuing CAs use network HSMs for operational efficiency.',
  },
  {
    id: 'audit',
    title: 'PKI Audit',
    description: 'Design the audit framework for the PKI. Which approach ensures compliance and security?',
    icon: <Search size={18} />,
    options: [
      'Review CA logs annually during compliance audits',
      'Continuous monitoring of certificate issuance, automated alerting on policy violations, quarterly key ceremony audits, and CT log monitoring',
      'Manual review of certificate requests by security team',
      'Rely on the CA vendor\'s built-in reporting',
    ],
    correctIndex: 1,
    explanation: 'Continuous monitoring, automated alerts, regular audits, and Certificate Transparency monitoring provide comprehensive PKI oversight.',
  },
];

const STEP_COLORS = ['#00d4ff', '#ffaa00', '#ff3366', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function PKIInfraPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TASKS.length).fill(null));
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = useCallback((optionIndex: number) => {
    if (completed || answers[currentStep] !== null) return;
    const isCorrect = optionIndex === TASKS[currentStep].correctIndex;
    const newAnswers = [...answers];
    newAnswers[currentStep] = optionIndex;
    setAnswers(newAnswers);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    const correctCount = newAnswers.filter((a, i) => a === TASKS[i].correctIndex).length;
    const newScore = Math.round((correctCount / TASKS.length) * 100);
    setScore(newScore);

    if (currentStep === TASKS.length - 1) {
      setTimeout(() => { setCompleted(true); onComplete?.(newScore); }, 1200);
    } else {
      setTimeout(() => { setCurrentStep(prev => prev + 1); setFeedback(null); }, 1500);
    }
  }, [currentStep, answers, completed, onComplete]);

  const task = TASKS[currentStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-[#06d6a0]" />
          <span className="text-caption text-[#7da0c4] font-display">PKI Infrastructure Design</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={TASKS.length} score={score} />
      </div>

      {/* CA hierarchy visualization */}
      <div className="mb-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1">
          <motion.div animate={{ borderColor: answers[0] !== null ? (answers[0] === TASKS[0].correctIndex ? '#00ff41' : '#ff3366') : currentStep === 0 ? '#ffaa00' : '#1a2d45' }}
            className="px-4 py-2 border-2 rounded-lg bg-[#0d1526]">
            <div className="flex items-center gap-2">
              <Lock size={12} className="text-[#ffaa00]" />
              <span className="text-[10px] text-[#e0f2fe] font-display">Root CA (Offline)</span>
            </div>
          </motion.div>
          <div className="w-px h-4 bg-[#1a2d45]" />
          <div className="flex gap-4">
            {['EU Intermediate', 'US Intermediate', 'APAC Intermediate'].map((name, i) => (
              <motion.div key={name} animate={{ borderColor: answers[1] !== null && i === 0 ? (answers[1] === TASKS[1].correctIndex ? '#00ff41' : '#ff3366') : '#1a2d45' }}
                className="px-3 py-1.5 border rounded-lg bg-[#0d1526]">
                <span className="text-[9px] text-[#7da0c4] font-display">{name}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-16">
            <div className="w-px h-3 bg-[#1a2d45]" />
            <div className="w-px h-3 bg-[#1a2d45]" />
            <div className="w-px h-3 bg-[#1a2d45]" />
          </div>
          <div className="flex gap-4">
            {['Issuing CA', 'Issuing CA', 'Issuing CA'].map((name, i) => (
              <div key={i} className="px-3 py-1 border border-[#1a2d45] rounded bg-[#0a1628]">
                <span className="text-[8px] text-[#4a6682] font-mono">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {TASKS.map((t, i) => (
          <div key={t.id} className="flex items-center gap-1">
            <motion.div animate={{
                borderColor: answers[i] !== null ? (answers[i] === TASKS[i].correctIndex ? '#00ff41' : '#ff3366') : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
              }}
              className="w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer bg-[#0d1526]"
              onClick={() => !completed && setCurrentStep(i)}>
              {answers[i] !== null ? (
                answers[i] === TASKS[i].correctIndex ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />
              ) : (
                <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{t.icon}</span>
              )}
            </motion.div>
            {i < TASKS.length - 1 && <ChevronRight size={12} className="text-[#1a2d45]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${STEP_COLORS[currentStep]}20` }}>
                <span style={{ color: STEP_COLORS[currentStep] }}>{task.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">Task {currentStep + 1}: {task.title}</h3>
                <p className="text-xs text-[#7da0c4]">{task.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {task.options.map((opt, i) => {
                const isSelected = answers[currentStep] === i;
                const isCorrect = i === task.correctIndex && answers[currentStep] !== null;
                const isWrong = isSelected && i !== task.correctIndex;
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
                  <p className="text-xs text-[#7da0c4] mt-1">{task.explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)]">
                  <p className="text-sm text-[#ff3366] font-display">Incorrect.</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{task.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* PKI status panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">PKI COMPONENTS</h4>
          <div className="space-y-2">
            {TASKS.map((t, i) => {
              const status = answers[i] === null ? 'pending' : answers[i] === t.correctIndex ? 'configured' : 'error';
              return (
                <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg" style={{
                  backgroundColor: status === 'configured' ? 'rgba(0,255,65,0.05)' : status === 'error' ? 'rgba(255,51,102,0.05)' : '#0a1628',
                }}>
                  <span style={{ color: STEP_COLORS[i] }}>{t.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-[#e0f2fe] font-display">{t.title}</p>
                    <p className="text-[10px]" style={{ color: status === 'configured' ? '#00ff41' : status === 'error' ? '#ff3366' : '#4a6682' }}>
                      {status === 'configured' ? 'Properly configured' : status === 'error' ? 'Configuration issue' : 'Not configured'}
                    </p>
                  </div>
                  {status === 'configured' && <CheckCircle size={12} className="text-[#00ff41]" />}
                  {status === 'error' && <XCircle size={12} className="text-[#ff3366]" />}
                </div>
              );
            })}
          </div>

          {completed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 border border-[#06d6a0] rounded-lg bg-[rgba(6,214,160,0.1)] text-center">
              <ShieldCheck size={20} className="text-[#06d6a0] mx-auto mb-1" />
              <p className="text-sm text-[#06d6a0] font-display">PKI Design Complete</p>
              <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
