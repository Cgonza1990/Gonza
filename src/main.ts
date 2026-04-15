import * as THREE from 'three';

type ActivityType = 'letter' | 'phonics' | 'spelling' | 'sight';

type ChildProgress = {
  stars: number;
  badges: string[];
  unlocks: string[];
  attempts: number;
  completed: Partial<Record<ActivityType, number>>;
};

type Settings = {
  voicePrompts: boolean;
  activityDifficulty: 'easy' | 'normal';
  musicVolume: number;
  sessionMinutes: number;
};

type Challenge = {
  type: ActivityType;
  prompt: string;
  choices: string[];
  answer: string;
  voice: string;
};

const STORAGE_KEY = 'starsprout-progress-v1';
const SETTINGS_KEY = 'starsprout-settings-v1';

const defaultProgress: ChildProgress = {
  stars: 0,
  badges: [],
  unlocks: ['Sticker: Rainbow Bee'],
  attempts: 0,
  completed: {}
};

const defaultSettings: Settings = {
  voicePrompts: true,
  activityDifficulty: 'easy',
  musicVolume: 30,
  sessionMinutes: 15
};

const app = document.getElementById('app');
if (!app) throw new Error('Missing app element');

app.innerHTML = `
  <div id="ui">
    <header>
      <h1>StarSprout Reading Valley</h1>
      <div id="hud">
        <span id="stars">⭐ 0</span>
        <span id="badges">🏅 0</span>
      </div>
    </header>

    <div id="controlsHint">Move: Arrow Keys / WASD · Interact: Space · Build: B · Collect: C</div>

    <section id="activityCard" class="panel hidden">
      <h2 id="activityTitle">Learning Time</h2>
      <p id="activityPrompt"></p>
      <div id="choices"></div>
      <div id="activityFeedback"></div>
    </section>

    <section id="inventoryCard" class="panel">
      <h3>Collection Bag</h3>
      <p id="collection">Letters: none</p>
    </section>

    <section id="teacherPanel" class="panel collapsed">
      <button id="toggleTeacher">Parent / Teacher Settings</button>
      <div id="teacherBody" class="hidden">
        <label>
          Voice Prompts
          <input id="voiceSetting" type="checkbox" />
        </label>
        <label>
          Difficulty
          <select id="difficultySetting">
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
          </select>
        </label>
        <label>
          Music Volume
          <input id="volumeSetting" type="range" min="0" max="100" />
        </label>
        <label>
          Session Minutes
          <input id="sessionSetting" type="number" min="5" max="45" />
        </label>
        <pre id="progressPanel"></pre>
      </div>
    </section>
  </div>
  <canvas id="world"></canvas>
`;

const canvas = document.getElementById('world') as HTMLCanvasElement;
const starsEl = document.getElementById('stars')!;
const badgesEl = document.getElementById('badges')!;
const collectionEl = document.getElementById('collection')!;
const activityCard = document.getElementById('activityCard')!;
const activityTitle = document.getElementById('activityTitle')!;
const activityPrompt = document.getElementById('activityPrompt')!;
const choicesEl = document.getElementById('choices')!;
const feedbackEl = document.getElementById('activityFeedback')!;
const progressPanel = document.getElementById('progressPanel')!;

const toggleTeacher = document.getElementById('toggleTeacher') as HTMLButtonElement;
const teacherBody = document.getElementById('teacherBody')!;
const voiceSetting = document.getElementById('voiceSetting') as HTMLInputElement;
const difficultySetting = document.getElementById('difficultySetting') as HTMLSelectElement;
const volumeSetting = document.getElementById('volumeSetting') as HTMLInputElement;
const sessionSetting = document.getElementById('sessionSetting') as HTMLInputElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#8fd3ff');

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 8, 12);

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff4d8, 1);
sun.position.set(20, 30, 5);
sun.castShadow = true;
scene.add(sun);

const voxelSize = 1;
const worldRadius = 12;
const worldBlocks: THREE.Mesh[] = [];

const groundMat = new THREE.MeshLambertMaterial({ color: '#72d572' });
const hillMat = new THREE.MeshLambertMaterial({ color: '#5abb5a' });
const waterMat = new THREE.MeshLambertMaterial({ color: '#59b7f5', transparent: true, opacity: 0.92 });
const learnPadMat = new THREE.MeshLambertMaterial({ color: '#ffcc66' });
const collectMat = new THREE.MeshLambertMaterial({ color: '#f17cb0' });
const buildMat = new THREE.MeshLambertMaterial({ color: '#8f7cff' });

function createVoxel(x: number, y: number, z: number, mat: THREE.Material): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  worldBlocks.push(mesh);
  return mesh;
}

