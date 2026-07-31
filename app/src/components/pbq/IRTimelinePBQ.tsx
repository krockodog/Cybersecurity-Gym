import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, ArrowDown, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const irTimelineMetadata: PBQMetadata = {
  id: 'ir-timeline',
  title: 'Incident Response Timeline',
  description: 'Reconstruct incident response timelines by ordering events chronologically and identifying MITRE ATT&CK kill chain stages.',
  difficulty: 4,
  category: 'CySA+',
  tags: ['incident-response', 'timeline', 'kill-chain', 'mitre-attack', 'forensics'],
  xpReward: 55,
  estimatedTime: '9 min',
};

interface TimelineEvent {
  id: string;
  time: string;
  event: string;
  stage: string;
}

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  events: TimelineEvent[];
  options: { id: string; label: string; detail: string }[];
  correctId: string;
  explanation: string;
}

const stageColors: Record<string, string> = {
  'Reconnaissance': '#00d4ff',
  'Initial Access': '#ff9500',
  'Execution': '#ffaa00',
  'Persistence': '#ff6633',
  'Privilege Escalation': '#ff3366',
  'Lateral Movement': '#e63946',
  'Collection': '#a855f7',
  'Exfiltration': '#ff3366',
  'Impact': '#ff0033',
  'C2': '#ff6633',
  'Defense Evasion': '#ffaa00',
  'Discovery': '#00d4ff',
};

