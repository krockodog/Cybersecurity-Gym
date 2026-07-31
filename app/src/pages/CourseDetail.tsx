// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  Users,
  Clock,
  Award,
  Play,
  FileText,
  Layers,
  Crosshair,
  Shield,
  Wifi,
  Wrench,
  Terminal,
  Globe,
  Lock,
  Search,
  Target,
  Zap,
  GraduationCap,
  CheckCircle,
  Brain,
  BarChart3,
  FlaskConical,
  Cpu,
  MessageSquare,
  Clipboard,
  ArrowRight,
  Trophy,
} from 'lucide-react';

interface StudyGuideChapter {
  id: string;
  title: string;
  topics: string[];
}

interface ExamSimulator {
  id: string;
  name: string;
  questions: number;
  time_limit: number;
  type: string;
}

interface DomainPractice {
  id: string;
  name: string;
  domain_filter: string;
}

interface FlashcardSet {
  id: string;
  name: string;
  count: number;
}

interface PBQItem {
  id: string;
  name: string;
}

interface Cheatsheet {
  id: string;
  title: string;
  content: string;
}

interface CourseDomain {
  name: string;
  weight: string;
}

interface CourseModules {
  exam_simulators: ExamSimulator[];
  domain_practice: DomainPractice[];
  study_guide: StudyGuideChapter[];
  flashcard_sets: FlashcardSet[];
  pbqs: PBQItem[];
  cheatsheets: Cheatsheet[];
}

interface Course {
  id: string;
  title: string;
  short_title: string;
  exam_code: string;
  certification_body: string;
  wing_id: string;
  color: string;
  icon: string;
  instructor: string;
  description: string;
  level: string;
  category: string;
  enrolled_students: number;
  rating: number;
  total_questions: number;
  total_pbqs: number;
  total_flashcards: number;
  passing_score: string;
  exam_duration: string;
  status: string;
  quiz_cert_key: string | null;
  domains: CourseDomain[];
  modules: CourseModules;
  includes: string[];
  professors: string[];
  special_route?: string;
}

const ICON_MAP: Record<string, any> = {
  Crosshair, Shield, Search, Lock, Wifi, Wrench, Terminal, Globe,
};

type TabId = 'overview' | 'simulators' | 'practice' | 'study-guide' | 'flashcards' | 'pbqs' | 'cheatsheets';

interface TabDef {
  id: TabId;
  label: string;
  icon: any;
  count?: number;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [expandedCheatsheet, setExpandedCheatsheet] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch('/courses.json')
      .then(r => r.json())
      .then(data => {
        if (ignore) return;
        const found = data.courses.find((c: Course) => c.id === courseId);
        setCourse(found || null);
        setLoading(false);
      })
      .catch(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [courseId]);

