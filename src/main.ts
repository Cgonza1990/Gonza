import * as THREE from 'three';
import { buildTerrain } from './game/terrain';
import { decorateWorld } from './game/decor';
import { createGuide, createPlayer } from './game/characters';
import { challengePool, zoneToActivity } from './game/activities';
import { speak, beep } from './game/audio';
import {
  bindJournalTabs,
  createUI,
  renderHud,
  renderJournal,
  renderTeacherWordStats,
  rewardPopup,
  setFeedback,
  showChallenge,
  showReadingCompletion,
  syncSettingsUI
} from './game/ui';
import { defaultProgress, defaultSettings, loadJson, loadJournal, SETTINGS_KEY, STORAGE_KEY, save, award } from './game/state';
import { touchWord } from './game/journal';
import type { Challenge, Settings, ChildProgress, Zone, WordCategory } from './game/types';

const app = document.getElementById('app');
if (!app) throw new Error('Missing app element');

const ui = createUI(app);
const canvas = document.getElementById('world') as HTMLCanvasElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#87c6ff');
scene.fog = new THREE.Fog('#a7d7ff', 28, 78);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 240);
camera.position.set(0, 16, 20);

scene.add(new THREE.HemisphereLight('#fff4d8', '#9acb9f', 0.6));
const sun = new THREE.DirectionalLight('#ffe8bf', 1.2);
sun.position.set(24, 40, 16);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
scene.add(sun);
scene.add(new THREE.AmbientLight('#ffcfa3', 0.22));

const terrain = buildTerrain(scene);
const zones = decorateWorld(scene, terrain);
const player = createPlayer(scene, terrain);
const guide = createGuide(scene, terrain);

let progress = loadJson<ChildProgress>(STORAGE_KEY, defaultProgress);
let settings = loadJson<Settings>(SETTINGS_KEY, defaultSettings);
let journal = loadJournal();
const collectedLetters = new Set<string>();
const lettersToCollect = ['c', 'a', 't', 'm', 'a', 'p', 's'];
let collectIndex = 0;

syncSettingsUI(ui, settings);
renderHud(ui, progress, Array.from(collectedLetters));
renderJournal(ui, journal, 'all');
renderTeacherWordStats(ui, journal);

let activeChallenge: Challenge | null = null;
let gameStarted = false;
let actionCooldown = 0;
let journalTab: 'all' | WordCategory = 'all';
const keys = new Set<string>();

bindJournalTabs(ui, (tab) => {
  journalTab = tab;
  renderJournal(ui, journal, journalTab);
});

const nearbyZone = (): Zone | null => {
  let nearest: Zone | null = null;
  let best = 2.2;
  for (const zone of zones) {
    const d = player.position.distanceTo(zone.anchor);
    if (d < best) {
      best = d;
      nearest = zone;
    }
  }

  if (player.position.distanceTo(guide.position) < best) {
    return { type: 'npc', marker: guide, anchor: guide.position.clone(), label: 'Guide Friend' };
  }
  return nearest;
};

const questStatus = () => {
  ui.questText.textContent = `Visit: Letter Garden (${progress.completed.letter ?? 0}), Phonics Bridge (${progress.completed.phonics ?? 0}), Sight Word House (${progress.completed.sight ?? 0}), Spelling Meadow (${progress.completed.spelling ?? 0}).`;
};
questStatus();

function persistAll() {
  save(progress, settings, journal);
  renderHud(ui, progress, Array.from(collectedLetters));
  renderJournal(ui, journal, journalTab);
  renderTeacherWordStats(ui, journal);
}

function openActivity(type: 'letter' | 'phonics' | 'spelling' | 'sight') {
  activeChallenge = challengePool(settings).find((c) => c.type === type) ?? null;
  if (!activeChallenge) return;

  showChallenge(ui, activeChallenge, (choice) => {
    if (!activeChallenge) return;
    const correct = choice === activeChallenge.answer;
    beep(correct, settings);
    touchWord(journal, activeChallenge, correct);

    if (correct) {
      const result = award(progress, activeChallenge.type);
      setFeedback(ui, 'Great work! You got it right!', true);
      showReadingCompletion(ui, activeChallenge, () => speak(activeChallenge!.answer, settings));
      rewardPopup(ui, result.popup, result.burst);
      questStatus();
    } else {
      setFeedback(ui, 'Nice try! Listen and try once more.', false);
      rewardPopup(ui, `Keep practicing: ${activeChallenge.answer.toUpperCase()}`, 8);
    }

    persistAll();
  });

  speak(activeChallenge.voice, settings);
}

