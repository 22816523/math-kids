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
    assert.ok(q.questionHtml.includes(q.itemName), '题干物品名必须与图标匹配');
    assert.ok(q.questionHtml.includes(q.animalName), '题干动物名必须与头像匹配');
    assert.ok(q.audioText.includes(q.itemName) && q.audioText.includes(q.animalName), '语音文案必须与图文一致');
  }

  // 4. 九九乘法口诀声韵检验
  assert.equal(app.getRhymeChant(1, 1), '一一得一');
  assert.equal(app.getRhymeChant(3, 1), '一三得三');
  assert.equal(app.getRhymeChant(2, 5), '二五一十');
  assert.equal(app.getRhymeChant(3, 7), '三七二十一');
  assert.equal(app.getRhymeChant(9, 9), '九九八十一');
  assert.equal(app.getRhymeChant(4, 5), '四五二十');

  // 5. 阶梯乘法口诀表校验 (1有1个，2有2个...9有9个，全表45式)
  for (let n = 1; n <= 9; n++) {
    const list = app.getStairTableFormulas(n);
    assert.equal(list.length, n, `${n}的口诀列表数量必须严格等于 ${n}`);
    assert.equal(list[0].a, 1);
    assert.equal(list[0].b, n);
    assert.equal(list[list.length - 1].a, n);
    assert.equal(list[list.length - 1].b, n);
  }

  // 1的口诀仅有一一得一
  const list1 = app.getStairTableFormulas(1);
  assert.equal(list1.length, 1);
  assert.equal(list1[0].formula, '1 × 1 = 1');
  assert.equal(list1[0].chant, '一一得一');

  // 全表必须恰好 45 式
  const allList = app.getStairTableFormulas('all');
  assert.equal(allList.length, 45, '九九乘法表全表必须严格由45句口诀构成');
  assert.equal(allList[0].formula, '1 × 1 = 1');
  assert.equal(allList[0].chant, '一一得一');
  assert.equal(allList[44].formula, '9 × 9 = 81');
  assert.equal(allList[44].chant, '九九八十一');
});
