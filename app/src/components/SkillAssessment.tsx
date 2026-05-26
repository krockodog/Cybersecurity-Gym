import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, Trophy, AlertCircle, Target, RotateCcw } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  10 diagnostic questions covering all 5 PT0-003 domains            */
/* ------------------------------------------------------------------ */

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 'diag_001',
    domain: 'Planning and Scoping',
    question: 'Which document defines the boundaries and authorized activities for a penetration test?',
    options: ['SOW', 'ROE', 'NDA', 'MSA'],
    correct: 1,
    explanation: 'The Rules of Engagement (ROE) document defines what is in scope, authorized activities, testing windows, and emergency contacts for a penetration test.',
  },
  {
    id: 'diag_002',
    domain: 'Information Gathering',
    question: 'Which Nmap flag performs a TCP SYN scan without completing the handshake?',
    options: ['-sT', '-sS', '-sU', '-sP'],
    correct: 1,
    explanation: '-sS performs a SYN scan (half-open scan) by sending SYN packets and analyzing responses without completing the full TCP three-way handshake, making it stealthier.',
  },
  {
    id: 'diag_003',
    domain: 'Attacks and Exploits',
    question: 'Which attack involves injecting malicious SQL statements through user input?',
    options: ['XSS', 'CSRF', 'SQL Injection', 'Buffer Overflow'],
    correct: 2,
    explanation: 'SQL Injection is a code injection technique where malicious SQL statements are inserted into application queries via user input fields.',
  },
  {
    id: 'diag_004',
    domain: 'Tools and Code Analysis',
    question: 'In Python, which library is commonly used for crafting custom network packets?',
    options: ['Requests', 'Scapy', 'BeautifulSoup', 'NumPy'],
    correct: 1,
    explanation: 'Scapy is a powerful Python library for packet manipulation, crafting, and decoding. It supports many protocols and enables custom network scanning and testing.',
  },
  {
    id: 'diag_005',
    domain: 'Reporting and Communication',
    question: 'What does CVSS stand for in vulnerability scoring?',
    options: ['Common Vulnerability Scoring System', 'Critical Vulnerability Severity Scale', 'Computer Vulnerability Security Score', 'Common Vector Scoring Standard'],
    correct: 0,
    explanation: 'CVSS (Common Vulnerability Scoring System) provides a standardized way to capture the principal characteristics of a vulnerability and produce a numerical score.',
  },
  {
    id: 'diag_006',
    domain: 'Planning and Scoping',
    question: 'During which phase of a penetration test are legal agreements and scope boundaries established?',
    options: ['Pre-engagement', 'Intelligence Gathering', 'Threat Modeling', 'Reporting'],
    correct: 0,
    explanation: 'The pre-engagement phase involves establishing legal agreements (contracts, NDAs), defining scope, setting rules of engagement, and planning the test.',
  },
  {
    id: 'diag_007',
    domain: 'Attacks and Exploits',
    question: 'Which type of XSS attack stores the malicious payload on the target server?',
    options: ['Reflected XSS', 'DOM-based XSS', 'Stored XSS', 'Blind XSS'],
    correct: 2,
    explanation: 'Stored XSS (Persistent XSS) occurs when the malicious script is permanently stored on the target server, such as in a database, message board, or comment field.',
  },
  {
    id: 'diag_008',
    domain: 'Information Gathering',
    question: 'Which DNS record type maps a domain name to an IPv4 address?',
    options: ['AAAA', 'MX', 'CNAME', 'A'],
    correct: 3,
    explanation: 'An A (Address) record maps a domain name to an IPv4 address. AAAA records map to IPv6 addresses, MX to mail servers, and CNAME is an alias.',
  },
  {
    id: 'diag_009',
    domain: 'Tools and Code Analysis',
    question: 'Which Burp Suite feature allows intercepting and modifying HTTP requests on the fly?',
    options: ['Scanner', 'Proxy', 'Repeater', 'Intruder'],
    correct: 1,
    explanation: 'The Burp Proxy sits between the browser and server, allowing penetration testers to intercept, inspect, and modify HTTP/S requests and responses in real time.',
  },
  {
    id: 'diag_010',
    domain: 'Reporting and Communication',
    question: 'What is the most important element of an executive summary in a penetration test report?',
    options: ['Detailed exploit code', 'Business impact and risk', 'Command syntax used', 'IP addresses of all scanned hosts'],
    correct: 1,
    explanation: 'Executive summaries must communicate business impact and risk in non-technical language so leadership can make informed decisions about remediation priorities.',
  },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AssessmentResult {
  overallScore: number;
  domainScores: Record<string, number>;
  recommendedLevel: 'beginner' | 'intermediate' | 'advanced';
  weakDomains: string[];
  strongDomains: string[];
  answers: Record<number, number>;
}

