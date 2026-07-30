// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Users,
  Clock,
  Award,
  ChevronRight,
  Crosshair,
  Shield,
  Wifi,
  Wrench,
  Terminal,
  Globe,
  Lock,
  GraduationCap,
  Zap,
  BarChart3,
  FlaskConical,
  Layers,
  Target,
  TrendingUp,
} from 'lucide-react';

interface CourseDomain {
  name: string;
  weight: string;
  chapters: number;
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
  includes: string[];
  special_route?: string;
}

interface CoursesData {
  metadata: { total_courses: number };
  courses: Course[];
}

const ICON_MAP: Record<string, typeof Crosshair> = {
  Crosshair, Shield, Search, Lock, Wifi, Wrench, Terminal, Globe,
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: '#22c55e',
  'Entry-Level': '#3b82f6',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

const CATEGORIES = ['All', 'Offensive Security', 'Defensive Security', 'Blue Team / SOC', 'Enterprise Security', 'Networking', 'IT Fundamentals', 'Linux Administration', 'Cloud Security'];

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'students' | 'questions'>('alphabetical');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/courses.json')
      .then(r => r.json())
      .then((data: CoursesData) => {
        setCourses(data.courses);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    let result = courses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.exam_code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory);
    }
    switch (sortBy) {
      case 'students': return [...result].sort((a, b) => b.enrolled_students - a.enrolled_students);
      case 'questions': return [...result].sort((a, b) => b.total_questions - a.total_questions);
      default: return [...result].sort((a, b) => a.title.localeCompare(b.title));
    }
  }, [courses, searchQuery, selectedCategory, sortBy]);

  const totalQuestions = courses.reduce((s, c) => s + c.total_questions, 0);
  const totalStudents = courses.reduce((s, c) => s + c.enrolled_students, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00ff41] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-[#1a2d45]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d1f38] to-[#0a1628]" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #00ff41 1px, transparent 1px), radial-gradient(circle at 80% 20%, #00d4ff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen size={28} className="text-[#00ff41]" />
              <span className="text-[#00ff41] font-terminal text-sm tracking-wider uppercase">Course Catalog</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
              Cybersecurity <span className="text-[#00ff41]">Kursbibliothek</span>
            </h1>
            <p className="text-[#7da0c4] text-lg max-w-2xl mb-8">
              {courses.length} Zertifizierungskurse mit {totalQuestions.toLocaleString()}+ Fragen, KI-Tutoring,
              interaktiven Labs und Study Guides.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap gap-6">
              {[
                { icon: <BookOpen size={18} />, label: 'Kurse', value: courses.length, color: '#00ff41' },
                { icon: <FlaskConical size={18} />, label: 'Fragen', value: `${totalQuestions.toLocaleString()}+`, color: '#00d4ff' },
                { icon: <Users size={18} />, label: 'Studenten', value: `${Math.round(totalStudents / 1000)}K+`, color: '#f59e0b' },
                { icon: <Award size={18} />, label: 'Zertifizierungen', value: courses.filter(c => c.status === 'active').length, color: '#ec4899' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#162236]" style={{ color: stat.color }}>{stat.icon}</div>
                  <div>
                    <div className="text-white font-display font-bold text-lg">{stat.value}</div>
                    <div className="text-[#4a6682] text-xs">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6682]" />
            <input
              type="text"
              placeholder="Kurse durchsuchen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0d1526] border border-[#1a2d45] rounded-lg text-white placeholder-[#4a6682] focus:outline-none focus:border-[#00ff41] transition-colors font-body text-sm"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#4a6682]" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#0d1526] border border-[#1a2d45] rounded-lg text-[#7da0c4] px-3 py-2 text-sm focus:outline-none focus:border-[#00ff41] font-body"
            >
              <option value="alphabetical">Alphabetisch</option>
              <option value="students">Beliebtheit</option>
              <option value="questions">Fragenanzahl</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#00ff41] text-[#0a0e17] font-semibold'
                  : 'bg-[#162236] text-[#7da0c4] hover:bg-[#1d2f4a] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, i) => {
              const IconComponent = ICON_MAP[course.icon] || BookOpen;
              const isComingSoon = course.status === 'coming_soon';

              return (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => !isComingSoon && navigate(`/courses/${course.id}`)}
                  className={`group relative rounded-xl border overflow-hidden transition-all duration-300 ${
                    isComingSoon
                      ? 'border-[#1a2d45] opacity-60 cursor-not-allowed'
                      : 'border-[#1a2d45] hover:border-[#2a4a6b] cursor-pointer hover:shadow-lg hover:shadow-[rgba(0,0,0,0.3)]'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, #0d1526 0%, #101d33 100%)',
                  }}
                >
                  {/* Color accent top bar */}
                  <div className="h-1" style={{ background: `linear-gradient(90deg, ${course.color}, ${course.color}88)` }} />

                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${course.color}15`, color: course.color }}
                        >
                          <IconComponent size={22} />
                        </div>
                        <div>
                          <span
                            className="text-xs font-terminal tracking-wider uppercase"
                            style={{ color: course.color }}
                          >
                            {course.certification_body}
                          </span>
                          <h3 className="text-white font-display font-bold text-base leading-tight mt-0.5">
                            {course.short_title}
                          </h3>
                        </div>
                      </div>
                      {isComingSoon && (
                        <span className="px-2 py-1 rounded-md bg-[#162236] text-[#4a6682] text-[10px] font-terminal uppercase">
                          Coming Soon
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[#7da0c4] text-sm mb-4 line-clamp-2 font-body leading-relaxed">
                      {course.description}
                    </p>

                    {/* Level + Category */}
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-terminal font-bold uppercase"
                        style={{
                          backgroundColor: `${LEVEL_COLORS[course.level] || '#6b7280'}20`,
                          color: LEVEL_COLORS[course.level] || '#6b7280',
                        }}
                      >
                        {course.level}
                      </span>
                      <span className="text-[#4a6682] text-xs font-body">{course.category}</span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 rounded-lg bg-[#0a1120]">
                        <div className="text-white font-display font-bold text-sm">
                          {course.total_questions > 0 ? course.total_questions : '--'}
                        </div>
                        <div className="text-[#4a6682] text-[10px] font-body">Fragen</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-[#0a1120]">
                        <div className="text-white font-display font-bold text-sm">{course.domains.length}</div>
                        <div className="text-[#4a6682] text-[10px] font-body">Domains</div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-[#0a1120]">
                        <div className="text-white font-display font-bold text-sm">{course.exam_duration}</div>
                        <div className="text-[#4a6682] text-[10px] font-body">Dauer</div>
                      </div>
                    </div>

                    {/* Rating + Students */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#1a2d45]">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                        <span className="text-[#f59e0b] text-sm font-display font-bold">{course.rating}</span>
                        <span className="text-[#4a6682] text-xs font-body ml-1">
                          ({(course.enrolled_students / 1000).toFixed(0)}K+ Students)
                        </span>
                      </div>
                      {!isComingSoon && (
                        <ChevronRight
                          size={18}
                          className="text-[#4a6682] group-hover:text-[#00ff41] transition-colors"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="text-[#1a2d45] mx-auto mb-4" />
            <p className="text-[#4a6682] font-body">Keine Kurse gefunden. Versuch andere Suchbegriffe.</p>
          </div>
        )}
      </div>
    </div>
  );
}
