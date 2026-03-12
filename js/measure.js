/* ============================================
   常见的量 · 核心逻辑
   三种模式：钟表 / 人民币 / 比较
   ============================================ */

(function () {
  'use strict';

  /* ---------- DOM ---------- */
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const starCountEl    = $('#starCount');
  const questionBar    = $('#questionBar');
  const questionIcon   = $('#questionIcon');
  const questionText   = $('#questionText');
  const feedbackOverlay = $('#feedbackOverlay');
  const feedbackEmoji  = $('#feedbackEmoji');
  const feedbackText   = $('#feedbackText');
  const confettiBox    = $('#confettiContainer');
  const bottomActions  = $('#bottomActions');
  const actionBtn      = $('#actionBtn');

  // 钟表
  const clockArea    = $('#clockArea');
  const clockSvg     = $('#clockSvg');
  const digitalClock = $('#digitalClock');
  const clockOptions = $('#clockOptions');

  // 人民币
  const moneyArea   = $('#moneyArea');
  const shopShelf   = $('#shopShelf');
  const payPrompt   = $('#payPrompt');
  const payText     = $('#payText');
  const wallet      = $('#wallet');
  const cashierTray = $('#cashierTray');
  const cashier     = $('#cashier');
  const paidTotal   = $('#paidTotal');

  // 比较
  const compareArea    = $('#compareArea');
  const compareScene   = $('#compareScene');
  const compareOptions = $('#compareOptions');

  /* ---------- 状态 ---------- */
  const state = {
    mode: 'clock',
    stars: 0,
    practicing: false,
    // 钟表
    clockHour: 3,
    clockMinute: 0,
    clockAnswer: null,
    clockRound: 0,
    // 人民币
    chosenItem: null,
    paidCoins: [],
    targetPrice: 0,
    moneyRound: 0,
    // 比较
    compareType: null,  // 'length' | 'height' | 'weight'
    compareAnswer: null,
    compareRound: 0,
  };

  /* ---------- TTS ---------- */
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.2;
    speechSynthesis.speak(u);
  }

  /* ---------- 工具函数 ---------- */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function addStar(n) {
    state.stars += n;
    starCountEl.textContent = state.stars;
    starCountEl.style.animation = 'none';
    void starCountEl.offsetWidth;
    starCountEl.style.animation = 'bounceIn 0.4s ease-out';
  }

  /* ---------- 反馈 ---------- */
  function showFeedback(emoji, text, duration) {
    feedbackEmoji.textContent = emoji;
    feedbackText.textContent = text;
    feedbackOverlay.style.display = 'flex';
    speak(text);
    setTimeout(() => { feedbackOverlay.style.display = 'none'; }, duration || 1500);
  }

  function showConfetti() {
    confettiBox.innerHTML = '';
    const colors = ['#FF8A8A','#7BC8F6','#FFD166','#6BCB77','#C89CF2','#FFA36C'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + '%';
      p.style.width = randInt(6, 12) + 'px';
      p.style.height = randInt(6, 12) + 'px';
      p.style.background = pick(colors);
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.animationDelay = Math.random() * 0.8 + 's';
      confettiBox.appendChild(p);
    }
    setTimeout(() => { confettiBox.innerHTML = ''; }, 3500);
  }

  /* ---------- 模式切换 ---------- */
  $$('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.mode = tab.dataset.mode;
      switchMode();
    });
  });

  function switchMode() {
    clockArea.style.display = 'none';
    moneyArea.style.display = 'none';
    compareArea.style.display = 'none';
    questionBar.style.display = 'none';
    bottomActions.style.display = 'none';
    state.practicing = false;

    if (state.mode === 'clock') {
      clockArea.style.display = 'flex';
      initClock();
    } else if (state.mode === 'money') {
      moneyArea.style.display = 'flex';
      initMoney();
    } else {
      compareArea.style.display = 'flex';
      initCompare();
    }
  }

  /* ====================================================
     钟表模式
     ==================================================== */

  function drawClockFace(hour, minute) {
    const cx = 150, cy = 150, r = 130;

    let svg = '';
    // 表盘背景
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFF9E6" stroke="#FFD166" stroke-width="4"/>`;

    // 刻度 + 数字
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      // 刻度线
      const x1 = cx + (r - 8) * Math.cos(angle);
      const y1 = cy + (r - 8) * Math.sin(angle);
      const x2 = cx + (r - 20) * Math.cos(angle);
      const y2 = cy + (r - 20) * Math.sin(angle);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#CCA050" stroke-width="3" stroke-linecap="round"/>`;
      // 数字
      const nx = cx + (r - 36) * Math.cos(angle);
      const ny = cy + (r - 36) * Math.sin(angle);
      svg += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="800" fill="#7A5C00" font-family="Nunito, sans-serif">${i}</text>`;
    }

    // 小刻度
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const angle = (i * 6 - 90) * Math.PI / 180;
      const x1 = cx + (r - 8) * Math.cos(angle);
      const y1 = cy + (r - 8) * Math.sin(angle);
      const x2 = cx + (r - 14) * Math.cos(angle);
      const y2 = cy + (r - 14) * Math.sin(angle);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E5C888" stroke-width="1.5" stroke-linecap="round"/>`;
    }

    // 时针
    const hAngle = ((hour % 12) * 30 + minute * 0.5 - 90) * Math.PI / 180;
    const hx = cx + 60 * Math.cos(hAngle);
    const hy = cy + 60 * Math.sin(hAngle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#4B4B4B" stroke-width="6" stroke-linecap="round"/>`;

    // 分针
    const mAngle = (minute * 6 - 90) * Math.PI / 180;
    const mx = cx + 90 * Math.cos(mAngle);
    const my = cy + 90 * Math.sin(mAngle);
    svg += `<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="#1CB0F6" stroke-width="4" stroke-linecap="round"/>`;

    // 中心圆
    svg += `<circle cx="${cx}" cy="${cy}" r="6" fill="#FF4B4B"/>`;

    clockSvg.innerHTML = svg;

    // 数字时钟
    const hStr = String(hour).padStart(2, '0');
    const mStr = String(minute).padStart(2, '0');
    digitalClock.textContent = hStr + ':' + mStr;
  }

  function initClock() {
    state.clockRound = 0;
    state.practicing = false;
    // 展示模式：显示当前时间
    const now = new Date();
    state.clockHour = now.getHours() % 12 || 12;
    state.clockMinute = 0;
    drawClockFace(state.clockHour, state.clockMinute);
    clockOptions.innerHTML = '';
    bottomActions.style.display = 'flex';
    actionBtn.textContent = '🎯 开始练习';
    actionBtn.onclick = startClockPractice;
    showQuestion('🕐', '拨一拨，认识钟表');
  }

  function startClockPractice() {
    state.practicing = true;
    state.clockRound = 0;
    bottomActions.style.display = 'none';
    nextClockQuestion();
  }

  function nextClockQuestion() {
    state.clockRound++;
    if (state.clockRound > 8) {
      showFeedback('🎉', '太棒了，全部答对！', 2000);
      showConfetti();
      addStar(3);
      setTimeout(initClock, 2500);
      return;
    }

    // 随机生成整点或半点
    const isHalf = Math.random() > 0.5;
    const hour = randInt(1, 12);
    const minute = isHalf ? 30 : 0;
    state.clockAnswer = { hour, minute };

    drawClockFace(hour, minute);

    const timeStr = minute === 0 ? `${hour}点整` : `${hour}点半`;
    showQuestion('🎯', `第${state.clockRound}题：现在是几点？`);

    // 生成3个选项
    const correct = timeStr;
    const options = new Set([correct]);
    while (options.size < 3) {
      const fakeH = randInt(1, 12);
      const fakeM = Math.random() > 0.5 ? 30 : 0;
      const fakeStr = fakeM === 0 ? `${fakeH}点整` : `${fakeH}点半`;
      if (fakeStr !== correct) options.add(fakeStr);
    }

    const icons = ['🕐', '🕑', '🕒'];
    const shuffled = shuffle([...options]);
    clockOptions.innerHTML = '';
    shuffled.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'clock-option';
      div.innerHTML = `<span class="clock-option-icon">${icons[i]}</span><span class="clock-option-text">${opt}</span>`;
      div.addEventListener('click', () => handleClockAnswer(div, opt, correct));
      clockOptions.appendChild(div);
    });
  }

  function handleClockAnswer(el, chosen, correct) {
    if (el.classList.contains('selected')) return;
    if (chosen === correct) {
      el.classList.add('selected');
      addStar(1);
      showFeedback('🎉', '答对了！' + correct, 1200);
      setTimeout(nextClockQuestion, 1500);
    } else {
      el.classList.add('wrong');
      showFeedback('🤔', '再想想哦', 800);
      setTimeout(() => el.classList.remove('wrong'), 500);
    }
  }

  /* ====================================================
     人民币模式
     ==================================================== */

  const SHOP_ITEMS = [
    { icon: '🍎', name: '苹果', price: 1 },
    { icon: '🍌', name: '香蕉', price: 2 },
    { icon: '🧃', name: '果汁', price: 3 },
    { icon: '🍪', name: '饼干', price: 5 },
    { icon: '🍦', name: '冰淇淋', price: 4 },
    { icon: '🎈', name: '气球', price: 2 },
    { icon: '✏️', name: '铅笔', price: 1 },
    { icon: '📒', name: '本子', price: 3 },
    { icon: '🧸', name: '玩具熊', price: 8 },
    { icon: '🖍️', name: '蜡笔', price: 6 },
  ];

  const COIN_TYPES = [
    { value: 10, label: '10元', cls: 'coin-10' },
    { value: 5,  label: '5元',  cls: 'coin-5' },
    { value: 1,  label: '1元',  cls: 'coin-1' },
    { value: 1,  label: '1元',  cls: 'coin-1' },
    { value: 1,  label: '1元',  cls: 'coin-1' },
    { value: 1,  label: '1元',  cls: 'coin-1' },
    { value: 1,  label: '1元',  cls: 'coin-1' },
  ];

  function initMoney() {
    state.moneyRound = 0;
    state.practicing = false;
    state.chosenItem = null;
    state.paidCoins = [];

    // 展示商品
    renderShop();
    payPrompt.style.display = 'none';
    wallet.innerHTML = '';
    cashierTray.innerHTML = '';
    paidTotal.textContent = '0';

    showQuestion('💰', '点一个商品，试试付钱吧');
    bottomActions.style.display = 'none';
  }

  function renderShop() {
    const items = shuffle(SHOP_ITEMS).slice(0, 6);
    shopShelf.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'shop-item';
      div.innerHTML = `<span class="shop-item-icon">${item.icon}</span><span class="shop-item-price">${item.price}元</span>`;
      div.addEventListener('click', () => chooseItem(item, div));
      shopShelf.appendChild(div);
    });
  }

  function chooseItem(item, el) {
    if (state.chosenItem) return; // 已选
    state.chosenItem = item;
    state.targetPrice = item.price;
    state.paidCoins = [];
    el.classList.add('chosen');

    payPrompt.style.display = 'flex';
    payText.textContent = `买${item.icon}${item.name}，需要付 ${item.price} 元`;
    speak(`买${item.name}，需要付${item.price}元`);

    showQuestion('💰', `请付 ${item.price} 元`);
    renderWallet();
    cashierTray.innerHTML = '';
    paidTotal.textContent = '0';
  }

  function renderWallet() {
    wallet.innerHTML = '';
    // 根据价格给合理的钱币
    const coins = [];
    if (state.targetPrice >= 5) coins.push({ value: 10, label: '10元', cls: 'coin-10' });
    coins.push({ value: 5, label: '5元', cls: 'coin-5' });
    for (let i = 0; i < 5; i++) coins.push({ value: 1, label: '1元', cls: 'coin-1' });

    coins.forEach((c, idx) => {
      const div = document.createElement('div');
      div.className = 'coin ' + c.cls;
      div.textContent = c.label;
      div.dataset.value = c.value;
      div.dataset.idx = idx;
      // 点击付钱
      div.addEventListener('click', () => payCoin(div, c));
      wallet.appendChild(div);
    });
  }

  function payCoin(el, coin) {
    if (el.classList.contains('used')) return;
    el.classList.add('used');
    state.paidCoins.push(coin.value);

    // 收银台显示
    const mini = document.createElement('div');
    mini.className = 'coin ' + coin.cls;
    mini.textContent = coin.label;
    // 点击退回
    mini.addEventListener('click', () => {
      state.paidCoins.splice(state.paidCoins.indexOf(coin.value), 1);
      mini.remove();
      el.classList.remove('used');
      updatePaid();
    });
    cashierTray.appendChild(mini);

    updatePaid();
  }

  function updatePaid() {
    const total = state.paidCoins.reduce((s, v) => s + v, 0);
    paidTotal.textContent = total;

    if (total === state.targetPrice) {
      // 刚好
      showFeedback('🎉', '刚刚好，谢谢你！', 1500);
      addStar(2);
      state.moneyRound++;
      if (state.moneyRound >= 5) {
        setTimeout(() => {
          showFeedback('🏆', '购物高手！', 2000);
          showConfetti();
          addStar(3);
          setTimeout(initMoney, 2500);
        }, 1600);
      } else {
        setTimeout(resetMoneyRound, 1800);
      }
    } else if (total > state.targetPrice) {
      showFeedback('🤔', '钱给多了，点收银台的钱可以拿回哦', 1500);
      speak('钱给多了，能拿回一些吗');
    }
  }

  function resetMoneyRound() {
    state.chosenItem = null;
    state.paidCoins = [];
    $$('.shop-item').forEach(el => el.classList.remove('chosen'));
    payPrompt.style.display = 'none';
    wallet.innerHTML = '';
    cashierTray.innerHTML = '';
    paidTotal.textContent = '0';
    showQuestion('💰', '再选一个商品吧');
    renderShop();
  }

  /* ====================================================
     比较模式
     ==================================================== */

  const COMPARE_QUESTIONS = {
    length: [
      { a: { label: '红铅笔', len: 180, color: '#FF8A8A' }, b: { label: '蓝铅笔', len: 120, color: '#7BC8F6' }, answer: 'a', q: '哪支铅笔更长？' },
      { a: { label: '绿铅笔', len: 100, color: '#6BCB77' }, b: { label: '紫铅笔', len: 160, color: '#C89CF2' }, answer: 'b', q: '哪支铅笔更长？' },
      { a: { label: '橙铅笔', len: 140, color: '#FFA36C' }, b: { label: '粉铅笔', len: 140, color: '#F28CB1' }, answer: 'same', q: '哪支铅笔更长？' },
    ],
    height: [
      { a: { emoji: '🦒', label: '长颈鹿', size: 80 }, b: { emoji: '🐱', label: '小猫', size: 40 }, answer: 'a', q: '谁更高？' },
      { a: { emoji: '🐭', label: '小老鼠', size: 32 }, b: { emoji: '🐘', label: '大象', size: 88 }, answer: 'b', q: '谁更高？' },
      { a: { emoji: '🐕', label: '小狗', size: 48 }, b: { emoji: '🐈', label: '小猫', size: 44 }, answer: 'a', q: '谁更高？' },
    ],
    weight: [
      { a: { emoji: '🍉', label: '西瓜' }, b: { emoji: '🍓', label: '草莓' }, answer: 'a', q: '谁更重？', tilt: -12 },
      { a: { emoji: '🪶', label: '羽毛' }, b: { emoji: '🧱', label: '砖头' }, answer: 'b', q: '谁更重？', tilt: 12 },
      { a: { emoji: '🎾', label: '网球' }, b: { emoji: '🏀', label: '篮球' }, answer: 'b', q: '谁更重？', tilt: 8 },
    ],
  };

  function initCompare() {
    state.compareRound = 0;
    state.practicing = false;
    bottomActions.style.display = 'flex';
    actionBtn.textContent = '🎯 开始练习';
    actionBtn.onclick = startComparePractice;
    compareScene.innerHTML = '<div style="font-size:64px;text-align:center;width:100%;padding:40px 0;">⚖️</div>';
    compareOptions.innerHTML = '';
    showQuestion('⚖️', '比一比，谁更长、更高、更重');
  }

  function startComparePractice() {
    state.practicing = true;
    state.compareRound = 0;
    bottomActions.style.display = 'none';
    nextCompareQuestion();
  }

  function nextCompareQuestion() {
    state.compareRound++;
    if (state.compareRound > 6) {
      showFeedback('🎉', '比较大师！', 2000);
      showConfetti();
      addStar(3);
      setTimeout(initCompare, 2500);
      return;
    }

    // 轮流出题：长短 → 高矮 → 轻重
    const types = ['length', 'height', 'weight'];
    const type = types[(state.compareRound - 1) % 3];
    state.compareType = type;
    const pool = COMPARE_QUESTIONS[type];
    const q = pool[(state.compareRound - 1) % pool.length];
    state.compareAnswer = q.answer;

    showQuestion('⚖️', `第${state.compareRound}题：${q.q}`);

    // 渲染场景
    if (type === 'length') renderLengthScene(q);
    else if (type === 'height') renderHeightScene(q);
    else renderWeightScene(q);

    // 渲染选项
    renderCompareOptions(q);
  }

  function renderLengthScene(q) {
    compareScene.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:700;width:60px;text-align:right;">${q.a.label}</span>
          <div class="pencil" style="width:${q.a.len}px;background:${q.a.color};border-left-color:${q.a.color};">&nbsp;</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:700;width:60px;text-align:right;">${q.b.label}</span>
          <div class="pencil" style="width:${q.b.len}px;background:${q.b.color};border-left-color:${q.b.color};">&nbsp;</div>
        </div>
      </div>`;
  }

  function renderHeightScene(q) {
    compareScene.innerHTML = `
      <div class="animal-item">
        <span class="animal-body" style="font-size:${q.a.size}px;">${q.a.emoji}</span>
        <span class="animal-label">${q.a.label}</span>
      </div>
      <div class="animal-item">
        <span class="animal-body" style="font-size:${q.b.size}px;">${q.b.emoji}</span>
        <span class="animal-label">${q.b.label}</span>
      </div>`;
  }

  function renderWeightScene(q) {
    const tilt = q.tilt || 0;
    compareScene.innerHTML = `
      <div class="scale-container">
        <div class="scale-beam" style="transform:rotate(${tilt}deg);">
          <div class="scale-pan scale-pan-left">
            <div class="scale-pan-items">${q.a.emoji}</div>
            <div class="scale-pan-plate"></div>
          </div>
          <div class="scale-pan scale-pan-right">
            <div class="scale-pan-items">${q.b.emoji}</div>
            <div class="scale-pan-plate"></div>
          </div>
        </div>
        <div class="scale-pillar"></div>
        <div class="scale-base"></div>
      </div>`;
  }

  function renderCompareOptions(q) {
    compareOptions.innerHTML = '';
    const opts = [
      { key: 'a', icon: q.a.emoji || '🅰️', text: q.a.label },
      { key: 'b', icon: q.b.emoji || '🅱️', text: q.b.label },
    ];
    if (q.answer === 'same' || q.a.len === q.b?.len) {
      opts.push({ key: 'same', icon: '🤝', text: '一样' });
    }

    opts.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'compare-option';
      div.innerHTML = `<span class="compare-option-icon">${opt.icon}</span><span class="compare-option-text">${opt.text}</span>`;
      div.addEventListener('click', () => handleCompareAnswer(div, opt.key));
      compareOptions.appendChild(div);
    });
  }

  function handleCompareAnswer(el, key) {
    if (el.classList.contains('selected')) return;
    if (key === state.compareAnswer) {
      el.classList.add('selected');
      addStar(1);
      showFeedback('🎉', '答对了！', 1200);
      setTimeout(nextCompareQuestion, 1500);
    } else {
      el.classList.add('wrong');
      showFeedback('🤔', '再看看哦', 800);
      setTimeout(() => el.classList.remove('wrong'), 500);
    }
  }

  /* ---------- 提示栏 ---------- */
  function showQuestion(icon, text) {
    questionIcon.textContent = icon;
    questionText.textContent = text;
    questionBar.style.display = 'flex';
  }

  /* ---------- 初始化 ---------- */
  switchMode();

})();
