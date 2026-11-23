const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMultApp() {
  const code = fs.readFileSync(path.join(__dirname, '../js/multiplication.js'), 'utf8');
  const dom = {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
  };
  const sandbox = {
    window: {},
    document: dom,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    Math,
    Set,
    Array
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.multiplicationApp;
}

test('乘除法启蒙模块生成逻辑与行列/余数完备性', () => {
  const app = loadMultApp();
  assert.ok(app, 'multiplicationApp 必须正确挂载');

  // 1. 点阵乘法
  for (let i = 0; i < 50; i++) {
    const q = app.generateMatrixQuestion();
    assert.ok(q.rows >= 2 && q.rows <= 4, '行数范围合理');
    assert.ok(q.cols >= 2 && q.cols <= 5, '列数范围合理');
    assert.equal(q.answer, q.rows * q.cols, '答案必须严格等于 行 × 列');
    assert.ok(q.options.includes(q.answer), '选项必须包含答案');
  }

  // 2. 平均分
  for (let i = 0; i < 50; i++) {
    const q = app.generateShareQuestion();
    assert.equal(q.total, q.groups * q.perGroup, '总数必须等于 组数 × 每组数');
    assert.equal(q.answer, q.perGroup, '答案必须等于每组分配数');
    assert.ok(q.options.includes(q.answer), '选项必须包含答案');
  }

  // 3. 有余数除法
  for (let i = 0; i < 50; i++) {
    const q = app.generateRemainderQuestion();
    assert.equal(q.total, q.groups * q.perGroup + q.remainder, '总数 = 组数 × 每组数 + 余数');
    assert.equal(q.answer, q.remainder, '答案必须等于余数');
    assert.ok(q.remainder < q.groups, '余数必须严格小于除数/组数');
    assert.ok(q.options.includes(q.answer), '选项必须包含答案');
  }

  // 4. 九九乘法口诀声韵检验
  assert.equal(app.getRhymeChant(1, 1), '一一得一');
  assert.equal(app.getRhymeChant(3, 1), '一三得三');
  assert.equal(app.getRhymeChant(2, 5), '二五一十');
  assert.equal(app.getRhymeChant(3, 7), '三七二十一');
  assert.equal(app.getRhymeChant(9, 9), '九九八十一');
  assert.equal(app.getRhymeChant(4, 5), '四五二十');
});
