const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const state = {
  totalQuestions: 10,
  currentQuestionIndex: 0,
  correctCount: 0,
  questions: [],
  currentQuestion: null
};

// UI Elements
const questionDisplay = $('#questionDisplay');
const questionSpeaker = $('#questionSpeaker');
const visualArea = $('#visualArea');
const controlArea = $('#controlArea');
const feedback = $('#feedback');
const bottomActions = $('#bottomActions');
const actionBtn = $('#actionBtn');
const progressArea = $('#progressArea');
const starProgress = $('#starProgress');

// Speech
function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

// Ensure PracticeSupport exists
const practiceSupport = window.PracticeSupport || {
  createPromptController: (config) => {
    return {
      showPrompt: (icon, text, opts) => {
        if (config.questionText) config.questionText.textContent = text;
        if (opts.autoSpeak && config.speak) config.speak(opts.speechText || text);
        if (config.speakerButton) {
          config.speakerButton.hidden = false;
          config.speakerButton.onclick = () => config.speak(opts.speechText || text);
        }
      }
    };
  }
};

const promptController = practiceSupport.createPromptController({
  questionText: questionDisplay,
  speakerButton: questionSpeaker,
  speak,
});

function setPrompt(text, speechText) {
  promptController.showPrompt('', text, {
    speechText: speechText ?? text,
    autoSpeak: true,
    allowReplay: true,
  });
}

function speakFeedback(text, type) {
  feedback.textContent = text;
  feedback.className = `feedback ${type}`;
  speak(text.replace(/^[^\u4e00-\u9fa5A-Za-z0-9]+/u, ''));
}

// Init Stars
function initStars() {
  progressArea.style.display = 'block';
  starProgress.innerHTML = Array(state.totalQuestions).fill('<span class="iconify star-icon" data-icon="fluent-emoji:star"></span>').join('');
}

function updateStars(correct) {
  const stars = $$('.star-icon');
  if (stars[state.currentQuestionIndex]) {
    if (correct) {
      stars[state.currentQuestionIndex].classList.add('active', 'pulse');
    } else {
      // Could show half star or just keep empty, design says "never deduct stars, only light up on correct"
      // But if it's daily practice, we just light it up if correct. If they move to next question without correct, it stays empty.
    }
  }
}

