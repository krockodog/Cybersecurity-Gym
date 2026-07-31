import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Download, Trash2, RefreshCw, Search, CheckCircle2, XCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const packageManagerMetadata: PBQMetadata = {
  id: 'package-manager',
  title: 'Package Management Console',
  description: 'Master Linux package management with apt, yum, and dnf. Complete tasks including installing, removing, updating, searching, and resolving dependency conflicts.',
  difficulty: 3,
  category: 'Linux LPI-1',
  tags: ['linux', 'apt', 'yum', 'dnf', 'packages', 'dependencies'],
  xpReward: 45,
  estimatedTime: '9 min',
};

interface Scenario {
  id: string;
  title: string;
  icon: React.ReactNode;
  distro: 'Debian/Ubuntu' | 'RHEL/CentOS' | 'Fedora';
  context: string;
  terminalOutput: string[];
  validAnswers: string[];
  hint: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1', title: 'Install a Package with Dependencies',
    icon: <Download size={20} className="text-[#00d4ff]" />,
    distro: 'Debian/Ubuntu',
    context: 'Install the nginx web server package on an Ubuntu system. Ensure the package index is updated first.',
    terminalOutput: [
      '$ apt list --installed | grep nginx',
      '(no results)',
      '$ apt-cache policy nginx',
      'nginx:',
      '  Installed: (none)',
      '  Candidate: 1.24.0-1ubuntu1',
    ],
    validAnswers: ['sudo apt update && sudo apt install nginx', 'sudo apt-get update && sudo apt-get install nginx', 'sudo apt update && sudo apt install -y nginx'],
    hint: 'First update the package index (apt update), then install the package. Use apt or apt-get.',
    explanation: 'apt update refreshes the package index from repositories. apt install nginx then fetches and installs nginx with all required dependencies automatically.',
  },
  {
    id: 's2', title: 'Remove a Package Completely',
    icon: <Trash2 size={20} className="text-[#ff3366]" />,
    distro: 'Debian/Ubuntu',
    context: 'Remove Apache2 and all its configuration files from the system. A previous admin installed it but nginx is now the web server.',
    terminalOutput: [
      '$ dpkg -l | grep apache',
      'ii  apache2  2.4.57-2  amd64  Apache HTTP Server',
      'ii  apache2-utils  2.4.57-2  amd64  Apache HTTP Server utilities',
      '$ systemctl status apache2',
      'Active: active (running)',
    ],
    validAnswers: ['sudo apt purge apache2 apache2-utils', 'sudo apt-get purge apache2 apache2-utils', 'sudo apt purge apache2*'],
    hint: 'Use "purge" instead of "remove" to also delete configuration files. Include related packages.',
    explanation: 'apt purge removes packages AND their configuration files, unlike "remove" which leaves configs behind. Purging both apache2 and apache2-utils ensures a clean removal.',
  },
  {
    id: 's3', title: 'Update All System Packages',
    icon: <RefreshCw size={20} className="text-[#00ff41]" />,
    distro: 'RHEL/CentOS',
    context: 'A CentOS server has not been updated in 3 months. Update all installed packages and clean up old cached packages.',
    terminalOutput: [
      '$ yum check-update | tail -5',
      'kernel.x86_64  5.14.0-362  updates',
      'openssl.x86_64  3.0.7-24  updates',
      'bash.x86_64  5.2.15-3  updates',
      '47 packages marked for update',
    ],
    validAnswers: ['sudo yum update -y && sudo yum clean all', 'sudo yum update && sudo yum clean all', 'sudo yum -y update && sudo yum clean all'],
    hint: 'On RHEL/CentOS, use "yum update" to upgrade all packages. Then clean the cache with "yum clean all".',
    explanation: 'yum update upgrades all installed packages to the latest available versions. yum clean all removes cached packages and metadata, freeing disk space.',
  },
  {
    id: 's4', title: 'Search for Available Packages',
    icon: <Search size={20} className="text-[#ffaa00]" />,
    distro: 'Fedora',
    context: 'Find all packages related to Python 3 development libraries on Fedora. You need the development headers to compile a C extension.',
    terminalOutput: [
      '$ python3 --version',
      'Python 3.12.1',
      '$ gcc -c myext.c $(python3-config --includes)',
      'fatal error: Python.h: No such file or directory',
    ],
    validAnswers: ['dnf search python3-devel', 'sudo dnf search python3-devel', 'dnf search python3-dev'],
    hint: 'Use "dnf search" to find packages. Development headers in Fedora/RHEL end with "-devel".',
    explanation: 'dnf search python3-devel finds the python3-devel package which provides Python.h and other development headers needed to compile C extensions for Python.',
  },
  {
    id: 's5', title: 'Resolve Dependency Conflict',
    icon: <AlertTriangle size={20} className="text-[#ff3366]" />,
    distro: 'Debian/Ubuntu',
    context: 'Installing a package fails due to broken dependencies. Diagnose and fix the broken package state.',
    terminalOutput: [
      '$ sudo apt install libssl-dev',
      'E: Unmet dependencies. Try apt --fix-broken install',
      '$ apt list --installed | grep libssl',
      'libssl3/jammy 3.0.2-0ubuntu1 amd64 [residual-config]',
      'libssl1.1/bionic 1.1.1-1ubuntu2 amd64 [installed,local]',
    ],
    validAnswers: ['sudo apt --fix-broken install', 'sudo apt-get --fix-broken install', 'sudo apt -f install', 'sudo apt-get -f install'],
    hint: 'Use the --fix-broken (or -f) flag with apt install to resolve dependency issues automatically.',
    explanation: 'apt --fix-broken install (or apt -f install) resolves broken dependency chains by installing missing dependencies or removing conflicting packages automatically.',
  },
];

