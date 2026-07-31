import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, CheckCircle, XCircle, ChevronRight, Calculator, ArrowRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const subnetCalculatorMetadata: PBQMetadata = {
  id: 'subnet-calculator',
  title: 'Subnet Calculator Challenge',
  description: 'Calculate subnet masks, network addresses, broadcast addresses, and usable host ranges for increasingly complex scenarios.',
  difficulty: 3,
  category: 'Network+',
  tags: ['subnetting', 'ipv4', 'cidr', 'addressing'],
  xpReward: 55,
  estimatedTime: '12 min',
};

interface SubnetChallenge {
  id: number;
  prompt: string;
  ipAddress: string;
  cidr: number;
  questions: {
    label: string;
    answer: string;
    hint: string;
  }[];
}

const CHALLENGES: SubnetChallenge[] = [
  {
    id: 1,
    prompt: 'A small office needs a /24 network. Given the IP 192.168.1.100/24, determine:',
    ipAddress: '192.168.1.100',
    cidr: 24,
    questions: [
      { label: 'Subnet Mask', answer: '255.255.255.0', hint: '/24 = 24 bits for network' },
      { label: 'Network Address', answer: '192.168.1.0', hint: 'Zero out host bits' },
      { label: 'Broadcast Address', answer: '192.168.1.255', hint: 'All host bits set to 1' },
      { label: 'Usable Host Range', answer: '192.168.1.1-192.168.1.254', hint: 'Network+1 to Broadcast-1' },
    ],
  },
  {
    id: 2,
    prompt: 'Subnet a Class C network into /26 blocks. Given 10.0.5.67/26:',
    ipAddress: '10.0.5.67',
    cidr: 26,
    questions: [
      { label: 'Subnet Mask', answer: '255.255.255.192', hint: '/26 = 11000000 in last octet' },
      { label: 'Network Address', answer: '10.0.5.64', hint: 'Block size is 64' },
      { label: 'Broadcast Address', answer: '10.0.5.127', hint: 'Next block minus 1' },
      { label: 'Total Usable Hosts', answer: '62', hint: '2^6 - 2 = 62' },
    ],
  },
  {
    id: 3,
    prompt: 'A department needs exactly 30 hosts. Given 172.16.10.200/27:',
    ipAddress: '172.16.10.200',
    cidr: 27,
    questions: [
      { label: 'Subnet Mask', answer: '255.255.255.224', hint: '/27 = 11100000 in last octet' },
      { label: 'Network Address', answer: '172.16.10.192', hint: 'Block size is 32' },
      { label: 'Broadcast Address', answer: '172.16.10.223', hint: '192 + 32 - 1' },
      { label: 'Total Usable Hosts', answer: '30', hint: '2^5 - 2 = 30' },
    ],
  },
  {
    id: 4,
    prompt: 'A point-to-point WAN link uses a /30 subnet. Given 10.255.255.5/30:',
    ipAddress: '10.255.255.5',
    cidr: 30,
    questions: [
      { label: 'Subnet Mask', answer: '255.255.255.252', hint: '/30 = 11111100 in last octet' },
      { label: 'Network Address', answer: '10.255.255.4', hint: 'Block size is 4' },
      { label: 'Broadcast Address', answer: '10.255.255.7', hint: '4 + 4 - 1' },
      { label: 'Total Usable Hosts', answer: '2', hint: '2^2 - 2 = 2' },
    ],
  },
  {
    id: 5,
    prompt: 'A large campus needs 500+ hosts per subnet. Given 10.20.130.45/22:',
    ipAddress: '10.20.130.45',
    cidr: 22,
    questions: [
      { label: 'Subnet Mask', answer: '255.255.252.0', hint: '/22 spans into the third octet' },
      { label: 'Network Address', answer: '10.20.128.0', hint: 'Third octet: 130 AND 252 = 128' },
      { label: 'Broadcast Address', answer: '10.20.131.255', hint: '128 + 4 - 1 in third octet' },
      { label: 'Total Usable Hosts', answer: '1022', hint: '2^10 - 2 = 1022' },
    ],
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function SubnetCalculatorPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [stepScores, setStepScores] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const challenge = CHALLENGES[currentStep];
  const isLastStep = currentStep === CHALLENGES.length - 1;

  const handleAnswer = useCallback((questionIdx: number, value: string) => {
    const key = `${currentStep}-${questionIdx}`;
    setAnswers(prev => ({ ...prev, [key]: value.trim() }));
  }, [currentStep]);

  const toggleHint = useCallback((questionIdx: number) => {
    const key = `${currentStep}-${questionIdx}`;
    setShowHints(prev => ({ ...prev, [key]: !prev[key] }));
  }, [currentStep]);

  const checkAnswers = useCallback(() => {
    let correct = 0;
    const newResults: Record<string, boolean> = {};

    challenge.questions.forEach((q, idx) => {
      const key = `${currentStep}-${idx}`;
      const userAnswer = (answers[key] || '').trim().toLowerCase().replace(/\s+/g, '');
      const expected = q.answer.toLowerCase().replace(/\s+/g, '');
      const isCorrect = userAnswer === expected;
      newResults[key] = isCorrect;
      if (isCorrect) correct++;
    });

    setResults(prev => ({ ...prev, ...newResults }));
    const stepScore = Math.round((correct / challenge.questions.length) * 100);
    setStepScores(prev => [...prev, stepScore]);
    setStreak(stepScore === 100 ? streak + 1 : 0);
    setSubmitted(true);
  }, [challenge, currentStep, answers, streak]);

  const nextStep = useCallback(() => {
    if (isLastStep) {
      const allScores = [...stepScores];
      const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      setScore(finalScore);
      onComplete?.(finalScore);
    } else {
      setCurrentStep(prev => prev + 1);
      setSubmitted(false);
    }
  }, [isLastStep, stepScores, onComplete]);

  const totalScore = stepScores.length > 0
    ? Math.round(stepScores.reduce((a, b) => a + b, 0) / stepScores.length)
    : 0;

  const isComplete = isLastStep && submitted;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-[#00d4ff]" />
          <span className="text-caption text-[#7da0c4] font-display">Subnet Calculator</span>
        </div>
        <ProgressTracker
          current={currentStep + (submitted ? 1 : 0)}
          total={CHALLENGES.length}
          score={totalScore}
          streak={streak}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          {/* Challenge Header */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Network size={14} className="text-[#00d4ff]" />
              <span className="text-xs text-[#00d4ff] font-display">CHALLENGE {challenge.id} of {CHALLENGES.length}</span>
            </div>
            <p className="text-sm text-[#c8dce8]">{challenge.prompt}</p>
            <div className="mt-3 flex items-center gap-3 px-3 py-2 bg-[#0a1628] border border-[#1a2d45] rounded-lg">
              <span className="text-xs text-[#7da0c4] font-display">IP:</span>
              <span className="text-sm text-[#00ff41] font-mono">{challenge.ipAddress}/{challenge.cidr}</span>
            </div>
          </div>

          {/* Questions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {challenge.questions.map((q, idx) => {
              const key = `${currentStep}-${idx}`;
              const result = results[key];
              const hintVisible = showHints[key];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-[#0d1526] border rounded-xl p-4 transition-colors ${
                    submitted
                      ? result ? 'border-[#00ff41] bg-[rgba(0,255,65,0.03)]' : 'border-[#ff3366] bg-[rgba(255,51,102,0.03)]'
                      : 'border-[#1a2d45]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#7da0c4] font-display">{q.label}</span>
                    {submitted && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {result ? <CheckCircle size={16} className="text-[#00ff41]" /> : <XCircle size={16} className="text-[#ff3366]" />}
                      </motion.div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={answers[key] || ''}
                    onChange={e => handleAnswer(idx, e.target.value)}
                    disabled={submitted}
                    placeholder="Enter answer..."
                    className="w-full bg-[#0a1628] border border-[#1a2d45] rounded-lg px-3 py-2 text-sm text-[#c8dce8] font-mono placeholder-[#4a6682] focus:outline-none focus:border-[#00d4ff] transition-colors disabled:opacity-60"
                  />
                  {submitted && !result && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-[#ff3366] font-mono mt-1">
                      Correct: {q.answer}
                    </motion.p>
                  )}
                  {!submitted && (
                    <button
                      onClick={() => toggleHint(idx)}
                      className="text-[10px] text-[#4a6682] hover:text-[#7da0c4] mt-1 transition-colors"
                    >
                      {hintVisible ? 'Hide hint' : 'Show hint'}
                    </button>
                  )}
                  <AnimatePresence>
                    {hintVisible && !submitted && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[10px] text-[#ffaa00] mt-1"
                      >
                        {q.hint}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Subnet Visual */}
          <div className="mt-4 bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <p className="text-[10px] text-[#4a6682] font-display mb-2">BINARY REPRESENTATION</p>
            <div className="flex gap-1 flex-wrap font-mono text-[11px]">
              {challenge.ipAddress.split('.').map((octet, oi) => (
                <div key={oi} className="flex items-center gap-1">
                  {parseInt(octet).toString(2).padStart(8, '0').split('').map((bit, bi) => {
                    const bitIdx = oi * 8 + bi;
                    const isNetwork = bitIdx < challenge.cidr;
                    return (
                      <span
                        key={bi}
                        className={`w-4 h-5 flex items-center justify-center rounded-sm ${
                          isNetwork ? 'bg-[rgba(0,212,255,0.15)] text-[#00d4ff]' : 'bg-[rgba(0,255,65,0.08)] text-[#00ff41]'
                        }`}
                      >
                        {bit}
                      </span>
                    );
                  })}
                  {oi < 3 && <span className="text-[#4a6682] mx-0.5">.</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[rgba(0,212,255,0.3)] rounded-sm" /> Network ({challenge.cidr} bits)</span>
              <span className="flex items-center gap-1 text-[#7da0c4]"><span className="w-2 h-2 bg-[rgba(0,255,65,0.15)] rounded-sm" /> Host ({32 - challenge.cidr} bits)</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 flex justify-end">
            {!submitted ? (
              <button
                onClick={checkAnswers}
                disabled={challenge.questions.some((_, idx) => !(answers[`${currentStep}-${idx}`] || '').trim())}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm font-display uppercase hover:bg-[#00ff41] hover:text-[#0a1628] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Check Answers <CheckCircle size={14} />
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm font-display uppercase hover:bg-[#00d4ff] hover:text-[#0a1628] transition-all"
              >
                {isComplete ? 'View Results' : 'Next Challenge'} <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Final Results */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 border rounded-xl p-5 ${
                totalScore >= 80 ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ffaa00] bg-[rgba(255,170,0,0.05)]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} className={totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'} />
                <span className={`font-display font-bold text-sm ${totalScore >= 80 ? 'text-[#00ff41]' : 'text-[#ffaa00]'}`}>
                  Final Score: {totalScore}%
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {stepScores.map((s, i) => (
                  <div key={i} className={`px-2 py-1 rounded text-[10px] font-display border ${
                    s === 100 ? 'border-[#00ff41] text-[#00ff41]' : s >= 50 ? 'border-[#ffaa00] text-[#ffaa00]' : 'border-[#ff3366] text-[#ff3366]'
                  }`}>
                    Ch.{i + 1}: {s}%
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
