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

  // 验证最低关与最高关难度范围，并严格检验无表外除法
  for (let i = 0; i < 10; i++) {
    const q1 = app.generateCalcRushQuestion(1);
    assert.ok(q1.answer <= 5 && q1.answer >= 0, '第 1 关答案应在 5 以内');
  }

  // 第 7 关严格为表内除法
  for (let i = 0; i < 60; i++) {
    const q7 = app.generateCalcRushQuestion(7);
    const m = q7.formulaHtml.match(/<span>(\d+)<\/span> <span>÷<\/span> <span>(\d+)<\/span>/);
    assert.ok(m, '第 7 关必须为除法题');
    const dividend = parseInt(m[1], 10);
    const divisor = parseInt(m[2], 10);
    assert.ok(divisor >= 2 && divisor <= 9, '第 7 关除数必须在 2~9 内');
    assert.ok(q7.answer >= 2 && q7.answer <= 9, '第 7 关商必须在 2~9 内（表内除法）');
    assert.equal(dividend, divisor * q7.answer, '被除数必须严格整除');
  }

  // 第 8、9、10 关绝不出现除法，且第 10 关覆盖三位数×一位数与大两位数×两位数
  let sawThreeDigitMult = false;
  let sawTwoByTwoMult = false;
  for (let i = 0; i < 80; i++) {
    for (const lvl of [8, 9, 10]) {
      const q = app.generateCalcRushQuestion(lvl);
      assert.ok(!q.formulaHtml.includes('÷'), `第 ${lvl} 关不允许出现表外除法`);
      assert.ok(q.formulaHtml.includes('×'), `第 ${lvl} 关必须为乘法`);
      assert.ok(Number.isInteger(q.answer), `第 ${lvl} 关答案必须为整数`);
      if (lvl === 10) {
        const m = q.formulaHtml.match(/<span>(\d+)<\/span> <span>×<\/span> <span>(\d+)<\/span>/);
        const a = parseInt(m[1], 10);
        const b = parseInt(m[2], 10);
        if (a >= 100 && b <= 9) sawThreeDigitMult = true;
        if (a >= 21 && a <= 99 && b >= 12) sawTwoByTwoMult = true;
      }
    }
  }
  assert.ok(sawThreeDigitMult, '第 10 关应覆盖三位数乘一位数');
  assert.ok(sawTwoByTwoMult, '第 10 关应覆盖较大两位数乘两位数');

  // 混合运算第 8~10 关若出现除法，必须严格为表内除法
  for (let i = 0; i < 80; i++) {
    const q = app.generateMixedCalcQuestion(10);
    assert.ok(Number.isInteger(q.answer), '混合运算答案必须为整数');
    if (q.formulaHtml.includes('÷')) {
      const divResMatch = q.formulaHtml.match(/<span>÷<\/span> <span>(\d+)<\/span> <span>=<\/span> (?:<span>(\d+)<\/span>|<span class="blank-box">\?<\/span>)/);
      assert.ok(divResMatch, '混合运算除法格式正确');
      const divisor = parseInt(divResMatch[1], 10);
      const quotient = divResMatch[2] ? parseInt(divResMatch[2], 10) : q.answer;
      assert.ok(divisor >= 2 && divisor <= 9, '混合运算除数必须在 2~9 内');
      assert.ok(quotient >= 2 && quotient <= 9, '混合运算商必须在 2~9 内（表内除法）');
    }
  }
});
