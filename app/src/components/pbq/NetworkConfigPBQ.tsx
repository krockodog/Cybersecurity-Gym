import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, CheckCircle, XCircle, Terminal, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const networkConfigMetadata: PBQMetadata = {
  id: 'linux-network-config',
  title: 'Network Interface Configuration',
  description: 'Configure Linux network interfaces using ip, nmcli, /etc/network/interfaces, DNS resolution, and NIC bonding.',
  difficulty: 3,
  category: 'Linux+',
  tags: ['networking', 'ip', 'nmcli', 'dns', 'bonding'],
  xpReward: 50,
  estimatedTime: '8 min',
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
    id: 'assign-ip',
    title: 'Assign Static IP Address',
    prompt: 'Assign the static IP address 10.0.2.50/24 to interface eth0 using the modern ip command. The change should take effect immediately.',
    terminalOutput: '$ ip addr show eth0\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff\n    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic eth0\n       valid_lft 3200sec preferred_lft 3200sec',
    options: [
      { id: 'a', label: 'ip addr add 10.0.2.50/24 dev eth0', command: 'ip addr add 10.0.2.50/24 dev eth0' },
      { id: 'b', label: 'ifconfig eth0 10.0.2.50', command: 'ifconfig eth0 10.0.2.50 netmask 255.255.255.0' },
      { id: 'c', label: 'nmcli dev modify eth0 ip 10.0.2.50', command: 'nmcli dev modify eth0 ipv4.address 10.0.2.50' },
      { id: 'd', label: 'ip link set eth0 address 10.0.2.50', command: 'ip link set eth0 address 10.0.2.50/24' },
    ],
    correctId: 'a',
    explanation: 'ip addr add assigns an IP address to an interface immediately. The /24 CIDR notation specifies the subnet mask. This is the iproute2 replacement for the deprecated ifconfig.',
  },
  {
    id: 'nmcli-connection',
    title: 'Configure with NetworkManager',
    prompt: 'Create a persistent static network connection named "office" on interface ens192 with IP 192.168.10.25/24, gateway 192.168.10.1, and DNS 8.8.8.8.',
    terminalOutput: '$ nmcli device status\nDEVICE   TYPE      STATE         CONNECTION\nens192   ethernet  disconnected  --\nlo       loopback  unmanaged     --\n\n$ nmcli connection show\nNAME  UUID  TYPE  DEVICE\n(none)',
    options: [
      { id: 'a', label: 'nmcli connection add (full config)', command: 'nmcli con add con-name office ifname ens192 type ethernet ip4 192.168.10.25/24 gw4 192.168.10.1 ipv4.dns 8.8.8.8 ipv4.method manual' },
      { id: 'b', label: 'nmcli device connect', command: 'nmcli device connect ens192 --ip 192.168.10.25/24' },
      { id: 'c', label: 'ip addr add + route', command: 'ip addr add 192.168.10.25/24 dev ens192 && ip route add default via 192.168.10.1' },
      { id: 'd', label: 'Edit ifcfg script', command: 'vi /etc/sysconfig/network-scripts/ifcfg-ens192' },
    ],
    correctId: 'a',
    explanation: 'nmcli con add creates a persistent NetworkManager connection profile. Setting ipv4.method to manual enables static configuration. The profile survives reboots automatically.',
  },
  {
    id: 'dns-config',
    title: 'Configure DNS Resolution',
    prompt: 'The server cannot resolve hostnames. Configure it to use the company DNS server 10.0.1.53 and the domain search suffix corp.example.com persistently on a systemd-resolved system.',
    terminalOutput: '$ resolvectl status\nGlobal\n         DNS Servers: (none)\n          DNS Domain: (none)\n\n$ host www.corp.example.com\nHost www.corp.example.com not found: 3(NXDOMAIN)',
    options: [
      { id: 'a', label: 'Edit /etc/resolv.conf', command: 'echo "nameserver 10.0.1.53\\nsearch corp.example.com" > /etc/resolv.conf' },
      { id: 'b', label: 'Configure resolved.conf', command: 'sed -i "s/#DNS=/DNS=10.0.1.53/" /etc/systemd/resolved.conf && sed -i "s/#Domains=/Domains=corp.example.com/" /etc/systemd/resolved.conf && systemctl restart systemd-resolved' },
      { id: 'c', label: 'nmcli dns set', command: 'nmcli general dns 10.0.1.53' },
      { id: 'd', label: 'hostnamectl set-dns', command: 'hostnamectl set-dns 10.0.1.53 corp.example.com' },
    ],
    correctId: 'b',
    explanation: 'On systemd-resolved systems, /etc/systemd/resolved.conf is the persistent configuration. Editing /etc/resolv.conf directly is overwritten. The service must be restarted to apply.',
  },
  {
    id: 'default-gateway',
    title: 'Set Default Gateway',
    prompt: 'The server has no default route and cannot reach external networks. Add a default gateway pointing to 10.0.2.1.',
    terminalOutput: '$ ip route show\n10.0.2.0/24 dev eth0 proto kernel scope link src 10.0.2.50\n\n$ ping 8.8.8.8\nconnect: Network is unreachable',
    options: [
      { id: 'a', label: 'ip route add default via 10.0.2.1', command: 'ip route add default via 10.0.2.1 dev eth0' },
      { id: 'b', label: 'route add -net 0.0.0.0 gw 10.0.2.1', command: 'route add -net 0.0.0.0 gw 10.0.2.1' },
      { id: 'c', label: 'ip route replace 0.0.0.0 10.0.2.1', command: 'ip route replace 0.0.0.0/0 via 10.0.2.1' },
      { id: 'd', label: 'echo gateway to sysctl', command: 'sysctl -w net.ipv4.default_gateway=10.0.2.1' },
    ],
    correctId: 'a',
    explanation: 'ip route add default via sets the default gateway. The "default" keyword is equivalent to 0.0.0.0/0. Specifying dev eth0 ensures the route uses the correct interface.',
  },
  {
    id: 'nic-bonding',
    title: 'Configure NIC Bonding',
    prompt: 'Bond two interfaces (eth0, eth1) in active-backup mode for redundancy using nmcli. The bond should use eth0 as primary.',
    terminalOutput: '$ nmcli device status\nDEVICE   TYPE      STATE         CONNECTION\neth0     ethernet  connected     Wired1\neth1     ethernet  connected     Wired2\n\nBoth NICs are connected to the same switch for redundancy.',
    options: [
      { id: 'a', label: 'nmcli bond with active-backup', command: 'nmcli con add type bond con-name bond0 ifname bond0 bond.options "mode=active-backup,primary=eth0" && nmcli con add type ethernet con-name bond0-eth0 ifname eth0 master bond0 && nmcli con add type ethernet con-name bond0-eth1 ifname eth1 master bond0' },
      { id: 'b', label: 'ip link add bond', command: 'ip link add bond0 type bond mode active-backup' },
      { id: 'c', label: 'modprobe bonding', command: 'modprobe bonding mode=1 && echo "+eth0" > /sys/class/net/bond0/bonding/slaves' },
      { id: 'd', label: 'teamctl create', command: 'teamd -d -t bond0 -c \'{"runner": {"name": "activebackup"}}\'' },
    ],
    correctId: 'a',
    explanation: 'nmcli creates a persistent bond connection. active-backup mode provides failover: only one slave is active, the other takes over if the primary link fails. This survives reboots.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function NetworkConfigPBQ({ onComplete }: Props) {
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
          <Network size={16} className="text-[#ff9500]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Network Interface Configuration</span>
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

          <div className="flex justify-end gap-3">
            {completed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a2d45] text-[#7da0c4] text-sm hover:border-[#ff9500] transition-colors">
                <RotateCcw size={14} /> Retry
              </motion.button>
            )}
            {answered && !completed && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff9500] text-[#0a1628] text-sm font-semibold hover:brightness-110 transition-all">
                Next <ChevronRight size={14} />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
