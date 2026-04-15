import type { ChildProgress, Settings, Challenge } from './types';

export type UIRefs = {
  root: HTMLDivElement;
  startButton: HTMLButtonElement;
  titleScreen: HTMLDivElement;
  stars: HTMLElement;
  badges: HTMLElement;
  questText: HTMLElement;
  collection: HTMLElement;
  activityCard: HTMLElement;
  activityTitle: HTMLElement;
  activityPrompt: HTMLElement;
  choices: HTMLElement;
  feedback: HTMLElement;
  popup: HTMLElement;
  confetti: HTMLElement;
  toggleTeacher: HTMLButtonElement;
  teacherBody: HTMLElement;
  voiceSetting: HTMLInputElement;
  difficultySetting: HTMLSelectElement;
  volumeSetting: HTMLInputElement;
  sessionSetting: HTMLInputElement;
  progressPanel: HTMLElement;
};

export function createUI(container: HTMLElement): UIRefs {
  container.innerHTML = `
    <div id="titleScreen" class="overlay">
      <div class="titleCard">
        <h1>StarSprout Reading Valley</h1>
        <p>A whimsical voxel adventure for early reading.</p>
        <button id="startButton" class="bigButton">Start Adventure</button>
      </div>
    </div>

    <div id="ui">
      <header>
        <h2>StarSprout Reading Valley</h2>
        <div id="hud"><span id="stars">⭐ 0</span><span id="badges">🏅 0</span></div>
      </header>

      <section id="questPanel" class="panel">
        <h3>Today's Quest</h3>
        <p id="questText">Explore the world and complete one activity in each learning zone.</p>
      </section>

      <section id="activityCard" class="panel hidden">
        <h3 id="activityTitle"></h3>
        <p id="activityPrompt"></p>
        <div id="choices"></div>
        <p id="activityFeedback"></p>
      </section>

      <section id="inventoryCard" class="panel">
        <h3>Collection Bag</h3>
        <p id="collection">Letters: none</p>
      </section>

      <section id="teacherPanel" class="panel teacherPanel">
        <button id="toggleTeacher">Parent / Teacher Settings</button>
        <div id="teacherBody" class="hidden">
          <label>Voice Prompts<input id="voiceSetting" type="checkbox" /></label>
          <label>Difficulty<select id="difficultySetting"><option value="easy">Easy</option><option value="normal">Normal</option></select></label>
          <label>Music Volume<input id="volumeSetting" type="range" min="0" max="100" /></label>
          <label>Session Minutes<input id="sessionSetting" type="number" min="5" max="45" /></label>
          <pre id="progressPanel"></pre>
        </div>
      </section>

      <div id="rewardPopup" class="reward hidden"></div>
      <div id="confetti" class="confetti"></div>
      <div id="controlsHint">Move: Arrow Keys / WASD · Interact: Space · Build: B · Collect: C</div>
    </div>
    <canvas id="world"></canvas>
  `;

  return {
    root: container.querySelector('#ui') as HTMLDivElement,
    startButton: container.querySelector('#startButton') as HTMLButtonElement,
    titleScreen: container.querySelector('#titleScreen') as HTMLDivElement,
    stars: container.querySelector('#stars') as HTMLElement,
    badges: container.querySelector('#badges') as HTMLElement,
    questText: container.querySelector('#questText') as HTMLElement,
    collection: container.querySelector('#collection') as HTMLElement,
    activityCard: container.querySelector('#activityCard') as HTMLElement,
    activityTitle: container.querySelector('#activityTitle') as HTMLElement,
    activityPrompt: container.querySelector('#activityPrompt') as HTMLElement,
    choices: container.querySelector('#choices') as HTMLElement,
    feedback: container.querySelector('#activityFeedback') as HTMLElement,
    popup: container.querySelector('#rewardPopup') as HTMLElement,
    confetti: container.querySelector('#confetti') as HTMLElement,
    toggleTeacher: container.querySelector('#toggleTeacher') as HTMLButtonElement,
    teacherBody: container.querySelector('#teacherBody') as HTMLElement,
    voiceSetting: container.querySelector('#voiceSetting') as HTMLInputElement,
    difficultySetting: container.querySelector('#difficultySetting') as HTMLSelectElement,
    volumeSetting: container.querySelector('#volumeSetting') as HTMLInputElement,
    sessionSetting: container.querySelector('#sessionSetting') as HTMLInputElement,
    progressPanel: container.querySelector('#progressPanel') as HTMLElement
  };
}

export function syncSettingsUI(ui: UIRefs, settings: Settings) {
  ui.voiceSetting.checked = settings.voicePrompts;
  ui.difficultySetting.value = settings.activityDifficulty;
  ui.volumeSetting.value = String(settings.musicVolume);
  ui.sessionSetting.value = String(settings.sessionMinutes);
}

export function renderHud(ui: UIRefs, progress: ChildProgress, letters: string[]) {
  ui.stars.textContent = `⭐ ${progress.stars}`;
  ui.badges.textContent = `🏅 ${progress.badges.length}`;
  ui.collection.textContent = `Letters: ${letters.join(', ') || 'none'}`;
  ui.progressPanel.textContent = JSON.stringify(progress, null, 2);
}

export function showChallenge(ui: UIRefs, challenge: Challenge, onPick: (choice: string) => void) {
  ui.activityCard.classList.remove('hidden');
  ui.activityTitle.textContent = `${challenge.type.toUpperCase()} Challenge`;
  ui.activityPrompt.textContent = challenge.prompt;
  ui.feedback.textContent = '';
  ui.choices.innerHTML = '';

  challenge.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.className = 'choiceButton';
    button.textContent = choice;
    button.onclick = () => onPick(choice);
    ui.choices.appendChild(button);
  });
}

export function setFeedback(ui: UIRefs, text: string) {
  ui.feedback.textContent = text;
}

export function rewardPopup(ui: UIRefs, message: string, burst = 12) {
  ui.popup.textContent = message;
  ui.popup.classList.remove('hidden');
  ui.popup.classList.add('show');

  ui.confetti.innerHTML = '';
  for (let i = 0; i < burst; i++) {
    const s = document.createElement('span');
    s.style.left = `${Math.random() * 96}%`;
    s.style.animationDelay = `${Math.random() * 0.4}s`;
    ui.confetti.appendChild(s);
  }

  window.setTimeout(() => {
    ui.popup.classList.add('hidden');
    ui.popup.classList.remove('show');
    ui.confetti.innerHTML = '';
  }, 1700);
}
