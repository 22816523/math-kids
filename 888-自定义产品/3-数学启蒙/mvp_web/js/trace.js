/* ============================================
   数字描红 · 核心逻辑
   画布渲染与准确度算法
   ============================================ */
;(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ========== 状态 ==========
  const state = {
    currentNum: 1,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    strokeCount: 0
  };

  // ========== DOM引用 ==========
  const numberPicker = $('#numberPicker');
  const boardTargetText = $('#boardTargetText');
  const clearBtn = $('#clearBtn');
  const submitBtn = $('#submitBtn');
  
  const bgCanvas = $('#bgCanvas');
  const drawCanvas = $('#drawCanvas');
  const bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });
  const drawCtx = drawCanvas.getContext('2d', { willReadFrequently: true });

  const feedbackOverlay = $('#feedbackOverlay');
  const feedbackEmoji = $('#feedbackEmoji');
  const feedbackText = $('#feedbackText');

  // ========== 初始化 ==========
  function init() {
    initNumberPicker();
    bindEvents();
    renderReferenceNumber(state.currentNum);
  }

  function initNumberPicker() {
    let html = '';
    for (let i = 0; i <= 9; i++) {
      html += `<button class="mode-tab ${i === state.currentNum ? 'active' : ''}" data-val="${i}"><span class="tab-label">${i}</span></button>`;
    }
    numberPicker.innerHTML = html;

    $$('.mode-tab').forEach(btn => {
      btn.onclick = () => {
        $$('.mode-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentNum = parseInt(btn.dataset.val);
        boardTargetText.textContent = state.currentNum;
        clearDrawCanvas();
        renderReferenceNumber(state.currentNum);
        speak(`来写数字 ${state.currentNum} 吧`);
      };
    });
  }

  // ========== 画布渲染 ==========
  function renderReferenceNumber(num) {
    // 清空背景
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // 我们用原生文字渲染出非常粗浅灰色的字作为描红底纹
    const text = String(num);
    bgCtx.font = 'bold 280px "Nunito", sans-serif';
    bgCtx.textAlign = 'center';
    bgCtx.textBaseline = 'middle';
    
    const cx = bgCanvas.width / 2;
    const cy = bgCanvas.height / 2 + 20;

    // 浅色外描边，当作合法区域（适中宽度，不需要涂满）
    bgCtx.lineWidth = 28; 
    bgCtx.strokeStyle = '#E2E8F0'; // 灰白色
    bgCtx.lineJoin = 'round';
    bgCtx.lineCap = 'round';
    bgCtx.strokeText(text, cx, cy);

    // 再画内部虚线，用来引导视觉
    bgCtx.lineWidth = 5;
    bgCtx.setLineDash([15, 15]);
    bgCtx.strokeStyle = '#94A3B8';
    bgCtx.strokeText(text, cx, cy);
    bgCtx.setLineDash([]); // 恢复
  }

  function clearDrawCanvas() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    state.strokeCount = 0;
  }

  // ========== 绘图交互 ==========
  function bindEvents() {
    clearBtn.onclick = clearDrawCanvas;
    submitBtn.onclick = checkDrawQuality;

    // Mouse
    drawCanvas.addEventListener('mousedown', startDraw);
    drawCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw); // attach to window to catch out-of-bounds release

    // Touch
    drawCanvas.addEventListener('touchstart', startDraw, { passive: false });
    drawCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', endDraw);
  }

  function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    // 需要考虑 canvas 实际尺寸与 CSS 缩放比例
    const scaleX = drawCanvas.width / rect.width;
    const scaleY = drawCanvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    e.preventDefault();
    state.isDrawing = true;
    const pos = getPos(e);
    state.lastX = pos.x;
    state.lastY = pos.y;
    state.strokeCount++;

    drawCtx.beginPath();
    drawCtx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
    drawCtx.fillStyle = '#6C5CE7'; // 主笔触紫色
    drawCtx.fill();
    
    drawCtx.beginPath();
    drawCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!state.isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);

    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.lineWidth = 12;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.strokeStyle = '#6C5CE7';
    drawCtx.stroke();

    state.lastX = pos.x;
    state.lastY = pos.y;
  }

  function endDraw() {
    if (state.isDrawing) {
      state.isDrawing = false;
      drawCtx.closePath();
    }
  }

  // ========== 打分算法 ==========
  function checkDrawQuality() {
    if (state.strokeCount === 0) {
      speak('你还没开始写呢');
      return;
    }

    const bgData = bgCtx.getImageData(0, 0, bgCanvas.width, bgCanvas.height).data;
    const drawData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data;

    let totalBgPixels = 0;   // 灰色参考区总像素
    let coveredBgPixels = 0; // 被用户笔触覆盖的灰区像素
    let outsidePixels = 0;   // 画在灰区外面的像素

    for (let i = 0; i < bgData.length; i += 4) {
      const bgAlpha = bgData[i + 3];     // 背景 alpha
      const drawAlpha = drawData[i + 3]; // 笔触 alpha

      const inBgArea = bgAlpha > 30;     // 是否属于合法区
      const hasDrawn = drawAlpha > 30;   // 用户是否涂抹

      if (inBgArea) {
        totalBgPixels++;
        if (hasDrawn) {
          coveredBgPixels++;
        }
      } else {
        if (hasDrawn) {
          outsidePixels++;
        }
      }
    }

    if (totalBgPixels === 0) {
      // 异常情况，比如画布没字
      totalBgPixels = 1;
    }

    // 计算覆盖率：目标线内涂抹面积占总合法面积百分比
    const coverage = coveredBgPixels / totalBgPixels;
    // 越界率：飞出合法框外的乱涂乱画占合法面积百分比
    const outsideRatio = outsidePixels / totalBgPixels;

    console.log({ coverage, outsideRatio, coveredBgPixels, totalBgPixels, outsidePixels });

    let isPass = false;
    let rank = 'C';

    if (coverage > 0.25 && outsideRatio < 0.6) {
      isPass = true;
      rank = coverage > 0.5 && outsideRatio < 0.2 ? 'S' : 'A';
    } else if (coverage > 0.15 && outsideRatio < 0.8) {
      isPass = true;
      rank = 'B';
    }

    if (isPass) {
      let txt = '写得很好！';
      if(rank === 'S') txt = '完美！太漂亮了！';
      showFeedback(true, rank === 'S' ? '🌟' : '🎉', txt);
      speak(txt);
      setTimeout(() => {
        window.PracticeSupport?.showConfetti?.();
        // 自动切下一个数字
        if (state.currentNum < 9) {
          const nextBtn = `[data-val="${state.currentNum + 1}"]`;
          const btnObj = $(nextBtn);
          if(btnObj) btnObj.click();
        }
      }, 1500);
    } else {
      let txt = '有点出界了，再试一次吧';
      if(coverage < 0.1) txt = '还没写满哦，再涂满一点';
      if(outsideRatio > 1.0) txt = '乱涂乱画可不行哦！';
      showFeedback(false, '🤔', txt);
      speak(txt);
      setTimeout(() => {
         clearDrawCanvas();
      }, 1500);
    }
  }

  // ========== 反馈通用 ==========
  function showFeedback(isCorrect, emoji, text) {
    feedbackEmoji.textContent = emoji;
    feedbackText.textContent = text;
    feedbackText.style.color = isCorrect ? 'var(--green-dark)' : 'var(--yellow-dark)';
    feedbackOverlay.style.display = 'flex';
    setTimeout(() => {
      feedbackOverlay.style.display = 'none';
    }, 1500);
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    u.pitch = 1.2;
    window.speechSynthesis.speak(u);
  }

  // Bootstrap
  init();

})();
