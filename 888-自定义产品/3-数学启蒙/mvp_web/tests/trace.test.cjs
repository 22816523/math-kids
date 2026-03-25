const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DIGIT_SKELETONS,
  getNumberTraceLayout,
  pickRandomTraceNumber,
  evaluateTraceQuality,
} = require('../js/trace.js');

test('pickRandomTraceNumber covers the full 1-100 range', () => {
  assert.equal(pickRandomTraceNumber(() => 0), 1);
  assert.equal(pickRandomTraceNumber(() => 0.999999), 100);
  assert.equal(pickRandomTraceNumber(() => 0.42), 43);
});

test('digit 1 skeleton is a single vertical stroke', () => {
  const one = DIGIT_SKELETONS['1'];

  assert.equal(one.strokes.length, 1);
  assert.deepEqual(one.strokes[0].commands, [
    ['M', 50, 22],
    ['L', 50, 118],
  ]);
});

test('getNumberTraceLayout lays out multi-digit skeletons within the board', () => {
  const layout = getNumberTraceLayout(100, {
    canvasWidth: 300,
    canvasHeight: 360,
  });

  assert.equal(layout.glyphs.length, 3);
  assert.deepEqual(layout.glyphs.map((glyph) => glyph.digit), ['1', '0', '0']);
  assert.ok(layout.glyphs[0].x < layout.glyphs[1].x);
  assert.ok(layout.glyphs[1].x < layout.glyphs[2].x);
  assert.ok(layout.totalWidth <= 300);
});

test('evaluateTraceQuality returns strong pass feedback for high coverage and low overflow', () => {
  const result = evaluateTraceQuality({
    coveredPixels: 70,
    totalMaskPixels: 100,
    outsidePixels: 10,
  });

  assert.equal(result.isPass, true);
  assert.equal(result.rank, 'S');
  assert.equal(result.text, '完美！太漂亮了！');
  assert.equal(result.emoji, '🌟');
});

test('evaluateTraceQuality allows moderate overflow when main skeleton is covered', () => {
  const result = evaluateTraceQuality({
    coveredPixels: 22,
    totalMaskPixels: 100,
    outsidePixels: 78,
  });

  assert.equal(result.isPass, true);
  assert.equal(result.rank, 'B');
  assert.equal(result.text, '写得很好！');
  assert.equal(result.emoji, '🎉');
});

test('evaluateTraceQuality returns retry feedback when drawing is too sparse', () => {
  const result = evaluateTraceQuality({
    coveredPixels: 5,
    totalMaskPixels: 100,
    outsidePixels: 5,
  });

  assert.equal(result.isPass, false);
  assert.equal(result.rank, 'C');
  assert.equal(result.text, '还没写满哦，再涂满一点');
  assert.equal(result.emoji, '🤔');
});
