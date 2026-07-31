import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, CheckCircle, XCircle, ChevronRight, AlertTriangle, GitBranch, ArrowRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const routingTableMetadata: PBQMetadata = {
  id: 'routing-table',
  title: 'Routing Table Engineer',
  description: 'Analyze routing tables, add static routes, identify next hops, configure default routes, and troubleshoot routing issues.',
  difficulty: 4,
  category: 'Network+',
  tags: ['routing', 'static-routes', 'next-hop', 'gateway'],
  xpReward: 60,
  estimatedTime: '12 min',
};

interface RouteEntry {
  destination: string;
  mask: string;
  nextHop: string;
  iface: string;
  metric: number;
  protocol: string;
}

interface RoutingQuestion {
  id: string;
  label: string;
  options: string[];
  correct: number;
}

interface RoutingChallenge {
  id: number;
  title: string;
  scenario: string;
  routingTable: RouteEntry[];
  questions: RoutingQuestion[];
}

const CHALLENGES: RoutingChallenge[] = [
  {
    id: 1, title: 'Read the Routing Table',
    scenario: 'A router has the following routing table. Analyze it to answer questions about packet forwarding decisions.',
    routingTable: [
      { destination: '10.0.1.0', mask: '/24', nextHop: '0.0.0.0', iface: 'eth0', metric: 0, protocol: 'C' },
      { destination: '10.0.2.0', mask: '/24', nextHop: '10.0.1.1', iface: 'eth0', metric: 1, protocol: 'S' },
      { destination: '192.168.1.0', mask: '/24', nextHop: '10.0.1.2', iface: 'eth0', metric: 10, protocol: 'R' },
      { destination: '0.0.0.0', mask: '/0', nextHop: '10.0.1.254', iface: 'eth0', metric: 1, protocol: 'S*' },
    ],
    questions: [
      { id: '1a', label: 'Where is a packet to 10.0.2.50 forwarded?', options: ['10.0.1.1', '10.0.1.2', '10.0.1.254', 'Dropped'], correct: 0 },
      { id: '1b', label: 'Which route is directly connected?', options: ['10.0.2.0/24', '192.168.1.0/24', '10.0.1.0/24', '0.0.0.0/0'], correct: 2 },
      { id: '1c', label: 'What does S* indicate?', options: ['Static OSPF', 'Default static route', 'Summary route', 'Stub area'], correct: 1 },
      { id: '1d', label: 'Where does a packet to 8.8.8.8 go?', options: ['10.0.1.1', '10.0.1.2', '10.0.1.254', 'Dropped'], correct: 2 },
    ],
  },
  {
    id: 2, title: 'Add a Static Route',
    scenario: 'Network 172.16.5.0/24 is reachable via gateway 10.0.1.5 on interface eth1. Select the correct static route configuration.',
    routingTable: [
      { destination: '10.0.1.0', mask: '/24', nextHop: '0.0.0.0', iface: 'eth0', metric: 0, protocol: 'C' },
      { destination: '10.0.3.0', mask: '/24', nextHop: '0.0.0.0', iface: 'eth1', metric: 0, protocol: 'C' },
      { destination: '0.0.0.0', mask: '/0', nextHop: '10.0.1.254', iface: 'eth0', metric: 1, protocol: 'S*' },
    ],
    questions: [
      { id: '2a', label: 'Correct command to add the route?', options: [
        'ip route add 172.16.5.0/24 via 10.0.1.5',
        'ip route add 172.16.5.0/24 via 10.0.3.1',
        'ip route add 172.16.5.0 via 10.0.1.254',
        'ip route add default via 10.0.1.5',
      ], correct: 0 },
      { id: '2b', label: 'What type of route is this?', options: ['Connected', 'Dynamic (OSPF)', 'Static', 'Default'], correct: 2 },
      { id: '2c', label: 'What protocol code will it show?', options: ['C', 'O', 'S', 'R'], correct: 2 },
      { id: '2d', label: 'Will this route persist across reboot by default?', options: ['Yes, always', 'No, must add to config file', 'Only on Cisco', 'Only with OSPF'], correct: 1 },
    ],
  },
  {
    id: 3, title: 'Identify Next Hop',
    scenario: 'Given the routing table below with multiple paths, determine the correct next hop for each destination using longest prefix match.',
    routingTable: [
      { destination: '10.0.0.0', mask: '/8', nextHop: '192.168.1.1', iface: 'eth0', metric: 20, protocol: 'R' },
      { destination: '10.0.1.0', mask: '/24', nextHop: '192.168.1.2', iface: 'eth0', metric: 10, protocol: 'O' },
      { destination: '10.0.1.128', mask: '/25', nextHop: '192.168.1.3', iface: 'eth1', metric: 5, protocol: 'S' },
      { destination: '0.0.0.0', mask: '/0', nextHop: '192.168.1.254', iface: 'eth0', metric: 1, protocol: 'S*' },
    ],
    questions: [
      { id: '3a', label: 'Next hop for 10.0.1.200?', options: ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.254'], correct: 2 },
      { id: '3b', label: 'Next hop for 10.0.1.50?', options: ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.254'], correct: 1 },
      { id: '3c', label: 'Next hop for 10.5.5.5?', options: ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.254'], correct: 0 },
      { id: '3d', label: 'Why does /25 win for 10.0.1.200?', options: ['Lower metric', 'Longest prefix match', 'Static over dynamic', 'Alphabetical order'], correct: 1 },
    ],
  },
  {
    id: 4, title: 'Configure Default Route',
    scenario: 'A branch office router needs a default route to reach the internet through the ISP gateway at 203.0.113.1.',
    routingTable: [
      { destination: '192.168.10.0', mask: '/24', nextHop: '0.0.0.0', iface: 'eth0', metric: 0, protocol: 'C' },
      { destination: '192.168.20.0', mask: '/24', nextHop: '0.0.0.0', iface: 'eth1', metric: 0, protocol: 'C' },
      { destination: '203.0.113.0', mask: '/30', nextHop: '0.0.0.0', iface: 'eth2', metric: 0, protocol: 'C' },
    ],
    questions: [
      { id: '4a', label: 'Correct default route command?', options: [
        'ip route add 0.0.0.0/0 via 203.0.113.1',
        'ip route add 0.0.0.0/0 via 192.168.10.1',
        'ip route add default via 192.168.20.1',
        'ip route add 203.0.113.0/30 via 0.0.0.0',
      ], correct: 0 },
      { id: '4b', label: 'What is the default route destination?', options: ['255.255.255.255/32', '127.0.0.0/8', '0.0.0.0/0', '10.0.0.0/8'], correct: 2 },
      { id: '4c', label: 'What happens to a packet for 192.168.10.50?', options: ['Sent to ISP', 'Delivered locally on eth0', 'Dropped', 'Sent to eth1'], correct: 1 },
      { id: '4d', label: 'If ISP link fails, what happens to internet traffic?', options: ['Routes to eth0', 'Routes to eth1', 'Packets are dropped', 'Auto-failover to OSPF'], correct: 2 },
    ],
  },
  {
    id: 5, title: 'Troubleshoot Routing Issue',
    scenario: 'Users on 192.168.1.0/24 cannot reach the server at 10.0.5.100. The router shows this routing table. Find the problem.',
    routingTable: [
      { destination: '192.168.1.0', mask: '/24', nextHop: '0.0.0.0', iface: 'eth0', metric: 0, protocol: 'C' },
      { destination: '10.0.5.0', mask: '/24', nextHop: '172.16.0.2', iface: 'eth1', metric: 1, protocol: 'S' },
      { destination: '172.16.0.0', mask: '/30', nextHop: '0.0.0.0', iface: 'eth1', metric: 0, protocol: 'C' },
      { destination: '0.0.0.0', mask: '/0', nextHop: '192.168.1.254', iface: 'eth0', metric: 1, protocol: 'S*' },
    ],
    questions: [
      { id: '5a', label: 'Is there a route to 10.0.5.100?', options: ['No route exists', 'Yes, via 172.16.0.2', 'Yes, via default route', 'Yes, via eth0'], correct: 1 },
      { id: '5b', label: 'If 172.16.0.2 is unreachable, what is likely wrong?', options: ['DNS failure', 'Next-hop router is down', 'Firewall on eth0', 'Wrong subnet mask'], correct: 1 },
      { id: '5c', label: 'What tool verifies path to next hop?', options: ['nslookup', 'ping / traceroute', 'netstat', 'arp -a'], correct: 1 },
      { id: '5d', label: 'If route via 172.16.0.2 fails, where does traffic go?', options: ['Dropped immediately', 'Via default route (192.168.1.254)', 'Buffered until link up', 'Broadcast on eth1'], correct: 1 },
    ],
  },
];

const PROTOCOL_LABELS: Record<string, { full: string; color: string }> = {
  C: { full: 'Connected', color: '#00ff41' },
  S: { full: 'Static', color: '#00d4ff' },
  'S*': { full: 'Default Static', color: '#ffaa00' },
  R: { full: 'RIP', color: '#a855f7' },
  O: { full: 'OSPF', color: '#ff8c00' },
};

interface Props {
  onComplete?: (score: number) => void;
}

export default function RoutingTablePBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState(false);
  const [stepScores, setStepScores] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const challenge = CHALLENGES[currentStep];
  const isLastStep = currentStep === CHALLENGES.length - 1;
  const isComplete = isLastStep && checked;

  const handleSelect = useCallback((qId: string, optIdx: number) => {
    if (checked) return;
    setSelections(prev => ({ ...prev, [qId]: optIdx }));
  }, [checked]);

  const checkAnswers = useCallback(() => {
    let correct = 0;
    challenge.questions.forEach(q => {
      if (selections[q.id] === q.correct) correct++;
    });
    const stepScore = Math.round((correct / challenge.questions.length) * 100);
    setStepScores(prev => [...prev, stepScore]);
    setStreak(stepScore === 100 ? streak + 1 : 0);
    setChecked(true);

    if (isLastStep) {
      const allScores = [...stepScores, stepScore];
      const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      onComplete?.(finalScore);
    }
  }, [challenge, selections, isLastStep, stepScores, streak, onComplete]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
    setChecked(false);
  }, []);

  const allAnswered = challenge.questions.every(q => selections[q.id] !== undefined);
  const totalScore = stepScores.length > 0
    ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">Routing Table</span>
        </div>
        <ProgressTracker current={currentStep + (checked ? 1 : 0)} total={CHALLENGES.length} score={totalScore} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {/* Challenge Header */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Route size={14} className="text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-display">STEP {challenge.id}/{CHALLENGES.length}: {challenge.title}</span>
            </div>
            <p className="text-sm text-[#c8dce8] mt-1">{challenge.scenario}</p>
          </div>

          {/* Routing Table Display */}
          <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
            <div className="px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45] flex items-center justify-between">
              <span className="text-[10px] text-[#4a6682] font-display">ROUTING TABLE</span>
              <span className="text-[10px] text-[#4a6682] font-mono"># show ip route</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] font-mono min-w-[500px]">
                <thead>
                  <tr className="text-[#4a6682] border-b border-[#1a2d45]">
                    <th className="text-left px-4 py-2">Proto</th>
                    <th className="text-left px-4 py-2">Destination</th>
                    <th className="text-left px-4 py-2">Next Hop</th>
                    <th className="text-left px-4 py-2">Interface</th>
                    <th className="text-left px-4 py-2">Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {challenge.routingTable.map((route, i) => {
                    const proto = PROTOCOL_LABELS[route.protocol] || { full: route.protocol, color: '#7da0c4' };
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="border-b border-[#1a2d45] hover:bg-[#111d2e]"
                      >
                        <td className="px-4 py-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color: proto.color, backgroundColor: `${proto.color}15` }}>
                            {route.protocol}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[#c8dce8]">{route.destination}{route.mask}</td>
                        <td className="px-4 py-2" style={{ color: route.nextHop === '0.0.0.0' ? '#4a6682' : '#00d4ff' }}>
                          {route.nextHop === '0.0.0.0' ? 'directly connected' : route.nextHop}
                        </td>
                        <td className="px-4 py-2 text-[#7da0c4]">{route.iface}</td>
                        <td className="px-4 py-2 text-[#7da0c4]">{route.metric}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Legend */}
            <div className="px-4 py-2 border-t border-[#1a2d45] flex gap-4 flex-wrap">
              {Object.entries(PROTOCOL_LABELS).map(([code, info]) => (
                <span key={code} className="text-[9px] font-display" style={{ color: info.color }}>
                  {code} = {info.full}
                </span>
              ))}
            </div>
          </div>

          {/* Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenge.questions.map((q, qi) => {
              const selected = selections[q.id];
              const isCorrect = checked && selected === q.correct;
              const isWrong = checked && selected !== undefined && selected !== q.correct;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: qi * 0.1 }}
                  className={`bg-[#0d1526] border rounded-xl p-4 ${
                    isCorrect ? 'border-[#00ff41]' : isWrong ? 'border-[#ff3366]' : 'border-[#1a2d45]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#c8dce8] font-display">{q.label}</span>
                    {checked && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {isCorrect ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />}
                      </motion.div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const isSel = selected === oi;
                      const isAns = checked && oi === q.correct;
                      return (
                        <button
                          key={oi}
                          onClick={() => handleSelect(q.id, oi)}
                          disabled={checked}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-display border transition-all ${
                            isAns ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)] text-[#00ff41]'
                            : isSel && isWrong ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)] text-[#ff3366]'
                            : isSel ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                            : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#00d4ff] hover:text-[#c8dce8]'
                          } disabled:cursor-default`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end">
            {!checked ? (
              <button
                onClick={checkAnswers}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm font-display uppercase hover:bg-[#00ff41] hover:text-[#0a1628] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Submit <CheckCircle size={14} />
              </button>
            ) : !isLastStep ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm font-display uppercase hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all"
              >
                Next Step <ChevronRight size={14} />
              </button>
            ) : null}
          </div>

          {/* Final Results */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 border rounded-xl p-5 ${totalScore >= 80 ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                {totalScore >= 80 ? <CheckCircle size={18} className="text-[#00ff41]" /> : <AlertTriangle size={18} className="text-[#ffaa00]" />}
                <span className={`font-display font-bold text-sm ${totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'}`}>
                  Routing Lab Complete: {totalScore}%
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {stepScores.map((s, i) => (
                  <div key={i} className={`px-2 py-1 rounded text-[10px] font-display border ${
                    s === 100 ? 'border-[#00ff41] text-[#00ff41]' : s >= 50 ? 'border-[#ffaa00] text-[#ffaa00]' : 'border-[#ff3366] text-[#ff3366]'
                  }`}>
                    {CHALLENGES[i].title.split(' ').slice(0, 2).join(' ')}: {s}%
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
