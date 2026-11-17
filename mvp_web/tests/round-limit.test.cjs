const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('math.js 默认配置为 5 题一轮', () => {
  const code = fs.readFileSync(path.join(__dirname, '../js/math.js'), 'utf8');
  assert.match(code, /totalQuestions:\s*5/);
});

test('measure.js 各练习模块均限制为 5 题一轮且含再练一轮按钮', () => {
  const code = fs.readFileSync(path.join(__dirname, '../js/measure.js'), 'utf8');
  assert.match(code, /clockRound\s*>=\s*5/);
  assert.match(code, /moneyRound\s*>=\s*5/);
  assert.match(code, /compareRound\s*>=\s*5/);
  assert.match(code, /lengthRound\s*>=\s*5/);
  assert.match(code, /weightRound\s*>=\s*5/);
  assert.match(code, /calendarRound\s*>=\s*5/);
  assert.match(code, /showBottomAction\(['"]🔄 再(练一轮|来一次|玩一次)['"]/);
});

test('trace.js 默认配置 5 个数字一轮且停止无限自动跳转', () => {
  const code = fs.readFileSync(path.join(__dirname, '../js/trace.js'), 'utf8');
  assert.match(code, /traceTotal:\s*5/);
  assert.match(code, /traceCount\s*>=\s*state\.traceTotal/);
  assert.match(code, /🔄 再(练一轮|来一次|玩一次)/);
});
