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
    cells[emptyIndex].classList.add('filled', 'filled-blue');
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
        ${Array(10).fill(0).map((_, i) => `<div class="frame-cell filled ${i >= a ? 'filled-blue' : ''}"></div>`).join('')}
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

function renderStickBundle(options = {}) {
  const { variant = 'wood', dashed = false } = options;
  if (dashed) {
    return `<div class="stick-bundle dashed"></div>`;
  }
  const goldClass = variant === 'borrow' || variant === 'gold' ? 'bundle-gold' : '';
  return `<div class="stick-bundle ${goldClass}"></div>`;
}

function renderStickSingle(variant = 'wood', crossed = false) {
  const goldClass = variant === 'borrow' || variant === 'gold' ? 'stick-gold' : '';
  const crossClass = crossed ? 'crossed' : '';
  return `<div class="stick-single ${goldClass} ${crossClass}"></div>`;
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
    <div class="vertical-addition-board">
      <div class="addition-board-header">
        <div class="col-head col-head-label">加数</div>
        <div class="col-head col-head-tens">🪵 十位 (${aTens}捆 / ${bTens}捆)</div>
        <div class="col-head col-head-ones">🥢 个位 (${aOnes}根 / ${bOnes}根)</div>
      </div>

      <!-- 第一行：加数一 a -->
      <div class="addition-row">
        <div class="row-tag-badge">${a}</div>
        <div class="row-cell-tens">
          ${Array(aTens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
        </div>
        <div class="row-cell-ones">
          ${Array(aOnes).fill(0).map(() => renderStickSingle('wood')).join('')}
        </div>
      </div>

      <!-- 加号分割线 -->
      <div class="addition-divider-line">
        <span class="operator-badge">+</span>
      </div>

      <!-- 第二行：加数二 b -->
      <div class="addition-row">
        <div class="row-tag-badge">${b}</div>
        <div class="row-cell-tens">
          ${Array(bTens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
        </div>
        <div class="row-cell-ones">
          ${Array(bOnes).fill(0).map(() => renderStickSingle('wood')).join('')}
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
        <div class="practice-col-title">🪵 十位 (${tens} 捆 = ${tens * 10} 根)</div>
        <div class="practice-blocks-wrap">
          ${Array(tens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
        </div>
      </div>
      <div class="practice-col">
        <div class="practice-col-title">🥢 个位 (${ones} 根)</div>
        <div class="practice-blocks-wrap">
          ${Array(ones).fill(0).map(() => renderStickSingle('wood')).join('')}
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

  const stepLabels = ['1. 观察原数', '2. 拆解1捆', `3. 破十减${subOnes}`, '4. 十位结算'];
  const stepPillsHtml = `
    <div class="demo-step-pills">
      ${stepLabels.map((lbl, idx) => `<span class="demo-step-pill ${idx + 1 === step ? 'active' : ''}">${lbl}</span>`).join('')}
    </div>
  `;

  if (step === 1) {
    setPrompt(`${getQuestionPrefix()} 演示：${total} - ${subtract}`, `个位只有 ${ones} 根，不够减 ${subOnes} 根！需要从十位拿 1 捆 10 到个位解开。`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · ${tens} 捆 (${tens * 10} 根)</span>
            <div class="demo-col-blocks">
              ${Array(tens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 原有 ${ones} 根</span>
            <div class="demo-col-blocks">
              ${Array(ones).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 个位只有 <strong>${ones}</strong> 根，不够减 <strong>${subOnes}</strong> 根！点击下一步，从十位拆开 1 捆小棒送到个位。
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(2)">下一步：拆开1捆到个位 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 2) {
    setPrompt(`步骤 2：从十位借 1 捆，解开红绳散成 10 根！`, `十位借出 1 捆送去个位，解开变成 10 根黄色散棒！十位还剩 ${tensLeftAfterBorrow} 捆。`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 剩 ${tensLeftAfterBorrow} 捆 (借出1捆)</span>
            <div class="demo-col-blocks">
              ${Array(tensLeftAfterBorrow).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
              ${renderStickBundle({ dashed: true })}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 借10根 + 原${ones}根</span>
            <div class="demo-col-blocks" style="gap:3px;">
              ${Array(10).fill(0).map(() => renderStickSingle('borrow')).join('')}
              <div style="width:1.5px;height:45px;background:#CBD5E1;margin:0 2px;"></div>
              ${Array(ones).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 十位借走 1 捆（留虚线）；个位拆开 <strong>10</strong> 根黄色小棒，和原本的 <strong>${ones}</strong> 根并排对齐。
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
    setPrompt(`步骤 3：在个位从解开的 10 根里面减去 ${subOnes} 根！`, `在借来的 10 根里拿走 ${subOnes} 根（打叉），还剩 ${remainInBorrow} 根；加上原有的 ${ones} 根，个位一共得 ${finalOnes} 根！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 剩 ${tensLeftAfterBorrow} 捆</span>
            <div class="demo-col-blocks">
              ${Array(tensLeftAfterBorrow).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
              ${renderStickBundle({ dashed: true })}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位 · 破十得 ${finalOnes} 根</span>
            <div class="demo-col-blocks" style="gap:3px;">
              ${Array(subOnes).fill(0).map(() => renderStickSingle('borrow', true)).join('')}
              ${Array(remainInBorrow).fill(0).map(() => renderStickSingle('borrow')).join('')}
              <div style="width:1.5px;height:45px;background:#CBD5E1;margin:0 2px;"></div>
              ${Array(ones).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 <strong>破十法</strong>：从借来的 10 根里拿走 ${subOnes} 根（打叉）剩 <strong>${remainInBorrow}</strong> 根；加上原有的 <strong>${ones}</strong> 根，个位共 <strong>${finalOnes}</strong> 根！
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
    setPrompt(`步骤 4：算出最终答案 ${finalResult}`, `个位得 ${finalOnes} 根，十位剩 ${finalTens} 捆，最终结果是 ${finalResult}！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage" style="flex-direction:column;align-items:center;padding:12px;">
          <div class="demo-result-formula">${total} - ${subtract} = ${finalResult}</div>
          <div class="demo-summary-box">
            <div>🔹 <strong>个位 (破十法)</strong>：借 10 - ${subOnes} = ${remainInBorrow} 根，加上原有 ${ones} 根 ➜ <strong>${finalOnes} 根</strong></div>
            <div>🔹 <strong>十位扣减</strong>：借后剩 ${tensLeftAfterBorrow} 捆 - ${subTens} 捆 ➜ <strong>${finalTens} 捆 (${finalTens * 10} 根)</strong></div>
            <div style="margin-top:6px;color:#16A34A;font-weight:900;font-size:16px;">🎉 最终答案：${finalTens}捆又${finalOnes}根 = ${finalResult}</div>
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

  const stepLabels = ['1. 观察两数', '2. 个位汇合', '3. 满十进一', '4. 算出得数'];
  const stepPillsHtml = `
    <div class="demo-step-pills">
      ${stepLabels.map((lbl, idx) => `<span class="demo-step-pill ${idx + 1 === step ? 'active' : ''}">${lbl}</span>`).join('')}
    </div>
  `;

  if (step === 1) {
    setPrompt(`${getQuestionPrefix()} 演示：${a} + ${b}`, `加法先从个位算起，观察两排加数。`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="vertical-addition-board">
          <div class="addition-board-header">
            <div class="col-head col-head-label">加数</div>
            <div class="col-head col-head-tens">🪵 十位 (${aTens}捆 / ${bTens}捆)</div>
            <div class="col-head col-head-ones">🥢 个位 (${aOnes}根 / ${bOnes}根)</div>
          </div>
          <div class="addition-row">
            <div class="row-tag-badge">${a}</div>
            <div class="row-cell-tens">
              ${Array(aTens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
            </div>
            <div class="row-cell-ones">
              ${Array(aOnes).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
          <div class="addition-divider-line">
            <span class="operator-badge">+</span>
          </div>
          <div class="addition-row">
            <div class="row-tag-badge">${b}</div>
            <div class="row-cell-tens">
              ${Array(bTens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
            </div>
            <div class="row-cell-ones">
              ${Array(bOnes).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 上排 ${a}，下排 ${b}。点击下一步，先把两排个位的小棒合在一起！
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
    setPrompt(`步骤 2：个位合在一起，发现满 10 根！`, `个位 ${aOnes} 根加 ${bOnes} 根等于 ${sumOnes} 根，超过了 10 根！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 共 ${aTens + bTens} 捆</span>
            <div class="demo-col-blocks">
              ${Array(aTens + bTens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位汇合 · ${sumOnes} 根 (满十)</span>
            <div class="demo-col-blocks" style="gap:3px;">
              ${Array(10).fill(0).map(() => renderStickSingle('borrow')).join('')}
              <div style="width:1.5px;height:45px;background:#CBD5E1;margin:0 2px;"></div>
              ${Array(carryOnes).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 个位合起来共 <strong>${sumOnes}</strong> 根！满 10 根了，准备捆成 1 捆进到十位。
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(3)">下一步：满十进一 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 3) {
    setPrompt(`步骤 3：满十进一，1 捆直接进到左边十位！`, `个位满 10 根扎成 1 捆送入十位，十位变成 ${finalTens} 捆，个位剩下 ${carryOnes} 根！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage">
          <div class="demo-col">
            <span class="demo-col-badge">十位 · 原有${aTens + bTens}捆 + 新进1捆</span>
            <div class="demo-col-blocks" style="gap:4px;">
              ${Array(aTens + bTens).fill(0).map(() => renderStickBundle({ variant: 'wood' })).join('')}
              <div style="width:1.5px;height:45px;background:#E2E8F0;margin:0 2px;"></div>
              <div style="display:inline-flex;align-items:center;">
                ${renderStickBundle({ variant: 'borrow' })}
              </div>
            </div>
          </div>
          <div class="demo-col">
            <span class="demo-col-badge">个位剩下 · ${carryOnes} 根</span>
            <div class="demo-col-blocks">
              ${Array(carryOnes).fill(0).map(() => renderStickSingle('wood')).join('')}
            </div>
          </div>
        </div>
        <div class="demo-tip-card">
          💡 <strong>满十进一</strong>：个位的 10 根扎成 1 捆直接进到了十位！个位只剩下 <strong>${carryOnes}</strong> 根。
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(2)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(4)">下一步：算出得数 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="exitLevel3Demo()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 4) {
    setPrompt(`步骤 4：十位结算，得出答案 ${finalResult}`, `十位共 ${finalTens} 捆，个位剩下 ${carryOnes} 根，最终结果是 ${finalResult}！`);

    visualArea.innerHTML = `
      <div class="level3-demo-card">
        ${stepPillsHtml}
        <div class="demo-stage" style="flex-direction:column;align-items:center;padding:12px;">
          <div class="demo-result-formula">${a} + ${b} = ${finalResult}</div>
          <div class="demo-summary-box">
            <div>🔹 <strong>个位计算</strong>：${aOnes} 根 + ${bOnes} 根 = ${sumOnes} 根 ➜ 满十进一，个位留下 <strong>${carryOnes} 根</strong></div>
            <div>🔹 <strong>十位计算</strong>：${aTens} 捆 + ${bTens} 捆 + 进位 1 捆 ➜ <strong>${finalTens} 捆 (${finalTens * 10} 根)</strong></div>
            <div style="margin-top:6px;color:#16A34A;font-weight:900;font-size:16px;">🎉 最终答案：${finalTens}捆又${carryOnes}根 = ${finalResult}</div>
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
