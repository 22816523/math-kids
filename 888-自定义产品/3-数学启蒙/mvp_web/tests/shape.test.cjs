const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadShapeModule() {
  const shapePath = path.resolve(__dirname, '../js/shape.js');
  const source = fs.readFileSync(shapePath, 'utf8');

  const createNode = () => ({
    style: {},
    dataset: {},
    innerHTML: '',
    textContent: '',
    children: [],
    className: '',
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    remove() {},
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return createNode();
    },
    querySelectorAll() {
      return [];
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 };
    },
    classList: {
      add() {},
      remove() {},
      toggle() {},
      contains() {
        return false;
      },
    },
  });

  const context = {
    module: { exports: {} },
    exports: {},
    console,
    Math,
    setTimeout,
    clearTimeout,
    document: {
      readyState: 'loading',
      querySelector() {
        return createNode();
      },
      querySelectorAll() {
        return [];
      },
      createElement() {
        return createNode();
      },
      addEventListener() {},
      body: createNode(),
    },
    window: {
      speechSynthesis: {
        cancel() {},
        speak() {},
      },
      PracticeSupport: {
        createPromptController() {
          return {
            showPrompt() {},
            hidePrompt() {},
          };
        },
      },
    },
    SpeechSynthesisUtterance: function SpeechSynthesisUtterance(text) {
      this.text = text;
    },
  };
  context.global = context;
  context.globalThis = context;
  context.window.document = context.document;

  vm.runInNewContext(source, context, { filename: shapePath });
  return context.module.exports;
}

test('拼一拼题库已经扩展到多个模板', () => {
  const { TANGRAM_PUZZLES } = loadShapeModule();

  assert.ok(TANGRAM_PUZZLES.length >= 10);
});

test('buildTangramQueue 会随机抽取一个不重复的练习队列', () => {
  const { buildTangramQueue, TANGRAM_ROUNDS_PER_SESSION } = loadShapeModule();

  const randomValues = [
    0.91, 0.18, 0.63, 0.47, 0.04, 0.76, 0.32, 0.58, 0.27, 0.84, 0.12, 0.69,
    0.23, 0.51, 0.95, 0.07, 0.38, 0.81, 0.16, 0.44, 0.72, 0.29, 0.55, 0.88,
  ];
  let index = 0;
  const queue = buildTangramQueue(() => {
    const value = randomValues[index % randomValues.length];
    index += 1;
    return value;
  });

  assert.equal(queue.length, TANGRAM_ROUNDS_PER_SESSION);
  assert.equal(new Set(queue.map((item) => item.name)).size, queue.length);
  assert.ok(queue.every((item) => item.pieces.length >= 3));
  assert.ok(queue.every((item) => item.pieces.every((piece) => typeof piece.color === 'string' && piece.color.startsWith('#'))));
});
