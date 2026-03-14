/* ============================================
   常见的量 · 核心逻辑
   钟表（可拖动）/ 人民币（含角）/ 比较（扩充题库）
   ============================================ */

(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const starCountEl = $('#starCount');
  const questionBar = $('#questionBar');
  const questionIcon = $('#questionIcon');
  const questionText = $('#questionText');
  const questionSpeaker = $('#questionSpeaker');
  const feedbackOverlay = $('#feedbackOverlay');
  const feedbackEmoji = $('#feedbackEmoji');
  const feedbackText = $('#feedbackText');
  const confettiBox = $('#confettiContainer');
  const bottomActions = $('#bottomActions');
  const actionBtn = $('#actionBtn');

  const clockArea = $('#clockArea');
  const clockSvg = $('#clockSvg');
  const digitalClock = $('#digitalClock');
  const clockOptions = $('#clockOptions');

  const moneyArea = $('#moneyArea');
  const shopShelf = $('#shopShelf');
  const payPrompt = $('#payPrompt');
  const payText = $('#payText');
  const wallet = $('#wallet');
  const cashierTray = $('#cashierTray');
  const cashier = $('#cashier');
  const paidTotal = $('#paidTotal');

  const compareArea = $('#compareArea');
  const compareScene = $('#compareScene');
  const compareOptions = $('#compareOptions');

  const lengthArea = $('#lengthArea');
  const rulerContainer = $('#rulerContainer');
  const lengthOptions = $('#lengthOptions');

  const weightArea = $('#weightArea');
  const scaleDisplay = $('#scaleDisplay');
  const weightOptions = $('#weightOptions');

  const state = {
    mode: 'clock',
    stars: 0,
    clockHour: 3,
    clockMinute: 0,
    clockDragging: false,
    clockMode: 'explore',
    clockRound: 0,
    clockAnswer: null,
    chosenItem: null,
    paidCoins: [],
    targetPrice: 0,
    moneyRound: 0,
    compareType: null,
    compareAnswer: null,
    compareRound: 0,
    lengthAnswer: null,
    lengthRound: 0,
    weightAnswer: null,
    weightRound: 0,
  };

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN'; u.rate = 0.85; u.pitch = 1.2;
    speechSynthesis.speak(u);
  }

  const promptController = window.PracticeSupport.createPromptController({
    questionBar,
    questionIcon,
    questionText,
    speakerButton: questionSpeaker,
    speak,
  });

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

  function showQuestion(icon, text, speechText, options) {
    promptController.showPrompt(icon, text, {
      speechText: speechText ?? text,
      autoSpeak: options?.autoSpeak !== false,
      allowReplay: options?.allowReplay !== false,
    });
  }

  function scheduleAdvance(callback, delay) {
    clearTimeout(state._advanceTimer);
    state._advanceTimer = setTimeout(callback, delay);
  }

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
    lengthArea.style.display = 'none';
    weightArea.style.display = 'none';
    promptController.hidePrompt();
    bottomActions.style.display = 'none';
    clearTimeout(state._advanceTimer);

    if (state.mode === 'clock') {
      clockArea.style.display = 'flex';
      initClock();
    } else if (state.mode === 'money') {
      moneyArea.style.display = 'flex';
      initMoney();
    } else if (state.mode === 'compare') {
      compareArea.style.display = 'flex';
      initCompare();
    } else if (state.mode === 'length') {
      lengthArea.style.display = 'flex';
      initLength();
    } else if (state.mode === 'weight') {
      weightArea.style.display = 'flex';
      initWeight();
    }
  }

  /* ========== 钟表模式 ========== */

  function drawClockFace(hour, minute, draggable) {
    const cx = 150, cy = 150, r = 130;
    let svg = '<circle cx="150" cy="150" r="130" fill="#FFF9E6" stroke="#FFD166" stroke-width="4"/>';
    
    for (let i = 1; i <= 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const x1 = cx + (r - 8) * Math.cos(angle);
      const y1 = cy + (r - 8) * Math.sin(angle);
      const x2 = cx + (r - 20) * Math.cos(angle);
      const y2 = cy + (r - 20) * Math.sin(angle);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#CCA050" stroke-width="3" stroke-linecap="round"/>`;
      const nx = cx + (r - 36) * Math.cos(angle);
      const ny = cy + (r - 36) * Math.sin(angle);
      svg += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="22" font-weight="800" fill="#7A5C00" font-family="Nunito">${i}</text>`;
    }

    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const angle = (i * 6 - 90) * Math.PI / 180;
      const x1 = cx + (r - 8) * Math.cos(angle);
      const y1 = cy + (r - 8) * Math.sin(angle);
      const x2 = cx + (r - 14) * Math.cos(angle);
      const y2 = cy + (r - 14) * Math.sin(angle);
      svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#E5C888" stroke-width="1.5" stroke-linecap="round"/>`;
    }

    const hAngle = ((hour % 12) * 30 + minute * 0.5 - 90) * Math.PI / 180;
    const hx = cx + 60 * Math.cos(hAngle);
    const hy = cy + 60 * Math.sin(hAngle);
    svg += `<line x1="150" y1="150" x2="${hx}" y2="${hy}" stroke="#4B4B4B" stroke-width="6" stroke-linecap="round"/>`;

    const mAngle = (minute * 6 - 90) * Math.PI / 180;
    const mx = cx + 90 * Math.cos(mAngle);
    const my = cy + 90 * Math.sin(mAngle);
    svg += `<line x1="150" y1="150" x2="${mx}" y2="${my}" stroke="#1CB0F6" stroke-width="4" stroke-linecap="round"/>`;
    
    if (draggable) {
      svg += `<circle cx="${mx}" cy="${my}" r="16" fill="#1CB0F6" fill-opacity="0.3" stroke="#1CB0F6" stroke-width="2" style="cursor:grab;" id="minuteHandle"/>`;
    }

    svg += '<circle cx="150" cy="150" r="6" fill="#FF4B4B"/>';
    clockSvg.innerHTML = svg;

    if (draggable) {
      const handle = document.getElementById('minuteHandle');
      handle.addEventListener('mousedown', startDrag);
      handle.addEventListener('touchstart', startDrag);
    }

    digitalClock.textContent = String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  }

  function startDrag(e) {
    e.preventDefault();
    state.clockDragging = true;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', onDrag);
    document.addEventListener('touchend', stopDrag);
  }

  function onDrag(e) {
    if (!state.clockDragging) return;
    const rect = clockSvg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    state.clockMinute = Math.round(angle / 6) % 60;
    state.clockHour = Math.floor((state.clockHour % 12) + state.clockMinute / 60);
    if (state.clockHour === 0) state.clockHour = 12;
    drawClockFace(state.clockHour, state.clockMinute, true);
  }

  function stopDrag() {
    state.clockDragging = false;
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', onDrag);
    document.removeEventListener('touchend', stopDrag);
  }

  function initClock() {
    state.clockMode = 'explore';
    state.clockRound = 0;
    const now = new Date();
    state.clockHour = now.getHours() % 12 || 12;
    state.clockMinute = 0;
    drawClockFace(state.clockHour, state.clockMinute, true);
    digitalClock.style.display = 'block';
    clockOptions.innerHTML = '';
    bottomActions.style.display = 'flex';
    actionBtn.textContent = '🎯 开始练习';
    actionBtn.onclick = startClockPractice;
    showQuestion('🕐', '拖动蓝色分针，看时针怎么动');
  }

  function startClockPractice() {
    state.clockMode = 'practice';
    state.clockRound = 0;
    bottomActions.style.display = 'none';
    nextClockQuestion();
  }

  function nextClockQuestion() {
    state.clockRound++;
    if (state.clockRound > 12) {
      showFeedback('🎉', '时间大师！', 2000);
      showConfetti();
      addStar(3);
      setTimeout(initClock, 2500);
      return;
    }

    const types = [0, 30, 15, 45];
    const minute = types[state.clockRound % 4];
    const hour = randInt(1, 12);
    state.clockAnswer = { hour, minute };
    drawClockFace(hour, minute, false);
    digitalClock.style.display = 'none';

    const timeStr = minute === 0 ? `${hour}点整` : minute === 30 ? `${hour}点半` : minute === 15 ? `${hour}点15分` : `${hour}点45分`;
    showQuestion('🎯', `第${state.clockRound}题：现在是几点？`, `第${state.clockRound}题，现在是几点？`);

    const correct = timeStr;
    const options = new Set([correct]);
    while (options.size < 3) {
      const fH = randInt(1, 12);
      const fM = pick(types);
      const fStr = fM === 0 ? `${fH}点整` : fM === 30 ? `${fH}点半` : fM === 15 ? `${fH}点15分` : `${fH}点45分`;
      if (fStr !== correct) options.add(fStr);
    }

    const icons = ['🕐', '🕑', '🕒'];
    clockOptions.innerHTML = '';
    shuffle([...options]).forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'clock-option';
      div.innerHTML = `<span class="clock-option-icon">${icons[i]}</span><span class="clock-option-text">${opt}</span>`;
      div.onclick = () => {
        if (state.clockAnswer === null) return;
        if (div.classList.contains('selected')) return;
        if (opt === correct) {
          div.classList.add('selected');
          addStar(1);
          showFeedback('🎉', '答对了！' + correct, 1200);
          state.clockAnswer = null;
          scheduleAdvance(nextClockQuestion, 1500);
        } else {
          div.classList.add('wrong');
          showFeedback('🤔', '再想想', 800);
          setTimeout(() => div.classList.remove('wrong'), 500);
        }
      };
      clockOptions.appendChild(div);
    });
  }

  /* ========== 人民币模式 ========== */

  const SHOP_ITEMS = [
    { icon: '🍎', name: '苹果', price: 1.5 },
    { icon: '🍌', name: '香蕉', price: 2.0 },
    { icon: '🧃', name: '果汁', price: 3.5 },
    { icon: '🍪', name: '饼干', price: 5.0 },
    { icon: '🍦', name: '冰淇淋', price: 4.5 },
    { icon: '🎈', name: '气球', price: 2.5 },
    { icon: '✏️', name: '铅笔', price: 1.0 },
    { icon: '📒', name: '本子', price: 3.0 },
    { icon: '🧸', name: '玩具熊', price: 12.5 },
    { icon: '🖍️', name: '蜡笔', price: 6.5 },
    { icon: '🍭', name: '棒棒糖', price: 0.5 },
    { icon: '🥤', name: '可乐', price: 2.5 },
    { icon: '🍿', name: '爆米花', price: 4.0 },
    { icon: '🎨', name: '水彩笔', price: 9.5 },
    { icon: '🚗', name: '玩具车', price: 15.0 },
    { icon: '📚', name: '故事书', price: 11.5 },
    { icon: '🎮', name: '游戏机', price: 18.0 },
    { icon: '🎒', name: '书包', price: 25.0 },
    { icon: '👟', name: '运动鞋', price: 35.0 },
    { icon: '🏀', name: '篮球', price: 28.0 },
    { icon: '🎧', name: '耳机', price: 45.0 },
    { icon: '⚽', name: '足球', price: 32.0 },
    { icon: '🛴', name: '滑板车', price: 68.0 },
    { icon: '🎸', name: '玩具吉他', price: 55.0 },
    { icon: '🚲', name: '自行车', price: 88.0 },
  ];

  function initMoney() {
    state.moneyRound = 0;
    state.chosenItem = null;
    state.paidCoins = [];
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
      div.onclick = () => chooseItem(item, div);
      shopShelf.appendChild(div);
    });
  }

  function chooseItem(item, el) {
    if (state.chosenItem) return;
    state.chosenItem = item;
    state.targetPrice = item.price;
    state.paidCoins = [];
    el.classList.add('chosen');
    payPrompt.style.display = 'flex';
    payText.textContent = `买${item.icon}${item.name}，需要付 ${item.price} 元`;
    showQuestion('💰', `请付 ${item.price} 元`, `买${item.name}，需要付${item.price}元`);
    renderWallet();
    cashierTray.innerHTML = '';
    paidTotal.textContent = '0';
  }

  function renderWallet() {
    wallet.innerHTML = '';
    const coins = [];
    if (state.targetPrice >= 50) coins.push({ value: 100, label: '100元', cls: 'coin-100' });
    if (state.targetPrice >= 30) coins.push({ value: 50, label: '50元', cls: 'coin-50' });
    if (state.targetPrice >= 15) coins.push({ value: 20, label: '20元', cls: 'coin-20' });
    if (state.targetPrice >= 5) coins.push({ value: 10, label: '10元', cls: 'coin-10' });
    coins.push({ value: 5, label: '5元', cls: 'coin-5' });
    coins.push({ value: 1, label: '1元', cls: 'coin-1' });
    coins.push({ value: 0.5, label: '5角', cls: 'coin-05' });
    coins.push({ value: 0.1, label: '1角', cls: 'coin-01' });

    coins.forEach((c, idx) => {
      const div = document.createElement('div');
      div.className = 'coin ' + c.cls;
      div.textContent = c.label;
      div.dataset.value = c.value;
      div.dataset.idx = idx;
      div.onclick = () => payCoin(div, c);
      wallet.appendChild(div);
    });
  }

  function payCoin(el, coin) {
    state.paidCoins.push(coin.value);
    const mini = document.createElement('div');
    mini.className = 'coin ' + coin.cls;
    mini.textContent = coin.label;
    mini.onclick = () => {
      state.paidCoins.splice(state.paidCoins.indexOf(coin.value), 1);
      mini.remove();
      updatePaid();
    };
    cashierTray.appendChild(mini);
    updatePaid();
  }

  function updatePaid() {
    const total = Math.round(state.paidCoins.reduce((s, v) => s + v, 0) * 10) / 10;
    paidTotal.textContent = total;

    if (Math.abs(total - state.targetPrice) < 0.01) {
      showFeedback('🎉', '刚刚好，谢谢你！', 1500);
      addStar(2);
      state.moneyRound++;
      if (state.moneyRound >= 6) {
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

  /* ========== 比较模式 ========== */

  const COMPARE_QUESTIONS = {
    length: [
      { a: { label: '红铅笔', len: 180, color: '#FF8A8A' }, b: { label: '蓝铅笔', len: 120, color: '#7BC8F6' }, answer: 'a', q: '哪支铅笔更长？' },
      { a: { label: '绿铅笔', len: 100, color: '#6BCB77' }, b: { label: '紫铅笔', len: 160, color: '#C89CF2' }, answer: 'b', q: '哪支铅笔更长？' },
      { a: { label: '橙铅笔', len: 140, color: '#FFA36C' }, b: { label: '粉铅笔', len: 140, color: '#F28CB1' }, answer: 'same', q: '哪支铅笔更长？' },
      { a: { label: '黄铅笔', len: 200, color: '#FFD166' }, b: { label: '青铅笔', len: 110, color: '#6CD4DB' }, answer: 'a', q: '哪支铅笔更长？' },
      { a: { label: '灰铅笔', len: 90, color: '#AAAAAA' }, b: { label: '棕铅笔', len: 170, color: '#C89C6C' }, answer: 'b', q: '哪支铅笔更长？' },
      { a: { label: '白铅笔', len: 150, color: '#E5E5E5' }, b: { label: '黑铅笔', len: 130, color: '#4B4B4B' }, answer: 'a', q: '哪支铅笔更长？' },
      { a: { label: '金铅笔', len: 120, color: '#FFD700' }, b: { label: '银铅笔', len: 180, color: '#C0C0C0' }, answer: 'b', q: '哪支铅笔更长？' },
      { a: { label: '玫红铅笔', len: 160, color: '#FF69B4' }, b: { label: '天蓝铅笔', len: 160, color: '#87CEEB' }, answer: 'same', q: '哪支铅笔更长？' },
    ],
    height: [
      { a: { emoji: '🦒', label: '长颈鹿', size: 80 }, b: { emoji: '🐱', label: '小猫', size: 40 }, answer: 'a', q: '谁更高？' },
      { a: { emoji: '🐭', label: '小老鼠', size: 32 }, b: { emoji: '🐘', label: '大象', size: 88 }, answer: 'b', q: '谁更高？' },
      { a: { emoji: '🐕', label: '小狗', size: 48 }, b: { emoji: '🐈', label: '小猫', size: 44 }, answer: 'a', q: '谁更高？' },
      { a: { emoji: '🐰', label: '兔子', size: 42 }, b: { emoji: '🦘', label: '袋鼠', size: 72 }, answer: 'b', q: '谁更高？' },
      { a: { emoji: '🐻', label: '熊', size: 76 }, b: { emoji: '🐿️', label: '松鼠', size: 36 }, answer: 'a', q: '谁更高？' },
      { a: { emoji: '🐧', label: '企鹅', size: 50 }, b: { emoji: '🦆', label: '鸭子', size: 50 }, answer: 'same', q: '谁更高？' },
      { a: { emoji: '🦌', label: '鹿', size: 70 }, b: { emoji: '🐑', label: '羊', size: 52 }, answer: 'a', q: '谁更高？' },
      { a: { emoji: '🐢', label: '乌龟', size: 38 }, b: { emoji: '🦎', label: '蜥蜴', size: 40 }, answer: 'b', q: '谁更高？' },
    ],
    weight: [
      { a: { emoji: '🍉', label: '西瓜' }, b: { emoji: '🍓', label: '草莓' }, answer: 'a', q: '谁更重？', tilt: -12 },
      { a: { emoji: '🪶', label: '羽毛' }, b: { emoji: '🧱', label: '砖头' }, answer: 'b', q: '谁更重？', tilt: 12 },
      { a: { emoji: '🎾', label: '网球' }, b: { emoji: '🏀', label: '篮球' }, answer: 'b', q: '谁更重？', tilt: 8 },
      { a: { emoji: '📚', label: '书' }, b: { emoji: '📄', label: '纸' }, answer: 'a', q: '谁更重？', tilt: -10 },
      { a: { emoji: '🎈', label: '气球' }, b: { emoji: '🪨', label: '石头' }, answer: 'b', q: '谁更重？', tilt: 14 },
      { a: { emoji: '🍎', label: '苹果' }, b: { emoji: '🍇', label: '葡萄' }, answer: 'a', q: '谁更重？', tilt: -6 },
      { a: { emoji: '🥔', label: '土豆' }, b: { emoji: '🥔', label: '土豆' }, answer: 'same', q: '谁更重？', tilt: 0 },
      { a: { emoji: '🧸', label: '玩具熊' }, b: { emoji: '📱', label: '手机' }, answer: 'a', q: '谁更重？', tilt: -8 },
    ],
    count: [
      { a: { emoji: '🍎', label: '苹果', num: 5 }, b: { emoji: '🍌', label: '香蕉', num: 3 }, answer: 'a', q: '哪种水果更多？' },
      { a: { emoji: '⭐', label: '星星', num: 4 }, b: { emoji: '🌙', label: '月亮', num: 7 }, answer: 'b', q: '哪个更多？' },
      { a: { emoji: '🌸', label: '花', num: 6 }, b: { emoji: '🌸', label: '花', num: 6 }, answer: 'same', q: '哪边的花更多？' },
      { a: { emoji: '🎈', label: '气球', num: 8 }, b: { emoji: '🎁', label: '礼物', num: 5 }, answer: 'a', q: '哪个更多？' },
      { a: { emoji: '🍪', label: '饼干', num: 3 }, b: { emoji: '🍭', label: '糖果', num: 9 }, answer: 'b', q: '哪个更多？' },
      { a: { emoji: '🐝', label: '蜜蜂', num: 7 }, b: { emoji: '🦋', label: '蝴蝶', num: 4 }, answer: 'a', q: '哪个更多？' },
    ],
    size: [
      { a: { emoji: '🏀', label: '篮球', size: 70 }, b: { emoji: '⚽', label: '足球', size: 55 }, answer: 'a', q: '哪个球更大？' },
      { a: { emoji: '🎾', label: '网球', size: 40 }, b: { emoji: '🏐', label: '排球', size: 60 }, answer: 'b', q: '哪个球更大？' },
      { a: { emoji: '📦', label: '箱子', size: 80 }, b: { emoji: '📦', label: '箱子', size: 80 }, answer: 'same', q: '哪个箱子更大？' },
      { a: { emoji: '🍉', label: '西瓜', size: 75 }, b: { emoji: '🍎', label: '苹果', size: 45 }, answer: 'a', q: '哪个更大？' },
      { a: { emoji: '🐘', label: '大象', size: 85 }, b: { emoji: '🐭', label: '老鼠', size: 30 }, answer: 'a', q: '哪个更大？' },
      { a: { emoji: '🎃', label: '南瓜', size: 50 }, b: { emoji: '🍊', label: '橙子', size: 42 }, answer: 'a', q: '哪个更大？' },
    ],
    thick: [
      { a: { label: '红树干', width: 60, color: '#8B4513' }, b: { label: '蓝树干', width: 35, color: '#4682B4' }, answer: 'a', q: '哪根树干更粗？' },
      { a: { label: '绿树干', width: 40, color: '#228B22' }, b: { label: '紫树干', width: 55, color: '#9370DB' }, answer: 'b', q: '哪根树干更粗？' },
      { a: { label: '黄树干', width: 48, color: '#DAA520' }, b: { label: '橙树干', width: 48, color: '#FF8C00' }, answer: 'same', q: '哪根树干更粗？' },
      { a: { label: '灰树干', width: 70, color: '#808080' }, b: { label: '棕树干', width: 42, color: '#A0522D' }, answer: 'a', q: '哪根树干更粗？' },
      { a: { label: '粉树干', width: 38, color: '#FFB6C1' }, b: { label: '青树干', width: 62, color: '#20B2AA' }, answer: 'b', q: '哪根树干更粗？' },
    ],
  };

  function initCompare() {
    state.compareRound = 0;
    bottomActions.style.display = 'flex';
    actionBtn.textContent = '🎯 开始练习';
    actionBtn.onclick = startComparePractice;
    compareScene.innerHTML = '<div style="font-size:64px;text-align:center;width:100%;padding:40px 0;">⚖️</div>';
    compareOptions.innerHTML = '';
    showQuestion('⚖️', '比一比，谁更长、更高、更重');
  }

  function startComparePractice() {
    state.compareRound = 0;
    bottomActions.style.display = 'none';
    nextCompareQuestion();
  }

  function nextCompareQuestion() {
    state.compareRound++;
    if (state.compareRound > 15) {
      showFeedback('🎉', '比较大师！', 2000);
      showConfetti();
      addStar(3);
      setTimeout(initCompare, 2500);
      return;
    }

    const types = ['length', 'height', 'weight', 'count', 'size', 'thick'];
    const type = types[(state.compareRound - 1) % 6];
    state.compareType = type;
    const pool = COMPARE_QUESTIONS[type];
    const q = pool[randInt(0, pool.length - 1)];

    const reverse = Math.random() < 0.5;
    const questionMap = {
      length: { normal: '哪支铅笔更长？', reverse: '哪支铅笔更短？' },
      height: { normal: '谁更高？', reverse: '谁更矮？' },
      weight: { normal: '谁更重？', reverse: '谁更轻？' },
      count: { normal: '哪个更多？', reverse: '哪个更少？' },
      size: { normal: '哪个更大？', reverse: '哪个更小？' },
      thick: { normal: '哪根树干更粗？', reverse: '哪根树干更细？' }
    };

    const questionText = reverse ? questionMap[type].reverse : (q.q || questionMap[type].normal);
    state.compareAnswer = reverse && q.answer !== 'same' ? (q.answer === 'a' ? 'b' : 'a') : q.answer;

    showQuestion('⚖️', `第${state.compareRound}题：${questionText}`, `第${state.compareRound}题，${questionText}`);

    if (type === 'length') renderLengthScene(q);
    else if (type === 'height') renderHeightScene(q);
    else if (type === 'weight') renderWeightScene(q);
    else if (type === 'count') renderCountScene(q);
    else if (type === 'size') renderSizeScene(q);
    else renderThickScene(q);

    renderCompareOptions(q);
  }

  function renderLengthScene(q) {
    compareScene.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:700;width:70px;text-align:right;">${q.a.label}</span>
          <div class="pencil" style="width:${q.a.len}px;background:${q.a.color};border-left-color:${q.a.color};">&nbsp;</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:700;width:70px;text-align:right;">${q.b.label}</span>
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

  function renderCountScene(q) {
    compareScene.innerHTML = `
      <div style="display:flex;gap:40px;align-items:center;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <div style="display:flex;flex-wrap:wrap;gap:4px;max-width:120px;justify-content:center;">
            ${Array(q.a.num).fill(q.a.emoji).map(e => `<span style="font-size:28px;">${e}</span>`).join('')}
          </div>
          <span style="font-size:14px;font-weight:700;color:var(--gray-400);">${q.a.label}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <div style="display:flex;flex-wrap:wrap;gap:4px;max-width:120px;justify-content:center;">
            ${Array(q.b.num).fill(q.b.emoji).map(e => `<span style="font-size:28px;">${e}</span>`).join('')}
          </div>
          <span style="font-size:14px;font-weight:700;color:var(--gray-400);">${q.b.label}</span>
        </div>
      </div>`;
  }

  function renderSizeScene(q) {
    compareScene.innerHTML = `
      <div style="display:flex;gap:40px;align-items:flex-end;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <span style="font-size:${q.a.size}px;">${q.a.emoji}</span>
          <span style="font-size:14px;font-weight:700;color:var(--gray-400);">${q.a.label}</span>
        </div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <span style="font-size:${q.b.size}px;">${q.b.emoji}</span>
          <span style="font-size:14px;font-weight:700;color:var(--gray-400);">${q.b.label}</span>
        </div>
      </div>`;
  }

  function renderThickScene(q) {
    compareScene.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:20px;width:100%;padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:700;width:70px;text-align:right;">${q.a.label}</span>
          <div style="width:120px;height:${q.a.width}px;background:${q.a.color};border-radius:${q.a.width/2}px;border:2px solid rgba(0,0,0,0.2);"></div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:700;width:70px;text-align:right;">${q.b.label}</span>
          <div style="width:120px;height:${q.b.width}px;background:${q.b.color};border-radius:${q.b.width/2}px;border:2px solid rgba(0,0,0,0.2);"></div>
        </div>
      </div>`;
  }

  function renderCompareOptions(q) {
    compareOptions.innerHTML = '';
    const opts = [
      { key: 'a', icon: q.a.emoji || '🅰️', text: q.a.label },
      { key: 'b', icon: q.b.emoji || '🅱️', text: q.b.label },
    ];
    if (q.answer === 'same' || q.a.len === q.b?.len || q.a.size === q.b?.size) {
      opts.push({ key: 'same', icon: '🤝', text: '一样' });
    }

    opts.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'compare-option';
      div.innerHTML = `<span class="compare-option-icon">${opt.icon}</span><span class="compare-option-text">${opt.text}</span>`;
      div.onclick = () => {
        if (state.compareAnswer === null) return;
        if (div.classList.contains('selected')) return;
        if (opt.key === state.compareAnswer) {
          div.classList.add('selected');
          addStar(1);
          showFeedback('🎉', '答对了！', 1200);
          state.compareAnswer = null;
          scheduleAdvance(nextCompareQuestion, 1500);
        } else {
          div.classList.add('wrong');
          showFeedback('🤔', '再看看哦', 800);
          setTimeout(() => div.classList.remove('wrong'), 500);
        }
      };
      compareOptions.appendChild(div);
    });
  }

  /* ========== 长度模式 ========== */

  const LENGTH_QUESTIONS = [
    { obj: '✏️', name: '铅笔', len: 8, unit: 'cm', opts: [6, 8, 10] },
    { obj: '📏', name: '尺子', len: 15, unit: 'cm', opts: [12, 15, 18] },
    { obj: '🔑', name: '钥匙', len: 5, unit: 'cm', opts: [3, 5, 7] },
    { obj: '🥄', name: '勺子', len: 12, unit: 'cm', opts: [10, 12, 14] },
    { obj: '🖊️', name: '钢笔', len: 14, unit: 'cm', opts: [12, 14, 16] },
    { obj: '📱', name: '手机', len: 16, unit: 'cm', opts: [14, 16, 18] },
    { obj: '🪥', name: '牙刷', len: 18, unit: 'cm', opts: [16, 18, 20] },
    { obj: '🥖', name: '面包', len: 25, unit: 'cm', opts: [20, 25, 30] },
  ];

  function initLength() {
    state.lengthRound = 0;
    showQuestion('📏', '用尺子量一量，选出正确的长度');
    bottomActions.style.display = 'flex';
    actionBtn.textContent = '🎯 开始练习';
    actionBtn.className = 'btn btn-blue btn-lg';
    actionBtn.onclick = nextLengthQuestion;
    rulerContainer.innerHTML = '<div style="font-size:48px;padding:40px;">📏</div><div style="font-size:18px;color:var(--gray-400);">点击"开始练习"测量物体</div>';
    lengthOptions.innerHTML = '';
  }

  function nextLengthQuestion() {
    if (state.lengthRound >= 5) {
      showFeedback('🎊', '全部完成！', 2000);
      setTimeout(initLength, 2500);
      return;
    }
    state.lengthRound++;
    const q = LENGTH_QUESTIONS[Math.floor(Math.random() * LENGTH_QUESTIONS.length)];
    state.lengthAnswer = q.len;
    showQuestion('📏', `第${state.lengthRound}题：${q.name}有多长？`, `第${state.lengthRound}题，${q.name}有多长？`);

    const maxLen = 30;
    rulerContainer.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:16px;width:100%;">
        <div style="position:relative;width:100%;max-width:320px;">
          <div style="display:flex;height:40px;background:linear-gradient(180deg,#FFE4B5,#FFD700);border:2px solid var(--gray-300);border-radius:4px;position:relative;">
            ${Array.from({length: maxLen+1}, (_, i) => {
              const isLong = i % 5 === 0;
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;border-left:${i===0?'none':'1px solid rgba(0,0,0,0.1)'};position:relative;">
                <div style="width:2px;height:${isLong?'16px':'10px'};background:var(--text);margin-top:2px;"></div>
                ${i === q.len ? `<div style="position:absolute;top:-12px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #FF0000;"></div>` : ''}
              </div>`;
            }).join('')}
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:4px;padding:0 2px;">
            ${Array.from({length: 7}, (_, i) => `<span style="font-size:11px;font-weight:700;">${i*5}</span>`).join('')}
          </div>
          <div style="position:absolute;right:4px;top:20px;transform:translateY(-50%);font-size:11px;font-weight:700;color:var(--text);">cm</div>
        </div>
        <div style="font-size:48px;">${q.obj}</div>
        <div style="font-size:18px;font-weight:700;color:var(--gray-400);">${q.name}有多长？
      </div>
    `;

    lengthOptions.innerHTML = '';
    q.opts.forEach(opt => {
      const div = document.createElement('div');
      div.className = 'length-option';
      div.textContent = `${opt} ${q.unit}`;
      div.onclick = () => {
        if (state.lengthAnswer === null) return;
        if (div.classList.contains('selected')) return;
        if (opt === state.lengthAnswer) {
          div.classList.add('selected');
          addStar(1);
          showFeedback('🎉', '答对了！', 1200);
          state.lengthAnswer = null;
          scheduleAdvance(nextLengthQuestion, 1500);
        } else {
          div.classList.add('wrong');
          showFeedback('🤔', '再看看哦', 800);
          setTimeout(() => div.classList.remove('wrong'), 500);
        }
      };
      lengthOptions.appendChild(div);
    });
  }

  /* ========== 质量模式 ========== */

  const WEIGHT_QUESTIONS = [
    { obj: '🍎', name: '苹果', value: 200, answer: '克' },
    { obj: '🍌', name: '香蕉', value: 150, answer: '克' },
    { obj: '🥔', name: '土豆', value: 300, answer: '克' },
    { obj: '🥕', name: '胡萝卜', value: 100, answer: '克' },
    { obj: '📚', name: '书本', value: 500, answer: '克' },
    { obj: '🎒', name: '书包', value: 2, answer: '千克' },
    { obj: '🏀', name: '篮球', value: 600, answer: '克' },
    { obj: '🧸', name: '玩具熊', value: 1, answer: '千克' },
    { obj: '🍉', name: '西瓜', value: 3, answer: '千克' },
    { obj: '🐱', name: '小猫', value: 4, answer: '千克' },
  ];

  function initWeight() {
    state.weightRound = 0;
    showQuestion('⚖️', '用秤称一称，选出正确的重量');
    bottomActions.style.display = 'flex';
    actionBtn.textContent = '🎯 开始练习';
    actionBtn.className = 'btn btn-purple btn-lg';
    actionBtn.onclick = nextWeightQuestion;
    scaleDisplay.innerHTML = '<div style="font-size:48px;padding:40px;">⚖️</div><div style="font-size:18px;color:var(--gray-400);">点击"开始练习"称重物体</div>';
    weightOptions.innerHTML = '';
  }

  function nextWeightQuestion() {
    if (state.weightRound >= 5) {
      showFeedback('🎊', '全部完成！', 2000);
      setTimeout(initWeight, 2500);
      return;
    }
    state.weightRound++;
    const q = WEIGHT_QUESTIONS[Math.floor(Math.random() * WEIGHT_QUESTIONS.length)];
    state.weightAnswer = q.answer;
    showQuestion('⚖️', `第${state.weightRound}题：${q.name}应该用什么单位？`, `第${state.weightRound}题，${q.name}应该用什么单位？`);

    scaleDisplay.innerHTML = `
      <div class="digital-scale">
        <div class="scale-screen">${q.value}</div>
      </div>
      <div class="scale-object">${q.obj}</div>
      <div style="margin-top:8px;font-size:20px;font-weight:700;color:var(--text);">
        ${q.name} ${q.value}&nbsp;<span style="color:var(--blue);">?</span>
      </div>
    `;

    weightOptions.innerHTML = '';
    ['克', '千克'].forEach(unit => {
      const div = document.createElement('div');
      div.className = 'weight-option';
      div.textContent = unit;
      div.onclick = () => {
        if (state.weightAnswer === null) return;
        if (div.classList.contains('selected')) return;
        if (unit === state.weightAnswer) {
          div.classList.add('selected');
          addStar(1);
          showFeedback('🎉', '答对了！', 1200);
          state.weightAnswer = null;
          scheduleAdvance(nextWeightQuestion, 1500);
        } else {
          div.classList.add('wrong');
          showFeedback('🤔', '再想想哦', 800);
          setTimeout(() => div.classList.remove('wrong'), 500);
        }
      };
      weightOptions.appendChild(div);
    });
  }

  switchMode();

})();
