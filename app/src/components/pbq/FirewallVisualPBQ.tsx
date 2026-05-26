import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Shield, ArrowRight, Ban, Check, Lock, Unlock, Play } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const firewallMetadata: PBQMetadata = {
  id: 'firewall-rules',
  title: 'Firewall Rule Architect',
  description: 'Drag and drop firewall rules into the correct priority order, then watch packets flow through and validate your configuration.',
  difficulty: 4,
  category: 'Security+',
  tags: ['firewall', 'rules', 'network-security'],
  xpReward: 55,
  estimatedTime: '10 min',
};

interface FirewallRule {
  id: string;
  priority: number;
  action: 'ALLOW' | 'DENY' | 'LOG';
  source: string;
  dest: string;
  port: string;
  protocol: string;
  direction: 'IN' | 'OUT';
}

interface TestPacket {
  id: string;
  name: string;
  src: string;
  dst: string;
  port: string;
  proto: string;
  dir: 'IN' | 'OUT';
  expected: 'ALLOW' | 'DENY';
}

const INITIAL_RULES: FirewallRule[] = [
  { id: 'r1', priority: 1, action: 'DENY', source: '0.0.0.0/0', dest: '10.0.0.0/24', port: '22', protocol: 'TCP', direction: 'IN' },
  { id: 'r2', priority: 2, action: 'ALLOW', source: '10.0.1.0/24', dest: '0.0.0.0/0', port: '443', protocol: 'TCP', direction: 'OUT' },
  { id: 'r3', priority: 3, action: 'DENY', source: '0.0.0.0/0', dest: '10.0.0.0/24', port: '3389', protocol: 'TCP', direction: 'IN' },
  { id: 'r4', priority: 4, action: 'ALLOW', source: '10.0.10.0/24', dest: '10.0.0.0/24', port: '3389', protocol: 'TCP', direction: 'IN' },
  { id: 'r5', priority: 5, action: 'LOG', source: '0.0.0.0/0', dest: '10.0.0.0/24', port: 'any', protocol: 'TCP', direction: 'IN' },
];

const TEST_PACKETS: TestPacket[] = [
  { id: 'p1', name: 'HTTPS from DMZ', src: '10.0.1.10', dst: '8.8.8.8', port: '443', proto: 'TCP', dir: 'OUT', expected: 'ALLOW' },
  { id: 'p2', name: 'SSH from Internet', src: '203.0.113.5', dst: '10.0.0.50', port: '22', proto: 'TCP', dir: 'IN', expected: 'DENY' },
  { id: 'p3', name: 'RDP from Admin', src: '10.0.10.5', dst: '10.0.0.25', port: '3389', proto: 'TCP', dir: 'IN', expected: 'ALLOW' },
  { id: 'p4', name: 'RDP from Internet', src: '203.0.113.10', dst: '10.0.0.25', port: '3389', proto: 'TCP', dir: 'IN', expected: 'DENY' },
];

const CORRECT_ORDER = ['r2', 'r1', 'r4', 'r3', 'r5'];

interface Props {
  onComplete?: (score: number) => void;
}

