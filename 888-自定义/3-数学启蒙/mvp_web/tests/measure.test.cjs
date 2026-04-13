const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createNode() {
  return {
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
    insertBefore(child) {
      this.children.unshift(child);
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
    classList: {
      add() {},
      remove() {},
      contains() {
        return false;
      },
    },
  };
}

function loadMeasureModule() {
  const measurePath = path.resolve(__dirname, '../js/measure.js');
  const source = fs.readFileSync(measurePath, 'utf8');
  const head = createNode();

  const context = {
    module: { exports: {} },
    exports: {},
    console,
    Math,
    setTimeout,
    clearTimeout,
    document: {
      head,
      readyState: 'complete',
      querySelector() {
        return createNode();
      },
      querySelectorAll() {
        return [];
      },
      createElement() {
        return createNode();
      },
      getElementById() {
        return createNode();
      },
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

  vm.runInNewContext(source, context, { filename: measurePath });
  return context.module.exports;
}

test('比较练习类型不再包含轻重天平题', () => {
  const { getComparePracticeTypes } = loadMeasureModule();

  assert.equal(getComparePracticeTypes().join(','), 'length,height,count,size,thick');
});

test('轻重练习会生成一组可见的托盘物品', () => {
  const { createWeightTrayItems } = loadMeasureModule();

  const tray = createWeightTrayItems({ target: 4, rightIcon: '🍎' }, 2);

  assert.equal(tray.length, 6);
  assert.ok(tray.every((item) => item.icon === '🍎'));
});

test('轻重选项始终包含一样', () => {
  const { buildWeightChoiceOptions } = loadMeasureModule();

  const options = buildWeightChoiceOptions({
    a: { emoji: '🍉', label: '西瓜' },
    b: { emoji: '🍎', label: '苹果' },
  });

  assert.equal(options.map((item) => item.key).join(','), 'a,b,same');
  assert.equal(options[2].text, '一样');
});

test('日历月份数据会保留完整网格和 31 天', () => {
  const { CALENDAR_MONTH_INFO, getCalendarMonthCells } = loadMeasureModule();

  const cells = getCalendarMonthCells(12);
  const emptyCount = cells.filter((cell) => cell.empty).length;
  const dayCells = cells.filter((cell) => !cell.empty);

  assert.equal(CALENDAR_MONTH_INFO.daysInMonth, 31);
  assert.equal(emptyCount, 3);
  assert.equal(dayCells.length, 31);
  assert.equal(dayCells.find((cell) => cell.day === 12).isToday, true);
});
