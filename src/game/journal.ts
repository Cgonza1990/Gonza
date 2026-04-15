import type { Challenge, ReadingJournal, WordCategory } from './types';

export const JOURNAL_KEY = 'starsprout-reading-journal-v1';

export const defaultJournal: ReadingJournal = {
  unlockedWords: [],
  completedWords: [],
  missedWords: [],
  recentWords: [],
  records: {},
  history: []
};

function uniquePush(arr: string[], value: string) {
  if (!arr.includes(value)) arr.push(value);
}

function remove(arr: string[], value: string) {
  const idx = arr.indexOf(value);
  if (idx >= 0) arr.splice(idx, 1);
}

export function touchWord(journal: ReadingJournal, challenge: Challenge, correct: boolean) {
  const word = challenge.answer.toLowerCase();
  const now = new Date().toISOString();
  const existing = journal.records[word] ?? {
    word,
    category: challenge.category,
    unlocked: true,
    completedCount: 0,
    missedCount: 0,
    mastered: false,
    lastPracticedAt: now,
    phonicsSegmentation: challenge.segmentation
  };

  existing.unlocked = true;
  existing.lastPracticedAt = now;
  existing.phonicsSegmentation = challenge.segmentation;

  if (correct) {
    existing.completedCount += 1;
    remove(journal.missedWords, word);
    uniquePush(journal.completedWords, word);
  } else {
    existing.missedCount += 1;
    uniquePush(journal.missedWords, word);
  }

  existing.mastered = existing.completedCount >= 2 && existing.missedCount <= 1;
  journal.records[word] = existing;

  uniquePush(journal.unlockedWords, word);
  remove(journal.recentWords, word);
  journal.recentWords.unshift(word);
  journal.recentWords = journal.recentWords.slice(0, 8);

  journal.history.unshift({ at: now, word, correct, category: existing.category as WordCategory });
  journal.history = journal.history.slice(0, 20);
}
