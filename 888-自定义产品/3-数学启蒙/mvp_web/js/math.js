const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const fruits = ['🍎', '🍐', '🍌', '🍊', '🍒', '🍉', '🍇', '🍓'];

const state = {
  level: 1,
  type: 'addition',
  question: null,
  answer: null,
  practiceMode: false,
  currentQuestion: 0,
  totalQuestions: 10,
  correctCount: 0,
  currentFruit: '🍎',
  eaten: 0,
  movedCount: 0,
  needToMove: 0,
  bundles: 0,
  singles: 0,
  toRemove: 0,
};

const questionDisplay = $('#questionDisplay');
const questionSpeaker = $('#questionSpeaker');
const visualArea = $('#visualArea');
const controlArea = $('#controlArea');
const feedback = $('#feedback');
const bottomActions = $('#bottomActions');
const actionBtn = $('#actionBtn');

function speak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.88;
  utterance.pitch = 1.1;
  window.speechSynthesis.speak(utterance);
}

const promptController = window.PracticeSupport.createPromptController({
  questionText: questionDisplay,
  speakerButton: questionSpeaker,
  speak,
});

function setPrompt(text, speechText, options) {
  promptController.showPrompt('', text, {
    speechText: speechText ?? text,
    autoSpeak: options?.autoSpeak !== false,
    allowReplay: options?.allowReplay !== false,
  });
}

function speakFeedback(text, type) {
  feedback.textContent = text;
  feedback.className = `feedback ${type}`;
  speak(text.replace(/^[^\u4e00-\u9fa5A-Za-z0-9]+/u, ''));
}

$$('.mode-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.mode-tab').forEach((item) => item.classList.remove('active'));
    btn.classList.add('active');
    state.level = Number(btn.dataset.level);
    showStartScreen();
  });
});

function showStartScreen() {
  feedback.textContent = '';
  feedback.className = 'feedback';
  bottomActions.style.display = 'flex';
  actionBtn.textContent = '开始练习';
  actionBtn.className = 'btn btn-green btn-lg';
  actionBtn.onclick = startPractice;
  setPrompt('准备好了吗？', '准备好了吗？点击开始练习');
  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:48px;margin-bottom:20px;">🎯</div>
      <div style="font-size:24px;color:var(--gray-500);margin-bottom:32px;">准备好开始练习了吗？</div>
    </div>
  `;
  controlArea.innerHTML = '';
  return;
  controlArea.innerHTML = '<button class="btn-green btn-lg" onclick="startPractice()">开始练习</button>';
}

function startPractice() {
  state.practiceMode = true;
  state.currentQuestion = 0;
  state.correctCount = 0;
  bottomActions.style.display = 'none';
  nextQuestion();
}

function nextQuestion() {
  if (!state.practiceMode) return;

  if (state.currentQuestion >= state.totalQuestions) {
    showCompleteScreen();
    return;
  }

  state.currentQuestion += 1;
  feedback.textContent = '';
  feedback.className = 'feedback';

  if (state.level === 1) {
    generateLevel1Question();
  } else if (state.level === 2) {
    generateLevel2Question();
  } else {
    generateLevel3Question();
  }
}

function getQuestionPrefix() {
  return `第${state.currentQuestion}题`;
}

function showAnswerOptions(demoFuncName) {
  const options = generateOptions(state.answer);
  controlArea.innerHTML = `
    <div class="answer-options">
      ${options
        .map((option) => `<button class="answer-btn" onclick="checkAnswer(${option})">${option}</button>`)
        .join('')}
    </div>
    ${demoFuncName
      ? `<button class="btn-ghost btn-sm" onclick="${demoFuncName}()" style="margin-top:16px;">📕 看演示</button>`
      : ''}
  `;
}

function generateOptions(answer) {
  const options = [answer];

  while (options.length < 4) {
    const delta = Math.floor(Math.random() * 7) - 3;
    const candidate = Math.max(1, answer + delta);
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  return options.sort(() => Math.random() - 0.5);
}

function checkAnswer(selected) {
  controlArea.innerHTML = '';

  if (selected === state.answer) {
    state.correctCount += 1;
    speakFeedback('✅ 太好啦！', 'correct');
  } else {
    speakFeedback('😹 再想想', 'encourage');
  }

  setTimeout(() => {
    nextQuestion();
  }, 1500);
}

function showCompleteScreen() {
  const score = Math.round((state.correctCount / state.totalQuestions) * 100);
  let emoji = '🎉';
  let message = '继续加油！';
  let encouragement = '每一次练习都是进步。';

  if (score >= 90) {
    emoji = '🏆';
    message = '太棒了！';
    encouragement = '你真是个数学小天才！';
  } else if (score >= 70) {
    emoji = '🎉';
    message = '很不错！';
    encouragement = '继续保持，你会越来越棒。';
  } else if (score >= 50) {
    emoji = '👏';
    message = '加油！';
    encouragement = '多练习就会进步。';
  }

  setPrompt(
    '练习完成',
    `${message}，答对 ${state.correctCount} 题，共 ${state.totalQuestions} 题，正确率 ${score}%`
  );

  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:72px;margin-bottom:20px;">${emoji}</div>
      <div style="font-size:36px;font-weight:700;color:var(--blue);margin-bottom:12px;">${message}</div>
      <div style="font-size:28px;font-weight:700;color:var(--green);margin-bottom:12px;">
        答对 ${state.correctCount}/${state.totalQuestions} 题
      </div>
      <div style="font-size:20px;color:var(--gray-500);margin-bottom:8px;">正确率 ${score}%</div>
      <div style="font-size:18px;color:var(--gray-400);">${encouragement}</div>
    </div>
  `;
  controlArea.innerHTML = '';
  bottomActions.style.display = 'flex';
  actionBtn.textContent = '再来一组';
  actionBtn.className = 'btn btn-blue btn-lg';
  actionBtn.onclick = startPractice;
  feedback.textContent = '';
  feedback.className = 'feedback';
  return;

  controlArea.innerHTML = '<button class="btn-blue btn-lg" onclick="startPractice()">再来一组</button>';
  feedback.textContent = '';
  feedback.className = 'feedback';
}

