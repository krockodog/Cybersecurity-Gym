import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, CheckCircle, XCircle, AlertTriangle, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const vulnScannerMetadata: PBQMetadata = {
  id: 'vuln-scanner',
  title: 'Vulnerability Scanner Analysis',
  description: 'Analyze vulnerability scanner output, interpret CVE data, assess severity ratings, and prioritize remediation actions.',
  difficulty: 3,
  category: 'CySA+',
  tags: ['vulnerability', 'cve', 'cvss', 'scanning', 'remediation'],
  xpReward: 50,
  estimatedTime: '8 min',
};

interface VulnEntry {
  cve: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvss: number;
  description: string;
  affected: string;
}

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  vulns: VulnEntry[];
  options: { id: string; label: string; detail: string }[];
  correctId: string;
  explanation: string;
}

const severityColors: Record<string, string> = {
  Critical: '#ff3366',
  High: '#ff6633',
  Medium: '#ffaa00',
  Low: '#00d4ff',
};

const SCENARIOS: Scenario[] = [
  {
    id: 'prioritize-patch',
    title: 'Patch Prioritization',
    prompt: 'A vulnerability scan returned the following results on a public-facing web server. Which vulnerability should be remediated first?',
    vulns: [
      { cve: 'CVE-2024-21762', severity: 'Critical', cvss: 9.8, description: 'Fortinet FortiOS RCE - pre-auth remote code execution', affected: 'FortiGate 7.4.2' },
      { cve: 'CVE-2024-1234', severity: 'High', cvss: 7.5, description: 'Apache httpd DoS via crafted HTTP/2 frames', affected: 'Apache 2.4.58' },
      { cve: 'CVE-2023-5678', severity: 'Medium', cvss: 5.3, description: 'OpenSSL information disclosure in TLS 1.3', affected: 'OpenSSL 3.1.4' },
      { cve: 'CVE-2024-0001', severity: 'Low', cvss: 3.1, description: 'SSH server banner information disclosure', affected: 'OpenSSH 9.5' },
    ],
    options: [
      { id: 'a', label: 'CVE-2024-21762 (CVSS 9.8) - FortiOS RCE', detail: 'Pre-auth RCE on network perimeter device; highest severity, actively exploited' },
      { id: 'b', label: 'CVE-2024-1234 (CVSS 7.5) - Apache DoS', detail: 'Denial of service affects availability' },
      { id: 'c', label: 'CVE-2023-5678 (CVSS 5.3) - OpenSSL', detail: 'Information disclosure could leak sensitive data' },
      { id: 'd', label: 'Patch all simultaneously', detail: 'All vulnerabilities should be fixed at the same time' },
    ],
    correctId: 'a',
    explanation: 'CVE-2024-21762 is a pre-authentication RCE (CVSS 9.8) on a perimeter device. It allows complete system compromise without credentials and is known to be actively exploited in the wild.',
  },
  {
    id: 'false-positive',
    title: 'False Positive Identification',
    prompt: 'The scanner flagged the following vulnerability, but the sysadmin claims it is a false positive. Determine which evidence supports this claim.',
    vulns: [
      { cve: 'CVE-2021-44228', severity: 'Critical', cvss: 10.0, description: 'Apache Log4j2 RCE (Log4Shell)', affected: 'Web Server 10.0.3.50' },
    ],
    options: [
      { id: 'a', label: 'Server runs Log4j 2.17.1 (patched version)', detail: 'Version check confirms the vulnerable version is no longer installed' },
      { id: 'b', label: 'Server is behind a WAF', detail: 'WAF filters JNDI lookup strings in requests' },
      { id: 'c', label: 'Server is on an internal network', detail: 'Not exposed to the internet so exploitation is unlikely' },
      { id: 'd', label: 'Java is not installed on the server', detail: 'Log4j requires Java runtime which is absent' },
    ],
    correctId: 'a',
    explanation: 'The only definitive proof of a false positive is confirming the patched version (2.17.1+) is installed. WAFs and network position are mitigating controls, not proof the vulnerability does not exist.',
  },
  {
    id: 'cvss-interpret',
    title: 'CVSS Vector Interpretation',
    prompt: 'A new CVE has the following CVSS v3.1 vector. Interpret the attack characteristics and determine the risk context.',
    vulns: [
      { cve: 'CVE-2025-9999', severity: 'Critical', cvss: 9.1, description: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N', affected: 'Custom Application' },
    ],
    options: [
      { id: 'a', label: 'Network-accessible, no auth, high C+I impact', detail: 'Remote unauthenticated attacker can read and modify data; no availability impact' },
      { id: 'b', label: 'Local attack requiring physical access', detail: 'Attacker must have physical access to the system' },
      { id: 'c', label: 'Requires user interaction to exploit', detail: 'User must click a link or open a file' },
      { id: 'd', label: 'Low impact information disclosure only', detail: 'Only affects confidentiality at a low level' },
    ],
    correctId: 'a',
    explanation: 'AV:N (network attack vector), AC:L (low complexity), PR:N (no privileges), UI:N (no user interaction), C:H/I:H (high confidentiality and integrity impact), A:N (no availability impact).',
  },
  {
    id: 'scan-scope',
    title: 'Scan Configuration Review',
    prompt: 'Review the vulnerability scan configuration. Identify the issue that would produce incomplete or unreliable results.',
    vulns: [
      { cve: 'Config-1', severity: 'Low', cvss: 0, description: 'Scan type: Unauthenticated network scan', affected: 'All hosts' },
      { cve: 'Config-2', severity: 'Low', cvss: 0, description: 'Port range: Top 100 ports only', affected: 'All hosts' },
      { cve: 'Config-3', severity: 'Low', cvss: 0, description: 'Schedule: Monthly on 1st Sunday at 02:00', affected: 'All hosts' },
      { cve: 'Config-4', severity: 'Low', cvss: 0, description: 'Scope: 10.0.0.0/8 (entire internal range)', affected: 'All hosts' },
    ],
    options: [
      { id: 'a', label: 'Monthly schedule is too infrequent', detail: 'New vulnerabilities emerge daily; monthly leaves large exposure windows' },
      { id: 'b', label: 'Unauthenticated scan misses local vulnerabilities', detail: 'Without credentials, the scanner cannot check installed software versions or configurations' },
      { id: 'c', label: 'Scan scope is too broad', detail: 'Scanning the entire /8 range wastes resources' },
      { id: 'd', label: 'Time of scan causes business disruption', detail: 'Running at 02:00 may interfere with maintenance windows' },
    ],
    correctId: 'b',
    explanation: 'Unauthenticated scans only detect network-visible vulnerabilities. Credentialed scans can inventory installed software, check patch levels, review configurations, and detect far more vulnerabilities.',
  },
  {
    id: 'remediation-plan',
    title: 'Remediation Strategy',
    prompt: 'A critical production database server has a known vulnerability (CVSS 9.8) but the vendor patch is not yet available. What is the best interim action?',
    vulns: [
      { cve: 'CVE-2025-0042', severity: 'Critical', cvss: 9.8, description: 'SQL database pre-auth RCE via crafted query', affected: 'DB Server 10.0.5.10 (Production)' },
      { cve: 'Vendor Status', severity: 'High', cvss: 0, description: 'Patch expected in 2-3 weeks; no workaround published', affected: 'Vendor Advisory #2025-007' },
    ],
    options: [
      { id: 'a', label: 'Apply compensating controls', detail: 'Restrict network access to DB port, add WAF/IPS rules, enable enhanced logging, and implement virtual patching' },
      { id: 'b', label: 'Take the database offline until patched', detail: 'Remove the server from the network entirely' },
      { id: 'c', label: 'Accept the risk and wait for the patch', detail: 'Document the risk acceptance and continue operations' },
      { id: 'd', label: 'Replace with a different database vendor', detail: 'Migrate to an alternative database platform immediately' },
    ],
    correctId: 'a',
    explanation: 'When a patch is unavailable, compensating controls reduce risk: network segmentation limits access, IPS/virtual patching blocks known exploit patterns, and enhanced logging enables rapid detection.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function VulnScannerPBQ({ onComplete }: Props) {
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
          <Scan size={16} className="text-[#e63946]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Vulnerability Scanner Analysis</span>
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
                <span>Scan Results</span>
              </div>
              <div className="space-y-2 min-w-[400px]">
                {scenario.vulns.map((vuln, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-xs border-b border-[#1a2d45] pb-2 last:border-0"
                  >
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0"
                      style={{ color: severityColors[vuln.severity], backgroundColor: `${severityColors[vuln.severity]}15` }}
                    >
                      {vuln.cvss > 0 ? `${vuln.severity} ${vuln.cvss}` : vuln.severity}
                    </span>
                    <span className="text-[#00d4ff] font-mono shrink-0 w-28">{vuln.cve}</span>
                    <div>
                      <span className="text-[#c8dce8]">{vuln.description}</span>
                      <span className="text-[#4a6682] ml-2">({vuln.affected})</span>
                    </div>
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
