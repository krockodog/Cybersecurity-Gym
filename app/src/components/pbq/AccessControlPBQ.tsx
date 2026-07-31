import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, ShieldOff, Users, Key, UserCheck, ClipboardList, ChevronRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const accessMetadata: PBQMetadata = {
  id: 'access-control',
  title: 'Access Control Configuration Lab',
  description: 'Configure access controls for an enterprise environment. Apply RBAC, least privilege, MFA, separation of duties, and audit access logs correctly.',
  difficulty: 3,
  category: 'Security+',
  tags: ['access-control', 'rbac', 'least-privilege', 'mfa'],
  xpReward: 50,
  estimatedTime: '9 min',
};

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  context: ContextRow[];
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number | null;
  completed: boolean;
}

interface ContextRow {
  label: string;
  value: string;
  highlight?: boolean;
}

const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: 'rbac',
    title: 'RBAC Assignment',
    icon: <Users size={18} />,
    description: 'A new junior accountant (Maria) has joined the Finance department. Assign the correct role based on the principle of least privilege.',
    context: [
      { label: 'User', value: 'Maria Torres - Junior Accountant' },
      { label: 'Department', value: 'Finance' },
      { label: 'Manager', value: 'David Chen - Finance Director' },
      { label: 'Needs Access To', value: 'AP invoices, expense reports, GL read-only' },
    ],
    question: 'Which role should Maria be assigned?',
    options: [
      'Finance_Admin - Full read/write to all financial systems',
      'Finance_Analyst - Read/write AP, expenses; read-only GL and payroll',
      'Finance_Clerk - Read/write AP and expenses; read-only GL',
      'Finance_Director - Full access including budget approval and payroll',
    ],
    correctIndex: 2,
    explanation: 'Finance_Clerk matches her job requirements exactly: AP invoice processing, expense reports, and read-only GL. Finance_Analyst includes unnecessary payroll read access, violating least privilege.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'least-privilege',
    title: 'Least Privilege Violation',
    icon: <Eye size={18} />,
    description: 'An access audit reveals potential over-provisioning. Review the permissions matrix and identify which user has a least privilege violation.',
    context: [
      { label: 'Alice (Help Desk)', value: 'Ticket system, Password resets, AD read' },
      { label: 'Bob (Developer)', value: 'Code repos, CI/CD, Dev DB, Prod DB write', highlight: true },
      { label: 'Carol (HR Manager)', value: 'HRIS, Employee records, Benefits portal' },
      { label: 'Dave (Network Admin)', value: 'Switches, Routers, Firewall config, VPN' },
    ],
    question: 'Which user has excessive permissions that violate least privilege?',
    options: [
      'Alice - Help Desk staff should not have AD read access',
      'Bob - Developers should not have production database write access',
      'Carol - HR Managers should not access the benefits portal',
      'Dave - Network Admins should not manage VPN configurations',
    ],
    correctIndex: 1,
    explanation: 'Developers should have access to development databases but not production database write access. Prod changes should go through a change management process with separate deployment credentials.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'mfa',
    title: 'MFA Configuration',
    icon: <Key size={18} />,
    description: 'The security team is implementing MFA across the organization. You must determine the correct MFA policy for each access scenario.',
    context: [
      { label: 'Scenario', value: 'Configuring MFA requirements per risk level' },
      { label: 'High Risk', value: 'Admin consoles, financial systems, VPN' },
      { label: 'Medium Risk', value: 'Email, intranet, file shares' },
      { label: 'Low Risk', value: 'Break room kiosk, public WiFi guest portal' },
    ],
    question: 'Which MFA policy correctly aligns with zero-trust principles?',
    options: [
      'MFA only for high-risk systems; password-only for medium and low risk',
      'MFA for all systems with hardware tokens required for high-risk; app-based OTP for medium; optional for low-risk',
      'MFA for high and medium risk with SMS OTP; no MFA for low risk',
      'Biometric authentication everywhere with no fallback options',
    ],
    correctIndex: 1,
    explanation: 'Zero-trust requires MFA everywhere, with stronger factors (hardware tokens) for higher-risk systems. SMS OTP is considered weak (SIM-swapping risk). Low-risk systems can have optional but available MFA.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'separation',
    title: 'Separation of Duties',
    icon: <UserCheck size={18} />,
    description: 'The procurement process must enforce separation of duties. Review the current workflow and identify the conflict of interest.',
    context: [
      { label: 'Step 1', value: 'Requestor submits purchase request' },
      { label: 'Step 2', value: 'Manager approves request (> $1000)' },
      { label: 'Step 3', value: 'Procurement creates purchase order', highlight: true },
      { label: 'Step 4', value: 'Procurement receives goods and approves payment', highlight: true },
    ],
    question: 'Which change correctly enforces separation of duties?',
    options: [
      'Require two managers to approve all purchase requests regardless of amount',
      'Allow the requestor to also receive goods to speed up the process',
      'Split Step 3 and Step 4 so that different people create the PO and approve the payment upon receipt',
      'Add a fifth step where IT verifies all purchase orders',
    ],
    correctIndex: 2,
    explanation: 'The same person creating the purchase order and approving the payment is a classic separation of duties violation. The person who orders goods should not be the same person who confirms receipt and authorizes payment.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'audit',
    title: 'Access Log Audit',
    icon: <ClipboardList size={18} />,
    description: 'Review the access log entries from last night and identify the entry that indicates a potential security incident requiring immediate investigation.',
    context: [
      { label: '22:15 UTC', value: 'admin_jsmith: Login from 10.0.1.50 (corporate VPN)' },
      { label: '22:45 UTC', value: 'svc_backup: Accessed file share \\\\FS01\\backups' },
      { label: '01:30 UTC', value: 'admin_jsmith: Exported 2,847 customer records from CRM', highlight: true },
      { label: '02:10 UTC', value: 'svc_monitor: Health check on DB-SRV01 (scheduled)' },
    ],
    question: 'Which log entry should be escalated for immediate investigation?',
    options: [
      'admin_jsmith login at 22:15 - late night admin access is always suspicious',
      'svc_backup accessing backups - service accounts should not access file shares',
      'admin_jsmith exporting 2,847 customer records at 01:30 - bulk data export outside business hours',
      'svc_monitor health check - automated service running at 02:10 is unusual timing',
    ],
    correctIndex: 2,
    explanation: 'A bulk export of nearly 3,000 customer records at 1:30 AM is a strong indicator of data exfiltration. Even if the account is legitimate, this volume of PII export outside business hours warrants immediate investigation.',
    selectedIndex: null,
    completed: false,
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function AccessControlPBQ({ onComplete }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const selectOption = useCallback((optionIndex: number) => {
    if (completed || scenarios[currentStep].completed || feedback !== null) return;

    const scenario = scenarios[currentStep];
    const isCorrect = optionIndex === scenario.correctIndex;

    setScenarios(prev => prev.map((s, i) =>
      i === currentStep ? { ...s, selectedIndex: optionIndex, completed: isCorrect } : s
    ));

    if (isCorrect) {
      setFeedback('correct');
      const newScore = Math.round(((currentStep + 1) / scenarios.length) * 100);
      setScore(newScore);

      if (currentStep === scenarios.length - 1) {
        setCompleted(true);
        onComplete?.(newScore);
      } else {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setFeedback(null);
        }, 1600);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setScenarios(prev => prev.map((s, i) =>
          i === currentStep ? { ...s, selectedIndex: null } : s
        ));
        setFeedback(null);
      }, 1500);
    }
  }, [scenarios, currentStep, completed, feedback, onComplete]);

  const completedCount = scenarios.filter(s => s.completed).length;
  const current = scenarios[currentStep];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-[#00ff41]" />
          <span className="text-caption text-[#7da0c4] font-display">Access Control Configuration Lab</span>
        </div>
        <ProgressTracker current={completedCount} total={scenarios.length} score={score} />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-5 overflow-x-auto pb-2">
        {scenarios.map((scenario, i) => (
          <div key={scenario.id} className="flex items-center gap-1 flex-shrink-0">
            <motion.div
              animate={{
                borderColor: scenario.completed ? '#00ff41' : i === currentStep ? '#00d4ff' : '#1a2d45',
                backgroundColor: scenario.completed ? 'rgba(0,255,65,0.1)' : i === currentStep ? 'rgba(0,212,255,0.08)' : '#0d1526',
              }}
              className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !completed && i <= currentStep && setCurrentStep(i)}
            >
              {scenario.completed ? (
                <ShieldCheck size={14} className="text-[#00ff41]" />
              ) : (
                <span style={{ color: i === currentStep ? '#00d4ff' : '#4a6682' }}>{scenario.icon}</span>
              )}
              <span className="text-[7px] font-display mt-0.5 text-[#7da0c4] truncate max-w-[40px]">
                {scenario.title.split(' ')[0]}
              </span>
            </motion.div>
            {i < scenarios.length - 1 && (
              <ChevronRight size={12} className={scenario.completed ? 'text-[#00ff41]' : 'text-[#1a2d45]'} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-4">
        {/* Active Scenario */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,212,255,0.15)]">
                <span className="text-[#00d4ff]">{current.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">
                  Scenario {currentStep + 1}: {current.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#c8dce8] mb-4 leading-relaxed">{current.description}</p>

            {/* Context Matrix */}
            <div className="bg-[#0a0e17] border border-[#1a2d45] rounded-lg overflow-hidden mb-4">
              {current.context.map((row, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 px-4 py-2.5 ${
                    i < current.context.length - 1 ? 'border-b border-[#1a2d45]/50' : ''
                  } ${row.highlight ? 'bg-[rgba(255,170,0,0.05)]' : ''}`}
                >
                  <span className="text-[10px] text-[#7da0c4] font-display min-w-[90px] flex-shrink-0 pt-0.5">
                    {row.label}
                  </span>
                  <span className={`text-xs font-mono ${row.highlight ? 'text-[#ffaa00]' : 'text-[#e0f2fe]'}`}>
                    {row.value}
                  </span>
                  {row.highlight && (
                    <AlertTriangle size={12} className="text-[#ffaa00] flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>

            {/* Question */}
            <p className="text-xs text-[#7da0c4] font-display mb-3">{current.question}</p>

            {/* Options */}
            <div className="space-y-2">
              {current.options.map((opt, i) => {
                const isSelected = current.selectedIndex === i;
                const isCorrect = current.correctIndex === i && current.completed;
                const isWrong = isSelected && !current.completed && feedback === 'wrong';

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectOption(i)}
                    disabled={current.completed || feedback !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isCorrect
                        ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]'
                        : isWrong
                          ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]'
                          : 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#0a0e17]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className={`text-sm ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>
                        {opt}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)]"
                >
                  <p className="text-sm text-[#00ff41] font-display">Correct configuration!</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{current.explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)] text-center"
                >
                  <p className="text-sm text-[#ff3366] font-display">Incorrect. Review the policy and try again.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Security Posture Panel */}
        <div className="space-y-3">
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <h4 className="text-caption text-[#7da0c4] font-display mb-3 flex items-center gap-2">
              <Lock size={12} className="text-[#00d4ff]" />
              SECURITY POSTURE
            </h4>
            <div className="space-y-2">
              {scenarios.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
                    i === currentStep ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.05)]' : 'border-[#1a2d45] bg-[#0a0e17]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {s.completed ? (
                      <ShieldCheck size={14} className="text-[#00ff41]" />
                    ) : i === currentStep ? (
                      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Key size={14} className="text-[#00d4ff]" />
                      </motion.div>
                    ) : (
                      <ShieldOff size={14} className="text-[#4a6682]" />
                    )}
                    <span className={`text-xs font-display ${s.completed ? 'text-[#00ff41]' : i === currentStep ? 'text-[#e0f2fe]' : 'text-[#4a6682]'}`}>
                      {s.title}
                    </span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    s.completed
                      ? 'bg-[rgba(0,255,65,0.15)] text-[#00ff41]'
                      : i === currentStep
                        ? 'bg-[rgba(0,212,255,0.15)] text-[#00d4ff]'
                        : 'bg-[rgba(74,102,130,0.2)] text-[#4a6682]'
                  }`}>
                    {s.completed ? 'CONFIGURED' : i === currentStep ? 'IN PROGRESS' : 'PENDING'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Compliance Score */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 text-center">
            <h4 className="text-caption text-[#7da0c4] font-display mb-3">COMPLIANCE SCORE</h4>
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#1a2d45"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#00ff41"
                  strokeWidth="3"
                  strokeDasharray={`${score}, 100`}
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${score}, 100` }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-mono text-[#00ff41]">{score}%</span>
              </div>
            </div>
            <p className="text-[10px] text-[#7da0c4]">{completedCount}/{scenarios.length} controls configured</p>
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0d1526] border border-[#00ff41] rounded-xl p-4 text-center"
            >
              <ShieldCheck size={24} className="text-[#00ff41] mx-auto mb-2" />
              <p className="text-sm text-[#00ff41] font-display">All Controls Configured</p>
              <p className="text-xs text-[#7da0c4] mt-1">Organization security posture: Compliant</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