function generateLevel1Question() {
  const isAddition = Math.random() > 0.5;
  state.type = isAddition ? 'addition' : 'subtraction';
  state.currentFruit = fruits[Math.floor(Math.random() * fruits.length)];

  if (isAddition) {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * (10 - a)) + 1;
    state.question = { a, b };
    state.answer = a + b;
    renderLevel1Addition();
  } else {
    const result = Math.floor(Math.random() * 8) + 2;
    const subtract = Math.floor(Math.random() * result) + 1;
    const total = result + subtract;
    state.question = { total, subtract };
    state.answer = result;
    renderLevel1Subtraction();
  }
}

function renderLevel1Addition() {
  const { a, b } = state.question;
  const fruit = state.currentFruit;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, `${getQuestionPrefix()}，${a}加${b}等于几？`);

  visualArea.innerHTML = `
    <div class="objects-container">
      <div class="object-group">
        ${Array(a).fill(fruit).map(() => `<div class="object-item">${fruit}</div>`).join('')}
      </div>
      <div style="font-size:48px;color:var(--gray-400);">+</div>
      <div class="object-group">
        ${Array(b).fill(fruit).map(() => `<div class="object-item">${fruit}</div>`).join('')}
      </div>
    </div>
  `;

  showAnswerOptions('showLevel1AdditionDemo');
}

function showLevel1AdditionDemo() {
  const { a, b } = state.question;
  const fruit = state.currentFruit;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, '把两边的水果合起来数一数');

  visualArea.innerHTML = `
    <div class="objects-container">
      <div class="object-group">
        ${Array(a).fill(fruit).map(() => `<div class="object-item">${fruit}</div>`).join('')}
      </div>
      <div style="font-size:48px;color:var(--gray-400);">+</div>
      <div class="object-group">
        ${Array(b).fill(fruit).map(() => `<div class="object-item">${fruit}</div>`).join('')}
      </div>
    </div>
  `;

  controlArea.innerHTML = '<button class="merge-btn" onclick="mergeApples()">合并到一起</button>';
}

function mergeApples() {
  const { a, b } = state.question;
  const total = a + b;
  const fruit = state.currentFruit;

  visualArea.innerHTML = `
    <div class="object-group">
      ${Array(total).fill(fruit).map(() => `<div class="object-item">${fruit}</div>`).join('')}
    </div>
  `;

  speakFeedback(`🎉 一共有 ${total} 个！`, 'correct');

  setTimeout(() => {
    feedback.textContent = '';
    feedback.className = 'feedback';
    renderLevel1Addition();
  }, 1500);
}

