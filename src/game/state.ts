import type { ChildProgress, Settings, ActivityType, ReadingJournal } from './types';
import { defaultJournal, JOURNAL_KEY } from './journal';

export const STORAGE_KEY = 'starsprout-progress-v2';
export const SETTINGS_KEY = 'starsprout-settings-v2';

export const defaultProgress: ChildProgress = {
  stars: 0,
  badges: [],
  unlocks: ['Sticker: Rainbow Bee'],
  attempts: 0,
  completed: {}
};

export const defaultSettings: Settings = {
  voicePrompts: true,
  activityDifficulty: 'easy',
  musicVolume: 30,
  sessionMinutes: 15
};

export function loadJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadJournal(): ReadingJournal {
  return loadJson<ReadingJournal>(JOURNAL_KEY, defaultJournal);
}

export function save(progress: ChildProgress, settings: Settings, journal: ReadingJournal) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
}

export function award(progress: ChildProgress, type: ActivityType): { popup: string; burst: number } {
  progress.stars += 2;
  progress.attempts += 1;
  progress.completed[type] = (progress.completed[type] ?? 0) + 1;

  let popup = '⭐ +2 Great Reading!';
  let burst = 14;

  if (progress.stars >= 10 && !progress.badges.includes('Letter Explorer')) {
    progress.badges.push('Letter Explorer');
    progress.unlocks.push('Hat: Star Cap');
    popup = '🏅 Badge Unlocked: Letter Explorer';
    burst = 22;
  }

  if (progress.stars >= 20 && !progress.badges.includes('Reading Ranger')) {
    progress.badges.push('Reading Ranger');
    progress.unlocks.push('Companion: Firefly Buddy');
    popup = '🏆 Badge Unlocked: Reading Ranger';
    burst = 28;
  }

  return { popup, burst };
}
