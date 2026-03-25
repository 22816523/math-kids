/* ============================================
   数字描红 · 核心逻辑
   使用 0-9 骨架路径渲染 1-100 描红，并按比例宽松判定
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
  const GUIDE_BAND_COLOR = 'rgba(203, 213, 225, 0.55)';
  const GUIDE_STROKE_COLOR = '#8EA0B8';
  const DRAW_STROKE_COLOR = '#6C5CE7';
  const DIGIT_HEIGHT = 140;
  const DIGIT_GAP = 22;

  const DIGIT_SKELETONS = Object.freeze({
    '0': {
      width: 100,
      strokes: [
        { type: 'ellipse', cx: 50, cy: 70, rx: 26, ry: 48 },
      ],
    },
    '1': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 50, 22],
            ['L', 50, 118],
          ],
        },
      ],
    },
    '2': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 26, 34],
            ['Q', 42, 18, 62, 18],
            ['Q', 82, 20, 80, 44],
            ['Q', 78, 60, 60, 74],
            ['L', 38, 90],
            ['Q', 28, 98, 28, 106],
            ['L', 80, 106],
          ],
        },
      ],
    },
    '3': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 28, 30],
            ['Q', 44, 18, 62, 18],
            ['Q', 80, 20, 78, 44],
            ['Q', 76, 60, 54, 68],
            ['Q', 82, 74, 82, 96],
            ['Q', 82, 120, 52, 120],
            ['Q', 34, 120, 24, 108],
          ],
        },
      ],
    },
    '4': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 72, 18],
            ['L', 72, 118],
          ],
        },
        {
          type: 'path',
          commands: [
            ['M', 24, 72],
            ['L', 80, 72],
          ],
        },
        {
          type: 'path',
          commands: [
            ['M', 24, 72],
            ['L', 58, 18],
          ],
        },
      ],
    },
    '5': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 78, 22],
            ['L', 34, 22],
            ['L', 30, 62],
            ['L', 58, 62],
            ['Q', 82, 66, 82, 92],
            ['Q', 82, 120, 50, 120],
            ['Q', 32, 120, 22, 108],
          ],
        },
      ],
    },
    '6': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 72, 28],
            ['Q', 56, 18, 42, 28],
            ['Q', 22, 42, 24, 76],
            ['Q', 26, 120, 56, 120],
            ['Q', 82, 120, 82, 92],
            ['Q', 82, 64, 54, 64],
            ['Q', 32, 66, 28, 84],
          ],
        },
      ],
    },
    '7': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 22, 24],
            ['L', 80, 24],
            ['L', 42, 118],
          ],
        },
      ],
    },
    '8': {
      width: 100,
      strokes: [
        { type: 'ellipse', cx: 50, cy: 46, rx: 22, ry: 26 },
        { type: 'ellipse', cx: 50, cy: 94, rx: 28, ry: 30 },
      ],
    },
    '9': {
      width: 100,
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 74, 74],
            ['Q', 60, 90, 42, 88],
            ['Q', 20, 82, 22, 50],
            ['Q', 26, 18, 58, 20],
            ['Q', 82, 22, 82, 60],
            ['L', 76, 118],
          ],
        },
      ],
    },
  });

  function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
  }

  function pickRandomTraceNumber(randomFn = Math.random) {
    return Math.floor(randomFn() * TRACE_MAX_NUMBER) + TRACE_MIN_NUMBER;
  }

  function pickNextTraceNumber(currentNum, randomFn = Math.random) {
    const candidate = pickRandomTraceNumber(randomFn);
    if (candidate !== currentNum) return candidate;
    return currentNum >= TRACE_MAX_NUMBER ? TRACE_MIN_NUMBER : currentNum + 1;
  }

  function getNumberTraceLayout(num, options = {}) {
    const canvasWidth = options.canvasWidth ?? 300;
    const canvasHeight = options.canvasHeight ?? 360;
    const paddingX = options.paddingX ?? 34;
    const paddingY = options.paddingY ?? 34;
    const digits = String(num).split('');

    const totalBaseWidth = digits.reduce((sum, digit) => sum + DIGIT_SKELETONS[digit].width, 0) + DIGIT_GAP * Math.max(0, digits.length - 1);
    const scaleX = (canvasWidth - paddingX * 2) / totalBaseWidth;
    const scaleY = (canvasHeight - paddingY * 2) / DIGIT_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const totalWidth = totalBaseWidth * scale;
    const totalHeight = DIGIT_HEIGHT * scale;
    const startX = (canvasWidth - totalWidth) / 2;
    const startY = (canvasHeight - totalHeight) / 2;

    const glyphs = [];
    let cursorX = startX;

    digits.forEach((digit, index) => {
      const skeleton = DIGIT_SKELETONS[digit];
      glyphs.push({
        digit,
        index,
        x: cursorX,
        y: startY,
        scale,
        width: skeleton.width * scale,
        height: DIGIT_HEIGHT * scale,
        skeleton,
      });
      cursorX += skeleton.width * scale;
      if (index < digits.length - 1) {
        cursorX += DIGIT_GAP * scale;
      }
    });

    return {
      glyphs,
      scale,
      totalWidth,
      totalHeight,
      startX,
      startY,
    };
  }

  function getTraceStrokeWidths(scale) {
    return {
      guideLineWidth: clamp(8, 9 * scale, 10),
      underlayLineWidth: clamp(14, 18 * scale, 20),
      maskLineWidth: clamp(22, 30 * scale, 32),
    };
  }

  function evaluateTraceQuality({ coveredPixels, totalMaskPixels, outsidePixels }) {
    const safeTotalMaskPixels = totalMaskPixels > 0 ? totalMaskPixels : 1;
    const coverage = coveredPixels / safeTotalMaskPixels;
    const outsideRatio = outsidePixels / safeTotalMaskPixels;

    let isPass = false;
    let rank = 'C';
    let text = '有点出界了，再试一次吧';
    let emoji = '🤔';

    if (coverage >= 0.5 && outsideRatio <= 0.25) {
      isPass = true;
      rank = 'S';
    } else if (coverage >= 0.32 && outsideRatio <= 0.65) {
      isPass = true;
      rank = 'A';
    } else if (coverage >= 0.18 && outsideRatio <= 0.9) {
      isPass = true;
      rank = 'B';
    }

    if (isPass) {
      text = rank === 'S' ? '完美！太漂亮了！' : '写得很好！';
      emoji = rank === 'S' ? '🌟' : '🎉';
    } else if (coverage < 0.1) {
      text = '还没写满哦，再涂满一点';
    } else if (outsideRatio > 1.2) {
      text = '超出有点多，再收一收线条哦';
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

    function drawPathStroke(ctx, commands, offsetX, offsetY, scale) {
      ctx.beginPath();

      commands.forEach((command) => {
        const type = command[0];
        if (type === 'M') {
          ctx.moveTo(offsetX + command[1] * scale, offsetY + command[2] * scale);
        } else if (type === 'L') {
          ctx.lineTo(offsetX + command[1] * scale, offsetY + command[2] * scale);
        } else if (type === 'Q') {
          ctx.quadraticCurveTo(
            offsetX + command[1] * scale,
            offsetY + command[2] * scale,
            offsetX + command[3] * scale,
            offsetY + command[4] * scale
          );
        }
      });

      ctx.stroke();
    }

    function drawEllipseStroke(ctx, stroke, offsetX, offsetY, scale) {
      ctx.beginPath();
      ctx.ellipse(
        offsetX + stroke.cx * scale,
        offsetY + stroke.cy * scale,
        stroke.rx * scale,
        stroke.ry * scale,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    function drawGlyphs(ctx, layout, options) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = options.strokeStyle;
      ctx.lineWidth = options.lineWidth;
      ctx.setLineDash(options.dash ?? []);

      layout.glyphs.forEach((glyph) => {
        glyph.skeleton.strokes.forEach((stroke) => {
          if (stroke.type === 'ellipse') {
            drawEllipseStroke(ctx, stroke, glyph.x, glyph.y, glyph.scale);
          } else {
            drawPathStroke(ctx, stroke.commands, glyph.x, glyph.y, glyph.scale);
          }
        });
      });

      ctx.restore();
    }

    function renderReferenceNumber(num) {
      const layout = getNumberTraceLayout(num, {
        canvasWidth: bgCanvas.width,
        canvasHeight: bgCanvas.height,
      });
      const strokeWidths = getTraceStrokeWidths(layout.scale);

      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      drawGlyphs(maskCtx, layout, {
        strokeStyle: '#000000',
        lineWidth: strokeWidths.maskLineWidth,
      });

      drawGlyphs(bgCtx, layout, {
        strokeStyle: GUIDE_BAND_COLOR,
        lineWidth: strokeWidths.underlayLineWidth,
      });

      drawGlyphs(bgCtx, layout, {
        strokeStyle: GUIDE_STROKE_COLOR,
        lineWidth: strokeWidths.guideLineWidth,
        dash: [12, 10],
      });
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
    DIGIT_SKELETONS,
    pickRandomTraceNumber,
    pickNextTraceNumber,
    getNumberTraceLayout,
    getTraceStrokeWidths,
    evaluateTraceQuality,
    initTracePage,
  };
});
