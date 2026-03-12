const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const fruits = ['🍎', '🍊', '🍇', '🍓', '🍌', '🍉', '🥝', '🍑'];

const state = {
  level: 1,
  type: 'addition',
  question: null,
  answer: null,
  step: 0,
  practiceMode: false,
  currentQuestion: 0,
  totalQuestions: 10,
  correctCount: 0,
  currentFruit: '🍎'
};

const questionDisplay = $('#questionDisplay');
const visualArea = $('#visualArea');
const controlArea = $('#controlArea');
const feedback = $('#feedback');

// 切换难度
$$('.mode-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.mode-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.level = parseInt(btn.dataset.level);
    showStartScreen();
  });
});

// 显示开始界面
function showStartScreen() {
  feedback.textContent = '';
  questionDisplay.textContent = '';
  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:48px;margin-bottom:20px;">🎯</div>
      <div style="font-size:24px;color:var(--gray-500);margin-bottom:32px;">准备好了吗？</div>
    </div>
  `;
  controlArea.innerHTML = '<button class="btn-green btn-lg" onclick="startPractice()">开始练习</button>';
}

// 开始练习
function startPractice() {
  state.practiceMode = true;
  state.currentQuestion = 0;
  state.correctCount = 0;
  nextQuestion();
}

// 生成题目
function nextQuestion() {
  if (!state.practiceMode) return;

  if (state.currentQuestion >= state.totalQuestions) {
    showCompleteScreen();
    return;
  }

  state.currentQuestion++;
  feedback.textContent = '';
  state.step = 0;
  questionDisplay.textContent = `第 ${state.currentQuestion}/${state.totalQuestions} 题`;

  if (state.level === 1) {
    generateLevel1Question();
  } else if (state.level === 2) {
    generateLevel2Question();
  } else {
    generateLevel3Question();
  }
}

// 难度1：10以内
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
  questionDisplay.textContent = `${a} + ${b} = ?`;

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

  feedback.textContent = `🎉 一共有 ${total} 个！`;
  feedback.className = 'feedback correct';

  setTimeout(() => {
    feedback.textContent = '';
    renderLevel1Addition();
  }, 1500);
}

function showAnswerOptions(demoFunc) {
  const options = generateOptions(state.answer);
  controlArea.innerHTML = `
    <div class="answer-options">
      ${options.map(opt =>
        `<button class="answer-btn" onclick="checkAnswer(${opt})">${opt}</button>`
      ).join('')}
    </div>
    ${demoFunc ? `<button class="btn-ghost btn-sm" onclick="${demoFunc}()" style="margin-top:16px;">💡 看演示</button>` : ''}
  `;
}

function generateOptions(answer) {
  const options = [answer];
  const maxTries = 50;
  let tries = 0;

  while (options.length < 4 && tries < maxTries) {
    const opt = Math.max(1, answer + Math.floor(Math.random() * 7) - 3);
    if (!options.includes(opt) && opt > 0) {
      options.push(opt);
    }
    tries++;
  }

  return options.sort(() => Math.random() - 0.5);
}

function checkAnswer(selected) {
  if (selected === state.answer) {
    state.correctCount++;
    feedback.textContent = '✨ 太好啦！';
    feedback.className = 'feedback correct';
  } else {
    feedback.textContent = '🤔 再想想？';
    feedback.className = 'feedback encourage';
  }

  controlArea.innerHTML = '';

  setTimeout(() => {
    nextQuestion();
  }, 1500);
}

// 显示完成界面
function showCompleteScreen() {
  const score = Math.round((state.correctCount / state.totalQuestions) * 100);
  questionDisplay.textContent = '练习完成';

  let emoji = '🎉';
  let message = '继续加油！';
  let encouragement = '';

  if (score >= 90) {
    emoji = '🏆';
    message = '太棒了！';
    encouragement = '你真是个数学小天才！';
  } else if (score >= 70) {
    emoji = '🎉';
    message = '很不错！';
    encouragement = '继续保持，你会更棒的！';
  } else if (score >= 50) {
    emoji = '💪';
    message = '加油！';
    encouragement = '多练习就会进步的！';
  } else {
    emoji = '🌟';
    message = '继续努力！';
    encouragement = '每一次练习都是进步！';
  }

  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:72px;margin-bottom:20px;">${emoji}</div>
      <div style="font-size:36px;font-weight:700;color:var(--blue);margin-bottom:12px;">
        ${message}
      </div>
      <div style="font-size:28px;font-weight:700;color:var(--green);margin-bottom:12px;">
        答对 ${state.correctCount}/${state.totalQuestions} 题
      </div>
      <div style="font-size:20px;color:var(--gray-500);margin-bottom:8px;">正确率 ${score}%</div>
      <div style="font-size:18px;color:var(--gray-400);">${encouragement}</div>
    </div>
  `;

  controlArea.innerHTML = '<button class="btn-blue btn-lg" onclick="startPractice()">再来一组</button>';
  feedback.textContent = '';
}

