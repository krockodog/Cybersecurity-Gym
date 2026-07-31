import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, CheckCircle, XCircle, AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const siemDashboardMetadata: PBQMetadata = {
  id: 'siem-dashboard',
  title: 'SIEM Dashboard Analysis',
  description: 'Analyze SIEM dashboard alerts, correlate security events, identify attack patterns, and prioritize incident response actions.',
  difficulty: 3,
  category: 'CySA+',
  tags: ['siem', 'alerts', 'correlation', 'monitoring', 'log-analysis'],
  xpReward: 50,
  estimatedTime: '8 min',
};

interface AlertEntry {
  time: string;
  source: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  message: string;
}

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  alerts: AlertEntry[];
  options: { id: string; label: string; detail: string }[];
  correctId: string;
  explanation: string;
}

const severityColor: Record<string, string> = {
  Critical: '#ff3366',
  High: '#ff6633',
  Medium: '#ffaa00',
  Low: '#00d4ff',
};

const SCENARIOS: Scenario[] = [
  {
    id: 'brute-force',
    title: 'Identify Brute Force Attack',
    prompt: 'Review the following SIEM alerts. What attack pattern do these events indicate?',
    alerts: [
      { time: '14:02:01', source: '203.0.113.45', severity: 'Medium', message: 'Failed SSH login for root from 203.0.113.45' },
      { time: '14:02:03', source: '203.0.113.45', severity: 'Medium', message: 'Failed SSH login for admin from 203.0.113.45' },
      { time: '14:02:04', source: '203.0.113.45', severity: 'Medium', message: 'Failed SSH login for root from 203.0.113.45' },
      { time: '14:02:06', source: '203.0.113.45', severity: 'High', message: 'Rate limit triggered: 50+ failed SSH attempts in 60s' },
      { time: '14:02:45', source: '203.0.113.45', severity: 'Critical', message: 'Successful SSH login for root from 203.0.113.45' },
    ],
    options: [
      { id: 'a', label: 'SSH Brute Force Attack (Successful)', detail: 'Multiple rapid failed logins followed by successful auth from same IP' },
      { id: 'b', label: 'Credential Stuffing', detail: 'Reused credentials from a data breach used against SSH' },
      { id: 'c', label: 'Password Spraying', detail: 'Single password tested against many accounts' },
      { id: 'd', label: 'Authorized Administrative Access', detail: 'Admin mistyped password before successful login' },
    ],
    correctId: 'a',
    explanation: 'The rapid sequence of failed logins (50+ in 60 seconds) from a single IP trying multiple usernames, followed by a successful root login, is a classic brute force attack pattern.',
  },
  {
    id: 'lateral-movement',
    title: 'Detect Lateral Movement',
    prompt: 'These alerts were triggered across multiple internal hosts. What attacker technique is being observed?',
    alerts: [
      { time: '09:15:22', source: '10.0.1.50', severity: 'High', message: 'PsExec service installed on 10.0.1.101 from 10.0.1.50' },
      { time: '09:15:30', source: '10.0.1.50', severity: 'High', message: 'Admin share \\\\10.0.1.102\\C$ accessed from 10.0.1.50' },
      { time: '09:16:01', source: '10.0.1.50', severity: 'Critical', message: 'Mimikatz signatures detected in memory on 10.0.1.101' },
      { time: '09:16:15', source: '10.0.1.50', severity: 'High', message: 'New service created on 10.0.1.103 via remote registry' },
      { time: '09:17:00', source: '10.0.1.50', severity: 'Critical', message: 'Domain Admin credentials used from non-admin workstation' },
    ],
    options: [
      { id: 'a', label: 'Lateral Movement with Credential Harvesting', detail: 'Attacker moving between hosts using stolen credentials and PsExec' },
      { id: 'b', label: 'Normal System Administration', detail: 'IT admin deploying software across workstations' },
      { id: 'c', label: 'Ransomware Encryption Phase', detail: 'Ransomware spreading across the network' },
      { id: 'd', label: 'Vulnerability Scanning', detail: 'Automated security scan of internal assets' },
    ],
    correctId: 'a',
    explanation: 'PsExec usage, admin share access, Mimikatz (credential dumping), and Domain Admin credentials from a non-admin workstation are hallmarks of lateral movement with credential harvesting.',
  },
  {
    id: 'data-exfil',
    title: 'Spot Data Exfiltration',
    prompt: 'Network flow data shows unusual patterns from a database server. What security concern do these alerts indicate?',
    alerts: [
      { time: '02:30:00', source: '10.0.5.20', severity: 'Medium', message: 'Unusual outbound DNS queries: avg 500 queries/min (baseline: 10/min)' },
      { time: '02:30:15', source: '10.0.5.20', severity: 'High', message: 'DNS TXT record queries to xyz123.suspicious-domain.com (encoded data detected)' },
      { time: '02:31:00', source: '10.0.5.20', severity: 'High', message: 'Database server 10.0.5.20 outbound traffic: 2.3 GB in 30 minutes' },
      { time: '02:32:00', source: '10.0.5.20', severity: 'Critical', message: 'DLP alert: PII patterns detected in outbound DNS payload' },
      { time: '02:32:30', source: '10.0.5.20', severity: 'Medium', message: 'Process "svchost32.exe" (unknown hash) initiating DNS queries' },
    ],
    options: [
      { id: 'a', label: 'DNS Tunneling / Data Exfiltration', detail: 'Data being exfiltrated through encoded DNS queries to external domain' },
      { id: 'b', label: 'DNS Cache Poisoning', detail: 'Attacker injecting false DNS responses' },
      { id: 'c', label: 'DDoS Attack', detail: 'Server being used in a DNS amplification attack' },
      { id: 'd', label: 'Legitimate Backup Process', detail: 'Scheduled database backup sending data offsite' },
    ],
    correctId: 'a',
    explanation: 'DNS tunneling uses encoded data in DNS queries to exfiltrate data through a protocol that often bypasses firewalls. The TXT records, encoded payloads, and unknown process confirm exfiltration.',
  },
  {
    id: 'privilege-escalation',
    title: 'Identify Privilege Escalation',
    prompt: 'A workstation is generating unusual Windows Security events. What does this sequence of events indicate?',
    alerts: [
      { time: '11:45:00', source: '10.0.3.77', severity: 'Medium', message: 'Event 4688: New process "whoami.exe" created by user jsmith' },
      { time: '11:45:05', source: '10.0.3.77', severity: 'Medium', message: 'Event 4688: New process "systeminfo.exe" created by user jsmith' },
      { time: '11:45:30', source: '10.0.3.77', severity: 'High', message: 'Event 4688: New process "powershell.exe" with encoded command by jsmith' },
      { time: '11:46:00', source: '10.0.3.77', severity: 'Critical', message: 'Event 4672: Special privileges assigned to new logon - SYSTEM on 10.0.3.77' },
      { time: '11:46:05', source: '10.0.3.77', severity: 'Critical', message: 'Event 4688: cmd.exe spawned as NT AUTHORITY\\SYSTEM by jsmith session' },
    ],
    options: [
      { id: 'a', label: 'Privilege Escalation to SYSTEM', detail: 'User performed recon then escalated from standard user to SYSTEM' },
      { id: 'b', label: 'Standard User Activity', detail: 'Normal PowerShell administrative operations' },
      { id: 'c', label: 'Scheduled Task Execution', detail: 'Automated maintenance tasks running as SYSTEM' },
      { id: 'd', label: 'Software Installation', detail: 'User installing software requiring elevated privileges' },
    ],
    correctId: 'a',
    explanation: 'The sequence shows classic privilege escalation: reconnaissance (whoami, systeminfo), execution of encoded PowerShell, then obtaining SYSTEM-level access from a standard user context.',
  },
  {
    id: 'false-positive',
    title: 'Triage False Positive',
    prompt: 'Multiple high-severity alerts fired simultaneously. Determine if this is a true attack or a false positive requiring tuning.',
    alerts: [
      { time: '03:00:00', source: '10.0.1.200', severity: 'High', message: 'Vulnerability scan detected from 10.0.1.200 targeting 10.0.1.0/24' },
      { time: '03:00:01', source: '10.0.1.200', severity: 'High', message: 'Port scan detected: 1000+ ports on 10.0.1.10-10.0.1.50' },
      { time: '03:00:15', source: '10.0.1.200', severity: 'Critical', message: 'SQL injection attempt detected from 10.0.1.200 to 10.0.1.25:443' },
      { time: '03:00:15', source: '10.0.1.200', severity: 'High', message: 'XSS payload detected in request from 10.0.1.200' },
      { time: '03:00:00', source: 'Schedule', severity: 'Low', message: 'Scheduled task: Nessus weekly scan started on 10.0.1.200' },
    ],
    options: [
      { id: 'a', label: 'Active Attack - Escalate Immediately', detail: 'Real attacker performing reconnaissance and exploitation' },
      { id: 'b', label: 'False Positive - Scheduled Vulnerability Scan', detail: 'Alerts triggered by authorized Nessus scan; whitelist the scanner IP' },
      { id: 'c', label: 'Compromised Scanner', detail: 'The Nessus scanner has been hijacked by an attacker' },
      { id: 'd', label: 'Insider Threat', detail: 'Rogue employee running unauthorized scans' },
    ],
    correctId: 'b',
    explanation: 'The scheduled Nessus scan alert correlates with all the "attack" alerts. The scanner IP should be whitelisted in SIEM rules to prevent recurring false positives during scheduled scans.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function SIEMDashboardPBQ({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const scenario = SCENARIOS[step];

  const handleSelect = useCallback((optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    const correct = optionId === scenario.correctId;
    const newResults = [...results, correct];
    setResults(newResults);
    if (correct) setStreak(s => s + 1); else setStreak(0);
    const newScore = Math.round((newResults.filter(Boolean).length / SCENARIOS.length) * 100);
    setScore(newScore);
    if (step === SCENARIOS.length - 1) { setCompleted(true); onComplete?.(newScore); }
  }, [answered, scenario, results, step, onComplete]);

  const handleNext = useCallback(() => {
    if (step < SCENARIOS.length - 1) { setStep(s => s + 1); setSelected(null); setAnswered(false); }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep(0); setScore(0); setSelected(null); setAnswered(false);
    setStreak(0); setCompleted(false); setResults([]);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[#e63946]" />
          <span className="text-sm text-[#7da0c4] font-semibold">SIEM Dashboard Analysis</span>
        </div>
        <ProgressTracker current={step + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[rgba(230,57,70,0.15)] text-[#e63946] rounded text-xs font-semibold">
                Step {step + 1}/{SCENARIOS.length}
              </span>
              <h3 className="text-sm text-[#e0f2fe] font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-[#c8dce8] mb-4">{scenario.prompt}</p>

            <div className="bg-[#050d18] border border-[#1a2d45] rounded-lg p-3 mb-4 overflow-x-auto">
              <div className="flex items-center gap-2 mb-3 text-[#4a6682] text-xs">
                <AlertTriangle size={12} />
                <span>Alert Feed</span>
              </div>
              <div className="space-y-1.5 min-w-[400px]">
                {scenario.alerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-xs font-mono"
                  >
                    <span className="text-[#4a6682] shrink-0">{alert.time}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0"
                      style={{ color: severityColor[alert.severity], backgroundColor: `${severityColor[alert.severity]}15` }}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-[#c8dce8]">{alert.message}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scenario.options.map(option => {
                const isSelected = selected === option.id;
                const isCorrect = option.id === scenario.correctId;
                let borderColor = '#1a2d45';
                let bgColor = '#111d2e';
                if (answered) {
                  if (isCorrect) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                  else if (isSelected) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }
                }
                return (
                  <motion.button
                    key={option.id}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => handleSelect(option.id)}
                    disabled={answered}
                    className="p-3 rounded-lg border text-left transition-all"
                    style={{ borderColor, backgroundColor: bgColor }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {answered && isCorrect && <CheckCircle size={14} className="text-[#00ff41]" />}
                      {answered && isSelected && !isCorrect && <XCircle size={14} className="text-[#ff3366]" />}
                      <span className="text-xs text-[#e0f2fe] font-semibold">{option.label}</span>
                    </div>
                    <p className="text-[10px] text-[#7da0c4]">{option.detail}</p>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
                <p className="text-sm text-[#c8dce8]">{scenario.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-end gap-3">
            {completed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-sm hover:border-[#e63946] transition-colors">
                <RotateCcw size={14} /> Retry
              </motion.button>
            )}
            {answered && !completed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e63946] text-white text-sm font-semibold hover:brightness-110 transition-all">
                Next <ChevronRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
