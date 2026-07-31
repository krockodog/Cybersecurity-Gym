import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Cpu, Zap, AlertTriangle, CheckCircle2, XCircle, ChevronRight, Eye } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const processManagerMetadata: PBQMetadata = {
  id: 'process-manager',
  title: 'Process Management Console',
  description: 'Manage Linux processes using ps, top, kill, nice, and job control (bg/fg). Identify runaway processes, adjust priorities, and manage jobs across five scenarios.',
  difficulty: 3,
  category: 'Linux LPI-1',
  tags: ['linux', 'processes', 'kill', 'nice', 'ps', 'top'],
  xpReward: 45,
  estimatedTime: '9 min',
};

interface ProcessEntry {
  pid: number;
  user: string;
  cpu: string;
  mem: string;
  command: string;
  state: string;
  highlight?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  processTable: ProcessEntry[];
  question: string;
  options: { label: string; correct: boolean }[];
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Kill a Runaway Process',
    icon: <AlertTriangle size={20} className="text-[#ff3366]" />,
    description: 'The server is unresponsive. A process is consuming 98% CPU. Identify and terminate it immediately.',
    processTable: [
      { pid: 1, user: 'root', cpu: '0.0', mem: '0.3', command: '/sbin/init', state: 'S' },
      { pid: 1542, user: 'www-data', cpu: '0.5', mem: '2.1', command: 'nginx: worker', state: 'S' },
      { pid: 2891, user: 'deploy', cpu: '98.2', mem: '45.3', command: 'python3 data_import.py', state: 'R', highlight: true },
      { pid: 3001, user: 'mysql', cpu: '1.2', mem: '12.5', command: '/usr/sbin/mysqld', state: 'S' },
      { pid: 3150, user: 'root', cpu: '0.1', mem: '0.8', command: '/usr/sbin/sshd', state: 'S' },
    ],
    question: 'Which command forcefully terminates the runaway process?',
    options: [
      { label: 'kill 2891', correct: false },
      { label: 'kill -9 2891', correct: true },
      { label: 'killall python3', correct: false },
      { label: 'kill -STOP 2891', correct: false },
    ],
    explanation: 'kill -9 (SIGKILL) forcefully terminates the process immediately. Plain "kill" sends SIGTERM which can be caught/ignored. killall would affect ALL python3 processes. SIGSTOP only pauses.',
  },
  {
    id: 's2', title: 'Adjust Process Priority',
    icon: <Zap size={20} className="text-[#ffaa00]" />,
    description: 'A backup process is slowing the production database. Lower the backup priority without stopping it. Current nice value is 0.',
    processTable: [
      { pid: 4210, user: 'root', cpu: '45.0', mem: '8.2', command: '/usr/bin/rsync --archive /data /backup', state: 'R', highlight: true },
      { pid: 3001, user: 'mysql', cpu: '38.5', mem: '32.1', command: '/usr/sbin/mysqld', state: 'S' },
      { pid: 1542, user: 'www-data', cpu: '12.0', mem: '4.5', command: 'nginx: worker', state: 'S' },
    ],
    question: 'Which command lowers the priority of the backup process?',
    options: [
      { label: 'nice -n 19 4210', correct: false },
      { label: 'renice 19 -p 4210', correct: true },
      { label: 'renice -19 -p 4210', correct: false },
      { label: 'nice --adjustment=19 rsync', correct: false },
    ],
    explanation: 'renice changes priority of a running process. "renice 19 -p 4210" sets nice to 19 (lowest priority). "nice" only works when starting a new process. A value of -19 would increase priority.',
  },
  {
    id: 's3', title: 'Find and Kill Zombie Processes',
    icon: <Eye size={20} className="text-[#a855f7]" />,
    description: 'System shows high process count but low CPU usage. Multiple zombie processes detected. Identify the parent and resolve.',
    processTable: [
      { pid: 5001, user: 'app', cpu: '2.0', mem: '5.0', command: '/opt/app/worker.sh', state: 'S' },
      { pid: 5010, user: 'app', cpu: '0.0', mem: '0.0', command: '[worker.sh] <defunct>', state: 'Z', highlight: true },
      { pid: 5011, user: 'app', cpu: '0.0', mem: '0.0', command: '[worker.sh] <defunct>', state: 'Z', highlight: true },
      { pid: 5012, user: 'app', cpu: '0.0', mem: '0.0', command: '[worker.sh] <defunct>', state: 'Z', highlight: true },
      { pid: 5013, user: 'app', cpu: '0.0', mem: '0.0', command: '[worker.sh] <defunct>', state: 'Z', highlight: true },
    ],
    question: 'What is the correct approach to clean up zombies?',
    options: [
      { label: 'kill -9 5010 5011 5012 5013 (kill each zombie)', correct: false },
      { label: 'Kill the parent process (PID 5001) which is not reaping children', correct: true },
      { label: 'Run sync && echo 3 > /proc/sys/vm/drop_caches', correct: false },
      { label: 'Reboot the server', correct: false },
    ],
    explanation: 'Zombies cannot be killed directly (they are already dead). The parent process (5001) is not calling wait() to reap them. Killing the parent causes init to adopt and clean up the zombies.',
  },
  {
    id: 's4', title: 'Background and Foreground Jobs',
    icon: <Activity size={20} className="text-[#00d4ff]" />,
    description: 'You started a long-running compilation in the terminal and need to run other commands. The compile is currently running in the foreground.',
    processTable: [
      { pid: 6100, user: 'dev', cpu: '85.0', mem: '12.0', command: 'make -j4 all', state: 'R', highlight: true },
    ],
    question: 'How do you suspend the process, move it to background, and verify?',
    options: [
      { label: 'Ctrl+Z, then bg, then jobs', correct: true },
      { label: 'Ctrl+C, then make -j4 all &', correct: false },
      { label: 'kill -TSTP 6100, then fg', correct: false },
      { label: 'nohup make -j4 all &', correct: false },
    ],
    explanation: 'Ctrl+Z sends SIGTSTP to suspend. "bg" resumes it in the background. "jobs" lists background jobs. Ctrl+C would terminate the compilation, losing progress.',
  },
  {
    id: 's5', title: 'Identify Resource-Heavy Processes',
    icon: <Cpu size={20} className="text-[#00ff41]" />,
    description: 'A server is running out of memory (90% used). Identify which processes to investigate first by sorting by memory usage.',
    processTable: [
      { pid: 3001, user: 'mysql', cpu: '5.2', mem: '35.1', command: '/usr/sbin/mysqld', state: 'S', highlight: true },
      { pid: 7200, user: 'java', cpu: '15.0', mem: '28.5', command: 'java -jar app.jar -Xmx2G', state: 'S', highlight: true },
      { pid: 1542, user: 'www-data', cpu: '8.0', mem: '15.2', command: 'nginx: worker', state: 'S' },
      { pid: 7500, user: 'redis', cpu: '1.0', mem: '8.3', command: 'redis-server *:6379', state: 'S' },
      { pid: 100, user: 'root', cpu: '0.0', mem: '0.1', command: '/sbin/init', state: 'S' },
    ],
    question: 'Which command lists all processes sorted by memory usage (highest first)?',
    options: [
      { label: 'ps aux --sort=-%cpu', correct: false },
      { label: 'ps aux --sort=-%mem', correct: true },
      { label: 'top -o PID', correct: false },
      { label: 'ps -ef | grep mem', correct: false },
    ],
    explanation: 'ps aux --sort=-%mem sorts all processes by memory usage in descending order. The minus sign reverses the sort. This identifies mysql (35.1%) and java (28.5%) as primary memory consumers.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function ProcessManagerPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const score = Math.round((correctCount / SCENARIOS.length) * 100);

  const handleSelect = useCallback((idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (scenario.options[idx].correct) {
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  }, [answered, scenario]);

  const handleNext = useCallback(() => {
    if (currentStep < SCENARIOS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  const stateColors: Record<string, string> = { R: '#00ff41', S: '#00d4ff', Z: '#ff3366', T: '#ffaa00' };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#fb8500]" />
          <span className="text-sm text-[#7da0c4]">Process Management</span>
        </div>
        <ProgressTracker current={currentStep + (answered ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
                <div className="flex items-center gap-2">
                  {scenario.icon}
                  <span className="text-sm font-semibold text-[#e0f2fe]">{scenario.title}</span>
                </div>
                <span className="text-xs text-[#4a6682]">{currentStep + 1}/{SCENARIOS.length}</span>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#c8dce8] mb-4">{scenario.description}</p>

                {/* Process table */}
                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg overflow-x-auto mb-4">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-[#1a2d45] text-[#7da0c4]">
                        <th className="text-left px-3 py-2">PID</th>
                        <th className="text-left px-3 py-2">USER</th>
                        <th className="text-right px-3 py-2">%CPU</th>
                        <th className="text-right px-3 py-2">%MEM</th>
                        <th className="text-center px-3 py-2">S</th>
                        <th className="text-left px-3 py-2">COMMAND</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.processTable.map((proc, i) => (
                        <motion.tr key={proc.pid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                          className={`border-b border-[#1a2d45]/30 ${proc.highlight ? 'bg-[rgba(255,170,0,0.05)]' : ''}`}>
                          <td className="px-3 py-1.5 text-[#ffaa00]">{proc.pid}</td>
                          <td className="px-3 py-1.5 text-[#00d4ff]">{proc.user}</td>
                          <td className={`px-3 py-1.5 text-right ${parseFloat(proc.cpu) > 50 ? 'text-[#ff3366]' : 'text-[#c8dce8]'}`}>{proc.cpu}</td>
                          <td className={`px-3 py-1.5 text-right ${parseFloat(proc.mem) > 30 ? 'text-[#ff3366]' : 'text-[#c8dce8]'}`}>{proc.mem}</td>
                          <td className="px-3 py-1.5 text-center" style={{ color: stateColors[proc.state] || '#c8dce8' }}>{proc.state}</td>
                          <td className="px-3 py-1.5 text-[#c8dce8] truncate max-w-[200px]">{proc.command}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-[#7da0c4] mb-3">{scenario.question}</p>
                <div className="space-y-2">
                  {scenario.options.map((opt, i) => {
                    let borderColor = '#1a2d45';
                    let bgColor = 'transparent';
                    if (answered && opt.correct) { borderColor = '#00ff41'; bgColor = 'rgba(0,255,65,0.05)'; }
                    else if (answered && selected === i && !opt.correct) { borderColor = '#ff3366'; bgColor = 'rgba(255,51,102,0.05)'; }

                    return (
                      <motion.button key={i} whileHover={!answered ? { scale: 1.01, x: 4 } : {}} whileTap={!answered ? { scale: 0.99 } : {}}
                        onClick={() => handleSelect(i)}
                        className="w-full text-left px-4 py-3 border rounded-lg text-sm transition-all flex items-center gap-3"
                        style={{ borderColor, backgroundColor: bgColor, color: '#e0f2fe' }}>
                        <span className="text-[#fb8500] font-mono">{String.fromCharCode(65 + i)}.</span>
                        <span className="flex-1 font-mono text-xs">{opt.label}</span>
                        {answered && opt.correct && <CheckCircle2 size={16} className="text-[#00ff41]" />}
                        {answered && selected === i && !opt.correct && <XCircle size={16} className="text-[#ff3366]" />}
                      </motion.button>
                    );
                  })}
                </div>

                {answered && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 border border-[#1a2d45] rounded-lg bg-[#111d2e]">
                    <p className="text-xs text-[#c8dce8]">{scenario.explanation}</p>
                  </motion.div>
                )}
              </div>
            </div>

            {answered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button onClick={handleNext} className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                  {currentStep < SCENARIOS.length - 1 ? 'Next Scenario' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <Activity size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Process Management Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} process tasks handled correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