function buildBlock() {
  const gx = Math.round(player.position.x + 1.5);
  const gz = Math.round(player.position.z + 0.5);
  const gy = terrain.topHeightAt(gx, gz) + 1.5;
  const block = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: '#8b78f8' }));
  block.position.set(gx, gy, gz);
  block.castShadow = true;
  scene.add(block);
  speak('Great building!', settings);
}

function interact() {
  const zone = nearbyZone();
  if (!zone) return;

  const activityType = zoneToActivity(zone.type);
  if (activityType) return openActivity(activityType);

  if (zone.type === 'collect') {
    const next = lettersToCollect[collectIndex % lettersToCollect.length];
    collectIndex += 1;
    collectedLetters.add(next);
    rewardPopup(ui, `✨ Collected letter ${next.toUpperCase()}!`, 10);
    speak(`You found letter ${next}.`, settings);
    renderHud(ui, progress, Array.from(collectedLetters));
    return;
  }

  if (zone.type === 'build') return buildBlock();
  if (zone.type === 'npc') speak('Hi explorer! Follow glowing stations to learn words.', settings);
}

ui.startButton.onclick = () => {
  gameStarted = true;
  ui.titleScreen.classList.add('hidden');
  speak('Welcome to StarSprout Reading Valley! Let us begin!', settings);
};

ui.toggleTeacher.onclick = () => ui.teacherBody.classList.toggle('hidden');
ui.voiceSetting.onchange = () => {
  settings.voicePrompts = ui.voiceSetting.checked;
  persistAll();
};
ui.difficultySetting.onchange = () => {
  settings.activityDifficulty = ui.difficultySetting.value as Settings['activityDifficulty'];
  persistAll();
};
ui.volumeSetting.onchange = () => {
  settings.musicVolume = Number(ui.volumeSetting.value);
  persistAll();
};
ui.sessionSetting.onchange = () => {
  settings.sessionMinutes = Number(ui.sessionSetting.value);
  persistAll();
};

window.addEventListener('keydown', (e) => keys.add(e.key.toLowerCase()));
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animateMarkers(time: number) {
  zones.forEach((zone) => {
    const phase = zone.marker.userData.bobPhase ?? 0;
    zone.marker.position.y = zone.anchor.y + Math.sin(time * 0.003 + phase) * 0.22;
    zone.marker.rotation.y += 0.009;
  });
  const gMarker = guide.userData.marker as THREE.Mesh;
  guide.position.y = terrain.topHeightAt(0, 4) + 0.8 + Math.sin(time * 0.004) * 0.15;
  gMarker.rotation.z += 0.03;
}

function movePlayer(dt: number) {
  const dir = new THREE.Vector3();
  if (keys.has('arrowup') || keys.has('w')) dir.z -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dir.z += 1;
  if (keys.has('arrowleft') || keys.has('a')) dir.x -= 1;
  if (keys.has('arrowright') || keys.has('d')) dir.x += 1;

  if (dir.lengthSq() > 0) {
    dir.normalize().multiplyScalar(5 * dt);
    player.position.x = THREE.MathUtils.clamp(player.position.x + dir.x, -terrain.worldRadius + 2, terrain.worldRadius - 2);
    player.position.z = THREE.MathUtils.clamp(player.position.z + dir.z, -terrain.worldRadius + 2, terrain.worldRadius - 2);
    const top = terrain.topHeightAt(Math.round(player.position.x), Math.round(player.position.z));
    player.position.y = top + 0.6 + Math.sin(performance.now() * 0.015) * 0.03;
    player.rotation.y = Math.atan2(dir.x, dir.z);
  }

  camera.position.lerp(new THREE.Vector3(player.position.x + 8, player.position.y + 12, player.position.z + 11), 0.08);
  camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

  if (actionCooldown > 0) actionCooldown -= dt;
  if ((keys.has(' ') || keys.has('enter') || keys.has('c')) && actionCooldown <= 0) {
    interact();
    actionCooldown = 0.28;
  }
  if (keys.has('b') && actionCooldown <= 0) {
    buildBlock();
    actionCooldown = 0.25;
  }
}

let prev = performance.now();
function loop(now: number) {
  const dt = Math.min((now - prev) / 1000, 0.033);
  prev = now;
  if (gameStarted) {
    movePlayer(dt);
    animateMarkers(now);
  }
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
