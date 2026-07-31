import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, CheckCircle, XCircle, ChevronRight, Settings, Monitor } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const vlanConfigMetadata: PBQMetadata = {
  id: 'vlan-config',
  title: 'VLAN Configuration Lab',
  description: 'Configure VLANs on a managed switch by assigning ports, configuring trunk links, and setting native VLANs for network segmentation.',
  difficulty: 3,
  category: 'Network+',
  tags: ['vlan', 'switch', 'trunking', '802.1q'],
  xpReward: 55,
  estimatedTime: '12 min',
};

interface SwitchPort {
  id: number;
  label: string;
  vlan: number | null;
  mode: 'access' | 'trunk' | 'unset';
}

interface VlanTask {
  id: number;
  title: string;
  description: string;
  initialPorts: SwitchPort[];
  expectedConfig: { portId: number; vlan: number; mode: 'access' | 'trunk' }[];
  vlans: { id: number; name: string; color: string }[];
  nativeVlan?: number;
}

const TASKS: VlanTask[] = [
  {
    id: 1, title: 'Basic VLAN Assignment', description: 'Assign ports 1-4 to VLAN 10 (Sales) and ports 5-8 to VLAN 20 (Engineering).',
    initialPorts: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Fa0/${i + 1}`, vlan: null, mode: 'unset' as const })),
    expectedConfig: [
      { portId: 1, vlan: 10, mode: 'access' }, { portId: 2, vlan: 10, mode: 'access' },
      { portId: 3, vlan: 10, mode: 'access' }, { portId: 4, vlan: 10, mode: 'access' },
      { portId: 5, vlan: 20, mode: 'access' }, { portId: 6, vlan: 20, mode: 'access' },
      { portId: 7, vlan: 20, mode: 'access' }, { portId: 8, vlan: 20, mode: 'access' },
    ],
    vlans: [{ id: 10, name: 'Sales', color: '#00d4ff' }, { id: 20, name: 'Engineering', color: '#00ff41' }],
  },
  {
    id: 2, title: 'Trunk Port Setup', description: 'Set ports 1-3 to VLAN 10, ports 4-6 to VLAN 30, and configure port 8 as a trunk.',
    initialPorts: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Fa0/${i + 1}`, vlan: null, mode: 'unset' as const })),
    expectedConfig: [
      { portId: 1, vlan: 10, mode: 'access' }, { portId: 2, vlan: 10, mode: 'access' },
      { portId: 3, vlan: 10, mode: 'access' }, { portId: 4, vlan: 30, mode: 'access' },
      { portId: 5, vlan: 30, mode: 'access' }, { portId: 6, vlan: 30, mode: 'access' },
      { portId: 8, vlan: 0, mode: 'trunk' },
    ],
    vlans: [{ id: 10, name: 'Sales', color: '#00d4ff' }, { id: 30, name: 'Management', color: '#ffaa00' }],
  },
  {
    id: 3, title: 'Three-VLAN Office', description: 'Segment: ports 1-2 VLAN 10, ports 3-4 VLAN 20, ports 5-6 VLAN 30. Port 7 is a trunk.',
    initialPorts: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Fa0/${i + 1}`, vlan: null, mode: 'unset' as const })),
    expectedConfig: [
      { portId: 1, vlan: 10, mode: 'access' }, { portId: 2, vlan: 10, mode: 'access' },
      { portId: 3, vlan: 20, mode: 'access' }, { portId: 4, vlan: 20, mode: 'access' },
      { portId: 5, vlan: 30, mode: 'access' }, { portId: 6, vlan: 30, mode: 'access' },
      { portId: 7, vlan: 0, mode: 'trunk' },
    ],
    vlans: [{ id: 10, name: 'HR', color: '#00d4ff' }, { id: 20, name: 'Finance', color: '#00ff41' }, { id: 30, name: 'IT', color: '#ffaa00' }],
  },
  {
    id: 4, title: 'Native VLAN Configuration', description: 'Set ports 1-4 to VLAN 10, port 7 as trunk with native VLAN 99. Port 8 as trunk.',
    initialPorts: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Fa0/${i + 1}`, vlan: null, mode: 'unset' as const })),
    expectedConfig: [
      { portId: 1, vlan: 10, mode: 'access' }, { portId: 2, vlan: 10, mode: 'access' },
      { portId: 3, vlan: 10, mode: 'access' }, { portId: 4, vlan: 10, mode: 'access' },
      { portId: 7, vlan: 99, mode: 'trunk' }, { portId: 8, vlan: 0, mode: 'trunk' },
    ],
    vlans: [{ id: 10, name: 'Data', color: '#00d4ff' }, { id: 99, name: 'Native', color: '#a855f7' }],
    nativeVlan: 99,
  },
  {
    id: 5, title: 'Full Segmentation', description: 'Create 4 VLANs across 8 ports: 1-2 VLAN 10, 3-4 VLAN 20, 5 VLAN 30, 6 VLAN 40. Ports 7-8 trunks.',
    initialPorts: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, label: `Fa0/${i + 1}`, vlan: null, mode: 'unset' as const })),
    expectedConfig: [
      { portId: 1, vlan: 10, mode: 'access' }, { portId: 2, vlan: 10, mode: 'access' },
      { portId: 3, vlan: 20, mode: 'access' }, { portId: 4, vlan: 20, mode: 'access' },
      { portId: 5, vlan: 30, mode: 'access' }, { portId: 6, vlan: 40, mode: 'access' },
      { portId: 7, vlan: 0, mode: 'trunk' }, { portId: 8, vlan: 0, mode: 'trunk' },
    ],
    vlans: [
      { id: 10, name: 'Sales', color: '#00d4ff' }, { id: 20, name: 'Eng', color: '#00ff41' },
      { id: 30, name: 'Mgmt', color: '#ffaa00' }, { id: 40, name: 'Guest', color: '#ff3366' },
    ],
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function VLANConfigPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [ports, setPorts] = useState<SwitchPort[]>(TASKS[0].initialPorts.map(p => ({ ...p })));
  const [selectedVlan, setSelectedVlan] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<'access' | 'trunk'>('access');
  const [checked, setChecked] = useState(false);
  const [stepScores, setStepScores] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [portResults, setPortResults] = useState<Record<number, boolean>>({});

  const task = TASKS[currentStep];
  const isLastStep = currentStep === TASKS.length - 1;
  const isComplete = isLastStep && checked;

  const assignPort = useCallback((portId: number) => {
    if (checked) return;
    if (selectedMode === 'trunk') {
      setPorts(prev => prev.map(p =>
        p.id === portId ? { ...p, mode: 'trunk', vlan: task.nativeVlan || 0 } : p
      ));
    } else if (selectedVlan !== null) {
      setPorts(prev => prev.map(p =>
        p.id === portId ? { ...p, vlan: selectedVlan, mode: 'access' } : p
      ));
    }
  }, [checked, selectedVlan, selectedMode, task.nativeVlan]);

  const clearPort = useCallback((portId: number) => {
    if (checked) return;
    setPorts(prev => prev.map(p =>
      p.id === portId ? { ...p, vlan: null, mode: 'unset' } : p
    ));
  }, [checked]);

  const checkConfig = useCallback(() => {
    let correct = 0;
    const results: Record<number, boolean> = {};

    task.expectedConfig.forEach(expected => {
      const port = ports.find(p => p.id === expected.portId);
      const isCorrect = port !== undefined && port.mode === expected.mode &&
        (expected.mode === 'trunk' ? port.vlan === expected.vlan : port.vlan === expected.vlan);
      results[expected.portId] = isCorrect;
      if (isCorrect) correct++;
    });

    setPortResults(results);
    const stepScore = Math.round((correct / task.expectedConfig.length) * 100);
    setStepScores(prev => [...prev, stepScore]);
    setStreak(stepScore === 100 ? streak + 1 : 0);
    setChecked(true);

    if (isLastStep) {
      const allScores = [...stepScores, stepScore];
      const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      onComplete?.(finalScore);
    }
  }, [task, ports, isLastStep, stepScores, streak, onComplete]);

  const nextTask = useCallback(() => {
    const nextIdx = currentStep + 1;
    setCurrentStep(nextIdx);
    setPorts(TASKS[nextIdx].initialPorts.map(p => ({ ...p })));
    setSelectedVlan(null);
    setSelectedMode('access');
    setChecked(false);
    setPortResults({});
  }, [currentStep]);

  const getVlanColor = (vlanId: number | null): string => {
    if (vlanId === null) return '#1a2d45';
    const vlan = task.vlans.find(v => v.id === vlanId);
    return vlan?.color || '#7da0c4';
  };

  const totalScore = stepScores.length > 0
    ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">VLAN Configuration</span>
        </div>
        <ProgressTracker current={currentStep + (checked ? 1 : 0)} total={TASKS.length} score={totalScore} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {/* Task Info */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <span className="text-xs text-[#00d4ff] font-display">TASK {task.id}/{TASKS.length}: {task.title}</span>
            <p className="text-sm text-[#c8dce8] mt-1">{task.description}</p>
            {task.nativeVlan && (
              <p className="text-[10px] text-[#a855f7] mt-1 font-mono">Native VLAN: {task.nativeVlan}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-4">
            {/* Switch Visual */}
            <div className="bg-[#0a1628] border border-[#1a2d45] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings size={14} className="text-[#7da0c4]" />
                <span className="text-xs text-[#7da0c4] font-display">MANAGED SWITCH - 8 PORT</span>
              </div>

              <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
                <div className="grid grid-cols-4 gap-3">
                  {ports.map(port => {
                    const result = portResults[port.id];
                    const borderColor = checked && result !== undefined
                      ? result ? '#00ff41' : '#ff3366'
                      : port.mode !== 'unset' ? getVlanColor(port.vlan) : '#1a2d45';

                    return (
                      <motion.div
                        key={port.id}
                        whileHover={!checked ? { scale: 1.05 } : {}}
                        whileTap={!checked ? { scale: 0.95 } : {}}
                        className="relative"
                      >
                        <button
                          onClick={() => assignPort(port.id)}
                          onContextMenu={e => { e.preventDefault(); clearPort(port.id); }}
                          disabled={checked}
                          className={`w-full aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                            checked ? 'cursor-default' : 'cursor-pointer hover:brightness-110'
                          }`}
                          style={{
                            borderColor,
                            backgroundColor: port.mode !== 'unset'
                              ? `${getVlanColor(port.vlan)}15`
                              : '#111d2e',
                          }}
                        >
                          <Monitor size={16} style={{ color: port.mode !== 'unset' ? getVlanColor(port.vlan) : '#4a6682' }} />
                          <span className="text-[10px] font-mono text-[#c8dce8]">{port.label}</span>
                          {port.mode === 'trunk' ? (
                            <span className="text-[8px] font-display text-[#a855f7] uppercase">trunk</span>
                          ) : port.vlan !== null ? (
                            <span className="text-[8px] font-display" style={{ color: getVlanColor(port.vlan) }}>
                              VLAN {port.vlan}
                            </span>
                          ) : (
                            <span className="text-[8px] text-[#4a6682]">unset</span>
                          )}
                        </button>
                        {checked && result !== undefined && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1">
                            {result ? <CheckCircle size={14} className="text-[#00ff41]" /> : <XCircle size={14} className="text-[#ff3366]" />}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#4a6682] mt-3 text-center">Click to assign | Right-click to clear</p>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              {/* Mode Select */}
              <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
                <p className="text-[10px] text-[#4a6682] font-display mb-2">PORT MODE</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['access', 'trunk'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => { setSelectedMode(mode); if (mode === 'trunk') setSelectedVlan(null); }}
                      disabled={checked}
                      className={`px-3 py-2 rounded-lg border text-xs font-display uppercase transition-all ${
                        selectedMode === mode
                          ? 'border-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]'
                          : 'border-[#1a2d45] text-[#7da0c4] hover:border-[#00d4ff]'
                      } disabled:opacity-50`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* VLAN Select */}
              {selectedMode === 'access' && (
                <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
                  <p className="text-[10px] text-[#4a6682] font-display mb-2">SELECT VLAN</p>
                  <div className="space-y-1.5">
                    {task.vlans.map(vlan => (
                      <button
                        key={vlan.id}
                        onClick={() => setSelectedVlan(vlan.id)}
                        disabled={checked}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-display transition-all ${
                          selectedVlan === vlan.id
                            ? `border-[${vlan.color}] bg-[${vlan.color}10]`
                            : 'border-[#1a2d45] hover:border-[#00d4ff]'
                        } disabled:opacity-50`}
                        style={{
                          borderColor: selectedVlan === vlan.id ? vlan.color : undefined,
                          backgroundColor: selectedVlan === vlan.id ? `${vlan.color}15` : undefined,
                        }}
                      >
                        <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: vlan.color }} />
                        <span style={{ color: selectedVlan === vlan.id ? vlan.color : '#c8dce8' }}>
                          VLAN {vlan.id} - {vlan.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Config Summary */}
              <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl p-3 font-mono text-[10px] max-h-[120px] overflow-y-auto">
                <p className="text-[#4a6682] mb-1"># Running Config</p>
                {ports.filter(p => p.mode !== 'unset').map(p => (
                  <div key={p.id} className="text-[#c8dce8]">
                    <span className="text-[#00d4ff]">interface</span> {p.label}
                    {p.mode === 'trunk' ? (
                      <><br /> <span className="text-[#ffaa00]">switchport mode</span> trunk
                        {p.vlan ? <><br /> <span className="text-[#a855f7]">switchport trunk native</span> vlan {p.vlan}</> : null}
                      </>
                    ) : (
                      <><br /> <span className="text-[#ffaa00]">switchport mode</span> access
                        <br /> <span className="text-[#00ff41]">switchport access</span> vlan {p.vlan}
                      </>
                    )}
                  </div>
                ))}
                {ports.every(p => p.mode === 'unset') && <p className="text-[#4a6682]">No configuration yet...</p>}
              </div>

              {/* Actions */}
              {!checked ? (
                <button
                  onClick={checkConfig}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm font-display uppercase hover:bg-[#00ff41] hover:text-[#0a1628] transition-all"
                >
                  Verify Config <CheckCircle size={14} />
                </button>
              ) : !isLastStep ? (
                <button
                  onClick={nextTask}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm font-display uppercase hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all"
                >
                  Next Task <ChevronRight size={14} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Final Results */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 border rounded-xl p-5 ${totalScore >= 80 ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Layers size={18} className={totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'} />
                <span className={`font-display font-bold text-sm ${totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'}`}>
                  VLAN Lab Complete: {totalScore}%
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {stepScores.map((s, i) => (
                  <div key={i} className={`px-2 py-1 rounded text-[10px] font-display border ${
                    s === 100 ? 'border-[#00ff41] text-[#00ff41]' : s >= 50 ? 'border-[#ffaa00] text-[#ffaa00]' : 'border-[#ff3366] text-[#ff3366]'
                  }`}>
                    Task {i + 1}: {s}%
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
