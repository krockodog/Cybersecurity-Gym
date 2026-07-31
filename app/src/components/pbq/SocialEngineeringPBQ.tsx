import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldAlert, ShieldCheck, AlertTriangle, Link, User, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { ProgressTracker } from './shared/ProgressTracker';
import type { PBQMetadata } from './shared/types';

export const socialMetadata: PBQMetadata = {
  id: 'social-engineering',
  title: 'Phishing Detection Lab',
  description: 'Analyze simulated emails and messages to identify social engineering attacks. Spot phishing indicators and classify threats correctly.',
  difficulty: 3,
  category: 'PenTest+',
  tags: ['phishing', 'social-engineering', 'email-security'],
  xpReward: 50,
  estimatedTime: '8 min',
};

interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  body: string;
  links: string[];
  isPhishing: boolean;
  indicators: string[];
  correctIndicatorIndex: number;
}

const EMAILS: EmailMessage[] = [
  {
    id: 'e1',
    from: 'IT Security Team',
    fromEmail: 'security@c0mpany-it.com',
    subject: 'URGENT: Password Reset Required Within 24 Hours',
    body: 'Dear Employee,\n\nYour corporate password expires today. Click the link below immediately to reset your password or your account will be permanently locked.\n\nReset Now: https://c0mpany-it.com/reset\n\nIT Security Department',
    links: ['https://c0mpany-it.com/reset'],
    isPhishing: true,
    indicators: [
      'Urgency and threat of account lockout',
      'Misspelled domain (c0mpany with zero)',
      'Generic greeting instead of your name',
      'All of the above',
    ],
    correctIndicatorIndex: 3,
  },
  {
    id: 'e2',
    from: 'Sarah Chen',
    fromEmail: 'sarah.chen@company.com',
    subject: 'Q3 Budget Review Meeting Notes',
    body: 'Hi team,\n\nAttached are the notes from our Q3 budget review meeting held on Thursday. Please review section 3 regarding the updated allocation for the security department.\n\nLet me know if you have any questions before our follow-up on Friday.\n\nBest,\nSarah Chen\nFinance Director',
    links: [],
    isPhishing: false,
    indicators: [
      'The attachment could contain malware',
      'The sender might be spoofed',
      'This is a legitimate internal email',
      'The meeting reference is suspicious',
    ],
    correctIndicatorIndex: 2,
  },
  {
    id: 'e3',
    from: 'Microsoft 365',
    fromEmail: 'no-reply@m1crosoft-365-admin.com',
    subject: 'Your OneDrive storage is 95% full',
    body: 'Your Microsoft 365 OneDrive storage has reached 95% capacity.\n\nTo avoid losing access to your files, please verify your account and upgrade your storage plan.\n\nVerify Account: https://m1crosoft-365-admin.com/verify?user=you\n\nMicrosoft 365 Admin',
    links: ['https://m1crosoft-365-admin.com/verify?user=you'],
    isPhishing: true,
    indicators: [
      'Microsoft would never send storage alerts',
      'The "verify account" link leads to a spoofed domain',
      'OneDrive does not have storage limits',
      'The email formatting is wrong',
    ],
    correctIndicatorIndex: 1,
  },
  {
    id: 'e4',
    from: 'HR Department',
    fromEmail: 'hr@company.com',
    subject: 'Updated Holiday Schedule 2024',
    body: 'Hello everyone,\n\nThe updated holiday schedule for 2024 has been posted to the company intranet. You can view it under HR > Policies > Holiday Calendar.\n\nPlease note the addition of the floating holiday on March 15th.\n\nRegards,\nHuman Resources',
    links: [],
    isPhishing: false,
    indicators: [
      'No specific sender name is given',
      'The intranet link might be malicious',
      'This is a legitimate HR announcement',
      'Holiday schedules are only sent in January',
    ],
    correctIndicatorIndex: 2,
  },
  {
    id: 'e5',
    from: 'CEO - James Morrison',
    fromEmail: 'james.morrison.ceo@gmail.com',
    subject: 'Urgent Wire Transfer Needed',
    body: 'Hi,\n\nI need you to process an urgent wire transfer of $47,500 to the account below. This is for a confidential acquisition - do not discuss with anyone else.\n\nBank: First National\nRouting: 021000021\nAccount: 483920174\n\nPlease confirm when done.\n\nJames Morrison\nCEO',
    links: [],
    isPhishing: true,
    indicators: [
      'CEO would never email directly about transfers',
      'Personal Gmail account used for corporate business',
      'The amount seems unusually high',
      'Wire transfers always require email approval',
    ],
    correctIndicatorIndex: 1,
  },
];

