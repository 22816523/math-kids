/* ============================================
   数独启蒙 · 核心逻辑
   支持 4x4 / 6x6 / 9x9 的分阶段题库与触屏交互
   ============================================ */
(function (global, factory) {
  const api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        api.initSudokuPage();
      }, { once: true });
    } else {
      api.initSudokuPage();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SUDOKU_STAGE_ORDER = [
    '4x4-easy',
    '4x4-advanced',
    '6x6-easy',
    '6x6-advanced',
    '9x9-easy',
    '9x9-advanced',
  ];

  const SUDOKU_STAGE_CONFIGS = Object.freeze({
    '4x4-easy': {
      id: '4x4-easy',
      label: '4x4 入门',
      icon: '🌱',
      size: 4,
      subgridRows: 2,
      subgridCols: 2,
      roundsPerSession: 5,
      intro: '先从最小的数独开始，每次补几个空格。',
    },
    '4x4-advanced': {
      id: '4x4-advanced',
      label: '4x4 进阶',
      icon: '🚀',
      size: 4,
      subgridRows: 2,
      subgridCols: 2,
      roundsPerSession: 5,
      intro: '空格更多一点，开始连续想几步。',
    },
    '6x6-easy': {
      id: '6x6-easy',
      label: '6x6 入门',
      icon: '🌼',
      size: 6,
      subgridRows: 2,
      subgridCols: 3,
      roundsPerSession: 5,
      intro: '适应更大的盘面，学会看 1 到 6。',
    },
    '6x6-advanced': {
      id: '6x6-advanced',
      label: '6x6 进阶',
      icon: '✨',
      size: 6,
      subgridRows: 2,
      subgridCols: 3,
      roundsPerSession: 5,
      intro: '继续观察行、列和小宫格，试着多想几步。',
    },
    '9x9-easy': {
      id: '9x9-easy',
      label: '9x9 入门',
      icon: '🌟',
      size: 9,
      subgridRows: 3,
      subgridCols: 3,
      roundsPerSession: 5,
      intro: '开始体验标准数独，但先从缺口少的题目开始。',
    },
    '9x9-advanced': {
      id: '9x9-advanced',
      label: '9x9 进阶',
      icon: '🏆',
      size: 9,
      subgridRows: 3,
      subgridCols: 3,
      roundsPerSession: 5,
      intro: '空格更多一点，慢慢挑战更完整的儿童数独。',
    },
  });

  const BASE_SOLUTIONS = Object.freeze({
    4: [
      [1, 2, 3, 4],
      [3, 4, 1, 2],
      [2, 1, 4, 3],
      [4, 3, 2, 1],
    ],
    6: [
      [1, 2, 3, 4, 5, 6],
      [4, 5, 6, 1, 2, 3],
      [2, 3, 4, 5, 6, 1],
      [5, 6, 1, 2, 3, 4],
      [3, 4, 5, 6, 1, 2],
      [6, 1, 2, 3, 4, 5],
    ],
    9: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [4, 5, 6, 7, 8, 9, 1, 2, 3],
      [7, 8, 9, 1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7, 8, 9, 1],
      [5, 6, 7, 8, 9, 1, 2, 3, 4],
      [8, 9, 1, 2, 3, 4, 5, 6, 7],
      [3, 4, 5, 6, 7, 8, 9, 1, 2],
      [6, 7, 8, 9, 1, 2, 3, 4, 5],
      [9, 1, 2, 3, 4, 5, 6, 7, 8],
    ],
  });

  function cloneGrid(grid) {
    return grid.map((row) => row.slice());
  }

  function createMaskedPuzzle(id, solution, blanks) {
    const blankSet = new Set(blanks.map(([row, col]) => `${row}:${col}`));
    const givens = solution.map((row, rowIndex) => row.map((value, colIndex) => (
      blankSet.has(`${rowIndex}:${colIndex}`) ? 0 : value
    )));

    return {
      id,
      givens,
      solution: cloneGrid(solution),
    };
  }

  const SUDOKU_PUZZLES = Object.freeze({
    '4x4-easy': [
      createMaskedPuzzle('4e-1', BASE_SOLUTIONS[4], [[0, 1], [2, 2]]),
      createMaskedPuzzle('4e-2', BASE_SOLUTIONS[4], [[0, 3], [3, 0], [1, 2]]),
      createMaskedPuzzle('4e-3', BASE_SOLUTIONS[4], [[1, 1], [2, 0], [3, 2]]),
      createMaskedPuzzle('4e-4', BASE_SOLUTIONS[4], [[0, 0], [1, 3]]),
      createMaskedPuzzle('4e-5', BASE_SOLUTIONS[4], [[0, 2], [2, 1], [3, 3]]),
    ],
    '4x4-advanced': [
      createMaskedPuzzle('4a-1', BASE_SOLUTIONS[4], [[0, 1], [0, 2], [1, 0], [2, 3]]),
      createMaskedPuzzle('4a-2', BASE_SOLUTIONS[4], [[0, 0], [1, 1], [1, 2], [2, 1], [3, 3]]),
      createMaskedPuzzle('4a-3', BASE_SOLUTIONS[4], [[0, 3], [1, 0], [1, 2], [2, 0], [2, 3]]),
      createMaskedPuzzle('4a-4', BASE_SOLUTIONS[4], [[0, 0], [0, 2], [1, 3], [2, 1], [3, 0], [3, 2]]),
      createMaskedPuzzle('4a-5', BASE_SOLUTIONS[4], [[0, 1], [1, 0], [1, 2], [2, 3], [3, 1], [3, 3]]),
    ],
    '6x6-easy': [
      createMaskedPuzzle('6e-1', BASE_SOLUTIONS[6], [[0, 1], [1, 3], [2, 5], [4, 0]]),
      createMaskedPuzzle('6e-2', BASE_SOLUTIONS[6], [[0, 4], [1, 1], [3, 2], [5, 5], [4, 3]]),
      createMaskedPuzzle('6e-3', BASE_SOLUTIONS[6], [[0, 0], [2, 2], [2, 4], [4, 5], [5, 1]]),
      createMaskedPuzzle('6e-4', BASE_SOLUTIONS[6], [[0, 2], [1, 5], [3, 0], [4, 4], [5, 3]]),
      createMaskedPuzzle('6e-5', BASE_SOLUTIONS[6], [[0, 5], [1, 2], [2, 0], [3, 4], [5, 2], [4, 1]]),
    ],
    '6x6-advanced': [
      createMaskedPuzzle('6a-1', BASE_SOLUTIONS[6], [[0, 1], [0, 4], [1, 0], [1, 5], [2, 2], [3, 3], [4, 1], [5, 4]]),
      createMaskedPuzzle('6a-2', BASE_SOLUTIONS[6], [[0, 0], [0, 3], [1, 1], [1, 4], [2, 5], [3, 2], [4, 0], [4, 4], [5, 3]]),
      createMaskedPuzzle('6a-3', BASE_SOLUTIONS[6], [[0, 2], [0, 5], [1, 0], [2, 1], [2, 4], [3, 3], [4, 2], [5, 1], [5, 5]]),
      createMaskedPuzzle('6a-4', BASE_SOLUTIONS[6], [[0, 4], [1, 2], [1, 5], [2, 0], [2, 3], [3, 1], [4, 4], [5, 0], [5, 2], [4, 5]]),
      createMaskedPuzzle('6a-5', BASE_SOLUTIONS[6], [[0, 1], [1, 3], [1, 4], [2, 2], [3, 0], [3, 5], [4, 1], [4, 3], [5, 2], [5, 4]]),
    ],
    '9x9-easy': [
      createMaskedPuzzle('9e-1', BASE_SOLUTIONS[9], [[0, 1], [1, 4], [2, 8], [3, 0], [4, 3], [5, 7], [7, 2], [8, 6]]),
      createMaskedPuzzle('9e-2', BASE_SOLUTIONS[9], [[0, 5], [1, 1], [2, 6], [3, 4], [4, 8], [5, 2], [6, 0], [7, 7], [8, 3]]),
      createMaskedPuzzle('9e-3', BASE_SOLUTIONS[9], [[0, 0], [0, 8], [1, 3], [2, 2], [3, 5], [4, 4], [5, 6], [7, 1], [8, 7]]),
      createMaskedPuzzle('9e-4', BASE_SOLUTIONS[9], [[0, 2], [1, 6], [2, 4], [3, 8], [4, 1], [5, 5], [6, 3], [7, 0], [8, 4], [8, 8]]),
      createMaskedPuzzle('9e-5', BASE_SOLUTIONS[9], [[0, 7], [1, 0], [2, 5], [3, 2], [4, 6], [5, 3], [6, 8], [7, 4], [8, 1]]),
    ],
    '9x9-advanced': [
      createMaskedPuzzle('9a-1', BASE_SOLUTIONS[9], [[0, 1], [0, 4], [1, 2], [1, 6], [2, 0], [2, 8], [3, 3], [3, 5], [4, 1], [4, 7], [5, 2], [5, 6], [6, 0], [6, 4], [7, 3], [8, 5]]),
      createMaskedPuzzle('9a-2', BASE_SOLUTIONS[9], [[0, 0], [0, 3], [1, 4], [1, 8], [2, 2], [2, 7], [3, 1], [3, 6], [4, 4], [4, 5], [5, 0], [5, 8], [6, 2], [6, 3], [7, 6], [8, 1], [8, 7]]),
      createMaskedPuzzle('9a-3', BASE_SOLUTIONS[9], [[0, 2], [0, 6], [1, 1], [1, 5], [2, 3], [2, 8], [3, 0], [3, 4], [4, 2], [4, 7], [5, 1], [5, 6], [6, 5], [6, 8], [7, 0], [7, 4], [8, 3], [8, 7]]),
      createMaskedPuzzle('9a-4', BASE_SOLUTIONS[9], [[0, 7], [1, 0], [1, 4], [2, 1], [2, 5], [3, 2], [3, 8], [4, 0], [4, 4], [4, 8], [5, 3], [5, 6], [6, 1], [6, 7], [7, 2], [7, 6], [8, 0], [8, 5]]),
      createMaskedPuzzle('9a-5', BASE_SOLUTIONS[9], [[0, 1], [0, 8], [1, 3], [1, 7], [2, 0], [2, 4], [2, 6], [3, 5], [3, 7], [4, 1], [4, 6], [5, 2], [5, 8], [6, 3], [6, 5], [7, 0], [7, 4], [8, 2], [8, 7]]),
    ],
  });

  function getStageConfig(stageIdOrConfig) {
    if (!stageIdOrConfig) return null;
    return typeof stageIdOrConfig === 'string'
      ? SUDOKU_STAGE_CONFIGS[stageIdOrConfig] || null
      : stageIdOrConfig;
  }

  function shuffleList(items, randomFn) {
    const source = items.slice();
    const nextRandom = typeof randomFn === 'function' ? randomFn : Math.random;

    for (let index = source.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(nextRandom() * (index + 1));
      [source[index], source[swapIndex]] = [source[swapIndex], source[index]];
    }

    return source;
  }

  function buildSudokuQueue(stageId, randomFn) {
    const config = getStageConfig(stageId);
    const puzzles = SUDOKU_PUZZLES[stageId] || [];
    const rounds = Math.min(config?.roundsPerSession || 5, puzzles.length);

    return shuffleList(puzzles, randomFn)
      .slice(0, rounds)
      .map((puzzle) => ({
        id: puzzle.id,
        givens: cloneGrid(puzzle.givens),
        solution: cloneGrid(puzzle.solution),
      }));
  }

  function getSubgridStart(index, span) {
    return Math.floor(index / span) * span;
  }

  function isPlacementValid(board, row, col, value, stageIdOrConfig) {
    const config = getStageConfig(stageIdOrConfig);
    if (!config || !Number.isInteger(value) || value < 1 || value > config.size) {
      return false;
    }

    for (let colIndex = 0; colIndex < config.size; colIndex += 1) {
      if (colIndex !== col && board[row][colIndex] === value) {
        return false;
      }
    }

    for (let rowIndex = 0; rowIndex < config.size; rowIndex += 1) {
      if (rowIndex !== row && board[rowIndex][col] === value) {
        return false;
      }
    }

    const boxRowStart = getSubgridStart(row, config.subgridRows);
    const boxColStart = getSubgridStart(col, config.subgridCols);

    for (let rowIndex = boxRowStart; rowIndex < boxRowStart + config.subgridRows; rowIndex += 1) {
      for (let colIndex = boxColStart; colIndex < boxColStart + config.subgridCols; colIndex += 1) {
        if ((rowIndex !== row || colIndex !== col) && board[rowIndex][colIndex] === value) {
          return false;
        }
      }
    }

    return true;
  }

  function getAllowedValues(board, row, col, stageIdOrConfig) {
    const config = getStageConfig(stageIdOrConfig);
    if (!config || board[row][col] !== 0) {
      return [];
    }

    const values = [];
    for (let value = 1; value <= config.size; value += 1) {
      if (isPlacementValid(board, row, col, value, config)) {
        values.push(value);
      }
    }
    return values;
  }

  function getConflictReason(board, row, col, value, stageIdOrConfig) {
    const config = getStageConfig(stageIdOrConfig);
    if (!config) return null;

    for (let colIndex = 0; colIndex < config.size; colIndex += 1) {
      if (colIndex !== col && board[row][colIndex] === value) {
        return 'row';
      }
    }

    for (let rowIndex = 0; rowIndex < config.size; rowIndex += 1) {
      if (rowIndex !== row && board[rowIndex][col] === value) {
        return 'col';
      }
    }

    const boxRowStart = getSubgridStart(row, config.subgridRows);
    const boxColStart = getSubgridStart(col, config.subgridCols);

    for (let rowIndex = boxRowStart; rowIndex < boxRowStart + config.subgridRows; rowIndex += 1) {
      for (let colIndex = boxColStart; colIndex < boxColStart + config.subgridCols; colIndex += 1) {
        if ((rowIndex !== row || colIndex !== col) && board[rowIndex][colIndex] === value) {
          return 'box';
        }
      }
    }

    return null;
  }

  function countEmptyCells(board) {
    return board.reduce((count, row) => count + row.filter((cell) => cell === 0).length, 0);
  }

  function findFirstEmptyCell(board) {
    for (let rowIndex = 0; rowIndex < board.length; rowIndex += 1) {
      for (let colIndex = 0; colIndex < board[rowIndex].length; colIndex += 1) {
        if (board[rowIndex][colIndex] === 0) {
          return { row: rowIndex, col: colIndex };
        }
      }
    }
    return null;
  }

  function initSudokuPage() {
    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    const stageTabs = $$('.mode-tab');
    if (stageTabs.length === 0) return null;

    const questionBar = $('#questionBar');
    const questionIcon = $('#questionIcon');
    const questionText = $('#questionText');
    const questionSpeaker = $('#questionSpeaker');
    const boardHost = $('#boardHost');
    const digitBank = $('#digitBank');
    const helperText = $('#helperText');
    const feedback = $('#feedback');
    const progressText = $('#progressText');
    const stageHint = $('#stageHint');
    const bottomActions = $('#bottomActions');
    const actionBtn = $('#actionBtn');

    const state = {
      stageId: SUDOKU_STAGE_ORDER[0],
      queue: [],
      puzzleIndex: 0,
      currentPuzzle: null,
      board: [],
      selectedCell: null,
      practiceMode: false,
      wrongCell: null,
      wrongTimer: null,
      advanceTimer: null,
    };

    function speak(text) {
      if (!text || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    const promptController = window.PracticeSupport?.createPromptController({
      questionBar,
      questionIcon,
      questionText,
      speakerButton: questionSpeaker,
      speak,
    }) || {
      showPrompt(icon, text) {
        if (questionBar) questionBar.style.display = 'flex';
        if (questionIcon) questionIcon.textContent = icon || '';
        if (questionText) questionText.textContent = text || '';
      },
      hidePrompt() {},
    };

    function setPrompt(icon, text, speechText) {
      promptController.showPrompt(icon, text, {
        speechText: speechText || text,
        autoSpeak: true,
        allowReplay: true,
      });
    }

    function setFeedback(text, type) {
      feedback.textContent = text || '';
      feedback.className = `feedback ${type || ''}`.trim();
      if (text) {
        speak(text.replace(/^[^\u4e00-\u9fa5A-Za-z0-9]+/u, ''));
      }
    }

    function clearTransientState() {
      clearTimeout(state.wrongTimer);
      clearTimeout(state.advanceTimer);
      state.wrongCell = null;
    }

    function updateStageTabs() {
      stageTabs.forEach((tab) => {
        tab.classList.toggle('active', tab.dataset.stage === state.stageId);
      });
    }

    function updateProgress() {
      const config = getStageConfig(state.stageId);
      if (!config) return;
      stageHint.textContent = `${config.icon} ${config.label}`;
      progressText.textContent = state.practiceMode && state.queue.length
        ? `第 ${state.puzzleIndex + 1} / ${state.queue.length} 题`
        : '准备开始';
    }

    function showBottomAction(text, callback, className) {
      bottomActions.style.display = 'flex';
      actionBtn.textContent = text;
      actionBtn.className = className || 'btn btn-green btn-lg';
      actionBtn.onclick = callback;
    }

    function hideBottomAction() {
      bottomActions.style.display = 'none';
      actionBtn.onclick = null;
    }

    function renderIntroCard() {
      const config = getStageConfig(state.stageId);
      boardHost.innerHTML = `
        <div class="sudoku-intro-card">
          <div class="intro-emoji">${config.icon}</div>
          <div class="intro-title">${config.label}</div>
          <div class="intro-desc">${config.intro}</div>
          <div class="intro-rule">每一行、每一列、每个小宫格都不能重复。</div>
        </div>
      `;
    }

    function showStageIntro() {
      const config = getStageConfig(state.stageId);
      clearTransientState();
      state.practiceMode = false;
      state.queue = [];
      state.puzzleIndex = 0;
      state.currentPuzzle = null;
      state.board = [];
      state.selectedCell = null;
      updateStageTabs();
      updateProgress();
      renderIntroCard();
      digitBank.innerHTML = '';
      digitBank.style.display = 'none';
      helperText.textContent = '先观察规则，再开始做题。';
      setFeedback('', '');
      setPrompt('🧩', `${config.label}：把空格补完整`, `${config.label}。${config.intro}`);
      showBottomAction('🎯 开始练习', startStagePractice, 'btn btn-green btn-lg');
    }

    function renderBoard() {
      const config = getStageConfig(state.stageId);
      const selected = state.selectedCell;

      boardHost.innerHTML = '';
      const boardEl = document.createElement('div');
      boardEl.className = 'sudoku-board';
      boardEl.style.setProperty('--grid-size', config.size);
      boardEl.dataset.size = String(config.size);

      for (let rowIndex = 0; rowIndex < config.size; rowIndex += 1) {
        for (let colIndex = 0; colIndex < config.size; colIndex += 1) {
          const cell = document.createElement('button');
          const cellValue = state.board[rowIndex][colIndex];
          const isFixed = state.currentPuzzle.givens[rowIndex][colIndex] !== 0;
          const isSelected = selected && selected.row === rowIndex && selected.col === colIndex;
          const sameRow = selected && selected.row === rowIndex;
          const sameCol = selected && selected.col === colIndex;
          const sameBox = selected
            && getSubgridStart(selected.row, config.subgridRows) === getSubgridStart(rowIndex, config.subgridRows)
            && getSubgridStart(selected.col, config.subgridCols) === getSubgridStart(colIndex, config.subgridCols);

          cell.type = 'button';
          cell.className = 'sudoku-cell';
          if (isFixed) cell.classList.add('fixed');
          if (!isFixed && cellValue !== 0) cell.classList.add('filled');
          if (isSelected) cell.classList.add('selected');
          if (!isSelected && (sameRow || sameCol || sameBox)) cell.classList.add('related');
          if (state.wrongCell && state.wrongCell.row === rowIndex && state.wrongCell.col === colIndex) {
            cell.classList.add('wrong');
          }

          cell.textContent = cellValue === 0 ? '' : String(cellValue);
          cell.setAttribute('aria-label', `第${rowIndex + 1}行第${colIndex + 1}列`);
          cell.style.borderRightWidth = ((colIndex + 1) % config.subgridCols === 0 && colIndex !== config.size - 1) ? '4px' : '';
          cell.style.borderBottomWidth = ((rowIndex + 1) % config.subgridRows === 0 && rowIndex !== config.size - 1) ? '4px' : '';

          if (!isFixed) {
            cell.addEventListener('click', () => {
              state.selectedCell = { row: rowIndex, col: colIndex };
              helperText.textContent = `已选第 ${rowIndex + 1} 行第 ${colIndex + 1} 列，点下面的数字填入。`;
              renderBoard();
              renderDigitBank();
            });
          } else {
            cell.disabled = true;
          }

          boardEl.appendChild(cell);
        }
      }

      boardHost.appendChild(boardEl);
    }

    function renderDigitBank() {
      const config = getStageConfig(state.stageId);
      digitBank.innerHTML = '';
      digitBank.style.display = 'grid';
      digitBank.style.setProperty('--bank-size', String(Math.min(config.size, 5)));

      for (let value = 1; value <= config.size; value += 1) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'digit-btn';
        button.textContent = String(value);
        button.disabled = !state.selectedCell;
        button.addEventListener('click', () => handleDigitInput(value));
        digitBank.appendChild(button);
      }
    }

    function showStageComplete() {
      const config = getStageConfig(state.stageId);
      state.practiceMode = false;
      state.selectedCell = null;
      digitBank.innerHTML = '';
      digitBank.style.display = 'none';
      helperText.textContent = '这一阶段完成啦，可以再来一轮。';
      updateProgress();
      boardHost.innerHTML = `
        <div class="sudoku-intro-card success-card">
          <div class="intro-emoji">🏆</div>
          <div class="intro-title">${config.label} 完成啦</div>
          <div class="intro-desc">这一轮一共完成了 ${state.queue.length} 题，做得很棒！</div>
          <div class="intro-rule">再来一轮，继续把空格补完整吧。</div>
        </div>
      `;
      setFeedback('', '');
      setPrompt('🏆', `${config.label} 完成啦`, `${config.label} 完成啦，再来一轮吧。`);
      showBottomAction('🔄 再来一轮', startStagePractice, 'btn btn-blue btn-lg');
    }

    function loadPuzzle(index) {
      if (index >= state.queue.length) {
        showStageComplete();
        return;
      }

      state.puzzleIndex = index;
      state.currentPuzzle = state.queue[index];
      state.board = cloneGrid(state.currentPuzzle.givens);
      state.selectedCell = findFirstEmptyCell(state.board);
      updateProgress();
      hideBottomAction();
      renderBoard();
      renderDigitBank();
      helperText.textContent = state.selectedCell
        ? `已选第 ${state.selectedCell.row + 1} 行第 ${state.selectedCell.col + 1} 列，点下面的数字填入。`
        : '所有格子都已经填好啦。';
      setFeedback('', '');
      setPrompt('🔢', `${getStageConfig(state.stageId).label}：把空格补完整`, `${getStageConfig(state.stageId).label}，第 ${index + 1} 题。把空格补完整。`);
    }

    function startStagePractice() {
      clearTransientState();
      state.practiceMode = true;
      state.queue = buildSudokuQueue(state.stageId);
      if (state.queue.length === 0) {
        renderIntroCard();
        setFeedback('暂时还没有题目哦。', 'encourage');
        return;
      }
      loadPuzzle(0);
    }

    function handleDigitInput(value) {
      if (!state.selectedCell || !state.currentPuzzle) {
        setFeedback('先点一个空格，再点数字。', 'encourage');
        return;
      }

      const { row, col } = state.selectedCell;
      const conflictReason = getConflictReason(state.board, row, col, value, state.stageId);
      const expectedValue = state.currentPuzzle.solution[row][col];

      if (conflictReason || value !== expectedValue) {
        const reasonText = {
          row: `这一行里已经有 ${value} 了`,
          col: `这一列里已经有 ${value} 了`,
          box: `这个小宫格里已经有 ${value} 了`,
        };

        state.wrongCell = { row, col };
        renderBoard();
        clearTimeout(state.wrongTimer);
        state.wrongTimer = setTimeout(() => {
          state.wrongCell = null;
          renderBoard();
        }, 450);

        setFeedback(`😺 ${reasonText[conflictReason] || '再看看这个格子该填多少'}`, 'encourage');
        return;
      }

      state.board[row][col] = value;
      state.selectedCell = findFirstEmptyCell(state.board);
      renderBoard();
      renderDigitBank();

      if (countEmptyCells(state.board) === 0) {
        setFeedback('🎉 完成啦，去下一题！', 'correct');
        state.advanceTimer = setTimeout(() => {
          loadPuzzle(state.puzzleIndex + 1);
        }, 1200);
        return;
      }

      helperText.textContent = state.selectedCell
        ? `填对啦，继续看第 ${state.selectedCell.row + 1} 行第 ${state.selectedCell.col + 1} 列。`
        : '继续把剩下的空格补完整。';
      setFeedback('✅ 填对啦，继续！', 'correct');
    }

    stageTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.stageId = tab.dataset.stage;
        showStageIntro();
      });
    });

    showStageIntro();

    return {
      startStagePractice,
      showStageIntro,
      state,
    };
  }

  return {
    SUDOKU_STAGE_ORDER,
    SUDOKU_STAGE_CONFIGS,
    SUDOKU_PUZZLES,
    buildSudokuQueue,
    cloneGrid,
    countEmptyCells,
    getAllowedValues,
    getConflictReason,
    getStageConfig,
    initSudokuPage,
    isPlacementValid,
  };
});
