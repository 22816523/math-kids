/* ============================================
   图形与几何 · 核心逻辑
   三种模式：辨认 / 分类 / 找一找
   ============================================ */

;(function () {
  'use strict';

  // ========== 柔和色板（低饱和马卡龙色） ==========
  const SOFT_COLORS = [
    '#E8B4B8', '#B4D4E8', '#E8D4B4', '#B4E8C8',
    '#D4B4E8', '#E8C8B4', '#B4E0E8', '#E8B4D4',
    '#C8E8B4', '#B4B4E8', '#E8E0B4', '#B4E8E0',
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
      addStar();
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

  function showQuestion(icon, text) {
    questionIcon.textContent = icon;
    questionText.textContent = text;
    questionBar.style.display = 'flex';
  }

  function hideQuestion() { questionBar.style.display = 'none'; }

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
        if (card.classList.contains('selected')) return;
        if (key === state.recTarget) {
          card.classList.add('selected');
          showFeedback(true);
          found++;
          if (found >= total) {
            state.recScore++;
            setTimeout(() => nextRecognizeQuestion(), 1400);
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
    showQuestion('👀', '找出所有的' + name + '（共' + total + '个）');
    speak('找出所有的' + name);
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

    showQuestion('🏠', '把图形拖到它的家里去');
    speak('把图形拖到它的家里去');
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
    dragItem.style.position = 'fixed';
    dragItem.style.left = (x - 40) + 'px';
    dragItem.style.top = (y - 40) + 'px';
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
            setTimeout(() => {
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
    state.practicing = false;
    state.findScene = 0;
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
    showQuestion('🔍', '找出' + scene.name + '里所有的' + name + '（共' + total + '个）');
    speak('找出所有的' + name);
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
        setTimeout(() => {
          // 下一个场景或完成
          state.findScene++;
          if (state.findScene < SCENES.length) {
            const next = SCENES[state.findScene];
            renderScene(next);
            showQuestion('🎉', '找到了！去' + next.name + '看看');
            showBottomAction('👉 下一个场景', () => startFindPractice());
          } else {
            showQuestion('🎉', '所有场景都找完了！');
            showCelebration();
            showBottomAction('🔄 再来一轮', () => {
              state.findScene = 0;
              renderScene(SCENES[0]);
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
  //  模式切换
  // ====================================================
  function switchMode(mode) {
    state.mode = mode;
    state.practicing = false;

    $$('.mode-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    recognizeArea.style.display = 'none';
    classifyArea.style.display = 'none';
    findArea.style.display = 'none';
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
})();
