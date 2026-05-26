import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Server, Globe, Database, Wifi, Skull, CheckCircle, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import { FeedbackOverlay } from './shared/FeedbackOverlay';
import type { PBQMetadata } from './shared/types';

export const networkMetadata: PBQMetadata = {
  id: 'network-topology',
  title: 'Network Topology Analyzer',
  description: 'Analyze a live network topology, identify vulnerable nodes, and trace the optimal attack path through routers, firewalls, and hosts.',
  difficulty: 3,
  category: 'PenTest+',
  tags: ['network', 'recon', 'path-tracing'],
  xpReward: 50,
  estimatedTime: '8 min',
};

interface NetworkNode {
  id: string;
  type: 'router' | 'firewall' | 'server' | 'database' | 'workstation' | 'cloud';
  label: string;
  ip: string;
  x: number;
  y: number;
  vulnerable?: boolean;
  compromised?: boolean;
  glowColor?: string;
}

interface NetworkEdge {
  id: string;
  from: string;
  to: string;
  active?: boolean;
}

const NODES: NetworkNode[] = [
  { id: 'inet', type: 'cloud', label: 'Internet', ip: '0.0.0.0/0', x: 80, y: 200, glowColor: '#7da0c4' },
  { id: 'fw1', type: 'firewall', label: 'Edge FW', ip: '203.0.113.1', x: 250, y: 200, glowColor: '#00d4ff' },
  { id: 'router1', type: 'router', label: 'Core RTR', ip: '10.0.0.1', x: 420, y: 120, glowColor: '#ffaa00' },
  { id: 'dmz-web', type: 'server', label: 'Web SRV', ip: '10.0.1.10', x: 590, y: 60, vulnerable: true, glowColor: '#ff3366' },
  { id: 'dmz-dns', type: 'server', label: 'DNS SRV', ip: '10.0.1.11', x: 590, y: 180, glowColor: '#00ff41' },
  { id: 'router2', type: 'router', label: 'Int RTR', ip: '172.16.0.1', x: 420, y: 280, glowColor: '#ffaa00' },
  { id: 'db', type: 'database', label: 'DB SRV', ip: '172.16.1.50', x: 590, y: 280, vulnerable: true, glowColor: '#a855f7' },
  { id: 'ws', type: 'workstation', label: 'WS-01', ip: '172.16.1.25', x: 590, y: 380, vulnerable: true, glowColor: '#ff3366' },
];

const EDGES: NetworkEdge[] = [
  { id: 'e1', from: 'inet', to: 'fw1' },
  { id: 'e2', from: 'fw1', to: 'router1' },
  { id: 'e3', from: 'fw1', to: 'router2' },
  { id: 'e4', from: 'router1', to: 'dmz-web' },
  { id: 'e5', from: 'router1', to: 'dmz-dns' },
  { id: 'e6', from: 'router2', to: 'db' },
  { id: 'e7', from: 'router2', to: 'ws' },
  { id: 'e8', from: 'dmz-web', to: 'dmz-dns' },
];

const CORRECT_PATH = ['inet', 'fw1', 'router1', 'dmz-web'];
const VULNERABLE_NODES = ['dmz-web', 'db', 'ws'];

const NODE_ICONS: Record<string, React.ReactNode> = {
  router: <Wifi size={20} />,
  firewall: <Shield size={20} />,
  server: <Server size={20} />,
  database: <Database size={20} />,
  workstation: <Globe size={20} />,
  cloud: <Globe size={20} />,
};

interface Props {
  onComplete?: (score: number) => void;
}

