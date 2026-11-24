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

  const tabs = document.querySelectorAll('.mode-tab');
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
        loadNewQuestion();
      });
    });
  }

  function bindSpeakerEvent() {
    if (questionSpeaker) {
      questionSpeaker.addEventListener('click', () => {
        if (currentMode === 'table') {
          if (currentTableNum === 'all') {
            playSpeech('九九乘法表阶梯全表，共45句口诀。点击任意格子听发音！');
          } else {
            playSpeech(`${currentTableNum}的乘法口诀。点击卡片可以单独听发音哦！`);
          }
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
      if (questionText) questionText.innerHTML = `点击数字切换口诀，点击卡片即可跟读`;
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

  // ================= 0. 📜 九九乘法表 (1~9分阶数字点读 + 45式阶梯全表) =================
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

  function getStairTableFormulas(num) {
    if (num === 'all') {
      const list = [];
      for (let r = 1; r <= 9; r++) {
        for (let c = 1; c <= r; c++) {
          list.push({ a: c, b: r, prod: c * r, formula: `${c} × ${r} = ${c * r}`, chant: getRhymeChant(c, r) });
        }
      }
      return list;
    }
    const n = parseInt(num, 10);
    const list = [];
    for (let c = 1; c <= n; c++) {
      list.push({ a: c, b: n, prod: c * n, formula: `${c} × ${n} = ${c * n}`, chant: getRhymeChant(c, n) });
    }
    return list;
  }

  function renderFullStairTable() {
    const scrollContainer = document.createElement('div');
    scrollContainer.className = 'stair-table-scroll-container';

    const stairTable = document.createElement('div');
    stairTable.className = 'stair-table-board';

    for (let r = 1; r <= 9; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'stair-row';

      for (let c = 1; c <= r; c++) {
        const prod = c * r;
        const chant = getRhymeChant(c, r);
        const cell = document.createElement('button');
        cell.className = 'stair-cell';
        cell.innerHTML = `
          <span class="stair-cell-formula">${c}×${r}=${prod}</span>
          <span class="stair-cell-chant">${chant}</span>
        `;
        cell.title = `点击朗读：${chant}`;
        cell.addEventListener('click', () => {
          playSpeech(`${chant}，${c}乘${r}等于${prod}`);
        });
        rowDiv.appendChild(cell);
      }
      stairTable.appendChild(rowDiv);
    }

    scrollContainer.appendChild(stairTable);
    return scrollContainer;
  }

  function renderTableStage(selectedNum) {
    multStage.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'table-board-wrapper';

    // 1~9 数字及全表选择器
    const selectorRow = document.createElement('div');
    selectorRow.className = 'table-num-selector';

    // 阶梯全表按钮
    const allPill = document.createElement('button');
    allPill.className = `table-num-pill table-all-pill ${selectedNum === 'all' ? 'active' : ''}`;
    allPill.textContent = '📐 全表';
    allPill.title = '九九乘法表阶梯全表 (45式)';
    allPill.addEventListener('click', () => {
      currentTableNum = 'all';
      renderTableStage('all');
    });
    selectorRow.appendChild(allPill);

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

    if (selectedNum === 'all') {
      wrapper.appendChild(renderFullStairTable());
    } else {
      // 分阶卡片列表 (选 1 只显示 1×1，选 2 显示 1×2与2×2 ... 选 n 显示 1~n 共 n 个)
      const rhymesList = document.createElement('div');
      rhymesList.className = 'table-rhymes-container';

      const formulas = getStairTableFormulas(selectedNum);
      if (formulas.length === 1) {
        rhymesList.classList.add('table-rhymes-container--single');
      }
      formulas.forEach(({ a, b, prod, formula, chant }) => {
        const card = document.createElement('div');
        card.className = 'rhyme-card';
        card.innerHTML = `
          <span class="rhyme-formula">${formula}</span>
          <span class="rhyme-right">
            <span class="rhyme-chant">${chant}</span>
            <button class="rhyme-speaker-btn" aria-label="朗读${chant}" title="朗读">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
          </span>
        `;

        const speakBtn = card.querySelector('.rhyme-speaker-btn');
        speakBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          playSpeech(`${chant}，${a}乘${b}等于${prod}`);
        });

        card.addEventListener('click', () => {
          playSpeech(`${chant}，${a}乘${b}等于${prod}`);
        });

        rhymesList.appendChild(card);
      });
      wrapper.appendChild(rhymesList);
    }

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
    if (num === 'all') {
      btnReadAll.innerHTML = `<span>▶️ 连续朗读九九乘法表</span>`;
    } else {
      btnReadAll.innerHTML = `<span>▶️ 连续跟读 ${num} 的口诀</span>`;
    }
    btnReadAll.addEventListener('click', () => readAllRhymes(num));

    const btnPractice = document.createElement('button');
    btnPractice.className = 'table-action-btn btn-go-practice';
    btnPractice.innerHTML = `<span>去做点阵练习 →</span>`;
    btnPractice.addEventListener('click', () => {
      // 切换到点阵模式
      tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-mode') === 'matrix'));
      currentMode = 'matrix';
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
    const formulas = getStairTableFormulas(num);
    const chants = formulas.map(f => f.chant);
    const prefix = num === 'all' ? '九九乘法表：' : `${num}的乘法口诀：`;
    const fullText = prefix + chants.join('，') + '。';
    playSpeech(fullText);
    const duration = Math.max(5000, chants.length * 800);
    setTimeout(() => { isSpeakingAll = false; }, duration);
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

    const grid = document.createElement('div');
    grid.className = 'matrix-grid';

    // 列标尺（纯浅灰辅助字，无底色边框）
    const colRow = document.createElement('div');
    colRow.className = 'matrix-col-row';

    const spacer = document.createElement('div');
    spacer.className = 'matrix-row-spacer';
    colRow.appendChild(spacer);

    const colTrack = document.createElement('div');
    colTrack.className = 'matrix-col-track';
    colTrack.style.gridTemplateColumns = `repeat(${q.cols}, var(--matrix-cell-size))`;
    for (let c = 1; c <= q.cols; c++) {
      const colLabel = document.createElement('span');
      colLabel.className = 'col-header-label';
      colLabel.textContent = `${c}列`;
      colTrack.appendChild(colLabel);
    }
    colRow.appendChild(colTrack);
    grid.appendChild(colRow);

    // 按行轻量分组：每行一条柔和浅底横带 + 干净点阵图标
    for (let r = 1; r <= q.rows; r++) {
      const rowBand = document.createElement('div');
      rowBand.className = 'matrix-row-band';

      const rowLabel = document.createElement('span');
      rowLabel.className = 'row-header-label';
      rowLabel.textContent = `${r}行`;
      rowBand.appendChild(rowLabel);

      const rowTrack = document.createElement('div');
      rowTrack.className = 'matrix-row-track';
      rowTrack.style.gridTemplateColumns = `repeat(${q.cols}, var(--matrix-cell-size))`;
      for (let c = 1; c <= q.cols; c++) {
        const cell = document.createElement('span');
        cell.className = 'matrix-cell';
        cell.textContent = q.icon;
        rowTrack.appendChild(cell);
      }
      rowBand.appendChild(rowTrack);
      grid.appendChild(rowBand);
    }

    wrapper.appendChild(grid);

    // 底部轻量算式（不剧透答案，答对后揭晓）
    const eq = document.createElement('div');
    eq.className = 'stage-equation';
    eq.innerHTML = `<span>${q.rows} × ${q.cols} =</span><span class="eq-blank" id="stageAnswerBlank">?</span>`;
    wrapper.appendChild(eq);

    multStage.appendChild(wrapper);
  }

  // ================= 2. 平均分 (规整轻量化) =================
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
        <div class="share-plate-items">
          ${Array(q.perGroup).fill(0).map(() => `<span>${q.icon}</span>`).join('')}
        </div>
        <div class="share-plate-name">第${g}份</div>
      `;
      groupsRow.appendChild(plate);
    }

    wrapper.appendChild(groupsRow);

    // 底部轻量算式（不剧透答案，答对后揭晓）
    const eq = document.createElement('div');
    eq.className = 'stage-equation';
    eq.innerHTML = `<span>${q.total} ÷ ${q.groups} =</span><span class="eq-blank" id="stageAnswerBlank">?</span>`;
    wrapper.appendChild(eq);

    multStage.appendChild(wrapper);
  }

  // ================= 3. 余数挑战 (主次分明：分完退后，余数聚焦) =================
  function generateRemainderQuestion() {
    const groups = 3;
    const perGroup = 2 + Math.floor(Math.random() * 2); // 2 or 3
    const remainder = 1 + Math.floor(Math.random() * 2); // 1 or 2
    const total = groups * perGroup + remainder;
    const itemPool = [
      { icon: '🍎', name: '苹果' },
      { icon: '🍓', name: '草莓' },
      { icon: '🥕', name: '胡萝卜' },
      { icon: '🍪', name: '饼干' }
    ];
    const animalPool = [
      { avatar: '🐻', name: '小熊' },
      { avatar: '🐰', name: '小兔' },
      { avatar: '🐱', name: '小猫' }
    ];
    const item = itemPool[Math.floor(Math.random() * itemPool.length)];
    const animal = animalPool[Math.floor(Math.random() * animalPool.length)];

    return {
      groups, perGroup, remainder, total,
      icon: item.icon,
      itemName: item.name,
      avatar: animal.avatar,
      animalName: animal.name,
      questionHtml: `<span class="hl-num">${total}</span> 个${item.name}平均分给 <span class="hl-num">${groups}</span> 只${animal.name}，每只 <span class="hl-num">${perGroup}</span> 个，还剩几个？`,
      audioText: `有${total}个${item.name}平均分给${groups}只${animal.name}，每只分${perGroup}个，请问还剩下几个呢？`,
      answer: remainder,
      options: [1, 2, 3, 4]
    };
  }

  function renderRemainderStage(q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'share-board-wrapper';

    // 已分完分组（视觉退后，衬托余数主体）
    const groupsRow = document.createElement('div');
    groupsRow.className = 'share-groups-row';

    for (let g = 1; g <= q.groups; g++) {
      const plate = document.createElement('div');
      plate.className = 'share-plate share-plate--muted';
      plate.innerHTML = `
        <div class="share-plate-avatar">${q.avatar}</div>
        <div class="share-plate-items">
          ${Array(q.perGroup).fill(0).map(() => `<span>${q.icon}</span>`).join('')}
        </div>
        <div class="share-plate-name">第${g}只</div>
      `;
      groupsRow.appendChild(plate);
    }

    wrapper.appendChild(groupsRow);

    // 余数聚焦区（柔和单焦点，去厚红虚线与大红实心胶囊）
    const remTray = document.createElement('div');
    remTray.className = 'remainder-tray';
    remTray.innerHTML = `
      <span class="remainder-tray-label">剩下（余数）</span>
      <div class="remainder-tray-items">
        ${Array(q.remainder).fill(0).map(() => `<span>${q.icon}</span>`).join('')}
      </div>
    `;
    wrapper.appendChild(remTray);

    // 轻量算式
    const eq = document.createElement('div');
    eq.className = 'stage-equation';
    eq.innerHTML = `<span>${q.total} ÷ ${q.groups} = ${q.perGroup} ……</span><span class="eq-blank" id="stageAnswerBlank">?</span>`;
    wrapper.appendChild(eq);

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
      const answerBlank = document.getElementById('stageAnswerBlank');
      if (answerBlank) {
        answerBlank.textContent = correct;
        answerBlank.classList.add('revealed');
      }
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
    getRhymeChant,
    getStairTableFormulas
  };

  document.addEventListener('DOMContentLoaded', init);
})();
