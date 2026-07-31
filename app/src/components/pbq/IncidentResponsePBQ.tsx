import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Siren, Search, Box, Trash2, RefreshCcw, BookOpen, ChevronRight, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const incidentMetadata: PBQMetadata = {
  id: 'incident-response',
  title: 'Incident Response Simulation',
  description: 'Respond to a live security incident following the NIST IR lifecycle. Make the right call at each phase to contain and remediate the threat.',
  difficulty: 4,
  category: 'Security+',
  tags: ['incident-response', 'nist', 'ir-lifecycle'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface IRStep {
  id: string; phase: string; icon: React.ReactNode; situation: string; alert: string;
  options: string[]; correctIndex: number; explanation: string;
  selectedIndex: number | null; completed: boolean;
}

const INITIAL_STEPS: IRStep[] = [
  { id: 'preparation', phase: 'Preparation', icon: <BookOpen size={18} />,
    situation: 'Your organization has no formal IR plan. The CISO asks you to prioritize one preparation activity.',
    alert: 'PRE-INCIDENT: Audit reveals no IR plan, no documented SOC procedures.',
    options: ['Install additional firewalls on all segments', 'Develop an IR plan with communication procedures and runbooks', 'Hire more security analysts immediately', 'Begin monitoring dark web for threat intelligence'],
    correctIndex: 1, explanation: 'NIST SP 800-61 emphasizes a documented IR plan with policies, procedures, and communication plans as the foundation of preparation.',
    selectedIndex: null, completed: false },
  { id: 'detection', phase: 'Detection & Analysis', icon: <Search size={18} />,
    situation: 'The SIEM alerts on anomalous activity: multiple failed logins from an internal IP followed by a successful domain admin login at 3 AM.',
    alert: 'ALERT: Brute-force on DC01. Source: 10.0.1.47. 847 failures then success at 03:14 UTC.',
    options: ['Immediately disable the account and shut down DC01', 'Correlate logs, verify legitimacy, and classify incident severity', 'Email the security team to investigate in the morning', 'Block the IP at the firewall and close the ticket'],
    correctIndex: 1, explanation: 'Detection requires correlating alerts across sources, verifying the incident is real, and classifying severity before containment.',
    selectedIndex: null, completed: false },
  { id: 'containment', phase: 'Containment', icon: <Box size={18} />,
    situation: 'Confirmed: compromised workstation 10.0.1.47 is exfiltrating data to an external C2 server. The attacker has domain admin credentials.',
    alert: 'CONFIRMED: Exfiltration to 185.220.101.33:443. Lateral movement to FILE-SRV01 and DB-SRV02.',
    options: ['Wipe all compromised systems immediately', 'Isolate systems, capture forensic images, reset compromised credentials', 'Shut down the entire corporate network', 'Contact the attacker to negotiate'],
    correctIndex: 1, explanation: 'Containment means isolating systems while preserving evidence via forensic images before any remediation begins.',
    selectedIndex: null, completed: false },
  { id: 'eradication', phase: 'Eradication', icon: <Trash2 size={18} />,
    situation: 'Forensics reveals a rootkit on the workstation and a backdoor service on the domain controller with registry persistence keys.',
    alert: 'FORENSICS: Rootkit on WKS-047. Backdoor "WinUpdate_Svc" on DC01. Registry persistence found.',
    options: ['Run antivirus scans and remove detected threats', 'Rebuild from clean images, remove all persistence, patch the exploited vulnerability', 'Delete suspicious files and registry keys manually', 'Restore all systems from the most recent backup'],
    correctIndex: 1, explanation: 'Rootkits cannot be reliably cleaned. Rebuild from known-good images, remove persistence mechanisms, and patch the entry vector.',
    selectedIndex: null, completed: false },
  { id: 'recovery', phase: 'Recovery', icon: <RefreshCcw size={18} />,
    situation: 'Systems rebuilt, accounts reset, vulnerability patched. Backup integrity verified. Time to bring systems back online.',
    alert: 'STATUS: 4 systems rebuilt, 12 accounts reset, vulnerability patched. Ready for recovery.',
    options: ['Bring all systems online simultaneously', 'Restore in phases with enhanced monitoring, validate each before proceeding', 'Keep all systems offline for 30 days', 'Restore only the DC and let users rebuild their workstations'],
    correctIndex: 1, explanation: 'Phased recovery with validation and enhanced monitoring detects any remaining compromise before expanding access.',
    selectedIndex: null, completed: false },
  { id: 'lessons', phase: 'Lessons Learned', icon: <BookOpen size={18} />,
    situation: 'Incident resolved after 72 hours. 4 systems affected, 15 accounts, ~2GB accessed. Management wants to prevent recurrence.',
    alert: 'RESOLVED: Incident closed. Total: 4 systems, 15 accounts, ~2GB data accessed. No confirmed loss.',
    options: ['Close the ticket and move to the next priority', 'Blame the compromised user and require their retraining', 'Conduct post-incident review, document findings, update IR plan, implement preventive controls', 'Purchase new security tools to prevent similar attacks'],
    correctIndex: 2, explanation: 'Lessons Learned requires a formal review, documentation of findings, IR plan updates, and implementing controls to prevent recurrence.',
    selectedIndex: null, completed: false },
];

const PHASE_COLORS = ['#00d4ff', '#ffaa00', '#ff3366', '#a855f7', '#00ff41', '#06d6a0'];
interface Props { onComplete?: (score: number) => void; }

export default function IncidentResponsePBQ({ onComplete }: Props) {
  const [steps, setSteps] = useState<IRStep[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const threatLevels = ['elevated', 'high', 'critical', 'critical', 'contained', 'contained'] as const;
  const threatColors = { low: '#00ff41', elevated: '#ffaa00', high: '#ff8c00', critical: '#ff3366', contained: '#00ff41' };
  const threatLevel = currentStep === 0 && !steps[0].completed ? 'low' as const : threatLevels[Math.min(currentStep, threatLevels.length - 1)];

  const selectOption = useCallback((optionIndex: number) => {
    if (completed || steps[currentStep].completed || feedback !== null) return;
    const isCorrect = optionIndex === steps[currentStep].correctIndex;
    setSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, selectedIndex: optionIndex, completed: isCorrect } : s));
    if (isCorrect) {
      setFeedback('correct');
      const ns = Math.round(((currentStep + 1) / steps.length) * 100);
      setScore(ns);
      if (currentStep === steps.length - 1) { setCompleted(true); onComplete?.(ns); }
      else { setTimeout(() => { setCurrentStep(p => p + 1); setFeedback(null); }, 1600); }
    } else {
      setFeedback('wrong');
      setTimeout(() => { setSteps(prev => prev.map((s, i) => i === currentStep ? { ...s, selectedIndex: null } : s)); setFeedback(null); }, 1500);
    }
  }, [steps, currentStep, completed, feedback, onComplete]);

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Siren size={16} className="text-[#ff3366]" />
          <span className="text-caption text-[#7da0c4] font-display">NIST IR Lifecycle Simulation</span>
        </div>
        <ProgressTracker current={completedCount} total={steps.length} score={score} />
      </div>

      {/* Threat Level */}
      <motion.div animate={{ borderColor: threatColors[threatLevel], boxShadow: `0 0 15px ${threatColors[threatLevel]}30` }} className="mb-4 px-4 py-2 rounded-lg border bg-[#0d1526] flex items-center justify-center gap-3">
        {threatLevel === 'contained' ? <ShieldCheck size={16} style={{ color: threatColors[threatLevel] }} /> : <ShieldAlert size={16} style={{ color: threatColors[threatLevel] }} />}
        <span className="text-xs font-display" style={{ color: threatColors[threatLevel] }}>THREAT LEVEL: {threatLevel.toUpperCase()}</span>
      </motion.div>

      {/* Phase Timeline */}
      <div className="flex items-center justify-center gap-1 mb-5 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            <motion.div animate={{ borderColor: step.completed ? '#00ff41' : i === currentStep ? PHASE_COLORS[i] : '#1a2d45', backgroundColor: step.completed ? 'rgba(0,255,65,0.1)' : i === currentStep ? `${PHASE_COLORS[i]}12` : '#0d1526' }} className="w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer" onClick={() => !completed && i <= currentStep && setCurrentStep(i)}>
              <span style={{ color: step.completed ? '#00ff41' : i === currentStep ? PHASE_COLORS[i] : '#4a6682' }}>{step.completed ? <ShieldCheck size={14} /> : step.icon}</span>
              <span className="text-[7px] font-display mt-0.5 text-[#7da0c4] max-w-[48px] truncate text-center">{step.phase.split(' ')[0]}</span>
            </motion.div>
            {i < steps.length - 1 && <ChevronRight size={12} className={step.completed ? 'text-[#00ff41]' : 'text-[#1a2d45]'} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-4">
        {/* Active Phase */}
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${PHASE_COLORS[currentStep]}20` }}>
                <span style={{ color: PHASE_COLORS[currentStep] }}>{steps[currentStep].icon}</span>
              </div>
              <h3 className="text-sm font-display text-[#e0f2fe]">Phase {currentStep + 1}: {steps[currentStep].phase}</h3>
            </div>
            <p className="text-xs text-[#c8dce8] mb-3 leading-relaxed">{steps[currentStep].situation}</p>
            <div className="bg-[#0a0e17] border border-[#1a2d45] rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#ffaa00] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#ffaa00] font-mono leading-relaxed">{steps[currentStep].alert}</p>
            </div>
            <div className="space-y-2">
              {steps[currentStep].options.map((opt, i) => {
                const step = steps[currentStep];
                const isSel = step.selectedIndex === i;
                const isOk = step.correctIndex === i && step.completed;
                const isBad = isSel && !step.completed && feedback === 'wrong';
                return (
                  <motion.button key={i} whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.99 }} onClick={() => selectOption(i)} disabled={step.completed || feedback !== null} className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${isOk ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]' : isBad ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]' : 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#0a0e17]'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${isOk ? 'text-[#00ff41]' : isBad ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>{String.fromCharCode(65 + i)}.</span>
                      <span className={`text-sm ${isOk ? 'text-[#00ff41]' : isBad ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>{opt}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {feedback === 'correct' && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)]"><p className="text-sm text-[#00ff41] font-display">Correct response!</p><p className="text-xs text-[#7da0c4] mt-1">{steps[currentStep].explanation}</p></motion.div>}
              {feedback === 'wrong' && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)] text-center"><p className="text-sm text-[#ff3366] font-display">Not the best response. Try again.</p></motion.div>}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* IR Timeline Panel */}
        <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
          <h4 className="text-caption text-[#7da0c4] font-display mb-4 flex items-center gap-2"><Siren size={12} className="text-[#ff3366]" />INCIDENT TIMELINE</h4>
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[#1a2d45]" />
            {steps.map((step, i) => (
              <motion.div key={step.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 ml-6 mb-4 relative">
                <motion.div animate={{ backgroundColor: step.completed ? '#00ff41' : i === currentStep ? PHASE_COLORS[i] : '#1a2d45', boxShadow: step.completed ? '0 0 8px rgba(0,255,65,0.4)' : i === currentStep ? `0 0 8px ${PHASE_COLORS[i]}40` : 'none' }} className="absolute -left-[27px] w-3 h-3 rounded-full" />
                <div className="flex-1">
                  <p className={`text-xs font-display ${step.completed ? 'text-[#00ff41]' : i === currentStep ? 'text-[#e0f2fe]' : 'text-[#4a6682]'}`}>{step.phase}</p>
                  {step.completed && <p className="text-[10px] text-[#7da0c4] mt-0.5">{step.options[step.correctIndex].substring(0, 50)}...</p>}
                  {i === currentStep && !step.completed && <motion.p animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-[10px] text-[#ffaa00] mt-0.5">Awaiting response...</motion.p>}
                </div>
              </motion.div>
            ))}
          </div>
          {completed && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)] text-center">
              <ShieldCheck size={20} className="text-[#00ff41] mx-auto mb-1" />
              <p className="text-sm text-[#00ff41] font-display">Incident Resolved</p>
              <p className="text-xs text-[#7da0c4] mt-1">All 6 NIST IR phases completed - Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
