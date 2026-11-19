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
  totalQuestions: 5,
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

let nextQuestionTimer = null;

function clearNextQuestionTimer() {
  if (nextQuestionTimer) {
    clearTimeout(nextQuestionTimer);
    nextQuestionTimer = null;
  }
}

function showStartScreen() {
  clearNextQuestionTimer();
  state.practiceMode = false;
  state.currentQuestion = 0;
  state.correctCount = 0;
  feedback.textContent = '';
  feedback.className = 'feedback';
  bottomActions.style.display = 'none';
  setPrompt('准备好了吗？', '准备好了吗？点击开始练习');
  visualArea.innerHTML = `
    <div style="text-align:center;padding:40px 0;">
      <div style="font-size:48px;margin-bottom:20px;">🎯</div>
      <div style="font-size:24px;color:var(--gray-500);margin-bottom:32px;">准备好开始练习了吗？</div>
    </div>
  `;
  controlArea.innerHTML = '<button class="btn btn-green btn-lg" onclick="startPractice()">🎯 开始练习</button>';
}

function startPractice() {
  clearNextQuestionTimer();
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
      ? `<button class="demo-watch-btn" onclick="${demoFuncName}()">📺 看演示</button>`
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
  if (selected === state.answer) {
    controlArea.innerHTML = '';
    state.correctCount += 1;
    speakFeedback('✅ 太好啦！', 'correct');
  } else {
    speakFeedback('😹 再想想', 'encourage');
  }
  if (selected !== state.answer) return;

  clearNextQuestionTimer();
  nextQuestionTimer = setTimeout(() => {
    nextQuestionTimer = null;
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
  controlArea.innerHTML = '<button class="btn btn-blue btn-lg" onclick="startPractice()">🔄 再练一轮</button>';
  bottomActions.style.display = 'none';
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
    const total = Math.floor(Math.random() * 9) + 2;
    const subtract = Math.floor(Math.random() * (total - 1)) + 1;
    const result = total - subtract;
    state.question = { total, subtract };
    state.answer = result;
    renderLevel1Subtraction();
  }
}

function renderLevel1Addition() {
  const { a, b } = state.question;
  const fruit = state.currentFruit;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, `${getQuestionPrefix()}，${a}加${b}等于多少？`);

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
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `${getQuestionPrefix()}，${total}减${subtract}等于多少？`);

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
  const a = Math.floor(Math.random() * 4) + 6;
  const minB = 11 - a;
  const maxB = 9;
  const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
  state.question = { a, b };
  state.answer = a + b;
  renderLevel2Addition();
}

function renderLevel2Addition() {
  const { a, b } = state.question;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, `${getQuestionPrefix()}，${a}加${b}等于多少？`);

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
  if (need <= 0) {
    carryOver();
    return;
  }
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

function renderTenFrame(filledCount, type = 'tens', crossedCount = 0) {
  const cells = [];
  for (let i = 0; i < 10; i++) {
    let cellClass = 'ten-cell';
    if (i < crossedCount) {
      cellClass += ' crossed';
    } else if (i < filledCount) {
      cellClass += ` filled-${type}`;
    }
    cells.push(`<div class="${cellClass}"></div>`);
  }
  return `<div class="ten-frame-grid">${cells.join('')}</div>`;
}

function renderCubeTen(options = {}) {
  const { variant = 'wood', dashed = false } = options;
  if (dashed) {
    return `<div class="cube-ten-frame dashed"></div>`;
  }
  let inner = '';
  for (let i = 0; i < 10; i++) {
    inner += `<div class="cube-unit cube-${variant}"></div>`;
  }
  return `<div class="cube-ten-frame cube-ten-${variant}">${inner}</div>`;
}

function renderCubeUnit(variant = 'wood', crossed = false) {
  const extraClass = crossed ? 'cube-crossed' : `cube-${variant}`;
  return `<div class="cube-unit ${extraClass}"></div>`;
}

let demoStep = 1;
let demoAutoPlayTimer = null;

