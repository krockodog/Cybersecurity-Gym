import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Terminal, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const firewallConfigMetadata: PBQMetadata = {
  id: 'linux-firewall',
  title: 'Linux Firewall Configuration',
  description: 'Configure Linux firewalls using iptables and nftables rules, chains, policies, NAT, and port forwarding.',
  difficulty: 4,
  category: 'Linux+',
  tags: ['iptables', 'nftables', 'firewall', 'netfilter', 'security'],
  xpReward: 55,
  estimatedTime: '9 min',
};

interface Scenario {
  id: string;
  title: string;
  prompt: string;
  terminalOutput: string;
  options: { id: string; label: string; command: string }[];
  correctId: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'default-policy',
    title: 'Set Default DROP Policy',
    prompt: 'Harden the server by setting the default INPUT chain policy to DROP. Only explicitly allowed traffic should be accepted.',
    terminalOutput: '$ iptables -L INPUT -n\nChain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\n\nNo rules configured -- all inbound traffic is currently accepted.',
    options: [
      { id: 'a', label: 'iptables -P INPUT DROP', command: 'iptables -P INPUT DROP' },
      { id: 'b', label: 'iptables -A INPUT -j DROP', command: 'iptables -A INPUT -j DROP' },
      { id: 'c', label: 'iptables -I INPUT -j REJECT', command: 'iptables -I INPUT -j REJECT' },
      { id: 'd', label: 'iptables --default DROP', command: 'iptables --default INPUT DROP' },
    ],
    correctId: 'a',
    explanation: 'iptables -P sets the chain policy (default action). Setting INPUT to DROP means any packet not matching an explicit ACCEPT rule is silently dropped.',
  },
  {
    id: 'allow-ssh',
    title: 'Allow SSH Access',
    prompt: 'With a default DROP policy, you are locked out. Add a rule to allow inbound SSH (port 22) from the management subnet 10.0.1.0/24 only.',
    terminalOutput: '$ iptables -L INPUT -n\nChain INPUT (policy DROP)\ntarget     prot opt source               destination\n\nWARNING: Remote SSH session may be terminated.',
    options: [
      { id: 'a', label: 'Allow from subnet on port 22', command: 'iptables -A INPUT -s 10.0.1.0/24 -p tcp --dport 22 -j ACCEPT' },
      { id: 'b', label: 'Allow all SSH', command: 'iptables -A INPUT -p tcp --dport 22 -j ACCEPT' },
      { id: 'c', label: 'Allow from subnet any port', command: 'iptables -A INPUT -s 10.0.1.0/24 -j ACCEPT' },
      { id: 'd', label: 'Allow SSH outbound', command: 'iptables -A OUTPUT -p tcp --sport 22 -j ACCEPT' },
    ],
    correctId: 'a',
    explanation: 'This rule allows TCP traffic to destination port 22 only from the 10.0.1.0/24 subnet. It follows least-privilege by restricting both the source network and the destination port.',
  },
  {
    id: 'stateful-rule',
    title: 'Configure Stateful Tracking',
    prompt: 'Allow return traffic for established connections so the server can receive responses to its own outbound requests.',
    terminalOutput: '$ iptables -L INPUT -n\nChain INPUT (policy DROP)\ntarget     prot opt source               destination\nACCEPT     tcp  --  10.0.1.0/24          0.0.0.0/0  tcp dpt:22\n\nServer cannot receive responses to outbound DNS, NTP, or updates.',
    options: [
      { id: 'a', label: 'Allow ESTABLISHED,RELATED', command: 'iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT' },
      { id: 'b', label: 'Allow all return traffic', command: 'iptables -A INPUT -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT' },
      { id: 'c', label: 'Allow all FORWARD', command: 'iptables -A FORWARD -j ACCEPT' },
      { id: 'd', label: 'Disable connection tracking', command: 'iptables -t raw -A PREROUTING -j NOTRACK' },
    ],
    correctId: 'a',
    explanation: 'Tracking ESTABLISHED (ongoing connections) and RELATED (associated connections like FTP data channels) allows return traffic without opening new inbound connections.',
  },
  {
    id: 'nftables-migrate',
    title: 'nftables Rule Translation',
    prompt: 'The organization is migrating from iptables to nftables. Which nftables command is equivalent to: iptables -A INPUT -p tcp --dport 443 -j ACCEPT?',
    terminalOutput: '$ nft list ruleset\ntable inet filter {\n  chain input {\n    type filter hook input priority 0; policy drop;\n  }\n}\n\nMigrating iptables rules to nftables syntax.',
    options: [
      { id: 'a', label: 'nft add rule inet filter input tcp dport 443 accept', command: 'nft add rule inet filter input tcp dport 443 accept' },
      { id: 'b', label: 'nft -A INPUT -p tcp --dport 443 -j ACCEPT', command: 'nft -A INPUT -p tcp --dport 443 -j ACCEPT' },
      { id: 'c', label: 'nft insert rule filter input port 443 allow', command: 'nft insert rule filter input port 443 allow' },
      { id: 'd', label: 'nft create rule tcp:443 accept', command: 'nft create rule input tcp:443 accept' },
    ],
    correctId: 'a',
    explanation: 'nftables uses a different syntax: "nft add rule <family> <table> <chain> <match> <action>". The inet family handles both IPv4 and IPv6.',
  },
  {
    id: 'port-forward',
    title: 'Configure Port Forwarding',
    prompt: 'Forward external traffic arriving on port 8080 to an internal web server at 192.168.1.100:80 using NAT.',
    terminalOutput: '$ cat /proc/sys/net/ipv4/ip_forward\n1\n\n$ iptables -t nat -L PREROUTING -n\nChain PREROUTING (policy ACCEPT)\ntarget     prot opt source               destination\n\nIP forwarding is enabled. NAT PREROUTING chain is empty.',
    options: [
      { id: 'a', label: 'DNAT to internal server', command: 'iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.1.100:80' },
      { id: 'b', label: 'REDIRECT to port 80', command: 'iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-port 80' },
      { id: 'c', label: 'SNAT to internal', command: 'iptables -t nat -A POSTROUTING -p tcp --dport 8080 -j SNAT --to-source 192.168.1.100:80' },
      { id: 'd', label: 'MASQUERADE', command: 'iptables -t nat -A POSTROUTING -j MASQUERADE' },
    ],
    correctId: 'a',
    explanation: 'DNAT (Destination NAT) in the PREROUTING chain changes the destination address/port before routing. This forwards traffic to the internal server transparently.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function FirewallConfigPBQ({ onComplete }: Props) {
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
    setStep(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setStreak(0);
    setCompleted(false);
    setResults([]);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#ff9500]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Linux Firewall Configuration</span>
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
              <span className="px-2 py-0.5 bg-[rgba(255,149,0,0.15)] text-[#ff9500] rounded text-xs font-semibold">
                Step {step + 1}/{SCENARIOS.length}
              </span>
              <h3 className="text-sm text-[#e0f2fe] font-semibold">{scenario.title}</h3>
            </div>
            <p className="text-sm text-[#c8dce8] mb-4">{scenario.prompt}</p>

            <div className="bg-[#050d18] border border-[#1a2d45] rounded-lg p-3 mb-4 font-mono text-xs text-[#00ff41] whitespace-pre-wrap">
              <div className="flex items-center gap-2 mb-2 text-[#4a6682]">
                <Terminal size={12} />
                <span>Terminal Output</span>
              </div>
              {scenario.terminalOutput}
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
                    <code className="text-[10px] text-[#7da0c4] font-mono">{option.command}</code>
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

          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e0f2fe] font-semibold">Lab Complete</p>
                  <p className="text-xs text-[#7da0c4]">
                    You scored {score}% ({results.filter(Boolean).length}/{SCENARIOS.length} correct)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold" style={{ color: score >= 80 ? '#00ff41' : score >= 60 ? '#ffaa00' : '#ff3366' }}>
                    {score}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end gap-3">
            {completed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-sm hover:border-[#ff9500] transition-colors"
              >
                <RotateCcw size={14} />
                Retry
              </motion.button>
            )}
            {answered && !completed && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff9500] text-[#0a1628] text-sm font-semibold hover:brightness-110 transition-all"
              >
                Next
                <ChevronRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
