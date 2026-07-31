import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Lock, Key, FileText, Clock, History, ChevronRight, CheckCircle, XCircle, Shield } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const cloudStorageMetadata: PBQMetadata = {
  id: 'cloud-storage',
  title: 'Cloud Storage Security',
  description: 'Secure cloud storage by configuring bucket policies, encryption, lifecycle rules, access logging, and versioning.',
  difficulty: 3,
  category: 'Cloud+',
  tags: ['cloud-storage', 's3', 'encryption', 'bucket-policy'],
  xpReward: 50,
  estimatedTime: '10 min',
};

interface StorageTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
  config: string;
}

const TASKS: StorageTask[] = [
  {
    id: 'bucket-policy',
    title: 'Bucket Policies',
    description: 'An S3 bucket stores customer documents. The bucket is currently publicly accessible. How should the bucket policy be configured?',
    icon: <FileText size={18} />,
    options: [
      'Leave public access for easier sharing with customers',
      'Block all public access, enforce bucket policy requiring TLS (aws:SecureTransport), restrict to specific IAM roles and VPC endpoints only',
      'Add a password to the bucket URL',
      'Move data to a private FTP server instead',
    ],
    correctIndex: 1,
    explanation: 'Blocking public access, enforcing TLS, and restricting to IAM roles/VPC endpoints eliminates unauthorized access vectors.',
    config: 'PublicAccessBlock: ALL\nSSL Required: true\nAccess: IAM + VPC Endpoint',
  },
  {
    id: 'encryption',
    title: 'Encryption at Rest',
    description: 'Configure encryption for buckets containing financial data subject to regulatory requirements. Which encryption strategy is most appropriate?',
    icon: <Key size={18} />,
    options: [
      'No encryption needed; cloud storage is secure by default',
      'SSE-S3 (Amazon-managed keys) for all buckets',
      'SSE-KMS with customer-managed CMK, enable key rotation, enforce encryption via bucket policy (deny PutObject without server-side-encryption header)',
      'Client-side encryption only with keys stored in the application',
    ],
    correctIndex: 2,
    explanation: 'Customer-managed KMS keys with rotation provide audit trails, access control, and regulatory compliance. Bucket policy enforcement prevents unencrypted uploads.',
    config: 'Algorithm: AES-256 (KMS)\nKey: CMK (customer managed)\nRotation: Annual (automatic)',
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle Rules',
    description: 'Data retention policy requires: active data for 30 days, infrequent access for 90 days, archive for 1 year, then delete. Configure lifecycle rules.',
    icon: <Clock size={18} />,
    options: [
      'Keep all data in Standard storage class forever',
      'Delete data after 30 days to save costs',
      'Standard (0-30 days) -> IA (30-90 days) -> Glacier (90-365 days) -> Delete (365+ days), with abort incomplete multipart uploads after 7 days',
      'Move everything to Glacier immediately',
    ],
    correctIndex: 2,
    explanation: 'Tiered lifecycle rules optimize costs while meeting retention requirements. Aborting incomplete uploads prevents storage waste.',
    config: 'Day 0-30: STANDARD\nDay 30-90: STANDARD_IA\nDay 90-365: GLACIER\nDay 365+: DELETE',
  },
  {
    id: 'logging',
    title: 'Access Logging',
    description: 'Enable comprehensive access logging for compliance. Which configuration provides the best audit trail?',
    icon: <FileText size={18} />,
    options: [
      'Enable S3 server access logging only',
      'Enable CloudTrail data events for S3 (read/write), S3 server access logging to a separate secured bucket, CloudWatch metrics for anomaly detection, and access log analysis with Athena',
      'Review AWS billing reports for access patterns',
      'Enable logging only for failed access attempts',
    ],
    correctIndex: 1,
    explanation: 'CloudTrail data events capture API-level detail, server access logs provide request-level data, and CloudWatch enables real-time monitoring.',
    config: 'CloudTrail: Data Events ON\nServer Logs: Separate bucket\nCloudWatch: Anomaly alarms\nRetention: 7 years',
  },
  {
    id: 'versioning',
    title: 'Versioning & Protection',
    description: 'Protect the storage bucket against accidental deletion and ransomware. Which combination of features provides the strongest protection?',
    icon: <History size={18} />,
    options: [
      'Daily backups to another bucket',
      'Enable versioning only',
      'Enable versioning with MFA Delete, Object Lock (compliance mode), cross-region replication to a separate account, and S3 Object Lock legal hold for regulated data',
      'Use RAID storage instead of cloud storage',
    ],
    correctIndex: 2,
    explanation: 'Versioning + MFA Delete + Object Lock + cross-account replication provides immutable, ransomware-resistant storage with regulatory compliance.',
    config: 'Versioning: Enabled\nMFA Delete: Required\nObject Lock: Compliance Mode\nReplication: Cross-Region + Cross-Account',
  },
];

const STEP_COLORS = ['#00d4ff', '#ffaa00', '#ff3366', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function CloudStoragePBQ({ onComplete }: Props) {
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
          <Database size={16} className="text-[#00b4d8]" />
          <span className="text-caption text-[#7da0c4] font-display">Cloud Storage Security</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={TASKS.length} score={score} />
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

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
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

        {/* Storage config panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45] flex items-center gap-2">
            <Lock size={12} className="text-[#00b4d8]" />
            <span className="text-caption text-[#7da0c4] font-display">Bucket Configuration</span>
          </div>
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.pre key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs font-mono text-[#00d4ff] whitespace-pre-wrap bg-[#0a1628] p-3 rounded-lg border border-[#1a2d45]">
                {task.config}
              </motion.pre>
            </AnimatePresence>

            <h4 className="text-caption text-[#7da0c4] font-display mt-4 mb-2">SECURITY CONTROLS</h4>
            <div className="space-y-1">
              {TASKS.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2 py-1">
                  <div className={`w-2 h-2 rounded-full ${
                    answers[i] === null ? 'bg-[#1a2d45]' : answers[i] === t.correctIndex ? 'bg-[#00ff41]' : 'bg-[#ff3366]'
                  }`} />
                  <span className="text-[10px] text-[#7da0c4]">{t.title}</span>
                  {answers[i] !== null && (
                    <span className={`text-[8px] ml-auto ${answers[i] === t.correctIndex ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                      {answers[i] === t.correctIndex ? 'SECURED' : 'AT RISK'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 p-3 border border-[#00b4d8] rounded-lg bg-[rgba(0,180,216,0.1)] text-center">
                <Shield size={20} className="text-[#00b4d8] mx-auto mb-1" />
                <p className="text-sm text-[#00b4d8] font-display">Storage Secured</p>
                <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
