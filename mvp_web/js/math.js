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

function showStartScreen() {
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
  const a = Math.floor(Math.random() * 3) + 8;
  const b = Math.floor(Math.random() * (20 - a - 1)) + 2;
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

function renderTenPack() {
  return `<div class="ten-pack-block">📦 10</div>`;
}

let demoStep = 1;
let demoAutoPlayTimer = null;

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
  clearTimeout(demoAutoPlayTimer);
  const { total, subtract } = state.question;
  setPrompt(`${getQuestionPrefix()}：${total} - ${subtract} = ?`, `${getQuestionPrefix()}，${total}减${subtract}等于多少？`);
  updateRodsDisplay();
  showAnswerOptions('showLevel3Demo');
}

function updateRodsDisplay() {
  visualArea.innerHTML = `
    <div class="level3-demo-container">
      <div class="place-column tens-col">
        <div class="column-title">📦 十位 (${state.bundles} 盒 = ${state.bundles * 10})</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
          ${Array(state.bundles).fill(0).map(() => renderTenPack()).join('')}
        </div>
      </div>
      <div class="place-column ones-col">
        <div class="column-title">🍬 个位 (${state.singles} 块)</div>
        <div class="singles-flex-container">
          ${Array(state.singles).fill(0).map(() => '<div class="single-dot-block"></div>').join('')}
        </div>
      </div>
    </div>
  `;
}

function showLevel3Demo() {
  demoStep = 1;
  clearTimeout(demoAutoPlayTimer);
  renderLevel3DemoStep(1);
}

