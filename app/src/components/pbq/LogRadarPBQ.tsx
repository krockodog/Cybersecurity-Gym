import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flag, Search, Zap, ShieldAlert, Clock } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const logRadarMetadata: PBQMetadata = {
  id: 'log-radar',
  title: 'Log Analysis Radar',
  description: 'Analyze streaming log entries to detect attack patterns. Flag suspicious entries and correlate events on the timeline radar.',
  difficulty: 4,
  category: 'Security+',
  tags: ['logs', 'siem', 'threat-detection'],
  xpReward: 55,
  estimatedTime: '10 min',
};

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  event: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  suspicious: boolean;
  flagged: boolean;
  attackType?: string;
}

const LOG_ENTRIES: LogEntry[] = [
  { id: 'l1', timestamp: '2024-01-15 09:00:01', source: '192.168.1.100', event: 'Failed login attempt for user admin (attempt 1/3)', level: 'WARN', suspicious: false, flagged: false },
  { id: 'l2', timestamp: '2024-01-15 09:00:15', source: '192.168.1.100', event: 'Failed login attempt for user admin (attempt 2/3)', level: 'WARN', suspicious: false, flagged: false },
  { id: 'l3', timestamp: '2024-01-15 09:00:29', source: '192.168.1.100', event: 'Failed login attempt for user admin (attempt 3/3) - Account locked', level: 'ERROR', suspicious: true, flagged: false, attackType: 'Brute Force' },
  { id: 'l4', timestamp: '2024-01-15 09:01:05', source: '192.168.1.101', event: 'User jsmith logged in successfully from 203.0.113.45', level: 'INFO', suspicious: false, flagged: false },
  { id: 'l5', timestamp: '2024-01-15 09:02:12', source: '10.0.0.25', event: 'Port scan detected: 1000 ports scanned from 192.168.1.105', level: 'CRITICAL', suspicious: true, flagged: false, attackType: 'Port Scan' },
  { id: 'l6', timestamp: '2024-01-15 09:02:30', source: 'web-server', event: 'GET /admin/config.php HTTP/1.1 404 Not Found', level: 'INFO', suspicious: false, flagged: false },
  { id: 'l7', timestamp: '2024-01-15 09:03:45', source: 'web-server', event: 'GET /../../../etc/passwd HTTP/1.1 200 OK', level: 'ERROR', suspicious: true, flagged: false, attackType: 'Path Traversal' },
  { id: 'l8', timestamp: '2024-01-15 09:04:02', source: '192.168.1.105', event: 'SQL injection attempt detected in POST /login: \' OR 1=1 --', level: 'CRITICAL', suspicious: true, flagged: false, attackType: 'SQL Injection' },
  { id: 'l9', timestamp: '2024-01-15 09:05:18', source: 'firewall', event: 'Blocked connection from 185.220.101.33 to 10.0.0.50:22', level: 'WARN', suspicious: true, flagged: false, attackType: 'Intrusion Attempt' },
  { id: 'l10', timestamp: '2024-01-15 09:06:33', source: '192.168.1.102', event: 'Scheduled backup completed successfully', level: 'INFO', suspicious: false, flagged: false },
  { id: 'l11', timestamp: '2024-01-15 09:07:11', source: 'auth-service', event: 'Multiple auth failures from 192.168.1.100 across 5 accounts', level: 'ERROR', suspicious: true, flagged: false, attackType: 'Password Spray' },
  { id: 'l12', timestamp: '2024-01-15 09:08:44', source: 'web-server', event: 'GET /api/users?id=1 AND 1=1 HTTP/1.1 200 OK', level: 'WARN', suspicious: true, flagged: false, attackType: 'SQL Injection' },
];

const LEVEL_COLORS: Record<string, string> = {
  INFO: '#7da0c4',
  WARN: '#ffaa00',
  ERROR: '#ff3366',
  CRITICAL: '#ff3366',
};

interface Props {
  onComplete?: (score: number) => void;
}

