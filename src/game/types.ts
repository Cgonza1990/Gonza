import * as THREE from 'three';

export type ActivityType = 'letter' | 'phonics' | 'spelling' | 'sight';

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
};

export type Zone = {
  type: ActivityType | 'collect' | 'build' | 'npc';
  marker: THREE.Group;
  anchor: THREE.Vector3;
  label: string;
};
