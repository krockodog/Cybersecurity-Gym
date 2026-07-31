import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BarChart3, Search, Activity, FileText, ChevronRight, CheckCircle, XCircle, Shield, Eye } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const cloudMonitorMetadata: PBQMetadata = {
  id: 'cloud-monitor',
  title: 'Cloud Monitoring',
  description: 'Configure cloud monitoring including alerts, log aggregation, dashboards, anomaly detection, and audit trails.',
  difficulty: 3,
  category: 'Cloud+',
  tags: ['monitoring', 'alerting', 'logging', 'anomaly-detection'],
  xpReward: 50,
  estimatedTime: '10 min',
};

interface MonitorScenario {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  options: string[];
  correctIndex: number;
  explanation: string;
  metric: { label: string; value: string; status: 'normal' | 'warning' | 'critical' };
}

const SCENARIOS: MonitorScenario[] = [
  {
    id: 'alerts',
    title: 'Configure Alerts',
    description: 'Set up alerting for a production web application. CPU has spiked to 95% three times this week, causing outages. How should alerts be configured?',
    icon: <Bell size={18} />,
    options: [
      'Set a single alert for CPU > 90% with email notification',
      'Multi-tier alerting: Warning at 70% (Slack), Critical at 85% (PagerDuty), Emergency at 95% (auto-scale + PagerDuty), with 5-min evaluation period and anomaly-based baselines',
      'Check CloudWatch console manually each morning',
      'Alert only when the application crashes',
    ],
    correctIndex: 1,
    explanation: 'Multi-tier alerting with escalation, auto-remediation, and anomaly baselines provides proactive incident management with appropriate response levels.',
    metric: { label: 'CPU Utilization', value: '95%', status: 'critical' },
  },
  {
    id: 'logs',
    title: 'Log Aggregation',
    description: 'The environment spans 3 AWS accounts with 200+ services. Logs are scattered across CloudWatch, S3, and individual instances. Design the log aggregation strategy.',
    icon: <FileText size={18} />,
    options: [
      'SSH into each instance to read logs when needed',
      'Store all logs in a single S3 bucket per account',
      'Centralized logging: CloudWatch Logs with cross-account subscription filters -> Kinesis Data Firehose -> OpenSearch/S3, with structured JSON logging, retention policies, and log-based metrics',
      'Use CloudTrail only for all logging needs',
    ],
    correctIndex: 2,
    explanation: 'Centralized cross-account logging with streaming pipeline, structured format, and retention provides searchable, scalable log infrastructure.',
    metric: { label: 'Log Ingestion', value: '2.3 TB/day', status: 'normal' },
  },
  {
    id: 'dashboard',
    title: 'Create Dashboards',
    description: 'Create an operations dashboard for the SRE team. Which dashboard design best supports incident response?',
    icon: <BarChart3 size={18} />,
    options: [
      'Single page with all metrics in a long scrollable list',
      'Layered dashboards: Executive (SLO/SLA status), Operational (golden signals: latency, traffic, errors, saturation), Service-specific (per-microservice metrics), with drill-down and time correlation',
      'CPU and memory charts for each EC2 instance',
      'A spreadsheet exported from CloudWatch weekly',
    ],
    correctIndex: 1,
    explanation: 'Layered dashboards following the golden signals methodology with drill-down capability support both high-level oversight and deep troubleshooting.',
    metric: { label: 'Error Rate', value: '0.3%', status: 'normal' },
  },
  {
    id: 'anomaly',
    title: 'Anomaly Detection',
    description: 'Implement anomaly detection to identify unusual patterns. API call volumes normally follow a predictable daily pattern. Which approach is most effective?',
    icon: <Activity size={18} />,
    options: [
      'Set static thresholds based on maximum observed values',
      'Use CloudWatch Anomaly Detection with ML-based baselines, correlate with GuardDuty findings, implement custom anomaly rules for auth failures and geo-location changes, alert on deviation bands',
      'Have an engineer watch the dashboard during business hours',
      'Review monthly usage reports for anomalies',
    ],
    correctIndex: 1,
    explanation: 'ML-based anomaly detection adapts to patterns, while correlation with GuardDuty and custom rules catches both infrastructure and security anomalies.',
    metric: { label: 'API Anomaly Score', value: '87/100', status: 'warning' },
  },
  {
    id: 'audit-trail',
    title: 'Audit Trails',
    description: 'Configure audit trails for SOC 2 compliance. All management actions must be tracked and tamper-proof. Which configuration meets requirements?',
    icon: <Search size={18} />,
    options: [
      'Enable CloudTrail in the primary region only',
      'Rely on service-specific logs for audit purposes',
      'Multi-region CloudTrail with organization trail, S3 bucket with Object Lock (WORM), log file validation enabled, integration with SIEM, 7-year retention, and cross-account centralized audit account',
      'Enable VPC Flow Logs only',
    ],
    correctIndex: 2,
    explanation: 'Organization-wide CloudTrail with immutable storage, validation, SIEM integration, and long retention meets SOC 2 audit trail requirements.',
    metric: { label: 'Audit Coverage', value: '100%', status: 'normal' },
  },
];

