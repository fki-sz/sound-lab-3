// 1. サウンドマスターデータ
const soundData = [
  { id: "sound1", name: "Rain", src: "sound/rain.mp3", category: "water" },
  { id: "sound2", name: "Coast", src: "sound/wave.mp3", category: "water" },
  { id: "sound3", name: "Waterfall", src: "sound/waterfall.mp3", category: "water" },
  { id: "sound4", name: "Fire", src: "sound/fire.mp3", category: "wood" },
  { id: "sound5", name: "Forest", src: "sound/forest.mp3", category: "wood" }
];

// Audioインスタンス管理 ＆ 再生状態記録
const audioMap = {};
const userPlayingState = {};
let masterVolume = 0.5;

soundData.forEach(item => {
  const audio = new Audio(item.src);
  audio.loop = true;
  audio.volume = masterVolume;
  audioMap[item.id] = audio;
  userPlayingState[item.id] = false;
});

// UI描画：サウンドリストの初期化
const container = document.getElementById("soundListContainer");

if (container) {
  soundData.forEach(item => {
    const soundEl = document.createElement("div");
    soundEl.className = "sound-item";
    soundEl.id = `item-${item.id}`;
    soundEl.dataset.soundId = item.id;
    soundEl.dataset.category = item.category;

    soundEl.innerHTML = `
      <div class="sound-item-header">
        <span class="sound-name">${item.name}</span>
        <button class="play-toggle-btn" id="btn-${item.id}">▶︎</button>
      </div>
      <div class="volume-control-wrapper" id="volWrap-${item.id}" style="display: none;">
        <input type="range" class="vol-slider" min="0" max="1" step="0.01" value="${masterVolume}" id="slider-${item.id}">
      </div>
    `;

    container.appendChild(soundEl);

    const playBtn = soundEl.querySelector(`#btn-${item.id}`);
    const volWrap = soundEl.querySelector(`#volWrap-${item.id}`);
    const slider = soundEl.querySelector(`#slider-${item.id}`);
    const audio = audioMap[item.id];

    // 再生/停止ボタン
    playBtn.addEventListener("click", () => {
      if (audio.paused) {
        playAudio(item.id);
        userPlayingState[item.id] = true;
      } else {
        pauseAudio(item.id);
        userPlayingState[item.id] = false;
      }
    });

    // 各個別の音量スライダー
    slider.addEventListener("input", (e) => {
      audio.volume = e.target.value;
    });
  });
}

// サウンド再生処理関数
function playAudio(id, vol = null) {
  const audio = audioMap[id];
  const playBtn = document.getElementById(`btn-${id}`);
  const volWrap = document.getElementById(`volWrap-${id}`);
  const soundItem = document.getElementById(`item-${id}`);
  const slider = document.getElementById(`slider-${id}`);

  if (!playBtn) return;

  if (vol !== null) {
    audio.volume = vol;
    if (slider) slider.value = vol;
  } else {
    audio.volume = masterVolume;
    if (slider) slider.value = masterVolume;
  }

  audio.play();
  playBtn.textContent = "⏸";
  playBtn.classList.add("playing");
  if (soundItem) soundItem.classList.add("active");
  if (volWrap) volWrap.style.display = "flex";
  userPlayingState[id] = true;
}

// サウンド一時停止
function pauseAudio(id) {
  const audio = audioMap[id];
  const playBtn = document.getElementById(`btn-${id}`);
  const volWrap = document.getElementById(`volWrap-${id}`);
  const soundItem = document.getElementById(`item-${id}`);

  audio.pause();
  if (playBtn) {
    playBtn.textContent = "▶︎";
    playBtn.classList.remove("playing");
  }
  if (soundItem) soundItem.classList.remove("active");
  if (volWrap) volWrap.style.display = "none";
  userPlayingState[id] = false;
}

// サウンド完全停止
function stopAudioCompletely(id) {
  const audio = audioMap[id];
  audio.pause();
  audio.currentTime = 0;
  userPlayingState[id] = false;

  const playBtn = document.getElementById(`btn-${id}`);
  const volWrap = document.getElementById(`volWrap-${id}`);
  const soundItem = document.getElementById(`item-${id}`);
  if (playBtn) {
    playBtn.textContent = "▶︎";
    playBtn.classList.remove("playing");
  }
  if (soundItem) soundItem.classList.remove("active");
  if (volWrap) volWrap.style.display = "none";
}

