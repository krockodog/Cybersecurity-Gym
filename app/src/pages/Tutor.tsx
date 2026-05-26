// @ts-nocheck
/* ─────────────────────────────────────────────────────────────────────────── */
/*  1-on-1 AI Tutoring Center — Ollama Integration for trygit.me              */
/*  Sections: StatusBar | ProfessorSelector | Chat | WeaknessSidebar | Input   */
/* ─────────────────────────────────────────────────────────────────────────── */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpeakerButton } from '../components/SpeakerButton';
import {
  streamChat,
  createSystemPrompt,
  checkOllamaStatus,
  pullModel,
  PROFESSOR_PROMPTS,
  RECOMMENDED_MODELS,
} from '../services/ollama';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send,
  Mic,
  MicOff,
  PanelRightOpen,
  PanelRightClose,
  Target,
  BookOpen,
  Code,
  Zap,
  Shield,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ChevronDown,
  Download,
  Radio,
  WifiOff,
  MessageSquare,
  Keyboard,
  Award,
  TrendingUp,
  TrendingDown,
  Minimize2,
  Sparkles,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  Play,
  User,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────── */
/*  Types                                                               */
/* ─────────────────────────────────────────────────────────────────── */

interface Professor {
  id: string;
  name: string;
  nickname: string;
  wing: string;
  domain: string;
  experience: string;
  former: string;
  bio: string;
  teaching_style: string;
  personality: string;
  catchphrase: string;
  voice_id: string;
  voice_name: string;
  accent: string;
  color: string;
  avatar: string;
  specialties: string[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface OllamaStatus {
  available: boolean;
  models: string[];
  error?: string;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Helpers & localStorage                                               */
/* ─────────────────────────────────────────────────────────────────── */

function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const saveChat = (professorId: string, messages: Message[]) => {
  localStorage.setItem(`tutor_chat_${professorId}`, JSON.stringify(messages));
};

const loadChat = (professorId: string): Message[] => {
  try {
    return JSON.parse(localStorage.getItem(`tutor_chat_${professorId}`) || '[]');
  } catch {
    return [];
  }
};

const getWeaknesses = (): string[] => {
  try {
    const results = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    const wrongAnswers = results.filter((r: any) => !r.correct);
    return [...new Set(wrongAnswers.map((r: any) => r.domain || r.topic).filter(Boolean))];
  } catch {
    return [];
  }
};

const getStrengths = (): string[] => {
  try {
    const results = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    const rightAnswers = results.filter((r: any) => r.correct);
    return [...new Set(rightAnswers.map((r: any) => r.domain || r.topic).filter(Boolean))];
  } catch {
    return [];
  }
};

const getLPIWeaknesses = (): string[] => {
  try {
    const results = JSON.parse(localStorage.getItem('lpi1_results') || '[]');
    const wrongAnswers = results.filter((r: any) => !r.correct);
    return [...new Set(wrongAnswers.map((r: any) => r.domain || r.topic).filter(Boolean))];
  } catch {
    return [];
  }
};

const getLPIStrengths = (): string[] => {
  try {
    const results = JSON.parse(localStorage.getItem('lpi1_results') || '[]');
    const rightAnswers = results.filter((r: any) => r.correct);
    return [...new Set(rightAnswers.map((r: any) => r.domain || r.topic).filter(Boolean))];
  } catch {
    return [];
  }
};

const getOverallMastery = (): number => {
  try {
    const quizResults = JSON.parse(localStorage.getItem('quiz_results') || '[]');
    const lpiResults = JSON.parse(localStorage.getItem('lpi1_results') || '[]');
    const allResults = [...quizResults, ...lpiResults];
    if (allResults.length === 0) return 0;
    const correct = allResults.filter((r: any) => r.correct).length;
    return Math.round((correct / allResults.length) * 100);
  } catch {
    return 0;
  }
};

/* ─────────────────────────────────────────────────────────────────── */
/*  CircularProgress sub-component                                      */
/* ─────────────────────────────────────────────────────────────────── */

function CircularProgress({
  percentage,
  size = 100,
  strokeWidth = 8,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 80 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1a2d45"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{percentage}%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  CodeBlock — syntax highlighted code with copy button                */
/* ─────────────────────────────────────────────────────────────────── */

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-[#1a2d45] border border-[#2a3d55] text-[#8b9db8] hover:text-white hover:border-[#00d4ff] transition-all opacity-0 group-hover:opacity-100 z-10"
        title="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || 'bash'}
        PreTag="div"
        customStyle={{
          borderRadius: '10px',
          fontSize: '13px',
          padding: '16px',
          margin: 0,
          background: '#0d1117',
          border: '1px solid #1a2d45',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  MarkdownRenderer component                                          */
/* ─────────────────────────────────────────────────────────────────── */

function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <CodeBlock language={match[1]} value={String(children).replace(/\n$/, '')} />
          ) : (
            <code
              className="px-1.5 py-0.5 rounded bg-[#1a2d45] text-[#00d4ff] text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mt-4 mb-2 text-white">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mt-3 mb-2 text-[#00d4ff]">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-bold mt-2 mb-1 text-[#8b9db8]">{children}</h3>;
        },
        ul({ children }) {
          return <ul className="ml-5 mb-3 space-y-1 list-disc marker:text-[#00d4ff]">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="ml-5 mb-3 space-y-1 list-decimal marker:text-[#00d4ff]">{children}</ol>;
        },
        li({ children }) {
          return <li className="leading-relaxed">{children}</li>;
        },
        strong({ children }) {
          return <strong className="text-white font-bold">{children}</strong>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-[#00d4ff] pl-4 py-1 my-3 bg-[#111d2e] rounded-r-lg italic text-[#8b9db8]">
              {children}
            </blockquote>
          );
        },
        hr() {
          return <hr className="my-4 border-[#1a2d45]" />;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ─────────────────────────────────────────────────────────────────── */
/*  TypingIndicator                                                       */
/* ─────────────────────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      <motion.div
        className="w-2 h-2 rounded-full bg-[#00d4ff]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-[#00d4ff]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
      />
      <motion.div
        className="w-2 h-2 rounded-full bg-[#00d4ff]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  █████████  MAIN TUTOR COMPONENT  █████████                         */
/* ═══════════════════════════════════════════════════════════════════ */

export default function Tutor() {
  /* ── State ────────────────────────────────────────────────────── */
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<string>('cipher');
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    available: false,
    models: [],
  });
  const [isListening, setIsListening] = useState(false);
  const [showPullModal, setShowPullModal] = useState(false);
  const [pullModelName, setPullModelName] = useState('');
  const [isPulling, setIsPulling] = useState(false);
  const [professorDataLoaded, setProfessorDataLoaded] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const statusIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Derived state ────────────────────────────────────────────── */
  const currentProfessor = useMemo(
    () => professors.find((p) => p.id === selectedProfessor),
    [professors, selectedProfessor]
  );

  const allWeaknesses = useMemo(() => {
    const w1 = getWeaknesses();
    const w2 = getLPIWeaknesses();
    return [...new Set([...w1, ...w2])];
  }, [messages]);

  const allStrengths = useMemo(() => {
    const s1 = getStrengths();
    const s2 = getLPIStrengths();
    return [...new Set([...s1, ...s2])];
  }, [messages]);

  const masteryPercent = useMemo(() => getOverallMastery(), [messages]);

  /* ── Fetch professors.json on mount ───────────────────────────── */
  useEffect(() => {
    fetch('/professors.json')
      .then((r) => r.json())
      .then((data) => {
        setProfessors(data.professors || []);
        setProfessorDataLoaded(true);
      })
      .catch(() => {
        // Fallback: create basic professor objects from PROFESSOR_PROMPTS keys
        const fallback = Object.keys(PROFESSOR_PROMPTS).map((id) => ({
          id,
          name: `Professor ${id.charAt(0).toUpperCase() + id.slice(1)}`,
          nickname: 'The Mentor',
          wing: 'pentest',
          domain: 'General',
          experience: 'Experienced professional',
          former: 'Industry expert',
          bio: 'An experienced cybersecurity professional.',
          teaching_style: 'Patient and thorough.',
          personality: 'Encouraging and knowledgeable.',
          catchphrase: 'Knowledge is power.',
          voice_id: '',
          voice_name: '',
          accent: 'american',
          color: '#00d4ff',
          avatar: '',
          specialties: [],
        }));
        setProfessors(fallback);
        setProfessorDataLoaded(true);
      });
  }, []);

  /* ── Load chat for selected professor ─────────────────────────── */
  useEffect(() => {
    if (!selectedProfessor) return;
    const saved = loadChat(selectedProfessor);
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      // Send welcome message from professor
      const prof = professors.find((p) => p.id === selectedProfessor);
      if (prof) {
        const welcome: Message = {
          role: 'assistant',
          content: `**${prof.catchphrase}**\n\nHello! I'm ${prof.name} — *${prof.nickname}*. ${prof.bio}\n\n${prof.teaching_style}\n\nWhat would you like to learn about today? Ask me anything about **${prof.domain}**, or use the quick-action buttons above!`,
          timestamp: Date.now(),
        };
        setMessages([welcome]);
        saveChat(selectedProfessor, [welcome]);
      } else {
        setMessages([]);
      }
    }
  }, [selectedProfessor, professors]);

  /* ── Persist chat on change ───────────────────────────────────── */
  useEffect(() => {
    if (messages.length > 0 && selectedProfessor) {
      saveChat(selectedProfessor, messages);
    }
  }, [messages, selectedProfessor]);

  /* ── Auto-scroll to bottom ────────────────────────────────────── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  /* ── Ollama status polling ────────────────────────────────────── */
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkOllamaStatus();
      setOllamaStatus(status);
    };
    checkStatus();
    statusIntervalRef.current = setInterval(checkStatus, 30000);
    return () => {
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, []);

  /* ── Auto-resize textarea ─────────────────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [inputValue]);

  /* ── Keyboard shortcut ────────────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };
    const ta = textareaRef.current;
    ta?.addEventListener('keydown', handleKey);
    return () => ta?.removeEventListener('keydown', handleKey);
  });

  /* ── Voice input (Web Speech API) ─────────────────────────────── */
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInputValue(transcript);
    };

    recognition.start();
  };

  /* ── Send message ─────────────────────────────────────────────── */
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    if (!overrideText) {
      const ta = textareaRef.current;
      if (ta) ta.style.height = 'auto';
    }
    setIsStreaming(true);
    setStreamingContent('');

    // Check if Ollama is available
    if (!ollamaStatus.available) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `⚠️ **Ollama is not running.**\n\nPlease start Ollama first:\n\n\`\`\`bash\nollama serve\n\`\`\`\n\nOr install it:\n\`\`\`bash\ncurl -fsSL https://ollama.com/install.sh | sh\n\`\`\`\n\nThen pull a model:\n\`\`\`bash\nollama pull ${selectedModel}\n\`\`\``,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMsg]);
      setIsStreaming(false);
      return;
    }