function renderLevel1Subtraction() {
  const { total, subtract } = state.question;
  const fruit = state.currentFruit;
  questionDisplay.textContent = `${total} - ${subtract} = ?`;

  visualArea.innerHTML = `
    <div class="object-group">
      ${Array(total).fill(fruit).map((f, i) =>
        `<div class="object-item ${i >= total - subtract ? 'to-remove' : ''}">${f}</div>`
      ).join('')}
    </div>
    <div style="margin-top:16px;font-size:18px;color:var(--gray-500);">
      有 ${total} 个，要拿走 ${subtract} 个
    </div>
  `;

  showAnswerOptions('showLevel1SubtractionDemo');
}

function showLevel1SubtractionDemo() {
  const { total, subtract } = state.question;
  const fruit = state.currentFruit;
  visualArea.innerHTML = `
    <div class="object-group" id="apples">
      ${Array(total).fill(fruit).map((f, i) =>
        `<div class="object-item" onclick="eatApple(${i})">${f}</div>`
      ).join('')}
    </div>
    <div style="margin-top:16px;font-size:18px;color:var(--gray-500);">点击吃掉 ${subtract} 个</div>
  `;
  controlArea.innerHTML = '';
  state.eaten = 0;
}

function eatApple(index) {
  const apples = $$('#apples .object-item');
  if (apples[index].classList.contains('eaten')) return;

  apples[index].classList.add('eaten');
  state.eaten++;

  if (state.eaten === state.question.subtract) {
    setTimeout(() => {
      feedback.textContent = '✨ 吃完啦！';
      feedback.className = 'feedback correct';
      setTimeout(() => {
        feedback.textContent = '';
        renderLevel1Subtraction();
      }, 1000);
    }, 500);
  }
}

// 难度2：20以内进位
function generateLevel2Question() {
  const a = Math.floor(Math.random() * 3) + 8;
  const b = Math.floor(Math.random() * (20 - a - 1)) + 2;
  state.question = { a, b };
  state.answer = a + b;
  renderLevel2Addition();
}

function renderLevel2Addition() {
  const { a, b } = state.question;
  questionDisplay.textContent = `${a} + ${b} = ?`;

  visualArea.innerHTML = `
    <div class="level2-container">
      <div class="ten-frame" id="mainFrame">
        ${Array(10).fill(0).map(() => '<div class="frame-cell"></div>').join('')}
      </div>
      <div class="waiting-area" id="waitingArea"></div>
    </div>
  `;

  const cells = $$('#mainFrame .frame-cell');
  for (let i = 0; i < a; i++) {
    cells[i].classList.add('filled');
  }

  const waitingArea = $('#waitingArea');
  waitingArea.innerHTML = Array(b).fill(0).map(() => '<div class="waiting-dot"></div>').join('');

  showAnswerOptions('showLevel2Demo');
}

