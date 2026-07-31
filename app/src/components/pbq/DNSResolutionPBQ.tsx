import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, ArrowRight, CheckCircle, XCircle, ChevronRight, Database } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const dnsResolutionMetadata: PBQMetadata = {
  id: 'dns-resolution',
  title: 'DNS Resolution Tracer',
  description: 'Trace DNS queries from client through recursive resolver, root servers, TLD servers, and authoritative nameservers.',
  difficulty: 3,
  category: 'Network+',
  tags: ['dns', 'resolution', 'nameservers', 'records'],
  xpReward: 50,
  estimatedTime: '10 min',
};

interface DnsHop {
  from: string;
  to: string;
  message: string;
}

interface DnsQuery {
  id: number;
  domain: string;
  recordType: string;
  finalAnswer: string;
  hops: DnsHop[];
  hopOptions: string[][];
}

const QUERIES: DnsQuery[] = [
  {
    id: 1, domain: 'www.example.com', recordType: 'A', finalAnswer: '93.184.216.34',
    hops: [
      { from: 'Client', to: 'Recursive Resolver', message: 'Query: A record for www.example.com' },
      { from: 'Recursive Resolver', to: 'Root Server', message: 'Where is .com?' },
      { from: 'Root Server', to: 'Recursive Resolver', message: 'Referral: .com TLD at a.gtld-servers.net' },
      { from: 'Recursive Resolver', to: '.com TLD Server', message: 'Where is example.com?' },
      { from: '.com TLD Server', to: 'Recursive Resolver', message: 'Referral: example.com NS at ns1.example.com' },
      { from: 'Recursive Resolver', to: 'Authoritative NS', message: 'A record for www.example.com?' },
      { from: 'Authoritative NS', to: 'Recursive Resolver', message: 'Answer: 93.184.216.34' },
      { from: 'Recursive Resolver', to: 'Client', message: 'Response: 93.184.216.34 (cached TTL 3600)' },
    ],
    hopOptions: [
      ['Root Server', 'Authoritative NS', 'Recursive Resolver', 'Client'],
      ['Root Server', '.com TLD Server', 'Authoritative NS', 'Client'],
      ['.com TLD Server', 'Recursive Resolver', 'Root Server', 'Client'],
      ['Root Server', '.com TLD Server', 'Authoritative NS', 'Client'],
      ['Recursive Resolver', 'Client', '.com TLD Server', 'Root Server'],
      ['Root Server', '.com TLD Server', 'Authoritative NS', 'Client'],
      ['Client', 'Root Server', 'Recursive Resolver', '.com TLD Server'],
      ['Authoritative NS', 'Root Server', 'Client', '.com TLD Server'],
    ],
  },
  {
    id: 2, domain: 'mail.corp.org', recordType: 'MX', finalAnswer: 'smtp.corp.org (priority 10)',
    hops: [
      { from: 'Client', to: 'Recursive Resolver', message: 'Query: MX record for mail.corp.org' },
      { from: 'Recursive Resolver', to: 'Root Server', message: 'Where is .org?' },
      { from: 'Root Server', to: 'Recursive Resolver', message: 'Referral: .org TLD at a0.org.afilias-nst.info' },
      { from: 'Recursive Resolver', to: '.org TLD Server', message: 'Where is corp.org?' },
      { from: '.org TLD Server', to: 'Recursive Resolver', message: 'Referral: corp.org NS at dns1.corp.org' },
      { from: 'Recursive Resolver', to: 'Authoritative NS', message: 'MX record for mail.corp.org?' },
      { from: 'Authoritative NS', to: 'Recursive Resolver', message: 'Answer: smtp.corp.org priority 10' },
      { from: 'Recursive Resolver', to: 'Client', message: 'Response: smtp.corp.org (priority 10)' },
    ],
    hopOptions: [
      ['Root Server', '.org TLD Server', 'Recursive Resolver', 'Authoritative NS'],
      ['.org TLD Server', 'Root Server', 'Authoritative NS', 'Client'],
      ['Recursive Resolver', '.org TLD Server', 'Client', 'Root Server'],
      ['Root Server', 'Authoritative NS', '.org TLD Server', 'Client'],
      ['Client', 'Recursive Resolver', '.org TLD Server', 'Authoritative NS'],
      ['Authoritative NS', 'Client', 'Root Server', 'Recursive Resolver'],
      ['Client', 'Root Server', 'Recursive Resolver', '.org TLD Server'],
      ['.org TLD Server', 'Root Server', 'Client', 'Authoritative NS'],
    ],
  },
  {
    id: 3, domain: 'api.secure.net', recordType: 'AAAA', finalAnswer: '2001:db8::1',
    hops: [
      { from: 'Client', to: 'Recursive Resolver', message: 'Query: AAAA record for api.secure.net' },
      { from: 'Recursive Resolver', to: 'Root Server', message: 'Where is .net?' },
      { from: 'Root Server', to: 'Recursive Resolver', message: 'Referral: .net TLD at a.gtld-servers.net' },
      { from: 'Recursive Resolver', to: '.net TLD Server', message: 'Where is secure.net?' },
      { from: '.net TLD Server', to: 'Recursive Resolver', message: 'Referral: secure.net NS at ns.secure.net' },
      { from: 'Recursive Resolver', to: 'Authoritative NS', message: 'AAAA record for api.secure.net?' },
      { from: 'Authoritative NS', to: 'Recursive Resolver', message: 'Answer: 2001:db8::1' },
      { from: 'Recursive Resolver', to: 'Client', message: 'Response: 2001:db8::1' },
    ],
    hopOptions: [
      ['Recursive Resolver', 'Root Server', '.net TLD Server', 'Authoritative NS'],
      ['Root Server', '.net TLD Server', 'Authoritative NS', 'Client'],
      ['Client', 'Recursive Resolver', 'Root Server', '.net TLD Server'],
      ['.net TLD Server', 'Root Server', 'Recursive Resolver', 'Authoritative NS'],
      ['Recursive Resolver', 'Root Server', 'Authoritative NS', '.net TLD Server'],
      ['Root Server', 'Authoritative NS', '.net TLD Server', 'Recursive Resolver'],
      ['Client', 'Root Server', '.net TLD Server', 'Recursive Resolver'],
      ['.net TLD Server', 'Authoritative NS', 'Client', 'Root Server'],
    ],
  },
  {
    id: 4, domain: 'vpn.company.io', recordType: 'A', finalAnswer: '10.50.1.1',
    hops: [
      { from: 'Client', to: 'Recursive Resolver', message: 'Query: A record for vpn.company.io' },
      { from: 'Recursive Resolver', to: 'Root Server', message: 'Where is .io?' },
      { from: 'Root Server', to: 'Recursive Resolver', message: 'Referral: .io TLD at ns-a1.io' },
      { from: 'Recursive Resolver', to: '.io TLD Server', message: 'Where is company.io?' },
      { from: '.io TLD Server', to: 'Recursive Resolver', message: 'Referral: company.io NS at ns1.company.io' },
      { from: 'Recursive Resolver', to: 'Authoritative NS', message: 'A record for vpn.company.io?' },
      { from: 'Authoritative NS', to: 'Recursive Resolver', message: 'Answer: 10.50.1.1' },
      { from: 'Recursive Resolver', to: 'Client', message: 'Response: 10.50.1.1' },
    ],
    hopOptions: [
      ['Recursive Resolver', 'Root Server', '.io TLD Server', 'Authoritative NS'],
      ['Root Server', 'Authoritative NS', '.io TLD Server', 'Recursive Resolver'],
      ['Client', 'Recursive Resolver', '.io TLD Server', 'Root Server'],
      ['Root Server', '.io TLD Server', 'Client', 'Recursive Resolver'],
      ['Recursive Resolver', 'Authoritative NS', 'Client', '.io TLD Server'],
      ['Root Server', '.io TLD Server', 'Recursive Resolver', 'Authoritative NS'],
      ['Client', 'Recursive Resolver', 'Root Server', 'Authoritative NS'],
      ['Root Server', '.io TLD Server', 'Authoritative NS', 'Client'],
    ],
  },
  {
    id: 5, domain: 'cdn.assets.edu', recordType: 'CNAME', finalAnswer: 'cdn.cloudprovider.com -> 198.51.100.10',
    hops: [
      { from: 'Client', to: 'Recursive Resolver', message: 'Query: CNAME for cdn.assets.edu' },
      { from: 'Recursive Resolver', to: 'Root Server', message: 'Where is .edu?' },
      { from: 'Root Server', to: 'Recursive Resolver', message: 'Referral: .edu TLD at a.edu-servers.net' },
      { from: 'Recursive Resolver', to: '.edu TLD Server', message: 'Where is assets.edu?' },
      { from: '.edu TLD Server', to: 'Recursive Resolver', message: 'Referral: assets.edu NS at ns.assets.edu' },
      { from: 'Recursive Resolver', to: 'Authoritative NS', message: 'CNAME for cdn.assets.edu?' },
      { from: 'Authoritative NS', to: 'Recursive Resolver', message: 'CNAME: cdn.cloudprovider.com -> A: 198.51.100.10' },
      { from: 'Recursive Resolver', to: 'Client', message: 'Response: cdn.cloudprovider.com (198.51.100.10)' },
    ],
    hopOptions: [
      ['Recursive Resolver', 'Root Server', '.edu TLD Server', 'Authoritative NS'],
      ['Root Server', '.edu TLD Server', 'Authoritative NS', 'Client'],
      ['Recursive Resolver', 'Client', 'Root Server', '.edu TLD Server'],
      ['Root Server', '.edu TLD Server', 'Authoritative NS', 'Recursive Resolver'],
      ['Client', 'Root Server', 'Recursive Resolver', '.edu TLD Server'],
      ['Authoritative NS', '.edu TLD Server', 'Root Server', 'Recursive Resolver'],
      ['Client', 'Root Server', 'Recursive Resolver', 'Authoritative NS'],
      ['Root Server', 'Authoritative NS', 'Client', '.edu TLD Server'],
    ],
  },
];