export default function FirewallVisualPBQ({ onComplete }: Props) {
  const [rules, setRules] = useState<FirewallRule[]>(INITIAL_RULES);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [runningTest, setRunningTest] = useState(false);
  const [currentPacket, setCurrentPacket] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [packetPosition, setPacketPosition] = useState(0);

  const evaluateRules = useCallback((packet: TestPacket, ruleSet: FirewallRule[]): 'ALLOW' | 'DENY' => {
    for (const rule of ruleSet) {
      const srcMatch = rule.source === '0.0.0.0/0' || ipInRange(packet.src, rule.source);
      const dstMatch = rule.dest === '0.0.0.0/0' || ipInRange(packet.dst, rule.dest);
      const portMatch = rule.port === 'any' || rule.port === packet.port;
      const protoMatch = rule.protocol === packet.proto;
      const dirMatch = rule.direction === packet.dir;

      if (srcMatch && dstMatch && portMatch && protoMatch && dirMatch) {
        if (rule.action === 'DENY') return 'DENY';
        if (rule.action === 'ALLOW') return 'ALLOW';
      }
    }
    return 'DENY';
  }, []);

  const runTests = async () => {
    setRunningTest(true);
    setTestResults({});
    let passed = 0;

    for (let i = 0; i < TEST_PACKETS.length; i++) {
      setCurrentPacket(i);
      setPacketPosition(0);

      // Animate packet through rules
      for (let pos = 0; pos <= rules.length; pos++) {
        setPacketPosition(pos);
        await new Promise(r => setTimeout(r, 300));
      }

      const result = evaluateRules(TEST_PACKETS[i], rules);
      const success = result === TEST_PACKETS[i].expected;
      if (success) passed++;
      setTestResults(prev => ({ ...prev, [TEST_PACKETS[i].id]: success }));

      await new Promise(r => setTimeout(r, 500));
    }

    setCurrentPacket(null);
    setRunningTest(false);
    const finalScore = Math.round((passed / TEST_PACKETS.length) * 100);
    setScore(finalScore);
    setCompleted(true);
    onComplete?.(finalScore);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#ffaa00]" />
          <span className="text-caption text-[#7da0c4] font-display">Firewall Configuration</span>
        </div>
        <ProgressTracker
          current={Object.values(testResults).filter(Boolean).length}
          total={TEST_PACKETS.length}
          score={score}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[40%_20%_40%] gap-4">
        {/* Source Zones */}
        <div className="space-y-2">
          <h4 className="text-caption text-[#7da0c4] font-display mb-2">SOURCE ZONES</h4>
          {[
            { name: 'Internet', range: '0.0.0.0/0', color: '#ff3366' },
            { name: 'DMZ', range: '10.0.1.0/24', color: '#00d4ff' },
            { name: 'Admin', range: '10.0.10.0/24', color: '#ffaa00' },
          ].map(zone => (
            <div key={zone.name} className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                <span className="text-sm text-[#e0f2fe] font-display">{zone.name}</span>
              </div>
              <span className="text-caption text-[#4a6682] font-mono">{zone.range}</span>
            </div>
          ))}
        </div>

        {/* Firewall */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            animate={runningTest ? { boxShadow: ['0 0 10px rgba(255,170,0,0.3)', '0 0 30px rgba(255,170,0,0.6)', '0 0 10px rgba(255,170,0,0.3)'] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-24 h-32 bg-gradient-to-b from-[#1a2d45] to-[#0d1526] border-2 border-[#ffaa00] rounded-xl flex flex-col items-center justify-center gap-2 relative"
          >
            <Shield size={32} className="text-[#ffaa00]" />
            <span className="text-[10px] text-[#ffaa00] font-display">FIREWALL</span>

            {/* Animated packet */}
            <AnimatePresence>
              {runningTest && currentPacket !== null && (
                <motion.div
                  initial={{ y: -80, opacity: 0 }}
                  animate={{ y: -20 + packetPosition * 10, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
                  style={{
                    backgroundColor: TEST_PACKETS[currentPacket].expected === 'ALLOW' ? '#00ff41' : '#ff3366',
                  }}
                >
                  <span className="text-[8px] font-bold text-[#0a0e17]">{TEST_PACKETS[currentPacket].port}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <button
            onClick={runTests}
            disabled={runningTest || completed}
            className="mt-4 flex items-center gap-2 px-4 py-2 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-xs font-display hover:bg-[rgba(0,212,255,0.1)] transition-all disabled:opacity-30"
          >
            <Play size={14} />
            Run Tests
          </button>
        </div>

        {/* Destination Zones */}
        <div className="space-y-2">
          <h4 className="text-caption text-[#7da0c4] font-display mb-2">DESTINATION ZONES</h4>
          {[
            { name: 'Internal LAN', range: '10.0.0.0/24', color: '#00ff41' },
            { name: 'Internet', range: '0.0.0.0/0', color: '#7da0c4' },
          ].map(zone => (
            <div key={zone.name} className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                <span className="text-sm text-[#e0f2fe] font-display">{zone.name}</span>
              </div>
              <span className="text-caption text-[#4a6682] font-mono">{zone.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Rule Table - Draggable */}
      <div className="mt-6 bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
          <h4 className="text-caption text-[#7da0c4] font-display">RULE TABLE (Drag to reorder)</h4>
          <span className="text-[10px] text-[#4a6682]">Priority 1 = First match</span>
        </div>
        <Reorder.Group
          axis="y"
          values={rules}
          onReorder={setRules}
          className="divide-y divide-[#1a2d45]"
        >
          {rules.map((rule, idx) => {
            const isActive = runningTest && currentPacket !== null && packetPosition === idx;
            const testResult = TEST_PACKETS[currentPacket ?? 0]?.id ? testResults[TEST_PACKETS[currentPacket ?? 0]?.id] : undefined;

            return (
              <Reorder.Item
                key={rule.id}
                value={rule}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-grab active:cursor-grabbing transition-colors ${
                  isActive ? 'bg-[rgba(0,212,255,0.05)]' : 'hover:bg-[#111d2e]'
                }`}
              >
                <span className="text-xs text-[#4a6682] font-display w-6">{idx + 1}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  rule.action === 'ALLOW' ? 'bg-[rgba(0,255,65,0.15)] text-[#00ff41]' :
                  rule.action === 'DENY' ? 'bg-[rgba(255,51,102,0.15)] text-[#ff3366]' :
                  'bg-[rgba(255,170,0,0.15)] text-[#ffaa00]'
                }`}>
                  {rule.action}
                </span>
                <span className="text-xs text-[#e0f2fe] font-mono flex-1">{rule.source}</span>
                <ArrowRight size={12} className="text-[#4a6682]" />
                <span className="text-xs text-[#e0f2fe] font-mono flex-1">{rule.dest}</span>
                <span className="text-xs text-[#00d4ff] font-mono w-10">{rule.port}</span>
                <span className="text-[10px] text-[#7da0c4] font-mono">{rule.protocol}</span>
                <span className="text-[10px] text-[#7da0c4] font-mono">{rule.direction}</span>

                {completed && testResults[rule.id] !== undefined && (
                  <span className={testResults[rule.id] ? 'text-[#00ff41]' : 'text-[#ff3366]'}>
                    {testResults[rule.id] ? <Check size={14} /> : <Ban size={14} />}
                  </span>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* Test Results */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2"
        >
          {TEST_PACKETS.map(pkt => (
            <div
              key={pkt.id}
              className={`border rounded-lg p-3 ${
                testResults[pkt.id] ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]'
              }`}
            >
              <p className="text-xs text-[#e0f2fe] font-display">{pkt.name}</p>
              <p className="text-[10px] text-[#7da0c4] font-mono">{pkt.src}:{pkt.port} &#8594; {pkt.dst}</p>
              <div className="flex items-center gap-1 mt-1">
                {testResults[pkt.id] ? <Unlock size={12} className="text-[#00ff41]" /> : <Lock size={12} className="text-[#ff3366]" />}
                <span className={`text-[10px] ${testResults[pkt.id] ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                  {testResults[pkt.id] ? 'ALLOWED' : 'BLOCKED'}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function ipInRange(ip: string, range: string): boolean {
  if (range === '0.0.0.0/0') return true;
  const [rangeIp, prefix] = range.split('/');
  const prefixLen = parseInt(prefix);
  const ipNum = ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0);
  const rangeNum = rangeIp.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct), 0);
  const mask = 0xFFFFFFFF << (32 - prefixLen);
  return (ipNum & mask) === (rangeNum & mask);
}
