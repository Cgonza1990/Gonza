# StarSprout Reading Valley (Polished MVP)

A colorful original voxel world for kindergarten literacy learning.

## Core learning goals

- Letter matching
- Phonics challenges
- CVC spelling
- Sight word reading

## New literacy journal features

- **Current Word Display** during activities:
  - large target word
  - letter-by-letter breakdown
  - optional phonics segmentation
- **Persistent Reading Journal** in local storage:
  - unlocked words
  - completed words
  - missed words
  - recent words
  - per-word mastery stats
- **Reading feedback card**:
  - completed word in large text
  - pronunciation button
  - example sentence
  - celebration effects
- **My Reading Journal panel** with tabs:
  - all
  - sight words
  - CVC words
  - phonics words
- **Parent/Teacher visibility**:
  - words practiced
  - words mastered
  - words needing review
  - recent activity history

## Tech stack

- **Vite + TypeScript + Three.js**
- Browser-native speech synthesis for voice prompts
- Browser localStorage for progress + reading journal

## Project structure

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── styles.css
│   └── game/
│       ├── activities.ts
│       ├── audio.ts
│       ├── characters.ts
│       ├── decor.ts
│       ├── journal.ts      # reading journal and word tracking
│       ├── state.ts
│       ├── terrain.ts
│       ├── types.ts
│       └── ui.ts
└── README.md
```

## Setup

```bash
npm install
npm run dev
```

Build/preview:

```bash
npm run build
npm run preview
```

## Originality note

This game is intentionally original and does not copy Minecraft branding, textures, UI, assets, or exact visual style.
