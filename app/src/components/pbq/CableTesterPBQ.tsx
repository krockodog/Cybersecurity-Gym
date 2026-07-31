import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cable, CheckCircle, XCircle, ChevronRight, AlertTriangle, Zap, Plug } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const cableTesterMetadata: PBQMetadata = {
  id: 'cable-tester',
  title: 'Network Cable Tester',
  description: 'Identify cable types, connector types, and wiring standards. Troubleshoot cabling issues and select the right cable for each scenario.',
  difficulty: 2,
  category: 'Network+',
  tags: ['cabling', 'rj45', 'ethernet', 'wiring'],
  xpReward: 45,
  estimatedTime: '8 min',
};

interface CableQuestion {
  id: string;
  label: string;
  options: string[];
  correct: number;
}

interface CableChallenge {
  id: number;
  title: string;
  scenario: string;
  visual: { type: 'pinout' | 'cable' | 'connector' | 'tester'; data: string[] };
  questions: CableQuestion[];
}

const T568A_PINS = ['WG', 'G', 'WO', 'BL', 'WBL', 'O', 'WBR', 'BR'];
const T568B_PINS = ['WO', 'O', 'WG', 'BL', 'WBL', 'G', 'WBR', 'BR'];

const PIN_COLORS: Record<string, string> = {
  WG: '#90EE90', G: '#00aa00', WO: '#FFD4A0', O: '#FF8C00',
  BL: '#6495ED', WBL: '#ADD8E6', WBR: '#D2B48C', BR: '#8B4513',
};

const PIN_LABELS: Record<string, string> = {
  WG: 'W/Green', G: 'Green', WO: 'W/Orange', O: 'Orange',
  BL: 'Blue', WBL: 'W/Blue', WBR: 'W/Brown', BR: 'Brown',
};

