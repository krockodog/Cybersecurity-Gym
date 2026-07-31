import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Lock, Key, Users, ShieldCheck, ChevronRight, CheckCircle, XCircle, Database } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const cloudMigrationSecMetadata: PBQMetadata = {
  id: 'cloud-migration-sec',
  title: 'Cloud Migration Security Assessment',
  description: 'Evaluate security considerations for cloud migration including data classification, encryption, identity federation, and shared responsibility.',
  difficulty: 4,
  category: 'CASP+',
  tags: ['cloud-security', 'migration', 'encryption', 'identity-federation'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface MigrationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const STEPS: MigrationStep[] = [
  {
    id: 'classification',
    title: 'Data Classification',
    description: 'Before migrating to the cloud, the organization must classify data. Customer PII, financial records, and internal communications are being moved. Which classification approach is correct?',
    icon: <Database size={18} />,
    options: [
      'Classify all data as "Internal" to simplify migration',
      'Apply classification per data type: PII as Restricted, financials as Confidential, comms as Internal',
      'Let the cloud provider handle classification automatically',
      'Classify everything as Restricted for maximum security',
    ],
    correctIndex: 1,
    explanation: 'Proper classification assigns appropriate controls per data sensitivity, avoiding both under-protection and excessive overhead.',
  },
  {
    id: 'encryption',
    title: 'Encryption Strategy',
    description: 'The Restricted data requires encryption. Which strategy best protects data in transit and at rest in a multi-cloud environment?',
    icon: <Key size={18} />,
    options: [
      'Use provider-managed keys with default encryption for all tiers',
      'Encrypt at rest with customer-managed keys (BYOK/HYOK), TLS 1.3 in transit, and client-side encryption for Restricted data',
      'Use application-level encryption only',
      'Rely on HTTPS for transit; no at-rest encryption needed in private cloud',
    ],
    correctIndex: 1,
    explanation: 'Customer-managed keys ensure sovereignty, TLS 1.3 secures transit, and client-side encryption adds defense-in-depth for sensitive data.',
  },
  {
    id: 'federation',
    title: 'Identity Federation',
    description: 'The org uses on-prem Active Directory with 5,000 users. How should identity federation be configured for cloud services?',
    icon: <Users size={18} />,
    options: [
      'Create separate cloud-native accounts for each user',
      'Sync passwords directly to the cloud provider',
      'Implement SAML/OIDC federation with on-prem IdP, enforce MFA, and use conditional access policies',
      'Use a shared admin account for cloud management',
    ],
    correctIndex: 2,
    explanation: 'SAML/OIDC federation maintains single source of truth for identity, while MFA and conditional access enforce Zero Trust principles.',
  },
  {
    id: 'responsibility',
    title: 'Shared Responsibility Model',
    description: 'The team is deploying a PaaS-based web application. Under the shared responsibility model, which security controls are the CUSTOMER\'s responsibility?',
    icon: <ShieldCheck size={18} />,
    options: [
      'Physical data center security and hypervisor patching',
      'Application code security, identity management, data encryption, and network access controls',
      'OS patching and hardware maintenance',
      'All security is the cloud provider\'s responsibility in PaaS',
    ],
    correctIndex: 1,
    explanation: 'In PaaS, the customer owns application-level security, identity, data protection, and access controls. The provider manages infrastructure.',
  },
  {
    id: 'controls',
    title: 'Security Controls Planning',
    description: 'Design the security control framework for the migrated environment. Which combination provides the strongest posture?',
    icon: <Lock size={18} />,
    options: [
      'Firewall and antivirus only',
      'CASB, CSPM, CWPP with automated compliance monitoring, DLP, and centralized SIEM integration',
      'Manual security audits performed quarterly',
      'Cloud provider native security tools only, with no additional controls',
    ],
    correctIndex: 1,
    explanation: 'A layered approach with CASB, CSPM, CWPP, DLP, and SIEM provides comprehensive visibility, compliance, and threat detection.',
  },
];

const STEP_ICONS = [Database, Key, Users, ShieldCheck, Lock];
const STEP_COLORS = ['#00d4ff', '#ffaa00', '#a855f7', '#00ff41', '#ff3366'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function CloudMigrationSecPBQ({ onComplete }: Props) {
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
  const migrationProgress = answers.filter(a => a !== null).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud size={16} className="text-[#06d6a0]" />
          <span className="text-caption text-[#7da0c4] font-display">Cloud Migration Security</span>
        </div>
        <ProgressTracker current={migrationProgress} total={STEPS.length} score={score} />
      </div>

      {/* Migration pipeline */}
      <div className="mb-6 bg-[#0d1526] border border-[#1a2d45] rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#4a6682] font-display">MIGRATION PIPELINE</span>
          <span className="text-[10px] text-[#7da0c4] font-mono">{migrationProgress}/{STEPS.length} phases</span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1 flex-1">
              <motion.div
                animate={{
                  backgroundColor: answers[i] !== null
                    ? answers[i] === STEPS[i].correctIndex ? 'rgba(0,255,65,0.2)' : 'rgba(255,51,102,0.2)'
                    : i === currentStep ? `${STEP_COLORS[i]}20` : '#0a1628',
                  borderColor: answers[i] !== null
                    ? answers[i] === STEPS[i].correctIndex ? '#00ff41' : '#ff3366'
                    : i === currentStep ? STEP_COLORS[i] : '#1a2d45',
                }}
                className="flex-1 h-10 rounded-lg border flex items-center justify-center cursor-pointer gap-1"
                onClick={() => !completed && setCurrentStep(i)}
              >
                {answers[i] !== null ? (
                  answers[i] === STEPS[i].correctIndex ? <CheckCircle size={12} className="text-[#00ff41]" /> : <XCircle size={12} className="text-[#ff3366]" />
                ) : (
                  <span style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>{s.icon}</span>
                )}
                <span className="text-[8px] font-display hidden sm:inline" style={{ color: i === currentStep ? STEP_COLORS[i] : '#4a6682' }}>
                  {s.title.split(' ').slice(0, 2).join(' ')}
                </span>
              </motion.div>
              {i < STEPS.length - 1 && <ChevronRight size={10} className="text-[#1a2d45] flex-shrink-0" />}
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
                <span style={{ color: STEP_COLORS[currentStep] }}>{step.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">Phase {currentStep + 1}: {step.title}</h3>
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

        {/* Migration status panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-3">SECURITY POSTURE</h4>
          <div className="space-y-3">
            {STEPS.map((s, i) => {
              const status = answers[i] === null ? 'pending' : answers[i] === s.correctIndex ? 'secure' : 'risk';
              return (
                <motion.div key={s.id} className="flex items-center gap-3 p-2 rounded-lg" style={{
                  backgroundColor: status === 'secure' ? 'rgba(0,255,65,0.05)' : status === 'risk' ? 'rgba(255,51,102,0.05)' : '#0a1628',
                  borderLeft: `3px solid ${status === 'secure' ? '#00ff41' : status === 'risk' ? '#ff3366' : '#1a2d45'}`,
                }}>
                  <span style={{ color: STEP_COLORS[i] }}>{s.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-[#e0f2fe] font-display">{s.title}</p>
                    <p className="text-[10px]" style={{ color: status === 'secure' ? '#00ff41' : status === 'risk' ? '#ff3366' : '#4a6682' }}>
                      {status === 'secure' ? 'Configured' : status === 'risk' ? 'Misconfigured' : 'Pending'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {completed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 p-3 border border-[#06d6a0] rounded-lg bg-[rgba(6,214,160,0.1)] text-center">
              <Cloud size={20} className="text-[#06d6a0] mx-auto mb-1" />
              <p className="text-sm text-[#06d6a0] font-display">Migration Assessment Complete</p>
              <p className="text-xs text-[#7da0c4]">Security Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