for (let x = -worldRadius; x <= worldRadius; x++) {
  for (let z = -worldRadius; z <= worldRadius; z++) {
    createVoxel(x, -0.5, z, groundMat);
    const noise = Math.sin(x * 0.7) + Math.cos(z * 0.5);
    if (noise > 1.3 && Math.random() > 0.4) createVoxel(x, 0.5, z, hillMat);
    if (noise < -1.2 && Math.random() > 0.55) createVoxel(x, -0.2, z, waterMat);
  }
}

const zones = {
  letter: createVoxel(-6, 0.5, -4, learnPadMat),
  phonics: createVoxel(6, 0.5, -4, learnPadMat),
  spelling: createVoxel(-6, 0.5, 5, learnPadMat),
  sight: createVoxel(6, 0.5, 5, learnPadMat),
  build: createVoxel(0, 0.5, 0, buildMat),
  collect: createVoxel(0, 0.5, -8, collectMat)
};

const npc = new THREE.Group();
const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#ff9f43' }));
const hat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), new THREE.MeshLambertMaterial({ color: '#3b5bdb' }));
const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.1), new THREE.MeshLambertMaterial({ color: '#1f2937' }));
body.position.y = 1.2;
hat.position.y = 1.9;
eyes.position.set(0, 1.3, 0.52);
npc.add(body, hat, eyes);
npc.position.set(0, 0, 3);
scene.add(npc);

const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 1.4, 0.9),
  new THREE.MeshLambertMaterial({ color: '#ffffff' })
);
player.position.set(0, 0.7, 8);
scene.add(player);

let progress = loadJson<ChildProgress>(STORAGE_KEY, defaultProgress);
let settings = loadJson<Settings>(SETTINGS_KEY, defaultSettings);

const collectedLetters = new Set<string>();
const keys = new Set<string>();
let activeChallenge: Challenge | null = null;
let actionCooldown = 0;

const lettersToCollect = ['c', 'a', 't', 'm', 'a', 'p', 's'];
let collectIndex = 0;

function loadJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function speak(text: string) {
  if (!settings.voicePrompts) return;
  if (!('speechSynthesis' in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.85;
  utter.pitch = 1.15;
  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

function beep(success: boolean) {
  const ac = new AudioContext();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = success ? 'triangle' : 'square';
  osc.frequency.value = success ? 660 : 220;
  gain.gain.value = 0.03 * (settings.musicVolume / 100);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.18);
}

function updateHud() {
  starsEl.textContent = `⭐ ${progress.stars}`;
  badgesEl.textContent = `🏅 ${progress.badges.length}`;
  collectionEl.textContent = `Letters: ${Array.from(collectedLetters).join(', ') || 'none'}`;
  progressPanel.textContent = JSON.stringify(
    {
      stars: progress.stars,
      badges: progress.badges,
      unlocks: progress.unlocks,
      completed: progress.completed,
      attempts: progress.attempts
    },
    null,
    2
  );
}

function award(type: ActivityType) {
  progress.stars += 2;
  progress.attempts += 1;
  progress.completed[type] = (progress.completed[type] ?? 0) + 1;

  if (progress.stars >= 10 && !progress.badges.includes('Letter Explorer')) {
    progress.badges.push('Letter Explorer');
    progress.unlocks.push('Hat: Star Cap');
  }
  if (progress.stars >= 20 && !progress.badges.includes('Reading Ranger')) {
    progress.badges.push('Reading Ranger');
    progress.unlocks.push('Companion: Firefly Buddy');
  }

  persist();
  updateHud();
}

function challengePool(): Challenge[] {
  const cvcWords = settings.activityDifficulty === 'easy' ? ['cat', 'map', 'sun'] : ['dog', 'pen', 'lip'];
  return [
    {
      type: 'letter',
      prompt: 'Find the letter that matches the sound /m/.',
      choices: ['m', 's', 't'],
      answer: 'm',
      voice: 'Tap the letter m.'
    },
    {
      type: 'phonics',
      prompt: 'Which word starts with /s/?',
      choices: ['sun', 'cat', 'pig'],
      answer: 'sun',
      voice: 'Which word begins with sss?'
    },
    {
      type: 'spelling',
      prompt: `Spell the CVC word: ${cvcWords[0]}`,
      choices: ['cat', 'cta', 'act'],
      answer: cvcWords[0],
      voice: `Spell ${cvcWords[0]}.`
    },
    {
      type: 'sight',
      prompt: 'Pick the sight word: "the"',
      choices: ['the', 'that', 'then'],
      answer: 'the',
      voice: 'Find the sight word the.'
    }
  ];
}

function openChallenge(type: ActivityType) {
  activeChallenge = challengePool().find((item) => item.type === type) ?? null;
  if (!activeChallenge) return;

  activityCard.classList.remove('hidden');
  feedbackEl.textContent = '';
  activityTitle.textContent = `${type.toUpperCase()} Challenge`;
  activityPrompt.textContent = activeChallenge.prompt;
  choicesEl.innerHTML = '';

  activeChallenge.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.textContent = choice;
    button.className = 'choiceButton';
    button.onclick = () => {
      if (!activeChallenge) return;
      const correct = choice === activeChallenge.answer;
      beep(correct);
      feedbackEl.textContent = correct ? 'Great job! ⭐' : 'Nice try! Let’s practice again.';
      if (correct) {
        award(activeChallenge.type);
      }
    };
    choicesEl.appendChild(button);
  });

  speak(activeChallenge.voice);
}