// Question Generators
const generators = {
  mathAdditionL1: () => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * (10 - a)) + 1;
    return { type: 'mathAddition', question: { a, b }, answer: a + b, promptText: `${a} + ${b} = ?`, speechText: `${a} 加 ${b} 等于多少？` };
  },
  mathAdditionL2: () => {
    const a = Math.floor(Math.random() * 10) + 5;
    const b = Math.floor(Math.random() * 10) + 2;
    return { type: 'mathAddition', question: { a, b }, answer: a + b, promptText: `${a} + ${b} = ?`, speechText: `${a} 加 ${b} 等于多少？` };
  },
  mathAdditionL3: () => {
    const a = Math.floor(Math.random() * 40) + 10;
    const b = Math.floor(Math.random() * 40) + 10;
    return { type: 'mathAddition', question: { a, b }, answer: a + b, promptText: `${a} + ${b} = ?`, speechText: `${a} 加 ${b} 等于多少？` };
  },
  mathSubtractionL1: () => {
    const total = Math.floor(Math.random() * 8) + 2;
    const subtract = Math.floor(Math.random() * (total - 1)) + 1;
    return { type: 'mathSubtraction', question: { total, subtract }, answer: total - subtract, promptText: `${total} - ${subtract} = ?`, speechText: `${total} 减 ${subtract} 等于多少？` };
  },
  mathSubtractionL2: () => {
    const total = Math.floor(Math.random() * 10) + 11;
    const subtract = Math.floor(Math.random() * 9) + 2;
    return { type: 'mathSubtraction', question: { total, subtract }, answer: total - subtract, promptText: `${total} - ${subtract} = ?`, speechText: `${total} 减 ${subtract} 等于多少？` };
  },
  mathSubtractionL3: () => {
    const total = Math.floor(Math.random() * 40) + 50;
    const subtract = Math.floor(Math.random() * 30) + 10;
    return { type: 'mathSubtraction', question: { total, subtract }, answer: total - subtract, promptText: `${total} - ${subtract} = ?`, speechText: `${total} 减 ${subtract} 等于多少？` };
  },
  shapeFind: () => {
    const shapes = [
      { id: 'circle', icon: '🔴', name: '圆形' },
      { id: 'square', icon: '🟦', name: '正方形' },
      { id: 'triangle', icon: '🔺', name: '三角形' },
      { id: 'star', icon: '⭐', name: '星形' }
    ];
    // Pick target
    const target = shapes[Math.floor(Math.random() * shapes.length)];
    // Pick 3 random
    const options = [target];
    while(options.length < 3) {
      const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
      if (!options.find(s => s.id === randomShape.id)) {
        options.push(randomShape);
      }
    }
    options.sort(() => Math.random() - 0.5);
    
    return {
      type: 'shapeFind',
      question: { target, options },
      answer: target.id,
      promptText: `请找出所有的${target.name}！`,
      speechText: `请找出所有的${target.name}！`
    };
  },
  pattern: () => {
    const patterns = [
      ['🍎', '🍌', '🍎', '🍌', '🍎'],
      ['🔴', '🔴', '🟦', '🔴', '🔴'],
      ['🚗', '🚌', '🚓', '🚗', '🚌'],
      ['⭐', '🌙', '⭐', '🌙', '⭐']
    ];
    const sequence = patterns[Math.floor(Math.random() * patterns.length)];
    const missingIndex = 4; // always last for simplicity
    const answer = sequence[missingIndex];
    const displaySeq = [...sequence];
    displaySeq[missingIndex] = '?';
    
    // Generate options
    const allIcons = ['🍎', '🍌', '🔴', '🟦', '🚗', '🚌', '🚓', '⭐', '🌙', '☀️', '🍉'];
    const options = [answer];
    while(options.length < 3) {
      const rnd = allIcons[Math.floor(Math.random() * allIcons.length)];
      if(!options.includes(rnd)) options.push(rnd);
    }
    options.sort(() => Math.random() - 0.5);

    return {
      type: 'pattern',
      question: { displaySeq, options },
      answer: answer,
      promptText: `下一个应该是什么？`,
      speechText: `观察规律，下一个应该选哪个呢？`
    };
  },
  clock: () => {
    const hour = Math.floor(Math.random() * 12) + 1;
    const isHalf = Math.random() > 0.5;
    const timeStr = `${hour}:${isHalf ? '30' : '00'}`;
    const timeText = isHalf ? `${hour}点半` : `${hour}点整`;
    
    const options = [timeText];
    while(options.length < 3) {
      const h = Math.floor(Math.random() * 12) + 1;
      const hf = Math.random() > 0.5;
      const optStr = hf ? `${h}点半` : `${h}点整`;
      if(!options.includes(optStr)) options.push(optStr);
    }
    options.sort(() => Math.random() - 0.5);

    return {
      type: 'clock',
      question: { timeStr, options },
      answer: timeText,
      promptText: `钟面上是几点？`,
      speechText: `看看钟表，现在是几点呀？`
    };
  }
};

function generateDailyQuestions() {
  const pool = [
    generators.mathAdditionL1,
    generators.mathAdditionL2,
    generators.mathAdditionL3,
    generators.mathSubtractionL1,
    generators.mathSubtractionL2,
    generators.mathSubtractionL3,
    generators.shapeFind,
    generators.shapeFind,
    generators.pattern,
    generators.clock
  ];
  
  // Shuffle pool
  pool.sort(() => Math.random() - 0.5);
  
  state.questions = pool.slice(0, state.totalQuestions).map(gen => gen());
}

