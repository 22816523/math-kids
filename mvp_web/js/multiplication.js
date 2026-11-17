/**
 * 数学启蒙 · 乘除法启蒙 JS
 * 支持 3 大模式：乘法点阵、平均分、余数挑战
 */

(function () {
  'use strict';

  let currentMode = 'matrix'; // 'matrix' | 'share' | 'remainder'
  let currentQuestion = null;
  let isAnswerLocked = false;

  const tabs = document.querySelectorAll('.mode-tab');
  const questionText = document.getElementById('questionText');
  const questionSpeaker = document.getElementById('questionSpeaker');
  const multStage = document.getElementById('multStage');
  const multOptions = document.getElementById('multOptions');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackEmoji = document.getElementById('feedbackEmoji');
  const feedbackText = document.getElementById('feedbackText');

  function init() {
    bindTabEvents();
    bindSpeakerEvent();
    loadNewQuestion();
  }

  function bindTabEvents() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (isAnswerLocked) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.getAttribute('data-mode');
        loadNewQuestion();
      });
    });
  }

  function bindSpeakerEvent() {
    if (questionSpeaker) {
      questionSpeaker.addEventListener('click', () => {
        if (currentQuestion && currentQuestion.audioText) {
          playSpeech(currentQuestion.audioText);
        }
      });
    }
  }

  function loadNewQuestion() {
    isAnswerLocked = false;
    multStage.innerHTML = '';
    multOptions.innerHTML = '';

    if (currentMode === 'matrix') {
      generateMatrixQuestion();
    } else if (currentMode === 'share') {
      generateShareQuestion();
    } else if (currentMode === 'remainder') {
      generateRemainderQuestion();
    }

    if (currentQuestion && currentQuestion.audioText) {
      questionText.textContent = currentQuestion.questionText;
      playSpeech(currentQuestion.audioText);
    }
  }

  // ================= 1. 乘法点阵矩阵 =================
  function generateMatrixQuestion() {
    const rows = Math.floor(Math.random() * 3) + 2; // 2 ~ 4 行
    const cols = Math.floor(Math.random() * 3) + 2; // 2 ~ 4 列
    const icons = ['🌟', '🍓', '🏀', '🎈', '🍬'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const total = rows * cols;

    currentQuestion = {
      rows, cols, total, icon,
      questionText: `${rows} 行，每行 ${cols} 个，一共有几个？`,
      audioText: `画面上有 ${rows} 行，每行有 ${cols} 个，请问一共有几个呢？`,
      answer: total,
      options: shuffle([total, total + 2, total - 1 > 0 ? total - 1 : total + 3])
    };

    const container = document.createElement('div');
    container.className = 'matrix-container';

    for (let r = 0; r < rows; r++) {
      const rowEl = document.createElement('div');
      rowEl.className = 'matrix-row';
      for (let c = 0; c < cols; c++) {
        const dot = document.createElement('span');
        dot.className = 'matrix-dot';
        dot.textContent = icon;
        rowEl.appendChild(dot);
      }
      container.appendChild(rowEl);
    }

    multStage.appendChild(container);
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // ================= 2. 平均分 =================
  function generateShareQuestion() {
    const groups = Math.floor(Math.random() * 2) + 2; // 2 ~ 3 组
    const perGroup = Math.floor(Math.random() * 3) + 2; // 2 ~ 4 个
    const total = groups * perGroup;
    const icons = ['🦴', '🐟', '🥕', '🍪'];
    const avatars = ['🐶', '🐱', '🐰', '🐻'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    currentQuestion = {
      groups, perGroup, total, icon, avatar,
      questionText: `${total} 个平分给 ${groups} 个小动物，每只几个？`,
      audioText: `有 ${total} 个物品平分给 ${groups} 只小动物，请问每只小动物能分到几个呢？`,
      answer: perGroup,
      options: shuffle([perGroup, perGroup + 1, perGroup - 1 > 0 ? perGroup - 1 : perGroup + 2])
    };

    const container = document.createElement('div');
    container.className = 'share-container';

    for (let g = 0; g < groups; g++) {
      const groupEl = document.createElement('div');
      groupEl.className = 'share-group';
      
      const avEl = document.createElement('div');
      avEl.className = 'share-avatar';
      avEl.textContent = avatar;

      const itemsBox = document.createElement('div');
      itemsBox.className = 'share-items-box';
      for (let i = 0; i < perGroup; i++) {
        const it = document.createElement('span');
        it.style.fontSize = '28px';
        it.textContent = icon;
        itemsBox.appendChild(it);
      }

      groupEl.appendChild(avEl);
      groupEl.appendChild(itemsBox);
      container.appendChild(groupEl);
    }

    multStage.appendChild(container);
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // ================= 3. 余数挑战 =================
  function generateRemainderQuestion() {
    const groups = 3;
    const perGroup = 2;
    const remainder = Math.floor(Math.random() * 2) + 1; // 1 ~ 2 余数
    const total = groups * perGroup + remainder;
    const icon = '🍎';
    const avatar = '🐻';

    currentQuestion = {
      groups, perGroup, remainder, total, icon, avatar,
      questionText: `${total} 个苹果分给 3 只熊，每只 2 个，剩下几个？`,
      audioText: `有 ${total} 个苹果分给 3 只小熊，每只分 2 个，请问还剩下几个苹果呢？`,
      answer: remainder,
      options: [1, 2, 3]
    };

    const container = document.createElement('div');
    container.className = 'share-container';

    for (let g = 0; g < groups; g++) {
      const groupEl = document.createElement('div');
      groupEl.className = 'share-group';
      
      const avEl = document.createElement('div');
      avEl.className = 'share-avatar';
      avEl.textContent = avatar;

      const itemsBox = document.createElement('div');
      itemsBox.className = 'share-items-box';
      for (let i = 0; i < perGroup; i++) {
        const it = document.createElement('span');
        it.style.fontSize = '28px';
        it.textContent = icon;
        itemsBox.appendChild(it);
      }

      groupEl.appendChild(avEl);
      groupEl.appendChild(itemsBox);
      container.appendChild(groupEl);
    }

    // 剩余框
    const remBox = document.createElement('div');
    remBox.className = 'remainder-box';
    remBox.innerHTML = `<span>剩下的苹果：</span>`;
    for (let r = 0; r < remainder; r++) {
      remBox.innerHTML += `<span style="font-size:32px;">${icon}</span>`;
    }

    multStage.appendChild(container);
    multStage.appendChild(remBox);
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  function renderOptions(options, correctAnswer) {
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'mult-opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleSelectOption(opt, correctAnswer, btn));
      multOptions.appendChild(btn);
    });
  }

  function handleSelectOption(selected, correct, btnEl) {
    if (isAnswerLocked) return;

    if (selected === correct) {
      isAnswerLocked = true;
      btnEl.classList.add('correct');
      playSpeech('答对了！你真棒！');
      showFeedback('🎉', '算对啦！');

      setTimeout(() => {
        hideFeedback();
        loadNewQuestion();
      }, 1600);
    } else {
      btnEl.classList.add('wrong');
      playSpeech('再数数看试一试~');
      showFeedback('🤔', '再想想看~');

      setTimeout(() => {
        hideFeedback();
        btnEl.classList.remove('wrong');
      }, 1200);
    }
  }

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function playSpeech(text) {
    if (window.practiceSupport && typeof window.practiceSupport.speakText === 'function') {
      window.practiceSupport.speakText(text);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
  }

  function showFeedback(emoji, text) {
    feedbackEmoji.textContent = emoji;
    feedbackText.textContent = text;
    feedbackOverlay.style.display = 'flex';
  }

  function hideFeedback() {
    feedbackOverlay.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', init);
})();