interface SkillAssessmentProps {
  onComplete: (result: AssessmentResult) => void;
  onCancel?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SkillAssessment({ onComplete, onCancel }: SkillAssessmentProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const question = DIAGNOSTIC_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (showExplanation) return;

      setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
      setIsCorrect(optionIndex === question.correct);
      setShowExplanation(true);

      // Auto-advance after 2.5 seconds if not the last question
      if (currentIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setShowExplanation(false);
          setIsCorrect(null);
        }, 2500);
      } else {
        // Last question — calculate results after showing explanation
        setTimeout(() => {
          calculateFinalResults({ ...answers, [currentIndex]: optionIndex });
        }, 2500);
      }
    },
    [currentIndex, showExplanation, question, answers]
  );

  const calculateFinalResults = (allAnswers: Record<number, number>) => {
    const domainScores: Record<string, { correct: number; total: number }> = {};

    DIAGNOSTIC_QUESTIONS.forEach((q, i) => {
      if (!domainScores[q.domain]) domainScores[q.domain] = { correct: 0, total: 0 };
      domainScores[q.domain].total++;
      if (allAnswers[i] === q.correct) domainScores[q.domain].correct++;
    });

    const domainPercentages: Record<string, number> = {};
    let totalCorrect = 0;

    Object.entries(domainScores).forEach(([domain, scores]) => {
      const pct = scores.correct / scores.total;
      domainPercentages[domain] = pct;
      totalCorrect += scores.correct;
    });

    const overallScore = totalCorrect / DIAGNOSTIC_QUESTIONS.length;

    const assessmentResult: AssessmentResult = {
      overallScore,
      domainScores: domainPercentages,
      recommendedLevel:
        overallScore >= 0.7 ? 'advanced' : overallScore >= 0.4 ? 'intermediate' : 'beginner',
      weakDomains: Object.entries(domainPercentages)
        .filter(([, v]) => v < 0.5)
        .map(([k]) => k),
      strongDomains: Object.entries(domainPercentages)
        .filter(([, v]) => v >= 0.7)
        .map(([k]) => k),
      answers: allAnswers,
    };

    // Store result
    localStorage.setItem('trygit_skill_assessment', JSON.stringify(assessmentResult));
    localStorage.setItem('trygit_difficulty', assessmentResult.recommendedLevel);

    setResult(assessmentResult);
    setIsComplete(true);
  };

  const handleFinish = () => {
    if (result) onComplete(result);
  };

  const handleRetake = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowExplanation(false);
    setIsCorrect(null);
    setIsComplete(false);
    setResult(null);
  };

  /* ── Results Screen ── */
  if (isComplete && result) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 md:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                backgroundColor:
                  result.recommendedLevel === 'advanced'
                    ? 'rgba(0,255,65,0.15)'
                    : result.recommendedLevel === 'intermediate'
                    ? 'rgba(255,170,0,0.15)'
                    : 'rgba(0,212,255,0.15)',
                border: `2px solid ${
                  result.recommendedLevel === 'advanced'
                    ? '#00ff41'
                    : result.recommendedLevel === 'intermediate'
                    ? '#ffaa00'
                    : '#00d4ff'
                }`,
              }}
            >
              <Trophy
                size={32}
                className={
                  result.recommendedLevel === 'advanced'
                    ? 'text-[#00ff41]'
                    : result.recommendedLevel === 'intermediate'
                    ? 'text-[#ffaa00]'
                    : 'text-[#00d4ff]'
                }
              />
            </motion.div>

            <h2 className="text-2xl font-bold text-[#e0f2fe] mb-1">Assessment Complete!</h2>
            <p className="text-sm text-[#7da0c4]">
              You scored{' '}
              <strong className="text-[#e0f2fe]">{Math.round(result.overallScore * 100)}%</strong>
            </p>
          </div>

          {/* Overall Score Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#7da0c4]">Overall Score</span>
              <span className="font-bold text-[#e0f2fe]">{Math.round(result.overallScore * 100)}%</span>
            </div>
            <div className="h-3 bg-[#162236] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.overallScore * 100}%` }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{
                  background:
                    result.overallScore >= 0.7
                      ? 'linear-gradient(90deg, #00ff41, #00d4ff)'
                      : result.overallScore >= 0.4
                      ? 'linear-gradient(90deg, #ffaa00, #ff7b00)'
                      : 'linear-gradient(90deg, #00d4ff, #0066ff)',
                }}
              />
            </div>
          </div>

          {/* Recommended Level */}
          <div
            className="rounded-lg p-4 mb-6 text-center"
            style={{
              backgroundColor:
                result.recommendedLevel === 'advanced'
                  ? 'rgba(0,255,65,0.08)'
                  : result.recommendedLevel === 'intermediate'
                  ? 'rgba(255,170,0,0.08)'
                  : 'rgba(0,212,255,0.08)',
              border: `1px solid ${
                result.recommendedLevel === 'advanced'
                  ? 'rgba(0,255,65,0.25)'
                  : result.recommendedLevel === 'intermediate'
                  ? 'rgba(255,170,0,0.25)'
                  : 'rgba(0,212,255,0.25)'
              }`,
            }}
          >
            <p className="text-xs text-[#7da0c4] uppercase tracking-wider mb-1">Recommended Level</p>
            <p
              className="text-xl font-bold capitalize"
              style={{
                color:
                  result.recommendedLevel === 'advanced'
                    ? '#00ff41'
                    : result.recommendedLevel === 'intermediate'
                    ? '#ffaa00'
                    : '#00d4ff',
              }}
            >
              {result.recommendedLevel}
            </p>
          </div>

          {/* Domain Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#e0f2fe] uppercase tracking-wider mb-3">
              Domain Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(result.domainScores).map(([domain, score]) => (
                <div key={domain}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#7da0c4]">{domain}</span>
                    <span
                      className="font-medium"
                      style={{
                        color: score >= 0.7 ? '#00ff41' : score >= 0.4 ? '#ffaa00' : '#ff3366',
                      }}
                    >
                      {Math.round(score * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#162236] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score * 100}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          score >= 0.7 ? '#00ff41' : score >= 0.4 ? '#ffaa00' : '#ff3366',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {result.strongDomains.length > 0 && (
              <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-2">Strong Areas</p>
                {result.strongDomains.map((d) => (
                  <p key={d} className="text-sm text-[#e0f2fe] flex items-center gap-2">
                    <Trophy size={12} className="text-green-400" /> {d}
                  </p>
                ))}
              </div>
            )}
            {result.weakDomains.length > 0 && (
              <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Focus Areas</p>
                {result.weakDomains.map((d) => (
                  <p key={d} className="text-sm text-[#e0f2fe] flex items-center gap-2">
                    <Target size={12} className="text-red-400" /> {d}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinish}
              className="flex-1 py-3 px-5 rounded-lg bg-[#00ff41] text-[#0a0e17] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,65,0.3)] transition-all"
            >
              <ChevronRight size={16} />
              Continue to Dashboard
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetake}
              className="py-3 px-5 rounded-lg border border-[#1a2d45] text-[#7da0c4] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:border-[#00d4ff]/50 hover:text-[#e0f2fe] transition-all"
            >
              <RotateCcw size={14} />
              Retake
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Question Screen ── */
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with cancel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-[#00d4ff]" />
          <span className="text-sm text-[#7da0c4]">Skill Assessment</span>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-[#5a7a9a] hover:text-[#e0f2fe] transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-[#7da0c4] mb-2">
          <span>
            Question {currentIndex + 1} of {DIAGNOSTIC_QUESTIONS.length}
          </span>
          <span className="text-[#00d4ff]">{question.domain}</span>
        </div>
        <div className="h-2 bg-[#162236] rounded-full overflow-hidden">
          <motion.div
            animate={{
              width: `${(answeredCount / DIAGNOSTIC_QUESTIONS.length) * 100}%`,
            }}
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #00ff41, #00d4ff)',
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6"
        >
          {/* Domain badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'rgba(0,212,255,0.1)',
                color: '#00d4ff',
                border: '1px solid rgba(0,212,255,0.2)',
              }}
            >
              <Target size={11} />
              {question.domain}
            </span>
          </div>

          {/* Question */}
          <h3 className="text-lg md:text-xl font-semibold text-[#e0f2fe] mb-6 leading-relaxed">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <motion.button
                key={i}
                whileHover={!showExplanation ? { scale: 1.01 } : {}}
                whileTap={!showExplanation ? { scale: 0.99 } : {}}
                onClick={() => handleAnswer(i)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-lg border text-left transition-all duration-200 ${
                  showExplanation && i === question.correct
                    ? 'bg-green-900/20 border-green-500/50'
                    : showExplanation &&
                      answers[currentIndex] === i &&
                      i !== question.correct
                    ? 'bg-red-900/20 border-red-500/50'
                    : 'bg-[#162236] border-[#1a2d45] hover:border-[#00d4ff]/40'
                } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold mr-3 flex-shrink-0 ${
                      showExplanation && i === question.correct
                        ? 'bg-green-500/20 text-green-400'
                        : showExplanation &&
                          answers[currentIndex] === i &&
                          i !== question.correct
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-[#0d1526] text-[#7da0c4]'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-[#e0f2fe]">{option}</span>
                  {showExplanation && i === question.correct && (
                    <span className="ml-auto text-green-400 text-sm font-medium">Correct</span>
                  )}
                  {showExplanation &&
                    answers[currentIndex] === i &&
                    i !== question.correct && (
                      <span className="ml-auto text-red-400 text-sm font-medium">Incorrect</span>
                    )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Explanation panel */}
          {showExplanation && question.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-4 p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-900/10 border border-green-500/20'
                  : 'bg-red-900/10 border border-red-500/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <Trophy size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p
                    className={`font-medium mb-1 ${
                      isCorrect ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className="text-sm text-[#7da0c4] leading-relaxed">{question.explanation}</p>
                </div>
              </div>
              {currentIndex < DIAGNOSTIC_QUESTIONS.length - 1 && (
                <p className="text-xs text-[#5a7a9a] mt-3 animate-pulse">
                  Next question in a moment...
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default SkillAssessment;
