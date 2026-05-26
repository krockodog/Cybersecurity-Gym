export interface PBQProgress {
  pbqId: string;
  completed: boolean;
  score: number;
  attempts: number;
  bestScore: number;
  lastAttempt?: string;
}

export interface PBQMetadata {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'PenTest+' | 'Security+' | 'Network+';
  tags: string[];
  xpReward: number;
  estimatedTime: string;
}

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Expert',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'PenTest+': '#ff3366',
  'Security+': '#00ff41',
  'Network+': '#00d4ff',
};
