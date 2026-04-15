# StarSprout Reading Valley (Polished MVP)

A colorful original voxel world for kindergarten literacy learning.

## Core learning goals

- Letter matching
- Phonics challenges
- CVC spelling
- Sight word reading

## Tech stack (fast prototype + scalable)

- **Vite + TypeScript + Three.js**
- Browser-native speech synthesis for voice prompts
- Browser localStorage for progress tracking

## Upgrades in this version

### 1) Terrain and biome variety
- Procedural voxel terrain with rolling hills, cliffs, curvy paths, ponds, and varied elevation.
- Block styles include grass, dirt, stone, sand, and water.

### 2) Visual quality
- Soft atmospheric fog and brighter sky palette.
- Improved warm ambient and directional lighting with soft shadows.
- Better third-person camera framing.
- Subtle bob/hover animations on interactive stations and guide marker.

### 3) Original world art
- Stylized procedural textures generated from canvas (no copied assets).
- Voxel trees, bushes, flowers, fences, stepping stones, and a small house.
- Whimsical child-friendly palette.

### 4) Player and guide
- More readable cute block avatar.
- Animated guide character with visible interaction ring.

### 5) UX/UI polish
- Title screen and Start Adventure flow.
- Quest panel showing station progress.
- Improved large child-friendly buttons and readable progress indicators.
- Reward popup and celebration confetti effect.

### 6) Education zones
- Distinct themed literacy stations:
  - **Letter Garden**
  - **Phonics Bridge**
  - **Sight Word House**
  - **Spelling Meadow**
- Improved right/wrong feedback messaging and reward feedback.

### 7) Code quality
- Refactored into modular game files (`terrain`, `decor`, `characters`, `activities`, `audio`, `state`, `ui`).
- Preserved MVP systems while making the codebase easier to extend.

## Controls

- Move: `Arrow keys` or `WASD`
- Interact/start station: `Space`, `Enter`, or `C`
- Build block: `B`

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
│       ├── state.ts
│       ├── terrain.ts
│       ├── types.ts
│       └── ui.ts
└── README.md
```

## Setup

1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Open the URL shown by Vite (usually `http://localhost:5173`).

Build and preview:

```bash
npm run build
npm run preview
```

## Originality note

This game is intentionally original and does not copy Minecraft branding, textures, UI, assets, or exact visual style.