function generateLevel3Question() {
  const isAddition = Math.random() > 0.5;
  state.type = isAddition ? 'addition' : 'subtraction';

  if (isAddition) {
    // 进位加法（和在 20~99 之间，个位相加 >= 10）
    const aTens = Math.floor(Math.random() * 4) + 1; // 1..4
    const aOnes = Math.floor(Math.random() * 6) + 4; // 4..9
    const a = aTens * 10 + aOnes;

    const maxBTens = Math.min(4, 8 - aTens);
    const bTens = Math.floor(Math.random() * maxBTens) + 1; // 1..maxBTens
    const minBOnes = 10 - aOnes;
    const bOnes = Math.floor(Math.random() * (10 - minBOnes)) + minBOnes; // ensures aOnes + bOnes >= 10
    const b = bTens * 10 + bOnes;

    state.question = { a, b, aTens, aOnes, bTens, bOnes };
    state.answer = a + b;
    renderLevel3Addition();
  } else {
    // 退位减法（被减数 21~95，减数个位 > 被减数个位）
    const tens = Math.floor(Math.random() * 5) + 3; // 3..7
    const ones = Math.floor(Math.random() * 5) + 1; // 1..5
    const total = tens * 10 + ones;

    const subTens = Math.floor(Math.random() * (tens - 2)) + 1; // 1..(tens-2)
    const subOnes = Math.floor(Math.random() * (9 - ones)) + ones + 1; // subOnes > ones
    const subtract = subTens * 10 + subOnes;

    state.question = { total, subtract, tens, ones, subTens, subOnes };
    state.answer = total - subtract;
    renderLevel3Subtraction();
  }
}

function renderLevel3Addition() {
  clearTimeout(demoAutoPlayTimer);
  const { a, b, aTens, aOnes, bTens, bOnes } = state.question;
  setPrompt(`${getQuestionPrefix()}：${a} + ${b} = ?`, `${getQuestionPrefix()}，${a}加${b}等于多少？`);

  visualArea.innerHTML = `
    <div class="level3-practice-stage">
      <div class="practice-col" style="flex:1.2;">
        <div class="practice-col-title">📦 十位 (${aTens + bTens} 个十 = ${(aTens + bTens) * 10})</div>
        <div class="practice-blocks-wrap">
          ${Array(aTens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
          <div style="width:2px;height:70px;background:#E2E8F0;margin:0 4px;"></div>
          ${Array(bTens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
        </div>
      </div>
      <div class="practice-col">
        <div class="practice-col-title">🧱 个位 (${aOnes} + ${bOnes} 粒)</div>
        <div class="practice-blocks-wrap" style="max-width:180px;">
          ${Array(aOnes).fill(0).map(() => renderCubeUnit('wood')).join('')}
          <div style="width:100%;height:1px;background:#E2E8F0;margin:2px 0;"></div>
          ${Array(bOnes).fill(0).map(() => renderCubeUnit('wood')).join('')}
        </div>
      </div>
    </div>
  `;
  showAnswerOptions('showLevel3Demo');
}

function renderLevel3Subtraction() {
  clearTimeout(demoAutoPlayTimer);
  const { total, subtract, tens, ones } = state.question;
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `${getQuestionPrefix()}，${total}减${subtract}等于多少？`);

  visualArea.innerHTML = `
    <div class="level3-practice-stage">
      <div class="practice-col">
        <div class="practice-col-title">📦 十位 (${tens} 个十 = ${tens * 10})</div>
        <div class="practice-blocks-wrap">
          ${Array(tens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
        </div>
      </div>
      <div class="practice-col">
        <div class="practice-col-title">🧱 个位 (${ones} 粒)</div>
        <div class="practice-blocks-wrap" style="max-width:140px;">
          ${Array(ones).fill(0).map(() => renderCubeUnit('wood')).join('')}
        </div>
      </div>
    </div>
  `;
  showAnswerOptions('showLevel3Demo');
}

function showLevel3Demo() {
  demoStep = 1;
  clearTimeout(demoAutoPlayTimer);
  renderLevel3DemoStep(1);
}

