import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Brain, ChevronRight, Check,
  BookOpen, Lock, Eye, FileText, AlertTriangle
} from 'lucide-react';

interface OnboardingData {
  name: string;
  consentGiven: boolean;
  onboardingComplete: boolean;
}

// Step 1: Welcome + Name Input
function NameStep({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (name.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }
    onNext(name.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="w-20 h-20 bg-gradient-to-br from-[#00ff41] to-[#00d4ff] rounded-2xl mx-auto mb-6 flex items-center justify-center"
      >
        <Brain size={40} className="text-[#0a0e17]" />
      </motion.div>

      <h1 className="text-3xl font-bold text-[#e0f2fe] mb-2">
        Welcome to PentestGym
      </h1>
      <p className="text-[#7da0c4] mb-8">
        Your AI-powered cybersecurity training academy.
        19 expert professors are waiting to guide you.
      </p>

      <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6">
        <label className="block text-sm text-[#7da0c4] mb-2 text-left">
          What should we call you?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter your name..."
            className="flex-1 bg-[#162236] border border-[#1a2d45] rounded-lg px-4 py-3 text-[#e0f2fe] placeholder:text-[#7da0c4]/50 focus:border-[#00ff41] focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-[#00ff41] text-[#0a0e17] rounded-lg font-semibold hover:bg-[#00cc3a] transition-colors flex items-center gap-2"
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-2 text-left">{error}</p>}
      </div>

      <p className="text-xs text-[#7da0c4]/50 mt-4">
        Your data is stored locally on your device only.
      </p>
    </motion.div>
  );
}

// Step 2: Consent / Richtlinien
function ConsentStep({ name, onNext }: { name: string; onNext: () => void }) {
  const [accepted, setAccepted] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const guidelines = [
    {
      icon: BookOpen,
      title: 'Learning Commitment',
      text: 'PentestGym is designed for serious learners preparing for CompTIA and other cybersecurity certifications. Regular practice is essential for success.'
    },
    {
      icon: Eye,
      title: 'AI-Generated Content',
      text: 'While our AI professors provide high-quality guidance, always verify critical information against official documentation. AI can make mistakes.'
    },
    {
      icon: Shield,
      title: 'Ethical Use',
      text: 'All attack techniques taught here are for authorized penetration testing and defensive purposes only. Never use these skills illegally or without explicit permission.'
    },
    {
      icon: Lock,
      title: 'Data Privacy',
      text: 'Your learning data (progress, quiz results, chat history) is stored only in your browser\'s localStorage. We do not collect or transmit your personal data.'
    },
    {
      icon: AlertTriangle,
      title: 'No Guarantee',
      text: 'While we strive for 99% exam readiness, passing your certification exam depends on your effort, preparation, and exam-day performance.'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-lg mx-auto"
    >
      <h2 className="text-2xl font-bold text-[#e0f2fe] mb-2 text-center">
        Academy Guidelines
      </h2>
      <p className="text-[#7da0c4] mb-6 text-center">
        Hi {name}, please review our learning principles before proceeding.
      </p>

      <div className="space-y-3 mb-6">
        {guidelines.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0d1526] border border-[#1a2d45] rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full p-4 flex items-center gap-3 text-left hover:bg-[#162236]/50 transition-colors"
            >
              <item.icon size={20} className="text-[#00d4ff] shrink-0" />
              <span className="text-[#e0f2fe] font-medium flex-1">{item.title}</span>
              <ChevronRight
                size={16}
                className={`text-[#7da0c4] transition-transform ${expanded === i ? 'rotate-90' : ''}`}
              />
            </button>
            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-4 text-sm text-[#7da0c4]">{item.text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-3 p-4 bg-[#162236]/50 rounded-lg cursor-pointer mb-6">
        <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center transition-colors ${
          accepted ? 'bg-[#00ff41] border-[#00ff41]' : 'border-[#7da0c4]'
        }`}>
          {accepted && <Check size={14} className="text-[#0a0e17]" />}
        </div>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="sr-only"
        />
        <span className="text-sm text-[#e0f2fe]">
          I understand and agree to follow these guidelines. I commit to using this platform for ethical learning purposes only.
        </span>
      </label>

      <button
        onClick={onNext}
        disabled={!accepted}
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          accepted
            ? 'bg-[#00ff41] text-[#0a0e17] hover:bg-[#00cc3a]'
            : 'bg-[#162236] text-[#7da0c4] cursor-not-allowed'
        }`}
      >
        {accepted ? 'Continue to Academy' : 'Please accept the guidelines to continue'}
      </button>
    </motion.div>
  );
}

// Step 3: AI Orchestrator Introduction
function OrchestratorStep({ name, onComplete }: { name: string; onComplete: () => void }) {
  const [typingComplete, setTypingComplete] = useState(false);
  const message = `Welcome to PentestGym, ${name}. I am your AI Learning Orchestrator. I will analyze your skills and connect you with the perfect professor for your journey. Let's begin with a quick assessment to personalize your learning experience.`;

  useEffect(() => {
    const timer = setTimeout(() => setTypingComplete(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto text-center"
    >
      {/* Orchestrator Avatar */}
      <motion.div
        animate={{
          boxShadow: ['0 0 20px rgba(0,212,255,0.3)', '0 0 40px rgba(0,212,255,0.5)', '0 0 20px rgba(0,212,255,0.3)']
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#8b5cf6] mx-auto mb-6 flex items-center justify-center"
      >
        <Brain size={48} className="text-white" />
      </motion.div>

      <h2 className="text-2xl font-bold text-[#e0f2fe] mb-4">
        AI Orchestrator
      </h2>

      {/* Typing effect */}
      <div className="bg-[#0d1526] border border-[#1a2d45] rounded-xl p-6 mb-6 text-left">
        <p className="text-[#e0f2fe] leading-relaxed">
          {typingComplete ? message : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {message.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>
          )}
        </p>
      </div>

      <AnimatePresence>
        {typingComplete && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="px-8 py-3 bg-gradient-to-r from-[#00ff41] to-[#00d4ff] text-[#0a0e17] rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Enter the Academy
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Main Onboarding Flow
export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleNameSubmit = (studentName: string) => {
    setName(studentName);
    localStorage.setItem('trygit_student_name', studentName);
    setStep(1);
  };

  const handleConsent = () => {
    localStorage.setItem('trygit_consent_given', 'true');
    setStep(2);
  };

  const handleComplete = () => {
    localStorage.setItem('trygit_onboarding_complete', 'true');
    navigate('/classroom');
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${
            i === step ? 'bg-[#00ff41]' : i < step ? 'bg-[#00d4ff]' : 'bg-[#1a2d45]'
          }`} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 0 && <NameStep key="name" onNext={handleNameSubmit} />}
          {step === 1 && <ConsentStep key="consent" name={name} onNext={handleConsent} />}
          {step === 2 && <OrchestratorStep key="orchestrator" name={name} onComplete={handleComplete} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
