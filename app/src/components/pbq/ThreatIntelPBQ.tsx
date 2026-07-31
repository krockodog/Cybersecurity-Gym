import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, CheckCircle, XCircle, FileText, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const threatIntelMetadata: PBQMetadata = {
  id: 'threat-intel',
  title: 'Threat Intelligence Analysis',
  description: 'Analyze threat intelligence data including IOCs, STIX/TAXII feeds, threat actor attribution, and indicator correlation.',
  difficulty: 4,
  category: 'CySA+',
  tags: ['threat-intel', 'ioc', 'stix', 'taxii', 'attribution'],
  xpReward: 55,
  estimatedTime: '9 min',
};

interface IntelEntry {
  field: string;
  value: string;
  classification: string;
}

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  intel: IntelEntry[];
  options: { id: string; label: string; detail: string }[];
  correctId: string;
  explanation: string;
}

const classColors: Record<string, string> = {
  'IOC': '#ff3366',
  'TTP': '#ff6633',
  'Infrastructure': '#ffaa00',
  'Context': '#00d4ff',
  'Attribution': '#a855f7',
};

const SCENARIOS: Scenario[] = [
  {
    id: 'ioc-analysis',
    title: 'IOC Classification',
    prompt: 'Your threat feed received the following indicators. Classify the overall threat and determine the best immediate action.',
    intel: [
      { field: 'MD5 Hash', value: 'e99a18c428cb38d5f260853678922e03', classification: 'IOC' },
      { field: 'C2 Domain', value: 'update-service[.]xyz', classification: 'IOC' },
      { field: 'IP Address', value: '185.220.101.34', classification: 'Infrastructure' },
      { field: 'User-Agent', value: 'Mozilla/5.0 (compatible; MSIE 6.0)', classification: 'IOC' },
      { field: 'Malware Family', value: 'Emotet Epoch4', classification: 'Attribution' },
    ],
    options: [
      { id: 'a', label: 'Block IOCs and hunt retroactively', detail: 'Add to blocklists, then search historical logs for any prior communication with these indicators' },
      { id: 'b', label: 'Monitor only, do not block', detail: 'Add indicators to watchlist for passive observation' },
      { id: 'c', label: 'Report to law enforcement', detail: 'Submit indicators to FBI IC3 for investigation' },
      { id: 'd', label: 'Ignore - outdated indicators', detail: 'Emotet was disrupted, these IOCs are no longer relevant' },
    ],
    correctId: 'a',
    explanation: 'When actionable IOCs are received, the priority is to block them in security controls (firewall, proxy, EDR) and then retroactively hunt in logs to determine if the organization was already compromised.',
  },
  {
    id: 'stix-taxii',
    title: 'STIX/TAXII Feed Interpretation',
    prompt: 'A STIX 2.1 bundle was received via TAXII. Analyze the relationship objects to determine the threat actor\'s primary technique.',
    intel: [
      { field: 'STIX Type', value: 'threat-actor (TA0259 "Cozy Bear")', classification: 'Attribution' },
      { field: 'Relationship', value: 'threat-actor --uses--> attack-pattern', classification: 'TTP' },
      { field: 'Attack Pattern', value: 'T1566.001 - Spearphishing Attachment', classification: 'TTP' },
      { field: 'Relationship', value: 'attack-pattern --delivers--> malware', classification: 'TTP' },
      { field: 'Malware', value: 'WellMess (trojan)', classification: 'Attribution' },
    ],
    options: [
      { id: 'a', label: 'Spearphishing with trojan delivery', detail: 'APT uses spearphishing attachments to deliver WellMess trojan' },
      { id: 'b', label: 'Watering hole attack', detail: 'APT compromises trusted websites to deliver malware' },
      { id: 'c', label: 'Supply chain compromise', detail: 'APT targets software vendors to inject backdoors' },
      { id: 'd', label: 'Drive-by download', detail: 'APT uses exploit kits on compromised websites' },
    ],
    correctId: 'a',
    explanation: 'The STIX relationship chain shows: Cozy Bear uses T1566.001 (Spearphishing Attachment) which delivers WellMess malware. This maps the complete kill chain from initial access to payload.',
  },
  {
    id: 'threat-feed',
    title: 'Threat Feed Prioritization',
    prompt: 'Multiple threat feeds are reporting different indicators. Which feed should be prioritized for immediate action based on relevance and reliability?',
    intel: [
      { field: 'Feed A (OSINT)', value: 'Generic phishing URLs (TLP:WHITE) - 10,000 entries, updated daily', classification: 'Context' },
      { field: 'Feed B (ISAC)', value: 'Industry-specific IOCs targeting your sector (TLP:AMBER) - 45 entries, updated hourly', classification: 'IOC' },
      { field: 'Feed C (Vendor)', value: 'Global malware hashes (TLP:GREEN) - 50,000 entries, updated weekly', classification: 'IOC' },
      { field: 'Feed D (Internal)', value: 'Honeypot captures from your network perimeter - 12 entries, real-time', classification: 'IOC' },
      { field: 'Feed E (Social)', value: 'Twitter/X threat researcher posts (unvalidated) - variable', classification: 'Context' },
    ],
    options: [
      { id: 'a', label: 'Feed A - Highest volume of indicators', detail: 'More IOCs means better coverage' },
      { id: 'b', label: 'Feed B and D - Sector-specific and internal', detail: 'Industry ISAC feed plus internal honeypot data are most relevant' },
      { id: 'c', label: 'Feed C - Vendor-curated and comprehensive', detail: 'Commercial feeds are most reliable' },
      { id: 'd', label: 'Feed E - Most current intelligence', detail: 'Social media provides the fastest threat data' },
    ],
    correctId: 'b',
    explanation: 'Industry-specific ISAC feeds (Feed B) target threats relevant to your sector, while internal honeypot data (Feed D) captures actual attacks against your infrastructure. Relevance and context outweigh volume.',
  },
  {
    id: 'attribution',
    title: 'Threat Actor Attribution',
    prompt: 'Analyze the following evidence collected during an incident. Which threat actor group does this activity most likely belong to?',
    intel: [
      { field: 'Targeting', value: 'Energy sector, specifically SCADA/ICS systems', classification: 'Context' },
      { field: 'Initial Access', value: 'Spearphishing with macro-enabled documents in Russian', classification: 'TTP' },
      { field: 'Persistence', value: 'Custom backdoor using port 443 with certificate pinning', classification: 'TTP' },
      { field: 'Tool', value: 'CrashOverride/Industroyer framework detected', classification: 'Attribution' },
      { field: 'Working Hours', value: 'Activity window correlates with UTC+3 business hours', classification: 'Context' },
    ],
    options: [
      { id: 'a', label: 'Sandworm (APT44/Voodoo Bear)', detail: 'Russian GRU-linked group known for ICS attacks and CrashOverride malware' },
      { id: 'b', label: 'Lazarus Group (APT38)', detail: 'North Korean group focused on financial theft and destruction' },
      { id: 'c', label: 'APT41 (Double Dragon)', detail: 'Chinese group conducting espionage and cybercrime' },
      { id: 'd', label: 'FIN7 (Carbanak)', detail: 'Financially motivated group targeting retail and hospitality' },
    ],
    correctId: 'a',
    explanation: 'CrashOverride/Industroyer is attributed to Sandworm (Russian GRU Unit 74455). Combined with ICS targeting, Russian-language documents, and UTC+3 working hours, attribution points strongly to this group.',
  },
  {
    id: 'diamond-model',
    title: 'Diamond Model Analysis',
    prompt: 'Apply the Diamond Model of Intrusion Analysis to categorize the following evidence into the correct vertices.',
    intel: [
      { field: 'Evidence 1', value: 'APT29 / Cozy Bear', classification: 'Attribution' },
      { field: 'Evidence 2', value: 'Government research institution', classification: 'Context' },
      { field: 'Evidence 3', value: 'Cloud-hosted C2 on AWS infrastructure', classification: 'Infrastructure' },
      { field: 'Evidence 4', value: 'T1078 - Valid Accounts (compromised OAuth tokens)', classification: 'TTP' },
      { field: 'Evidence 5', value: 'EnvyScout HTML smuggling dropper', classification: 'TTP' },
    ],
    options: [
      { id: 'a', label: 'Adversary=APT29, Victim=Research Inst, Infra=AWS C2, Capability=OAuth+EnvyScout', detail: 'Correctly maps all four Diamond Model vertices' },
      { id: 'b', label: 'Adversary=AWS, Victim=APT29, Infra=OAuth, Capability=EnvyScout', detail: 'AWS hosts the infrastructure used by the adversary' },
      { id: 'c', label: 'Adversary=APT29, Victim=AWS, Infra=Research Inst, Capability=OAuth', detail: 'The research institution provides infrastructure' },
      { id: 'd', label: 'Adversary=EnvyScout, Victim=Research Inst, Infra=APT29, Capability=AWS', detail: 'EnvyScout is the threat actor using APT29 infrastructure' },
    ],
    correctId: 'a',
    explanation: 'The Diamond Model maps: Adversary (APT29), Victim (research institution), Infrastructure (AWS-hosted C2), and Capability (OAuth token abuse + EnvyScout dropper). These four vertices define the intrusion event.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ThreatIntelPBQ({ onComplete }: Props) {
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
          <Crosshair size={16} className="text-[#e63946]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Threat Intelligence Analysis</span>
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
                <FileText size={12} />
                <span>Intelligence Data</span>
              </div>
              <div className="space-y-2 min-w-[400px]">
                {scenario.intel.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 text-xs"
                  >
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-semibold shrink-0"
                      style={{ color: classColors[entry.classification], backgroundColor: `${classColors[entry.classification]}15` }}
                    >
                      {entry.classification}
                    </span>
                    <span className="text-[#4a6682] font-semibold shrink-0 w-24">{entry.field}</span>
                    <span className="text-[#c8dce8] font-mono">{entry.value}</span>
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
