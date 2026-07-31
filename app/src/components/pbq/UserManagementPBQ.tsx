import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, UserCog, Lock, Shield, CheckCircle2, XCircle, ChevronRight, Lightbulb } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const userManagementMetadata: PBQMetadata = {
  id: 'user-management',
  title: 'User & Group Administration',
  description: 'Manage Linux users and groups using useradd, usermod, passwd, and groupadd. Complete five user administration tasks following security best practices.',
  difficulty: 3,
  category: 'Linux LPI-1',
  tags: ['linux', 'users', 'groups', 'useradd', 'passwd', 'security'],
  xpReward: 45,
  estimatedTime: '9 min',
};

interface UserEntry {
  username: string;
  uid: number;
  gid: number;
  groups: string[];
  shell: string;
  home: string;
  locked?: boolean;
}

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  currentUsers: UserEntry[];
  task: string;
  validAnswers: string[];
  hint: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Create a New Developer User',
    icon: <UserPlus size={20} className="text-[#00d4ff]" />,
    description: 'Create a new user account for a developer joining the team.',
    currentUsers: [
      { username: 'root', uid: 0, gid: 0, groups: ['root'], shell: '/bin/bash', home: '/root' },
      { username: 'admin', uid: 1000, gid: 1000, groups: ['admin', 'sudo'], shell: '/bin/bash', home: '/home/admin' },
    ],
    task: 'Create user "jdoe" with home directory, bash shell, and add to the "developers" group.',
    validAnswers: [
      'sudo useradd -m -s /bin/bash -G developers jdoe',
      'sudo useradd -m -s /bin/bash -g developers jdoe',
      'useradd -m -s /bin/bash -G developers jdoe',
    ],
    hint: 'useradd flags: -m (create home), -s (set shell), -G (supplementary group). Order of flags does not matter.',
    explanation: '"useradd -m -s /bin/bash -G developers jdoe" creates the user with a home directory (-m), sets bash as the login shell (-s), and adds to the developers group (-G).',
  },
  {
    id: 's2', title: 'Modify User Group Membership',
    icon: <UserCog size={20} className="text-[#ffaa00]" />,
    description: 'A developer needs access to Docker. Add them to the docker group without removing existing group memberships.',
    currentUsers: [
      { username: 'jdoe', uid: 1001, gid: 1001, groups: ['jdoe', 'developers'], shell: '/bin/bash', home: '/home/jdoe' },
    ],
    task: 'Add user "jdoe" to the "docker" group while preserving existing group memberships.',
    validAnswers: [
      'sudo usermod -aG docker jdoe',
      'usermod -aG docker jdoe',
      'sudo usermod -a -G docker jdoe',
    ],
    hint: 'Use usermod with -a (append) and -G (groups). Without -a, all other groups are removed!',
    explanation: '"usermod -aG docker jdoe" appends (-a) the docker group to jdoe\'s supplementary groups (-G). Without -a, the user would be removed from developers and only be in docker.',
  },
  {
    id: 's3', title: 'Lock a Compromised Account',
    icon: <Lock size={20} className="text-[#ff3366]" />,
    description: 'Security detected suspicious login activity on a user account. Lock the account immediately and expire the password.',
    currentUsers: [
      { username: 'suspect', uid: 1005, gid: 1005, groups: ['suspect', 'sales'], shell: '/bin/bash', home: '/home/suspect' },
    ],
    task: 'Lock the "suspect" user account and force a password change on next login (if unlocked).',
    validAnswers: [
      'sudo usermod -L suspect && sudo passwd -e suspect',
      'sudo passwd -l suspect && sudo passwd -e suspect',
      'usermod -L suspect && passwd -e suspect',
    ],
    hint: 'usermod -L locks the account (prepends ! to password hash). passwd -e expires the password forcing a change.',
    explanation: '"usermod -L" locks the account by prepending ! to the password hash, preventing login. "passwd -e" expires the password so if the account is unlocked, a new password must be set.',
  },
  {
    id: 's4', title: 'Create Project Group with Users',
    icon: <Users size={20} className="text-[#a855f7]" />,
    description: 'Set up a new project group and add multiple existing users to it for a cross-team collaboration.',
    currentUsers: [
      { username: 'alice', uid: 1002, gid: 1002, groups: ['alice', 'developers'], shell: '/bin/bash', home: '/home/alice' },
      { username: 'bob', uid: 1003, gid: 1003, groups: ['bob', 'designers'], shell: '/bin/bash', home: '/home/bob' },
      { username: 'carol', uid: 1004, gid: 1004, groups: ['carol', 'managers'], shell: '/bin/bash', home: '/home/carol' },
    ],
    task: 'Create a group called "project-x" and add alice, bob, and carol to it.',
    validAnswers: [
      'sudo groupadd project-x && sudo usermod -aG project-x alice && sudo usermod -aG project-x bob && sudo usermod -aG project-x carol',
      'groupadd project-x && usermod -aG project-x alice && usermod -aG project-x bob && usermod -aG project-x carol',
    ],
    hint: 'First create the group with groupadd, then add each user with usermod -aG. Chain commands with &&.',
    explanation: '"groupadd project-x" creates the group. Then "usermod -aG project-x <user>" adds each user. The -a flag preserves existing memberships.',
  },
  {
    id: 's5', title: 'Set Up a Service Account',
    icon: <Shield size={20} className="text-[#00ff41]" />,
    description: 'Create a service account for an application daemon. It should not have login capabilities or a home directory.',
    currentUsers: [],
    task: 'Create a system service account "appd" with no home directory, no login shell, and a comment "Application Daemon".',
    validAnswers: [
      'sudo useradd -r -s /usr/sbin/nologin -M -c "Application Daemon" appd',
      'sudo useradd --system -s /usr/sbin/nologin -M -c "Application Daemon" appd',
      'useradd -r -s /usr/sbin/nologin -M -c "Application Daemon" appd',
      'sudo useradd -r -s /sbin/nologin -M -c "Application Daemon" appd',
    ],
    hint: 'Use -r for system account, -s /usr/sbin/nologin for no login, -M for no home directory, -c for comment.',
    explanation: '"-r" creates a system account (low UID). "-s /usr/sbin/nologin" prevents interactive login. "-M" skips home directory creation. "-c" adds a descriptive comment.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function UserManagementPBQ({ onComplete }: Props) {
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
          <Users size={16} className="text-[#fb8500]" />
          <span className="text-sm text-[#7da0c4]">User & Group Management</span>
        </div>
        <ProgressTracker current={currentStep + (submitted ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
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
                <p className="text-sm text-[#c8dce8] mb-3">{scenario.description}</p>

                {/* Current users table */}
                {scenario.currentUsers.length > 0 && (
                  <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg overflow-x-auto mb-4">
                    <div className="px-3 py-1.5 border-b border-[#1a2d45] text-[10px] text-[#4a6682] font-mono"># /etc/passwd + groups</div>
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-[#1a2d45] text-[#7da0c4]">
                          <th className="text-left px-3 py-1.5">USER</th>
                          <th className="text-left px-3 py-1.5">UID</th>
                          <th className="text-left px-3 py-1.5">GROUPS</th>
                          <th className="text-left px-3 py-1.5">SHELL</th>
                          <th className="text-left px-3 py-1.5">HOME</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.currentUsers.map(user => (
                          <tr key={user.username} className="border-b border-[#1a2d45]/30">
                            <td className="px-3 py-1.5 text-[#00d4ff]">{user.username}</td>
                            <td className="px-3 py-1.5 text-[#ffaa00]">{user.uid}</td>
                            <td className="px-3 py-1.5 text-[#c8dce8]">{user.groups.join(', ')}</td>
                            <td className="px-3 py-1.5 text-[#7da0c4]">{user.shell}</td>
                            <td className="px-3 py-1.5 text-[#7da0c4]">{user.home}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="bg-[rgba(0,212,255,0.05)] border border-[#00d4ff] rounded-lg p-3 mb-4">
                  <p className="text-sm text-[#00d4ff]">{scenario.task}</p>
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

                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00ff41] font-mono text-sm">root@linux:~#</span>
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                      disabled={submitted} placeholder="Type your user management command..."
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
                        <span className={`text-sm font-semibold ${isCorrect ? 'text-[#00ff41]' : 'text-[#ff3366]'}`}>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                      </div>
                      <p className="text-xs text-[#c8dce8]">{scenario.explanation}</p>
                      {!isCorrect && <p className="text-xs text-[#7da0c4] mt-1 font-mono">Accepted: {scenario.validAnswers[0]}</p>}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {submitted && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <button onClick={handleNext} className="px-5 py-2 border border-[#00ff41] rounded-lg text-[#00ff41] text-sm hover:bg-[rgba(0,255,65,0.1)] transition-all flex items-center gap-2">
                  {currentStep < SCENARIOS.length - 1 ? 'Next Task' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <Users size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">User Management Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} user admin tasks completed correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