  const tabs = useMemo<TabDef[]>(() => {
    if (!course) return [];
    return [
      { id: 'overview', label: 'Übersicht', icon: BookOpen },
      { id: 'simulators', label: 'Exam Simulatoren', icon: FlaskConical, count: course.modules.exam_simulators.length },
      { id: 'practice', label: 'Domain Practice', icon: Target, count: course.modules.domain_practice.length },
      { id: 'study-guide', label: 'Study Guide', icon: FileText, count: course.modules.study_guide.length },
      { id: 'flashcards', label: 'Lernkarten', icon: Layers, count: course.modules.flashcard_sets.length },
      ...(course.modules.pbqs.length > 0 ? [{ id: 'pbqs' as TabId, label: 'PBQs', icon: Cpu, count: course.modules.pbqs.length }] : []),
      ...(course.modules.cheatsheets.length > 0 ? [{ id: 'cheatsheets' as TabId, label: 'Cheatsheets', icon: Clipboard, count: course.modules.cheatsheets.length }] : []),
    ];
  }, [course]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#7da0c4] font-body">Kurs nicht gefunden.</p>
        <button onClick={() => navigate('/courses')} className="text-[#00ff41] font-body hover:underline">
          Zurück zur Kursübersicht
        </button>
      </div>
    );
  }

  const IconComponent = ICON_MAP[course.icon] || BookOpen;
  let progress: { totalAnswered?: number; totalCorrect?: number } = {};
  try {
    progress = JSON.parse(localStorage.getItem(`trygit-quiz-progress-${course.quiz_cert_key}`) || '{}');
  } catch {
    progress = {};
  }
  const questionsAnswered = progress.totalAnswered || 0;
  const correctRate = progress.totalCorrect && progress.totalAnswered
    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
    : 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <button
          onClick={() => navigate('/courses')}
          className="flex items-center gap-1.5 text-[#4a6682] hover:text-[#00ff41] transition-colors font-body text-sm"
        >
          <ChevronLeft size={16} />
          Zurück zu Kurse
        </button>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-[#1a2d45]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f38] to-[#0a1628]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background: `radial-gradient(circle at 80% 50%, ${course.color} 0%, transparent 50%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${course.color}15`, color: course.color }}
                >
                  <IconComponent size={28} />
                </div>
                <div>
                  <span className="text-xs font-terminal tracking-wider uppercase" style={{ color: course.color }}>
                    {course.certification_body} {course.exam_code}
                  </span>
                  <span className="text-[#4a6682] text-xs ml-2">by {course.instructor}</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                {course.title}
              </h1>
              <p className="text-[#7da0c4] font-body text-base mb-6 max-w-2xl">{course.description}</p>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-[#f59e0b] fill-[#f59e0b]" />
                  <span className="text-[#f59e0b] font-display font-bold">{course.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-[#7da0c4] text-sm">
                  <Users size={14} />
                  <span className="font-body">{course.enrolled_students.toLocaleString()} Students</span>
                </div>
                <div className="flex items-center gap-1 text-[#7da0c4] text-sm">
                  <Clock size={14} />
                  <span className="font-body">{course.exam_duration}</span>
                </div>
                <div className="flex items-center gap-1 text-[#7da0c4] text-sm">
                  <Award size={14} />
                  <span className="font-body">Passing: {course.passing_score}</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3">
                {course.quiz_cert_key && (
                  <button
                    onClick={() => navigate(course.special_route || `/quiz?cert=${course.quiz_cert_key}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-body font-semibold text-sm transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: course.color, color: '#fff' }}
                  >
                    <Play size={16} />
                    Quiz starten
                  </button>
                )}
                {course.professors[0] && (
                  <button
                    onClick={() => navigate(`/tutor?professor=${course.professors[0]}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#162236] text-white font-body font-semibold text-sm border border-[#1a2d45] hover:border-[#2a4a6b] transition-all duration-200"
                  >
                    <MessageSquare size={16} />
                    KI-Tutor
                  </button>
                )}
                <button
                  onClick={() => navigate('/flashcards')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#162236] text-white font-body font-semibold text-sm border border-[#1a2d45] hover:border-[#2a4a6b] transition-all duration-200"
                >
                  <Layers size={16} />
                  Lernkarten
                </button>
              </div>
            </div>

            {/* Right: Progress Card */}
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="rounded-xl border border-[#1a2d45] bg-[#0d1526] p-5">
                <h3 className="text-white font-display font-bold text-sm mb-4">Dein Fortschritt</h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7da0c4] font-body">Fragen beantwortet</span>
                      <span className="text-white font-display">{questionsAnswered} / {course.total_questions}</span>
                    </div>
                    <div className="h-2 bg-[#162236] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${course.total_questions > 0 ? Math.min(100, (questionsAnswered / course.total_questions) * 100) : 0}%`,
                          backgroundColor: course.color,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#7da0c4] font-body">Richtig-Quote</span>
                      <span className="text-white font-display">{correctRate}%</span>
                    </div>
                    <div className="h-2 bg-[#162236] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${correctRate}%`,
                          backgroundColor: correctRate >= 83 ? '#22c55e' : correctRate >= 60 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Includes */}
                <div className="mt-5 pt-4 border-t border-[#1a2d45]">
                  <h4 className="text-[#7da0c4] text-xs font-body mb-2">Kurs beinhaltet:</h4>
                  <ul className="space-y-1.5">
                    {course.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle size={12} style={{ color: course.color }} />
                        <span className="text-[#7da0c4] font-body">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1a2d45] bg-[#0b1422] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto no-scrollbar gap-1">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-body whitespace-nowrap border-b-2 transition-all duration-200 ${
                    active
                      ? 'border-[#00ff41] text-[#00ff41]'
                      : 'border-transparent text-[#7da0c4] hover:text-white'
                  }`}
                >
                  <TabIcon size={16} />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-terminal ${
                      active ? 'bg-[#00ff41]/20 text-[#00ff41]' : 'bg-[#162236] text-[#4a6682]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Domain Breakdown */}
              <div>
                <h2 className="text-white font-display font-bold text-lg mb-4">Exam Domains</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.domains.map((domain, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[#1a2d45] bg-[#0d1526] hover:border-[#2a4a6b] transition-colors cursor-pointer"
                      onClick={() => {
                        if (course.quiz_cert_key) {
                          navigate(`/quiz?cert=${course.quiz_cert_key}&domain=${encodeURIComponent(domain.name)}`);
                        }
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                        style={{ backgroundColor: `${course.color}15`, color: course.color }}
                      >
                        D{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-body text-sm truncate">{domain.name}</div>
                        <div className="text-[#4a6682] text-xs font-terminal">{domain.weight} of exam</div>
                      </div>
                      <ChevronRight size={16} className="text-[#4a6682]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div>
                <h2 className="text-white font-display font-bold text-lg mb-4">Lernmodule</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: FlaskConical, label: 'Exam Simulator', count: course.modules.exam_simulators.length, tab: 'simulators' as TabId, color: '#ef4444' },
                    { icon: Target, label: 'Domain Practice', count: course.modules.domain_practice.length, tab: 'practice' as TabId, color: '#f59e0b' },
                    { icon: FileText, label: 'Study Guide', count: course.modules.study_guide.length, tab: 'study-guide' as TabId, color: '#3b82f6' },
                    { icon: Layers, label: 'Lernkarten', count: course.modules.flashcard_sets.length, tab: 'flashcards' as TabId, color: '#8b5cf6' },
                    ...(course.modules.pbqs.length > 0 ? [{ icon: Cpu, label: 'PBQs', count: course.modules.pbqs.length, tab: 'pbqs' as TabId, color: '#ec4899' }] : []),
                    ...(course.modules.cheatsheets.length > 0 ? [{ icon: Clipboard, label: 'Cheatsheets', count: course.modules.cheatsheets.length, tab: 'cheatsheets' as TabId, color: '#14b8a6' }] : []),
                  ].map((mod, i) => {
                    const ModIcon = mod.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => setActiveTab(mod.tab)}
                        className="flex flex-col items-center gap-2 p-5 rounded-xl border border-[#1a2d45] bg-[#0d1526] hover:border-[#2a4a6b] transition-all duration-200 group"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${mod.color}15`, color: mod.color }}
                        >
                          <ModIcon size={24} />
                        </div>
                        <span className="text-white font-body text-sm font-medium">{mod.label}</span>
                        <span className="text-[#4a6682] text-xs font-terminal">
                          {mod.count} {mod.count === 1 ? 'Modul' : 'Module'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'simulators' && (
            <motion.div
              key="simulators"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-white font-display font-bold text-lg mb-2">Exam Simulatoren</h2>
              <p className="text-[#7da0c4] font-body text-sm mb-6">
                Simuliere die echte Prüfung unter realistischen Bedingungen mit Timer und Bestehensgrenze.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.modules.exam_simulators.map((sim, i) => (
                  <div
                    key={sim.id}
                    className="rounded-xl border border-[#1a2d45] bg-[#0d1526] p-5 hover:border-[#2a4a6b] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold"
                        style={{ backgroundColor: `${course.color}15`, color: course.color }}
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-body font-semibold text-sm">{sim.name}</h3>
                        <p className="text-[#4a6682] text-xs font-terminal">
                          {sim.questions} Fragen | {sim.time_limit} Min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#7da0c4] mb-4 font-body">
                      <Clock size={12} />
                      <span>Zeitlimit: {sim.time_limit} Minuten</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#7da0c4] mb-4 font-body">
                      <Trophy size={12} />
                      <span>Bestehen: {course.passing_score}</span>
                    </div>
                    {course.quiz_cert_key && (
                      <button
                        onClick={() => navigate(`/quiz?cert=${course.quiz_cert_key}&mode=simulator`)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-body font-semibold text-sm transition-all duration-200 hover:brightness-110"
                        style={{ backgroundColor: course.color, color: '#fff' }}
                      >
                        <Play size={14} />
                        Simulator starten
                      </button>
                    )}
                  </div>
                ))}
                {course.modules.exam_simulators.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FlaskConical size={40} className="text-[#1a2d45] mx-auto mb-3" />
                    <p className="text-[#4a6682] font-body">Exam Simulatoren kommen bald.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'practice' && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-white font-display font-bold text-lg mb-2">Domain Practice</h2>
              <p className="text-[#7da0c4] font-body text-sm mb-6">
                Übe gezielt nach Exam-Domain. Fokussiere dich auf deine schwachen Bereiche.
              </p>
              <div className="space-y-3">
                {course.modules.domain_practice.map((dp, i) => (
                  <button
                    key={dp.id}
                    onClick={() => course.quiz_cert_key && navigate(`/quiz?cert=${course.quiz_cert_key}&domain=${encodeURIComponent(dp.domain_filter)}`)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-[#1a2d45] bg-[#0d1526] hover:border-[#2a4a6b] transition-all duration-200 text-left group"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: `${course.color}15`, color: course.color }}
                    >
                      D{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-body text-sm font-medium">{dp.name}</div>
                      <div className="text-[#4a6682] text-xs font-terminal mt-0.5">
                        {course.domains.find(d => d.name === dp.domain_filter)?.weight || ''} of exam
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-[#4a6682] group-hover:text-[#00ff41] transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'study-guide' && (
            <motion.div
              key="study-guide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-white font-display font-bold text-lg mb-2">Study Guide</h2>
              <p className="text-[#7da0c4] font-body text-sm mb-6">
                Kompakter Leitfaden mit den wichtigsten Konzepten pro Domain.
              </p>
              <div className="space-y-3">
                {course.modules.study_guide.map((chapter) => {
                  const isExpanded = expandedChapter === chapter.id;
                  return (
                    <div
                      key={chapter.id}
                      className="rounded-xl border border-[#1a2d45] bg-[#0d1526] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#111d33] transition-colors"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${course.color}15`, color: course.color }}
                        >
                          <FileText size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-body text-sm font-medium">{chapter.title}</div>
                          <div className="text-[#4a6682] text-xs font-body mt-0.5">
                            {chapter.topics.length} Themen
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} className="text-[#4a6682]" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pl-16">
                              <ul className="space-y-2">
                                {chapter.topics.map((topic, ti) => (
                                  <li key={ti} className="flex items-start gap-2">
                                    <CheckCircle size={14} className="text-[#00ff41] mt-0.5 flex-shrink-0" />
                                    <span className="text-[#7da0c4] text-sm font-body">{topic}</span>
                                  </li>
                                ))}
                              </ul>
                              {course.professors[0] && (
                                <button
                                  onClick={() => navigate(`/tutor?professor=${course.professors[0]}&topic=${encodeURIComponent(chapter.title)}`)}
                                  className="mt-4 flex items-center gap-2 text-xs font-body font-semibold transition-colors hover:brightness-125"
                                  style={{ color: course.color }}
                                >
                                  <Brain size={14} />
                                  Mit KI-Tutor vertiefen
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-white font-display font-bold text-lg mb-2">Interaktive Lernkarten</h2>
              <p className="text-[#7da0c4] font-body text-sm mb-6">
                Spaced Repetition Lernkarten für effektives Lernen mit dem SM-2 Algorithmus.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.modules.flashcard_sets.map((fc) => (
                  <div
                    key={fc.id}
                    className="rounded-xl border border-[#1a2d45] bg-[#0d1526] p-5 hover:border-[#2a4a6b] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#8b5cf6]/10">
                        <Layers size={20} className="text-[#8b5cf6]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-body font-semibold text-sm truncate">{fc.name}</h3>
                        <p className="text-[#4a6682] text-xs font-terminal">{fc.count} Karten</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/flashcards')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#8b5cf6] text-white font-body font-semibold text-sm transition-all duration-200 hover:brightness-110"
                    >
                      <Play size={14} />
                      Lernen
                    </button>
                  </div>
                ))}
                {course.modules.flashcard_sets.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Layers size={40} className="text-[#1a2d45] mx-auto mb-3" />
                    <p className="text-[#4a6682] font-body">Lernkarten kommen bald.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'pbqs' && (
            <motion.div
              key="pbqs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-white font-display font-bold text-lg mb-2">Performance-Based Questions</h2>
              <p className="text-[#7da0c4] font-body text-sm mb-6">
                Interaktive Simulationen, die echte Prüfungs-PBQs nachstellen.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.modules.pbqs.map((pbq) => (
                  <button
                    key={pbq.id}
                    onClick={() => navigate('/pbq')}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#1a2d45] bg-[#0d1526] hover:border-[#ec4899] transition-all duration-200 text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ec4899]/10 flex-shrink-0">
                      <Cpu size={20} className="text-[#ec4899]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-body text-sm font-medium">{pbq.name}</div>
                      <div className="text-[#4a6682] text-xs font-body mt-0.5">Interaktive Simulation</div>
                    </div>
                    <ArrowRight size={16} className="text-[#4a6682] group-hover:text-[#ec4899] transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'cheatsheets' && (
            <motion.div
              key="cheatsheets"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-white font-display font-bold text-lg mb-2">Cheatsheets</h2>
              <p className="text-[#7da0c4] font-body text-sm mb-6">
                Kompakte Referenzkarten zum schnellen Nachschlagen.
              </p>
              <div className="space-y-4">
                {course.modules.cheatsheets.map((cs) => {
                  const isExpanded = expandedCheatsheet === cs.id;
                  return (
                    <div
                      key={cs.id}
                      className="rounded-xl border border-[#1a2d45] bg-[#0d1526] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedCheatsheet(isExpanded ? null : cs.id)}
                        className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#111d33] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#14b8a6]/10 flex-shrink-0">
                          <Clipboard size={16} className="text-[#14b8a6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-body text-sm font-medium">{cs.title}</div>
                        </div>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown size={16} className="text-[#4a6682]" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 prose prose-invert prose-sm max-w-none overflow-x-auto
                              [&_table]:w-full [&_table]:border-collapse
                              [&_th]:bg-[#162236] [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[#00ff41] [&_th]:text-xs [&_th]:font-terminal [&_th]:border [&_th]:border-[#1a2d45]
                              [&_td]:px-3 [&_td]:py-2 [&_td]:text-[#7da0c4] [&_td]:text-xs [&_td]:font-body [&_td]:border [&_td]:border-[#1a2d45]
                              [&_code]:bg-[#162236] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[#00ff41] [&_code]:text-xs [&_code]:font-terminal
                              [&_pre]:bg-[#0a1120] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto
                              [&_pre_code]:bg-transparent [&_pre_code]:p-0
                              [&_h2]:text-white [&_h2]:font-display [&_h2]:text-base [&_h2]:mt-4 [&_h2]:mb-2
                              [&_h3]:text-[#00d4ff] [&_h3]:font-display [&_h3]:text-sm
                              [&_strong]:text-white
                              [&_ol]:text-[#7da0c4] [&_ol]:text-sm
                              [&_li]:text-[#7da0c4] [&_li]:text-sm
                            ">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{cs.content}</ReactMarkdown>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
