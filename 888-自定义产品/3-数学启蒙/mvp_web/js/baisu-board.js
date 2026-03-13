/* ============================================
   百数板 · 核心逻辑 V3
   双层架构：自由探索 + 开始练习
   ============================================ */

;(function () {
  'use strict';

  // ========== 状态 ==========
  const state = {
    mode: 'order',
    practicing: false,
    stars: 0,
    rangeStart: 1,       // 当前分段起始：1/21/41/61/81
    // 认数字练习
    orderTarget: null,
    orderScore: 0,
    orderTotal: 5,
    orderWrongCount: 0,
    // 填空模式
    blanks: [],
    // 跳数模式
    skipStep: 2,
    skipForward: true,
    skipQuizAnswer: null,
    skipQuizIndex: 0,
    // 拆一拆练习
    placeTarget: null,
    placeScore: 0,
    placeTotal: 5,
    // 拖拽
    dragBubble: null,
  };

  // ========== DOM引用 ==========
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const grid = $('#boardGrid');
  const boardWrapper = $('#boardWrapper');
  const orderQuiz = $('#orderQuiz');
  const orderOptions = $('#orderOptions');
  const orderHint = $('#orderHint');
  const orderSpeaker = $('#orderSpeaker');
  const orderProgress = $('#orderProgress');
  const rangeTabs = $('#rangeTabs');
  const bubbleZone = $('#bubbleZone');
  const skipControls = $('#skipControls');
  const skipQuiz = $('#skipQuiz');
  const skipQuizHint = $('#skipQuizHint');
  const skipQuizOptions = $('#skipQuizOptions');
  const placeValueCard = $('#placeValueCard');
  const bottomActions = $('#bottomActions');
  const actionBtn = $('#actionBtn');
  const questionBar = $('#questionBar');
  const questionIcon = $('#questionIcon');
  const questionText = $('#questionText');
  const feedbackOverlay = $('#feedbackOverlay');
  const feedbackEmoji = $('#feedbackEmoji');
  const feedbackText = $('#feedbackText');
  const starCountEl = $('#starCount');

  // ========== TTS语音 ==========
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  }

  // ========== 反馈系统 ==========
  const correctFeedbacks = [
    { emoji: '✨', text: '你真棒！' },
    { emoji: '🌈', text: '太好啦！' },
    { emoji: '🦊', text: '哇哦！' },
    { emoji: '🌸', text: '厉害！' },
    { emoji: '⭐', text: '真聪明！' },
  ];

  const encourageFeedbacks = [
    { emoji: '🤔', text: '再试试看？' },
    { emoji: '💪', text: '差不多啦！' },
    { emoji: '👆', text: '换一个试试～' },
  ];

  let correctStreak = 0;

  function showFeedback(isCorrect) {
    const list = isCorrect ? correctFeedbacks : encourageFeedbacks;
    const fb = list[Math.floor(Math.random() * list.length)];

    feedbackEmoji.textContent = fb.emoji;
    feedbackText.textContent = fb.text;
    feedbackText.style.color = isCorrect ? 'var(--green-dark)' : 'var(--yellow-dark)';
    feedbackOverlay.style.display = 'flex';

    speak(fb.text);

    if (isCorrect) {
      correctStreak++;
      // addStar() 已经被移除因为页面上去掉了星星组件
      if (correctStreak >= 3) {
        correctStreak = 0;
        setTimeout(() => showCelebration(), 600);
      }
    } else {
      correctStreak = 0;
    }

    setTimeout(() => {
      feedbackOverlay.style.display = 'none';
    }, 1200);
  }

  // addStar function removed

  function showQuestion(icon, text) {
    questionIcon.textContent = icon;
    questionText.textContent = text;
    questionBar.style.display = 'flex';
  }

  function hideQuestion() {
    questionBar.style.display = 'none';
  }

  // ========== 庆祝动画 ==========
  function showCelebration() {
    const container = $('#confettiContainer');
    const colors = ['#58CC02', '#1CB0F6', '#FF4B4B', '#FFC800', '#CE82FF', '#FF9600'];

    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.width = (8 + Math.random() * 8) + 'px';
      piece.style.height = (8 + Math.random() * 8) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }

    speak('太棒了！你真厉害！');
    setTimeout(() => { container.innerHTML = ''; }, 4000);
  }

  // ========== 分段范围工具 ==========
  function rangeEnd() { return state.rangeStart + 19; }

  function getCellByNum(num) {
    return grid.querySelector('[data-num="' + num + '"]');
  }

  // ========== 生成百数板（当前分段20格） ==========
  function buildGrid() {
    grid.innerHTML = '';
    const start = state.rangeStart;
    const end = rangeEnd();
    for (let i = start; i <= end; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.num = i;
      cell.textContent = i;
      cell.addEventListener('click', () => onCellClick(i, cell));
      grid.appendChild(cell);
    }
  }

  // ========== 格子点击（统一入口） ==========
  function onCellClick(num, cell) {
    if (state.practicing) {
      // 练习模式下的点击
      switch (state.mode) {
        case 'place': onPlacePracticeClick(num, cell); break;
      }
    } else {
      // 探索模式下的点击
      onExploreClick(num, cell);
    }
  }

  // ====================================================
  //  探索模式：所有模式共用，点击格子的自由探索行为
  // ====================================================
  function onExploreClick(num, cell) {
    // 清除之前的高亮
    $$('.cell.tapped').forEach(c => c.classList.remove('tapped'));

    cell.classList.add('tapped');

    switch (state.mode) {
      case 'order':
        // 认数字探索：点击读出数字
        speak(String(num));
        break;

      case 'fill':
        // 填一填探索：点击读出数字
        speak(String(num));
        break;

      case 'skip':
        // 跳数探索：点击读出数字
        speak(String(num));
        break;

      case 'place':
        // 拆一拆探索：点击显示数位分解
        showPlaceValueExplore(num);
        break;
    }
  }

  // 拆一拆探索：显示数位分解卡片
  function showPlaceValueExplore(num) {
    const tens = Math.floor(num / 10);
    const ones = num % 10;

    $('#pvNumber').textContent = num;
    $('#pvTensDigit').textContent = tens;
    $('#pvOnesDigit').textContent = ones;

    const pvTens = $('#pvTens');
    pvTens.innerHTML = '';
    for (let i = 0; i < tens; i++) {
      const bundle = document.createElement('div');
      bundle.className = 'rod-bundle';
      bundle.textContent = '10';
      pvTens.appendChild(bundle);
    }

    const pvOnes = $('#pvOnes');
    pvOnes.innerHTML = '';
    for (let i = 0; i < ones; i++) {
      const rod = document.createElement('div');
      rod.className = 'rod-single';
      pvOnes.appendChild(rod);
    }

    placeValueCard.style.display = 'block';
    placeValueCard.classList.add('animate-bounce');
    setTimeout(() => placeValueCard.classList.remove('animate-bounce'), 500);

    speak(`${num}，${tens}个十，${ones}个一`);
  }

  // ====================================================
  //  进入探索模式（每个模式切换时调用）
  // ====================================================
  function enterExploreMode() {
    state.practicing = false;
    buildGrid();

    switch (state.mode) {
      case 'order':
        showQuestion('👆', '点一点数字，听听它怎么读');
        showBottomAction('🎯 开始练习', () => startOrderPractice());
        break;

      case 'fill':
        showQuestion('🧩', '点一点数字，认识百数板');
        showBottomAction('🎯 开始练习', () => startFillPractice());
        break;

      case 'skip':
        skipControls.style.display = 'flex';
        showSkipExplorePattern();
        showBottomAction('🎯 开始练习', () => startSkipPractice());
        break;

      case 'place':
        showQuestion('🪵', '点一个数字，看看它能拆成几个十和几个一');
        showBottomAction('🎯 开始练习', () => startPlacePractice());
        break;
    }
  }

  // ====================================================
  //  模式1：认数字 — 听音选数
  //  探索：点击读数字 | 练习：隐藏百数板，语音报数，4张大卡片选
  // ====================================================
  function startOrderPractice() {
    state.practicing = true;
    state.orderScore = 0;
    state.orderWrongCount = 0;

    // 隐藏百数板，显示选数卡片区
    boardWrapper.style.display = 'none';
    rangeTabs.style.display = 'none';
    orderQuiz.style.display = 'flex';
    bottomActions.style.display = 'none';

    // 点击喇叭重新播放
    orderSpeaker.onclick = () => {
      if (state.orderTarget !== null) speak(String(state.orderTarget));
    };

    nextOrderQuestion();
  }

  function nextOrderQuestion() {
    if (state.orderScore >= state.orderTotal) {
      orderQuiz.style.display = 'none';
      boardWrapper.style.display = '';
      rangeTabs.style.display = 'flex';
      showQuestion('🎉', '全部答对了！答对 ' + state.orderTotal + ' 个！');
      showCelebration();
      showBottomAction('🔄 再来一轮', () => startOrderPractice());
      return;
    }

    // 随机目标数字（当前分段内）
    const start = state.rangeStart;
    state.orderTarget = start + Math.floor(Math.random() * 20);
    state.orderWrongCount = 0;
    const target = state.orderTarget;

    // 生成3个干扰项（当前分段范围内）
    const options = [target];
    const rStart = state.rangeStart;
    const rEnd = rangeEnd();
    while (options.length < 4) {
      const offset = (Math.floor(Math.random() * 10) - 5) || 1;
      const fake = target + offset;
      if (fake >= rStart && fake <= rEnd && !options.includes(fake)) {
        options.push(fake);
      }
    }
    options.sort(() => Math.random() - 0.5);

    // 渲染卡片
    orderOptions.innerHTML = '';
    options.forEach((num, idx) => {
      const card = document.createElement('div');
      card.className = 'order-option';
      card.textContent = num;
      card.style.animationDelay = (idx * 0.05) + 's';
      card.addEventListener('click', () => onOrderCardClick(num, card));
      orderOptions.appendChild(card);
    });

    orderHint.textContent = '听一听，选出正确的数字';
    orderProgress.textContent = (state.orderScore + 1) + ' / ' + state.orderTotal;
    hideQuestion();

    // 播放语音
    speak(String(target));

    // 4秒没操作再读一遍
    clearTimeout(state._orderTimer);
    state._orderTimer = setTimeout(() => speak(String(target)), 4000);
  }

  function onOrderCardClick(num, card) {
    if (state.orderTarget === null) return;
    clearTimeout(state._orderTimer);

    if (num === state.orderTarget) {
      card.classList.add('order-correct');
      showFeedback(true);
      state.orderScore++;
      state.orderTarget = null;
      setTimeout(() => nextOrderQuestion(), 1400);
    } else {
      card.classList.add('order-wrong');
      showFeedback(false);
      state.orderWrongCount++;
      setTimeout(() => card.classList.remove('order-wrong'), 400);

      // 错2次：语音提示
      if (state.orderWrongCount === 2) {
        speak('再听一遍，' + state.orderTarget);
      }
      // 错3次：直接揭晓，高亮正确卡片
      if (state.orderWrongCount >= 3) {
        const cards = orderOptions.children;
        for (let i = 0; i < cards.length; i++) {
          if (parseInt(cards[i].textContent) === state.orderTarget) {
            cards[i].classList.add('order-correct');
          }
        }
        speak('是 ' + state.orderTarget);
        state.orderTarget = null;
        state.orderScore++; // 零挫败感，不扣分
        setTimeout(() => nextOrderQuestion(), 2000);
      }
    }
  }

  // ====================================================
  //  模式2：缺数填空
  //  探索：点击读数字 | 练习：拖拽填空
  // ====================================================
  function startFillPractice() {
    state.practicing = true;
    hideQuestion();

    const start = state.rangeStart;
    const end = rangeEnd();
    const count = 3 + Math.floor(Math.random() * 3); // 3-5个空缺（20格里）
    const positions = [];
    while (positions.length < count) {
      const p = start + Math.floor(Math.random() * 20);
      if (!positions.includes(p)) positions.push(p);
    }

    state.blanks = positions.map(p => ({ position: p, value: p, filled: false }));

    const cells = grid.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const num = parseInt(cell.dataset.num);
      const blank = state.blanks.find(b => b.position === num);
      if (blank) {
        cell.textContent = '?';
        cell.classList.add('blank');
        cell.dataset.blank = num;
      } else {
        cell.textContent = num;
        cell.classList.remove('blank', 'filled');
        delete cell.dataset.blank;
      }
    }

    const shuffled = [...state.blanks].sort(() => Math.random() - 0.5);
    bubbleZone.innerHTML = '';
    shuffled.forEach((b, idx) => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = b.value;
      bubble.dataset.value = b.value;
      bubble.style.animationDelay = (idx * 0.08) + 's';
      setupDrag(bubble);
      bubbleZone.appendChild(bubble);
    });

    bubbleZone.style.display = 'flex';
    bottomActions.style.display = 'none';
    showQuestion('🧩', '把数字拖到正确的位置吧！');
    speak('把数字拖到正确的位置吧');
  }

  function checkFillComplete() {
    if (state.blanks.every(b => b.filled)) {
      showQuestion('🎉', '全部填对了！');
      showBottomAction('🔄 再来一轮', () => startFillPractice());
      showCelebration();
    }
  }

  // ========== 拖拽系统 ==========
  function setupDrag(bubble) {
    bubble.addEventListener('touchstart', onDragStart, { passive: false });
    bubble.addEventListener('mousedown', onDragStart);
  }

  function onDragStart(e) {
    e.preventDefault();
    const bubble = e.currentTarget;
    if (bubble.classList.contains('matched')) return;

    state.dragBubble = bubble;
    const touch = e.touches ? e.touches[0] : e;
    
    // 如果存在外层 backdrop-filter 或 transform，会导致 fixed 定位偏移，因此拖拽时将其移至 body
    document.body.appendChild(bubble);
    
    bubble.classList.add('dragging');
    moveBubble(touch.clientX, touch.clientY);

    if (e.touches) {
      document.addEventListener('touchmove', onDragMove, { passive: false });
      document.addEventListener('touchend', onDragEnd);
    } else {
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }
  }

  function onDragMove(e) {
    e.preventDefault();
    if (!state.dragBubble) return;
    const touch = e.touches ? e.touches[0] : e;
    moveBubble(touch.clientX, touch.clientY);
  }

  function moveBubble(x, y) {
    const bubble = state.dragBubble;
    if (!bubble) return;
    
    // 动态获取气泡当前宽高的一半，保证鼠标/手指可以绝对居中于卡片上
    const halfWidth = bubble.offsetWidth / 2;
    const halfHeight = bubble.offsetHeight / 2;

    bubble.style.position = 'fixed';
    bubble.style.left = (x - halfWidth) + 'px';
    bubble.style.top = (y - halfHeight) + 'px';
    bubble.style.zIndex = '50';
  }

  function onDragEnd(e) {
    const bubble = state.dragBubble;
    if (!bubble) return;

    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const value = parseInt(bubble.dataset.value);

    let matched = false;
    $$('.cell.blank').forEach(cell => {
      const rect = cell.getBoundingClientRect();
      const cx = touch.clientX;
      const cy = touch.clientY;
      const tolerance = 80;
      if (
        cx >= rect.left - tolerance &&
        cx <= rect.right + tolerance &&
        cy >= rect.top - tolerance &&
        cy <= rect.bottom + tolerance
      ) {
        const blankNum = parseInt(cell.dataset.blank);
        if (blankNum === value) {
          cell.textContent = value;
          cell.classList.remove('blank');
          cell.classList.add('filled');
          delete cell.dataset.blank;

          const blankObj = state.blanks.find(b => b.position === value);
          if (blankObj) blankObj.filled = true;

          bubble.classList.add('matched');
          bubble.style.display = 'none';
          matched = true;
          showFeedback(true);
          checkFillComplete();
        }
      }
    });

    if (!matched && $$('.cell.blank').length > 0) {
      showFeedback(false);
      bubble.classList.add('animate-shake');
      setTimeout(() => bubble.classList.remove('animate-shake'), 400);
    }

    // 拖拽结束时放回原来的容器，保持 DOM 干净
    bubbleZone.appendChild(bubble);

    bubble.classList.remove('dragging');
    bubble.style.left = '';
    bubble.style.top = '';
    bubble.style.position = '';
    bubble.style.zIndex = '';
    state.dragBubble = null;

    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  }

  // ====================================================
  //  模式3：跳数
  //  探索：展示跳数规律高亮 | 练习：填空选择
  // ====================================================
  function showSkipExplorePattern() {
    // 清除之前状态
    $$('.cell').forEach(c => {
      c.classList.remove('skip-highlight', 'skip-animate', 'blank', 'filled');
      c.textContent = c.dataset.num;
    });
    skipQuiz.style.display = 'none';

    const step = state.skipStep;
    const start = state.rangeStart;
    const end = rangeEnd();
    // 全量序列
    const allNumbers = [];
    if (state.skipForward) {
      for (let i = step; i <= 100; i += step) allNumbers.push(i);
    } else {
      for (let i = 100; i >= step; i -= step) allNumbers.push(i);
    }
    // 只高亮当前分段内的
    const visible = allNumbers.filter(n => n >= start && n <= end);

    visible.forEach((num, idx) => {
      const cell = getCellByNum(num);
      if (cell) {
        setTimeout(() => {
          cell.classList.add('skip-highlight', 'skip-animate');
        }, idx * 120);
      }
    });

    const dirText = state.skipForward ? '顺数' : '倒数';
    showQuestion('👀', step + '个一数，' + dirText + ' — 看看规律');
    speak(step + '个一数，' + dirText);

    showBottomAction('🎯 开始练习', () => startSkipPractice());
  }

  function startSkipPractice() {
    state.practicing = true;
    state.skipQuizIndex = 0;
    bottomActions.style.display = 'none';
    nextSkipQuestion();
  }

  function nextSkipQuestion() {
    const step = state.skipStep;
    const start = state.rangeStart;
    const end = rangeEnd();
    // 全量序列
    const allNumbers = [];
    if (state.skipForward) {
      for (let i = step; i <= 100; i += step) allNumbers.push(i);
    } else {
      for (let i = 100; i >= step; i -= step) allNumbers.push(i);
    }
    // 当前分段内的序列
    const numbers = allNumbers.filter(n => n >= start && n <= end);

    if (state.skipQuizIndex >= 5 || numbers.length < 3) {
      skipQuiz.style.display = 'none';
      showQuestion('🎉', '跳数练习完成！');
      showCelebration();
      showBottomAction('🔄 回去看看', () => {
        state.practicing = false;
        showSkipExplorePattern();
      });
      return;
    }

    // 选一个位置挖空
    const availableIdx = [];
    for (let i = 1; i < numbers.length - 1; i++) availableIdx.push(i);
    const pickIdx = availableIdx[Math.floor(Math.random() * availableIdx.length)];
    const answer = numbers[pickIdx];
    state.skipQuizAnswer = answer;

    // 重置网格
    $$('.cell').forEach(c => {
      c.classList.remove('skip-highlight', 'skip-animate', 'blank', 'filled');
      c.textContent = c.dataset.num;
    });

    // 高亮序列，挖空一个
    numbers.forEach((num) => {
      const cell = getCellByNum(num);
      if (!cell) return;
      if (num === answer) {
        cell.textContent = '?';
        cell.classList.add('blank', 'skip-highlight');
      } else {
        cell.classList.add('skip-highlight');
      }
    });

    // 生成4个选项
    const options = [answer];
    while (options.length < 4) {
      const fake = answer + (Math.floor(Math.random() * 5) - 2) * step;
      if (fake > 0 && fake <= 100 && !options.includes(fake) && fake !== answer) {
        options.push(fake);
      } else {
        const r = 1 + Math.floor(Math.random() * 100);
        if (!options.includes(r)) options.push(r);
      }
    }
    options.sort(() => Math.random() - 0.5);

    skipQuizOptions.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('div');
      btn.className = 'skip-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => onSkipOptionClick(opt, btn));
      skipQuizOptions.appendChild(btn);
    });

    const prev = numbers[pickIdx - 1];
    const next = numbers[pickIdx + 1];
    skipQuizHint.textContent = prev + '，?，' + next + ' — 中间是几？';
    skipQuiz.style.display = 'block';
    showQuestion('🎯', step + '个一数，缺了哪个？');
    speak(prev + '，问号，' + next + '，中间是几？');
  }

  function onSkipOptionClick(value, btn) {
    if (value === state.skipQuizAnswer) {
      btn.classList.add('correct');
      const cell = getCellByNum(state.skipQuizAnswer);
      if (cell) {
        cell.textContent = state.skipQuizAnswer;
        cell.classList.remove('blank');
        cell.classList.add('filled');
      }
      showFeedback(true);
      state.skipQuizIndex++;
      setTimeout(() => nextSkipQuestion(), 1400);
    } else {
      btn.classList.add('wrong');
      showFeedback(false);
      setTimeout(() => btn.classList.remove('wrong'), 400);
    }
  }

  // ====================================================
  //  模式4：拆一拆
  //  探索：点击看分解 | 练习：看小棒找数字
  // ====================================================
  function startPlacePractice() {
    state.practicing = true;
    state.placeScore = 0;
    nextPlaceQuestion();
  }

  function nextPlaceQuestion() {
    if (state.placeScore >= state.placeTotal) {
      showQuestion('🎉', '全部答对了！答对了 ' + state.placeTotal + ' 个！');
      placeValueCard.style.display = 'none';
      showCelebration();
      showBottomAction('🔄 再来一轮', () => startPlacePractice());
      return;
    }

    // 清除之前的高亮
    $$('.cell.place-selected, .cell.hint-glow').forEach(c => {
      c.classList.remove('place-selected', 'hint-glow');
    });

    // 随机出题（当前分段内）
    const pStart = state.rangeStart;
    const pEnd = rangeEnd();
    state.placeTarget = pStart + Math.floor(Math.random() * 20);
    const num = state.placeTarget;
    const tens = Math.floor(num / 10);
    const ones = num % 10;

    // 显示小棒卡片（隐藏数字让孩子猜）
    $('#pvNumber').textContent = '?';
    $('#pvTensDigit').textContent = tens;
    $('#pvOnesDigit').textContent = ones;

    const pvTens = $('#pvTens');
    pvTens.innerHTML = '';
    for (let i = 0; i < tens; i++) {
      const bundle = document.createElement('div');
      bundle.className = 'rod-bundle';
      bundle.textContent = '10';
      pvTens.appendChild(bundle);
    }

    const pvOnes = $('#pvOnes');
    pvOnes.innerHTML = '';
    for (let i = 0; i < ones; i++) {
      const rod = document.createElement('div');
      rod.className = 'rod-single';
      pvOnes.appendChild(rod);
    }

    placeValueCard.style.display = 'block';
    placeValueCard.classList.add('animate-bounce');
    setTimeout(() => placeValueCard.classList.remove('animate-bounce'), 500);

    let hintQ, hintS;
    if (tens > 0 && ones > 0) {
      hintQ = tens + '捆小棒加' + ones + '根，是几？在下面找到它！';
      hintS = tens + '捆小棒加' + ones + '根，是数字几？点一下它';
    } else if (tens > 0) {
      hintQ = tens + '捆小棒，是几？在下面找到它！';
      hintS = tens + '捆小棒，是数字几？点一下它';
    } else {
      hintQ = ones + '根小棒，是几？在下面找到它！';
      hintS = ones + '根小棒，是数字几？点一下它';
    }
    showQuestion('🪵', hintQ);
    speak(hintS);
    bottomActions.style.display = 'none';
  }

  function onPlacePracticeClick(num, cell) {
    if (state.placeTarget === null) return;

    if (num === state.placeTarget) {
      cell.classList.add('place-selected');
      $('#pvNumber').textContent = num;
      showFeedback(true);
      state.placeScore++;
      state.placeTarget = null;
      setTimeout(() => nextPlaceQuestion(), 1400);
    } else {
      cell.classList.add('animate-shake');
      setTimeout(() => cell.classList.remove('animate-shake'), 400);
      showFeedback(false);

      const target = getCellByNum(state.placeTarget);
      if (target) {
        setTimeout(() => target.classList.add('hint-glow'), 800);
      }
    }
  }

  // ========== 底部按钮工具 ==========
  function showBottomAction(text, callback) {
    actionBtn.textContent = text;
    actionBtn.onclick = callback;
    bottomActions.style.display = 'flex';
  }

  // ========== 模式切换 ==========
  function switchMode(mode) {
    state.mode = mode;
    state.practicing = false;
    state.orderTarget = null;
    state.placeTarget = null;
    clearTimeout(state._orderTimer);

    $$('.mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // 隐藏所有模式专属UI
    orderQuiz.style.display = 'none';
    boardWrapper.style.display = '';
    rangeTabs.style.display = 'flex';
    skipControls.style.display = 'none';
    skipQuiz.style.display = 'none';
    placeValueCard.style.display = 'none';
    bubbleZone.style.display = 'none';
    bottomActions.style.display = 'none';
    hideQuestion();

    // 进入探索模式
    enterExploreMode();
  }

  // ========== 事件绑定 ==========
  function init() {
    $$('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    $$('.skip-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.skip-step-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.skipStep = parseInt(btn.dataset.step);
        if (!state.practicing) {
          showSkipExplorePattern();
        }
      });
    });

    $('#skipDirectionBtn').addEventListener('click', () => {
      state.skipForward = !state.skipForward;
      $('#skipDirText').textContent = state.skipForward ? '顺数 ▶' : '◀ 倒数';
      if (!state.practicing) {
        showSkipExplorePattern();
      }
    });

    // 分段切换
    $$('.range-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.rangeStart = parseInt(tab.dataset.start);
        $$('.range-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // 退出练习，回到当前模式的探索
        enterExploreMode();
      });
    });

    // 初始进入认数字探索模式
    switchMode('order');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
