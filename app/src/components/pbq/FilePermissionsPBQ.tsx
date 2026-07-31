import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileKey, Users, ChevronRight, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const filePermissionsMetadata: PBQMetadata = {
  id: 'file-permissions',
  title: 'Linux File Permissions Lab',
  description: 'Set Linux file permissions using chmod and chown commands. Practice with both symbolic and octal notation across five permission scenarios.',
  difficulty: 3,
  category: 'Linux LPI-1',
  tags: ['linux', 'permissions', 'chmod', 'chown', 'security'],
  xpReward: 45,
  estimatedTime: '9 min',
};

interface Scenario {
  id: string;
  title: string;
  currentPerms: string;
  currentOwner: string;
  objective: string;
  filePath: string;
  validAnswers: string[];
  hint: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Secure a Private SSH Key',
    currentPerms: '-rw-r--r--', currentOwner: 'root:root',
    objective: 'The SSH key /home/admin/.ssh/id_rsa has too-open permissions. SSH refuses to use it. Set permissions so only the owner can read it.',
    filePath: '/home/admin/.ssh/id_rsa',
    validAnswers: ['chmod 600 /home/admin/.ssh/id_rsa', 'chmod u=rw,go= /home/admin/.ssh/id_rsa', 'chmod 0600 /home/admin/.ssh/id_rsa'],
    hint: 'SSH keys must be readable only by the owner (no group/other access). Think: rw- --- ---',
    explanation: 'chmod 600 sets read/write for owner only (rw-------). SSH requires private keys to have no group or other permissions.',
  },
  {
    id: 's2', title: 'Web Server Document Root',
    currentPerms: 'drwx------', currentOwner: 'root:root',
    objective: 'Set /var/www/html so the www-data user owns it, the webdevs group can read/write, and others can only read. Directory needs execute for traversal.',
    filePath: '/var/www/html',
    validAnswers: ['chmod 775 /var/www/html', 'chmod u=rwx,g=rwx,o=rx /var/www/html'],
    hint: 'Directories need execute (x) for traversal. Owner and group need full access, others read+execute.',
    explanation: 'chmod 775 gives rwxrwxr-x. Also requires chown www-data:webdevs. Directories need x for cd/listing.',
  },
  {
    id: 's3', title: 'Set SUID on passwd Command',
    currentPerms: '-rwxr-xr-x', currentOwner: 'root:root',
    objective: 'The /usr/bin/passwd command needs SUID so regular users can change their passwords (which modifies /etc/shadow owned by root).',
    filePath: '/usr/bin/passwd',
    validAnswers: ['chmod u+s /usr/bin/passwd', 'chmod 4755 /usr/bin/passwd'],
    hint: 'SUID (Set User ID) runs the program as the file owner. It is set with u+s or by adding 4 to the octal prefix.',
    explanation: 'chmod 4755 or u+s sets the SUID bit. The passwd command runs as root regardless of who executes it, allowing /etc/shadow modification.',
  },
  {
    id: 's4', title: 'Shared Team Directory with Sticky Bit',
    currentPerms: 'drwxrwxrwx', currentOwner: 'root:developers',
    objective: 'The /opt/shared directory allows all team members to create files, but anyone can delete others\' files. Set the sticky bit so users can only delete their own files.',
    filePath: '/opt/shared',
    validAnswers: ['chmod +t /opt/shared', 'chmod 1777 /opt/shared', 'chmod o+t /opt/shared'],
    hint: 'The sticky bit on a directory prevents users from deleting files they do not own. Think of /tmp.',
    explanation: 'chmod 1777 or +t sets the sticky bit. With sticky bit set, only the file owner, directory owner, or root can delete files in the directory.',
  },
  {
    id: 's5', title: 'Restrict Log File Access',
    currentPerms: '-rw-rw-rw-', currentOwner: 'root:root',
    objective: 'The file /var/log/auth.log contains sensitive authentication data. Set it so root can read/write, the adm group can read, and no others have any access.',
    filePath: '/var/log/auth.log',
    validAnswers: ['chmod 640 /var/log/auth.log', 'chmod u=rw,g=r,o= /var/log/auth.log', 'chmod 0640 /var/log/auth.log'],
    hint: 'Owner rw, group r, others none. In octal: 6=rw, 4=r, 0=none.',
    explanation: 'chmod 640 sets rw-r----- which gives root read/write, adm group read-only, and no access to others. This follows the principle of least privilege for sensitive logs.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function FilePermissionsPBQ({ onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const scenario = SCENARIOS[currentStep];
  const score = Math.round((correctCount / SCENARIOS.length) * 100);

  const handleSubmit = useCallback(() => {
    if (submitted || !inputValue.trim()) return;
    const normalized = inputValue.trim().replace(/\s+/g, ' ');
    const correct = scenario.validAnswers.some(ans => normalized === ans);
    setIsCorrect(correct);
    setSubmitted(true);
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
    } else {
      setCompleted(true);
      onComplete?.(Math.round((correctCount / SCENARIOS.length) * 100));
    }
  }, [currentStep, correctCount, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileKey size={16} className="text-[#fb8500]" />
          <span className="text-sm text-[#7da0c4]">File Permissions</span>
        </div>
        <ProgressTracker current={currentStep + (submitted ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-[#fb8500]" />
                  <span className="text-sm font-semibold text-[#e0f2fe]">{scenario.title}</span>
                </div>
                <span className="text-xs text-[#4a6682]">{currentStep + 1}/{SCENARIOS.length}</span>
              </div>

              <div className="p-4">
                {/* Current file info */}
                <div className="bg-[#0a1628] border border-[#1a2d45] rounded-lg p-3 mb-4 font-mono text-sm">
                  <div className="flex items-center gap-4 text-[#c8dce8]">
                    <span className="text-[#fb8500]">$</span>
                    <span>ls -la {scenario.filePath}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[#7da0c4]">
                    <span className={scenario.currentPerms.includes('d') ? 'text-[#00d4ff]' : 'text-[#c8dce8]'}>{scenario.currentPerms}</span>
                    <span className="text-[#00ff41]">{scenario.currentOwner}</span>
                    <span className="text-[#c8dce8]">{scenario.filePath.split('/').pop()}</span>
                  </div>
                </div>

                <p className="text-sm text-[#c8dce8] mb-4">{scenario.objective}</p>

                {!showHint && !submitted && (
                  <button onClick={() => setShowHint(true)} className="text-xs text-[#ffaa00] hover:text-[#fb8500] transition-colors mb-3 flex items-center gap-1">
                    <ShieldCheck size={12} /> Show hint
                  </button>
                )}
                {showHint && !submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 p-2 bg-[rgba(255,170,0,0.05)] border border-[#ffaa00] rounded-lg">
                    <p className="text-xs text-[#ffaa00]">{scenario.hint}</p>
                  </motion.div>
                )}

                {/* Terminal input */}
                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00ff41] font-mono text-sm">root@linux:~#</span>
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                      disabled={submitted} placeholder="Type your chmod/chown command..."
                      className="flex-1 bg-transparent border-none outline-none text-[#e0f2fe] font-mono text-sm caret-[#00ff41] placeholder-[#4a6682]" />
                  </div>
                </div>

                {!submitted && (
                  <div className="flex justify-end mt-3">
                    <button onClick={handleSubmit} disabled={!inputValue.trim()}
                      className="px-4 py-2 border border-[#00d4ff] rounded-lg text-[#00d4ff] text-sm hover:bg-[rgba(0,212,255,0.1)] transition-all disabled:opacity-30">
                      Execute
                    </button>
                  </div>
                )}

                {submitted && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                    <div className={`p-3 border rounded-lg ${isCorrect ? 'border-[#00ff41] bg-[rgba(0,255,65,0.05)]' : 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? <CheckCircle2 size={16} className="text-[#00ff41]" /> : <XCircle size={16} className="text-[#ff3366]" />}
                        <span className={`text-sm font-semibold ${isCorrect ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>
                          {isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-xs text-[#c8dce8]">{scenario.explanation}</p>
                      {!isCorrect && (
                        <p className="text-xs text-[#7da0c4] mt-1 font-mono">Accepted: {scenario.validAnswers[0]}</p>
                      )}
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
            <FileKey size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Permissions Lab Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} permission tasks completed correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
