const test = require('node:test');
const assert = require('node:assert/strict');

const {
  pickRandomTraceNumber,
  evaluateTraceQuality,
} = require('../js/trace.js');

test('pickRandomTraceNumber covers the full 1-100 range', () => {
  assert.equal(pickRandomTraceNumber(() => 0), 1);
  assert.equal(pickRandomTraceNumber(() => 0.999999), 100);
  assert.equal(pickRandomTraceNumber(() => 0.42), 43);
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