    const weaknesses = focusMode ? allWeaknesses : [];
    const strengths = focusMode ? allStrengths : [];
    const systemPrompt = createSystemPrompt(selectedProfessor, weaknesses, strengths);
    const ollamaMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));

    let fullResponse = '';
    try {
      for await (const token of streamChat(selectedModel, systemPrompt, ollamaMessages)) {
        fullResponse += token;
        setStreamingContent(fullResponse);
      }
      const assistantMsg: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, assistantMsg]);
    } catch (err) {
      const errorMsg: Message = {
        role: 'assistant',
        content: `⚠️ **Connection lost.** Ollama stopped responding.\n\nPlease check:\n1. Is Ollama running? \`ollama serve\`
2. Is model \`${selectedModel}\` installed? \`ollama pull ${selectedModel}\`
3. Try a different model from the dropdown above.`,
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMsg]);
    }

    setIsStreaming(false);
    setStreamingContent('');
  }, [inputValue, messages, isStreaming, selectedProfessor, selectedModel, ollamaStatus.available, focusMode, allWeaknesses, allStrengths]);

  /* ── Quick action handlers ────────────────────────────────────── */
  const quickActions = useMemo(
    () => [
      {
        id: '8020',
        label: '80/20 Rule',
        icon: <Target size={16} />,
        prompt: `As ${currentProfessor?.name || 'my professor'}, explain the 80/20 rule for your domain (${currentProfessor?.domain || 'cybersecurity'}). What are the key 20% of concepts that will give me 80% of the results for my certification exam? Be specific and practical.`,
      },
      {
        id: 'weakness',
        label: 'Practice Weakness',
        icon: <Zap size={16} />,
        prompt: allWeaknesses.length > 0
          ? `I need help with my weakest areas: ${allWeaknesses.join(', ')}. Please create a focused practice exercise targeting these topics. Include explanations and test my understanding.`
          : `Please give me a challenging practice question about ${currentProfessor?.domain || 'your specialty area'}. I want to test my knowledge and find my weak spots.`,
      },
      {
        id: 'code',
        label: 'Code Example',
        icon: <Code size={16} />,
        prompt: `Show me a practical, real-world code example related to ${currentProfessor?.domain || 'cybersecurity'}. Make it something I can actually run and learn from. Explain each part of the code step by step.`,
      },
      {
        id: 'examtip',
        label: 'Exam Tip',
        icon: <Award size={16} />,
        prompt: `Give me a high-value exam preparation tip for the ${currentProfessor?.domain || 'cybersecurity'} certification. What do most students overlook? What's the most common pitfall? Be specific and actionable.`,
      },
      {
        id: 'explain',
        label: 'Explain Topic',
        icon: <BookOpen size={16} />,
        prompt: `Explain the most important concept in ${currentProfessor?.domain || 'your domain'} as if I'm a beginner. Break it down step by step with analogies and examples.`,
      },
    ],
    [currentProfessor, allWeaknesses]
  );

  const handleQuickAction = (prompt: string) => {
    if (isStreaming) return;
    setInputValue(prompt);
    // Small delay so user sees what was sent
    setTimeout(() => handleSend(prompt), 100);
  };

  /* ── Pull model handler ───────────────────────────────────────── */
  const handlePullModel = async () => {
    if (!pullModelName.trim()) return;
    setIsPulling(true);
    try {
      await pullModel(pullModelName.trim());
      const status = await checkOllamaStatus();
      setOllamaStatus(status);
      setShowPullModal(false);
      setPullModelName('');
    } catch (err: any) {
      alert(`Failed to pull model: ${err.message}`);
    }
    setIsPulling(false);
  };

  /* ═══════════════════════════════════════════════════════════════ */
  /*  RENDER                                                               */
  /* ═══════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#c7d2e4] flex flex-col">
      {/* ═══════ SECTION 1: OLLAMA STATUS BAR ═══════ */}
      <div className="shrink-0 border-b border-[#1a2332] bg-[#0d1219]">
        <div className="max-w-[1800px] mx-auto px-4 h-11 flex items-center justify-between">
          {/* Status */}
          <div className="flex items-center gap-3">
            {ollamaStatus.available ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-sm text-emerald-400 font-medium">Ollama Connected</span>
                {ollamaStatus.models.length > 0 && (
                  <span className="text-xs text-[#5a6a7d]">
                    {ollamaStatus.models.length} model{ollamaStatus.models.length !== 1 ? 's' : ''}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                <span className="text-sm text-red-400 font-medium">Ollama Offline</span>
                <span className="text-xs text-[#5a6a7d] hidden sm:inline">
                  Install: <code className="text-[#8b9db8] bg-[#1a2332] px-1.5 py-0.5 rounded">curl -fsSL https://ollama.com/install.sh | sh</code>
                </span>
              </>
            )}
          </div>

          {/* Model selector + Pull button */}
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-[#111d2e] border border-[#1a2d45] text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#00d4ff] transition-colors cursor-pointer"
            >
              {ollamaStatus.models.length > 0 ? (
                ollamaStatus.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))
              ) : (
                RECOMMENDED_MODELS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.size})
                  </option>
                ))
              )}
            </select>
            <button
              onClick={() => setShowPullModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111d2e] border border-[#1a2d45] hover:border-[#00d4ff] text-[#8b9db8] hover:text-[#00d4ff] rounded-lg text-sm transition-all"
              title="Install new model"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Pull</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ SECTION 2: PROFESSOR SELECTOR ═══════ */}
      <div className="shrink-0 border-b border-[#1a2332] bg-[#0d1219]/80 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#1a2d45] scrollbar-track-transparent">
            {professors.map((prof) => {
              const isSelected = prof.id === selectedProfessor;
              return (
                <motion.button
                  key={prof.id}
                  onClick={() => setSelectedProfessor(prof.id)}
                  className={`flex flex-col items-center gap-1.5 min-w-[80px] p-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'scale-110'
                      : 'opacity-60 hover:opacity-90 grayscale hover:grayscale-0'
                  }`}
                  whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg transition-shadow"
                    style={{
                      background: isSelected
                        ? `radial-gradient(circle, ${prof.color}33 0%, ${prof.color}11 70%)`
                        : '#111d2e',
                      boxShadow: isSelected
                        ? `0 0 20px ${prof.color}44, 0 0 40px ${prof.color}22, inset 0 0 0 2px ${prof.color}`
                        : 'inset 0 0 0 2px #1a2d45',
                    }}
                  >
                    {prof.avatar ? (
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <span
                      className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                      style={{ color: prof.color }}
                    >
                      {prof.name.charAt(0)}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap ${
                      isSelected ? 'text-white' : 'text-[#5a6a7d]'
                    }`}
                  >
                    {prof.name.split(' ').pop()}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════ MAIN LAYOUT: Chat + Sidebar ═══════ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Chat Area (flex-1) ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Professor info bar */}
          {currentProfessor && (
            <div className="shrink-0 px-4 py-2.5 border-b border-[#1a2332] bg-[#0d1219]/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: `${currentProfessor.color}22`,
                    color: currentProfessor.color,
                    boxShadow: `0 0 8px ${currentProfessor.color}33`,
                  }}
                >
                  {currentProfessor.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{currentProfessor.name}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#1a2332] text-[#8b9db8]">
                      {currentProfessor.nickname}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5a6a7d]">{currentProfessor.domain}</span>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-all ${
                  sidebarOpen
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'text-[#5a6a7d] hover:text-white hover:bg-[#1a2332]'
                }`}
                title="Toggle weakness analysis"
              >
                {sidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
              </button>
            </div>
          )}

          {/* ── Chat Messages ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[#1a2d45] scrollbar-track-transparent">
            {/* Welcome / Empty State */}
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-20"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                  style={{
                    background: `linear-gradient(135deg, ${currentProfessor?.color || '#00d4ff'}22, transparent)`,
                    boxShadow: `0 0 40px ${currentProfessor?.color || '#00d4ff'}11`,
                  }}
                >
                  <MessageSquare size={36} style={{ color: currentProfessor?.color || '#00d4ff' }} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  1-on-1 with {currentProfessor?.name || 'your AI Tutor'}
                </h2>
                <p className="text-[#8b9db8] max-w-md mb-6">
                  {currentProfessor?.bio || 'Select a professor to start learning.'}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111d2e] border border-[#1a2d45] text-sm text-[#8b9db8] hover:border-[#00d4ff] hover:text-white transition-all"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && currentProfessor && (
                  <div className="flex gap-3 max-w-[85%]">
                    {/* Professor avatar */}
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `${currentProfessor.color}22`,
                          color: currentProfessor.color,
                        }}
                      >
                        {currentProfessor.name.charAt(0)}
                      </div>
                    </div>
                    {/* Message bubble */}
                    <div
                      className="rounded-2xl rounded-tl-sm px-5 py-3.5 border border-[#1a2d45]/60"
                      style={{
                        background: '#111827',
                        borderLeft: `3px solid ${currentProfessor.color}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold" style={{ color: currentProfessor.color }}>
                          {currentProfessor.name}
                        </span>
                        <span className="text-[10px] text-[#5a6a7d]">
                          {timeLabel(msg.timestamp)}
                        </span>
                      </div>
                      <div className="text-[14px] leading-relaxed text-[#c7d2e4]">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#1a2d45]/40">
                        <SpeakerButton text={msg.content.replace(/[#*`]/g, '')} size={16} professorId={selectedProfessor} />
                      </div>
                    </div>
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="flex gap-3 max-w-[75%]">
                    <div className="rounded-2xl rounded-tr-sm px-5 py-3.5 bg-[#1a2d45] border border-[#234567]">
                      <div className="flex items-center gap-2 mb-1.5 justify-end">
                        <span className="text-[10px] text-[#5a6a7d]">
                          {timeLabel(msg.timestamp)}
                        </span>
                        <span className="text-xs font-semibold text-[#00d4ff]">You</span>
                      </div>
                      <p className="text-[14px] leading-relaxed text-[#c7d2e4] text-right">
                        {msg.content}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-full bg-[#1a2d45] flex items-center justify-center text-[#00d4ff]">
                        <User size={16} />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3 max-w-[85%]">
                  <div className="flex-shrink-0 mt-1">
                    {currentProfessor && (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          background: `${currentProfessor.color}22`,
                          color: currentProfessor.color,
                        }}
                      >
                        {currentProfessor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-5 py-3.5 border border-[#1a2d45]/60"
                    style={{
                      background: '#111827',
                      borderLeft: `3px solid ${currentProfessor?.color || '#00d4ff'}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: currentProfessor?.color || '#00d4ff' }}
                      >
                        {currentProfessor?.name || 'Professor'}
                      </span>
                      <span className="text-[10px] text-emerald-400 animate-pulse">typing...</span>
                    </div>
                    <div className="text-[14px] leading-relaxed text-[#c7d2e4]">
                      <MarkdownRenderer content={streamingContent} />
                      <span className="inline-block w-2 h-4 ml-0.5 bg-[#00d4ff] animate-pulse align-middle" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Typing indicator (before streaming content arrives) */}
            {isStreaming && !streamingContent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  {currentProfessor && (
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: `${currentProfessor.color}22`,
                        color: currentProfessor.color,
                      }}
                    >
                      {currentProfessor.name.charAt(0)}
                    </div>
                  )}
                  <div className="rounded-2xl rounded-tl-sm px-5 py-2 bg-[#111827] border border-[#1a2d45]/60">
                    <TypingIndicator />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── Quick Action Buttons ── */}
          <div className="shrink-0 px-4 py-2 border-t border-[#1a2332] bg-[#0d1219]/50">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.prompt)}
                  disabled={isStreaming}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111d2e] border border-[#1a2d45] text-xs text-[#8b9db8] hover:border-[#00d4ff] hover:text-white transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Chat Input ── */}
          <div className="shrink-0 border-t border-[#1a2332] bg-[#0d1219] px-4 py-3">
            <div className="max-w-[900px] mx-auto flex items-end gap-2">
              {/* Voice input button */}
              <button
                onClick={startVoiceInput}
                disabled={isStreaming || isListening}
                className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                    : 'bg-[#111d2e] border border-[#1a2d45] text-[#8b9db8] hover:border-[#00d4ff] hover:text-[#00d4ff]'
                }`}
                title={isListening ? 'Listening...' : 'Voice input'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Ask Professor ${currentProfessor?.name.split(' ').pop() || ''} anything...`}
                  disabled={isStreaming}
                  rows={1}
                  className="w-full bg-[#111d2e] border border-[#1a2d45] text-white placeholder-[#5a6a7d] rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-[#00d4ff] transition-colors resize-none text-[14px] leading-relaxed disabled:opacity-50"
                />
                {/* Keyboard hint */}
                <div className="absolute bottom-2 right-3 text-[10px] text-[#5a6a7d] pointer-events-none hidden sm:block">
                  <Keyboard size={12} className="inline mr-1" />
                  Enter
                </div>
              </div>

              {/* Send button */}
              <motion.button
                onClick={() => handleSend()}
                disabled={isStreaming || !inputValue.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                  inputValue.trim() && !isStreaming
                    ? 'bg-[#00d4ff] text-[#0a0e17] hover:bg-[#33ddff]'
                    : 'bg-[#111d2e] border border-[#1a2d45] text-[#5a6a7d] cursor-not-allowed'
                }`}
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ═══════ SECTION 3: WEAKNESS ANALYSIS SIDEBAR ═══════ */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-l border-[#1a2332] bg-[#0d1219] overflow-hidden flex-shrink-0"
            >
              <div className="w-[300px] h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#1a2d45] p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Target size={16} className="text-[#00d4ff]" />
                  Weakness Analysis
                </h3>

                {/* Overall Mastery */}
                <div className="flex flex-col items-center mb-6 p-4 rounded-xl bg-[#111827] border border-[#1a2d45]">
                  <span className="text-xs text-[#8b9db8] mb-3">Overall Mastery</span>
                  <CircularProgress percentage={masteryPercent} size={110} strokeWidth={10} />
                  <span className="text-xs text-[#5a6a7d] mt-2">
                    {masteryPercent >= 80
                      ? 'Excellent!'
                      : masteryPercent >= 50
                      ? 'Keep pushing!'
                      : masteryPercent > 0
                      ? 'Keep practicing!'
                      : 'Take quizzes to track progress'}
                  </span>
                </div>

                {/* Focus Mode Toggle */}
                <div className="mb-5 p-3 rounded-xl bg-[#111827] border border-[#1a2d45]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-[#00d4ff]" />
                      <span className="text-sm text-white font-medium">Focus Mode</span>
                    </div>
                    <button
                      onClick={() => setFocusMode(!focusMode)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        focusMode ? 'bg-[#00d4ff]' : 'bg-[#1a2d45]'
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
                        animate={{ left: focusMode ? 22 : 2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5a6a7d] mt-2">
                    When ON, your professor knows your weaknesses and will focus on them.
                  </p>
                </div>

                {/* Weak Topics */}
                {allWeaknesses.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                      <TrendingDown size={13} />
                      Weak Topics
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allWeaknesses.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strong Topics */}
                {allStrengths.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                      <TrendingUp size={13} />
                      Strong Topics
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {allStrengths.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* No data state */}
                {allWeaknesses.length === 0 && allStrengths.length === 0 && (
                  <div className="text-center py-8 text-[#5a6a7d]">
                    <HelpCircle size={32} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">No quiz data yet</p>
                    <p className="text-[11px] mt-1">
                      Take quizzes to see your strengths and weaknesses here.
                    </p>
                  </div>
                )}

                {/* Professor specialties */}
                {currentProfessor && currentProfessor.specialties.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-[#1a2d45]">
                    <h4 className="text-xs font-semibold text-[#8b9db8] mb-2">
                      {currentProfessor.name}'s Specialties
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentProfessor.specialties.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-1 rounded-lg bg-[#1a2d45] text-[#8b9db8] text-[11px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════ PULL MODEL MODAL ═══════ */}
      <AnimatePresence>
        {showPullModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPullModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111827] border border-[#1a2d45] rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-bold text-white mb-2">Pull Model</h3>
              <p className="text-sm text-[#8b9db8] mb-4">
                Install a new model from Ollama. This may take several minutes depending on your
                connection.
              </p>

              <div className="space-y-2 mb-4">
                <label className="text-xs text-[#8b9db8]">Recommended models:</label>
                <div className="flex flex-wrap gap-1.5">
                  {RECOMMENDED_MODELS.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => setPullModelName(m.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                        pullModelName === m.name
                          ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                          : 'border-[#1a2d45] text-[#8b9db8] hover:border-[#2a4d65]'
                      }`}
                    >
                      {m.name}
                      <span className="text-[#5a6a7d] ml-1">({m.size})</span>
                    </button>
                  ))}
                </div>
              </div>

              <input
                value={pullModelName}
                onChange={(e) => setPullModelName(e.target.value)}
                placeholder="Enter model name (e.g., llama3.2)"
                className="w-full bg-[#0a0e17] border border-[#1a2d45] text-white placeholder-[#5a6a7d] rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-[#00d4ff]"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPullModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#1a2d45] text-[#8b9db8] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePullModel}
                  disabled={!pullModelName.trim() || isPulling}
                  className="flex-1 py-2.5 rounded-xl bg-[#00d4ff] text-[#0a0e17] font-semibold hover:bg-[#33ddff] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {isPulling ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Pulling...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Pull
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