const SERVER_COLORS: Record<string, string> = {
  Client: '#00d4ff',
  'Recursive Resolver': '#ffaa00',
  'Root Server': '#ff3366',
  '.com TLD Server': '#a855f7',
  '.org TLD Server': '#a855f7',
  '.net TLD Server': '#a855f7',
  '.io TLD Server': '#a855f7',
  '.edu TLD Server': '#a855f7',
  'Authoritative NS': '#00ff41',
};

interface Props {
  onComplete?: (score: number) => void;
}

export default function DNSResolutionPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentHop, setCurrentHop] = useState(0);
  const [hopSelections, setHopSelections] = useState<Record<string, string>>({});
  const [hopResults, setHopResults] = useState<Record<string, boolean>>({});
  const [stepScores, setStepScores] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const query = QUERIES[currentStep];
  const isLastStep = currentStep === QUERIES.length - 1;
  const hop = query.hops[currentHop];
  const hopKey = `${currentStep}-${currentHop}`;
  const isHopAnswered = hopResults[hopKey] !== undefined;
  const allHopsDone = currentHop >= query.hops.length - 1 && isHopAnswered;

  const getColor = (name: string): string => {
    for (const [key, color] of Object.entries(SERVER_COLORS)) {
      if (name.includes(key) || name === key) return color;
    }
    return '#7da0c4';
  };

  const selectHopTarget = useCallback((target: string) => {
    if (isHopAnswered) return;
    setHopSelections(prev => ({ ...prev, [hopKey]: target }));

    const isCorrect = target === hop.to;
    setHopResults(prev => ({ ...prev, [hopKey]: isCorrect }));

    if (isCorrect && currentHop < query.hops.length - 1) {
      setTimeout(() => setCurrentHop(prev => prev + 1), 800);
    }
  }, [hop, hopKey, isHopAnswered, currentHop, query.hops.length]);

  const finishQuery = useCallback(() => {
    let correct = 0;
    for (let i = 0; i < query.hops.length; i++) {
      if (hopResults[`${currentStep}-${i}`]) correct++;
    }
    const stepScore = Math.round((correct / query.hops.length) * 100);
    setStepScores(prev => [...prev, stepScore]);
    setStreak(stepScore === 100 ? streak + 1 : 0);

    if (isLastStep) {
      const allScores = [...stepScores, stepScore];
      const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      setScore(finalScore);
      onComplete?.(finalScore);
    } else {
      setCurrentStep(prev => prev + 1);
      setCurrentHop(0);
    }
  }, [query, currentStep, hopResults, isLastStep, stepScores, streak, onComplete]);

  const totalScore = stepScores.length > 0
    ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length)
    : 0;
  const isComplete = isLastStep && allHopsDone;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">DNS Resolution Tracer</span>
        </div>
        <ProgressTracker current={currentStep + (allHopsDone ? 1 : 0)} total={QUERIES.length} score={totalScore} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {/* Query Info */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#00d4ff] font-display">QUERY {query.id}/{QUERIES.length}</span>
                <p className="text-sm text-[#c8dce8] mt-1">Resolve <span className="text-[#00ff41] font-mono">{query.domain}</span> ({query.recordType} record)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#4a6682] font-display">EXPECTED</span>
                <p className="text-xs text-[#ffaa00] font-mono">{query.finalAnswer}</p>
              </div>
            </div>
          </div>

          {/* Resolution Path Visualization */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <p className="text-[10px] text-[#4a6682] font-display mb-3">RESOLUTION PATH</p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {query.hops.map((h, i) => {
                const key = `${currentStep}-${i}`;
                const result = hopResults[key];
                const isCurrent = i === currentHop && !isHopAnswered;
                const isPast = i < currentHop || (i === currentHop && isHopAnswered);

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: isPast || isCurrent ? 1 : 0.3, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      isCurrent ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.05)]' :
                      result === true ? 'border-[#00ff41] bg-[rgba(0,255,65,0.03)]' :
                      result === false ? 'border-[#ff3366] bg-[rgba(255,51,102,0.03)]' :
                      'border-[#1a2d45]'
                    }`}
                  >
                    <span className="text-[10px] font-mono w-4 text-[#4a6682]">{i + 1}</span>
                    <span className="text-xs font-display" style={{ color: getColor(h.from) }}>{h.from}</span>
                    <ArrowRight size={12} className="text-[#4a6682]" />
                    {isPast ? (
                      <span className="text-xs font-display" style={{ color: getColor(h.to) }}>{h.to}</span>
                    ) : isCurrent ? (
                      <span className="text-xs text-[#00d4ff] font-display animate-pulse">???</span>
                    ) : (
                      <span className="text-xs text-[#4a6682] font-display">---</span>
                    )}
                    <span className="text-[10px] text-[#4a6682] ml-auto max-w-[40%] truncate">{isPast ? h.message : ''}</span>
                    {result !== undefined && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {result ? <CheckCircle size={12} className="text-[#00ff41]" /> : <XCircle size={12} className="text-[#ff3366]" />}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Current Hop Selection */}
          {!allHopsDone && (
            <div className="bg-[#0d1526] border border-[#00d4ff] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#c8dce8] mb-3">
                <span className="font-display" style={{ color: getColor(hop.from) }}>{hop.from}</span>
                <span className="text-[#4a6682]"> sends to </span>
                <span className="text-[#00d4ff] font-display">___?</span>
              </p>
              <p className="text-[10px] text-[#4a6682] mb-3">{hop.message}</p>
              <div className="grid grid-cols-2 gap-2">
                {query.hopOptions[currentHop].map((option, oi) => {
                  const selected = hopSelections[hopKey] === option;
                  const isCorrectAnswer = isHopAnswered && option === hop.to;
                  const isWrongSelection = isHopAnswered && selected && option !== hop.to;

                  return (
                    <motion.button
                      key={oi}
                      whileHover={!isHopAnswered ? { scale: 1.02 } : {}}
                      whileTap={!isHopAnswered ? { scale: 0.98 } : {}}
                      onClick={() => selectHopTarget(option)}
                      disabled={isHopAnswered}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-display transition-all ${
                        isCorrectAnswer
                          ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)] text-[#00ff41]'
                          : isWrongSelection
                            ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)] text-[#ff3366]'
                            : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#00d4ff] hover:text-[#c8dce8]'
                      } disabled:cursor-default`}
                    >
                      <Server size={12} style={{ color: getColor(option) }} />
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complete / Next */}
          {allHopsDone && (
            <div className="flex justify-end">
              <button
                onClick={finishQuery}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm font-display uppercase hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all"
              >
                {isLastStep ? 'View Results' : 'Next Query'} <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* Final Score */}
          {isComplete && stepScores.length === QUERIES.length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 border rounded-xl p-5 ${totalScore >= 80 ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className={totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'} />
                <span className={`font-display font-bold text-sm ${totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'}`}>
                  DNS Tracing Complete: {totalScore}%
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {stepScores.map((s, i) => (
                  <div key={i} className={`px-2 py-1 rounded text-[10px] font-display border ${
                    s === 100 ? 'border-[#00ff41] text-[#00ff41]' : s >= 50 ? 'border-[#ffaa00] text-[#ffaa00]' : 'border-[#ff3366] text-[#ff3366]'
                  }`}>
                    {QUERIES[i].domain}: {s}%
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
