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

test('核心几何图形库包含完备的基础图形', () => {
  const { SHAPES } = loadShapeModule();
  assert.ok(SHAPES.circle && SHAPES.square && SHAPES.triangle && SHAPES.rectangle);
  assert.ok(Object.keys(SHAPES).length >= 8);
});

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

test('平面与立体图形库分别覆盖小学核心图形', () => {
  const { PLANE_SHAPES, SOLID_SHAPES, SHAPES } = loadShapeModule();

  assert.equal(Object.keys(PLANE_SHAPES).length, 12);
  assert.equal(Object.keys(SOLID_SHAPES).length, 8);
  assert.equal(Object.keys(SHAPES).length, 20);

  // 验证平面图形
  assert.ok(PLANE_SHAPES.square && PLANE_SHAPES.rectangle && PLANE_SHAPES.triangle && PLANE_SHAPES.circle);
  assert.ok(PLANE_SHAPES.parallelogram && PLANE_SHAPES.trapezoid && PLANE_SHAPES.diamond && PLANE_SHAPES.sector);
  assert.ok(PLANE_SHAPES.pentagon && PLANE_SHAPES.hexagon && PLANE_SHAPES.oval && PLANE_SHAPES.right_triangle);

  // 验证立体图形
  assert.ok(SOLID_SHAPES.cube && SOLID_SHAPES.cuboid && SOLID_SHAPES.cylinder && SOLID_SHAPES.sphere);
  assert.ok(SOLID_SHAPES.cone && SOLID_SHAPES.triangular_prism && SOLID_SHAPES.square_pyramid && SOLID_SHAPES.hexagonal_prism);
});

test('4x4 方位指令生成支持行列坐标与多向顺序计数', () => {
  const { getSpatialInstruction } = loadShapeModule();

  // 验证四个角落及坐标生成
  const instructions = new Set();
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      for (let k = 0; k < 30; k++) {
        const text = getSpatialInstruction(r, c);
        assert.equal(typeof text, 'string');
        assert.ok(text.length > 0);
        instructions.add(text);
      }
    }
  }

  // 验证包含了多维表达特征
  const allTexts = Array.from(instructions).join(' | ');
  assert.ok(allTexts.includes('行'));
  assert.ok(allTexts.includes('列') || allTexts.includes('个'));
  assert.ok(allTexts.includes('从上往下') || allTexts.includes('从下往上'));
  assert.ok(allTexts.includes('从左往右') || allTexts.includes('从右往左'));
  assert.ok(allTexts.includes('左上角') || allTexts.includes('右上角'));
});
