/**
 * 数学启蒙 · 乘除法启蒙 JS (九九乘法表 + 直观坐标点阵 + 极简降噪版)
 * 1. 📜 乘法表：1~9 分阶数字点读，字号大，带发音与连读
 * 2. ✖️ 点阵图：直接标明行数与列数坐标
 * 3. ⚖️ 平均分：规整紧凑均分盘
 * 4. 🍎 余数除法：自适应防溢出独立余数盘
 */

(function () {
  'use strict';

  let currentMode = 'table'; // 'table' | 'matrix' | 'share' | 'remainder'
  let currentTableNum = 1; // 1 ~ 9 (乘法表默认数字)
  let currentQuestion = null;
  let isAnswerLocked = false;
  let isSpeakingAll = false;

  const tabs = document.querySelectorAll('.segmented-item');
  const multModeBadge = document.getElementById('multModeBadge');
  const questionIcon = document.getElementById('questionIcon');
  const questionText = document.getElementById('questionText');
  const questionSpeaker = document.getElementById('questionSpeaker');
  const multStage = document.getElementById('multStage');
  const multOptions = document.getElementById('multOptions');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackEmoji = document.getElementById('feedbackEmoji');
  const feedbackText = document.getElementById('feedbackText');

  const CHINESE_NUMS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  function init() {
    bindModeTabs();
    bindSpeakerEvent();
    loadNewQuestion();
  }

  function bindModeTabs() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (isAnswerLocked) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.getAttribute('data-mode');

        const modeNames = {
          table: '九九乘法表',
          matrix: '乘法点阵图',
          share: '平均分',
          remainder: '有余数除法'
        };
        if (multModeBadge) multModeBadge.textContent = modeNames[currentMode] || '乘除法启蒙';

        loadNewQuestion();
      });
    });
  }

  function bindSpeakerEvent() {
    if (questionSpeaker) {
      questionSpeaker.addEventListener('click', () => {
        if (currentMode === 'table') {
          playSpeech(`${currentTableNum}的乘法口诀。点击每个口诀的小喇叭可以单独听发音哦！`);
        } else if (currentQuestion && currentQuestion.audioText) {
          playSpeech(currentQuestion.audioText);
        }
      });
    }
  }

  function loadNewQuestion() {
    isAnswerLocked = false;
    isSpeakingAll = false;
    multStage.innerHTML = '';
    multOptions.innerHTML = '';

    if (currentMode === 'table') {
      renderTableStage(currentTableNum);
      if (questionIcon) questionIcon.textContent = '📜';
      if (questionText) questionText.innerHTML = `点击数字切换口诀，点小喇叭听发音背诵！`;
      return;
    }

    if (currentMode === 'matrix') {
      currentQuestion = generateMatrixQuestion();
      renderMatrixStage(currentQuestion);
    } else if (currentMode === 'share') {
      currentQuestion = generateShareQuestion();
      renderShareStage(currentQuestion);
    } else if (currentMode === 'remainder') {
      currentQuestion = generateRemainderQuestion();
      renderRemainderStage(currentQuestion);
    }

    if (questionIcon) questionIcon.textContent = currentQuestion.icon || '✖️';
    if (questionText) questionText.innerHTML = currentQuestion.questionHtml;
    if (currentQuestion && currentQuestion.audioText) {
      playSpeech(currentQuestion.audioText);
    }

    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // ================= 0. 📜 九九乘法表 (1~9分阶数字点读) =================
  function getRhymeChant(a, b) {
    const x = Math.min(a, b);
    const y = Math.max(a, b);
    const prod = x * y;
    const cnX = CHINESE_NUMS[x];
    const cnY = CHINESE_NUMS[y];
    if (prod < 10) {
      return `${cnX}${cnY}得${CHINESE_NUMS[prod]}`;
    } else if (prod === 10) {
      return `${cnX}${cnY}一十`;
    } else {
      const tens = Math.floor(prod / 10);
      const ones = prod % 10;
      if (tens === 1) {
        return `${cnX}${cnY}十${ones > 0 ? CHINESE_NUMS[ones] : ''}`;
      } else {
        return `${cnX}${cnY}${CHINESE_NUMS[tens]}十${ones > 0 ? CHINESE_NUMS[ones] : ''}`;
      }
    }
  }

  function renderTableStage(selectedNum) {
    multStage.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'table-board-wrapper';

    // 1~9 数字选择器
    const selectorRow = document.createElement('div');
    selectorRow.className = 'table-num-selector';

    for (let n = 1; n <= 9; n++) {
      const pill = document.createElement('button');
      pill.className = `table-num-pill ${n === selectedNum ? 'active' : ''}`;
      pill.textContent = n;
      pill.title = `${n}的乘法口诀`;
      pill.addEventListener('click', () => {
        currentTableNum = n;
        renderTableStage(n);
      });
      selectorRow.appendChild(pill);
    }
    wrapper.appendChild(selectorRow);

    // 口诀卡片列表
    const rhymesList = document.createElement('div');
    rhymesList.className = 'table-rhymes-container';

    for (let i = 1; i <= 9; i++) {
      const chant = getRhymeChant(i, selectedNum);
      const formula = `${i} × ${selectedNum} = ${i * selectedNum}`;

      const card = document.createElement('div');
      card.className = 'rhyme-card';
      card.innerHTML = `
        <span class="rhyme-formula">${formula}</span>
        <span class="rhyme-chant">${chant}</span>
        <button class="rhyme-speaker-btn" aria-label="朗读${chant}" title="朗读">🔊</button>
      `;

      const speakBtn = card.querySelector('.rhyme-speaker-btn');
      speakBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playSpeech(`${chant}，${i}乘${selectedNum}等于${i * selectedNum}`);
      });

      card.addEventListener('click', () => {
        playSpeech(`${chant}，${i}乘${selectedNum}等于${i * selectedNum}`);
      });

      rhymesList.appendChild(card);
    }
    wrapper.appendChild(rhymesList);

    multStage.appendChild(wrapper);

    // 渲染底部操作栏
    renderTableActionBar(selectedNum);
  }

  function renderTableActionBar(num) {
    multOptions.innerHTML = '';
    const bar = document.createElement('div');
    bar.className = 'table-action-bar';

    const btnReadAll = document.createElement('button');
    btnReadAll.className = 'table-action-btn btn-read-all';
    btnReadAll.innerHTML = `<span>▶️ 连续跟读 ${num} 的口诀</span>`;
    btnReadAll.addEventListener('click', () => readAllRhymes(num));

    const btnPractice = document.createElement('button');
    btnPractice.className = 'table-action-btn btn-go-practice';
    btnPractice.innerHTML = `<span>🎯 去做点阵练习 ➜</span>`;
    btnPractice.addEventListener('click', () => {
      // 切换到点阵模式
      tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-mode') === 'matrix'));
      currentMode = 'matrix';
      if (multModeBadge) multModeBadge.textContent = '乘法点阵图';
      loadNewQuestion();
    });

    bar.appendChild(btnReadAll);
    bar.appendChild(btnPractice);
    multOptions.appendChild(bar);
  }

  // 连续跟读整篇口诀
  function readAllRhymes(num) {
    if (isSpeakingAll) return;
    isSpeakingAll = true;
    let list = [];
    for (let i = 1; i <= 9; i++) {
      list.push(getRhymeChant(i, num));
    }
    const fullText = `${num}的乘法口诀：` + list.join('，') + '。';
    playSpeech(fullText);
    setTimeout(() => { isSpeakingAll = false; }, 8000);
  }

  // ================= 1. 乘法点阵矩阵 (直接标出行与列) =================
  function generateMatrixQuestion() {
    const rows = 2 + Math.floor(Math.random() * 3); // 2 ~ 4 行
    const cols = 2 + Math.floor(Math.random() * 4); // 2 ~ 5 列
    const icons = ['⭐', '🍓', '🏀', '🎈', '🍬', '🍎'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const total = rows * cols;

    return {
      rows, cols, total, icon,
      questionHtml: `图中是 <span class="hl-num">${rows}</span> 行、每行 <span class="hl-num">${cols}</span> 列，一共有多少个？`,
      audioText: `图中一共有${rows}行，每行有${cols}列，算一算一共有多少个呢？`,
      answer: total,
      options: generateOptions(total, 4)
    };
  }

  function renderMatrixStage(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'matrix-board-wrapper';

    // 表格：cols + 1 列，rows + 1 行
    const table = document.createElement('div');
    table.className = 'matrix-grid-table';
    table.style.gridTemplateColumns = `auto repeat(${q.cols}, 1fr)`;

    // 顶行：左上角原点 + 列标 (1列, 2列, 3列...)
    const origin = document.createElement('div');
    origin.className = 'grid-origin-corner';
    table.appendChild(origin);

    for (let c = 1; c <= q.cols; c++) {
      const colBadge = document.createElement('div');
      colBadge.className = 'col-header-badge';
      colBadge.textContent = `${c}列`;
      table.appendChild(colBadge);
    }

    // 后续行：行标 (1行, 2行...) + 点阵单元格
    for (let r = 1; r <= q.rows; r++) {
      const rowBadge = document.createElement('div');
      rowBadge.className = 'row-header-badge';
      rowBadge.textContent = `${r}行`;
      table.appendChild(rowBadge);

      for (let c = 1; c <= q.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.textContent = q.icon;
        table.appendChild(cell);
      }
    }

    wrapper.appendChild(table);

    // 底部公式小结
    const summary = document.createElement('div');
    summary.className = 'matrix-summary-pill';
    summary.innerHTML = `<span>💡 ${q.rows} 行 × 每行 ${q.cols} 列 = ${q.total} 个</span>`;
    wrapper.appendChild(summary);

    multStage.appendChild(wrapper);
  }

  // ================= 2. 平均分 (规整紧凑) =================
  function generateShareQuestion() {
    const groups = 2 + Math.floor(Math.random() * 2); // 2 ~ 3 组
    const perGroup = 2 + Math.floor(Math.random() * 3); // 2 ~ 4 个
    const total = groups * perGroup;
    const icons = ['🦴', '🐟', '🥕', '🍪'];
    const avatars = ['🐶', '🐱', '🐰', '🐻'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    return {
      groups, perGroup, total, icon, avatar,
      questionHtml: `<span class="hl-num">${total}</span> 个物品平均分给 <span class="hl-num">${groups}</span> 只小动物，每只分到几个？`,
      audioText: `有${total}个物品，平均分给${groups}只小动物，请问每只小动物分到几个呢？`,
      answer: perGroup,
      options: generateOptions(perGroup, 4)
    };
  }

  function renderShareStage(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'share-board-wrapper';

    const groupsRow = document.createElement('div');
    groupsRow.className = 'share-groups-row';

    for (let g = 1; g <= q.groups; g++) {
      const plate = document.createElement('div');
      plate.className = 'share-plate';
      plate.innerHTML = `
        <div class="share-plate-avatar">${q.avatar}</div>
        <div class="share-plate-name">第${g}份</div>
        <div class="share-plate-items">
          ${Array(q.perGroup).fill(0).map(() => `<span>${q.icon}</span>`).join('')}
        </div>
      `;
      groupsRow.appendChild(plate);
    }

    wrapper.appendChild(groupsRow);

    const summary = document.createElement('div');
    summary.className = 'matrix-summary-pill';
    summary.innerHTML = `<span>💡 ${q.total} ÷ ${q.groups} = 每只 ${q.perGroup} 个</span>`;
    wrapper.appendChild(summary);

    multStage.appendChild(wrapper);
  }

  // ================= 3. 余数挑战 (自适应独立余数盘，杜绝溢出) =================
  function generateRemainderQuestion() {
    const groups = 3;
    const perGroup = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const remainder = 1 + Math.floor(Math.random() * 2); // 1 or 2
    const total = groups * perGroup + remainder;
    const icons = ['🍎', '🍓', '🥕', '🍪'];
    const avatars = ['🐻', '🐰', '🐱'];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];

    return {
      groups, perGroup, remainder, total, icon, avatar,
      questionHtml: `<span class="hl-num">${total}</span> 个苹果平均分给 <span class="hl-num">${groups}</span> 只小熊，每只 <span class="hl-num">${perGroup}</span> 个，还剩下几个（余数）？`,
      audioText: `有${total}个苹果平均分给3只小熊，每只分${perGroup}个，请问还剩下几个不能均分的苹果呢？`,
      answer: remainder,
      options: [1, 2, 3, 4]
    };
  }

  function renderRemainderStage(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'share-board-wrapper';

    // 均分分组
    const groupsRow = document.createElement('div');
    groupsRow.className = 'share-groups-row';

    for (let g = 1; g <= q.groups; g++) {
      const plate = document.createElement('div');
      plate.className = 'share-plate';
      plate.innerHTML = `
        <div class="share-plate-avatar">${q.avatar}</div>
        <div class="share-plate-name">第${g}只熊 (${q.perGroup}个)</div>
        <div class="share-plate-items">
          ${Array(q.perGroup).fill(0).map(() => `<span>${q.icon}</span>`).join('')}
        </div>
      `;
      groupsRow.appendChild(plate);
    }

    wrapper.appendChild(groupsRow);

    // 独立余数盘 (自适应、整齐包裹)
    const remTray = document.createElement('div');
    remTray.className = 'remainder-tray';
    remTray.innerHTML = `
      <div class="remainder-tray-label">
        <span class="remainder-tray-badge">余数盘</span>
        <span>不够分1轮的剩下苹果:</span>
      </div>
      <div class="remainder-tray-items">
        ${Array(q.remainder).fill(0).map(() => `<span>${q.icon}</span>`).join('')}
      </div>
    `;
    wrapper.appendChild(remTray);

    // 算式引导
    const summary = document.createElement('div');
    summary.className = 'matrix-summary-pill';
    summary.innerHTML = `<span>💡 ${q.total} ÷ ${q.groups} = ${q.perGroup} 余数是多少？</span>`;
    wrapper.appendChild(summary);

    multStage.appendChild(wrapper);
  }

  // 辅助函数
  function generateOptions(answer, count) {
    if (typeof answer !== 'number') return [answer, '错', '对', '不确定'];
    const set = new Set([answer]);
    const deltas = [-3, -2, -1, 1, 2, 3, 4];
    while (set.size < count) {
      const delta = deltas[Math.floor(Math.random() * deltas.length)];
      const fake = answer + delta;
      if (fake > 0 && fake !== answer) set.add(fake);
      else set.add(answer + Math.floor(Math.random() * 4) + 1);
    }
    const arr = Array.from(set);
    return shuffle(arr);
  }

  function renderOptions(options, correctAnswer) {
    multOptions.innerHTML = '';
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

    if (String(selected) === String(correct)) {
      isAnswerLocked = true;
      btnEl.classList.add('correct');
      playSpeech('答对了！你真棒！');
      showFeedback('🎉', '算对啦！');

      setTimeout(() => {
        hideFeedback();
        loadNewQuestion();
      }, 1500);
    } else {
      btnEl.classList.add('wrong');
      playSpeech('看图仔细数一数试一试哦~');
      showFeedback('🤔', '看图数一数~');

      setTimeout(() => {
        hideFeedback();
        btnEl.classList.remove('wrong');
      }, 1100);
    }
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
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
    if (feedbackEmoji) feedbackEmoji.textContent = emoji;
    if (feedbackText) feedbackText.textContent = text;
    if (feedbackOverlay) feedbackOverlay.style.display = 'flex';
  }

  function hideFeedback() {
    if (feedbackOverlay) feedbackOverlay.style.display = 'none';
  }

  // 暴露给单元测试
  window.multiplicationApp = {
    generateMatrixQuestion,
    generateShareQuestion,
    generateRemainderQuestion,
    getRhymeChant
  };

  document.addEventListener('DOMContentLoaded', init);
})();