function showStartScreen() {
  feedback.textContent = '';
  feedback.className = 'feedback';
  bottomActions.style.display = 'block';
  progressArea.style.display = 'none';
  
  setPrompt('每日一练', '每天坚持练习，变成数学小天才！准备好了吗？');
  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:72px;margin-bottom:20px;">🏆</div>
      <div style="font-size:24px;color:var(--gray-500);margin-bottom:32px;">今天的 ${state.totalQuestions} 道题目已经准备好了！</div>
    </div>
  `;
  controlArea.innerHTML = '';
  actionBtn.textContent = '开始挑战';
  actionBtn.onclick = startPractice;
}

function startPractice() {
  bottomActions.style.display = 'none';
  state.currentQuestionIndex = 0;
  state.correctCount = 0;
  generateDailyQuestions();
  initStars();
  renderQuestion();
}

function renderQuestion() {
  if (state.currentQuestionIndex >= state.totalQuestions) {
    showCompleteScreen();
    return;
  }
  
  state.currentQuestion = state.questions[state.currentQuestionIndex];
  feedback.textContent = '';
  feedback.className = 'feedback';
  
  setPrompt(`第${state.currentQuestionIndex + 1}题：` + state.currentQuestion.promptText, state.currentQuestion.speechText);
  
  switch(state.currentQuestion.type) {
    case 'mathAddition':
    case 'mathSubtraction':
      renderMath();
      break;
    case 'shapeFind':
      renderShape();
      break;
    case 'pattern':
      renderPattern();
      break;
    case 'clock':
      renderClock();
      break;
  }
}

function renderMath() {
  const q = state.currentQuestion.question;
  let op = '+';
  let a, b;
  if(state.currentQuestion.type === 'mathAddition') {
    a = q.a; b = q.b;
  } else {
    a = q.total; b = q.subtract; op = '-';
  }
  
  visualArea.innerHTML = `
    <div class="math-container">
      <div class="math-number">${a}</div>
      <div class="math-operator">${op}</div>
      <div class="math-number">${b}</div>
      <div class="math-operator">=</div>
      <div class="math-number" style="background:var(--gray-100);color:var(--gray-400);">?</div>
    </div>
  `;
  
  // Math options
  const answer = state.currentQuestion.answer;
  const options = [answer];
  while(options.length < 4) {
    const delta = Math.floor(Math.random() * 7) - 3;
    const candidate = Math.max(1, answer + delta);
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }
  options.sort(() => Math.random() - 0.5);
  
  renderOptions(options);
}

function renderShape() {
  const { target, options } = state.currentQuestion.question;
  visualArea.innerHTML = `
    <div class="shape-container">
      ${options.map(opt => `<div class="shape-option" data-val="${opt.id}">${opt.icon}</div>`).join('')}
    </div>
  `;
  
  // Custom click logic for shapes
  controlArea.innerHTML = '';
  $$('.shape-option').forEach(el => {
    el.onclick = () => checkAnswer(el.dataset.val);
  });
}

function renderPattern() {
  const { displaySeq, options } = state.currentQuestion.question;
  visualArea.innerHTML = `
    <div class="pattern-container">
      ${displaySeq.map(item => `
        <div class="pattern-item ${item === '?' ? 'blank' : ''}">${item === '?' ? '' : item}</div>
      `).join('')}
    </div>
  `;
  renderOptions(options, true);
}

function renderClock() {
  const { timeStr, options } = state.currentQuestion.question;
  // A simple representation of a digital clock for MVP
  visualArea.innerHTML = `
    <div class="measure-container">
      <div class="clock-display" style="font-family:'ZCOOL KuaiLe', sans-serif; color:var(--blue); background:var(--white); padding:20px; border-radius:var(--radius-xl); border:4px solid var(--blue-light); display:inline-block;">
        ⌚ ${timeStr}
      </div>
    </div>
  `;
  renderOptions(options, true);
}

function renderOptions(options, isText = false) {
  controlArea.innerHTML = `
    <div class="answer-options">
      ${options.map(opt => `
        <button class="answer-btn ${isText ? 'text-btn' : ''}" onclick="checkAnswer('${opt}')">${opt}</button>
      `).join('')}
    </div>
  `;
}

// Global checkAnswer
window.checkAnswer = function(selected) {
  // toString to handle both numbers and strings safely
  if (selected.toString() === state.currentQuestion.answer.toString()) {
    controlArea.innerHTML = '';
    state.correctCount += 1;
    speakFeedback('✅ 太棒了！', 'correct');
    updateStars(true);
    
    setTimeout(() => {
      state.currentQuestionIndex += 1;
      renderQuestion();
    }, 1500);
  } else {
    speakFeedback('😹 再想想', 'encourage');
  }
}

function showCompleteScreen() {
  const score = Math.round((state.correctCount / state.totalQuestions) * 100);
  setPrompt('挑战完成！', `恭喜你完成今天的练习！答对 ${state.correctCount} 题。`);
  
  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:72px;margin-bottom:20px;">🎉</div>
      <div style="font-size:36px;font-weight:700;color:var(--blue);margin-bottom:12px;">太棒了！</div>
      <div style="font-size:24px;font-weight:700;color:var(--green);margin-bottom:12px;">
        获得 ${state.correctCount} 颗星星 ⭐
      </div>
      <div style="font-size:18px;color:var(--gray-500);">明天也要来坚持练习哦！</div>
    </div>
  `;
  
  controlArea.innerHTML = '';
  bottomActions.style.display = 'block';
  actionBtn.textContent = '返回主页';
  actionBtn.onclick = () => {
    window.location.href = 'index.html'; // In MVP home.html/index.html might be the same, let's use index.html which is back-btn default
  };
}

// Start
showStartScreen();
