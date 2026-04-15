import * as THREE from 'three';

export type ActivityType = 'letter' | 'phonics' | 'spelling' | 'sight';
export type WordCategory = 'sight' | 'cvc' | 'phonics';

export type ChildProgress = {
  stars: number;
  badges: string[];
  unlocks: string[];
  attempts: number;
  completed: Partial<Record<ActivityType, number>>;
};

export type Settings = {
  voicePrompts: boolean;
  activityDifficulty: 'easy' | 'normal';
  musicVolume: number;
  sessionMinutes: number;
};

export type Challenge = {
  type: ActivityType;
  prompt: string;
  choices: string[];
  answer: string;
  voice: string;
  category: WordCategory;
  segmentation?: string;
  sentence: string;
};

export type WordRecord = {
  word: string;
  category: WordCategory;
  unlocked: boolean;
  completedCount: number;
  missedCount: number;
  mastered: boolean;
  lastPracticedAt: string;
  phonicsSegmentation?: string;
};

export type ReadingJournal = {
  unlockedWords: string[];
  completedWords: string[];
  missedWords: string[];
  recentWords: string[];
  records: Record<string, WordRecord>;
  history: Array<{
    at: string;
    word: string;
    correct: boolean;
    category: WordCategory;
  }>;
};

export type Zone = {
  type: ActivityType | 'collect' | 'build' | 'npc';
  marker: THREE.Group;
  anchor: THREE.Vector3;
  label: string;
};