export default function LogRadarPBQ({ onComplete }: Props) {
  const [logs, setLogs] = useState<LogEntry[]>(LOG_ENTRIES);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [streamIndex, setStreamIndex] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<number>(6);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Stream logs in gradually
  useEffect(() => {
    if (streamIndex < LOG_ENTRIES.length) {
      const timer = setTimeout(() => {
        setStreamIndex(prev => prev + 1);
        setVisibleLogs(prev => Math.min(prev + 1, LOG_ENTRIES.length));
      }, 300 + Math.random() * 400);
      return () => clearTimeout(timer);
    }
  }, [streamIndex]);

  const toggleFlag = useCallback((id: string) => {
    if (completed) return;

    setLogs(prev => prev.map(log => {
      if (log.id !== id) return log;
      return { ...log, flagged: !log.flagged };
    }));

    const log = logs.find(l => l.id === id);
    if (!log) return;

    const newFlagged = !log.flagged;
    const newCount = flaggedCount + (newFlagged ? 1 : -1);
    setFlaggedCount(newCount);

    const suspiciousCount = logs.filter(l => l.suspicious).length;
    const correctFlags = logs.filter(l => l.flagged && l.suspicious).length + (newFlagged && log.suspicious ? 1 : log.flagged && !newFlagged && log.suspicious ? -1 : 0);
    const newScore = Math.max(0, Math.round((correctFlags / suspiciousCount) * 100));
    setScore(newScore);

    if (newCount >= suspiciousCount) {
      setCompleted(true);
      onComplete?.(newScore);
    }
  }, [logs, flaggedCount, completed, onComplete]);

  const suspiciousLogs = logs.filter(l => l.suspicious);
  const attackGroups = suspiciousLogs.reduce((acc, log) => {
    const type = log.attackType || 'Unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#00ff41] animate-pulse" />
          <span className="text-caption text-[#7da0c4] font-display">LIVE LOG STREAM</span>
          <span className="text-[10px] text-[#4a6682] font-mono">{logs.length} entries</span>
        </div>
        <ProgressTracker current={flaggedCount} total={suspiciousLogs.length} score={score} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
        {/* Log Stream */}
        <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse" />
              <span className="text-caption text-[#7da0c4] font-display">/var/log/security.log</span>
            </div>
            <div className="flex items-center gap-1">
              <Search size={12} className="text-[#4a6682]" />
              <span className="text-[10px] text-[#4a6682] font-mono">{flaggedCount} flagged</span>
            </div>
          </div>

          {/* Log entries */}
          <div className="h-[400px] overflow-y-auto p-0 scrollbar-thin" ref={logEndRef}>
            {logs.slice(0, visibleLogs).map((log, idx) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
                onClick={() => toggleFlag(log.id)}
                className={`flex items-start gap-3 px-4 py-2 border-b border-[#1a2d45]/50 cursor-pointer transition-all hover:bg-[#111d2e] ${
                  log.flagged ? 'bg-[rgba(255,170,0,0.05)]' : ''
                }`}
              >
                {/* Timestamp */}
                <div className="flex items-center gap-1 min-w-[80px]">
                  <Clock size={10} className="text-[#4a6682]" />
                  <span className="text-[10px] text-[#4a6682] font-mono">{log.timestamp.split(' ')[1]}</span>
                </div>

                {/* Level */}
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-bold min-w-[50px] text-center"
                  style={{
                    color: LEVEL_COLORS[log.level],
                    backgroundColor: `${LEVEL_COLORS[log.level]}15`,
                  }}
                >
                  {log.level}
                </span>

                {/* Source */}
                <span className="text-[10px] text-[#00d4ff] font-mono min-w-[80px] truncate">
                  {log.source}
                </span>

                {/* Event */}
                <span className={`text-xs font-mono flex-1 truncate ${
                  log.suspicious ? 'text-[#ffaa00]' : 'text-[#e0f2fe]'
                }`}>
                  {log.event}
                </span>

                {/* Flag */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className={`flex-shrink-0 ${
                    log.flagged ? 'text-[#ffaa00]' : 'text-[#1a2d45] hover:text-[#ffaa00]'
                  }`}
                >
                  <Flag size={14} className={log.flagged ? 'fill-[#ffaa00]' : ''} />
                </motion.button>
              </motion.div>
            ))}
            <div ref={logEndRef} />

            {/* Streaming indicator */}
            {streamIndex < LOG_ENTRIES.length && (
              <div className="px-4 py-2 flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[#00ff41]"
                />
                <span className="text-[10px] text-[#4a6682] font-mono">Streaming new entries...</span>
              </div>
            )}
          </div>
        </div>

        {/* Radar Panel */}
        <div className="space-y-3">
          {/* Attack Radar */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <h4 className="text-caption text-[#7da0c4] font-display mb-3 flex items-center gap-2">
              <Zap size={12} className="text-[#ffaa00]" />
              ATTACK PATTERN RADAR
            </h4>

            {/* Radar circles */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto">
              <div className="absolute inset-0 rounded-full border border-[#1a2d45]" />
              <div className="absolute inset-[20%] rounded-full border border-[#1a2d45]" />
              <div className="absolute inset-[40%] rounded-full border border-[#1a2d45]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldAlert size={24} className="text-[#ff3366]" />
              </div>

              {/* Attack dots */}
              {Object.entries(attackGroups).map(([type, entries], i) => {
                const angle = (i / Object.keys(attackGroups).length) * 2 * Math.PI - Math.PI / 2;
                const radius = 30 + (entries.length * 8);
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={type}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.15 }}
                    className="absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      backgroundColor: entries.some(e => e.flagged) ? '#00ff41' : '#ff3366',
                      boxShadow: `0 0 10px ${entries.some(e => e.flagged) ? 'rgba(0,255,65,0.5)' : 'rgba(255,51,102,0.5)'}`,
                    }}
                    title={type}
                  />
                );
              })}
            </div>

            {/* Attack types list */}
            <div className="mt-4 space-y-1.5">
              {Object.entries(attackGroups).map(([type, entries]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${entries.every(e => e.flagged) ? 'bg-[#00ff41]' : 'bg-[#ff3366]'}`} />
                    <span className="text-[#e0f2fe] font-display">{type}</span>
                  </div>
                  <span className="text-[10px] text-[#7da0c4] font-mono">{entries.filter(e => e.flagged).length}/{entries.length} flagged</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <h4 className="text-caption text-[#7da0c4] font-display mb-2">EVENT TIMELINE</h4>
            <div className="relative">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#1a2d45]" />
              {suspiciousLogs.slice(0, 5).map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 ml-5 mb-2 relative"
                >
                  <div className={`absolute -left-[21px] w-2 h-2 rounded-full ${
                    log.flagged ? 'bg-[#ffaa00]' : 'bg-[#ff3366]'
                  }`} style={{ boxShadow: log.flagged ? '0 0 6px rgba(255,170,0,0.5)' : 'none' }} />
                  <span className="text-[10px] text-[#4a6682] font-mono">{log.timestamp.split(' ')[1]}</span>
                  <span className="text-[10px] text-[#e0f2fe]">{log.attackType}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
