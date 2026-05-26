/* ═══════════════════════════════════════════
   Adaptive Learning Intelligence System

   Analyzes student performance patterns and
   creates personalized learning paths that
   optimize retention and exam readiness.
   ═══════════════════════════════════════════ */

import { useState, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────

export interface QuizResult {
  domain: string;
  subdomain: string;
  correct: boolean;
  timeSpent: number;
  questionId: string;
  timestamp?: string;
}

export interface Resource {
  type: 'quiz' | 'flashcard' | 'pbq' | 'reading';
  title: string;
  url: string;
}

export interface PathItem {
  domain: string;
  subdomain: string;
  topic: string;
  urgency: number;
  estimatedTime: number;
  resources: Resource[];
}

export interface DailyTarget {
  date: string;
  questions: number;
  domains: string[];
  focusAreas: string[];
  pbqPractice: boolean;
}

export interface Milestone {
  name: string;
  description: string;
  targetDate: string;
  requirements: string[];
  completed: boolean;
}

export interface LearningPath {
  priorityQueue: PathItem[];
  estimatedCompletion: Date;
  dailyTargets: DailyTarget[];
  milestones: Milestone[];
}

export interface StreakData {
  current: number;
  longest: number;
  lastStudyDate: string;
}

export interface SerializedState {
  userId: string;
  weakDomains: [string, number][];
  strongDomains: [string, number][];
  learningRate: number;
  retentionScore: number;
  examReadiness: number;
  recommendedDailyQuestions: number;
  estimatedExamDate: string | null;
  streakData: StreakData;
}

export interface LearningState {
  userId: string;
  weakDomains: Map<string, number>;
  strongDomains: Map<string, number>;
  learningRate: number;
  retentionScore: number;
  examReadiness: number;
  recommendedDailyQuestions: number;
  estimatedExamDate: Date | null;
  streakData: StreakData;
}

// ─── Subdomain maps ─────────────────────────

const SUBDOMAIN_MAP: Record<string, string[]> = {
  'Planning and Scoping': [
    'SOW & Legal',
    'Rules of Engagement',
    'Compliance',
    'Testing Types',
    'Impact Analysis',
  ],
  'Information Gathering': [
    'Nmap Scanning',
    'Passive Recon',
    'Vulnerability Scanning',
    'CVSS Scoring',
    'Web App Scanning',
  ],
  'Attacks and Exploits': [
    'SQL Injection',
    'XSS',
    'Command Injection',
    'Privilege Escalation',
    'Password Attacks',
    'Network Attacks',
    'Wireless Attacks',
    'Social Engineering',
  ],
  'Vulnerability Assessment': [
    'Scanning Methods',
    'Vuln Validation',
    'Risk Prioritization',
    'Remediation Planning',
  ],
  'Reporting and Communication': [
    'Executive Summary',
    'CVSS in Reports',
    'Remediation',
    'Evidence Collection',
  ],
  'Tools and Code Analysis': [
    'Python/Scapy',
    'PowerShell',
    'Wireshark',
    'Burp Suite',
    'Code Analysis',
  ],
};

const DOMAIN_KEYS: Record<string, string> = {
  'Planning and Scoping': 'planning_scoping',
  'Information Gathering': 'info_gathering',
  'Attacks and Exploits': 'attacks_exploits',
  'Vulnerability Assessment': 'vuln_assess',
  'Reporting and Communication': 'reporting',
  'Tools and Code Analysis': 'tools_code',
};

// ─── Storage key ────────────────────────────

const STORAGE_KEY = 'trygit_adaptive_state_v2';

// ═══════════════════════════════════════════
//  Adaptive Learning Engine
// ═══════════════════════════════════════════

export class AdaptiveLearningEngine {
  private state: LearningState;
  private readonly DOMAINS = [
    'Planning and Scoping',
    'Information Gathering',
    'Attacks and Exploits',
    'Vulnerability Assessment',
    'Reporting and Communication',
    'Tools and Code Analysis',
  ];

  constructor() {
    this.state = this.loadState();
  }

  // ─── Core API ───────────────────────────

  getState(): LearningState {
    return { ...this.state };
  }

  /** Analyze quiz results and update learning state */
  analyzeQuizResults(results: QuizResult[]): LearningState {
    const domainScores = new Map<string, { correct: number; total: number; timeTotal: number }>();

    for (const result of results) {
      const current = domainScores.get(result.domain) || { correct: 0, total: 0, timeTotal: 0 };
      current.total++;
      if (result.correct) current.correct++;
      current.timeTotal += result.timeSpent;
      domainScores.set(result.domain, current);
    }

    // Update weakness / strength maps
    for (const [domain, scores] of domainScores) {
      const accuracy = scores.correct / scores.total;
      if (accuracy < 0.7) {
        this.state.weakDomains.set(domain, 1 - accuracy);
        this.state.strongDomains.delete(domain);
      } else {
        this.state.strongDomains.set(domain, accuracy);
        this.state.weakDomains.delete(domain);
      }
    }

    // Calculate learning rate (questions per hour)
    const totalTime = Array.from(domainScores.values()).reduce((s, v) => s + v.timeTotal, 0);
    const totalQuestions = results.length;
    if (totalTime > 0) {
      this.state.learningRate = totalQuestions / (totalTime / 3600);
    }

    // Calculate exam readiness
    let totalWeight = 0;
    let weightedScore = 0;

    for (const domain of this.DOMAINS) {
      const scores = domainScores.get(domain) || { correct: 0, total: 0, timeTotal: 0 };
      const weight = this.getDomainWeight(domain);
      const accuracy = scores.total > 0 ? scores.correct / scores.total : 0;
      totalWeight += weight;
      weightedScore += accuracy * weight;
    }

    this.state.examReadiness = Math.min(1, Math.max(0, weightedScore / totalWeight));

    // Update streak
    this.updateStreak();

    // Adjust daily recommendations based on weakness count
    const weakCount = this.state.weakDomains.size;
    this.state.recommendedDailyQuestions = Math.min(50, Math.max(15, 15 + weakCount * 5));

    this.saveState();
    return { ...this.state };
  }

  /** Record a single quiz answer (convenience method) */
  recordAnswer(result: QuizResult): LearningState {
    return this.analyzeQuizResults([result]);
  }

  /** Generate a personalized learning path up to a target exam date */
  generateLearningPath(targetDate: Date): LearningPath {
    const weakDomains = Array.from(this.state.weakDomains.entries()).sort(
      (a, b) => b[1] - a[1]
    ); // Sort by weakness descending

    const path: LearningPath = {
      priorityQueue: [],
      estimatedCompletion: new Date(),
      dailyTargets: [],
      milestones: [],
    };

    // ── Priority queue ──
    for (const [domain, weakness] of weakDomains) {
      path.priorityQueue.push({
        domain,
        subdomain: this.getWeakestSubdomain(domain),
        topic: this.getRecommendedTopic(domain),
        urgency: Math.round(weakness * 100) / 100,
        estimatedTime: this.getStudyTime(domain),
        resources: this.getResources(domain),
      });
    }

    // Add strong domains at lower priority for retention
    for (const [domain, strength] of this.state.strongDomains.entries()) {
      if (!this.state.weakDomains.has(domain)) {
        path.priorityQueue.push({
          domain,
          subdomain: this.getWeakestSubdomain(domain),
          topic: this.getRecommendedTopic(domain),
          urgency: Math.round((1 - strength) * 0.3 * 100) / 100,
          estimatedTime: this.getStudyTime(domain) * 0.5,
          resources: this.getResources(domain),
        });
      }
    }

    // Sort priority queue
    path.priorityQueue.sort((a, b) => b.urgency - a.urgency);

    // ── Daily targets ──
    const daysUntilExam = Math.max(1, Math.ceil(
      (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));
    const dailyQ = this.state.recommendedDailyQuestions;

    for (let day = 0; day < daysUntilExam; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      path.dailyTargets.push({
        date: dateStr,
        questions: dailyQ,
        domains: this.getDomainsForDay(day, weakDomains),
        focusAreas: this.getFocusAreas(day, weakDomains),
        pbqPractice: day % 3 === 0, // PBQ practice every 3rd day
      });
    }

    // ── Milestones ──
    path.milestones = [
      {
        name: 'Foundation Complete',
        description: 'Score 70%+ in all domains',
        targetDate: this.getMilestoneDate(daysUntilExam, 0.3),
        requirements: ['70% in Planning & Scoping', '70% in Info Gathering', '70% in Attacks'],
        completed: false,
      },
      {
        name: 'Attack Mastery',
        description: 'Master Attacks and Exploits domain',
        targetDate: this.getMilestoneDate(daysUntilExam, 0.5),
        requirements: ['80% in Attacks & Exploits', 'Complete 5 PBQs', 'SQL Injection mastery'],
        completed: false,
      },
      {
        name: 'Vuln Assessment Ready',
        description: 'Demonstrate scanning & validation skills',
        targetDate: this.getMilestoneDate(daysUntilExam, 0.65),
        requirements: ['75% in Vulnerability Assessment', 'Complete Nessus scan PBQ'],
        completed: false,
      },
      {
        name: 'Exam Ready',
        description: 'Consistently score 85%+ across all domains',
        targetDate: this.getMilestoneDate(daysUntilExam, 0.8),
        requirements: ['85% overall readiness', 'All domains 75%+', 'All PBQs completed'],
        completed: false,
      },
    ];

    path.estimatedCompletion = targetDate;
    return path;
  }

  /** Get study recommendations for today */
  getTodaysFocus(): DailyTarget {
    const today = new Date().toISOString().split('T')[0];
    const examDate = this.state.estimatedExamDate
      ? new Date(this.state.estimatedExamDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const path = this.generateLearningPath(examDate);
    return path.dailyTargets.find((d) => d.date === today) || this.createDefaultTarget();
  }

  /** Get the full priority queue */
  getPriorityQueue(): PathItem[] {
    const examDate = this.state.estimatedExamDate
      ? new Date(this.state.estimatedExamDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.generateLearningPath(examDate).priorityQueue;
  }

  /** Get milestones */
  getMilestones(): Milestone[] {
    const examDate = this.state.estimatedExamDate
      ? new Date(this.state.estimatedExamDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return this.generateLearningPath(examDate).milestones;
  }

  /** Set estimated exam date */
  setExamDate(date: Date): void {
    this.state.estimatedExamDate = date;
    this.saveState();
  }

  /** Get streak data */
  getStreak(): StreakData {
    return { ...this.state.streakData };
  }

  /** Reset state (for testing) */
  resetState(): void {
    this.state = this.getDefaultState();
    localStorage.removeItem(STORAGE_KEY);
  }

  // ─── Private helpers ────────────────────

  private getDefaultState(): LearningState {
    return {
      userId: 'anonymous',
      weakDomains: new Map(),
      strongDomains: new Map(),
      learningRate: 0,
      retentionScore: 0,
      examReadiness: 0,
      recommendedDailyQuestions: 20,
      estimatedExamDate: null,
      streakData: { current: 0, longest: 0, lastStudyDate: '' },
    };
  }

  private loadState(): LearningState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SerializedState = JSON.parse(saved);
        return {
          userId: parsed.userId || 'anonymous',
          weakDomains: new Map(parsed.weakDomains || []),
          strongDomains: new Map(parsed.strongDomains || []),
          learningRate: parsed.learningRate || 0,
          retentionScore: parsed.retentionScore || 0,
          examReadiness: parsed.examReadiness || 0,
          recommendedDailyQuestions: parsed.recommendedDailyQuestions || 20,
          estimatedExamDate: parsed.estimatedExamDate ? new Date(parsed.estimatedExamDate) : null,
          streakData: parsed.streakData || { current: 0, longest: 0, lastStudyDate: '' },
        };
      }
    } catch {
      console.warn('[Adaptive] Failed to load state, starting fresh');
    }
    return this.getDefaultState();
  }

  private saveState(): void {
    try {
      const serialized: SerializedState = {
        userId: this.state.userId,
        weakDomains: Array.from(this.state.weakDomains.entries()),
        strongDomains: Array.from(this.state.strongDomains.entries()),
        learningRate: this.state.learningRate,
        retentionScore: this.state.retentionScore,
        examReadiness: this.state.examReadiness,
        recommendedDailyQuestions: this.state.recommendedDailyQuestions,
        estimatedExamDate: this.state.estimatedExamDate?.toISOString() ?? null,
        streakData: { ...this.state.streakData },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch {
      console.warn('[Adaptive] Failed to save state');
    }
  }

  /** CompTIA official domain weights */
  private getDomainWeight(domain: string): number {
    const weights: Record<string, number> = {
      'Planning and Scoping': 0.14,
      'Information Gathering': 0.22,
      'Attacks and Exploits': 0.30,
      'Vulnerability Assessment': 0.12,
      'Reporting and Communication': 0.12,
      'Tools and Code Analysis': 0.10,
    };
    return weights[domain] || 0.1;
  }

  private getWeakestSubdomain(domain: string): string {
    const subs = SUBDOMAIN_MAP[domain] || ['General'];
    // Deterministic but pseudo-random based on domain name
    const idx = domain.length % subs.length;
    return subs[idx];
  }

  private getRecommendedTopic(domain: string): string {
    const topics: Record<string, string> = {
      'Planning and Scoping': 'Scope management & legal compliance',
      'Information Gathering': 'Active & passive reconnaissance',
      'Attacks and Exploits': 'Injection attacks & privilege escalation',
      'Vulnerability Assessment': 'Scanning methods & risk prioritization',
      'Reporting and Communication': 'Executive summaries & CVSS scoring',
      'Tools and Code Analysis': 'Scripting & traffic analysis',
    };
    return topics[domain] || 'General review';
  }

  private getStudyTime(domain: string): number {
    const times: Record<string, number> = {
      'Planning and Scoping': 25,
      'Information Gathering': 35,
      'Attacks and Exploits': 45,
      'Vulnerability Assessment': 30,
      'Reporting and Communication': 20,
      'Tools and Code Analysis': 40,
    };
    return times[domain] || 30;
  }

  private getResources(domain: string): Resource[] {
    const key = DOMAIN_KEYS[domain] || domain.toLowerCase().replace(/\s+/g, '_');
    return [
      {
        type: 'quiz',
        title: `${domain} Practice Quiz`,
        url: `/quiz?domain=${key}`,
      },
      {
        type: 'flashcard',
        title: `${domain} Flashcards`,
        url: `/flashcards?domain=${key}`,
      },
      {
        type: 'reading',
        title: `${domain} Study Guide`,
        url: `/study/${key}`,
      },
    ];
  }

  private getDomainsForDay(day: number, weakDomains: [string, number][]): string[] {
    const domains: string[] = [];

    // Primary focus: weakest domain rotates
    if (weakDomains.length > 0) {
      const primary = weakDomains[day % weakDomains.length];
      if (primary) domains.push(primary[0]);
    }

    // Secondary: next weakest
    if (weakDomains.length > 1) {
      const secondary = weakDomains[(day + 1) % weakDomains.length];
      if (secondary) domains.push(secondary[0]);
    }

    // Tertiary: strong domain for retention (every 3rd day)
    if (day % 3 === 0) {
      for (const [domain] of this.state.strongDomains) {
        if (!domains.includes(domain)) {
          domains.push(domain);
          break;
        }
      }
    }

    // Fallback: ensure at least one domain
    if (domains.length === 0 && this.DOMAINS.length > 0) {
      domains.push(this.DOMAINS[day % this.DOMAINS.length]);
    }

    return domains;
  }

  private getFocusAreas(day: number, weakDomains: [string, number][]): string[] {
    const areas: string[] = [];

    // Add focus areas from weakest domains
    for (let i = 0; i < Math.min(2, weakDomains.length); i++) {
      const [domain] = weakDomains[i];
      const subdomain = this.getWeakestSubdomain(domain);
      if (subdomain) areas.push(`${domain} — ${subdomain}`);
    }

    // Rotate additional focus by day
    const extraTopics = [
      'Spaced repetition review',
      'Weak area drilling',
      'Mixed domain quiz',
      'PBQ walkthrough',
      'Speed practice',
    ];
    areas.push(extraTopics[day % extraTopics.length]);

    return areas;
  }

  private getMilestoneDate(totalDays: number, fraction: number): string {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(totalDays * fraction));
    return date.toISOString().split('T')[0];
  }

  private createDefaultTarget(): DailyTarget {
    return {
      date: new Date().toISOString().split('T')[0],
      questions: this.state.recommendedDailyQuestions || 20,
      domains: this.DOMAINS.slice(0, 2),
      focusAreas: ['Review weak areas', 'Mixed practice'],
      pbqPractice: false,
    };
  }

  private updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.state.streakData.lastStudyDate;

    if (!lastDate) {
      this.state.streakData.current = 1;
      this.state.streakData.lastStudyDate = today;
    } else if (lastDate === today) {
      // Already studied today — no change
    } else {
      const last = new Date(lastDate);
      const now = new Date(today);
      const diffMs = now.getTime() - last.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day
        this.state.streakData.current += 1;
        if (this.state.streakData.current > this.state.streakData.longest) {
          this.state.streakData.longest = this.state.streakData.current;
        }
      } else if (diffDays > 1) {
        // Streak broken
        this.state.streakData.current = 1;
      }
      this.state.streakData.lastStudyDate = today;
    }
  }
}

// ═══════════════════════════════════════════
//  React Hook
// ═══════════════════════════════════════════

export function useAdaptiveLearning() {
  const [engine] = useState(() => new AdaptiveLearningEngine());
  const [state, setState] = useState<LearningState>(() => engine.getState());
  const [todaysFocus, setTodaysFocus] = useState<DailyTarget>(() => engine.getTodaysFocus());

  const refresh = useCallback(() => {
    setState(engine.getState());
    setTodaysFocus(engine.getTodaysFocus());
  }, [engine]);

  const analyzeResults = useCallback(
    (results: QuizResult[]) => {
      const newState = engine.analyzeQuizResults(results);
      setState({ ...newState });
      setTodaysFocus(engine.getTodaysFocus());
      return newState;
    },
    [engine]
  );

  const recordAnswer = useCallback(
    (result: QuizResult) => {
      const newState = engine.recordAnswer(result);
      setState({ ...newState });
      setTodaysFocus(engine.getTodaysFocus());
      return newState;
    },
    [engine]
  );

  const setExamDate = useCallback(
    (date: Date) => {
      engine.setExamDate(date);
      refresh();
    },
    [engine, refresh]
  );

  const reset = useCallback(() => {
    engine.resetState();
    refresh();
  }, [engine, refresh]);

  // Refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(refresh, 300000);
    return () => clearInterval(interval);
  }, [refresh]);

  return {
    state,
    todaysFocus,
    refresh,
    analyzeResults,
    recordAnswer,
    setExamDate,
    reset,
    engine,
  };
}

// ─── Singleton for non-React usage ──────────

let globalEngine: AdaptiveLearningEngine | null = null;

export function getGlobalEngine(): AdaptiveLearningEngine {
  if (!globalEngine) {
    globalEngine = new AdaptiveLearningEngine();
  }
  return globalEngine;
}
