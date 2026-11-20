/* ============================================
   图形与几何 · 核心逻辑
   三种模式：辨认 / 分类 / 找一找
   ============================================ */

;(function () {
  'use strict';

  // ========== 6大核心马卡龙柔和色盘（薄荷青、天晴蓝、蜜桃粉、奶油黄、香芋紫、杏子橙） ==========
  const SOFT_COLORS = [
    '#7CE0C3', // 薄荷青
    '#7BC9FF', // 天晴蓝
    '#FFAAA6', // 蜜桃粉
    '#FED268', // 奶油黄
    '#D4A5FF', // 香芋紫
    '#FFBE86', // 杏子橙
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

  // ========== 平面图形库（小学 1-6 年级 · 12种马卡龙纯净质感 · 放大丰满比例） ==========
  const PLANE_SHAPES = {
    square: {
      name: '正方形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="12" fill="' + c + '"/></svg>'
    },
    rectangle: {
      name: '长方形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><rect x="6" y="20" width="88" height="60" rx="12" fill="' + c + '"/></svg>'
    },
    triangle: {
      name: '三角形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,8 94,88 6,88" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    circle: {
      name: '圆形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="' + c + '"/></svg>'
    },
    parallelogram: {
      name: '平行四边形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="28,26 94,26 72,74 6,74" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    trapezoid: {
      name: '梯形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="24,18 76,18 95,82 5,82" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    diamond: {
      name: '菱形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,8 82,50 50,92 18,50" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    sector: {
      name: '扇形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><path d="M50,84 L14,24 A46,46 0 0,1 86,24 Z" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    pentagon: {
      name: '五边形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="50,8 95,38 78,88 22,88 5,38" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    hexagon: {
      name: '六边形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="25,12 75,12 95,50 75,88 25,88 5,50" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    },
    oval: {
      name: '椭圆形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="46" ry="32" fill="' + c + '"/></svg>'
    },
    right_triangle: {
      name: '直角三角形',
      makeSvg: (c) => '<svg viewBox="0 0 100 100"><polygon points="12,12 12,88 88,88" stroke-linejoin="round" stroke-width="8" stroke="' + c + '" fill="' + c + '"/></svg>'
    }
  };

  // ========== 立体图形库（小学 1-6 年级 · 8种柔和透视拟真 · 放大丰满比例） ==========
  const SOLID_SHAPES = {
    cube: {
      name: '正方体',
      makeSvg: () => '<svg viewBox="0 0 100 100"><polygon points="50,10 88,28 50,46 12,28" fill="#A7EDE0"/><polygon points="12,28 50,46 50,90 12,72" fill="#58D1B1"/><polygon points="50,46 88,28 88,72 50,90" fill="#7CE0C3"/></svg>'
    },
    cuboid: {
      name: '长方体',
      makeSvg: () => '<svg viewBox="0 0 100 100">' +
        '<polygon points="20,24 88,24 74,38 6,38" fill="#A8DDFF"/>' +
        '<polygon points="6,38 74,38 74,74 6,74" fill="#52B2F5"/>' +
        '<polygon points="74,38 88,24 88,60 74,74" fill="#7BC9FF"/>' +
        '</svg>'
    },
    cylinder: {
      name: '圆柱体',
      makeSvg: () => '<svg viewBox="0 0 100 100">' +
        '<defs>' +
        '<linearGradient id="cylBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#FFAAA6"/>' +
        '<stop offset="30%" stop-color="#FFBFBC"/>' +
        '<stop offset="75%" stop-color="#FA948E"/>' +
        '<stop offset="100%" stop-color="#E2736D"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<path d="M18,28 L18,72 A32,12 0 0,0 82,72 L82,28 Z" fill="url(#cylBodyGrad)"/>' +
        '<ellipse cx="50" cy="28" rx="32" ry="12" fill="#FFE2E0" stroke="#FFAAA6" stroke-width="1"/>' +
        '</svg>'
    },
    sphere: {
      name: '球体',
      makeSvg: () => '<svg viewBox="0 0 100 100"><defs><radialGradient id="sphereGrad" cx="38%" cy="36%" r="62%"><stop offset="0%" stop-color="#FFF5D6"/><stop offset="50%" stop-color="#FED268"/><stop offset="100%" stop-color="#E5AD3A"/></radialGradient></defs><circle cx="50" cy="50" r="42" fill="url(#sphereGrad)"/></svg>'
    },
    cone: {
      name: '圆锥体',
      makeSvg: () => '<svg viewBox="0 0 100 100">' +
        '<defs>' +
        '<linearGradient id="coneBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
        '<stop offset="0%" stop-color="#C58BF2"/>' +
        '<stop offset="30%" stop-color="#E1BFFF"/>' +
        '<stop offset="75%" stop-color="#B370E8"/>' +
        '<stop offset="100%" stop-color="#9645D6"/>' +
        '</linearGradient>' +
        '</defs>' +
        '<path d="M50,14 L16,78 A34,10 0 0,0 84,78 Z" fill="url(#coneBodyGrad)"/>' +
        '</svg>'
    },
    triangular_prism: {
      name: '三棱柱',
      makeSvg: () => '<svg viewBox="0 0 100 100">' +
        '<polygon points="16,20 50,36 50,86 16,70" fill="#FFBE86"/>' +
        '<polygon points="50,36 84,20 84,70 50,86" fill="#ECA05F"/>' +
        '<polygon points="16,20 84,20 50,36" fill="#FFE1C4"/>' +
        '</svg>'
    },
    square_pyramid: {
      name: '四棱锥',
      makeSvg: () => '<svg viewBox="0 0 100 100"><polygon points="50,10 12,78 52,90" fill="#52B2F5"/><polygon points="50,10 52,90 88,74" fill="#7BC9FF"/><polygon points="50,10 12,78 46,64" fill="#3D93D1" opacity="0.5"/></svg>'
    },
    hexagonal_prism: {
      name: '六棱柱',
      makeSvg: () => '<svg viewBox="0 0 100 100"><polygon points="32,12 68,12 84,26 68,40 32,40 16,26" fill="#A7EDE0"/><polygon points="16,26 32,40 32,84 16,70" fill="#58D1B1"/><polygon points="32,40 68,40 68,84 32,84" fill="#7CE0C3"/><polygon points="68,40 84,26 84,70 68,84" fill="#4ABF9F"/></svg>'
    }
  };

  const SHAPES = { ...PLANE_SHAPES, ...SOLID_SHAPES };

  // 生成带随机颜色的SVG
  function shapeSvg(key) {
    if (!SHAPES[key]) return '';
    return SHAPES[key].makeSvg(nextColor());
  }

  function mountSvgMarkup(container, markup, options = {}) {
    container.innerHTML = markup;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const width = options.width || '100%';
    const height = options.height || '100%';
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.display = 'block';
    svg.style.width = width;
    svg.style.height = height;
    svg.style.overflow = 'visible';
    svg.style.pointerEvents = 'none';
  }

  const PLANE_SHAPE_KEYS = Object.keys(PLANE_SHAPES);
  const SOLID_SHAPE_KEYS = Object.keys(SOLID_SHAPES);
  const SHAPE_KEYS = Object.keys(SHAPES);

  // ========== 状态 ==========
  const state = {
    mode: 'recognize',
    recognizeSubType: 'plane', // 'plane' | 'solid'
    practicing: false,
    stars: 0,
    // 辨认
    recTarget: null,
    recScore: 0,
    recTotal: 5,
    // 方位置物架
    spatialRound: 0,
    spatialTasks: [],
    currentSpatialTaskIdx: 0,
    selectedToy: null,
  };

  // ========== DOM引用 ==========
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const recognizeArea = $('#recognizeArea');
  const shapeSubTabs = $('#shapeSubTabs');
  const classifyArea = $('#classifyArea');
  const classifyShapes = $('#classifyShapes');
  const classifyHomes = $('#classifyHomes');
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
    { emoji: '👀', text: '仔细看一看～' },
    { emoji: '👆', text: '换一个试试～' },
  ];

  function showFeedback(isCorrect) {
    const list = isCorrect ? correctFeedbacks : encourageFeedbacks;
    const fb = list[Math.floor(Math.random() * list.length)];
    feedbackEmoji.textContent = fb.emoji;
    feedbackText.textContent = fb.text;
    feedbackText.style.color = isCorrect ? 'var(--green-dark)' : 'var(--yellow-dark)';
    feedbackOverlay.style.display = 'flex';
    speak(fb.text);
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
    const colors = SOFT_COLORS;
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
  function getActiveRecognizeKeys() {
    return state.recognizeSubType === 'solid' ? SOLID_SHAPE_KEYS : PLANE_SHAPE_KEYS;
  }

  function enterRecognizeExplore() {
    state.practicing = false;
    recognizeArea.innerHTML = '';
    shuffleColors();

    const activeKeys = getActiveRecognizeKeys();
    activeKeys.forEach((key) => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.dataset.shape = key;
      card.innerHTML = shapeSvg(key) + '<div class="shape-name-tag">' + SHAPES[key].name + '</div>';
      card.addEventListener('click', () => {
        if (state.practicing) return;
        speak(SHAPES[key].name);
        $$('.shape-card.selected').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        setTimeout(() => card.classList.remove('selected'), 600);
      });
      recognizeArea.appendChild(card);
    });

    const typeLabel = state.recognizeSubType === 'solid' ? '立体图形' : '平面图形';
    showQuestion('👆', '点一点' + typeLabel + '，听听它叫什么名字');
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
      showQuestion('🎉', '全部找对了！答对 ' + state.recTotal + ' 轮！');
      showCelebration();
      showBottomAction('🔄 再来一轮', () => startRecognizePractice());
      return;
    }

    const activeKeys = getActiveRecognizeKeys();
    const target = pickRandom(activeKeys);
    state.recTarget = target;
    const others = activeKeys.filter(k => k !== target);

    const cards = [];
    const targetCount = 2 + Math.floor(Math.random() * 2); // 2-3个目标
    for (let i = 0; i < targetCount; i++) cards.push(target);

    const targetGridCount = state.recognizeSubType === 'solid' ? 8 : 12;
    while (cards.length < targetGridCount) {
      cards.push(pickRandom(others));
    }
    const shuffled = shuffle(cards);

    recognizeArea.innerHTML = '';
    shuffleColors();
    let found = 0;
    const total = targetCount;

    shuffled.forEach((key) => {
      const card = document.createElement('div');
      card.className = 'shape-card';
      card.dataset.shape = key;
      card.innerHTML = shapeSvg(key); // 练习模式不显示名字
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
    showQuestion('👀', '找出所有的【' + name + '】（共' + total + '个）', '找出所有的' + name);
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
       mountSvgMarkup(slot, SHAPES[p.shape].makeSvg('#E2E8F0'));
       puzzleArea.appendChild(slot);

       const piece = document.createElement('div');
       piece.className = 'puzzle-piece';
       piece.dataset.idx = idx;
       piece.dataset.shape = p.shape;
       mountSvgMarkup(piece, SHAPES[p.shape].makeSvg(p.color));
       
       piece.style.position = 'relative';
       piece.style.width = '64px';
       piece.style.height = '64px';
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
           mountSvgMarkup(targetSlot, SHAPES[pData.shape].makeSvg(pData.color));
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
  //  模式：听指令 (4x4 浅白蜡木/榉木收纳置物架)
  // ====================================================
  function getSpatialInstruction(r, c) {
    const rowNum = r + 1;
    const colNum = c + 1;
    const topNum = r + 1;
    const bottomNum = 4 - r;
    const leftNum = c + 1;
    const rightNum = 4 - c;

    const templates = [];

    // 角落特指
    if (r === 0 && c === 0) templates.push('最左上角的格子里');
    else if (r === 0 && c === 3) templates.push('最右上角的格子里');
    else if (r === 3 && c === 0) templates.push('最左下角的格子里');
    else if (r === 3 && c === 3) templates.push('最右下角的格子里');

    // 坐标法（第几行，第几列）
    templates.push('第 ' + rowNum + ' 行，第 ' + colNum + ' 列');

    // 方向顺序计数法
    templates.push('从上往下第 ' + topNum + ' 行，从左往右第 ' + leftNum + ' 个');
    templates.push('从上往下第 ' + topNum + ' 行，从右往左第 ' + rightNum + ' 个');
    templates.push('从下往上第 ' + bottomNum + ' 行，从左往右第 ' + leftNum + ' 个');
    templates.push('从下往上第 ' + bottomNum + ' 行，从右往左第 ' + rightNum + ' 个');

    return pickRandom(templates);
  }

  function enterSpatialExplore() {
    state.practicing = true;
    state.spatialRound = 0;
    bottomActions.style.display = 'none';
    prepareSpatialLevel();
  }

  function prepareSpatialLevel() {
    if (state.spatialRound >= 3) {
      showQuestion('🏆', '太棒啦！置物架整理得整整齐齐！');
      showCelebration();
      spatialShelf.innerHTML = '';
      const tray = document.getElementById('spatialTray');
      if (tray) tray.innerHTML = '';
      showBottomAction('🔄 再理一次', () => enterSpatialExplore());
      return;
    }

    spatialShelf.innerHTML = '';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement('div');
        cell.className = 'shelf-cell';
        cell.dataset.r = r;
        cell.dataset.c = c;
        cell.addEventListener('click', () => onCellClicked(cell));
        spatialShelf.appendChild(cell);
      }
    }

    let tray = document.getElementById('spatialTray');
    if (!tray) {
      tray = document.createElement('div');
      tray.id = 'spatialTray';
      tray.className = 'spatial-tray';
      spatialArea.appendChild(tray);
    }
    tray.innerHTML = '';

    const allSlots = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        allSlots.push({ row: r, col: c });
      }
    }

    const targetSlots = pickN(allSlots, 3);
    const targetKeys = pickN(SHAPE_KEYS, 3);
    state.spatialTasks = targetKeys.map((k, i) => {
      const pos = targetSlots[i];
      return {
        shape: k,
        color: nextColor(),
        pos: pos,
        instruction: getSpatialInstruction(pos.row, pos.col)
      };
    });
    state.currentSpatialTaskIdx = 0;
    state.selectedToy = null;

    state.spatialTasks.forEach(task => {
      const toy = document.createElement('div');
      toy.className = 'spatial-toy';
      toy.dataset.shape = task.shape;
      mountSvgMarkup(toy, SHAPES[task.shape].makeSvg(task.color));
      setupSpatialDrag(toy, task, tray);
      tray.appendChild(toy);
    });

    nextSpatialInstruction();
  }

  function nextSpatialInstruction() {
    const task = state.spatialTasks[state.currentSpatialTaskIdx];
    const shapeName = SHAPES[task.shape].name;
    const posName = task.instruction;
    const text = '请把 【' + shapeName + '】 放在置物架的 【' + posName + '】';
    showQuestion('🧭', text, text, { autoSpeak: true, allowReplay: true });
  }

  function onToyClicked(toy, task) {
    if (toy.classList.contains('locked')) return;
    $$('.spatial-toy').forEach(t => t.classList.remove('selected'));
    if (state.selectedToy === toy) {
      state.selectedToy = null;
    } else {
      state.selectedToy = toy;
      toy.classList.add('selected');
      speak(SHAPES[task.shape].name);
    }
  }

  function onCellClicked(cell) {
    if (!state.selectedToy) return;
    if (cell.children.length > 0) return;
    const currentTask = state.spatialTasks[state.currentSpatialTaskIdx];
    checkSpatialPlacement(state.selectedToy, state.selectedToy.dataset.shape, cell, currentTask);
  }

  function checkSpatialPlacement(toy, toyShape, cell, currentTask) {
    const isRightToy = (toyShape === currentTask.shape);
    const isRightCell = (parseInt(cell.dataset.r, 10) === currentTask.pos.row && parseInt(cell.dataset.c, 10) === currentTask.pos.col);

    if (isRightToy && isRightCell) {
      speak('放对了！真能干！');
      mountSvgMarkup(cell, SHAPES[currentTask.shape].makeSvg(currentTask.color), { width: '75%', height: '75%' });
      cell.classList.add('animate-jelly');
      toy.remove();
      state.selectedToy = null;
      showFeedback(true);

      state.currentSpatialTaskIdx++;
      if (state.currentSpatialTaskIdx >= state.spatialTasks.length) {
        state.spatialRound++;
        if (state.spatialRound >= 3) {
          prepareSpatialLevel();
        } else {
          showQuestion('👏', '这一组摆放整齐啦！进入下一组～');
          scheduleAdvance(prepareSpatialLevel, 1600);
        }
      } else {
        scheduleAdvance(nextSpatialInstruction, 1000);
      }
    } else {
      if (!isRightToy) {
        speak('哎呀，那是别的图形，我们要放' + SHAPES[currentTask.shape].name);
      } else {
        speak('位置不对哦。它应该去' + currentTask.instruction);
      }
      toy.style.opacity = '1';
      showFeedback(false);
      cell.classList.add('animate-shake');
      setTimeout(() => cell.classList.remove('animate-shake'), 400);
    }
  }

  function findClosestShelfCell(cx, cy, tolerance = 24) {
    let bestCell = null;
    let minDistance = Infinity;

    $$('.shelf-cell').forEach(c => {
      const rect = c.getBoundingClientRect();
      const inBounds = (
        cx >= rect.left - tolerance &&
        cx <= rect.right + tolerance &&
        cy >= rect.top - tolerance &&
        cy <= rect.bottom + tolerance
      );
      if (inBounds) {
        const centerX = (rect.left + rect.right) / 2;
        const centerY = (rect.top + rect.bottom) / 2;
        const dist = Math.hypot(cx - centerX, cy - centerY);
        if (dist < minDistance) {
          minDistance = dist;
          bestCell = c;
        }
      }
    });

    return bestCell;
  }

  function setupSpatialDrag(toy, taskData, tray) {
    let isTracking = false;
    let isDragging = false;
    let sx = 0, sy = 0;
    let ghost = null;
    let hoveredCell = null;

    function clearCellHover() {
      if (hoveredCell) {
        hoveredCell.classList.remove('hover-target');
        hoveredCell = null;
      }
    }

    function onStart(e) {
      if (toy.classList.contains('locked')) return;
      isTracking = true;
      isDragging = false;
      const touch = e.touches ? e.touches[0] : e;
      sx = touch.clientX;
      sy = touch.clientY;

      document.addEventListener('mousemove', onMove);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchend', onEnd);
      document.addEventListener('touchcancel', onEnd);
    }

    function onMove(e) {
      if (!isTracking) return;
      const touch = e.touches ? e.touches[0] : e;
      const dx = touch.clientX - sx;
      const dy = touch.clientY - sy;

      if (!isDragging && Math.hypot(dx, dy) >= 3) {
        isDragging = true;
        ghost = toy.cloneNode(true);
        ghost.classList.add('dragging');
        const rect = toy.getBoundingClientRect();
        ghost.style.position = 'fixed';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.zIndex = '1000';
        ghost.style.pointerEvents = 'none';
        document.body.appendChild(ghost);
        toy.style.opacity = '0.2';
      }

      if (isDragging && ghost) {
        if (e.cancelable) e.preventDefault();
        ghost.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(1.15)`;

        // 实时高亮悬停的置物架目标格子
        const cell = findClosestShelfCell(touch.clientX, touch.clientY, 18);
        if (cell !== hoveredCell) {
          clearCellHover();
          if (cell) {
            cell.classList.add('hover-target');
            hoveredCell = cell;
          }
        }
      }
    }

    function onEnd(e) {
      if (!isTracking) return;
      isTracking = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);

      clearCellHover();

      if (!isDragging) {
        // 未发生明显拖拽时直接触发点击选中
        onToyClicked(toy, taskData);
        return;
      }

      isDragging = false;
      toy.style.opacity = '1';
      const touch = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : e;
      const cx = touch.clientX;
      const cy = touch.clientY;

      const droppedCell = findClosestShelfCell(cx, cy, 26);
      const currentTask = state.spatialTasks[state.currentSpatialTaskIdx];

      if (droppedCell) {
        checkSpatialPlacement(toy, taskData.shape, droppedCell, currentTask);
      }

      if (ghost) {
        ghost.remove();
        ghost = null;
      }
    }

    toy.addEventListener('mousedown', onStart);
    toy.addEventListener('touchstart', onStart, { passive: false });
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

    if (recognizeArea) recognizeArea.style.display = 'none';
    if (classifyArea) classifyArea.style.display = 'none';
    if (tangramArea) tangramArea.style.display = 'none';
    if (spatialArea) spatialArea.style.display = 'none';
    bottomActions.style.display = 'none';
    hideQuestion();

    if (shapeSubTabs) {
      shapeSubTabs.style.display = (mode === 'recognize') ? 'flex' : 'none';
    }

    switch (mode) {
      case 'recognize':
        if (recognizeArea) recognizeArea.style.display = '';
        enterRecognizeExplore();
        break;
      case 'spatial':
        if (spatialArea) spatialArea.style.display = '';
        enterSpatialExplore();
        break;
    }
  }

  // ====================================================
  //  初始化（保存并恢复上次点击的页签）
  // ====================================================
  function init() {
    $$('.mode-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        switchMode(mode);
        try { localStorage.setItem('shape_last_mode', mode); } catch (e) {}
      });
    });

    $$('.shape-sub-tab').forEach(subTab => {
      subTab.addEventListener('click', () => {
        const subType = subTab.dataset.subtype;
        state.recognizeSubType = subType;
        $$('.shape-sub-tab').forEach(s => s.classList.toggle('active', s.dataset.subtype === subType));
        enterRecognizeExplore();
      });
    });

    let savedMode = 'recognize';
    try {
      savedMode = localStorage.getItem('shape_last_mode') || 'recognize';
    } catch (e) {}

    if (!document.querySelector('.mode-tab[data-mode="' + savedMode + '"]')) {
      savedMode = 'recognize';
    }

    switchMode(savedMode);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PLANE_SHAPES,
      SOLID_SHAPES,
      SHAPES,
      TANGRAM_PUZZLES,
      TANGRAM_ROUNDS_PER_SESSION,
      buildTangramQueue,
      getSpatialInstruction,
    };
  }
})();