// すべての音を完全停止
function stopAllSoundsCompletely() {
  soundData.forEach(item => stopAudioCompletely(item.id));
}

// すべての音を一時停止（左上の Pause All 用）
function pauseAllSounds() {
  soundData.forEach(item => {
    if (!audioMap[item.id].paused) {
      pauseAudio(item.id);
      userPlayingState[item.id] = true;
    }
  });
}

// 一時停止していた音を再開
function resumeAllSounds() {
  soundData.forEach(item => {
    if (userPlayingState[item.id]) {
      playAudio(item.id);
    }
  });
}

// ----------------------------------------------------
// リスト表示切り替え関数
// ----------------------------------------------------
function filterSoundList(target) {
  const soundItems = document.querySelectorAll(".sound-item");
  
  soundItems.forEach(item => {
    const soundId = item.dataset.soundId;
    const category = item.dataset.category;

    if (Array.isArray(target)) {
      if (target.includes(soundId)) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    } else {
      if (target === "all" || category === target) {
        item.classList.remove("hidden");
      } else {
        item.classList.add("hidden");
      }
    }
  });
}

// ----------------------------------------------------
// 左上のグローバル一時停止／再開ボタンの処理
// ----------------------------------------------------
let isGloballyPaused = false;
const globalPauseBtn = document.getElementById("globalPauseBtn");

if (globalPauseBtn) {
  globalPauseBtn.addEventListener("click", () => {
    if (!isGloballyPaused) {
      pauseAllSounds();
      isGloballyPaused = true;
      globalPauseBtn.textContent = "Resume All";
    } else {
      resumeAllSounds();
      isGloballyPaused = false;
      globalPauseBtn.textContent = "Pause All";
    }
  });
}

// 左上のマスターボリューム
const masterVolumeSlider = document.getElementById("masterVolumeSlider");
if (masterVolumeSlider) {
  masterVolumeSlider.addEventListener("input", (e) => {
    masterVolume = e.target.value;
    soundData.forEach(item => {
      const audio = audioMap[item.id];
      const slider = document.getElementById(`slider-${item.id}`);
      if (!audio.paused) {
        audio.volume = masterVolume;
        if (slider) slider.value = masterVolume;
      }
    });
  });
}

// ----------------------------------------------------
// 2. プリセット機能
// ----------------------------------------------------
let activePresetKey = null;

const presets = {
  rainyDay: { sound1: 0.7, sound2: 0.3 },        // Rain, Coast
  forestRelax: { sound3: 0.4, sound5: 0.8 },      // Waterfall, Forest
  bonfireNight: { sound4: 0.8, sound5: 0.2 },     // Fire, Forest
};

const presetButtons = document.querySelectorAll(".preset-btn");
const activePresetTagBtn = document.getElementById("activePresetTagBtn");
const tagButtons = document.querySelectorAll(".tag-btn");

if (presetButtons.length > 0) {
  presetButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const presetKey = btn.dataset.preset;

      // すでにアクティブなプリセットをもう一度押した場合 → 完全停止 ＆ Activeタブを非表示にして元のタグに戻す
      if (activePresetKey === presetKey) {
        stopAllSoundsCompletely();
        activePresetKey = null;
        btn.classList.remove("active-preset");

        if (activePresetTagBtn) activePresetTagBtn.style.display = "none";

        const activeTagBtn = document.querySelector(".tag-btn.active-tag");
        const currentCategory = activeTagBtn && activeTagBtn !== activePresetTagBtn ? activeTagBtn.dataset.category : "all";
        
        tagButtons.forEach(b => b.classList.remove("active-tag"));
        const fallbackBtn = document.querySelector(`.tag-btn[data-category="${currentCategory}"]`);
        if (fallbackBtn) fallbackBtn.classList.add("active-tag");

        filterSoundList(currentCategory);
        return;
      }

      // 新しいプリセットを再生する場合
      stopAllSoundsCompletely();
      
      presetButtons.forEach(b => b.classList.remove("active-preset"));
      btn.classList.add("active-preset");

      activePresetKey = presetKey;
      isGloballyPaused = false;
      if (globalPauseBtn) globalPauseBtn.textContent = "Pause All";

      const targetPreset = presets[presetKey];
      if (targetPreset) {
        const targetSoundIds = Object.keys(targetPreset);
        
        // 1. サウンドを再生
        targetSoundIds.forEach(soundId => {
          playAudio(soundId, targetPreset[soundId]);
        });

        // 2. リストをそのサウンドだけに絞り込み
        filterSoundList(targetSoundIds);

        // 3. カテゴリー側に「Active」ボタンを表示し、選択状態（active-tag）にする
        if (activePresetTagBtn) {
          activePresetTagBtn.style.display = "inline-block";
          tagButtons.forEach(b => b.classList.remove("active-tag"));
          activePresetTagBtn.classList.add("active-tag");
        }
      }
    });
  });
}

