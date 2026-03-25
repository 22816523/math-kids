/* ============================================
   数字描红 · 核心逻辑
   随机 1-100 出题、参考虚线渲染与准确度判定
   ============================================ */
(function (global, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        api.initTracePage();
      }, { once: true });
    } else {
      api.initTracePage();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const TRACE_MIN_NUMBER = 1;
  const TRACE_MAX_NUMBER = 100;
  const TRACE_FONT_FAMILY = '"Nunito", sans-serif';
  const GUIDE_STROKE_COLOR = '#94A3B8';
  const DRAW_STROKE_COLOR = '#6C5CE7';

  function pickRandomTraceNumber(randomFn = Math.random) {
    return Math.floor(randomFn() * TRACE_MAX_NUMBER) + TRACE_MIN_NUMBER;
  }

  function pickNextTraceNumber(currentNum, randomFn = Math.random) {
    const candidate = pickRandomTraceNumber(randomFn);

    if (candidate !== currentNum) {
      return candidate;
    }

    return currentNum >= TRACE_MAX_NUMBER ? TRACE_MIN_NUMBER : currentNum + 1;
  }

  function getTraceFontSize(num) {
    const digits = String(num).length;

    if (digits >= 3) return 176;
    if (digits === 2) return 224;
    return 280;
  }

  function getTraceMaskLineWidth(num) {
    const digits = String(num).length;

    if (digits >= 3) return 22;
    if (digits === 2) return 28;
    return 32;
  }

  function evaluateTraceQuality({ coveredPixels, totalMaskPixels, outsidePixels }) {
    const safeTotalMaskPixels = totalMaskPixels > 0 ? totalMaskPixels : 1;
    const coverage = coveredPixels / safeTotalMaskPixels;
    const outsideRatio = outsidePixels / safeTotalMaskPixels;

    let isPass = false;
    let rank = 'C';
    let text = '有点出界了，再试一次吧';
    let emoji = '🤔';

    if (coverage > 0.25 && outsideRatio < 0.6) {
      isPass = true;
      rank = coverage > 0.5 && outsideRatio < 0.2 ? 'S' : 'A';
    } else if (coverage > 0.15 && outsideRatio < 0.8) {
      isPass = true;
      rank = 'B';
    }

    if (isPass) {
      text = rank === 'S' ? '完美！太漂亮了！' : '写得很好！';
      emoji = rank === 'S' ? '🌟' : '🎉';
    } else if (coverage < 0.1) {
      text = '还没写满哦，再涂满一点';
    } else if (outsideRatio > 1.0) {
      text = '乱涂乱画可不行哦！';
    }

    return {
      coverage,
      outsideRatio,
      isPass,
      rank,
      text,
      emoji,
    };
  }

  function initTracePage() {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return null;
    }

    const $ = (selector) => document.querySelector(selector);
    const boardTargetText = $('#boardTargetText');
    const clearBtn = $('#clearBtn');
    const submitBtn = $('#submitBtn');
    const bgCanvas = $('#bgCanvas');
    const drawCanvas = $('#drawCanvas');
    const feedbackOverlay = $('#feedbackOverlay');
    const feedbackEmoji = $('#feedbackEmoji');
    const feedbackText = $('#feedbackText');

    if (!boardTargetText || !clearBtn || !submitBtn || !bgCanvas || !drawCanvas || !feedbackOverlay || !feedbackEmoji || !feedbackText) {
      return null;
    }

    const bgCtx = bgCanvas.getContext('2d', { willReadFrequently: true });
    const drawCtx = drawCanvas.getContext('2d', { willReadFrequently: true });
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = bgCanvas.width;
    maskCanvas.height = bgCanvas.height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true });

    const state = {
      currentNum: pickRandomTraceNumber(),
      isDrawing: false,
      strokeCount: 0,
    };

    function applyTextStyle(ctx, fontSize) {
      ctx.font = `900 ${fontSize}px ${TRACE_FONT_FAMILY}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
    }

    function renderReferenceNumber(num) {
      const text = String(num);
      const cx = bgCanvas.width / 2;
      const cy = bgCanvas.height / 2 + 20;
      const fontSize = getTraceFontSize(num);
      const maskLineWidth = getTraceMaskLineWidth(num);

      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      applyTextStyle(maskCtx, fontSize);
      maskCtx.lineWidth = maskLineWidth;
      maskCtx.strokeStyle = '#000000';
      maskCtx.strokeText(text, cx, cy);

      applyTextStyle(bgCtx, fontSize);
      bgCtx.lineWidth = 5;
      bgCtx.strokeStyle = GUIDE_STROKE_COLOR;
      bgCtx.setLineDash([12, 10]);
      bgCtx.strokeText(text, cx, cy);
      bgCtx.setLineDash([]);
    }

    function clearDrawCanvas() {
      drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
      state.strokeCount = 0;
    }

    function speak(text) {
      if (!('speechSynthesis' in window)) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.85;
      utterance.pitch = 1.2;
      window.speechSynthesis.speak(utterance);
    }

    function setCurrentNumber(num, { announce = true } = {}) {
      state.currentNum = num;
      boardTargetText.textContent = String(num);
      clearDrawCanvas();
      renderReferenceNumber(num);

      if (announce) {
        speak(`来写数字 ${num} 吧`);
      }
    }

    function getPos(e) {
      const rect = drawCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const scaleX = drawCanvas.width / rect.width;
      const scaleY = drawCanvas.height / rect.height;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }

    function startDraw(e) {
      e.preventDefault();
      state.isDrawing = true;
      state.strokeCount += 1;

      const pos = getPos(e);
      drawCtx.beginPath();
      drawCtx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
      drawCtx.fillStyle = DRAW_STROKE_COLOR;
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
      drawCtx.strokeStyle = DRAW_STROKE_COLOR;
      drawCtx.stroke();
    }

    function endDraw() {
      if (!state.isDrawing) return;

      state.isDrawing = false;
      drawCtx.closePath();
    }

    function showFeedback(isCorrect, emoji, text) {
      feedbackEmoji.textContent = emoji;
      feedbackText.textContent = text;
      feedbackText.style.color = isCorrect ? 'var(--green-dark)' : 'var(--yellow-dark)';
      feedbackOverlay.style.display = 'flex';

      window.setTimeout(() => {
        feedbackOverlay.style.display = 'none';
      }, 1500);
    }

    function collectDrawStats() {
      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
      const drawData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data;

      let totalMaskPixels = 0;
      let coveredPixels = 0;
      let outsidePixels = 0;

      for (let i = 0; i < maskData.length; i += 4) {
        const inMaskArea = maskData[i + 3] > 30;
        const hasDrawn = drawData[i + 3] > 30;

        if (inMaskArea) {
          totalMaskPixels += 1;
          if (hasDrawn) {
            coveredPixels += 1;
          }
        } else if (hasDrawn) {
          outsidePixels += 1;
        }
      }

      return { coveredPixels, totalMaskPixels, outsidePixels };
    }

    function checkDrawQuality() {
      if (state.strokeCount === 0) {
        speak('你还没开始写呢');
        return;
      }

      const result = evaluateTraceQuality(collectDrawStats());
      showFeedback(result.isPass, result.emoji, result.text);
      speak(result.text);

      if (result.isPass) {
        window.setTimeout(() => {
          window.PracticeSupport?.showConfetti?.();
          setCurrentNumber(pickNextTraceNumber(state.currentNum), { announce: true });
        }, 1500);
      } else {
        window.setTimeout(() => {
          clearDrawCanvas();
        }, 1500);
      }
    }

    function bindEvents() {
      clearBtn.onclick = clearDrawCanvas;
      submitBtn.onclick = checkDrawQuality;

      drawCanvas.addEventListener('mousedown', startDraw);
      drawCanvas.addEventListener('mousemove', draw);
      window.addEventListener('mouseup', endDraw);

      drawCanvas.addEventListener('touchstart', startDraw, { passive: false });
      drawCanvas.addEventListener('touchmove', draw, { passive: false });
      window.addEventListener('touchend', endDraw);
    }

    bindEvents();
    setCurrentNumber(state.currentNum, { announce: false });
    speak(`来写数字 ${state.currentNum} 吧`);

    return {
      setCurrentNumber,
      clearDrawCanvas,
      checkDrawQuality,
      state,
    };
  }

  return {
    pickRandomTraceNumber,
    pickNextTraceNumber,
    getTraceFontSize,
    getTraceMaskLineWidth,
    evaluateTraceQuality,
    initTracePage,
  };
});