const STEP_COLORS = ['#ff3366', '#00d4ff', '#ffaa00', '#a855f7', '#00ff41'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function CloudMonitorPBQ({ onComplete }: Props) {
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
          <Eye size={16} className="text-[#00b4d8]" />
          <span className="text-caption text-[#7da0c4] font-display">Cloud Monitoring</span>
        </div>
        <ProgressTracker current={answers.filter(a => a !== null).length} total={SCENARIOS.length} score={score} />
      </div>

      {/* Step flow */}
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

        {/* Monitoring dashboard */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45] flex items-center gap-2">
            <BarChart3 size={12} className="text-[#00b4d8]" />
            <span className="text-caption text-[#7da0c4] font-display">Monitoring Dashboard</span>
          </div>
          <div className="p-4">
            {/* Current metric */}
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`p-3 rounded-lg border mb-3 ${
                  scenario.metric.status === 'critical' ? 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]' :
                  scenario.metric.status === 'warning' ? 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)]' :
                  'border-[#00ff41] bg-[rgba(0,255,65,0.05)]'
                }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#7da0c4] font-display">{scenario.metric.label}</span>
                  <motion.div animate={scenario.metric.status === 'critical' ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full ${
                      scenario.metric.status === 'critical' ? 'bg-[#ff3366]' : scenario.metric.status === 'warning' ? 'bg-[#ffaa00]' : 'bg-[#00ff41]'
                    }`} />
                </div>
                <p className="text-lg font-mono font-bold" style={{
                  color: scenario.metric.status === 'critical' ? '#ff3366' : scenario.metric.status === 'warning' ? '#ffaa00' : '#00ff41',
                }}>{scenario.metric.value}</p>
              </motion.div>
            </AnimatePresence>

            {/* Simulated chart bars */}
            <div className="mb-4">
              <span className="text-[9px] text-[#4a6682] font-display">ACTIVITY (24h)</span>
              <div className="flex items-end gap-1 mt-1 h-16">
                {Array.from({ length: 24 }, (_, i) => {
                  const height = 20 + Math.sin(i * 0.5) * 30 + (i === 14 ? 40 : 0);
                  return (
                    <motion.div key={i} className="flex-1 rounded-t" style={{
                        backgroundColor: height > 70 ? '#ff3366' : height > 50 ? '#ffaa00' : '#00d4ff',
                        opacity: 0.6,
                      }}
                      initial={{ height: 0 }} animate={{ height: `${Math.min(height, 100)}%` }}
                      transition={{ delay: i * 0.03, duration: 0.3 }} />
                  );
                })}
              </div>
            </div>

            <h4 className="text-caption text-[#7da0c4] font-display mb-2">MONITORING STATUS</h4>
            <div className="space-y-1">
              {SCENARIOS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2 py-1">
                  <div className={`w-2 h-2 rounded-full ${
                    answers[i] === null ? 'bg-[#1a2d45]' : answers[i] === s.correctIndex ? 'bg-[#00ff41]' : 'bg-[#ff3366]'
                  }`} />
                  <span className="text-[10px] text-[#7da0c4]">{s.title}</span>
                  {answers[i] !== null && (
                    <span className={`text-[8px] ml-auto ${answers[i] === s.correctIndex ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                      {answers[i] === s.correctIndex ? 'ACTIVE' : 'MISCONFIGURED'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {completed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-4 p-3 border border-[#00b4d8] rounded-lg bg-[rgba(0,180,216,0.1)] text-center">
                <Shield size={20} className="text-[#00b4d8] mx-auto mb-1" />
                <p className="text-sm text-[#00b4d8] font-display">Monitoring Complete</p>
                <p className="text-xs text-[#7da0c4]">Score: {score}%</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