function renderLevel1Subtraction() {
  const { total, subtract } = state.question;
  const fruit = state.currentFruit;
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `${getQuestionPrefix()}，${total}减${subtract}等于几？`);

  visualArea.innerHTML = `
    <div class="object-group">
      ${Array(total)
        .fill(fruit)
        .map((item, index) => `<div class="object-item ${index >= total - subtract ? 'to-remove' : ''}">${item}</div>`)
        .join('')}
    </div>
    <div style="margin-top:16px;font-size:18px;color:var(--gray-500);">
      原来有 ${total} 个，要拿走 ${subtract} 个
    </div>
  `;

  showAnswerOptions('showLevel1SubtractionDemo');
}

function showLevel1SubtractionDemo() {
  const { total, subtract } = state.question;
  const fruit = state.currentFruit;
  state.eaten = 0;
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `点一点，拿走 ${subtract} 个`);

  visualArea.innerHTML = `
    <div class="object-group" id="apples">
      ${Array(total)
        .fill(fruit)
        .map((item, index) => `<div class="object-item" onclick="eatApple(${index})">${item}</div>`)
        .join('')}
    </div>
    <div style="margin-top:16px;font-size:18px;color:var(--gray-500);">点击拿走 ${subtract} 个</div>
  `;

  controlArea.innerHTML = '';
}

function eatApple(index) {
  const apples = $$('#apples .object-item');
  if (apples[index].classList.contains('eaten')) return;

  apples[index].classList.add('eaten');
  state.eaten += 1;

  if (state.eaten === state.question.subtract) {
    setTimeout(() => {
      speakFeedback('✅ 拿走完成！', 'correct');
      setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
        renderLevel1Subtraction();
      }, 1000);
    }, 500);
  }
}

function generateLevel2Question() {
  const a = Math.floor(Math.random() * 3) + 8;
  const b = Math.floor(Math.random() * (20 - a - 1)) + 2;
  state.question = { a, b };
  state.answer = a + b;
  renderLevel2Addition();
}

function renderLevel2Addition() {
  const { a, b } = state.question;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, `${getQuestionPrefix()}，${a}加${b}等于几？`);

  visualArea.innerHTML = `
    <div class="level2-container">
      <div class="ten-frame" id="mainFrame">
        ${Array(10).fill(0).map(() => '<div class="frame-cell"></div>').join('')}
      </div>
      <div class="waiting-area" id="waitingArea"></div>
    </div>
  `;

  const cells = $$('#mainFrame .frame-cell');
  for (let index = 0; index < a; index += 1) {
    cells[index].classList.add('filled');
  }

  $('#waitingArea').innerHTML = Array(b).fill(0).map(() => '<div class="waiting-dot"></div>').join('');
  showAnswerOptions('showLevel2Demo');
}

function showLevel2Demo() {
  const { a, b } = state.question;
  const need = 10 - a;
  state.movedCount = 0;
  state.needToMove = need;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, `点 ${need} 个圆点，先凑成 10`);

  visualArea.innerHTML = `
    <div class="level2-container">
      <div class="ten-frame" id="mainFrame">
        ${Array(10).fill(0).map(() => '<div class="frame-cell"></div>').join('')}
      </div>
      <div class="waiting-area" id="waitingArea"></div>
    </div>
  `;

  const cells = $$('#mainFrame .frame-cell');
  for (let index = 0; index < a; index += 1) {
    cells[index].classList.add('filled');
  }

  $('#waitingArea').innerHTML = Array(b)
    .fill(0)
    .map((_, index) => `<div class="waiting-dot" onclick="moveDotToFrame(${index})" data-index="${index}"></div>`)
    .join('');

  controlArea.innerHTML = `<div style="font-size:18px;color:var(--gray-500);margin-top:12px;">点击 ${need} 个圆点，先凑成 10</div>`;
}

