import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Play, CheckCircle2, XCircle, ChevronRight, Lightbulb } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const shellScriptMetadata: PBQMetadata = {
  id: 'shell-script',
  title: 'Shell Scripting Challenges',
  description: 'Complete five shell scripting mini-challenges covering loops, conditionals, pipes, variables, and functions. Write the missing code to make each script work.',
  difficulty: 4,
  category: 'Linux LPI-1',
  tags: ['linux', 'bash', 'scripting', 'shell', 'automation'],
  xpReward: 55,
  estimatedTime: '10 min',
};

interface Scenario {
  id: string;
  title: string;
  description: string;
  codeAbove: string;
  codeBelow: string;
  placeholder: string;
  validAnswers: string[];
  expectedOutput: string[];
  hint: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'For Loop: Batch Rename Files',
    description: 'Complete the for loop to rename all .txt files in the current directory by adding a "backup_" prefix.',
    codeAbove: '#!/bin/bash\n# Rename all .txt files with backup_ prefix',
    codeBelow: '  mv "$file" "backup_$file"\ndone\necho "Renamed $(ls backup_*.txt | wc -l) files"',
    placeholder: 'for file in ___; do',
    validAnswers: ['for file in *.txt; do', 'for file in *.txt ; do'],
    expectedOutput: ['Renamed 5 files'],
    hint: 'Use a glob pattern to match all .txt files: *.txt',
    explanation: '"for file in *.txt; do" iterates over all files matching the *.txt pattern. The shell expands the glob before the loop starts.',
  },
  {
    id: 's2', title: 'Conditional: Check Disk Space',
    description: 'Complete the if statement to check if disk usage exceeds 80% and print a warning.',
    codeAbove: '#!/bin/bash\nUSAGE=$(df / | tail -1 | awk \'{print $5}\' | tr -d \'%\')',
    codeBelow: '  echo "WARNING: Disk usage at ${USAGE}%"\nelse\n  echo "Disk OK: ${USAGE}%"\nfi',
    placeholder: 'if [ ___ ]; then',
    validAnswers: ['if [ "$USAGE" -gt 80 ]; then', 'if [ $USAGE -gt 80 ]; then', 'if [[ $USAGE -gt 80 ]]; then', 'if [[ "$USAGE" -gt 80 ]]; then'],
    expectedOutput: ['WARNING: Disk usage at 85%'],
    hint: 'Use -gt for "greater than" comparison with integers in a test bracket.',
    explanation: '[ "$USAGE" -gt 80 ] uses the -gt (greater than) integer comparison operator. Quoting the variable prevents word splitting errors.',
  },
  {
    id: 's3', title: 'Pipes: Find Large Log Files',
    description: 'Complete the pipeline to find log files larger than 100MB, sort by size (largest first), and show only the top 5.',
    codeAbove: '#!/bin/bash\n# Find large log files in /var/log',
    codeBelow: '',
    placeholder: 'find /var/log -name "*.log" -size +100M | ___ | ___',
    validAnswers: [
      'find /var/log -name "*.log" -size +100M | sort -rn | head -5',
      'find /var/log -name "*.log" -size +100M | sort -rn | head -n 5',
      'find /var/log -name "*.log" -size +100M | sort -rn | head -n5',
    ],
    expectedOutput: ['/var/log/syslog (245M)', '/var/log/kern.log (189M)', '/var/log/auth.log (156M)', '/var/log/daemon.log (134M)', '/var/log/mail.log (112M)'],
    hint: 'Use "sort -rn" for reverse numeric sort and "head -5" to limit output.',
    explanation: '"sort -rn" sorts numerically in reverse (largest first). "head -5" limits output to the first 5 results. Pipes chain commands together.',
  },
  {
    id: 's4', title: 'Variables: String Manipulation',
    description: 'Extract the filename and extension from a full path using parameter expansion (no external commands).',
    codeAbove: '#!/bin/bash\nFULLPATH="/home/user/documents/report.pdf"',
    codeBelow: 'echo "Filename: $FILENAME"\necho "Extension: $EXTENSION"',
    placeholder: 'FILENAME=${FULLPATH##*/}\nEXTENSION=___',
    validAnswers: ['FILENAME=${FULLPATH##*/}\nEXTENSION=${FULLPATH##*.}', 'FILENAME="${FULLPATH##*/}"\nEXTENSION="${FULLPATH##*.}"'],
    expectedOutput: ['Filename: report.pdf', 'Extension: pdf'],
    hint: '${var##*.} removes everything up to and including the last dot, leaving the extension.',
    explanation: '${FULLPATH##*/} removes the longest prefix matching */ (the directory path). ${FULLPATH##*.} removes everything up to the last dot, yielding the extension.',
  },
  {
    id: 's5', title: 'Functions: System Health Check',
    description: 'Complete the function that checks if a given service is running and returns the appropriate exit code.',
    codeAbove: '#!/bin/bash',
    codeBelow: '}\n\ncheck_service nginx\nif [ $? -eq 0 ]; then\n  echo "Service is running"\nelse\n  echo "Service is NOT running"\nfi',
    placeholder: 'check_service() {\n  ___\n  return $?\n',
    validAnswers: [
      'check_service() {\n  systemctl is-active --quiet "$1"\n  return $?',
      'check_service() {\n  systemctl is-active --quiet $1\n  return $?',
      'check_service() {\n  systemctl is-active -q "$1"\n  return $?',
    ],
    expectedOutput: ['Service is running'],
    hint: '"systemctl is-active --quiet" checks service status and returns 0 (running) or non-zero (not running). $1 is the first function argument.',
    explanation: '"systemctl is-active --quiet $1" silently checks if the service named in $1 is active. --quiet suppresses output; the exit code ($?) conveys the result.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ShellScriptPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const score = Math.round((correctCount / SCENARIOS.length) * 100);

  const handleSubmit = useCallback(() => {
    if (submitted || !inputValue.trim()) return;
    const normalized = inputValue.trim().replace(/\s+/g, ' ');
    const correct = scenario.validAnswers.some(ans => {
      const normAns = ans.replace(/\s+/g, ' ').trim();
      return normalized === normAns;
    });
    setIsCorrect(correct);
    setSubmitted(true);
    setShowOutput(true);
    if (correct) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [submitted, inputValue, scenario]);

  const handleNext = useCallback(() => {
    if (currentStep < SCENARIOS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setInputValue('');
      setSubmitted(false);
      setIsCorrect(false);
      setShowHint(false);
      setShowOutput(false);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Code size={16} className="text-[#fb8500]" />
          <span className="text-sm text-[#7da0c4]">Shell Scripting</span>
        </div>
        <ProgressTracker current={currentStep + (submitted ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-[#fb8500]" />
                  <span className="text-sm font-semibold text-[#e0f2fe]">{scenario.title}</span>
                </div>
                <span className="text-xs text-[#4a6682]">{currentStep + 1}/{SCENARIOS.length}</span>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#c8dce8] mb-4">{scenario.description}</p>

                {/* Code editor */}
                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg overflow-hidden mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                    <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                    <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                    <span className="ml-2 text-[10px] text-[#4a6682] font-mono">script.sh</span>
                  </div>

                  <div className="p-3 font-mono text-xs space-y-1">
                    {scenario.codeAbove.split('\n').map((line, i) => (
                      <div key={`above-${i}`} className={`${line.startsWith('#') ? 'text-[#4a6682]' : line.startsWith('#!/') ? 'text-[#a855f7]' : 'text-[#c8dce8]'}`}>{line}</div>
                    ))}

                    {/* Editable area */}
                    <div className="my-2 relative">
                      <div className="text-[10px] text-[#ffaa00] mb-1">{'// Fill in the blank:'}</div>
                      <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={submitted}
                        rows={scenario.placeholder.split('\n').length}
                        placeholder={scenario.placeholder}
                        className="w-full bg-[rgba(255,170,0,0.05)] border border-[#ffaa00] rounded p-2 text-[#00ff41] font-mono text-xs outline-none resize-none placeholder-[#4a6682]"
                        style={{ borderColor: submitted ? (isCorrect ? '#00ff41' : '#ff3366') : '#ffaa00' }} />
                    </div>

                    {scenario.codeBelow.split('\n').map((line, i) => (
                      <div key={`below-${i}`} className="text-[#c8dce8]">{line}</div>
                    ))}
                  </div>
                </div>

                {!showHint && !submitted && (
                  <button onClick={() => setShowHint(true)} className="text-xs text-[#ffaa00] hover:text-[#fb8500] transition-colors mb-3 flex items-center gap-1">
                    <Lightbulb size={12} /> Show hint
                  </button>
                )}
                {showHint && !submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 p-2 bg-[rgba(255,170,0,0.05)] border border-[#ffaa00] rounded-lg">
                    <p className="text-xs text-[#ffaa00]">{scenario.hint}</p>
                  </motion.div>
                )}

                <div className="flex items-center justify-between">
                  {!submitted && (
                    <button onClick={handleSubmit} disabled={!inputValue.trim()}
                      className="px-4 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all disabled:opacity-30 flex items-center gap-2">
                      <Play size={14} /> Run Script
                    </button>
                  )}
                </div>

                {/* Output */}
                {showOutput && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                    <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg p-3 font-mono text-xs mb-3">
                      <div className="text-[#4a6682] mb-1">$ bash script.sh</div>
                      {scenario.expectedOutput.map((line, i) => (
                        <div key={i} className={isCorrect ? 'text-[#00ff41]' : 'text-[#ff3366]'}>{line}</div>
                      ))}
                    </div>
                    <div className={`p-3 border rounded-lg ${isCorrect ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? <CheckCircle2 size={16} className="text-[#00ff41]" /> : <XCircle size={16} className="text-[#ff3366]" />}
                        <span className={`text-sm font-semibold ${isCorrect ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>{isCorrect ? 'Script passed!' : 'Script failed'}</span>
                      </div>
                      <p className="text-xs text-[#c8dce8]">{scenario.explanation}</p>
                      {!isCorrect && <p className="text-xs text-[#7da0c4] mt-1 font-mono">Expected: {scenario.validAnswers[0]}</p>}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {submitted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button onClick={handleNext} className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                  {currentStep < SCENARIOS.length - 1 ? 'Next Challenge' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <Code size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Shell Scripting Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} scripts completed correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
