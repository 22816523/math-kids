/* ============================================
   图形与几何 · 核心逻辑
   三种模式：辨认 / 分类 / 找一找
   ============================================ */

;(function () {
  'use strict';

  // ========== 柔和色板（护眼糖果色：中饱和+高亮度） ==========
  const SOFT_COLORS = [
    '#FF8A8A', '#7BC8F6', '#FFD166', '#6BCB77',
    '#C89CF2', '#FFA36C', '#6CD4DB', '#F28CB1',
    '#A8E06C', '#8A9CF2', '#F2D16C', '#6CF2C8',
  ];

  let colorIndex = 0;
  function nextColor() {
    const c = SOFT_COLORS[colorIndex % SOFT_COLORS.length];
    colorIndex++;
    return c;
  }
  function resetColors() { colorIndex = 0; }
  function shuffleColors() {
    for (let i = SOFT_COLORS.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [SOFT_COLORS[i], SOFT_COLORS[j]] = [SOFT_COLORS[j], SOFT_COLORS[i]];
    }
    colorIndex = 0;
  }

  // ========== SVG图形生成器（颜色动态传入） ==========
  const SHAPES = {
    circle: {
      name: '圆形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    square: {
      name: '正方形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><rect x="12" y="12" width="76" height="76" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    triangle: {
      name: '三角形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,8 92,88 8,88" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    rectangle: {
      name: '长方形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><rect x="8" y="22" width="84" height="56" rx="2" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    oval: {
      name: '椭圆形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="44" ry="30" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    diamond: {
      name: '菱形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,6 94,50 50,94 6,50" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    semicircle: {
      name: '半圆形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><path d="M8,70 A42,42 0 0,1 92,70 Z" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    trapezoid: {
      name: '梯形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="25,15 75,15 95,85 5,85" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    star: {
      name: '五角星',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,5 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    heart: {
      name: '爱心',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><path d="M50,88 C25,65 5,50 5,32 A22,22 0,0,1 50,20 A22,22 0,0,1 95,32 C95,50 75,65 50,88Z" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    pentagon: {
      name: '五边形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,8 95,38 77,90 23,90 5,38" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    },
    parallelogram: {
      name: '平行四边形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="25,20 92,20 75,80 8,80" fill="' + c + '" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/></svg>'
    }
  };

  // 生成带随机颜色的SVG
  function shapeSvg(key) {
    return SHAPES[key].makeSvg(nextColor());
  }

  const SHAPE_KEYS = Object.keys(SHAPES);

  // ========== 状态 ==========
  const state = {
    mode: 'recognize',
    practicing: false,
    stars: 0,
    // 辨认
    recTarget: null,
    recScore: 0,
    recTotal: 5,
    // 分类
    classifyRemaining: 0,
    // 找一找
    findTargets: [],
    findFound: 0,
    findScene: 0,
    tangramRound: 0,
    tangramQueue: [],
    tangramFilled: 0,
    spatialRound: 0,
  };

  // ========== DOM引用 ==========
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const recognizeArea = $('#recognizeArea');
  const classifyArea = $('#classifyArea');
  const classifyShapes = $('#classifyShapes');
  const classifyHomes = $('#classifyHomes');
  const findArea = $('#findArea');
  const sceneContainer = $('#sceneContainer');
  const findProgress = $('#findProgress');
  const tangramArea = $('#tangramArea');
  const tangramBoard = $('#tangramBoard');
  const spatialArea = $('#spatialArea');
  const spatialShelf = $('#spatialShelf');
  const spatialTray = $('#spatialTray');
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

  // ========== 工具函数 ==========
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickN(arr, n) {
    return shuffle(arr).slice(0, n);
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
      // addStar();
      if (correctStreak >= 3) {
        correctStreak = 0;
        setTimeout(() => showCelebration(), 600);
      }
    } else {
      correctStreak = 0;
    }
    setTimeout(() => { feedbackOverlay.style.display = 'none'; }, 1200);
  }

  function addStar() {
    state.stars++;
    starCountEl.textContent = state.stars;
    starCountEl.parentElement.classList.add('animate-jelly');
    setTimeout(() => starCountEl.parentElement.classList.remove('animate-jelly'), 400);
  }

  function showQuestion(icon, text, speechText, options) {
    promptController.showPrompt(icon, text, {
      speechText: speechText ?? text,
      autoSpeak: options?.autoSpeak !== false,
      allowReplay: options?.allowReplay !== false,
    });
  }

  function hideQuestion() { promptController.hidePrompt(); }

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

  function showBottomAction(text, callback) {
    actionBtn.textContent = text;
    actionBtn.onclick = callback;
    bottomActions.style.display = 'flex';
  }

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

  // ====================================================
  //  辨认模式：探索点击读名字 + 练习找指定图形
  // ====================================================
  function enterRecognizeExplore() {
    state.practicing = false;
    recognizeArea.innerHTML = '';
    shuffleColors();
    // 每种图形显示一个
    const keys = shuffle(SHAPE_KEYS);
    keys.forEach((key, idx) => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.dataset.shape = key;
      card.innerHTML = shapeSvg(key);
      card.style.animationDelay = (idx * 0.05) + 's';
      card.classList.add('animate-bounce');
      card.addEventListener('click', () => {
        if (state.practicing) return;
        speak(SHAPES[key].name);
        $$('.shape-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        setTimeout(() => card.classList.remove('selected'), 600);
      });
      recognizeArea.appendChild(card);
    });
    showQuestion('👆', '点一点图形，听听它叫什么名字');
    showBottomAction('🎯 开始练习', () => startRecognizePractice());
  }

  function startRecognizePractice() {
    state.practicing = true;
    state.recScore = 0;
    bottomActions.style.display = 'none';
    nextRecognizeQuestion();
  }

  function nextRecognizeQuestion() {
    if (state.recScore >= state.recTotal) {
      showQuestion('🎉', '全部找对了！答对 ' + state.recTotal + ' 个！');
      showCelebration();
      showBottomAction('🔄 再来一轮', () => startRecognizePractice());
      return;
    }

    // 生成12个图形（4x3），确保目标至少出现2个
    const target = pickRandom(SHAPE_KEYS);
    state.recTarget = target;
    const others = SHAPE_KEYS.filter(k => k !== target);

    const cards = [];
    const targetCount = 2 + Math.floor(Math.random() * 2); // 2-3个目标
    for (let i = 0; i < targetCount; i++) cards.push(target);
    while (cards.length < 12) cards.push(pickRandom(others));
    const shuffled = shuffle(cards);

    recognizeArea.innerHTML = '';
    shuffleColors();
    let found = 0;
    const total = targetCount;

    shuffled.forEach((key, idx) => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.dataset.shape = key;
      card.innerHTML = shapeSvg(key);
      card.addEventListener('click', () => {
        if (state.recTarget === null) return;
        if (card.classList.contains('selected')) return;
        if (key === state.recTarget) {
          card.classList.add('selected');
          showFeedback(true);
          found++;
          if (found >= total) {
            state.recScore++;
            state.recTarget = null;
            scheduleAdvance(() => nextRecognizeQuestion(), 1400);
          }
        } else {
          card.classList.add('wrong-select');
          showFeedback(false);
          setTimeout(() => card.classList.remove('wrong-select'), 400);
        }
      });
      recognizeArea.appendChild(card);
    });

    const name = SHAPES[target].name;
    showQuestion('👀', '找出所有的' + name + '（共' + total + '个）', '找出所有的' + name);
  }

  // ====================================================
  //  分类模式：探索点击读名字 + 练习拖拽分类
  // ====================================================
  function enterClassifyExplore() {
    state.practicing = false;
    // 展示所有图形让孩子认识
    classifyShapes.innerHTML = '';
    classifyHomes.innerHTML = '';
    shuffleColors();

    SHAPE_KEYS.forEach((key, idx) => {
      const item = document.createElement('div');
      item.className = 'classify-item';
      item.innerHTML = shapeSvg(key);
      item.classList.add('animate-bounce');
      item.style.animationDelay = (idx * 0.08) + 's';
      item.addEventListener('click', () => {
        if (state.practicing) return;
        speak(SHAPES[key].name);
      });
      classifyShapes.appendChild(item);
    });

    showQuestion('🏠', '点一点图形，认识它们的名字');
    showBottomAction('🎯 开始练习', () => startClassifyPractice());
  }

  function startClassifyPractice() {
    state.practicing = true;
    bottomActions.style.display = 'none';

    // 选3种图形作为分类目标
    const targetTypes = pickN(SHAPE_KEYS, 3);

    // 每种生成2-3个，共6-9个待分类图形
    const items = [];
    targetTypes.forEach(key => {
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) items.push(key);
    });
    state.classifyRemaining = items.length;
    const shuffled = shuffle(items);

    // 渲染待分类图形
    classifyShapes.innerHTML = '';
    shuffleColors();
    shuffled.forEach((key, idx) => {
      const item = document.createElement('div');
      item.className = 'classify-item';
      item.dataset.shape = key;
      item.innerHTML = shapeSvg(key);
      item.style.animationDelay = (idx * 0.06) + 's';
      item.classList.add('animate-bounce');
      setupClassifyDrag(item);
      classifyShapes.appendChild(item);
    });

    // 渲染分类目标（家）
    classifyHomes.innerHTML = '';
    targetTypes.forEach(key => {
      const home = document.createElement('div');
      home.className = 'classify-home';
      home.dataset.shape = key;
      home.innerHTML =
        '<div class="home-icon">' + shapeSvg(key) + '</div>' +
        '<div class="home-label">' + SHAPES[key].name + '</div>' +
        '<div class="home-count">0个</div>' +
        '<div class="home-collected"></div>';
      classifyHomes.appendChild(home);
    });

    showQuestion('🏠', '把图形拖到它的家里去', '把图形拖到它的家里去');
  }

  // 分类拖拽
  let dragItem = null;

  function setupClassifyDrag(item) {
    item.addEventListener('touchstart', onClassifyDragStart, { passive: false });
    item.addEventListener('mousedown', onClassifyDragStart);
  }

  function onClassifyDragStart(e) {
    e.preventDefault();
    const item = e.currentTarget;
    if (item.classList.contains('matched')) return;
    dragItem = item;
    document.body.appendChild(item);
    item.classList.add('dragging');
    const touch = e.touches ? e.touches[0] : e;
    moveClassifyItem(touch.clientX, touch.clientY);

    if (e.touches) {
      document.addEventListener('touchmove', onClassifyDragMove, { passive: false });
      document.addEventListener('touchend', onClassifyDragEnd);
    } else {
      document.addEventListener('mousemove', onClassifyDragMove);
      document.addEventListener('mouseup', onClassifyDragEnd);
    }
  }

  function onClassifyDragMove(e) {
    e.preventDefault();
    if (!dragItem) return;
    const touch = e.touches ? e.touches[0] : e;
    moveClassifyItem(touch.clientX, touch.clientY);

    // 高亮悬停的home
    $$('.classify-home').forEach(home => {
      const rect = home.getBoundingClientRect();
      const over = touch.clientX >= rect.left && touch.clientX <= rect.right &&
                   touch.clientY >= rect.top && touch.clientY <= rect.bottom;
      home.classList.toggle('drag-over', over);
    });
  }

  function moveClassifyItem(x, y) {
    if (!dragItem) return;
    const rect = dragItem.getBoundingClientRect();
    const viewportOffsets = getViewportOffsets();
    const position = window.PracticeSupport.getPointerDragPosition({
      x,
      y,
      rect,
      viewportOffsetLeft: viewportOffsets.left,
      viewportOffsetTop: viewportOffsets.top,
    });

    dragItem.style.position = 'fixed';
    dragItem.style.left = position.left + 'px';
    dragItem.style.top = position.top + 'px';
    dragItem.style.zIndex = '50';
  }

  function onClassifyDragEnd(e) {
    if (!dragItem) return;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const shape = dragItem.dataset.shape;
    let matched = false;

    $$('.classify-home').forEach(home => {
      home.classList.remove('drag-over');
      const rect = home.getBoundingClientRect();
      const tolerance = 40;
      if (
        touch.clientX >= rect.left - tolerance &&
        touch.clientX <= rect.right + tolerance &&
        touch.clientY >= rect.top - tolerance &&
        touch.clientY <= rect.bottom + tolerance
      ) {
        if (home.dataset.shape === shape) {
          // 正确分类
          dragItem.classList.add('matched');
          matched = true;
          showFeedback(true);

          // 更新计数
          const countEl = home.querySelector('.home-count');
          const collected = home.querySelector('.home-collected');
          const miniSvg = document.createElement('span');
          miniSvg.innerHTML = shapeSvg(shape);
          collected.appendChild(miniSvg);
          const cnt = collected.children.length;
          countEl.textContent = cnt + '个';

          state.classifyRemaining--;
          if (state.classifyRemaining <= 0) {
            scheduleAdvance(() => {
              showQuestion('🎉', '全部分好了！');
              showCelebration();
              showBottomAction('🔄 再来一轮', () => startClassifyPractice());
            }, 800);
          }
        }
      }
    });

    if (!matched) {
      showFeedback(false);
      dragItem.classList.add('animate-shake');
      setTimeout(() => dragItem.classList.remove('animate-shake'), 400);
    }

    if (!dragItem.classList.contains('matched')) {
      classifyShapes.appendChild(dragItem);
    }

    dragItem.classList.remove('dragging');
    dragItem.style.position = '';
    dragItem.style.left = '';
    dragItem.style.top = '';
    dragItem.style.zIndex = '';
    dragItem = null;

    document.removeEventListener('touchmove', onClassifyDragMove);
    document.removeEventListener('touchend', onClassifyDragEnd);
    document.removeEventListener('mousemove', onClassifyDragMove);
    document.removeEventListener('mouseup', onClassifyDragEnd);
  }

  // ====================================================
  //  找一找模式：SVG场景 + 点击隐藏图形
  // ====================================================
  const SCENES = [
    {
      name: '客厅',
      bg: '#E8F5E9',
      items: [
        { shape: 'circle', x: 15, y: 20, w: 18, h: 18, label: '挂钟' },
        { shape: 'rectangle', x: 55, y: 60, w: 30, h: 18, label: '电视' },
        { shape: 'square', x: 10, y: 65, w: 16, h: 16, label: '靠垫' },
        { shape: 'triangle', x: 80, y: 10, w: 16, h: 16, label: '屋顶装饰' },
        { shape: 'oval', x: 40, y: 85, w: 22, h: 12, label: '地毯' },
      ]
    },
    {
      name: '卧室',
      bg: '#E3F2FD',
      items: [
        { shape: 'rectangle', x: 20, y: 40, w: 40, h: 22, label: '床' },
        { shape: 'square', x: 70, y: 30, w: 16, h: 16, label: '窗户' },
        { shape: 'circle', x: 75, y: 70, w: 14, h: 14, label: '台灯底座' },
        { shape: 'triangle', x: 10, y: 10, w: 18, h: 18, label: '衣架' },
        { shape: 'diamond', x: 45, y: 12, w: 14, h: 14, label: '装饰画' },
      ]
    },
    {
      name: '厨房',
      bg: '#FFF3E0',
      items: [
        { shape: 'circle', x: 30, y: 25, w: 16, h: 16, label: '盘子' },
        { shape: 'rectangle', x: 55, y: 50, w: 28, h: 20, label: '冰箱' },
        { shape: 'square', x: 15, y: 55, w: 18, h: 18, label: '烤箱' },
        { shape: 'oval', x: 70, y: 20, w: 20, h: 12, label: '锅' },
        { shape: 'triangle', x: 45, y: 80, w: 16, h: 16, label: '三角架' },
      ]
    }
  ];

  function enterFindExplore() {
    state.practicing = true;
    state.findScene = 0;
    bottomActions.style.display = 'none';
    startFindPractice();
    return;
    renderScene(SCENES[0]);
    showQuestion('🔍', '这是' + SCENES[0].name + '，看看里面藏了什么图形');
    showBottomAction('🎯 开始找图形', () => startFindPractice());
  }

  function renderScene(scene) {
    sceneContainer.innerHTML = '';
    sceneContainer.style.background = scene.bg;
    shuffleColors();

    // 渲染场景物品（用SVG图形表示）
    scene.items.forEach((item, idx) => {
      const hotspot = document.createElement('div');
      hotspot.className = 'find-hotspot';
      hotspot.dataset.index = idx;
      hotspot.dataset.shape = item.shape;
      hotspot.style.left = item.x + '%';
      hotspot.style.top = item.y + '%';
      hotspot.style.width = item.w + '%';
      hotspot.style.height = item.h + '%';
      hotspot.innerHTML = shapeSvg(item.shape);
      hotspot.title = item.label;

      hotspot.addEventListener('click', () => {
        if (!state.practicing) {
          speak(SHAPES[item.shape].name + '，' + item.label);
          return;
        }
        onFindClick(hotspot, item, idx);
      });

      sceneContainer.appendChild(hotspot);
    });

    findProgress.textContent = '';
  }

  function startFindPractice() {
    state.practicing = true;
    bottomActions.style.display = 'none';

    const scene = SCENES[state.findScene];
    renderScene(scene);
    // 随机选一种图形作为目标
    const shapes = [...new Set(scene.items.map(i => i.shape))];
    const target = pickRandom(shapes);
    state.findTargets = scene.items
      .map((item, idx) => ({ ...item, idx }))
      .filter(item => item.shape === target);
    state.findFound = 0;

    // 重置所有hotspot状态
    $$('.find-hotspot').forEach(h => h.classList.remove('found'));

    const name = SHAPES[target].name;
    const total = state.findTargets.length;
    showQuestion('🔍', '找出' + scene.name + '里所有的' + name + '（共' + total + '个）', '找出所有的' + name);
    findProgress.textContent = '0 / ' + total;
  }

  function onFindClick(hotspot, item, idx) {
    if (hotspot.classList.contains('found')) return;

    const isTarget = state.findTargets.some(t => t.idx === idx);
    if (isTarget) {
      hotspot.classList.add('found');
      showFeedback(true);
      state.findFound++;
      findProgress.textContent = state.findFound + ' / ' + state.findTargets.length;

      if (state.findFound >= state.findTargets.length) {
        scheduleAdvance(() => {
          // 下一个场景或完成
          state.findScene++;
          if (state.findScene < SCENES.length) {
            startFindPractice();
            return;
            const next = SCENES[state.findScene];
            renderScene(next);
            showQuestion('🎉', '找到了！去' + next.name + '看看');
            showBottomAction('👉 下一个场景', () => startFindPractice());
          } else {
            showQuestion('🎉', '所有场景都找完了！');
            showCelebration();
            showBottomAction('🔄 再来一轮', () => {
              state.findScene = 0;
              startFindPractice();
            });
          }
        }, 1200);
      }
    } else {
      showFeedback(false);
      speak(SHAPES[item.shape].name + '，不是这个哦');
    }
  }


  // ====================================================
  //  模式：拼一拼 (七巧板拼贴)
  // ====================================================
  const TANGRAM_PUZZLES = [
    {
      name: '小红花',
      pieces: [
        { shape: 'circle', x: 30, y: 10, w: 40, h: 40 },
        { shape: 'rectangle', x: 45, y: 55, w: 10, h: 40 },
        { shape: 'oval', x: 15, y: 50, w: 30, h: 20 },
        { shape: 'oval', x: 55, y: 50, w: 30, h: 20 }
      ]
    },
    {
      name: '小房子',
      pieces: [
        { shape: 'triangle', x: 15, y: 10, w: 70, h: 40 },
        { shape: 'square', x: 25, y: 50, w: 50, h: 50 },
        { shape: 'rectangle', x: 40, y: 70, w: 20, h: 30 }
      ]
    },
    {
      name: '小火车',
      pieces: [
        { shape: 'rectangle', x: 10, y: 50, w: 40, h: 30 },
        { shape: 'square', x: 50, y: 30, w: 30, h: 50 },
        { shape: 'circle', x: 15, y: 80, w: 20, h: 20 },
        { shape: 'circle', x: 55, y: 80, w: 20, h: 20 },
        { shape: 'rectangle', x: 70, y: 10, w: 10, h: 20 }
      ]
    },
    {
      name: '小树',
      pieces: [
        { shape: 'triangle', x: 20, y: 8, w: 60, h: 38 },
        { shape: 'triangle', x: 25, y: 26, w: 50, h: 34 },
        { shape: 'rectangle', x: 43, y: 62, w: 14, h: 26 },
        { shape: 'oval', x: 10, y: 40, w: 22, h: 14 },
        { shape: 'oval', x: 68, y: 40, w: 22, h: 14 }
      ]
    },
    {
      name: '小汽车',
      pieces: [
        { shape: 'rectangle', x: 18, y: 50, w: 52, h: 22 },
        { shape: 'trapezoid', x: 28, y: 28, w: 34, h: 24 },
        { shape: 'circle', x: 20, y: 72, w: 18, h: 18 },
        { shape: 'circle', x: 56, y: 72, w: 18, h: 18 },
        { shape: 'square', x: 63, y: 48, w: 14, h: 14 }
      ]
    },
    {
      name: '小鱼',
      pieces: [
        { shape: 'oval', x: 18, y: 30, w: 42, h: 26 },
        { shape: 'triangle', x: 56, y: 30, w: 24, h: 26 },
        { shape: 'circle', x: 28, y: 38, w: 8, h: 8 },
        { shape: 'triangle', x: 22, y: 58, w: 18, h: 14 }
      ]
    },
    {
      name: '小船',
      pieces: [
        { shape: 'parallelogram', x: 18, y: 62, w: 56, h: 18 },
        { shape: 'triangle', x: 46, y: 18, w: 26, h: 36 },
        { shape: 'rectangle', x: 43, y: 28, w: 4, h: 40 },
        { shape: 'semicircle', x: 12, y: 78, w: 24, h: 10 }
      ]
    },
    {
      name: '冰淇淋',
      pieces: [
        { shape: 'triangle', x: 34, y: 46, w: 32, h: 38 },
        { shape: 'circle', x: 28, y: 14, w: 22, h: 22 },
        { shape: 'circle', x: 50, y: 14, w: 22, h: 22 },
        { shape: 'circle', x: 39, y: 4, w: 22, h: 22 }
      ]
    },
    {
      name: '火箭',
      pieces: [
        { shape: 'rectangle', x: 40, y: 26, w: 20, h: 40 },
        { shape: 'triangle', x: 36, y: 6, w: 28, h: 24 },
        { shape: 'triangle', x: 26, y: 54, w: 16, h: 22 },
        { shape: 'triangle', x: 58, y: 54, w: 16, h: 22 },
        { shape: 'circle', x: 44, y: 40, w: 12, h: 12 }
      ]
    },
    {
      name: '机器人',
      pieces: [
        { shape: 'square', x: 34, y: 10, w: 32, h: 24 },
        { shape: 'rectangle', x: 32, y: 38, w: 36, h: 30 },
        { shape: 'rectangle', x: 26, y: 68, w: 10, h: 20 },
        { shape: 'rectangle', x: 64, y: 68, w: 10, h: 20 },
        { shape: 'circle', x: 40, y: 18, w: 6, h: 6 },
        { shape: 'circle', x: 54, y: 18, w: 6, h: 6 }
      ]
    },
    {
      name: '小雪人',
      pieces: [
        { shape: 'circle', x: 36, y: 8, w: 20, h: 20 },
        { shape: 'circle', x: 28, y: 28, w: 36, h: 36 },
        { shape: 'circle', x: 18, y: 58, w: 56, h: 30 },
        { shape: 'rectangle', x: 43, y: 0, w: 6, h: 12 }
      ]
    },
    {
      name: '小蝴蝶',
      pieces: [
        { shape: 'heart', x: 16, y: 18, w: 26, h: 28 },
        { shape: 'heart', x: 58, y: 18, w: 26, h: 28 },
        { shape: 'heart', x: 18, y: 48, w: 24, h: 26 },
        { shape: 'heart', x: 58, y: 48, w: 24, h: 26 },
        { shape: 'rectangle', x: 47, y: 22, w: 6, h: 42 }
      ]
    },
    {
      name: '小礼物',
      pieces: [
        { shape: 'square', x: 24, y: 28, w: 52, h: 44 },
        { shape: 'rectangle', x: 47, y: 28, w: 6, h: 44 },
        { shape: 'rectangle', x: 24, y: 46, w: 52, h: 6 },
        { shape: 'heart', x: 32, y: 8, w: 18, h: 18 },
        { shape: 'heart', x: 50, y: 8, w: 18, h: 18 }
      ]
    }
  ];
  const TANGRAM_ROUNDS_PER_SESSION = 6;

  function buildTangramQueue(randomFn) {
    const rand = typeof randomFn === 'function' ? randomFn : Math.random;
    const pool = [...TANGRAM_PUZZLES];

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, Math.min(TANGRAM_ROUNDS_PER_SESSION, pool.length)).map((puzzle) => {
      const colorPool = shuffle(SOFT_COLORS);
      return {
        name: puzzle.name,
        pieces: puzzle.pieces.map((piece, index) => ({
          ...piece,
          color: colorPool[index % colorPool.length],
        })),
      };
    });
  }

  function enterTangramExplore() {
    state.practicing = true;
    state.tangramRound = 0;
    state.tangramQueue = buildTangramQueue();
    bottomActions.style.display = 'none';
    prepareTangramLevel();
  }

  function prepareTangramLevel() {
    if (state.tangramRound >= state.tangramQueue.length) {
       showQuestion('🏆', '所有拼图都拼完啦！太棒了！');
       showCelebration();
       showBottomAction('🔄 再玩一次', () => enterTangramExplore());
       tangramBoard.innerHTML = '';
       return;
    }

    const puzzle = state.tangramQueue[state.tangramRound];
    state.tangramPiecesFound = 0;
    showQuestion('🧩', '拖动图形，拼出一个' + puzzle.name + '吧！');

    tangramBoard.innerHTML = '<div class="puzzle-area"></div><div class="pieces-area"></div>';
    const puzzleArea = tangramBoard.querySelector('.puzzle-area');
    const piecesArea = tangramBoard.querySelector('.pieces-area');

    puzzle.pieces.forEach((p, idx) => {
       const slot = document.createElement('div');
       slot.className = 'puzzle-slot';
       slot.dataset.idx = idx;
       slot.style.left = p.x + '%';
       slot.style.top = p.y + '%';
       slot.style.width = p.w + '%';
       slot.style.height = p.h + '%';
       slot.innerHTML = SHAPES[p.shape].makeSvg('#E2E8F0'); 
       puzzleArea.appendChild(slot);

       const piece = document.createElement('div');
       piece.className = 'puzzle-piece';
       piece.dataset.idx = idx;
       piece.dataset.shape = p.shape;
       piece.innerHTML = SHAPES[p.shape].makeSvg(p.color);
       
       piece.style.position = 'relative';
       piece.style.width = '60px';
       piece.style.height = '60px';
       setupTangramDrag(piece, p, slot, piecesArea);
       piecesArea.appendChild(piece);
    });

    for (let i = piecesArea.children.length; i >= 0; i--) {
        piecesArea.appendChild(piecesArea.children[Math.random() * i | 0]);
    }
  }

  function setupTangramDrag(piece, pData, targetSlot, pieceContainer) {
     let sx=0, sy=0;
     let isDragging = false;
     let ghost = null;

     function onStart(e) {
        if(piece.classList.contains('locked')) return;
        e.preventDefault();
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        sx = touch.clientX;
        sy = touch.clientY;
        
        ghost = piece.cloneNode(true);
        ghost.classList.add('dragging');
        const rect = piece.getBoundingClientRect();
        ghost.style.position = 'fixed';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.zIndex = 1000;
        document.body.appendChild(ghost);
        piece.style.opacity = 0.3;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, {passive:false});
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
     }

     function onMove(e) {
        if(!isDragging) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - sx;
        const dy = touch.clientY - sy;
        ghost.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.1)';
     }

     function onEnd(e) {
        if(!isDragging) return;
        isDragging = false;
        
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const sRect = targetSlot.getBoundingClientRect();
        const cx = touch.clientX;
        const cy = touch.clientY;

        if(cx > sRect.left - 40 && cx < sRect.right + 40 && cy > sRect.top - 40 && cy < sRect.bottom + 40) {
           speak('对了！');
           targetSlot.innerHTML = SHAPES[pData.shape].makeSvg(pData.color);
           targetSlot.classList.add('animate-jelly');
           targetSlot.style.filter = 'none';
           state.tangramPiecesFound++;
           piece.remove();
           showFeedback(true);
           if(state.tangramPiecesFound >= state.tangramQueue[state.tangramRound].pieces.length) {
               showQuestion('🎉', '拼图完成！');
               showCelebration();
               state.tangramRound++;
               scheduleAdvance(prepareTangramLevel, 2000);
           }
        } else {
           speak('放到哪里呢？');
           piece.style.opacity = 1;
           showFeedback(false);
        }
        ghost.remove();
     }

     piece.addEventListener('mousedown', onStart);
     piece.addEventListener('touchstart', onStart, {passive:false});
  }

  // ====================================================
  //  模式：听指令 (方位九宫格)
  // ====================================================
  const SPATIAL_POSITIONS = [
    { row: 0, col: 0, name: '左上角' }, { row: 0, col: 1, name: '正上方中心' }, { row: 0, col: 2, name: '右上角' },
    { row: 1, col: 0, name: '左边中间' }, { row: 1, col: 1, name: '正中间' }, { row: 1, col: 2, name: '右边中间' },
    { row: 2, col: 0, name: '左下角' }, { row: 2, col: 1, name: '正下方中心' }, { row: 2, col: 2, name: '右下角' }
  ];

  function enterSpatialExplore() {
    state.practicing = true;
    state.spatialRound = 0;
    bottomActions.style.display = 'none';
    prepareSpatialLevel();
  }

  function prepareSpatialLevel() {
    if(state.spatialRound >= 3) {
       showQuestion('🏆', '太棒啦！柜子摆放得真整齐！');
       showCelebration();
       spatialShelf.innerHTML = '';
       let spatialTray = document.getElementById('spatialTray');
       if(spatialTray) spatialTray.remove();
       showBottomAction('🔄 再理一次', () => enterSpatialExplore());
       return;
    }

    spatialShelf.innerHTML = '';
    for(let r=0; r<3; r++){
       for(let c=0; c<3; c++){
          const cell = document.createElement('div');
          cell.className = 'shelf-cell';
          cell.dataset.r = r;
          cell.dataset.c = c;
          spatialShelf.appendChild(cell);
       }
    }

    let tray = document.getElementById('spatialTray');
    if(!tray) {
       tray = document.createElement('div');
       tray.id = 'spatialTray';
       tray.className = 'spatial-tray';
       spatialArea.appendChild(tray);
    }
    tray.innerHTML = '';

    const targetKeys = pickN(SHAPE_KEYS, 3);
    const targetSlots = pickN(SPATIAL_POSITIONS, 3);
    state.spatialTasks = targetKeys.map((k, i) => ({
       shape: k,
       color: nextColor(),
       pos: targetSlots[i]
    }));
    state.currentSpatialTaskIdx = 0;
    
    state.spatialTasks.forEach(task => {
        const toy = document.createElement('div');
        toy.className = 'spatial-toy';
        toy.dataset.shape = task.shape;
        toy.innerHTML = SHAPES[task.shape].makeSvg(task.color);
        setupSpatialDrag(toy, task, tray);
        tray.appendChild(toy);
    });

    nextSpatialInstruction();
  }

  function nextSpatialInstruction() {
      const task = state.spatialTasks[state.currentSpatialTaskIdx];
      const shapeName = SHAPES[task.shape].name;
      const posName = task.pos.name;
      const text = '请把 【' + shapeName + '】 放在柜子的 【' + posName + '】';
      showQuestion('🧭', text, text, {autoSpeak: true, allowReplay: true});
  }

  function setupSpatialDrag(toy, taskData, tray) {
     let isDragging = false;
     let sx=0, sy=0;
     let ghost = null;

     function onStart(e) {
        if(toy.classList.contains('locked')) return;
        e.preventDefault();
        isDragging = true;
        const touch = e.touches ? e.touches[0] : e;
        sx = touch.clientX;
        sy = touch.clientY;
        
        ghost = toy.cloneNode(true);
        ghost.classList.add('dragging');
        const rect = toy.getBoundingClientRect();
        ghost.style.position = 'fixed';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.zIndex = 1000;
        document.body.appendChild(ghost);
        toy.style.opacity = 0.2;

        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, {passive:false});
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
     }

     function onMove(e) {
        if(!isDragging) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        const dx = touch.clientX - sx;
        const dy = touch.clientY - sy;
        ghost.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.1)';
     }

     function onEnd(e) {
        if(!isDragging) return;
        isDragging = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchend', onEnd);

        const touch = e.changedTouches ? e.changedTouches[0] : e;
        const cx = touch.clientX;
        const cy = touch.clientY;

        let droppedCell = null;
        $$('.shelf-cell').forEach(c => {
           const rect = c.getBoundingClientRect();
           if(cx > rect.left && cx < rect.right && cy > rect.top && cy < rect.bottom) {
              droppedCell = c;
           }
        });

        const currentTask = state.spatialTasks[state.currentSpatialTaskIdx];

        if(droppedCell) {
           const isRightToy = (taskData.shape === currentTask.shape);
           const isRightCell = (parseInt(droppedCell.dataset.r) === currentTask.pos.row && parseInt(droppedCell.dataset.c) === currentTask.pos.col);
           
           if(isRightToy && isRightCell) {
              speak('放对了！真能干！');
              droppedCell.innerHTML = SHAPES[taskData.shape].makeSvg(taskData.color);
              droppedCell.classList.add('animate-jelly');
              toy.remove();
              showFeedback(true);
              
              state.currentSpatialTaskIdx++;
              if(state.currentSpatialTaskIdx >= state.spatialTasks.length) {
                  showQuestion('🎉', '全部都摆放整齐啦！');
                  showCelebration();
                  state.spatialRound++;
                  scheduleAdvance(prepareSpatialLevel, 2000);
              } else {
                  scheduleAdvance(nextSpatialInstruction, 1000);
              }
           } else {
              if(!isRightToy) speak('哎呀，那是别的玩具，我们要找' + SHAPES[currentTask.shape].name);
              else speak('位置不对哦。它应该去' + currentTask.pos.name);
              toy.style.opacity = 1;
              showFeedback(false);
              ghost.classList.add('animate-shake');
           }
        } else {
           toy.style.opacity = 1;
        }

        ghost.remove();
     }

     toy.addEventListener('mousedown', onStart);
     toy.addEventListener('touchstart', onStart, {passive:false});
  }
  // ====================================================
  //  模式切换
  // ====================================================
  function switchMode(mode) {
    state.mode = mode;
    state.practicing = false;
    clearTimeout(state._advanceTimer);

    $$('.mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    recognizeArea.style.display = 'none';
    classifyArea.style.display = 'none';
    findArea.style.display = 'none';
    tangramArea.style.display = 'none';
    spatialArea.style.display = 'none';
    bottomActions.style.display = 'none';
    hideQuestion();

    switch (mode) {
      case 'recognize':
        recognizeArea.style.display = '';
        enterRecognizeExplore();
        break;
      case 'classify':
        classifyArea.style.display = '';
        enterClassifyExplore();
        break;
      case 'find':
        findArea.style.display = '';
        enterFindExplore();
        break;
      case 'tangram':
        tangramArea.style.display = '';
        enterTangramExplore();
        break;
      case 'spatial':
        spatialArea.style.display = '';
        enterSpatialExplore();
        break;
    }
  }

  // ====================================================
  //  初始化
  // ====================================================
  function init() {
    $$('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });
    switchMode('recognize');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      TANGRAM_PUZZLES,
      TANGRAM_ROUNDS_PER_SESSION,
      buildTangramQueue,
    };
  }
})();