function moveDotToFrame(index) {
  const dot = $(`.waiting-dot[data-index="${index}"]`);
  if (!dot || dot.classList.contains('moved')) return;

  dot.classList.add('moved');
  state.movedCount += 1;

  const cells = [...$$('#mainFrame .frame-cell')];
  const emptyIndex = cells.findIndex((cell) => !cell.classList.contains('filled'));
  if (emptyIndex >= 0) {
    cells[emptyIndex].classList.add('filled');
  }

  if (state.movedCount === state.needToMove) {
    setTimeout(() => {
      speakFeedback('✅ 凑成10啦！', 'correct');
      controlArea.innerHTML = '<button class="merge-btn" onclick="carryOver()">看结果</button>';
    }, 300);
  }
}

function carryOver() {
  const { a, b } = state.question;
  const total = a + b;
  const remaining = b - state.needToMove;

  visualArea.innerHTML = `
    <div class="level2-container">
      <div class="ten-frame full" id="mainFrame">
        ${Array(10).fill(0).map(() => '<div class="frame-cell filled"></div>').join('')}
      </div>
      ${remaining > 0
        ? `<div class="waiting-area">${Array(remaining).fill(0).map(() => '<div class="waiting-dot"></div>').join('')}</div>`
        : ''}
    </div>
    <div class="result-display">${total}</div>
  `;

  speakFeedback(`🎉 10 + ${remaining} = ${total}`, 'correct');

  setTimeout(() => {
    feedback.textContent = '';
    feedback.className = 'feedback';
    renderLevel2Addition();
  }, 1500);
}

function generateLevel3Question() {
  const tens = Math.floor(Math.random() * 7) + 2;
  const ones = Math.floor(Math.random() * 5) + 1;
  const total = tens * 10 + ones;
  const subtract = ones + Math.floor(Math.random() * 5) + 3;

  state.question = { total, subtract, tens, ones };
  state.answer = total - subtract;
  state.bundles = tens;
  state.singles = ones;

  renderLevel3Subtraction();
}

function renderLevel3Subtraction() {
  const { total, subtract } = state.question;
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `${getQuestionPrefix()}，${total}减${subtract}等于几？`);
  updateRodsDisplay();
  showAnswerOptions('showLevel3Demo');
}

function showLevel3Demo() {
  const { total, subtract } = state.question;
  state.toRemove = subtract;
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `长按一捆拆开，再拿走 ${subtract} 根小棒`);
  updateRodsDisplay();

  controlArea.innerHTML = `
    <div style="font-size:18px;color:var(--gray-500);margin-bottom:12px;">
      长按一捆可以拆开，点击单根可以拿走
    </div>
    <div style="font-size:20px;font-weight:700;">
      还需要拿走 <span id="remainCount" style="color:var(--red);">${subtract}</span> 根
    </div>
  `;
}

function updateRodsDisplay() {
  visualArea.innerHTML = `
    <div class="rods-container" id="rodsContainer">
      ${Array(state.bundles)
        .fill(0)
        .map((_, index) => `<div class="rod-bundle" onmousedown="startUnbundle(${index})" ontouchstart="startUnbundle(${index})"></div>`)
        .join('')}
      ${Array(state.singles)
        .fill(0)
        .map((_, index) => `<div class="rod-single" onclick="removeSingle(${index})"></div>`)
        .join('')}
    </div>
    <div style="margin-top:16px;font-size:20px;font-weight:700;">
      <span style="color:var(--blue);">十位: ${state.bundles}</span>
      <span style="margin:0 20px;color:var(--gray-400);">|</span>
      <span style="color:var(--green);">个位: ${state.singles}</span>
    </div>
  `;
}

let unbundleTimer = null;

function startUnbundle() {
  if (state.bundles === 0) return;

  unbundleTimer = setTimeout(() => {
    state.bundles -= 1;
    state.singles += 10;
    updateRodsDisplay();
    speakFeedback('✅ 拆捆成功！', 'correct');
  }, 300);
}

window.addEventListener('mouseup', () => clearTimeout(unbundleTimer));
window.addEventListener('touchend', () => clearTimeout(unbundleTimer));

function removeSingle() {
  if (state.toRemove === 0 || state.singles === 0) return;

  state.singles -= 1;
  state.toRemove -= 1;
  updateRodsDisplay();

  const remainCount = $('#remainCount');
  if (remainCount) {
    remainCount.textContent = state.toRemove;
  }

  if (state.toRemove === 0) {
    setTimeout(() => {
      speakFeedback('🎉 拿走完成！', 'correct');
      setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
        renderLevel3Subtraction();
      }, 1000);
    }, 300);
  }
}

showStartScreen();
