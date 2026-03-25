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
  const questionSpeaker = $('#questionSpeaker');
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

  const promptController = window.PracticeSupport.createPromptController({
    questionBar,
    questionIcon,
    questionText,
    speakerButton: questionSpeaker,
    speak,
  });

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

  function showQuestion(icon, text, speechText, options) {
    promptController.showPrompt(icon, text, {
      speechText: speechText ?? text,
      autoSpeak: options?.autoSpeak !== false,
      allowReplay: options?.allowReplay !== false,
    });
  }

  function hideQuestion() {
    promptController.hidePrompt();
  }

  function scheduleAdvance(callback, delay) {
    clearTimeout(state._advanceTimer);
    state._advanceTimer = setTimeout(callback, delay);
  }

  function getViewportOffsets() {
    const viewport = window.visualViewport;

    return {
      left: viewport ? viewport.offsetLeft : 0,
      top: viewport ? viewport.offsetTop : 0,
    };
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

  function getCellByNum(num) {
    return grid.querySelector('[data-num="' + num + '"]');
  }

  // ========== 生成百数板（1-100全局） ==========
  function buildGrid() {
    grid.innerHTML = '';
    for (let i = 1; i <= 100; i++) {
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

      case 'neighbor':
        speak(String(num));
        break;

      case 'ninegrid':
        speak(String(num));
        break;

      case 'pattern':
        // 找规律探索：点击读出数字
        speak(String(num));
        break;

      case 'treasure':
        speak(String(num));
        break;
    }
  }

  // 已经被寻宝模式取代，故此函数删除

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

      case 'neighbor':
        showQuestion('🧩', '点一点数字，认识它们的邻居');
        showBottomAction('🎯 开始练习', () => startNeighborPractice());
        break;

      case 'ninegrid':
        showQuestion('🔲', '点一点数字，看看它周围的数字');
        showBottomAction('🎯 开始练习', () => startNinegridPractice());
        break;

      case 'pattern':
        skipControls.style.display = 'flex'; // 继续复用顶部的 "2个一数/5个一数" 控制栏
        showPatternExplorePattern();
        showBottomAction('🎯 开始练习', () => startPatternPractice());
        break;

      case 'treasure':
        showQuestion('💎', '数字海盗藏了宝藏，我们根据线索来找！');
        showBottomAction('🎯 开始寻宝', () => startTreasurePractice());
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

    // 随机目标数字（1-100）
    state.orderTarget = Math.floor(Math.random() * 100) + 1;
    state.orderWrongCount = 0;
    const target = state.orderTarget;

    // 生成3个干扰项（1-100范围内）
    const options = [target];
    while (options.length < 4) {
      const offset = (Math.floor(Math.random() * 10) - 5) || 1;
      const fake = target + offset;
      if (fake >= 1 && fake <= 100 && !options.includes(fake)) {
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
      scheduleAdvance(() => nextOrderQuestion(), 1400);
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
        scheduleAdvance(() => nextOrderQuestion(), 2000);
      }
    }
  }

  // ====================================================
  //  模式2：找邻居（局部连续填空 / 左右邻居）
  // ====================================================
  function startNeighborPractice() {
    state.practicing = true;
    hideQuestion();

    // 类型0: 连续段 (如 23, ?, 25, ?)
    // 类型1: 左右邻居 (如 ?, 45, ?)
    const type = Math.random() > 0.5 ? 0 : 1;
    let visibleNums = [];
    let blankNums = [];

    if (type === 0) {
      // 找一段连续的 4-6 个数字，其中挖空 2-3 个
      const len = 4 + Math.floor(Math.random() * 3); // 4,5,6
      const startNum = Math.floor(Math.random() * (100 - len)) + 1;
      for (let i = 0; i < len; i++) visibleNums.push(startNum + i);
      
      const count = len === 4 ? 2 : (len === 5 ? 2 : 3);
      // 不能把头尾都挖空，最好随机挖中间的
      while (blankNums.length < count) {
        const candidate = visibleNums[Math.floor(Math.random() * len)];
        if (!blankNums.includes(candidate)) {
          blankNums.push(candidate);
        }
      }
    } else {
      // 左右邻居
      const center = Math.floor(Math.random() * 98) + 2; // 2-99
      // 注意：不在同一行的不能算左右邻居，确保不跨行
      const cMod = center % 10;
      if (cMod === 1 || cMod === 0) {
        // 如果是行首结尾，退回类型0以防太复杂
        return startNeighborPractice();
      }
      visibleNums = [center - 1, center, center + 1];
      blankNums = [center - 1, center + 1];
    }

    state.blanks = blankNums.map(num => ({ position: num, value: num, filled: false }));

    const cells = grid.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const num = parseInt(cell.dataset.num);
      
      cell.classList.remove('blank', 'filled', 'hidden-num');
      delete cell.dataset.blank;

      if (visibleNums.includes(num)) {
        if (blankNums.includes(num)) {
          cell.textContent = '?';
          cell.classList.add('blank');
          cell.dataset.blank = num;
        } else {
          cell.textContent = num;
        }
      } else {
        // 不在局部区域内的数字，深色隐藏
        cell.textContent = num;
        cell.classList.add('hidden-num');
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
    showQuestion('🧩', '把数字拖到正确的位置吧！', '把数字拖到正确的位置吧');
  }

  function checkNeighborComplete() {
    if (state.blanks.every(b => b.filled)) {
      showQuestion('🎉', '全部填对了！');
      
      // 完成后把周边被隐藏的数字也稍微亮出来庆祝一下
      setTimeout(() => {
        $$('.cell.hidden-num').forEach(c => c.classList.remove('hidden-num'));
      }, 500);

      showBottomAction('🔄 再来一轮', () => startNeighborPractice());
      showCelebration();
    }
  }

  // ====================================================
  //  模式3：九宫格（十字/对角/全框空缺）
  // ====================================================
  function startNinegridPractice() {
    state.practicing = true;
    hideQuestion();

    // 随机一个中心点 (不能在第一行、最后一行、第一列、最后一列)
    // 即：范围 12..89, 个位不能是 1 或 0
    let center;
    while (true) {
      center = Math.floor(Math.random() * 78) + 12; // 12~89
      const mod = center % 10;
      if (mod !== 1 && mod !== 0) break;
    }

    // 确定九宫格所有点
    const nineCells = [
      center - 11, center - 10, center - 9,
      center - 1,  center,      center + 1,
      center + 9,  center + 10, center + 11
    ];

    // 难度类型：
    // 0: 十字空缺 (上下左右4个)
    // 1: 四角空缺 (对角线4个)
    // 2: 外周围全空缺 (8个)
    const type = Math.floor(Math.random() * 3);
    let blankNums = [];
    if (type === 0) {
      blankNums = [center - 10, center - 1, center + 1, center + 10];
    } else if (type === 1) {
      blankNums = [center - 11, center - 9, center + 9, center + 11];
    } else {
      blankNums = nineCells.filter(n => n !== center);
    }

    state.blanks = blankNums.map(num => ({ position: num, value: num, filled: false }));

    const cells = grid.children;
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const num = parseInt(cell.dataset.num);
      
      cell.classList.remove('blank', 'filled', 'hidden-num');
      delete cell.dataset.blank;

      if (nineCells.includes(num)) {
        if (blankNums.includes(num)) {
          cell.textContent = '?';
          cell.classList.add('blank');
          cell.dataset.blank = num;
        } else {
          cell.textContent = num;
        }
      } else {
        // 不在九宫格内的数字隐藏
        cell.textContent = num;
        cell.classList.add('hidden-num');
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
    showQuestion('🔲', '把数字拖进神奇九宫格！', '把数字拖进神奇九宫格！');
  }

  function checkNinegridComplete() {
    if (state.blanks.every(b => b.filled)) {
      showQuestion('🎉', '九宫格全部填对了！');
      
      setTimeout(() => {
        $$('.cell.hidden-num').forEach(c => c.classList.remove('hidden-num'));
      }, 500);

      showBottomAction('🔄 再来一轮', () => startNinegridPractice());
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
    const rect = bubble.getBoundingClientRect();
    const viewportOffsets = getViewportOffsets();
    const position = window.PracticeSupport.getPointerDragPosition({
      x,
      y,
      rect,
      viewportOffsetLeft: viewportOffsets.left,
      viewportOffsetTop: viewportOffsets.top,
    });

    bubble.style.position = 'fixed';
    bubble.style.left = position.left + 'px';
    bubble.style.top = position.top + 'px';
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
          if (state.mode === 'neighbor') checkNeighborComplete();
          else if (state.mode === 'ninegrid') checkNinegridComplete();
          else if (state.mode === 'pattern') checkPatternComplete();
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
  //  模式4：找规律（等差数列填空）
  // ====================================================
  function showPatternExplorePattern() {
    // 清除之前状态
    $$('.cell').forEach(c => {
      c.classList.remove('skip-highlight', 'skip-animate', 'blank', 'filled', 'hidden-num');
      c.textContent = c.dataset.num;
    });
    skipQuiz.style.display = 'none';
    bubbleZone.style.display = 'none';

    const step = state.skipStep;
    // 全量序列
    const allNumbers = [];
    if (state.skipForward) {
      for (let i = step; i <= 100; i += step) allNumbers.push(i);
    } else {
      for (let i = 100; i >= step; i -= step) allNumbers.push(i);
    }
    const visible = allNumbers;

    visible.forEach((num, idx) => {
      const cell = getCellByNum(num);
      if (cell) {
        setTimeout(() => {
          cell.classList.add('skip-highlight', 'skip-animate');
        }, idx * 120);
      }
    });

    const dirText = state.skipForward ? '顺数' : '倒数';
    showQuestion('🚀', step + '个一数，' + dirText + ' — 看看规律', step + '个一数，' + dirText);

    showBottomAction('🎯 开始练习', () => startPatternPractice());
  }

  function startPatternPractice() {
    state.practicing = true;
    state.skipQuizIndex = 0;
    bottomActions.style.display = 'none';
    nextPatternQuestion();
  }

  function nextPatternQuestion() {
    const step = state.skipStep;
    // 全量序列
    const allNumbers = [];
    if (state.skipForward) {
      for (let i = step; i <= 100; i += step) allNumbers.push(i);
    } else {
      for (let i = 100; i >= step; i -= step) allNumbers.push(i);
    }
    const numbers = allNumbers;

    if (state.skipQuizIndex >= 5 || numbers.length < 5) {
      skipQuiz.style.display = 'none';
      bubbleZone.style.display = 'none';
      showQuestion('🎉', '找规律练习完成！');
      $$('.cell.hidden-num').forEach(c => c.classList.remove('hidden-num'));
      showCelebration();
      showBottomAction('🔄 回去看看', () => {
        state.practicing = false;
        showPatternExplorePattern();
      });
      return;
    }

    // 随机选取连续的 3-5 个数字作为题面
    const len = 3 + Math.floor(Math.random() * 3); // 3,4,5
    // 确保能够截取这么多数字
    const maxStartIdx = numbers.length - len;
    const startIdx = Math.floor(Math.random() * (maxStartIdx + 1));
    const questionSeries = numbers.slice(startIdx, startIdx + len);

    // 在这几个里挖空 1-2个（不能全挖空，至少留2个数字来显示规律）
    let blankCount = len === 5 ? 2 : 1;
    const blankNums = [];
    const availableIndices = [];
    for (let i = 0; i < len; i++) availableIndices.push(i);
    
    while(blankNums.length < blankCount && availableIndices.length > 0) {
      const rIdx = Math.floor(Math.random() * availableIndices.length);
      const selIdx = availableIndices.splice(rIdx, 1)[0];
      blankNums.push(questionSeries[selIdx]);
    }

    state.skipQuizAnswer = blankNums; // 用于老版跳数逻辑判定，不过这里我们复用拖拽系统更好
    state.blanks = blankNums.map(num => ({ position: num, value: num, filled: false }));

    // 重置并隐藏不在序列里的网格
    $$('.cell').forEach(c => {
      c.classList.remove('skip-highlight', 'skip-animate', 'blank', 'filled', 'hidden-num');
      delete c.dataset.blank;
      const num = parseInt(c.dataset.num);
      
      if (questionSeries.includes(num)) {
        if (blankNums.includes(num)) {
          c.textContent = '?';
          c.classList.add('blank');
          c.dataset.blank = num;
        } else {
          c.textContent = num;
        }
      } else {
        c.classList.add('hidden-num');
      }
    });

    // 题目展示文本，例如：5，10，?，20
    const hintTextStr = questionSeries.map(n => blankNums.includes(n) ? '?' : n).join('，');

    // 气泡选项：包含正确答案 + 干扰项
    const options = [...blankNums];
    while(options.length < blankCount + 2) {
       // 干扰项从整个序列里挑，或者稍微大点小点
       const fake = numbers[Math.floor(Math.random() * numbers.length)] || (Math.floor(Math.random()*100)+1);
       if (!options.includes(fake)) {
         options.push(fake);
       }
    }
    options.sort(() => Math.random() - 0.5);

    skipQuiz.style.display = 'block';
    skipQuizOptions.innerHTML = '';
    skipQuizHint.textContent = `规律：${step}个一数。排列：` + hintTextStr;
    
    bubbleZone.innerHTML = '';
    options.forEach((opt, idx) => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = opt;
      bubble.dataset.value = opt;
      bubble.style.animationDelay = (idx * 0.08) + 's';
      setupDrag(bubble);
      bubbleZone.appendChild(bubble);
    });

    bubbleZone.style.display = 'flex';
    showQuestion('🎯', '按规律，问号处应该填几？', '按规律，拖动正确的数字填入问号');
  }

  function checkPatternComplete() {
    if (state.blanks.every(b => b.filled)) {
      showQuestion('✅', '恭喜你，找对规律了！');
      state.skipQuizIndex++;
      
      setTimeout(() => {
        nextPatternQuestion();
      }, 1500);
    }
  }

  // ====================================================
  //  模式5：数字寻宝（多条件线索推理）
  // ====================================================
  function startTreasurePractice() {
    state.practicing = true;
    hideQuestion();

    // 随机一个目标数字 (避免太靠边的边角料让线索太容易)
    state.treasureTarget = Math.floor(Math.random() * 80) + 11; 
    const target = state.treasureTarget;
    
    // 生成3条线索
    const clues = [];
    const tens = Math.floor(target / 10);
    const ones = target % 10;
    const row = tens + (ones === 0 ? 0 : 1); // 1-10行
    
    // 线索1：行或列 (包含)
    if (Math.random() > 0.5) {
      clues.push(`在第 ${row} 行`);
    } else {
      clues.push(`个位是 ${ones}`);
    }

    // 线索2：大小范围 (排除法)
    const offset = Math.floor(Math.random() * 5) + 5; // 5-9的偏移
    if (Math.random() > 0.5) {
       // 大于 X
       const lowerBound = Math.max(1, target - offset);
       clues.push(`比 ${lowerBound} 大`);
    } else {
       // 小于 X
       const upperBound = Math.min(100, target + offset);
       clues.push(`比 ${upperBound} 小`);
    }

    // 线索3：特定数值特征或其他
    if (clues.some(c => c.includes('个位'))) {
       // 已经有个位线索了，就给十位或者范围
       clues.push(Math.random() > 0.5 ? `十位是 ${tens}` : `它的相邻数字有 ${target - 1}`);
    } else {
       clues.push(`个位是 ${ones}`);
    }

    state.treasureClues = clues.sort(() => Math.random() - 0.5);
    state.treasureStep = 0;

    // UI 显示
    $$('.cell').forEach(c => {
      c.classList.remove('hidden-num', 'skip-highlight', 'blank', 'filled');
      c.textContent = c.dataset.num;
    });

    bottomActions.style.display = 'flex';
    actionBtn.onclick = revealNextTreasureClue;
    actionBtn.textContent = '📜 查看线索';

    showQuestion('🗺️', '海盗把大钻石藏在了一个数字下面！', '海盗把大钻石藏在了一个数字下面，看看线索吧');
  }

  function revealNextTreasureClue() {
    if (state.treasureStep >= state.treasureClues.length) return;
    
    const clue = state.treasureClues[state.treasureStep];
    state.treasureStep++;

    const target = state.treasureTarget;
    const tens = Math.floor(target / 10);
    const ones = target % 10;
    const row = tens + (ones === 0 ? 0 : 1);

    // 解析当前所有已揭示线索对应的存活数字
    const activeClues = state.treasureClues.slice(0, state.treasureStep);
    
    $$('.cell').forEach((cell) => {
      if (cell.classList.contains('hidden-num')) return; // 已经被淘汰了
      
      const num = parseInt(cell.dataset.num);
      let isAlive = true;
      const cTens = Math.floor(num / 10);
      const cOnes = num % 10;
      const cRow = cTens + (cOnes === 0 ? 0 : 1);

      activeClues.forEach(c => {
        if (c.includes('行')) {
           const r = parseInt(c.match(/\d+/)[0]);
           if (cRow !== r) isAlive = false;
        } else if (c.includes('个位')) {
           const o = parseInt(c.match(/\d+/)[0]);
           if (cOnes !== o && num !== 100) isAlive = false;
           if (cOnes !== o && num === 100 && o !== 0) isAlive = false; // 100的个位是0
        } else if (c.includes('十位')) {
           const t = parseInt(c.match(/\d+/)[0]);
           if (cTens !== t && num !== 100) isAlive = false;
        } else if (c.includes('大')) {
           const val = parseInt(c.match(/\d+/)[0]);
           if (num <= val) isAlive = false;
        } else if (c.includes('小')) {
           const val = parseInt(c.match(/\d+/)[0]);
           if (num >= val) isAlive = false;
        } else if (c.includes('相邻')) {
           // 它的相邻数字有 target-1, 说明 num 是 target
           if (num !== target) isAlive = false;
        }
      });

      if (!isAlive) {
         cell.classList.add('hidden-num');
      }
    });

    showQuestion('📜', `线索 ${state.treasureStep}: ${clue}`);

    if (state.treasureStep === state.treasureClues.length) {
      actionBtn.textContent = '🔍 我猜对了！';
      actionBtn.onclick = () => {
         const remaining = $$('.cell:not(.hidden-num)');
         if (remaining.length === 1 && parseInt(remaining[0].dataset.num) === state.treasureTarget) {
            checkTreasureComplete(remaining[0]);
         } else {
            // 点击格子的交互
            showQuestion('🤔', '只剩这些数字了，点击那是哪个！');
            bottomActions.style.display = 'none';
            $$('.cell:not(.hidden-num)').forEach(c => {
               c.onclick = () => {
                  if (parseInt(c.dataset.num) === state.treasureTarget) {
                    checkTreasureComplete(c);
                  } else {
                    c.classList.add('hidden-num');
                    showFeedback(false);
                  }
               };
            });
         }
      };
    }
  }

  function checkTreasureComplete(cell) {
     cell.textContent = '💎';
     cell.classList.add('skip-highlight'); // 让它亮起来
     showFeedback(true);
     showQuestion('🎉', `找到了！藏在 ${state.treasureTarget} 号下面！`);
     showCelebration();
     
     // 延迟几秒后全盘亮起并重置事件
     setTimeout(() => {
       $$('.cell.hidden-num').forEach(c => c.classList.remove('hidden-num'));
       $$('.cell').forEach(c => {
          c.onclick = () => onCellClick(parseInt(c.dataset.num), c);
       });
       showBottomAction('🔄 再玩一次', () => startTreasurePractice());
     }, 1000);
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
    clearTimeout(state._advanceTimer);

    $$('.mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    // 隐藏所有模式专属UI
    orderQuiz.style.display = 'none';
    boardWrapper.style.display = '';
    skipQuiz.style.display = 'none';
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
          showPatternExplorePattern();
        }
      });
    });

    $('#skipDirectionBtn').addEventListener('click', () => {
      state.skipForward = !state.skipForward;
      $('#skipDirText').textContent = state.skipForward ? '顺数 ▶' : '◀ 倒数';
      if (!state.practicing) {
        showPatternExplorePattern();
      }
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
