import type { ChildProgress, Settings, Challenge, ReadingJournal, WordCategory } from './types';

type JournalTab = 'all' | WordCategory;

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
  currentWord: HTMLElement;
  letterBreakdown: HTMLElement;
  phonicsBreakdown: HTMLElement;
  choices: HTMLElement;
  feedback: HTMLElement;
  readingFeedback: HTMLElement;
  pronounceButton: HTMLButtonElement;
  sentenceText: HTMLElement;
  popup: HTMLElement;
  confetti: HTMLElement;
  journalList: HTMLElement;
  journalTabs: NodeListOf<HTMLButtonElement>;
  parentWords: HTMLElement;
  parentMastered: HTMLElement;
  parentReview: HTMLElement;
  parentHistory: HTMLElement;
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
        <div id="wordDisplay" class="wordDisplay">
          <div id="currentWord" class="currentWord">WORD</div>
          <div id="letterBreakdown" class="breakdown">w-o-r-d</div>
          <div id="phonicsBreakdown" class="phonics">/w/-/or/-/d/</div>
        </div>
        <div id="choices"></div>
        <p id="activityFeedback"></p>
        <div id="readingFeedback" class="readingFeedback hidden">
          <div id="feedbackWord" class="feedbackWord"></div>
          <button id="pronounceButton" class="choiceButton">🔊 Say Word</button>
          <p id="sentenceText"></p>
        </div>
      </section>

      <section id="journalPanel" class="panel">
        <h3>My Reading Journal</h3>
        <div class="journalTabs">
          <button data-tab="all" class="choiceButton smallTab">All</button>
          <button data-tab="sight" class="choiceButton smallTab">Sight</button>
          <button data-tab="cvc" class="choiceButton smallTab">CVC</button>
          <button data-tab="phonics" class="choiceButton smallTab">Phonics</button>
        </div>
        <div id="journalList" class="journalList">No words yet.</div>
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
          <div id="teacherWords" class="teacherStats"></div>
          <div id="teacherMastered" class="teacherStats"></div>
          <div id="teacherReview" class="teacherStats"></div>
          <div id="teacherHistory" class="teacherHistory"></div>
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
    currentWord: container.querySelector('#currentWord') as HTMLElement,
    letterBreakdown: container.querySelector('#letterBreakdown') as HTMLElement,
    phonicsBreakdown: container.querySelector('#phonicsBreakdown') as HTMLElement,
    choices: container.querySelector('#choices') as HTMLElement,
    feedback: container.querySelector('#activityFeedback') as HTMLElement,
    readingFeedback: container.querySelector('#readingFeedback') as HTMLElement,
    pronounceButton: container.querySelector('#pronounceButton') as HTMLButtonElement,
    sentenceText: container.querySelector('#sentenceText') as HTMLElement,
    popup: container.querySelector('#rewardPopup') as HTMLElement,
    confetti: container.querySelector('#confetti') as HTMLElement,
    journalList: container.querySelector('#journalList') as HTMLElement,
    journalTabs: container.querySelectorAll('.journalTabs button') as NodeListOf<HTMLButtonElement>,
    parentWords: container.querySelector('#teacherWords') as HTMLElement,
    parentMastered: container.querySelector('#teacherMastered') as HTMLElement,
    parentReview: container.querySelector('#teacherReview') as HTMLElement,
    parentHistory: container.querySelector('#teacherHistory') as HTMLElement,
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
  ui.currentWord.textContent = challenge.answer.toUpperCase();
  ui.letterBreakdown.textContent = challenge.answer.toUpperCase().split('').join(' • ');
  ui.phonicsBreakdown.textContent = challenge.segmentation ?? challenge.answer;
  ui.feedback.textContent = '';
  ui.readingFeedback.classList.add('hidden');
  ui.choices.innerHTML = '';

  challenge.choices.forEach((choice) => {
    const button = document.createElement('button');
    button.className = 'choiceButton';
    button.textContent = choice;
    button.onclick = () => onPick(choice);
    ui.choices.appendChild(button);
  });
}

export function setFeedback(ui: UIRefs, text: string, correct: boolean) {
  ui.feedback.textContent = text;
  ui.feedback.className = correct ? 'feedbackCorrect' : 'feedbackWrong';
}

export function showReadingCompletion(ui: UIRefs, challenge: Challenge, onPronounce: () => void) {
  ui.readingFeedback.classList.remove('hidden');
  (ui.readingFeedback.querySelector('#feedbackWord') as HTMLElement).textContent = challenge.answer.toUpperCase();
  ui.sentenceText.textContent = challenge.sentence;
  ui.pronounceButton.onclick = onPronounce;
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

export function bindJournalTabs(ui: UIRefs, onTab: (tab: JournalTab) => void) {
  ui.journalTabs.forEach((button) => {
    button.onclick = () => {
      const tab = (button.dataset.tab as JournalTab | undefined) ?? 'all';
      onTab(tab);
    };
  });
}

export function renderJournal(ui: UIRefs, journal: ReadingJournal, tab: JournalTab) {
  const entries = Object.values(journal.records)
    .filter((item) => tab === 'all' || item.category === tab)
    .sort((a, b) => b.lastPracticedAt.localeCompare(a.lastPracticedAt));

  if (entries.length === 0) {
    ui.journalList.textContent = 'No words in this category yet.';
    return;
  }

  ui.journalList.innerHTML = entries
    .map(
      (r) =>
        `<div class="journalItem"><b>${r.word.toUpperCase()}</b> · ✅ ${r.completedCount} · ❌ ${r.missedCount} · ${
          r.mastered ? 'Mastered' : 'Learning'
        }</div>`
    )
    .join('');
}

export function renderTeacherWordStats(ui: UIRefs, journal: ReadingJournal) {
  const mastered = Object.values(journal.records).filter((r) => r.mastered).map((r) => r.word);
  const review = Object.values(journal.records)
    .filter((r) => r.missedCount > r.completedCount)
    .map((r) => r.word);

  ui.parentWords.textContent = `Words Practiced: ${journal.unlockedWords.length}`;
  ui.parentMastered.textContent = `Words Mastered: ${mastered.join(', ') || 'none'}`;
  ui.parentReview.textContent = `Need Review: ${review.join(', ') || 'none'}`;
  ui.parentHistory.innerHTML = `<b>Recent Activity</b><br/>${journal.history
    .slice(0, 6)
    .map((h) => `${h.word.toUpperCase()} · ${h.correct ? 'correct' : 'missed'}`)
    .join('<br/>')}`;
}
