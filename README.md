# StarSprout Reading Valley (MVP)

An **original voxel-based educational game** prototype for kindergarten learners, focused on:

- spelling (CVC words)
- phonics practice
- sight words
- early reading confidence
- letter collection and matching

## Why this stack (fastest prototype)

This MVP uses **Vite + TypeScript + Three.js** because it is one of the fastest ways to ship a browser-playable 3D voxel experience with simple setup and instant hot reload.

## MVP features implemented

- 3D colorful voxel world (custom code, original palette and props)
- Exploration with simple child-friendly controls
- Building mode (place blocks)
- Collecting letters
- Learning activity pads in the world:
  - letter matching
  - phonics prompt
  - CVC spelling
  - sight word recognition
- Friendly voice prompts via browser speech synthesis
- Reward system:
  - stars
  - badges
  - unlockable cosmetic items
- Parent/Teacher settings:
  - voice on/off
  - difficulty
  - music volume
  - session length
- Local progress tracking via browser storage

## Controls

- Move: `Arrow keys` or `WASD`
- Interact / start activity: `Space` (or `Enter`)
- Build block: `B`
- Collect/interact shortcut: `C`

## Project structure

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── src/
│   ├── main.ts        # game world, gameplay, learning logic, rewards, settings
│   └── styles.css     # UI + visual style
└── README.md
```

## Setup instructions

1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open the local URL shown by Vite (usually `http://localhost:5173`).

Build production bundle:

```bash
npm run build
```

Preview production bundle:

```bash
npm run preview
```

## Phase 2 improvements (next)

1. **Touch-first controls** for tablets (big on-screen buttons + tap-to-move).
2. **Guided reading quests** with short decodable mini-stories.
3. **More structured progression** (lesson map, mastery thresholds, adaptive difficulty).
4. **Expanded phonics system** (blends, digraphs, onset/rime segmentation).
5. **Teacher dashboard export** (CSV/PDF progress report by child profile).
6. **Accessibility upgrades**:
   - colorblind-safe palette modes
   - dyslexia-friendly font toggle
   - narration speed options.
7. **Content authoring JSON files** for educators to add words/prompts without code changes.
8. **Safe multi-profile mode** with PIN-protected parent gate.

## Originality note

This project intentionally avoids copying existing game branding, UI, mechanics one-to-one, or any third-party assets. All visuals and interactions in this prototype are custom and purpose-built for this educational concept.
