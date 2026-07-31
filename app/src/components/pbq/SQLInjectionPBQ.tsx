import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Code, ShieldOff, ShieldCheck, ChevronRight, Terminal, AlertTriangle, Lock } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const sqlMetadata: PBQMetadata = {
  id: 'sql-injection',
  title: 'SQL Injection Attack Lab',
  description: 'Identify and exploit SQL injection vulnerabilities in a simulated web application. Progress through reconnaissance to full database compromise.',
  difficulty: 4,
  category: 'PenTest+',
  tags: ['sql-injection', 'web-exploitation', 'owasp'],
  xpReward: 60,
  estimatedTime: '10 min',
};

interface Step {
  id: string;
  label: string;
  description: string;
  codeSnippet: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  selectedIndex: number | null;
  completed: boolean;
}

const INITIAL_STEPS: Step[] = [
  {
    id: 'identify',
    label: 'Identify Vulnerable Parameter',
    description: 'You discover a login form at /login. The server returns different error messages for invalid usernames vs. invalid passwords. Which parameter is most likely vulnerable to SQL injection?',
    codeSnippet: `POST /login HTTP/1.1\nContent-Type: application/x-www-form-urlencoded\n\nusername=admin&password=test123\n\nResponse: "Invalid password for user admin"`,
    options: [
      'The Content-Type header',
      'The username parameter (differential error responses)',
      'The HTTP method (POST)',
      'The Host header',
    ],
    correctIndex: 1,
    explanation: 'Differential error messages reveal that the username is directly queried, indicating a potential injection point.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'inject',
    label: 'Select Injection Payload',
    description: 'The backend query is: SELECT * FROM users WHERE username=\'$input\' AND password=\'$pass\'. Which payload bypasses authentication?',
    codeSnippet: `// Server-side (vulnerable)\nconst query = \`SELECT * FROM users\n  WHERE username='\${req.body.username}'\n  AND password='\${req.body.password}'\`;`,
    options: [
      'admin; DROP TABLE users;--',
      "admin' OR '1'='1' --",
      'SELECT * FROM users',
      "admin' AND password IS NOT NULL",
    ],
    correctIndex: 1,
    explanation: "The payload closes the username string, adds a tautology (OR '1'='1'), and comments out the password check with --.",
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'bypass',
    label: 'Bypass Authentication',
    description: 'Your injection worked. You are logged in as the first user in the table. Now you need to log in specifically as the admin account. Which payload targets the admin user?',
    codeSnippet: `HTTP/1.1 200 OK\n{"status":"authenticated","user":"guest"}\n\n-- You need admin access, not guest`,
    options: [
      "' OR username='admin' --",
      "admin'--",
      "1' UNION SELECT 'admin','admin' --",
      "admin' AND '1'='1' --",
    ],
    correctIndex: 3,
    explanation: "This payload specifies the admin username directly and uses a tautology to bypass the password check while targeting only the admin row.",
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'extract',
    label: 'Extract Database Schema',
    description: 'As admin, you find a search endpoint vulnerable to UNION-based injection. The original query returns 3 columns. Which payload extracts table names?',
    codeSnippet: `GET /search?q=test\n\n-- Original query returns 3 columns:\n-- SELECT id, name, description\n--   FROM products WHERE name LIKE '%test%'`,
    options: [
      "test' UNION SELECT table_name,NULL,NULL FROM information_schema.tables --",
      'SHOW TABLES;',
      "test'; SELECT * FROM sys.tables --",
      "test' OR 1=1 LIMIT 10 --",
    ],
    correctIndex: 0,
    explanation: 'UNION SELECT with matching column count extracts table names from information_schema, the standard metadata database.',
    selectedIndex: null,
    completed: false,
  },
  {
    id: 'escalate',
    label: 'Escalate Privileges',
    description: 'You discovered a "user_roles" table with columns: user_id, role_name. Your user_id is 5. Which injection escalates your role to superadmin?',
    codeSnippet: `-- Discovered tables:\n-- users (id, username, password_hash, email)\n-- user_roles (user_id, role_name)\n-- sessions (id, user_id, token)\n\n-- Your user_id: 5, current role: "viewer"`,
    options: [
      "'; DELETE FROM user_roles WHERE user_id=5; --",
      "'; UPDATE user_roles SET role_name='superadmin' WHERE user_id=5; --",
      "'; INSERT INTO users VALUES(99,'hacker','pass','h@x.com'); --",
      "'; SELECT role_name FROM user_roles; --",
    ],
    correctIndex: 1,
    explanation: 'UPDATE modifies the existing role assignment to superadmin. DELETE would remove access, INSERT creates a new user without a role, and SELECT only reads data.',
    selectedIndex: null,
    completed: false,
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function SQLInjectionPBQ({ onComplete }: Props) {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '[*] SQL Injection Lab initialized',
    '[*] Target: https://vulnerable-app.lab/login',
    '[*] Analyze the code and select the correct approach...',
  ]);

  const addLog = useCallback((line: string) => {
    setTerminalLines(prev => [...prev.slice(-12), line]);
  }, []);

  const selectOption = useCallback((optionIndex: number) => {
    if (completed || steps[currentStep].completed || feedback !== null) return;

    const step = steps[currentStep];
    const isCorrect = optionIndex === step.correctIndex;

    setSteps(prev => prev.map((s, i) =>
      i === currentStep ? { ...s, selectedIndex: optionIndex, completed: isCorrect } : s
    ));

    if (isCorrect) {
      setFeedback('correct');
      const newScore = Math.round(((currentStep + 1) / steps.length) * 100);
      setScore(newScore);
      addLog(`[+] ${step.label}: SUCCESS`);
      addLog(`    Payload: ${step.options[optionIndex].substring(0, 50)}...`);

      if (currentStep === steps.length - 1) {
        setCompleted(true);
        addLog('[!] DATABASE FULLY COMPROMISED');
        onComplete?.(newScore);
      } else {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          setFeedback(null);
        }, 1400);
      }
    } else {
      setFeedback('wrong');
      addLog(`[-] ${step.label}: FAILED`);
      addLog(`    ${step.options[optionIndex].substring(0, 50)} -- incorrect`);
      setTimeout(() => {
        setSteps(prev => prev.map((s, i) =>
          i === currentStep ? { ...s, selectedIndex: null } : s
        ));
        setFeedback(null);
      }, 1500);
    }
  }, [steps, currentStep, completed, feedback, addLog, onComplete]);

  const completedCount = steps.filter(s => s.completed).length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[#ff3366]" />
          <span className="text-caption text-[#7da0c4] font-display">SQL Injection Attack Lab</span>
        </div>
        <ProgressTracker current={completedCount} total={steps.length} score={score} />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-5 overflow-x-auto pb-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
            <motion.div
              animate={{
                borderColor: step.completed ? '#00ff41' : i === currentStep ? '#ff3366' : '#1a2d45',
                backgroundColor: step.completed ? 'rgba(0,255,65,0.1)' : i === currentStep ? 'rgba(255,51,102,0.08)' : '#0d1526',
              }}
              className="w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer"
              onClick={() => !completed && i <= currentStep && setCurrentStep(i)}
            >
              {step.completed ? (
                <ShieldCheck size={16} className="text-[#00ff41]" />
              ) : (
                <span className={`text-xs font-mono ${i === currentStep ? 'text-[#ff3366]' : 'text-[#4a6682]'}`}>{i + 1}</span>
              )}
              <span className="text-[7px] font-display mt-0.5 text-[#7da0c4] truncate max-w-[40px]">
                {step.label.split(' ')[0]}
              </span>
            </motion.div>
            {i < steps.length - 1 && (
              <ChevronRight size={12} className={step.completed ? 'text-[#00ff41]' : 'text-[#1a2d45]'} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
        {/* Active Step Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(255,51,102,0.15)]">
                <Code size={18} className="text-[#ff3366]" />
              </div>
              <div>
                <h3 className="text-sm font-display text-[#e0f2fe]">
                  Step {currentStep + 1}: {steps[currentStep].label}
                </h3>
                <p className="text-xs text-[#7da0c4]">{steps[currentStep].description}</p>
              </div>
            </div>

            {/* Code Snippet */}
            <div className="bg-[#0a0e17] border border-[#1a2d45] rounded-lg p-3 mb-4 font-mono text-[11px] text-[#c8dce8] overflow-x-auto whitespace-pre">
              {steps[currentStep].codeSnippet}
            </div>

            {/* Options */}
            <div className="space-y-2">
              {steps[currentStep].options.map((opt, i) => {
                const step = steps[currentStep];
                const isSelected = step.selectedIndex === i;
                const isCorrect = step.correctIndex === i && step.completed;
                const isWrong = isSelected && !step.completed && feedback === 'wrong';

                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectOption(i)}
                    disabled={step.completed || feedback !== null}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      isCorrect
                        ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]'
                        : isWrong
                          ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]'
                          : 'border-[#1a2d45] hover:border-[#ff3366] bg-[#0a0e17]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#7da0c4]'}`}>
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span className={`text-sm font-mono ${isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#e0f2fe]'}`}>
                        {opt}
                      </span>
                      {isCorrect && <ShieldCheck size={14} className="text-[#00ff41] ml-auto flex-shrink-0" />}
                      {isWrong && <ShieldOff size={14} className="text-[#ff3366] ml-auto flex-shrink-0" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)]"
                >
                  <p className="text-sm text-[#00ff41] font-display">Correct!</p>
                  <p className="text-xs text-[#7da0c4] mt-1">{steps[currentStep].explanation}</p>
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)] text-center"
                >
                  <p className="text-sm text-[#ff3366] font-display">Incorrect payload. Try again.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Terminal Output */}
        <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45] flex items-center gap-2">
            <Terminal size={12} className="text-[#ff3366]" />
            <span className="text-caption text-[#7da0c4] font-display">sqlmap output</span>
          </div>
          <div className="p-3 font-mono text-[11px] h-[320px] overflow-y-auto scrollbar-thin">
            <AnimatePresence>
              {terminalLines.map((line, i) => (
                <motion.div
                  key={`${i}-${line.substring(0, 20)}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`mb-1 ${
                    line.includes('[+]') ? 'text-[#00ff41]' :
                    line.includes('[-]') ? 'text-[#ff3366]' :
                    line.includes('[!]') ? 'text-[#ffaa00] font-bold' :
                    'text-[#7da0c4]'
                  }`}
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
            {completed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 p-2 border border-[#ff3366] rounded bg-[rgba(255,51,102,0.05)]"
              >
                <p className="text-[#ff3366] font-bold">[*] FULL DATABASE ACCESS ACHIEVED</p>
                <p className="text-[#7da0c4]">Tables extracted: users, user_roles, sessions</p>
                <p className="text-[#7da0c4]">Privilege: superadmin</p>
                <p className="text-[#7da0c4]">Score: {score}%</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
