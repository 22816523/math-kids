/**
 * 数学启蒙 · 24点与心算 JS
 * 支持 2 大模式：24点扑克、心算迷宫
 */

(function () {
  'use strict';

  let currentMode = 'cards24'; // 'cards24' | 'runner'
  let currentQuestion = null;
  let isAnswerLocked = false;

  const tabs = document.querySelectorAll('.mode-tab');
  const questionText = document.getElementById('questionText');
  const questionSpeaker = document.getElementById('questionSpeaker');
  const game24Stage = document.getElementById('game24Stage');
  const game24Options = document.getElementById('game24Options');
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
    game24Stage.innerHTML = '';
    game24Options.innerHTML = '';

    if (currentMode === 'cards24') {
      generateCards24Question();
    } else if (currentMode === 'runner') {
      generateRunnerQuestion();
    }

    if (currentQuestion && currentQuestion.audioText) {
      questionText.textContent = currentQuestion.questionText;
      playSpeech(currentQuestion.audioText);
    }
  }

  // ================= 1. 24点扑克 =================
  function generateCards24Question() {
    const hands = [
      { cards: [1, 2, 3, 4], correctFormula: '(1 + 2 + 3) × 4 = 24', wrongFormulas: ['(1 + 2) × 3 + 4 = 13', '1 + 2 + 3 + 4 = 10'] },
      { cards: [2, 3, 4, 6], correctFormula: '2 × 3 × 4 = 24', wrongFormulas: ['2 + 3 + 4 + 6 = 15', '2 × 4 + 6 = 14'] },
      { cards: [3, 3, 3, 5], correctFormula: '(3 + 5) × 3 = 24', wrongFormulas: ['3 × 3 + 3 = 12', '3 + 3 + 5 = 11'] },
      { cards: [4, 4, 4, 6], correctFormula: '(4 + 4 - 4) × 6 = 24', wrongFormulas: ['4 × 4 + 4 = 20', '4 + 4 + 6 = 14'] },
      { cards: [6, 6, 6, 6], correctFormula: '6 + 6 + 6 + 6 = 24', wrongFormulas: ['6 × 6 - 6 = 30', '6 + 6 × 2 = 18'] }
    ];

    currentQuestion = hands[Math.floor(Math.random() * hands.length)];
    currentQuestion.questionText = '这 4 张牌，哪个算式能凑出 24 点？';
    currentQuestion.audioText = '看看这 4 张扑克牌，请问哪一个算式能算出来 24 呢？';
    currentQuestion.answer = currentQuestion.correctFormula;
    currentQuestion.options = shuffle([currentQuestion.correctFormula, ...currentQuestion.wrongFormulas]);

    const suits = ['♠️', '♥️', '♣️', '♦️'];
    const container = document.createElement('div');
    container.className = 'cards-container';

    currentQuestion.cards.forEach((val, idx) => {
      const card = document.createElement('div');
      const suit = suits[idx % suits.length];
      const isRed = suit === '♥️' || suit === '♦️';
      card.className = `card-item ${isRed ? 'red' : ''}`;
      card.innerHTML = `
        <div>${val}</div>
        <div class="card-suit">${suit}</div>
        <div>${val}</div>
      `;
      container.appendChild(card);
    });

    game24Stage.appendChild(container);
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // ================= 2. 心算迷宫 =================
  function generateRunnerQuestion() {
    const problems = [
      { text: '14 + 6 = ?', ans: 20, options: [18, 20, 22] },
      { text: '25 - 8 = ?', ans: 17, options: [15, 17, 19] },
      { text: '4 × 6 = ?', ans: 24, options: [20, 24, 28] },
      { text: '30 ÷ 5 = ?', ans: 6, options: [5, 6, 7] },
      { text: '9 + 8 = ?', ans: 17, options: [16, 17, 18] },
      { text: '3 × 7 = ?', ans: 21, options: [18, 21, 24] }
    ];

    const p = problems[Math.floor(Math.random() * problems.length)];
    currentQuestion = {
      questionText: `心算挑战：${p.text}`,
      audioText: `快速心算，请问 ${p.text.replace('=', '等于几')} 呢？`,
      answer: p.ans,
      options: shuffle(p.options)
    };

    const box = document.createElement('div');
    box.className = 'runner-box';
    box.innerHTML = `<span>🏃</span> <span>${p.text}</span>`;

    game24Stage.appendChild(box);
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  function renderOptions(options, correctAnswer) {
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'game24-opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleSelectOption(opt, correctAnswer, btn));
      game24Options.appendChild(btn);
    });
  }

  function handleSelectOption(selected, correct, btnEl) {
    if (isAnswerLocked) return;

    if (selected === correct) {
      isAnswerLocked = true;
      btnEl.classList.add('correct');
      playSpeech('凑对了！心算真快！');
      showFeedback('🎉', '太棒啦！');

      setTimeout(() => {
        hideFeedback();
        loadNewQuestion();
      }, 1600);
    } else {
      btnEl.classList.add('wrong');
      playSpeech('再算一算试一试~');
      showFeedback('🤔', '再算算看~');

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