function showLevel2Demo() {
  const { a, b } = state.question;
  const need = 10 - a;

  visualArea.innerHTML = `
    <div class="level2-container">
      <div class="ten-frame" id="mainFrame">
        ${Array(10).fill(0).map(() => '<div class="frame-cell"></div>').join('')}
      </div>
      <div class="waiting-area" id="waitingArea"></div>
    </div>
  `;

  const cells = $$('#mainFrame .frame-cell');
  for (let i = 0; i < a; i++) {
    cells[i].classList.add('filled');
  }

  const waitingArea = $('#waitingArea');
  waitingArea.innerHTML = Array(b).fill(0).map((_, i) =>
    `<div class="waiting-dot" onclick="moveDotToFrame(${i})" data-index="${i}"></div>`
  ).join('');

  controlArea.innerHTML = `<div style="font-size:18px;color:var(--gray-500);margin-top:12px;">点击 ${need} 个圆点移到框里凑成10</div>`;
  state.movedCount = 0;
  state.needToMove = need;
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
      ${remaining > 0 ? `<div class="waiting-area">${Array(remaining).fill(0).map(() => '<div class="waiting-dot"></div>').join('')}</div>` : ''}
    </div>
    <div class="result-display">${total}</div>
  `;

  feedback.textContent = `🎉 10 + ${remaining} = ${total}`;
  feedback.className = 'feedback correct';

  setTimeout(() => {
    feedback.textContent = '';
    renderLevel2Addition();
  }, 1500);
}

function moveDotToFrame(index) {
  const dot = $(`.waiting-dot[data-index="${index}"]`);
  if (!dot || dot.classList.contains('moved')) return;

  dot.classList.add('moved');
  state.movedCount++;

  const cells = $$('#mainFrame .frame-cell');
  const emptyIndex = Array.from(cells).findIndex(c => !c.classList.contains('filled'));
  if (emptyIndex >= 0) {
    cells[emptyIndex].classList.add('filled');
  }

  if (state.movedCount === state.needToMove) {
    setTimeout(() => {
      feedback.textContent = '✨ 满10了！';
      feedback.className = 'feedback correct';
      controlArea.innerHTML = '<button class="merge-btn" onclick="carryOver()">看结果</button>';
    }, 300);
  }
}

// 难度3：100以内退位
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
  questionDisplay.textContent = `${total} - ${subtract} = ?`;

  updateRodsDisplay();
  showAnswerOptions('showLevel3Demo');
}

function showLevel3Demo() {
  const { total, subtract } = state.question;
  updateRodsDisplay();
  controlArea.innerHTML = `
    <div style="font-size:18px;color:var(--gray-500);margin-bottom:12px;">
      长按一捆可以拆开，点击单根拿走
    </div>
    <div style="font-size:20px;font-weight:700;">
      还需要拿走 <span id="remainCount" style="color:var(--red);">${subtract}</span> 根
    </div>
  `;
  state.toRemove = subtract;
}

function updateRodsDisplay() {
  visualArea.innerHTML = `
    <div class="rods-container" id="rodsContainer">
      ${Array(state.bundles).fill(0).map((_, i) =>
        `<div class="rod-bundle" onmousedown="startUnbundle(${i})" ontouchstart="startUnbundle(${i})"></div>`
      ).join('')}
      ${Array(state.singles).fill(0).map((_, i) =>
        `<div class="rod-single" onclick="removeSingle(${i})"></div>`
      ).join('')}
    </div>
    <div style="margin-top:16px;font-size:20px;font-weight:700;">
      <span style="color:var(--blue);">十位: ${state.bundles}</span>
      <span style="margin:0 20px;color:var(--gray-400);">|</span>
      <span style="color:var(--green);">个位: ${state.singles}</span>
    </div>
  `;
}

let unbundleTimer = null;

function startUnbundle(index) {
  if (state.bundles === 0) return;
  unbundleTimer = setTimeout(() => {
    state.bundles--;
    state.singles += 10;
    updateRodsDisplay();
    feedback.textContent = '✨ 拆捆成功！';
    feedback.className = 'feedback correct';
  }, 300);
}

window.addEventListener('mouseup', () => clearTimeout(unbundleTimer));
window.addEventListener('touchend', () => clearTimeout(unbundleTimer));

function removeSingle(index) {
  if (state.toRemove === 0) return;
  state.singles--;
  state.toRemove--;

  $('#remainCount').textContent = state.toRemove;
  updateRodsDisplay();

  if (state.toRemove === 0) {
    setTimeout(() => {
      feedback.textContent = '🌸 拿走完成！';
      feedback.className = 'feedback correct';
      setTimeout(() => {
        feedback.textContent = '';
        renderLevel3Subtraction();
      }, 1000);
    }, 300);
  }
}

// 初始化
showStartScreen();
