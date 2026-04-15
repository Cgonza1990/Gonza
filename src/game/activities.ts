import type { ActivityType, Challenge, Settings } from './types';

export function challengePool(settings: Settings): Challenge[] {
  const spelling =
    settings.activityDifficulty === 'easy'
      ? { target: 'cat', choices: ['cat', 'cta', 'act'], segmentation: 'c-a-t', sentence: 'The cat naps.' }
      : { target: 'sun', choices: ['sun', 'uns', 'snu'], segmentation: 's-u-n', sentence: 'The sun is warm.' };

  return [
    {
      type: 'letter',
      prompt: 'Letter Garden: tap the letter that matches the sound /m/.',
      choices: ['m', 's', 't'],
      answer: 'm',
      voice: 'Welcome to Letter Garden. Find letter m.',
      category: 'phonics',
      segmentation: '/m/',
      sentence: 'M is for moon.'
    },
    {
      type: 'phonics',
      prompt: 'Phonics Bridge: which word starts with /s/?',
      choices: ['sun', 'cat', 'pig'],
      answer: 'sun',
      voice: 'Cross the bridge by choosing the word that begins with sss.',
      category: 'phonics',
      segmentation: '/s/-/u/-/n/',
      sentence: 'Sun is bright.'
    },
    {
      type: 'spelling',
      prompt: `Spelling Meadow: spell ${spelling.target}.`,
      choices: spelling.choices,
      answer: spelling.target,
      voice: `Let us spell ${spelling.target}.`,
      category: 'cvc',
      segmentation: spelling.segmentation,
      sentence: spelling.sentence
    },
    {
      type: 'sight',
      prompt: 'Sight Word House: choose the sight word "the".',
      choices: ['the', 'then', 'they'],
      answer: 'the',
      voice: 'Find the sight word the.',
      category: 'sight',
      segmentation: 'the',
      sentence: 'The dog runs.'
    }
  ];
}

export function zoneToActivity(zone: string): ActivityType | null {
  if (zone === 'letter' || zone === 'phonics' || zone === 'spelling' || zone === 'sight') return zone;
  return null;
}