interface Props {
  onComplete?: (score: number) => void;
}

export default function PackageManagerPBQ({ onComplete }: Props) {
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

  const distroColors: Record<string, string> = {
    'Debian/Ubuntu': '#e95420',
    'RHEL/CentOS': '#cc0000',
    'Fedora': '#51a2da',
  };

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
          <Package size={16} className="text-[#fb8500]" />
          <span className="text-sm text-[#7da0c4]">Package Management</span>
        </div>
        <ProgressTracker current={currentStep + (submitted ? 1 : 0)} total={SCENARIOS.length} score={score} streak={streak} />
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div key={scenario.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-2 bg-[#111d2e] border-b border-[#1a2d45]">
                <div className="flex items-center gap-3">
                  {scenario.icon}
                  <span className="text-sm font-semibold text-[#e0f2fe]">{scenario.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ color: distroColors[scenario.distro], backgroundColor: `${distroColors[scenario.distro]}15` }}>
                    {scenario.distro}
                  </span>
                </div>
                <span className="text-xs text-[#4a6682]">{currentStep + 1}/{SCENARIOS.length}</span>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#c8dce8] mb-4">{scenario.context}</p>

                {/* Terminal output context */}
                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg p-3 mb-4 font-mono text-xs overflow-x-auto">
                  {scenario.terminalOutput.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className={`${line.startsWith('$') ? 'text-[#00ff41]' : line.includes('Error') || line.includes('fatal') ? 'text-[#ff3366]' : 'text-[#c8dce8]'}`}>
                      {line}
                    </motion.div>
                  ))}
                </div>

                {!showHint && !submitted && (
                  <button onClick={() => setShowHint(true)} className="text-xs text-[#ffaa00] hover:text-[#fb8500] transition-colors mb-3 flex items-center gap-1">
                    <Package size={12} /> Show hint
                  </button>
                )}
                {showHint && !submitted && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 p-2 bg-[rgba(255,170,0,0.05)] border border-[#ffaa00] rounded-lg">
                    <p className="text-xs text-[#ffaa00]">{scenario.hint}</p>
                  </motion.div>
                )}

                {/* Command input */}
                <div className="bg-[#0c0c0c] border border-[#1a2d45] rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00ff41] font-mono text-sm">$</span>
                    <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                      disabled={submitted} placeholder="Type your package management command..."
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
                  {currentStep < SCENARIOS.length - 1 ? 'Next Task' : 'Finish'} <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 text-center">
            <Package size={40} className="text-[#00ff41] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#e0f2fe] mb-2">Package Management Complete</h3>
            <p className="text-2xl font-bold text-[#00ff41] mb-2">{score}%</p>
            <p className="text-sm text-[#7da0c4]">{correctCount}/{SCENARIOS.length} package tasks completed correctly</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
