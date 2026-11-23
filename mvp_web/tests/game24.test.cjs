const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadCalcApp() {
  const code = fs.readFileSync(path.join(__dirname, '../js/game24.js'), 'utf8');
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
    Array,
    parseInt
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return sandbox.window.calcChallengeApp;
}

test('计算大闯关 1~10 关卡阶梯覆盖 (从5以内到两位数乘除法)', () => {
  const app = loadCalcApp();
  assert.ok(app, 'calcChallengeApp 应当正确挂载');
  assert.equal(app.LEVEL_CONFIGS.length, 10, '应严格提供 10 个梯度关卡');

  for (let lvl = 1; lvl <= 10; lvl++) {
    // 1. 计算闯关
    const rushQ = app.generateCalcRushQuestion(lvl);
    assert.ok(rushQ.formulaHtml, `第 ${lvl} 关计算闯关必须生成 formulaHtml`);
    assert.notEqual(rushQ.answer, undefined, `第 ${lvl} 关必须有正确答案`);
    assert.ok(rushQ.options.includes(rushQ.answer), `第 ${lvl} 关选项必须包含正确答案`);

    // 2. 方框填空
    const blankQ = app.generateBlankBoxQuestion(lvl);
    assert.ok(blankQ.formulaHtml.includes('blank-box'), `第 ${lvl} 关方框填空必须包含 blank-box`);
    assert.notEqual(blankQ.answer, undefined, `第 ${lvl} 关方框题必须有答案`);
    assert.ok(blankQ.options.includes(blankQ.answer), `第 ${lvl} 关方框题选项必须包含正确答案`);

    // 3. 混合运算
    const mixedQ = app.generateMixedCalcQuestion(lvl);
    assert.ok(mixedQ.formulaHtml, `第 ${lvl} 关混合运算必须生成 formulaHtml`);
    assert.notEqual(mixedQ.answer, undefined, `第 ${lvl} 关混合运算必须有答案`);
    assert.ok(mixedQ.options.includes(mixedQ.answer), `第 ${lvl} 关混合运算选项必须包含正确答案`);
  }

  // 验证最低关与最高关难度范围
  for (let i = 0; i < 5; i++) {
    const q1 = app.generateCalcRushQuestion(1);
    assert.ok(q1.answer <= 5 && q1.answer >= 0, '第 1 关答案应在 5 以内');

    const q10 = app.generateCalcRushQuestion(10);
    assert.ok(q10.formulaHtml.includes('×') || q10.formulaHtml.includes('÷'), '第 10 关应当为乘除法运算');
  }
});