function near(a: THREE.Vector3, b: THREE.Vector3, dist = 1.8) {
  return a.distanceTo(b) < dist;
}

function interact() {
  if (near(player.position, zones.letter.position)) openChallenge('letter');
  else if (near(player.position, zones.phonics.position)) openChallenge('phonics');
  else if (near(player.position, zones.spelling.position)) openChallenge('spelling');
  else if (near(player.position, zones.sight.position)) openChallenge('sight');
  else if (near(player.position, zones.collect.position)) {
    const next = lettersToCollect[collectIndex % lettersToCollect.length];
    collectedLetters.add(next);
    collectIndex += 1;
    speak(`You collected letter ${next}.`);
    beep(true);
    updateHud();
  } else if (near(player.position, npc.position, 2.2)) {
    speak('Hi learner! Let us collect letters and read words together!');
  }
}

function build() {
  const gridX = Math.round(player.position.x + Math.sin(camera.rotation.y) * 1.2);
  const gridZ = Math.round(player.position.z + Math.cos(camera.rotation.y) * 1.2);
  createVoxel(gridX, 0.5, gridZ, buildMat);
  speak('Nice building!');
}

function resetSettingsUI() {
  voiceSetting.checked = settings.voicePrompts;
  difficultySetting.value = settings.activityDifficulty;
  volumeSetting.value = String(settings.musicVolume);
  sessionSetting.value = String(settings.sessionMinutes);
}

toggleTeacher.onclick = () => teacherBody.classList.toggle('hidden');
voiceSetting.onchange = () => {
  settings.voicePrompts = voiceSetting.checked;
  persist();
};
difficultySetting.onchange = () => {
  settings.activityDifficulty = difficultySetting.value as Settings['activityDifficulty'];
  persist();
};
volumeSetting.onchange = () => {
  settings.musicVolume = Number(volumeSetting.value);
  persist();
};
sessionSetting.onchange = () => {
  settings.sessionMinutes = Number(sessionSetting.value);
  persist();
};

window.addEventListener('keydown', (ev) => keys.add(ev.key.toLowerCase()));
window.addEventListener('keyup', (ev) => keys.delete(ev.key.toLowerCase()));
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function movement(dt: number) {
  const speed = 4.6;
  const move = new THREE.Vector3();
  if (keys.has('arrowup') || keys.has('w')) move.z -= 1;
  if (keys.has('arrowdown') || keys.has('s')) move.z += 1;
  if (keys.has('arrowleft') || keys.has('a')) move.x -= 1;
  if (keys.has('arrowright') || keys.has('d')) move.x += 1;

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed * dt);
    player.position.add(move);
    player.position.x = THREE.MathUtils.clamp(player.position.x, -worldRadius + 1, worldRadius - 1);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -worldRadius + 1, worldRadius - 1);
  }

  camera.position.x = player.position.x;
  camera.position.z = player.position.z + 9;
  camera.lookAt(player.position.x, player.position.y + 0.5, player.position.z);

  if (actionCooldown > 0) actionCooldown -= dt;
  if ((keys.has(' ') || keys.has('enter')) && actionCooldown <= 0) {
    interact();
    actionCooldown = 0.3;
  }
  if (keys.has('b') && actionCooldown <= 0) {
    build();
    actionCooldown = 0.25;
  }
  if (keys.has('c') && actionCooldown <= 0) {
    interact();
    actionCooldown = 0.25;
  }
}

let previous = performance.now();
function loop(now: number) {
  const dt = Math.min((now - previous) / 1000, 0.033);
  previous = now;

  npc.rotation.y += dt;
  movement(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

resetSettingsUI();
updateHud();
speak('Welcome to StarSprout Reading Valley! Explore blocks and press space to learn.');
requestAnimationFrame(loop);
