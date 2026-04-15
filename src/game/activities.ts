import type { ActivityType, Challenge, Settings } from './types';

export function challengePool(settings: Settings): Challenge[] {
  const easySpelling = [
    { target: 'cat', choices: ['cat', 'cta', 'act'] },
    { target: 'map', choices: ['map', 'amp', 'pam'] }
  ];
  const normalSpelling = [
    { target: 'sun', choices: ['sun', 'uns', 'snu'] },
    { target: 'dog', choices: ['dog', 'god', 'dgo'] }
  ];

  const spelling = settings.activityDifficulty === 'easy' ? easySpelling[0] : normalSpelling[0];

  return [
    {
      type: 'letter',
      prompt: 'Letter Garden: tap the letter that matches the sound /m/.',
      choices: ['m', 's', 't'],
      answer: 'm',
      voice: 'Welcome to Letter Garden. Find letter m.'
    },
    {
      type: 'phonics',
      prompt: 'Phonics Bridge: which word starts with /s/?',
      choices: ['sun', 'cat', 'pig'],
      answer: 'sun',
      voice: 'Cross the bridge by choosing the word that begins with sss.'
    },
    {
      type: 'spelling',
      prompt: `Spelling Meadow: spell ${spelling.target}.`,
      choices: spelling.choices,
      answer: spelling.target,
      voice: `Let us spell ${spelling.target}.`
    },
    {
      type: 'sight',
      prompt: 'Sight Word House: choose the sight word "the".',
      choices: ['the', 'then', 'they'],
      answer: 'the',
      voice: 'Find the sight word the.'
    }
  ];
}

export function zoneToActivity(zone: string): ActivityType | null {
  if (zone === 'letter' || zone === 'phonics' || zone === 'spelling' || zone === 'sight') return zone;
  return null;
}
