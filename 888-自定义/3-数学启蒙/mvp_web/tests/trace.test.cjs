const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DIGIT_SKELETONS,
  GUIDE_BAND_COLOR,
  evaluateGlyphQuality,
  evaluateTraceAttempt,
  getNumberTraceLayout,
  getTraceStrokeWidths,
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

test('digit 2 and 4 skeletons keep primary-school style baseline and stroke order', () => {
  const two = DIGIT_SKELETONS['2'];
  const four = DIGIT_SKELETONS['4'];

  assert.deepEqual(two.strokes[0].commands.slice(-3), [
    ['L', 40, 92],
    ['L', 28, 108],
    ['L', 82, 108],
  ]);
  assert.equal(two.strokes[0].commands.some((command) => command[1] === 82 && command[2] === 94), false);

  assert.equal(four.strokes.length, 3);
  assert.deepEqual(four.strokes[0].commands, [
    ['M', 62, 18],
    ['L', 62, 118],
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
  assert.ok(layout.glyphs[0].width < 100);
});

test('getTraceStrokeWidths keeps the guide visually thicker than before', () => {
  const widths = getTraceStrokeWidths(1);

  assert.ok(widths.underlayLineWidth > widths.guideLineWidth);
  assert.ok(widths.maskLineWidth > widths.underlayLineWidth);
  assert.ok(widths.guideLineWidth >= 8);
});

test('guide band color stays visibly stronger than the previous faint underlay', () => {
  assert.equal(GUIDE_BAND_COLOR, 'rgba(188, 198, 214, 0.88)');
});

test('evaluateGlyphQuality rejects a digit when key checkpoints are mostly missed', () => {
  const result = evaluateGlyphQuality({
    coveredPixels: 32,
    totalMaskPixels: 100,
    outsidePixels: 28,
    totalDrawPixels: 68,
    checkpointHitCount: 1,
    checkpointTotal: 4,
  });

  assert.equal(result.isPass, false);
  assert.equal(result.text, '这个数字还不太像，再试一次吧');
});

test('evaluateGlyphQuality accepts a digit when coverage and checkpoints are both solid', () => {
  const result = evaluateGlyphQuality({
    coveredPixels: 44,
    totalMaskPixels: 100,
    outsidePixels: 18,
    totalDrawPixels: 54,
    checkpointHitCount: 3,
    checkpointTotal: 4,
  });

  assert.equal(result.isPass, true);
  assert.equal(result.rank, 'A');
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

test('evaluateTraceAttempt fails if any single digit fails even when others pass', () => {
  const result = evaluateTraceAttempt([
    { isPass: true, rank: 'A' },
    { isPass: false, rank: 'C', text: '这个数字还不太像，再试一次吧' },
  ]);

  assert.equal(result.isPass, false);
  assert.equal(result.text, '这个数字还不太像，再试一次吧');
  assert.equal(result.emoji, '🤔');
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