export default function NetworkTopologyPBQ({ onComplete }: Props) {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [markedVulnerable, setMarkedVulnerable] = useState<string[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<'path' | 'vuln'>('path');
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);
  const [attackAnimation, setAttackAnimation] = useState(false);

  const toggleNode = useCallback((id: string) => {
    if (submitted) return;
    if (phase === 'path') {
      setSelectedNodes(prev =>
        prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
      );
    } else {
      setMarkedVulnerable(prev =>
        prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
      );
    }
  }, [submitted, phase]);

  const handleSubmit = () => {
    if (phase === 'path') {
      const isCorrect = CORRECT_PATH.every((id, i) => selectedNodes[i] === id) && selectedNodes.length === CORRECT_PATH.length;
      if (isCorrect) {
        setFeedback('success');
        setTimeout(() => { setFeedback(null); setPhase('vuln'); }, 1500);
      } else {
        setFeedback('error');
        setTimeout(() => setFeedback(null), 1500);
      }
    } else {
      const correctVulns = markedVulnerable.filter(n => VULNERABLE_NODES.includes(n));
      const score = Math.round((correctVulns.length / VULNERABLE_NODES.length) * 100);
      setSubmitted(true);
      setAttackAnimation(true);
      onComplete?.(score);
    }
  };

  const score = submitted
    ? Math.round((markedVulnerable.filter(n => VULNERABLE_NODES.includes(n)).length / VULNERABLE_NODES.length) * 100)
    : 0;

  return (
    <div className="relative w-full">
      <FeedbackOverlay
        type={feedback === 'success' ? 'success' : feedback === 'error' ? 'error' : null}
        message={feedback === 'success' ? 'Path Correct! Now find vulnerabilities.' : feedback === 'error' ? 'Incorrect path. Try again.' : undefined}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-xs font-display border ${
            phase === 'path' ? 'border-[#00d4ff] text-[#00d4ff] bg-[rgba(0,212,255,0.1)]' : 'border-[#ff3366] text-[#ff3366] bg-[rgba(255,51,102,0.1)]'
          }`}>
            {phase === 'path' ? 'PHASE 1: Trace Attack Path' : 'PHASE 2: Identify Vulnerable Nodes'}
          </div>
        </div>
        <ProgressTracker
          current={phase === 'path' ? (selectedNodes.length > 0 ? 1 : 0) : 2}
          total={2}
          score={score}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4">
        {/* Network Diagram */}
        <div className="relative bg-[#0a0e17] border border-[#1a2d45] rounded-xl overflow-hidden min-h-[450px]">
          {/* Animated grid background */}
          <div className="absolute inset-0 grid-bg opacity-30" />

          {/* Scanlines */}
          <div className="absolute inset-0 scanlines pointer-events-none" />

          <svg viewBox="0 0 750 450" className="w-full h-full relative z-10">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-strong">
                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {EDGES.map((edge) => {
              const from = NODES.find(n => n.id === edge.from);
              const to = NODES.find(n => n.id === edge.to);
              if (!from || !to) return null;

              const isInPath = selectedNodes.includes(edge.from) && selectedNodes.includes(edge.to) &&
                Math.abs(selectedNodes.indexOf(edge.from) - selectedNodes.indexOf(edge.to)) === 1;

              return (
                <g key={edge.id}>
                  <line
                    x1={from.x + 35}
                    y1={from.y + 25}
                    x2={to.x + 5}
                    y2={to.y + 25}
                    stroke={isInPath ? '#00ff41' : '#1a2d45'}
                    strokeWidth={isInPath ? 3 : 1.5}
                    strokeDasharray={isInPath ? '0' : '4,4'}
                    filter={isInPath ? 'url(#glow)' : undefined}
                  />
                  {isInPath && attackAnimation && (
                    <motion.circle
                      r={5}
                      fill="#ff3366"
                      filter="url(#glow)"
                      initial={{ cx: from.x + 35, cy: from.y + 25 }}
                      animate={{ cx: to.x + 5, cy: to.y + 25 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const isSelected = phase === 'path'
                ? selectedNodes.includes(node.id)
                : markedVulnerable.includes(node.id);
              const isHovered = hoveredNode === node.id;
              const isVulnTarget = phase === 'vuln' && node.vulnerable;
              const glowColor = node.glowColor || '#7da0c4';

              return (
                <motion.g
                  key={node.id}
                  onClick={() => toggleNode(node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                >
                  {/* Glow ring for vulnerable nodes */}
                  {isVulnTarget && !submitted && (
                    <motion.ellipse
                      cx={node.x + 30}
                      cy={node.y + 25}
                      rx={45}
                      ry={35}
                      fill="none"
                      stroke={glowColor}
                      strokeWidth={1}
                      opacity={0.4}
                      animate={{ rx: [45, 50, 45], ry: [35, 40, 35], opacity: [0.4, 0.2, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      filter="url(#glow)"
                    />
                  )}

                  {/* Node body */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={60}
                    height={50}
                    rx={10}
                    fill={isSelected ? glowColor : '#0d1526'}
                    stroke={isSelected ? glowColor : isHovered ? '#00d4ff' : '#1a2d45'}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                    opacity={isSelected ? 0.95 : 0.85}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />

                  {/* Icon */}
                  <foreignObject x={node.x + 20} y={node.y + 8} width={20} height={20}>
                    <div style={{ color: isSelected ? '#0a0e17' : glowColor }}>
                      {NODE_ICONS[node.type]}
                    </div>
                  </foreignObject>

                  {/* Label */}
                  <text
                    x={node.x + 30}
                    y={node.y + 38}
                    textAnchor="middle"
                    fill={isSelected ? '#0a0e17' : '#e0f2fe'}
                    fontSize="8"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                  >
                    {node.label}
                  </text>

                  {/* IP below */}
                  <text
                    x={node.x + 30}
                    y={node.y + 58}
                    textAnchor="middle"
                    fill="#4a6682"
                    fontSize="7"
                    fontFamily="JetBrains Mono"
                  >
                    {node.ip}
                  </text>

                  {/* Selection indicator */}
                  {isSelected && phase === 'path' && (
                    <motion.circle
                      cx={node.x + 55}
                      cy={node.y + 5}
                      r={8}
                      fill="#00ff41"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <text x={node.x + 55} y={node.y + 9} textAnchor="middle" fill="#0a0e17" fontSize="9" fontWeight="bold">
                        {selectedNodes.indexOf(node.id) + 1}
                      </text>
                    </motion.circle>
                  )}

                  {/* Skull for marked vulnerable */}
                  {isSelected && phase === 'vuln' && (
                    <motion.foreignObject
                      x={node.x + 50}
                      y={node.y - 5}
                      width={16}
                      height={16}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Skull size={16} className="text-[#ff3366]" />
                    </motion.foreignObject>
                  )}

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      <rect
                        x={node.x - 10}
                        y={node.y - 55}
                        width={140}
                        height={45}
                        rx={6}
                        fill="#0d1526"
                        stroke="#1a2d45"
                        strokeWidth={1}
                      />
                      <text x={node.x + 60} y={node.y - 38} textAnchor="middle" fill="#e0f2fe" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono">
                        {node.label}
                      </text>
                      <text x={node.x + 60} y={node.y - 26} textAnchor="middle" fill="#7da0c4" fontSize="8" fontFamily="JetBrains Mono">
                        {node.type.toUpperCase()} | {node.ip}
                      </text>
                      {node.vulnerable && (
                        <text x={node.x + 60} y={node.y - 14} textAnchor="middle" fill="#ff3366" fontSize="8" fontFamily="JetBrains Mono">
                          <tspan fill="#ff3366">&#9888; POTENTIALLY VULNERABLE</tspan>
                        </text>
                      )}
                    </g>
                  )}
                </motion.g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-[#0d1526]/90 border border-[#1a2d45] rounded-lg p-2 text-xs backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                ['cloud', '#7da0c4'],
                ['firewall', '#00d4ff'],
                ['router', '#ffaa00'],
                ['server', '#ff3366'],
                ['database', '#a855f7'],
                ['workstation', '#00ff41'],
              ].map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-[#7da0c4] capitalize text-[10px] font-display">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <h4 className="font-display font-semibold text-sm text-[#e0f2fe] mb-2">
              {phase === 'path' ? 'Mission: Trace Attack Path' : 'Mission: Identify Vulnerabilities'}
            </h4>
            <p className="text-body-sm text-[#7da0c4]">
              {phase === 'path'
                ? 'Click nodes in order to trace the path from Internet to the vulnerable web server in the DMZ.'
                : 'Click on all nodes that represent potentially vulnerable systems (outdated services, weak configs).'}
            </p>
          </div>

          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <p className="text-caption text-[#7da0c4] mb-2">
              {phase === 'path' ? 'Selected Path:' : 'Marked Vulnerable:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(phase === 'path' ? selectedNodes : markedVulnerable).length === 0 ? (
                <span className="text-caption text-[#4a6682]">
                  {phase === 'path' ? 'Click nodes to build path...' : 'Click nodes to mark...'}
                </span>
              ) : (
                (phase === 'path' ? selectedNodes : markedVulnerable).map((id, i) => {
                  const node = NODES.find(n => n.id === id);
                  return (
                    <motion.span
                      key={id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-2 py-1 bg-[#111d2e] border border-[#00d4ff] rounded text-xs text-[#00d4ff] font-display"
                    >
                      {phase === 'path' && i > 0 && <span className="text-[#4a6682] mr-1">&#8594;</span>}
                      {node?.label}
                    </motion.span>
                  );
                })
              )}
            </div>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-4 ${
                score >= 70
                  ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]'
                  : 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {score >= 70 ? (
                  <><CheckCircle size={18} className="text-[#00ff41]" /><span className="text-[#00ff41] font-display font-bold text-sm">Complete!</span></>
                ) : (
                  <><AlertTriangle size={18} className="text-[#ffaa00]" /><span className="text-[#ffaa00] font-display font-bold text-sm">{score}% - Review Needed</span></>
                )}
              </div>
              <p className="text-caption text-[#7da0c4]">
                Vulnerable nodes: {VULNERABLE_NODES.map(id => NODES.find(n => n.id === id)?.label).join(', ')}
              </p>
            </motion.div>
          )}

          <button
            onClick={handleSubmit}
            disabled={phase === 'path' ? selectedNodes.length === 0 : markedVulnerable.length === 0}
            className="w-full px-4 py-2.5 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm font-display uppercase hover:bg-[#00ff41] hover:text-[#0a0e17] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {phase === 'path' ? 'Submit Path' : 'Submit Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}
