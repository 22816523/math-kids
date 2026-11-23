const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadStoryModule() {
  const code = fs.readFileSync(path.join(__dirname, '../js/story.js'), 'utf8');
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
  return sandbox.window.storyApp;
}

test('故事应用题每轮固定10题且难度梯级严格对齐 (3简单 + 3中等 + 3困难 + 1综合)', () => {
  const storyApp = loadStoryModule();
  assert.ok(storyApp, 'storyApp 应当挂载到 window');

  // 验证各层级题库扩充容量 (36道全库)
  assert.equal(storyApp.getEasyPool().length, 10, '简单题库必须扩充至 10 道');
  assert.equal(storyApp.getMediumPool().length, 10, '中等题库必须扩充至 10 道');
  assert.equal(storyApp.getHardPool().length, 10, '困难题库必须扩充至 10 道');
  assert.equal(storyApp.getComprehensivePool().length, 6, '综合题库必须扩充至 6 道');

  for (let round = 0; round < 30; round++) {
    const queue = storyApp.buildStoryRoundQueue();
    assert.equal(queue.length, 10, '每轮题目数必须严格为 10');

    // 验证单轮内 10 道题模板严格去重，无任何两题一模一样
    const templateNames = queue.map(q => q.templateName);
    const uniqueTemplates = new Set(templateNames);
    assert.equal(uniqueTemplates.size, 10, `第 ${round + 1} 轮内 10 道题目模板必须互不相同、无一重复`);

    // 检查梯级划分
    for (let i = 0; i < 3; i++) {
      assert.equal(queue[i].diff, 'easy', `第 ${i + 1} 题应当是简单题`);
    }
    for (let i = 3; i < 6; i++) {
      assert.equal(queue[i].diff, 'medium', `第 ${i + 1} 题应当是中等题`);
    }
    for (let i = 6; i < 9; i++) {
      assert.equal(queue[i].diff, 'hard', `第 ${i + 1} 题应当是困难题`);
    }
    assert.equal(queue[9].diff, 'comp', '第 10 题应当是综合压轴题');

    // 检查字段完整性
    queue.forEach((q, idx) => {
      assert.ok(q.questionHtml, `第 ${idx + 1} 题必须包含 questionHtml`);
      assert.ok(q.audioText, `第 ${idx + 1} 题必须包含 audioText`);
      assert.ok(q.options && q.options.length >= 2, `第 ${idx + 1} 题必须提供选项列表`);
      assert.notEqual(q.answer, undefined, `第 ${idx + 1} 题必须有确切答案`);
      assert.ok(q.options.some(opt => String(opt) === String(q.answer)), `第 ${idx + 1} 题选项必须包含正确答案`);
    });
  }
});
