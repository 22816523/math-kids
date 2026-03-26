const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const sudokuModulePath = path.resolve(__dirname, '../js/sudoku.js');

test('数独阶段配置包含 6 个梯度', () => {
  const {
    SUDOKU_STAGE_ORDER,
    SUDOKU_STAGE_CONFIGS,
  } = require(sudokuModulePath);

  assert.deepEqual(SUDOKU_STAGE_ORDER, [
    '4x4-easy',
    '4x4-advanced',
    '6x6-easy',
    '6x6-advanced',
    '9x9-easy',
    '9x9-advanced',
  ]);

  assert.equal(SUDOKU_STAGE_CONFIGS['4x4-easy'].size, 4);
  assert.equal(SUDOKU_STAGE_CONFIGS['4x4-easy'].subgridRows, 2);
  assert.equal(SUDOKU_STAGE_CONFIGS['4x4-easy'].subgridCols, 2);
  assert.equal(SUDOKU_STAGE_CONFIGS['4x4-easy'].label, '4乘4入门');

  assert.equal(SUDOKU_STAGE_CONFIGS['6x6-easy'].size, 6);
  assert.equal(SUDOKU_STAGE_CONFIGS['6x6-easy'].subgridRows, 2);
  assert.equal(SUDOKU_STAGE_CONFIGS['6x6-easy'].subgridCols, 3);
  assert.equal(SUDOKU_STAGE_CONFIGS['6x6-easy'].label, '6乘6入门');
  assert.equal(SUDOKU_STAGE_CONFIGS['6x6-advanced'].intro.includes('每一排'), true);

  assert.equal(SUDOKU_STAGE_CONFIGS['9x9-easy'].size, 9);
  assert.equal(SUDOKU_STAGE_CONFIGS['9x9-easy'].subgridRows, 3);
  assert.equal(SUDOKU_STAGE_CONFIGS['9x9-easy'].subgridCols, 3);
  assert.equal(SUDOKU_STAGE_CONFIGS['9x9-easy'].label, '9乘9入门');
});

test('候选数字会同时考虑行、列和宫格规则', () => {
  const {
    getAllowedValues,
    isPlacementValid,
  } = require(sudokuModulePath);

  const board4 = [
    [1, 0, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ];

  assert.deepEqual(getAllowedValues(board4, 0, 1, '4x4-easy'), [2]);
  assert.equal(isPlacementValid(board4, 0, 1, 2, '4x4-easy'), true);
  assert.equal(isPlacementValid(board4, 0, 1, 1, '4x4-easy'), false);

  const board6 = [
    [1, 0, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 4, 5, 6, 1],
    [5, 6, 1, 2, 3, 4],
    [3, 4, 5, 6, 1, 2],
    [6, 1, 2, 3, 4, 5],
  ];

  assert.deepEqual(getAllowedValues(board6, 0, 1, '6x6-easy'), [2]);
  assert.equal(isPlacementValid(board6, 0, 1, 2, '6x6-easy'), true);
  assert.equal(isPlacementValid(board6, 0, 1, 6, '6x6-easy'), false);
});

test('buildSudokuQueue 会生成不超过题库大小的随机练习队列', () => {
  const {
    buildSudokuQueue,
    SUDOKU_PUZZLES,
  } = require(sudokuModulePath);

  const randomValues = [0.91, 0.18, 0.63, 0.47, 0.04, 0.76, 0.32, 0.58];
  let index = 0;

  const queue = buildSudokuQueue('4x4-easy', () => {
    const value = randomValues[index % randomValues.length];
    index += 1;
    return value;
  });

  assert.equal(queue.length, Math.min(5, SUDOKU_PUZZLES['4x4-easy'].length));
  assert.equal(new Set(queue.map((item) => item.id)).size, queue.length);
  assert.ok(queue.every((item) => item.givens.length === 4));
  assert.ok(queue.every((item) => item.solution.length === 4));
});
