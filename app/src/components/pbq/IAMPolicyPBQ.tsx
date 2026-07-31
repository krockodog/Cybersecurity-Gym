import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Key, Lock, Search, ChevronRight, CheckCircle, XCircle, FileText } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const iamPolicyMetadata: PBQMetadata = {
  id: 'iam-policy',
  title: 'IAM Policy Builder',
  description: 'Build least-privilege IAM policies, configure role assumptions, set up MFA, implement SCPs, and audit permissions.',
  difficulty: 4,
  category: 'Cloud+',
  tags: ['iam', 'policy', 'least-privilege', 'mfa', 'scp'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface IAMTask {
  id: string;
  title: string;
  description: string;
  policySnippet: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TASKS: IAMTask[] = [
  {
    id: 'least-priv',
    title: 'Least-Privilege Policy',
    description: 'A Lambda function needs to read from a specific DynamoDB table "Orders" and write to an S3 bucket "invoices-prod". Which policy follows least privilege?',
    policySnippet: '{\n  "Effect": "Allow",\n  "Action": [...],\n  "Resource": [...]\n}',
    icon: <FileText size={18} />,
    options: [
      'Action: "*", Resource: "*" (full admin access)',
      'Action: ["dynamodb:GetItem","dynamodb:Query"], Resource: "arn:aws:dynamodb:*:*:table/Orders"; Action: ["s3:PutObject"], Resource: "arn:aws:s3:::invoices-prod/*"',
      'Action: ["dynamodb:*"], Resource: "*"; Action: ["s3:*"], Resource: "*"',
      'Action: ["dynamodb:GetItem"], Resource: "arn:aws:dynamodb:*:*:table/*"',
    ],
    correctIndex: 1,
    explanation: 'Least privilege grants only the specific actions needed on the specific resources required - no wildcards.',
  },
  {
    id: 'role-assume',
    title: 'Role Assumption',
    description: 'A CI/CD pipeline in Account A needs to deploy to Account B. How should cross-account role assumption be configured?',
    policySnippet: 'Trust Policy in Account B:\n{\n  "Principal": {...},\n  "Condition": {...}\n}',
    icon: <Users size={18} />,
    options: [
      'Share Account B root credentials with the CI/CD pipeline',
      'Create IAM user in Account B with access keys stored in CI/CD secrets',
      'Configure trust policy in Account B allowing Account A\'s CI/CD role with external ID condition, and assume-role policy in Account A',
      'Use the same IAM role in both accounts',
    ],
    correctIndex: 2,
    explanation: 'Cross-account role assumption with trust policies and external ID conditions is the secure, recommended approach for cross-account access.',
  },
  {
    id: 'mfa',
    title: 'MFA Requirements',
    description: 'Enforce MFA for all IAM users performing sensitive operations. Which policy implementation is correct?',
    policySnippet: '{\n  "Condition": {\n    "BoolIfExists": {...}\n  }\n}',
    icon: <Key size={18} />,
    options: [
      'Send email reminders to enable MFA',
      'Deny all actions except IAM self-service when MFA is not present using aws:MultiFactorAuthPresent condition',
      'Enable MFA on the root account only',
      'Use password complexity requirements instead of MFA',
    ],
    correctIndex: 1,
    explanation: 'A deny policy conditioned on missing MFA forces users to authenticate with MFA before performing any sensitive actions.',
  },
  {
    id: 'scp',
    title: 'Service Control Policies',
    description: 'Implement SCPs for an AWS Organization. The security team wants to prevent any account from disabling CloudTrail or leaving the organization. Which SCP is correct?',
    policySnippet: 'SCP attached to Root OU:\n{\n  "Effect": "Deny",\n  "Action": [...]\n}',
    icon: <Shield size={18} />,
    options: [
      'Allow all services and rely on individual account IAM policies',
      'Deny ["cloudtrail:StopLogging","cloudtrail:DeleteTrail","organizations:LeaveOrganization"] with no condition (applies to all principals including admins)',
      'Create an IAM policy in each account blocking these actions',
      'Use AWS Config rules to detect violations after they occur',
    ],
    correctIndex: 1,
    explanation: 'SCPs provide guardrails that even account administrators cannot override, making them ideal for enforcing organizational security baselines.',
  },
  {
    id: 'audit',
    title: 'Permission Audit',
    description: 'Audit IAM permissions across 50 AWS accounts. Which approach provides the most comprehensive audit?',
    policySnippet: 'Audit targets:\n- Unused permissions\n- Overprivileged roles\n- Policy drift',
    icon: <Search size={18} />,
    options: [
      'Manually review IAM policies in each account console',
      'Use IAM Access Analyzer for unused access, Access Advisor for last-accessed data, and automated policy simulation across all accounts with centralized reporting',
      'Run AWS Trusted Advisor checks quarterly',
      'Check CloudTrail logs for denied API calls only',
    ],
    correctIndex: 1,
    explanation: 'Access Analyzer, Access Advisor, and policy simulation together provide comprehensive visibility into unused, overprivileged, and drifted permissions.',
  },
];

const STEP_COLORS = ['#00d4ff', '#ffaa00', '#ff3366', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function IAMPolicyPBQ({ onComplete }: Props) {
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
          <Users size={16} className="text-[#00b4d8]" />
          <span className="text-caption text-[#7da0c4] font-display">IAM Policy Builder</span>
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

        {/* Policy preview panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45] flex items-center gap-2">
            <Lock size={12} className="text-[#00b4d8]" />
            <span className="text-caption text-[#7da0c4] font-display">Policy Context</span>
          </div>
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.pre key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-xs font-mono text-[#00d4ff] whitespace-pre-wrap bg-[#0a1628] p-3 rounded-lg border border-[#1a2d45]">
                {task.policySnippet}
              </motion.pre>
            </AnimatePresence>

            <h4 className="text-caption text-[#7da0c4] font-display mt-4 mb-2">IAM CHECKLIST</h4>
            <div className="space-y-1">
              {TASKS.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2 py-1">
                  <div className={`w-2 h-2 rounded-full ${
                    answers[i] === null ? 'bg-[#1a2d45]' : answers[i] === t.correctIndex ? 'bg-[#00ff41]' : 'bg-[#ff3366]'
                  }`} />
                  <span className="text-[10px] text-[#7da0c4]">{t.title}</span>
                  {answers[i] !== null && (
                    <span className={`text-[8px] ml-auto ${answers[i] === t.correctIndex ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                      {answers[i] === t.correctIndex ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 p-3 border border-[#00b4d8] rounded-lg bg-[rgba(0,180,216,0.1)] text-center">
                <Shield size={20} className="text-[#00b4d8] mx-auto mb-1" />
                <p className="text-sm text-[#00b4d8] font-display">IAM Audit Complete</p>
                <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
