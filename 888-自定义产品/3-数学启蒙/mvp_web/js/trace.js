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
  const GUIDE_BAND_COLOR = 'rgba(188, 198, 214, 0.88)';
  const GUIDE_STROKE_COLOR = '#8EA0B8';
  const CELL_GUIDE_COLOR = 'rgba(160, 160, 160, 0.28)';
  const DRAW_STROKE_COLOR = '#6C5CE7';
  const DIGIT_HEIGHT = 140;

  const DIGIT_SKELETONS = Object.freeze({
    '0': {
      width: 100,
      checkpoints: [
        [50, 26],
        [74, 70],
        [50, 114],
        [26, 70],
      ],
      strokes: [
        { type: 'ellipse', cx: 50, cy: 70, rx: 26, ry: 48 },
      ],
    },
    '1': {
      width: 100,
      checkpoints: [
        [50, 30],
        [50, 70],
        [50, 110],
      ],
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
      checkpoints: [
        [58, 22],
        [68, 54],
        [44, 84],
        [68, 106],
      ],
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 26, 34],
            ['Q', 42, 18, 64, 18],
            ['Q', 82, 20, 80, 42],
            ['Q', 78, 58, 60, 72],
            ['Q', 44, 84, 36, 92],
            ['L', 82, 92],
            ['L', 82, 106],
            ['L', 28, 106],
          ],
        },
      ],
    },
    '3': {
      width: 100,
      checkpoints: [
        [58, 24],
        [62, 66],
        [62, 112],
      ],
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 28, 30],
            ['Q', 44, 18, 62, 18],
            ['Q', 80, 20, 78, 44],
            ['Q', 76, 60, 54, 68],
            ['Q', 76, 74, 78, 94],
            ['Q', 80, 118, 52, 118],
            ['Q', 34, 118, 24, 108],
          ],
        },
      ],
    },
    '4': {
      width: 100,
      checkpoints: [
        [68, 28],
        [68, 74],
        [68, 110],
        [38, 74],
      ],
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
      checkpoints: [
        [68, 24],
        [34, 46],
        [62, 64],
        [58, 112],
      ],
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 78, 22],
            ['L', 34, 22],
            ['L', 30, 58],
            ['L', 60, 58],
            ['Q', 82, 60, 82, 90],
            ['Q', 82, 118, 50, 118],
            ['Q', 30, 118, 22, 106],
          ],
        },
      ],
    },
    '6': {
      width: 100,
      checkpoints: [
        [56, 24],
        [32, 72],
        [52, 108],
        [72, 86],
      ],
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 72, 28],
            ['Q', 56, 18, 42, 28],
            ['Q', 22, 44, 24, 78],
            ['Q', 26, 118, 56, 118],
            ['Q', 80, 118, 80, 90],
            ['Q', 80, 62, 54, 62],
            ['Q', 32, 64, 28, 84],
          ],
        },
      ],
    },
    '7': {
      width: 100,
      checkpoints: [
        [32, 24],
        [70, 24],
        [48, 74],
        [38, 110],
      ],
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
      checkpoints: [
        [50, 24],
        [50, 66],
        [50, 118],
        [74, 94],
      ],
      strokes: [
        { type: 'ellipse', cx: 50, cy: 44, rx: 22, ry: 24 },
        { type: 'ellipse', cx: 50, cy: 94, rx: 28, ry: 28 },
      ],
    },
    '9': {
      width: 100,
      checkpoints: [
        [54, 24],
        [74, 54],
        [52, 82],
        [74, 108],
      ],
      strokes: [
        {
          type: 'path',
          commands: [
            ['M', 74, 74],
            ['Q', 60, 90, 42, 88],
            ['Q', 20, 82, 22, 50],
            ['Q', 26, 18, 58, 20],
            ['Q', 80, 22, 80, 58],
            ['Q', 80, 88, 74, 118],
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
    const paddingX = options.paddingX ?? 22;
    const paddingY = options.paddingY ?? 24;
    const digits = String(num).split('');
    const contentWidth = canvasWidth - paddingX * 2;
    const slotWidth = contentWidth / digits.length;
    const slotPadding = Math.min(12, slotWidth * 0.08);
    const cellTop = paddingY;
    const cellHeight = canvasHeight - paddingY * 2;
    const maxDigitWidth = digits.reduce((maxWidth, digit) => Math.max(maxWidth, DIGIT_SKELETONS[digit].width), 0);
    const scaleX = (slotWidth - slotPadding * 2) / maxDigitWidth;
    const scaleY = (cellHeight - 22) / DIGIT_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const totalHeight = DIGIT_HEIGHT * scale;
    const startY = cellTop + (cellHeight - totalHeight) / 2;

    const glyphs = [];
    digits.forEach((digit, index) => {
      const skeleton = DIGIT_SKELETONS[digit];
      const width = skeleton.width * scale;
      const slotX = paddingX + slotWidth * index;
      const x = slotX + (slotWidth - width) / 2;
      glyphs.push({
        digit,
        index,
        x,
        y: startY,
        scale,
        width,
        height: DIGIT_HEIGHT * scale,
        slotX,
        slotWidth,
        cellTop,
        cellHeight,
        skeleton,
      });
    });

    const startX = glyphs[0]?.x ?? paddingX;
    const endX = glyphs.length ? glyphs[glyphs.length - 1].x + glyphs[glyphs.length - 1].width : startX;
    const totalWidth = endX - startX;

    return {
      glyphs,
      scale,
      totalWidth,
      totalHeight,
      startX,
      startY,
      cellTop,
      cellHeight,
    };
  }

  function getTraceStrokeWidths(scale) {
    return {
      guideLineWidth: clamp(8, 9 * scale, 10),
      underlayLineWidth: clamp(14, 18 * scale, 20),
      maskLineWidth: clamp(22, 30 * scale, 32),
    };
  }

  function evaluateGlyphQuality({
    coveredPixels,
    totalMaskPixels,
    outsidePixels,
    totalDrawPixels,
    checkpointHitCount,
    checkpointTotal,
  }) {
    const safeMaskPixels = totalMaskPixels > 0 ? totalMaskPixels : 1;
    const safeDrawPixels = totalDrawPixels > 0 ? totalDrawPixels : 1;
    const safeCheckpointTotal = checkpointTotal > 0 ? checkpointTotal : 1;

    const coverage = coveredPixels / safeMaskPixels;
    const outsideRatio = outsidePixels / safeMaskPixels;
    const precision = coveredPixels / safeDrawPixels;
    const checkpointRate = checkpointHitCount / safeCheckpointTotal;

    let isPass = false;
    let rank = 'C';
    let text = '这个数字还不太像，再试一次吧';
    let emoji = '🤔';

    if (coverage >= 0.5 && precision >= 0.72 && checkpointRate >= 0.75 && outsideRatio <= 0.32) {
      isPass = true;
      rank = 'S';
    } else if (coverage >= 0.36 && precision >= 0.56 && checkpointRate >= 0.6 && outsideRatio <= 0.58) {
      isPass = true;
      rank = 'A';
    } else if (coverage >= 0.24 && precision >= 0.42 && checkpointRate >= 0.5 && outsideRatio <= 0.8) {
      isPass = true;
      rank = 'B';
    }

    if (isPass) {
      text = rank === 'S' ? '完美！太漂亮了！' : '写得很好！';
      emoji = rank === 'S' ? '🌟' : '🎉';
    } else if (coverage < 0.12) {
      text = '这个数字还没写满哦';
    } else if (checkpointRate < 0.45 || precision < 0.32) {
      text = '这个数字还不太像，再试一次吧';
    } else if (outsideRatio > 0.95) {
      text = '这个数字超出有点多，再收一收线条哦';
    }

    return {
      coverage,
      outsideRatio,
      precision,
      checkpointRate,
      isPass,
      rank,
      text,
      emoji,
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

  function evaluateTraceAttempt(glyphResults) {
    const failedGlyph = glyphResults.find((glyph) => !glyph.isPass);
    if (failedGlyph) {
      return {
        isPass: false,
        rank: 'C',
        text: failedGlyph.text || '这个数字还不太像，再试一次吧',
        emoji: '🤔',
      };
    }

    const rankOrder = ['S', 'A', 'B'];
    const rank = glyphResults.reduce((lowest, glyph) => {
      return rankOrder.indexOf(glyph.rank) > rankOrder.indexOf(lowest) ? glyph.rank : lowest;
    }, 'S');

    return {
      isPass: true,
      rank,
      text: rank === 'S' ? '完美！太漂亮了！' : '写得很好！',
      emoji: rank === 'S' ? '🌟' : '🎉',
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
      currentLayout: null,
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

    function drawPracticeCells(ctx, layout) {
      ctx.save();
      ctx.strokeStyle = CELL_GUIDE_COLOR;
      ctx.lineWidth = 2;
      layout.glyphs.forEach((glyph) => {
        const insetX = 6;
        const left = glyph.slotX + insetX;
        const right = glyph.slotX + glyph.slotWidth - insetX;
        const top = glyph.cellTop;
        const bottom = glyph.cellTop + glyph.cellHeight;
        const midX = (left + right) / 2;
        const midY = (top + bottom) / 2;

        ctx.beginPath();
        ctx.moveTo(midX, top);
        ctx.lineTo(midX, bottom);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(left, midY);
        ctx.lineTo(right, midY);
        ctx.stroke();
      });
      ctx.restore();
    }

    function renderReferenceNumber(num) {
      const layout = getNumberTraceLayout(num, {
        canvasWidth: bgCanvas.width,
        canvasHeight: bgCanvas.height,
      });
      state.currentLayout = layout;
      const strokeWidths = getTraceStrokeWidths(layout.scale);

      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

      drawPracticeCells(bgCtx, layout);

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

    function isCheckpointHit(drawData, checkpointX, checkpointY, radius) {
      const width = drawCanvas.width;
      const minX = Math.max(0, Math.floor(checkpointX - radius));
      const maxX = Math.min(width - 1, Math.ceil(checkpointX + radius));
      const minY = Math.max(0, Math.floor(checkpointY - radius));
      const maxY = Math.min(drawCanvas.height - 1, Math.ceil(checkpointY + radius));
      const squaredRadius = radius * radius;

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const dx = x - checkpointX;
          const dy = y - checkpointY;
          if (dx * dx + dy * dy > squaredRadius) continue;

          const index = (y * width + x) * 4;
          if (drawData[index + 3] > 30) {
            return true;
          }
        }
      }

      return false;
    }

    function collectGlyphStats(layout) {
      const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
      const drawData = drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height).data;
      const width = drawCanvas.width;

      return layout.glyphs.map((glyph) => {
        const padding = Math.max(18, Math.round(18 * glyph.scale));
        const minX = Math.max(0, Math.floor(glyph.slotX - padding));
        const maxX = Math.min(width - 1, Math.ceil(glyph.slotX + glyph.slotWidth + padding));
        const minY = Math.max(0, Math.floor(glyph.y - padding));
        const maxY = Math.min(drawCanvas.height - 1, Math.ceil(glyph.y + glyph.height + padding));

        let totalMaskPixels = 0;
        let coveredPixels = 0;
        let outsidePixels = 0;
        let totalDrawPixels = 0;

        for (let y = minY; y <= maxY; y += 1) {
          for (let x = minX; x <= maxX; x += 1) {
            const index = (y * width + x) * 4;
            const inMaskArea = maskData[index + 3] > 30;
            const hasDrawn = drawData[index + 3] > 30;

            if (hasDrawn) {
              totalDrawPixels += 1;
            }

            if (inMaskArea) {
              totalMaskPixels += 1;
              if (hasDrawn) {
                coveredPixels += 1;
              }
            } else if (hasDrawn) {
              outsidePixels += 1;
            }
          }
        }

        const checkpointRadius = Math.max(11, 12 * glyph.scale);
        const checkpointHitCount = glyph.skeleton.checkpoints.reduce((count, point) => {
          const checkpointX = glyph.x + point[0] * glyph.scale;
          const checkpointY = glyph.y + point[1] * glyph.scale;
          return count + (isCheckpointHit(drawData, checkpointX, checkpointY, checkpointRadius) ? 1 : 0);
        }, 0);

        return {
          digit: glyph.digit,
          coveredPixels,
          totalMaskPixels,
          outsidePixels,
          totalDrawPixels,
          checkpointHitCount,
          checkpointTotal: glyph.skeleton.checkpoints.length,
        };
      });
    }

    function checkDrawQuality() {
      if (state.strokeCount === 0) {
        speak('你还没开始写呢');
        return;
      }

      const glyphStats = collectGlyphStats(state.currentLayout);
      const glyphResults = glyphStats.map((glyphStat) => evaluateGlyphQuality(glyphStat));
      const result = evaluateTraceAttempt(glyphResults);
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
    GUIDE_BAND_COLOR,
    evaluateGlyphQuality,
    evaluateTraceAttempt,
    pickRandomTraceNumber,
    pickNextTraceNumber,
    getNumberTraceLayout,
    getTraceStrokeWidths,
    evaluateTraceQuality,
    initTracePage,
  };
});