function exitLevel3Demo() {
  if (state.type === 'addition') {
    renderLevel3Addition();
  } else {
    renderLevel3Subtraction();
  }
}

function renderLevel3DemoStep(step) {
  demoStep = step;
  clearTimeout(demoAutoPlayTimer);

  if (state.type === 'addition') {
    renderLevel3AdditionDemoStep(step);
  } else {
    renderLevel3SubtractionDemoStep(step);
  }
}

function renderLevel3SubtractionDemoStep(step) {
  const { total, subtract, tens, ones, subTens, subOnes } = state.question;
  const tensLeftAfterBorrow = tens - 1;
  const remainInBorrow = 10 - subOnes;
  const finalOnes = remainInBorrow + ones;
  const finalTens = tensLeftAfterBorrow - subTens;
  const finalResult = total - subtract;

  const stepLabels = ['1. 观察原数', '2. 借10到个位', `3. 个位破十减${subOnes}`, '4. 十位结算'];
  const stepPillsHtml = `
    <div class="demo-step-pills">
      ${stepLabels.map((lbl, idx) => `<span class="demo-step-pill ${idx + 1 === step ? 'active' : ''}">${lbl}</span>`).join('')}
    </div>
  `;

  if (step === 1) {
    setPrompt(`${getQuestionPrefix()} 演示：${total} - ${subtract}`, `个位只有 ${ones} 粒，不够减 ${subOnes} 粒！需要从十位借 1 捆 10 到个位。`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · ${tens} 个十 (${tens * 10})</span>
            <div class="demo-col-blocks">
              ${Array(tens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 原有 ${ones} 粒</span>
            <div class="demo-col-blocks" style="max-width:140px;">
              ${Array(ones).fill(0).map(() => renderCubeUnit('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 个位只有 <strong>${ones}</strong> 粒，不够减 <strong>${subOnes}</strong> 粒！点击下一步，从十位借 1 个十到个位。
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(2)">下一步：借10到个位 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 2) {
    setPrompt(`步骤 2：从十位借 1 个 10 放到个位`, `从十位借走 1 捆十积木送到个位并拆散！十位还剩 ${tensLeftAfterBorrow} 捆，个位多出 10 粒金黄色散块！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 剩 ${tensLeftAfterBorrow} 捆 (借出 1 捆)</span>
            <div class="demo-col-blocks">
              ${Array(tensLeftAfterBorrow).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
              ${renderCubeTen({ dashed: true })}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 借来的10粒 + 原有${ones}粒</span>
            <div style="display:flex;gap:8px;width:100%;justify-content:center;align-items:flex-start;">
              <div class="tray-box tray-borrowed" style="flex:1.2;">
                <span class="tray-label">⭐ 借来的 10 粒 (黄色)</span>
                <div class="tray-units">
                  ${Array(10).fill(0).map(() => renderCubeUnit('borrow')).join('')}
                </div>
              </div>
              <div class="tray-box tray-original" style="flex:1;">
                <span class="tray-label">原有的 ${ones} 粒</span>
                <div class="tray-units">
                  ${Array(ones).fill(0).map(() => renderCubeUnit('wood')).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 十位借出 1 捆后原地留虚线；借来的 10 粒拆散放在黄色托盘中，和原有的 ${ones} 粒一眼分清！
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(3)">下一步：个位破十减${subOnes} ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 3) {
    setPrompt(`步骤 3：在个位从借来的 10 里面减去 ${subOnes}`, `在借来的 10 粒里划掉 ${subOnes} 粒，还剩 ${remainInBorrow} 粒；加上原有的 ${ones} 粒，个位一共得 ${finalOnes} 粒！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 剩 ${tensLeftAfterBorrow} 捆</span>
            <div class="demo-col-blocks">
              ${Array(tensLeftAfterBorrow).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
              ${renderCubeTen({ dashed: true })}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 破十得 ${finalOnes} 粒</span>
            <div style="display:flex;gap:8px;width:100%;justify-content:center;align-items:flex-start;">
              <div class="tray-box tray-borrowed" style="flex:1.2;">
                <span class="tray-label">⭐ 划掉 ${subOnes} 粒，剩 ${remainInBorrow} 粒</span>
                <div class="tray-units">
                  ${Array(subOnes).fill(0).map(() => renderCubeUnit('borrow', true)).join('')}
                  ${Array(remainInBorrow).fill(0).map(() => renderCubeUnit('borrow')).join('')}
                </div>
              </div>
              <div class="tray-box tray-original" style="flex:1;">
                <span class="tray-label">+ 原有 ${ones} 粒</span>
                <div class="tray-units">
                  ${Array(ones).fill(0).map(() => renderCubeUnit('wood')).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 <strong>破十法</strong>：10 减 ${subOnes} 剩 <strong>${remainInBorrow}</strong> 粒；加上原本的 <strong>${ones}</strong> 粒，个位结果为 <strong>${finalOnes}</strong>！
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(2)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(4)">下一步：十位结算与得数 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 4) {
    setPrompt(`步骤 4：算出最终答案 ${finalResult}`, `个位得 ${finalOnes}！十位 ${tensLeftAfterBorrow} 捆减去 ${subTens} 捆得 ${finalTens} 捆！最终结果是 ${finalResult}！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage" style="flex-direction:column;align-items:center;padding:12px;">
          <div class="demo-result-formula">${total} - ${subtract} = ${finalResult}</div>
          <div class="demo-summary-box">
            <div>🔹 <strong>个位 (破十法)</strong>：借10 - ${subOnes} = ${remainInBorrow}，加上原有的 ${ones} ➜ <strong>${finalOnes}</strong></div>
            <div>🔹 <strong>十位扣减</strong>：借后剩 ${tensLeftAfterBorrow} 捆 - ${subTens} 捆 ➜ <strong>${finalTens} 捆 (${finalTens * 10})</strong></div>
            <div style="margin-top:6px;color:#16A34A;font-weight:900;font-size:15px;">🎉 最终答案：${finalTens}个十 + ${finalOnes}个一 = ${finalResult}</div>
          </div>
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">🔄 重新演示</button>
        <button class="btn btn-green btn-lg" onclick="exitLevel3Demo()">✅ 我学会了，去答题</button>
      </div>
    `;
  }
}

function renderLevel3AdditionDemoStep(step) {
  const { a, b, aTens, aOnes, bTens, bOnes } = state.question;
  const sumOnes = aOnes + bOnes;
  const carryOnes = sumOnes - 10;
  const finalTens = aTens + bTens + 1;
  const finalResult = a + b;

  const stepLabels = ['1. 观察两数', '2. 个位汇合', '3. 满十拼新十', '4. 进位得数'];
  const stepPillsHtml = `
    <div class="demo-step-pills">
      ${stepLabels.map((lbl, idx) => `<span class="demo-step-pill ${idx + 1 === step ? 'active' : ''}">${lbl}</span>`).join('')}
    </div>
  `;

  if (step === 1) {
    setPrompt(`${getQuestionPrefix()} 演示：${a} + ${b}`, `加法先看个位：${aOnes} 粒加 ${bOnes} 粒。`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage" style="align-items:center;">
          <div class="demo-col">
            <span class="demo-col-badge">加数一 · ${a} (${aTens}捆+${aOnes}粒)</span>
            <div class="demo-col-blocks">
              <div style="display:flex;gap:4px;">${Array(aTens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}</div>
              <div style="display:flex;gap:3px;flex-wrap:wrap;max-width:96px;justify-content:center;">${Array(aOnes).fill(0).map(() => renderCubeUnit('wood')).join('')}</div>
            </div>
          </div>
          <div style="font-size:24px;font-weight:900;color:#94A3B8;padding:0 6px;">+</div>
          <div class="demo-col">
            <span class="demo-col-badge">加数二 · ${b} (${bTens}捆+${bOnes}粒)</span>
            <div class="demo-col-blocks">
              <div style="display:flex;gap:4px;">${Array(bTens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}</div>
              <div style="display:flex;gap:3px;flex-wrap:wrap;max-width:96px;justify-content:center;">${Array(bOnes).fill(0).map(() => renderCubeUnit('wood')).join('')}</div>
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 左边有 <strong>${a}</strong>，右边有 <strong>${b}</strong>。点击下一步，先把两边的个位合在一起！
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(2)">下一步：个位汇合 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 2) {
    setPrompt(`步骤 2：个位合在一起，发现满 10 粒！`, `个位 ${aOnes} 粒加上 ${bOnes} 粒等于 ${sumOnes} 粒，超过了 10 粒！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 共 ${aTens + bTens} 捆</span>
            <div class="demo-col-blocks">
              ${Array(aTens + bTens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位汇合 · ${sumOnes} 粒 (满十！)</span>
            <div class="tray-box tray-borrowed" style="width:100%;">
              <span class="tray-label">⭐ 个位一共 ${sumOnes} 粒 (已满 10 粒)</span>
              <div class="tray-units" style="max-width:200px;">
                ${Array(10).fill(0).map(() => renderCubeUnit('borrow')).join('')}
                ${Array(carryOnes).fill(0).map(() => renderCubeUnit('wood')).join('')}
              </div>
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 个位合起来共 <strong>${sumOnes}</strong> 粒！满 10 粒了，其中 10 粒（黄色）可以拼插合体成 1 个新的整十积木！
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(3)">下一步：满十拼新十 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 3) {
    setPrompt(`步骤 3：个位满 10 粒合体成 1 个新的整十积木！`, `把个位中的 10 粒拼成 1 个新的整十积木（黄色），个位还剩 ${carryOnes} 粒！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 原有 ${aTens + bTens} 捆</span>
            <div class="demo-col-blocks">
              ${Array(aTens + bTens).fill(0).map(() => renderCubeTen({ variant: 'wood' })).join('')}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 新合体1捆 + 剩${carryOnes}粒</span>
            <div style="display:flex;gap:8px;align-items:center;justify-content:center;">
              <div class="tray-box tray-borrowed">
                <span class="tray-label">⭐ 新合体 10 (变身整十)</span>
                <div>${renderCubeTen({ variant: 'borrow' })}</div>
              </div>
              <div class="tray-box tray-original">
                <span class="tray-label">个位剩下</span>
                <div class="tray-units">${Array(carryOnes).fill(0).map(() => renderCubeUnit('wood')).join('')}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 <strong>满十进一</strong>：个位的 10 粒合体变成 1 个金黄色的“十积木”！点击下一步，让它进位到十位。
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(2)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(4)">下一步：进位到十位得数 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 4) {
    setPrompt(`步骤 4：进位到十位，得出答案 ${finalResult}`, `新拼成的 1 捆加入十位，十位变成 ${finalTens} 捆，个位剩下 ${carryOnes} 粒，最终结果是 ${finalResult}！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage" style="flex-direction:column;align-items:center;padding:12px;">
          <div class="demo-result-formula">${a} + ${b} = ${finalResult}</div>
          <div class="demo-summary-box">
            <div>🔹 <strong>个位计算</strong>：${aOnes} + ${bOnes} = ${sumOnes} ➜ 满十进一，个位留下 <strong>${carryOnes}</strong></div>
            <div>🔹 <strong>十位计算</strong>：${aTens} 捆 + ${bTens} 捆 + (进位1捆) ➜ <strong>${finalTens} 捆 (${finalTens * 10})</strong></div>
            <div style="margin-top:6px;color:#16A34A;font-weight:900;font-size:15px;">🎉 最终答案：${finalTens}个十 + ${carryOnes}个一 = ${finalResult}</div>
          </div>
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">🔄 重新演示</button>
        <button class="btn btn-green btn-lg" onclick="exitLevel3Demo()">✅ 我学会了，去答题</button>
      </div>
    `;
  }
}

showStartScreen();