// ----------------------------------------------------
// 3. タグ（カテゴリ）フィルタリング機能
// ----------------------------------------------------
if (tagButtons.length > 0) {
  tagButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedCategory = btn.dataset.category;

      tagButtons.forEach(b => b.classList.remove("active-tag"));
      btn.classList.add("active-tag");

      // ★追加・修正：もし「Active」ボタンが押された場合
      if (selectedCategory === "preset-active" && activePresetKey) {
        const targetPreset = presets[activePresetKey];
        if (targetPreset) {
          filterSoundList(Object.keys(targetPreset)); // 現在鳴っているプリセットのサウンドID配列を渡す
        }
      } else {
        // 通常のカテゴリー（All, Water, Woodなど）の場合
        filterSoundList(selectedCategory);
      }
    });
  });
}

// 4. サウンドリスト・モーダル開閉ロジック
const soundModal = document.getElementById("soundModal");
const openSoundListBtn = document.getElementById("openSoundListBtn");
const closeSoundListBtn = document.getElementById("closeSoundListBtn");

if (openSoundListBtn && soundModal && closeSoundListBtn) {
  openSoundListBtn.addEventListener("click", () => soundModal.classList.add("open"));
  closeSoundListBtn.addEventListener("click", () => soundModal.classList.remove("open"));

  soundModal.addEventListener("click", (e) => {
    if (e.target === soundModal) soundModal.classList.remove("open");
  });
}

// 5. About モーダル開閉ロジック
const aboutModal = document.getElementById("aboutModal");
const openAboutBtn = document.getElementById("openAboutBtn");
const closeAboutBtn = document.getElementById("closeAboutBtn");

if (openAboutBtn && aboutModal && closeAboutBtn) {
  openAboutBtn.addEventListener("click", () => aboutModal.classList.add("open"));
  closeAboutBtn.addEventListener("click", () => aboutModal.classList.remove("open"));

  aboutModal.addEventListener("click", (e) => {
    if (e.target === aboutModal) aboutModal.classList.remove("open");
  });
}


// ----------------------------------------------------
// 背景アニメーションのカスタマイズ機能
// ----------------------------------------------------

// 1. スピード変更（スライダー）
const speedSlider = document.getElementById("speedSlider");
if (speedSlider) {
  speedSlider.addEventListener("input", (e) => {
    const val = e.target.value;
    // 各li要素のアニメーション時間を動的に変更
    const circles = document.querySelectorAll(".circles li");
    circles.forEach((li, index) => {
      // 個別のランダム性を保ちつつ基準スピードをスライダー値に連動させる
      const durationFactor = (index % 3 === 0) ? 0.6 : (index % 2 === 0 ? 1.0 : 1.4);
      li.style.animationDuration = `${val * durationFactor}s`;
    });
  });
}

// 2. カラーテーマ変更（セレクトボックス）
const toneSelect = document.getElementById("toneSelect");
if (toneSelect) {
  toneSelect.addEventListener("change", (e) => {
    const theme = e.target.value;
    
    // 一度すべてのテーマクラスを削除
    document.body.classList.remove("theme-midnight", "theme-sunset");

    // 選択されたテーマクラスを付与
    if (theme === "midnight") {
      document.body.classList.add("theme-midnight");
    } else if (theme === "sunset") {
      document.body.classList.add("theme-sunset");
    }
    // "teal" の場合はデフォルト（クラスなし）
  });
}