const SCENARIOS: Scenario[] = [
  {
    id: 'phishing-incident',
    title: 'Phishing to Data Breach',
    prompt: 'Reconstruct this incident timeline. Which event represents the initial compromise (Initial Access)?',
    events: [
      { id: 'e1', time: 'Day 1 09:15', event: 'User opens email attachment "Invoice_Q4.xlsm"', stage: 'Initial Access' },
      { id: 'e2', time: 'Day 1 09:16', event: 'Excel spawns PowerShell with encoded command', stage: 'Execution' },
      { id: 'e3', time: 'Day 1 09:17', event: 'Beacon established to 198.51.100.22 on port 443', stage: 'C2' },
      { id: 'e4', time: 'Day 3 14:20', event: 'Mimikatz harvests domain admin credentials', stage: 'Privilege Escalation' },
      { id: 'e5', time: 'Day 5 02:30', event: '15GB uploaded to cloud storage via HTTPS', stage: 'Exfiltration' },
    ],
    options: [
      { id: 'a', label: 'Email attachment opened (Day 1 09:15)', detail: 'Macro-enabled document executed by user action' },
      { id: 'b', label: 'PowerShell execution (Day 1 09:16)', detail: 'First malicious code execution on the host' },
      { id: 'c', label: 'C2 beacon established (Day 1 09:17)', detail: 'Attacker gains remote access capability' },
      { id: 'd', label: 'Credential harvesting (Day 3 14:20)', detail: 'Domain admin compromise enables full network access' },
    ],
    correctId: 'a',
    explanation: 'Opening the malicious attachment is the Initial Access event (MITRE T1566.001 - Spearphishing Attachment). The macro execution is the subsequent Execution phase, and the beacon is C2 establishment.',
  },
  {
    id: 'ransomware-attack',
    title: 'Ransomware Incident',
    prompt: 'A ransomware attack was detected. Which event should have been the first detection opportunity for the SOC?',
    events: [
      { id: 'e1', time: 'Day -14', event: 'RDP port 3389 exposed to internet after firewall change', stage: 'Reconnaissance' },
      { id: 'e2', time: 'Day -7', event: 'Brute force attempt on RDP from 203.0.113.0/24 (15,000 attempts)', stage: 'Initial Access' },
      { id: 'e3', time: 'Day -7', event: 'Successful RDP login with local admin account', stage: 'Initial Access' },
      { id: 'e4', time: 'Day -3', event: 'Cobalt Strike beacon deployed, lateral movement to DC', stage: 'Lateral Movement' },
      { id: 'e5', time: 'Day 0', event: 'Group Policy used to push ransomware to all domain hosts', stage: 'Impact' },
    ],
    options: [
      { id: 'a', label: 'Firewall change exposing RDP (Day -14)', detail: 'Change management should have flagged the exposure' },
      { id: 'b', label: 'Brute force attempts (Day -7)', detail: '15,000 failed logins should trigger SIEM alerts' },
      { id: 'c', label: 'Successful RDP login (Day -7)', detail: 'Successful auth after brute force is suspicious' },
      { id: 'd', label: 'Ransomware deployment (Day 0)', detail: 'File encryption was the first visible indicator' },
    ],
    correctId: 'b',
    explanation: '15,000 brute force attempts should have triggered SIEM correlation rules immediately. This was the earliest detectable malicious activity and would have prevented the entire attack chain.',
  },
  {
    id: 'supply-chain',
    title: 'Supply Chain Compromise',
    prompt: 'A supply chain attack was discovered. Identify the attack stage where the vendor software was weaponized.',
    events: [
      { id: 'e1', time: 'Month 1', event: 'Attacker compromises vendor build server via stolen SSH key', stage: 'Initial Access' },
      { id: 'e2', time: 'Month 2', event: 'Backdoor injected into software update package', stage: 'Persistence' },
      { id: 'e3', time: 'Month 3', event: '2,000+ organizations install trojanized update', stage: 'Initial Access' },
      { id: 'e4', time: 'Month 3+', event: 'Selective C2 activation for high-value targets only', stage: 'C2' },
      { id: 'e5', time: 'Month 6', event: 'Data exfiltration from 50 government agencies detected', stage: 'Exfiltration' },
    ],
    options: [
      { id: 'a', label: 'Backdoor injection into update (Month 2)', detail: 'The software supply chain was compromised at the build stage' },
      { id: 'b', label: 'Build server compromise (Month 1)', detail: 'Initial access to the vendor was the first event' },
      { id: 'c', label: 'Trojanized update installation (Month 3)', detail: 'Victims installing the update were compromised' },
      { id: 'd', label: 'Data exfiltration (Month 6)', detail: 'The actual damage occurred during exfiltration' },
    ],
    correctId: 'a',
    explanation: 'The backdoor injection (Month 2) is the weaponization point where the supply chain was actually compromised. The build server breach was initial access to the vendor, while the update installation was delivery to victims.',
  },
  {
    id: 'insider-threat',
    title: 'Insider Threat Detection',
    prompt: 'User activity logs reveal suspicious behavior from an employee who submitted their resignation. Which event is the strongest indicator of malicious intent?',
    events: [
      { id: 'e1', time: 'Week 1', event: 'Employee submits 2-week resignation notice', stage: 'Reconnaissance' },
      { id: 'e2', time: 'Week 1', event: 'Accessed files in 12 departments (baseline: 2 departments)', stage: 'Collection' },
      { id: 'e3', time: 'Week 2', event: 'Connected personal USB drive (policy violation)', stage: 'Exfiltration' },
      { id: 'e4', time: 'Week 2', event: '8.7 GB copied to USB (DLP alert triggered)', stage: 'Exfiltration' },
      { id: 'e5', time: 'Week 2', event: 'Attempted to access source code repository after access revoked', stage: 'Collection' },
    ],
    options: [
      { id: 'a', label: 'Accessing 12 departments (baseline: 2)', detail: 'Dramatic deviation from normal access pattern after resignation' },
      { id: 'b', label: '8.7 GB USB copy with DLP alert', detail: 'Large data transfer to removable media' },
      { id: 'c', label: 'USB drive connection (policy violation)', detail: 'Connecting unauthorized removable media' },
      { id: 'd', label: 'Post-revocation access attempt', detail: 'Trying to access systems after permissions removed' },
    ],
    correctId: 'a',
    explanation: 'The 6x increase in departmental access (from 2 to 12) immediately after resignation is the strongest behavioral indicator. It represents anomalous collection activity that deviates dramatically from the user baseline.',
  },
  {
    id: 'apt-dwell-time',
    title: 'APT Dwell Time Analysis',
    prompt: 'An APT was discovered during a routine threat hunt. Calculate the dwell time and identify which IR phase should be executed first.',
    events: [
      { id: 'e1', time: 'Jan 15', event: 'Threat hunt finds C2 beacon (est. active since Oct 3)', stage: 'Discovery' },
      { id: 'e2', time: 'Jan 15', event: 'Beacon communicating with known APT infrastructure', stage: 'C2' },
      { id: 'e3', time: 'Jan 15', event: '47 hosts with active implants identified', stage: 'Discovery' },
      { id: 'e4', time: 'Jan 15', event: 'Domain Admin account compromised, AD trust intact', stage: 'Privilege Escalation' },
      { id: 'e5', time: 'Jan 15', event: 'Exfiltration of 200GB to foreign IP detected in PCAP', stage: 'Exfiltration' },
    ],
    options: [
      { id: 'a', label: 'Containment: isolate compromised hosts and reset DA credentials', detail: 'Dwell time ~104 days. Immediate containment prevents further damage while preserving evidence' },
      { id: 'b', label: 'Eradication: wipe and rebuild all 47 hosts', detail: 'Remove all implants immediately to stop the APT' },
      { id: 'c', label: 'Recovery: restore from backups taken before Oct 3', detail: 'Roll back to pre-compromise state' },
      { id: 'd', label: 'Notification: alert law enforcement and affected parties', detail: 'Legal obligation to report the breach immediately' },
    ],
    correctId: 'a',
    explanation: 'With a ~104-day dwell time, immediate containment (network isolation + credential reset) is the first IR action. It stops ongoing exfiltration while preserving forensic evidence. Eradication follows after full scoping.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function IRTimelinePBQ({ onComplete }: Props) {
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
          <Clock size={16} className="text-[#e63946]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Incident Response Timeline</span>
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
                <Clock size={12} />
                <span>Event Timeline</span>
              </div>
              <div className="relative pl-6 min-w-[400px]">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#1a2d45]" />
                {scenario.events.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    className="relative mb-3 last:mb-0"
                  >
                    <div className="absolute -left-[18px] top-1.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{ borderColor: stageColors[event.stage] || '#7da0c4', backgroundColor: '#0d1526' }} />
                    <div className="flex items-start gap-3 text-xs">
                      <span className="text-[#4a6682] font-mono shrink-0 w-20">{event.time}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0"
                        style={{ color: stageColors[event.stage] || '#7da0c4', backgroundColor: `${stageColors[event.stage] || '#7da0c4'}15` }}
                      >
                        {event.stage}
                      </span>
                      <span className="text-[#c8dce8]">{event.event}</span>
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