type Phase = 'classify' | 'identify';

interface Props {
  onComplete?: (score: number) => void;
}

export default function SocialEngineeringPBQ({ onComplete }: Props) {
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('classify');
  const [classifications, setClassifications] = useState<(boolean | null)[]>(Array(EMAILS.length).fill(null));
  const [indicatorSelections, setIndicatorSelections] = useState<(number | null)[]>(Array(EMAILS.length).fill(null));
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const classifyEmail = useCallback((isPhishing: boolean) => {
    if (completed || feedback !== null) return;

    const email = EMAILS[currentRound];
    const isCorrect = isPhishing === email.isPhishing;

    setClassifications(prev => {
      const next = [...prev];
      next[currentRound] = isPhishing;
      return next;
    });

    if (isCorrect) {
      setFeedback('correct');
      setTimeout(() => {
        setPhase('identify');
        setFeedback(null);
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setClassifications(prev => {
          const next = [...prev];
          next[currentRound] = null;
          return next;
        });
        setFeedback(null);
      }, 1500);
    }
  }, [currentRound, completed, feedback]);

  const selectIndicator = useCallback((indicatorIndex: number) => {
    if (completed || feedback !== null) return;

    const email = EMAILS[currentRound];
    const isCorrect = indicatorIndex === email.correctIndicatorIndex;

    setIndicatorSelections(prev => {
      const next = [...prev];
      next[currentRound] = indicatorIndex;
      return next;
    });

    if (isCorrect) {
      setFeedback('correct');
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      const newScore = Math.round((newCorrect / EMAILS.length) * 100);
      setScore(newScore);

      if (currentRound === EMAILS.length - 1) {
        setCompleted(true);
        onComplete?.(newScore);
      } else {
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
          setPhase('classify');
          setFeedback(null);
        }, 1400);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setIndicatorSelections(prev => {
          const next = [...prev];
          next[currentRound] = null;
          return next;
        });
        setFeedback(null);
      }, 1500);
    }
  }, [currentRound, correctCount, completed, feedback, onComplete]);

  const email = EMAILS[currentRound];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail size={16} className="text-[#ff3366]" />
          <span className="text-caption text-[#7da0c4] font-display">Phishing Detection Lab</span>
          <span className="text-[10px] text-[#4a6682] font-mono">
            Round {currentRound + 1}/{EMAILS.length}
          </span>
        </div>
        <ProgressTracker current={correctCount} total={EMAILS.length} score={score} />
      </div>

      {/* Round indicators */}
      <div className="flex items-center justify-center gap-3 mb-5">
        {EMAILS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              borderColor: indicatorSelections[i] !== null ? '#00ff41' : i === currentRound ? '#ff3366' : '#1a2d45',
              backgroundColor: indicatorSelections[i] !== null ? 'rgba(0,255,65,0.15)' : i === currentRound ? 'rgba(255,51,102,0.1)' : '#0d1526',
            }}
            className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
          >
            {indicatorSelections[i] !== null ? (
              <CheckCircle size={14} className="text-[#00ff41]" />
            ) : (
              <span className={`text-xs font-mono ${i === currentRound ? 'text-[#ff3366]' : 'text-[#4a6682]'}`}>
                {i + 1}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-4">
        {/* Email Preview */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentRound}-${phase}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-xl overflow-hidden"
          >
            {/* Email header */}
            <div className="px-5 py-3 bg-[#111d2e] border-b border-[#1a2d45]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.15)] flex items-center justify-center">
                  <User size={14} className="text-[#00d4ff]" />
                </div>
                <div>
                  <p className="text-sm text-[#e0f2fe] font-display">{email.from}</p>
                  <p className="text-[10px] text-[#7da0c4] font-mono">&lt;{email.fromEmail}&gt;</p>
                </div>
              </div>
              <p className="text-xs text-[#c8dce8] font-display">{email.subject}</p>
            </div>

            {/* Email body */}
            <div className="p-5">
              <div className="text-sm text-[#c8dce8] whitespace-pre-line leading-relaxed mb-4">
                {email.body}
              </div>

              {email.links.length > 0 && (
                <div className="mb-4 space-y-1">
                  {email.links.map((link, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <ExternalLink size={10} className="text-[#00d4ff] flex-shrink-0" />
                      <span className="text-[#00d4ff] font-mono truncate">{link}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Phase: Classify */}
              {phase === 'classify' && (
                <div>
                  <p className="text-xs text-[#7da0c4] font-display mb-3">Is this email phishing or legitimate?</p>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => classifyEmail(true)}
                      disabled={feedback !== null}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[#ff3366] bg-[rgba(255,51,102,0.08)] hover:bg-[rgba(255,51,102,0.15)] transition-all"
                    >
                      <AlertTriangle size={16} className="text-[#ff3366]" />
                      <span className="text-sm text-[#ff3366] font-display">Phishing</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => classifyEmail(false)}
                      disabled={feedback !== null}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-[#00ff41] bg-[rgba(0,255,65,0.08)] hover:bg-[rgba(0,255,65,0.15)] transition-all"
                    >
                      <ShieldCheck size={16} className="text-[#00ff41]" />
                      <span className="text-sm text-[#00ff41] font-display">Legitimate</span>
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Phase: Identify indicator */}
              {phase === 'identify' && (
                <div>
                  <p className="text-xs text-[#7da0c4] font-display mb-3">
                    {email.isPhishing ? 'What is the key phishing indicator?' : 'Why is this email safe?'}
                  </p>
                  <div className="space-y-2">
                    {email.indicators.map((indicator, i) => {
                      const isSelected = indicatorSelections[currentRound] === i;
                      const isCorrect = i === email.correctIndicatorIndex && isSelected;
                      const isWrong = isSelected && i !== email.correctIndicatorIndex;

                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.01, x: 4 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => selectIndicator(i)}
                          disabled={feedback !== null}
                          className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all ${
                            isCorrect
                              ? 'border-[#00ff41] bg-[rgba(0,255,65,0.1)]'
                              : isWrong
                                ? 'border-[#ff3366] bg-[rgba(255,51,102,0.1)]'
                                : 'border-[#1a2d45] hover:border-[#00d4ff] bg-[#0a0e17]'
                          }`}
                        >
                          <span className={`text-sm ${
                            isCorrect ? 'text-[#00ff41]' : isWrong ? 'text-[#ff3366]' : 'text-[#e0f2fe]'
                          }`}>
                            {indicator}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feedback */}
              <AnimatePresence>
                {feedback === 'correct' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 p-3 border border-[#00ff41] rounded-lg bg-[rgba(0,255,65,0.05)] text-center"
                  >
                    <p className="text-sm text-[#00ff41] font-display">Correct!</p>
                  </motion.div>
                )}
                {feedback === 'wrong' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 p-3 border border-[#ff3366] rounded-lg bg-[rgba(255,51,102,0.05)] text-center"
                  >
                    <p className="text-sm text-[#ff3366] font-display">Incorrect. Try again.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Threat Intel Panel */}
        <div className="space-y-3">
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <h4 className="text-caption text-[#7da0c4] font-display mb-3 flex items-center gap-2">
              <ShieldAlert size={12} className="text-[#ffaa00]" />
              THREAT ANALYSIS
            </h4>
            <div className="space-y-2">
              {EMAILS.map((em, i) => {
                const classified = classifications[i] !== null;
                const analyzed = indicatorSelections[i] !== null;
                return (
                  <motion.div
                    key={em.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      i === currentRound ? 'border-[#ff3366] bg-[rgba(255,51,102,0.05)]' : 'border-[#1a2d45] bg-[#0a0e17]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={12} className={analyzed ? 'text-[#00ff41]' : 'text-[#4a6682]'} />
                      <span className="text-[11px] text-[#c8dce8] truncate">{em.subject.substring(0, 30)}...</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {analyzed ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,255,65,0.15)] text-[#00ff41]">ANALYZED</span>
                      ) : classified ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(255,170,0,0.15)] text-[#ffaa00]">CLASSIFIED</span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(74,102,130,0.2)] text-[#4a6682]">PENDING</span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-4">
            <h4 className="text-caption text-[#7da0c4] font-display mb-3">DETECTION STATS</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-[#0a0e17] border border-[#1a2d45]">
                <p className="text-lg font-mono text-[#00ff41]">{correctCount}</p>
                <p className="text-[10px] text-[#7da0c4] font-display">Correct</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[#0a0e17] border border-[#1a2d45]">
                <p className="text-lg font-mono text-[#ffaa00]">{EMAILS.filter(e => e.isPhishing).length}</p>
                <p className="text-[10px] text-[#7da0c4] font-display">Phishing Total</p>
              </div>
            </div>
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0d1526] border border-[#00ff41] rounded-xl p-4 text-center"
            >
              <ShieldCheck size={24} className="text-[#00ff41] mx-auto mb-2" />
              <p className="text-sm text-[#00ff41] font-display">Analysis Complete</p>
              <p className="text-xs text-[#7da0c4] mt-1">Score: {score}%</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
