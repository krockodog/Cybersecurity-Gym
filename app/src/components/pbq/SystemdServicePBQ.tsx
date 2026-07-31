import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, CheckCircle, XCircle, Terminal, ChevronRight, RotateCcw } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const systemdServiceMetadata: PBQMetadata = {
  id: 'systemd-service',
  title: 'Systemd Service Manager',
  description: 'Manage systemd services, unit files, targets, timers, and use journalctl for log analysis in Linux environments.',
  difficulty: 3,
  category: 'Linux+',
  tags: ['systemd', 'systemctl', 'services', 'journalctl', 'timers'],
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
    id: 'service-status',
    title: 'Diagnose a Failed Service',
    prompt: 'The nginx web server is not responding. Determine the current status and identify why the service failed to start.',
    terminalOutput: '$ curl http://localhost\ncurl: (7) Failed to connect to localhost port 80: Connection refused\n\n$ ps aux | grep nginx\nroot      1234  0.0  0.0   6300   740 pts/0  S+   grep --color=auto nginx',
    options: [
      { id: 'a', label: 'systemctl status nginx', command: 'systemctl status nginx.service' },
      { id: 'b', label: 'service nginx status', command: 'service nginx status' },
      { id: 'c', label: 'nginx -t', command: 'nginx -t' },
      { id: 'd', label: 'cat /var/log/nginx/error.log', command: 'cat /var/log/nginx/error.log' },
    ],
    correctId: 'a',
    explanation: 'systemctl status provides the service state, loaded unit file, active status, PID, memory usage, and recent journal entries -- the most comprehensive diagnostic view.',
  },
  {
    id: 'enable-service',
    title: 'Enable Service at Boot',
    prompt: 'PostgreSQL has been installed but does not start automatically after reboot. Configure it to start on every boot and start it now.',
    terminalOutput: '$ systemctl is-enabled postgresql\ndisabled\n\n$ systemctl is-active postgresql\ninactive',
    options: [
      { id: 'a', label: 'systemctl start postgresql', command: 'systemctl start postgresql' },
      { id: 'b', label: 'systemctl enable --now postgresql', command: 'systemctl enable --now postgresql' },
      { id: 'c', label: 'systemctl enable postgresql', command: 'systemctl enable postgresql' },
      { id: 'd', label: 'chkconfig postgresql on', command: 'chkconfig postgresql on' },
    ],
    correctId: 'b',
    explanation: 'systemctl enable --now both enables the service for automatic start at boot (creates symlinks in the target wants directory) and starts it immediately in a single command.',
  },
  {
    id: 'unit-file',
    title: 'Create a Custom Service Unit',
    prompt: 'You need to create a unit file for a custom Python app that should restart on failure and run as the "appuser" user. Which section contains the restart policy?',
    terminalOutput: '$ cat /etc/systemd/system/myapp.service\n[Unit]\nDescription=My Custom App\nAfter=network.target\n\n[Service]\nType=simple\nUser=appuser\nExecStart=/usr/bin/python3 /opt/myapp/main.py\n???=on-failure\nRestartSec=5\n\n[Install]\nWantedBy=multi-user.target',
    options: [
      { id: 'a', label: 'Restart=on-failure in [Service]', command: 'Restart=on-failure  # in [Service] section' },
      { id: 'b', label: 'RestartPolicy=always in [Unit]', command: 'RestartPolicy=always  # in [Unit] section' },
      { id: 'c', label: 'AutoRestart=true in [Install]', command: 'AutoRestart=true  # in [Install] section' },
      { id: 'd', label: 'OnFailure=restart in [Unit]', command: 'OnFailure=restart  # in [Unit] section' },
    ],
    correctId: 'a',
    explanation: 'The Restart= directive in the [Service] section controls restart behavior. "on-failure" restarts only on non-zero exit codes, signals, or timeouts -- not on clean stops.',
  },
  {
    id: 'timer-unit',
    title: 'Configure a Systemd Timer',
    prompt: 'Replace a cron job with a systemd timer that runs a backup script every day at 2:00 AM. Which OnCalendar value is correct?',
    terminalOutput: '$ cat /etc/systemd/system/backup.timer\n[Unit]\nDescription=Daily backup timer\n\n[Timer]\nOnCalendar=???\nPersistent=true\n\n[Install]\nWantedBy=timers.target',
    options: [
      { id: 'a', label: '*-*-* 02:00:00', command: 'OnCalendar=*-*-* 02:00:00' },
      { id: 'b', label: 'daily 2:00', command: 'OnCalendar=daily 2:00' },
      { id: 'c', label: '0 2 * * *', command: 'OnCalendar=0 2 * * *' },
      { id: 'd', label: '02:00:00 daily', command: 'OnCalendar=02:00:00 daily' },
    ],
    correctId: 'a',
    explanation: 'Systemd calendar events use the format "DayOfWeek Year-Month-Day Hour:Minute:Second". Wildcards (*) match any value. *-*-* 02:00:00 means every day at 2 AM.',
  },
  {
    id: 'journalctl',
    title: 'Analyze Service Logs',
    prompt: 'An application crashed sometime in the last hour. Which journalctl command shows only error-level messages from that service in the last 60 minutes?',
    terminalOutput: '$ systemctl status myapp\n  Active: failed (Result: exit-code) since Thu 2025-01-09 14:32:01 UTC\n  Process: 5678 ExecStart=/usr/bin/python3 /opt/myapp/main.py (code=exited, status=1)\n  Main PID: 5678 (code=exited, status=1/FAILURE)',
    options: [
      { id: 'a', label: 'journalctl -u myapp --since "1 hour ago" -p err', command: 'journalctl -u myapp --since "1 hour ago" -p err' },
      { id: 'b', label: 'journalctl myapp --last 1h', command: 'journalctl myapp --last 1h' },
      { id: 'c', label: 'journalctl -f -u myapp', command: 'journalctl -f -u myapp' },
      { id: 'd', label: 'cat /var/log/myapp.log | tail -100', command: 'cat /var/log/myapp.log | tail -100' },
    ],
    correctId: 'a',
    explanation: 'journalctl -u filters by unit name, --since restricts to a time window, and -p err shows only messages at error priority and above. This is the most precise query.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function SystemdServicePBQ({ onComplete }: Props) {
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
          <Settings size={16} className="text-[#ff9500]" />
          <span className="text-sm text-[#7da0c4] font-semibold">Systemd Service Management</span>
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