function renderLevel3DemoStep(step) {
  demoStep = step;
  clearTimeout(demoAutoPlayTimer);

  const { total, subtract, tens, ones } = state.question;
  const subTens = Math.floor(subtract / 10);
  const subOnes = subtract % 10;
  const tensLeftAfterBorrow = tens - 1;
  const remainInBorrow = 10 - subOnes;
  const finalOnes = remainInBorrow + ones;
  const finalTens = tensLeftAfterBorrow - subTens;
  const finalResult = total - subtract;

  if (step === 1) {
    setPrompt(
      `${getQuestionPrefix()} 演示：${total} - ${subtract}`,
      `个位只有 ${ones} 块，减不去 ${subOnes} 块，不够减！需要从十位借 1 个 10 到个位！`
    );

    visualArea.innerHTML = `
      <div class="demo-step-indicator">
        <span class="step-chip active">1. 观察原数</span>
        <span class="step-chip">2. 借10到个位</span>
        <span class="step-chip">3. 个位破十减${subOnes}</span>
        <span class="step-chip">4. 十位扣减与总结</span>
      </div>
      <div class="level3-demo-container">
        <div class="place-column tens-col">
          <div class="column-title">📦 十位 (${tens}包 = ${tens * 10})</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
            ${Array(tens).fill(0).map(() => renderTenPack()).join('')}
          </div>
        </div>
        <div class="place-column ones-col">
          <div class="column-title">🍬 个位 (${ones}块)</div>
          <div class="singles-flex-container">
            ${Array(ones).fill(0).map(() => '<div class="single-dot-block"></div>').join('')}
          </div>
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(2)">下一步：借10到个位 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="renderLevel3Subtraction()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 2) {
    setPrompt(
      `步骤 2：从十位借 1 个 10 放到个位！`,
      `从十位借 1 个整十包送到个位并拆开！十位还剩 ${tensLeftAfterBorrow} 包，个位里面多出 1 个拆开的 10 格盒！`
    );

    visualArea.innerHTML = `
      <div class="demo-step-indicator">
        <span class="step-chip">1. 观察原数</span>
        <span class="step-chip active">2. 借10到个位</span>
        <span class="step-chip">3. 个位破十减${subOnes}</span>
        <span class="step-chip">4. 十位扣减与总结</span>
      </div>
      <div class="level3-demo-container">
        <div class="place-column tens-col">
          <div class="column-title">📦 十位 (剩 ${tensLeftAfterBorrow} 包 = ${tensLeftAfterBorrow * 10})</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
            ${Array(tensLeftAfterBorrow).fill(0).map(() => renderTenPack()).join('')}
          </div>
        </div>
        <div class="place-column ones-col" style="border-color:#F8E8C8;background:#FAF5EA;">
          <div class="column-title">🍬 个位 (拆开的10盒 + 原有${ones}块)</div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div style="font-size:12px;font-weight:700;color:#D97706;">⭐ 借来并拆开的 10 格盒：</div>
            ${renderTenFrame(10, 'borrow')}
            <div style="font-size:12px;font-weight:700;color:#059669;margin-top:4px;">🍬 原有的 ${ones} 块：</div>
            <div class="singles-flex-container">
              ${Array(ones).fill(0).map(() => '<div class="single-dot-block"></div>').join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(3)">下一步：个位破十减${subOnes} ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="renderLevel3Subtraction()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 3) {
    setPrompt(
      `步骤 3：在个位从借来的 10 里面减去 ${subOnes}！`,
      `在借来的 10 格盒里划掉 ${subOnes} 格，还剩下 ${remainInBorrow} 格！加上原本的 ${ones} 块，个位一共是 ${finalOnes} 块。`
    );

    visualArea.innerHTML = `
      <div class="demo-step-indicator">
        <span class="step-chip">1. 观察原数</span>
        <span class="step-chip">2. 借10到个位</span>
        <span class="step-chip active">3. 个位破十减${subOnes}</span>
        <span class="step-chip">4. 十位扣减与总结</span>
      </div>
      <div class="level3-demo-container">
        <div class="place-column tens-col">
          <div class="column-title">📦 十位 (剩 ${tensLeftAfterBorrow} 包)</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
            ${Array(tensLeftAfterBorrow).fill(0).map(() => renderTenPack()).join('')}
          </div>
        </div>
        <div class="place-column ones-col" style="border-color:#F8E8C8;background:#FAF5EA;">
          <div class="column-title">🍬 个位 (破十剩${remainInBorrow} + 原有${ones} = ${finalOnes})</div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div style="font-size:12px;font-weight:700;color:#D97706;">⭐ 划掉 ${subOnes} 格，剩 ${remainInBorrow} 格：</div>
            ${renderTenFrame(10, 'borrow', subOnes)}
            <div style="font-size:12px;font-weight:700;color:#059669;margin-top:4px;">🍬 原有的 ${ones} 块：</div>
            <div class="singles-flex-container">
              ${Array(ones).fill(0).map(() => '<div class="single-dot-block"></div>').join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(2)">◀️ 上一步</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3DemoStep(4)">下一步：十位扣减与总结 ⏭️</button>
        <button class="btn-ghost btn-sm" onclick="renderLevel3Subtraction()">❌ 退出演示</button>
      </div>
    `;
  } else if (step === 4) {
    setPrompt(
      `步骤 4：算出最终答案 ${finalResult}`,
      `个位得 ${finalOnes}！十位剩 ${tensLeftAfterBorrow} 盒减去 ${subTens} 盒得 ${finalTens} 盒！最终答案是 ${finalResult}！`
    );

    visualArea.innerHTML = `
      <div class="demo-step-indicator">
        <span class="step-chip">1. 观察原数</span>
        <span class="step-chip">2. 借10到个位</span>
        <span class="step-chip">3. 个位破十减${subOnes}</span>
        <span class="step-chip active">4. 总结答案</span>
      </div>
      <div class="level3-demo-container" style="flex-direction:column;align-items:center;">
        <div class="result-display" style="font-size:64px;margin:10px 0;color:var(--blue);">
          ${total} - ${subtract} = ${finalResult}
        </div>
        <div style="font-size:18px;line-height:1.6;color:var(--text);background:var(--white);padding:16px 24px;border-radius:var(--radius-lg);border:2px solid var(--gray-100);max-width:520px;text-align:left;width:100%;">
          <div>🔹 <strong>个位计算 (破十法)</strong>：借10 - ${subOnes} = ${remainInBorrow}，加上原有 ${ones} 块 ➜ <strong>${finalOnes}</strong></div>
          <div>🔹 <strong>十位计算</strong>：(借后剩 ${tensLeftAfterBorrow} 盒) - ${subTens} 盒 ➜ <strong>${finalTens} 盒 (${finalTens * 10})</strong></div>
          <div style="margin-top:8px;color:var(--green);font-weight:bold;font-size:20px;">💡 最终结果：${finalTens}个十 + ${finalOnes}个一 = ${finalResult}</div>
        </div>
      </div>
    `;

    controlArea.innerHTML = `
      <div class="demo-control-bar">
        <button class="btn btn-blue btn-sm" onclick="renderLevel3DemoStep(1)">🔄 重新演示</button>
        <button class="btn btn-green btn-lg" onclick="renderLevel3Subtraction()">✅ 我学会了，去答题</button>
      </div>
    `;
  }
}

showStartScreen();