const CHALLENGES: CableChallenge[] = [
  {
    id: 1, title: 'Cable Type Selection',
    scenario: 'A server room needs to connect a rack switch to a patch panel 50 meters away. The connection must support 10 Gbps. Which cable type should you use?',
    visual: { type: 'cable', data: ['Cat5e - 1 Gbps max', 'Cat6 - 10 Gbps up to 55m', 'Cat6a - 10 Gbps up to 100m', 'Fiber MMF - 10 Gbps 300m+'] },
    questions: [
      { id: '1a', label: 'Best copper cable for this scenario?', options: ['Cat5e', 'Cat6', 'Cat6a', 'Cat3'], correct: 2 },
      { id: '1b', label: 'Why not Cat6 for this distance?', options: ['Too expensive', '10G limited to 55m on Cat6', 'Incompatible connectors', 'Cat6 is obsolete'], correct: 1 },
      { id: '1c', label: 'What connector type does Cat6a use?', options: ['RJ-11', 'RJ-45', 'LC', 'SC'], correct: 1 },
    ],
  },
  {
    id: 2, title: 'Connector Identification',
    scenario: 'Identify the correct connector types for each networking scenario.',
    visual: { type: 'connector', data: ['RJ-45: 8P8C Ethernet', 'RJ-11: 6P2C Telephone', 'LC: Fiber Small Form', 'SC: Fiber Push-Pull'] },
    questions: [
      { id: '2a', label: 'Connecting a workstation to a wall jack?', options: ['RJ-11', 'RJ-45', 'BNC', 'F-type'], correct: 1 },
      { id: '2b', label: 'Connecting single-mode fiber to an SFP+ module?', options: ['SC', 'LC', 'RJ-45', 'ST'], correct: 1 },
      { id: '2c', label: 'A telephone line connection uses?', options: ['RJ-45', 'BNC', 'RJ-11', 'LC'], correct: 2 },
    ],
  },
  {
    id: 3, title: 'Wiring Standard Identification',
    scenario: 'Examine the pin-out diagram below and identify the wiring standard.',
    visual: { type: 'pinout', data: T568B_PINS },
    questions: [
      { id: '3a', label: 'Which wiring standard is shown?', options: ['T568A', 'T568B', 'Crossover', 'Rollover'], correct: 1 },
      { id: '3b', label: 'Which pin carries TX+ in this standard?', options: ['Pin 1', 'Pin 2', 'Pin 3', 'Pin 6'], correct: 0 },
      { id: '3c', label: 'Which standard is most common in US commercial?', options: ['T568A', 'T568B', 'Both equally', 'Neither'], correct: 1 },
    ],
  },
  {
    id: 4, title: 'Crossover vs Straight-Through',
    scenario: 'Determine whether a straight-through or crossover cable is needed for each connection.',
    visual: { type: 'cable', data: ['Switch <-> Switch: Crossover*', 'Switch <-> PC: Straight-through', 'PC <-> PC: Crossover', 'Switch <-> Router: Straight-through'] },
    questions: [
      { id: '4a', label: 'Connecting two switches without Auto-MDIX?', options: ['Straight-through', 'Crossover', 'Rollover', 'Coaxial'], correct: 1 },
      { id: '4b', label: 'A crossover cable has which pin arrangement?', options: ['T568B on both ends', 'T568A on both ends', 'T568A one end, T568B other', 'Custom pinout'], correct: 2 },
      { id: '4c', label: 'What feature eliminates need for crossover cables?', options: ['PoE', 'Auto-MDIX', 'STP', 'LACP'], correct: 1 },
    ],
  },
  {
    id: 5, title: 'Cable Troubleshooting',
    scenario: 'A cable tester shows intermittent connectivity. The tester displays the following results:',
    visual: { type: 'tester', data: ['Pin 1: PASS', 'Pin 2: PASS', 'Pin 3: FAIL - OPEN', 'Pin 4: PASS', 'Pin 5: PASS', 'Pin 6: FAIL - SHORT to Pin 3', 'Pin 7: PASS', 'Pin 8: PASS'] },
    questions: [
      { id: '5a', label: 'What is wrong with Pin 3?', options: ['Short circuit', 'Open (broken wire)', 'Reversed pair', 'Correct'], correct: 1 },
      { id: '5b', label: 'What does the Pin 6 result indicate?', options: ['Normal', 'Wire touching Pin 3 conductor', 'Open connection', 'Crossover'], correct: 1 },
      { id: '5c', label: 'Best resolution for this cable?', options: ['Re-terminate both ends', 'Replace the cable', 'Use a different port', 'Add a repeater'], correct: 0 },
    ],
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function CableTesterPBQ({ onComplete }: Props) {
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

  const renderVisual = () => {
    const { visual } = challenge;

    if (visual.type === 'pinout') {
      return (
        <div className="flex gap-1 justify-center">
          {visual.data.map((pin, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-6 h-12 rounded-sm border border-[#1a2d45]" style={{ backgroundColor: PIN_COLORS[pin] || '#444' }} />
              <span className="text-[8px] text-[#c8dce8] font-mono">{i + 1}</span>
              <span className="text-[7px] font-mono" style={{ color: PIN_COLORS[pin] }}>{PIN_LABELS[pin]}</span>
            </motion.div>
          ))}
        </div>
      );
    }

    if (visual.type === 'tester') {
      return (
        <div className="space-y-1">
          {visual.data.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded border ${
                line.includes('PASS') ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' :
                line.includes('FAIL') ? 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]' :
                'border-[#1a2d45]'
              }`}
            >
              {line.includes('PASS') ? <CheckCircle size={10} className="text-[#00ff41]" /> : <XCircle size={10} className="text-[#ff3366]" />}
              <span className={`text-[10px] font-mono ${line.includes('PASS') ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>{line}</span>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {visual.data.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2 px-3 py-2 bg-[#111d2e] border border-[#1a2d45] rounded-lg"
          >
            <Plug size={12} className="text-[#00d4ff]" />
            <span className="text-xs text-[#c8dce8] font-mono">{line}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cable size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">Cable Tester</span>
        </div>
        <ProgressTracker current={currentStep + (checked ? 1 : 0)} total={CHALLENGES.length} score={totalScore} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {/* Challenge Header */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-display">CHALLENGE {challenge.id}/{CHALLENGES.length}: {challenge.title}</span>
            </div>
            <p className="text-sm text-[#c8dce8] mt-1">{challenge.scenario}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-4">
            {/* Visual Panel */}
            <div className="bg-[#0a1628] border border-[#1a2d45] rounded-xl p-4">
              <p className="text-[10px] text-[#4a6682] font-display mb-3">
                {challenge.visual.type === 'pinout' ? 'PIN-OUT DIAGRAM' :
                 challenge.visual.type === 'tester' ? 'CABLE TESTER RESULTS' :
                 challenge.visual.type === 'connector' ? 'CONNECTOR REFERENCE' : 'CABLE SPECIFICATIONS'}
              </p>
              {renderVisual()}
            </div>

            {/* Questions */}
            <div className="space-y-3">
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
                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, oi) => {
                        const isSel = selected === oi;
                        const isAns = checked && oi === q.correct;
                        return (
                          <button
                            key={oi}
                            onClick={() => handleSelect(q.id, oi)}
                            disabled={checked}
                            className={`text-left px-3 py-2 rounded-lg text-xs font-display border transition-all ${
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
          </div>

          {/* Actions */}
          <div className="mt-4 flex justify-end">
            {!checked ? (
              <button
                onClick={checkAnswers}
                disabled={!allAnswered}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm font-display uppercase hover:bg-[#00ff41] hover:text-[#0a1628] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Test Cable <CheckCircle size={14} />
              </button>
            ) : !isLastStep ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm font-display uppercase hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all"
              >
                Next Challenge <ChevronRight size={14} />
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
                  Cable Testing Complete: {totalScore}%
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
