const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadMathModule() {
  const code = fs.readFileSync(path.join(__dirname, '../js/math.js'), 'utf8');
  const dummyEl = {
    addEventListener: () => {},
    appendChild: () => {},
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  };
  const dom = {
    addEventListener: () => {},
    querySelector: () => dummyEl,
    querySelectorAll: () => Array(10).fill(dummyEl)
  };
  const sandbox = {
    window: {
      PracticeSupport: {
        createPromptController: () => ({
          showPrompt: () => {},
          hidePrompt: () => {}
        })
      }
    },
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
  return sandbox.window.mathApp;
}

function loadGame24Module() {
  const code = fs.readFileSync(path.join(__dirname, '../js/game24.js'), 'utf8');
  const dom = {
    addEventListener: () => {},
    getElementById: () => ({
      addEventListener: () => {},
      appendChild: () => {},
      innerHTML: '',
      style: {},
      classList: { add: () => {}, remove: () => {} }
    }),
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

test('math.js 核心计算单轮 5 题绝无一模一样的重复题目', () => {
  const app = loadMathModule();
  assert.ok(app, 'mathApp 应当成功挂载');

  // 测试 Level 1、Level 2、Level 3 各进行 30 轮练习
  [1, 2, 3].forEach(lvl => {
    app.state.level = lvl;
    for (let r = 0; r < 30; r++) {
      app.startPractice();
      const keysThisRound = new Set();
      for (let qIdx = 0; qIdx < 5; qIdx++) {
        if (lvl === 1) app.generateLevel1Question();
        else if (lvl === 2) app.generateLevel2Question();
        else app.generateLevel3Question();

        const q = app.state.question;
        const sig = q.a !== undefined ? `${q.a}+${q.b}` : `${q.total}-${q.subtract}`;
        keysThisRound.add(sig);
      }
      assert.equal(keysThisRound.size, 5, `Level ${lvl} 第 ${r + 1} 轮内 5 道题目必须全部互不相同`);
    }
  });
});

test('game24.js 关卡内题目唯一性与算式生成丰富度', () => {
  const app = loadGame24Module();
  assert.ok(app, 'calcChallengeApp 应当成功挂载');

  // 1. 测试各关卡算式生成丰富度
  for (let lvl = 1; lvl <= 10; lvl++) {
    const rushSet = new Set();
    for (let i = 0; i < 5; i++) {
      const q = app.generateCalcRushQuestion(lvl);
      rushSet.add(q.formulaHtml);
    }
    // 至少有很高的多样性
    assert.ok(rushSet.size >= 3, `关卡 ${lvl} 随机生成必须具有高多样性`);
  }
});
