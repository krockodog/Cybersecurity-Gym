import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Search, AlertTriangle, Shield, Clock, CheckCircle2, XCircle, ChevronRight, Eye } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const systemLogsMetadata: PBQMetadata = {
  id: 'system-logs',
  title: 'System Log Analysis Lab',
  description: 'Analyze Linux system logs from syslog, journalctl, and auth.log. Identify security incidents, system failures, and service issues across five log analysis scenarios.',
  difficulty: 4,
  category: 'Linux LPI-1',
  tags: ['linux', 'logs', 'syslog', 'journalctl', 'auth.log', 'analysis'],
  xpReward: 55,
  estimatedTime: '10 min',
};

interface LogLine {
  timestamp: string;
  host: string;
  service: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'critical';
  important?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  logSource: string;
  description: string;
  logLines: LogLine[];
  question: string;
  options: { label: string; correct: boolean }[];
  explanation: string;
}

const LEVEL_COLORS: Record<string, string> = {
  info: '#7da0c4',
  warn: '#ffaa00',
  error: '#ff3366',
  critical: '#ff3366',
};

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'SSH Brute Force Detection',
    icon: <Shield size={20} className="text-[#ff3366]" />,
    logSource: '/var/log/auth.log',
    description: 'Review the authentication log entries and identify the security incident.',
    logLines: [
      { timestamp: 'Jul 15 03:22:01', host: 'web-01', service: 'sshd[4521]', message: 'Failed password for root from 203.0.113.42 port 49182 ssh2', level: 'warn' },
      { timestamp: 'Jul 15 03:22:03', host: 'web-01', service: 'sshd[4523]', message: 'Failed password for root from 203.0.113.42 port 49184 ssh2', level: 'warn' },
      { timestamp: 'Jul 15 03:22:05', host: 'web-01', service: 'sshd[4525]', message: 'Failed password for admin from 203.0.113.42 port 49186 ssh2', level: 'warn', important: true },
      { timestamp: 'Jul 15 03:22:06', host: 'web-01', service: 'sshd[4527]', message: 'Failed password for invalid user deploy from 203.0.113.42 port 49188 ssh2', level: 'error', important: true },
      { timestamp: 'Jul 15 03:22:08', host: 'web-01', service: 'sshd[4529]', message: 'Failed password for invalid user ubuntu from 203.0.113.42 port 49190 ssh2', level: 'error', important: true },
      { timestamp: 'Jul 15 03:22:09', host: 'web-01', service: 'sshd[4531]', message: 'pam_unix(sshd:auth): check pass; user unknown', level: 'error' },
      { timestamp: 'Jul 15 03:22:10', host: 'web-01', service: 'sshd[4533]', message: 'Accepted password for root from 203.0.113.42 port 49192 ssh2', level: 'critical', important: true },
    ],
    question: 'What type of attack is shown and what is the critical finding?',
    options: [
      { label: 'Port scan from 203.0.113.42 - no successful access', correct: false },
      { label: 'SSH brute force attack - attacker successfully authenticated as root', correct: true },
      { label: 'Denial of service attack - SSH service overloaded', correct: false },
      { label: 'Normal failed login attempts from a legitimate user', correct: false },
    ],
    explanation: 'Rapid failed attempts against multiple usernames from a single IP (203.0.113.42) is a brute force attack. The last line shows "Accepted password for root" - the attacker succeeded. Immediate incident response is needed.',
  },
  {
    id: 's2', title: 'Disk Failure Warning Signs',
    icon: <AlertTriangle size={20} className="text-[#ffaa00]" />,
    logSource: '/var/log/syslog (journalctl -u smartd)',
    description: 'Analyze system logs for storage hardware issues.',
    logLines: [
      { timestamp: 'Jul 14 14:30:01', host: 'db-01', service: 'smartd[892]', message: 'Device: /dev/sda, SMART Prefailure Attribute: 5 Reallocated_Sector_Ct changed from 100 to 98', level: 'warn', important: true },
      { timestamp: 'Jul 14 14:30:01', host: 'db-01', service: 'smartd[892]', message: 'Device: /dev/sda, SMART Usage Attribute: 197 Current_Pending_Sector changed from 0 to 12', level: 'warn', important: true },
      { timestamp: 'Jul 14 18:45:22', host: 'db-01', service: 'kernel', message: 'ata1.00: exception Emask 0x0 SAct 0x0 SErr 0x0 action 0x0', level: 'error' },
      { timestamp: 'Jul 14 18:45:22', host: 'db-01', service: 'kernel', message: 'ata1.00: BMDMA stat 0x25', level: 'error' },
      { timestamp: 'Jul 14 18:45:23', host: 'db-01', service: 'kernel', message: 'EXT4-fs error (device sda1): ext4_find_entry:1455: inode #131073: comm find: reading directory lblock 0', level: 'critical', important: true },
      { timestamp: 'Jul 14 18:45:24', host: 'db-01', service: 'kernel', message: 'Buffer I/O error on dev sda1, logical block 524288, async page read', level: 'critical', important: true },
    ],
    question: 'What do these logs indicate and what is the priority action?',
    options: [
      { label: 'Filesystem corruption from improper shutdown - run fsck', correct: false },
      { label: 'Imminent disk failure - reallocated sectors and I/O errors indicate hardware degradation, back up immediately', correct: true },
      { label: 'Driver issue - update the SATA/AHCI driver', correct: false },
      { label: 'Memory errors causing filesystem corruption - test RAM', correct: false },
    ],
    explanation: 'Increasing Reallocated_Sector_Ct and Current_Pending_Sector from SMART, combined with kernel I/O errors and filesystem read failures, indicate physical disk degradation. Backup data immediately and replace the drive.',
  },
  {
    id: 's3', title: 'Service Crash Loop Analysis',
    icon: <Clock size={20} className="text-[#00d4ff]" />,
    logSource: 'journalctl -u myapp.service',
    description: 'A production service keeps crashing and restarting. Analyze the journal logs to determine the root cause.',
    logLines: [
      { timestamp: 'Jul 15 08:00:01', host: 'app-01', service: 'systemd[1]', message: 'Started MyApp Production Service.', level: 'info' },
      { timestamp: 'Jul 15 08:00:02', host: 'app-01', service: 'myapp[3421]', message: 'Connecting to database at 10.0.1.50:5432...', level: 'info' },
      { timestamp: 'Jul 15 08:00:32', host: 'app-01', service: 'myapp[3421]', message: 'ERROR: connection to server at "10.0.1.50", port 5432 failed: Connection timed out', level: 'error', important: true },
      { timestamp: 'Jul 15 08:00:32', host: 'app-01', service: 'myapp[3421]', message: 'FATAL: could not connect to database - exiting', level: 'critical', important: true },
      { timestamp: 'Jul 15 08:00:33', host: 'app-01', service: 'systemd[1]', message: 'myapp.service: Main process exited, code=exited, status=1/FAILURE', level: 'error' },
      { timestamp: 'Jul 15 08:00:33', host: 'app-01', service: 'systemd[1]', message: 'myapp.service: Scheduled restart job, restart counter is at 5.', level: 'warn', important: true },
    ],
    question: 'What is the root cause and what should be checked first?',
    options: [
      { label: 'The myapp binary is corrupted - reinstall the application', correct: false },
      { label: 'Database connectivity - the app cannot reach PostgreSQL at 10.0.1.50:5432', correct: true },
      { label: 'Systemd configuration error - the restart policy is wrong', correct: false },
      { label: 'The app needs more memory - increase system RAM', correct: false },
    ],
    explanation: 'The app starts successfully but times out connecting to the database (30-second timeout visible in timestamps). Check: Is PostgreSQL running? Is 10.0.1.50 reachable? Is port 5432 open in the firewall?',
  },
  {
    id: 's4', title: 'Privilege Escalation Detection',
    icon: <Eye size={20} className="text-[#a855f7]" />,
    logSource: '/var/log/auth.log',
    description: 'A security audit flagged suspicious sudo activity. Review the authentication logs to identify unauthorized privilege escalation.',
    logLines: [
      { timestamp: 'Jul 15 02:15:01', host: 'web-01', service: 'sudo', message: 'www-data : user NOT in sudoers ; TTY=pts/0 ; COMMAND=/bin/bash', level: 'error', important: true },
      { timestamp: 'Jul 15 02:15:45', host: 'web-01', service: 'sudo', message: 'www-data : user NOT in sudoers ; TTY=pts/0 ; COMMAND=/usr/bin/passwd root', level: 'critical', important: true },
      { timestamp: 'Jul 15 02:16:10', host: 'web-01', service: 'su[8821]', message: 'pam_unix(su:auth): authentication failure; logname=www-data uid=33 ruser=www-data', level: 'error', important: true },
      { timestamp: 'Jul 15 02:17:33', host: 'web-01', service: 'kernel', message: 'audit: type=1400 msg=audit(1721005053.121:845): apparmor="DENIED" operation="exec" name="/tmp/.hidden/nc"', level: 'critical', important: true },
      { timestamp: 'Jul 15 02:17:55', host: 'web-01', service: 'sshd[8830]', message: 'Accepted publickey for deploy from 10.0.0.5 port 22 ssh2', level: 'info' },
    ],
    question: 'What is happening and which log entry is most alarming?',
    options: [
      { label: 'A developer accidentally ran sudo - normal user error', correct: false },
      { label: 'Web server compromise - www-data is attempting privilege escalation and running tools from /tmp', correct: true },
      { label: 'AppArmor false positive - the application needs netcat access', correct: false },
      { label: 'SSH key authentication failure - the deploy key is expired', correct: false },
    ],
    explanation: 'The www-data user (web server process) attempting sudo, trying to change root password, and executing a hidden netcat binary from /tmp indicates a web application compromise. The attacker gained code execution and is trying to escalate privileges and establish a reverse shell.',
  },
  {
    id: 's5', title: 'Out of Memory (OOM) Killer',
    icon: <Search size={20} className="text-[#ff3366]" />,
    logSource: 'journalctl -k (kernel log)',
    description: 'A production server became unresponsive. After reboot, analyze the kernel logs to determine what happened.',
    logLines: [
      { timestamp: 'Jul 14 23:45:01', host: 'app-02', service: 'kernel', message: 'java invoked oom-killer: gfp_mask=0x6200ca(GFP_HIGHUSER_MOVABLE), order=0, oom_score_adj=0', level: 'critical', important: true },
      { timestamp: 'Jul 14 23:45:01', host: 'app-02', service: 'kernel', message: 'Mem-Info: Node 0 active_anon:4028416kB inactive_anon:12288kB active_file:1024kB inactive_file:0kB', level: 'warn' },
      { timestamp: 'Jul 14 23:45:01', host: 'app-02', service: 'kernel', message: 'oom_kill_process: total-vm:8388608kB, anon-rss:3932160kB, file-rss:45056kB, shmem-rss:0kB', level: 'critical' },
      { timestamp: 'Jul 14 23:45:01', host: 'app-02', service: 'kernel', message: 'Out of memory: Killed process 2891 (java) total-vm:8388608kB, anon-rss:3932160kB', level: 'critical', important: true },
      { timestamp: 'Jul 14 23:45:02', host: 'app-02', service: 'kernel', message: 'oom_reaper: reaped process 2891 (java), now anon-rss:0kB, file-rss:0kB, shmem-rss:0kB', level: 'warn' },
      { timestamp: 'Jul 14 23:45:03', host: 'app-02', service: 'systemd[1]', message: 'myapp.service: Main process exited, code=killed, signal=KILL', level: 'error', important: true },
    ],
    question: 'What happened and what is the correct long-term fix?',
    options: [
      { label: 'Kernel bug caused a crash - update the kernel', correct: false },
      { label: 'Java app exceeded memory limits (8GB VM) and was killed by OOM killer - set proper JVM heap limits or add swap/RAM', correct: true },
      { label: 'Disk was full causing the application to crash', correct: false },
      { label: 'Network timeout caused the Java process to hang', correct: false },
    ],
    explanation: 'The OOM killer activated because the Java process consumed ~3.8GB RSS with an 8GB virtual memory footprint, exhausting available RAM. Fix: set JVM -Xmx to a reasonable limit, add swap space, or increase server RAM.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function SystemLogsPBQ({ onComplete }: Props) {
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

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#fb8500]" />
          <span className="text-sm text-[#7da0c4]">System Log Analysis</span>
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
                <p className="text-sm text-[#c8dce8] mb-2">{scenario.description}</p>
                <div className="text-xs text-[#4a6682] mb-3 font-mono">Source: {scenario.logSource}</div>

                {/* Log viewer */}
                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg overflow-hidden mb-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                    <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                    <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                    <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                    <span className="ml-2 text-[10px] text-[#4a6682] font-mono">{scenario.logSource}</span>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto p-2 space-y-0.5">
                    {scenario.logLines.map((log, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                        className={`flex items-start gap-2 px-2 py-1 rounded text-xs font-mono ${log.important ? 'bg-[rgba(255,170,0,0.05)]' : ''}`}>
                        <span className="text-[#4a6682] whitespace-nowrap flex-shrink-0">{log.timestamp}</span>
                        <span className="text-[#00d4ff] flex-shrink-0">{log.host}</span>
                        <span className="text-[#a855f7] flex-shrink-0">{log.service}:</span>
                        <span style={{ color: LEVEL_COLORS[log.level] }} className="break-all">{log.message}</span>
                        {log.important && <AlertTriangle size={12} className="text-[#ffaa00] flex-shrink-0 mt-0.5" />}
                      </motion.div>
                    ))}
                  </div>
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
                        <span className="flex-1">{opt.label}</span>
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
                  {currentStep < SCENARIOS.length - 1 ? 'Next Analysis' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <FileText size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Log Analysis Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} log scenarios analyzed correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
