/**
 * 数学启蒙 · 计算大闯关 JS (极简降噪与聚焦版)
 * 1. 🎯 计算闯关 (正向求结果，关卡 1~10)
 * 2. 🔲 方框填空 (未知数求解，关卡 1~10，如 2 + ▢ = 5)
 * 3. ⚡ 混合运算 (3~4数连算，含直接算结果与算未知数，关卡 1~10)
 * 4. 🎴 24点益智 (扑克经典凑24点)
 */

(function () {
  'use strict';

  // 状态变量
  let currentMode = 'calc_rush'; // 'calc_rush' | 'blank_box' | 'mixed_calc'
  let currentLevel = 1; // 1 ~ 10
  let questionInLevelIndex = 0; // 0 ~ 4 (每关5题)
  let levelScore = 0;
  let isAnswerLocked = false;
  let currentQuestion = null;
  let levelQuestionKeys = new Set();

  // 关卡配置
  const LEVEL_CONFIGS = [
    { level: 1, name: '第 1 关 · 5以内加减', shortName: '第1关·5以内', desc: '5以内加减入门' },
    { level: 2, name: '第 2 关 · 10以内加减', shortName: '第2关·10以内', desc: '凑十与不进位加减' },
    { level: 3, name: '第 3 关 · 20以内进退位', shortName: '第3关·20以内', desc: '破十法与进位加法' },
    { level: 4, name: '第 4 关 · 100以内整十加减', shortName: '第4关·整十数', desc: '整十数与加减一位数' },
    { level: 5, name: '第 5 关 · 100以内两位数加减', shortName: '第5关·两位数加减', desc: '两位数进退位运算' },
    { level: 6, name: '第 6 关 · 表内九九乘法', shortName: '第6关·九九乘法', desc: '乘法口诀快速心算' },
    { level: 7, name: '第 7 关 · 表内除法运算', shortName: '第7关·表内除法', desc: '表内除法初步' },
    { level: 8, name: '第 8 关 · 两位数乘除一位数', shortName: '第8关·乘除一位数', desc: '多位数乘除启蒙' },
    { level: 9, name: '第 9 关 · 几百几十乘除', shortName: '第9关·几百几十', desc: '百数级口算思维' },
    { level: 10, name: '第 10 关 · 两位数乘除法挑战', shortName: '第10关·两位数乘除', desc: '综合乘除法压轴' }
  ];

  // DOM 元素
  const tabs = document.querySelectorAll('.segmented-item');
  const levelBadge = document.getElementById('levelBadge');
  const btnLevelPickerTrigger = document.getElementById('btnLevelPickerTrigger');
  const levelPickerModal = document.getElementById('levelPickerModal');
  const btnCloseLevelPicker = document.getElementById('btnCloseLevelPicker');
  const levelPickerGrid = document.getElementById('levelPickerGrid');
  const calcProgressTrack = document.getElementById('calcProgressTrack');
  const calcProgressFill = document.getElementById('calcProgressFill');
  const questionIcon = document.getElementById('questionIcon');
  const questionText = document.getElementById('questionText');
  const questionSpeaker = document.getElementById('questionSpeaker');
  const game24Stage = document.getElementById('game24Stage');
  const game24Options = document.getElementById('game24Options');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackEmoji = document.getElementById('feedbackEmoji');
  const feedbackText = document.getElementById('feedbackText');
  const levelClearModal = document.getElementById('levelClearModal');
  const clearTitle = document.getElementById('clearTitle');
  const clearSubtitle = document.getElementById('clearSubtitle');
  const clearScore = document.getElementById('clearScore');
  const btnNextLevel = document.getElementById('btnNextLevel');
  const btnReplayLevel = document.getElementById('btnReplayLevel');

  // 初始化
  function init() {
    bindModeTabs();
    bindLevelPickerEvents();
    bindSpeakerEvent();
    bindModalButtons();
    startLevel(1);
  }

  // 模式切换
  function bindModeTabs() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (isAnswerLocked) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.getAttribute('data-mode');

        if (btnLevelPickerTrigger) btnLevelPickerTrigger.style.display = 'inline-flex';
        if (calcProgressTrack) calcProgressTrack.style.display = 'block';
        startLevel(currentLevel);
      });
    });
  }

  // 绑定关卡下拉抽屉事件
  function bindLevelPickerEvents() {
    if (btnLevelPickerTrigger) {
      btnLevelPickerTrigger.addEventListener('click', () => {
        openLevelPicker();
      });
    }
    if (btnCloseLevelPicker) {
      btnCloseLevelPicker.addEventListener('click', () => {
        closeLevelPicker();
      });
    }
    if (levelPickerModal) {
      levelPickerModal.addEventListener('click', (e) => {
        if (e.target === levelPickerModal) closeLevelPicker();
      });
    }
  }

  function openLevelPicker() {
    renderLevelPickerGrid();
    if (levelPickerModal) levelPickerModal.style.display = 'flex';
  }

  function closeLevelPicker() {
    if (levelPickerModal) levelPickerModal.style.display = 'none';
  }

  function renderLevelPickerGrid() {
    if (!levelPickerGrid) return;
    levelPickerGrid.innerHTML = '';
    LEVEL_CONFIGS.forEach(cfg => {
      const btn = document.createElement('button');
      btn.className = `level-choice-btn ${cfg.level === currentLevel ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="level-choice-num">${cfg.name}</span>
        <span class="level-choice-desc">${cfg.desc}</span>
      `;
      btn.addEventListener('click', () => {
        closeLevelPicker();
        startLevel(cfg.level);
      });
      levelPickerGrid.appendChild(btn);
    });
  }

  // 绑定喇叭事件
  function bindSpeakerEvent() {
    if (questionSpeaker) {
      questionSpeaker.addEventListener('click', () => {
        if (currentQuestion && currentQuestion.audioText) {
          playSpeech(currentQuestion.audioText);
        }
      });
    }
  }

  // 绑定通关弹窗按钮
  function bindModalButtons() {
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        if (levelClearModal) levelClearModal.style.display = 'none';
        if (currentLevel < 10) {
          startLevel(currentLevel + 1);
        } else {
          startLevel(1);
        }
      });
    }
    if (btnReplayLevel) {
      btnReplayLevel.addEventListener('click', () => {
        if (levelClearModal) levelClearModal.style.display = 'none';
        startLevel(currentLevel);
      });
    }
  }

  // 开始指定关卡（每关5题）
  function startLevel(lvl) {
    currentLevel = lvl;
    questionInLevelIndex = 0;
    levelScore = 0;
    levelQuestionKeys.clear();
    if (levelClearModal) levelClearModal.style.display = 'none';

    // 更新顶栏关卡指示
    if (levelBadge) {
      const cfg = LEVEL_CONFIGS.find(c => c.level === currentLevel);
      levelBadge.textContent = cfg ? cfg.shortName : `第${currentLevel}关`;
    }

    loadQuestion();
  }

  // 加载当前题（单轮5题严格去重）
  function loadQuestion() {
    isAnswerLocked = false;
    game24Stage.innerHTML = '';
    game24Options.innerHTML = '';
    if (game24Options) game24Options.className = 'game24-options';

    // 更新进度条
    if (calcProgressFill) {
      calcProgressFill.style.width = `${((questionInLevelIndex + 1) / 5) * 100}%`;
    }

    let q = null;
    let attempts = 0;
    do {
      if (currentMode === 'calc_rush') {
        q = generateCalcRushQuestion(currentLevel);
      } else if (currentMode === 'blank_box') {
        q = generateBlankBoxQuestion(currentLevel);
      } else if (currentMode === 'mixed_calc') {
        q = generateMixedCalcQuestion(currentLevel);
      }
      attempts++;
    } while (q && levelQuestionKeys.has(q.key || q.formulaHtml) && attempts < 50);

    if (q) {
      levelQuestionKeys.add(q.key || q.formulaHtml);
      currentQuestion = q;
      renderFormulaQuestion(currentQuestion);
    }

    if (questionIcon) questionIcon.textContent = currentQuestion.icon || '🎯';
    if (questionText) questionText.textContent = currentQuestion.questionText;
    if (currentQuestion && currentQuestion.audioText) {
      playSpeech(currentQuestion.audioText);
    }
  }

  // 渲染算式题目与选项
  function renderFormulaQuestion(q) {
    const box = document.createElement('div');
    box.className = 'formula-display';
    box.innerHTML = q.formulaHtml;
    game24Stage.appendChild(box);

    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'game24-opt-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleOptionClick(opt, q.answer, btn));
      game24Options.appendChild(btn);
    });
  }

  // ================= 题型生成算法 (1~10 关) =================

  // 1. 🎯 计算闯关 (正向求结果)
  function generateCalcRushQuestion(level) {
    let a, b, op, ans, expr;
    switch (level) {
      case 1: // 5以内加减
        if (Math.random() > 0.5) {
          a = 1 + Math.floor(Math.random() * 4);
          b = 1 + Math.floor(Math.random() * (5 - a));
          op = '+';
          ans = a + b;
        } else {
          a = 2 + Math.floor(Math.random() * 4); // 2~5
          b = 1 + Math.floor(Math.random() * a);
          op = '-';
          ans = a - b;
        }
        break;
      case 2: // 10以内加减
        if (Math.random() > 0.5) {
          a = 2 + Math.floor(Math.random() * 8);
          b = 1 + Math.floor(Math.random() * (10 - a));
          op = '+';
          ans = a + b;
        } else {
          a = 4 + Math.floor(Math.random() * 7); // 4~10
          b = 1 + Math.floor(Math.random() * a);
          op = '-';
          ans = a - b;
        }
        break;
      case 3: // 20以内进退位
        if (Math.random() > 0.5) {
          a = 6 + Math.floor(Math.random() * 4); // 6~9
          b = 11 - a + Math.floor(Math.random() * (19 - (11 - a) - a));
          b = Math.max(2, Math.min(9, b));
          op = '+';
          ans = a + b;
        } else {
          a = 11 + Math.floor(Math.random() * 8); // 11~18
          b = (a % 10) + 1 + Math.floor(Math.random() * (9 - (a % 10)));
          op = '-';
          ans = a - b;
        }
        break;
      case 4: // 100以内整十加减与加减一位数
        if (Math.random() > 0.5) {
          a = (1 + Math.floor(Math.random() * 8)) * 10;
          b = (1 + Math.floor(Math.random() * 8)) * 10;
          if (a + b > 90) { op = '-'; if (a < b) [a, b] = [b, a]; ans = a - b; }
          else { op = '+'; ans = a + b; }
        } else {
          a = 20 + Math.floor(Math.random() * 70);
          b = 3 + Math.floor(Math.random() * 7);
          op = Math.random() > 0.5 ? '+' : '-';
          ans = op === '+' ? a + b : a - b;
        }
        break;
      case 5: // 100以内两位数加减法
        a = 18 + Math.floor(Math.random() * 40);
        b = 15 + Math.floor(Math.random() * 35);
        if (Math.random() > 0.5) {
          op = '+';
          ans = a + b;
        } else {
          if (a < b) [a, b] = [b, a];
          op = '-';
          ans = a - b;
        }
        break;
      case 6: // 表内九九乘法
        a = 2 + Math.floor(Math.random() * 8); // 2~9
        b = 2 + Math.floor(Math.random() * 8);
        op = '×';
        ans = a * b;
        break;
      case 7: // 表内除法运算
        b = 2 + Math.floor(Math.random() * 8); // 2~9
        ans = 2 + Math.floor(Math.random() * 8);
        a = b * ans;
        op = '÷';
        break;
      case 8: // 两位数乘除一位数
        if (Math.random() > 0.5) {
          a = 12 + Math.floor(Math.random() * 25); // 12~36
          b = 2 + Math.floor(Math.random() * 4);   // 2~5
          op = '×';
          ans = a * b;
        } else {
          b = 2 + Math.floor(Math.random() * 5);   // 2~6
          ans = 12 + Math.floor(Math.random() * 25);
          a = b * ans;
          op = '÷';
        }
        break;
      case 9: // 几百几十乘除与两位数除两位数
        if (Math.random() > 0.5) {
          b = 11 + Math.floor(Math.random() * 8); // 11~18
          ans = 3 + Math.floor(Math.random() * 6); // 3~8
          a = b * ans;
          op = '÷';
        } else {
          a = (10 + Math.floor(Math.random() * 20)) * 10; // 100~300
          b = 2 + Math.floor(Math.random() * 4);
          op = '÷';
          ans = a / b;
        }
        break;
      case 10: // 两位数乘除法挑战
      default:
        if (Math.random() > 0.5) {
          a = 12 + Math.floor(Math.random() * 18); // 12~29
          b = 11 + Math.floor(Math.random() * 9);  // 11~19
          op = '×';
          ans = a * b;
        } else {
          b = 12 + Math.floor(Math.random() * 8);  // 12~19
          ans = 11 + Math.floor(Math.random() * 8); // 11~18
          a = b * ans;
          op = '÷';
        }
        break;
    }

    expr = `${a} ${op} ${b} = ?`;
    return {
      key: `${a}_${op}_${b}`,
      icon: '🎯',
      questionText: `算一算：${a} ${op} ${b} 等于多少？`,
      audioText: `${a}${op === '×' ? '乘' : (op === '÷' ? '除以' : op)}${b}等于多少呢？`,
      formulaHtml: `<span>${a}</span> <span>${op}</span> <span>${b}</span> <span>=</span> <span class="blank-box">?</span>`,
      answer: ans,
      options: generateOptions(ans, 4)
    };
  }

  // 2. 🔲 方框填空 (求方块未知数)
  function generateBlankBoxQuestion(level) {
    const rushQ = generateCalcRushQuestion(level);
    const parts = rushQ.formulaHtml.match(/<span>(\d+)<\/span> <span>([+\-×÷])<\/span> <span>(\d+)<\/span>/);
    if (!parts) return rushQ;

    const a = parseInt(parts[1], 10);
    const op = parts[2];
    const b = parseInt(parts[3], 10);
    const ans = rushQ.answer;

    let targetAnswer, formulaHtml, audioText;
    const hideLeft = Math.random() > 0.5;

    if (hideLeft) {
      targetAnswer = a;
      formulaHtml = `<span class="blank-box">▢</span> <span>${op}</span> <span>${b}</span> <span>=</span> <span>${ans}</span>`;
      audioText = `方框${op === '×' ? '乘' : (op === '÷' ? '除以' : op)}${b}等于${ans}，方框等于几呢？`;
    } else {
      targetAnswer = b;
      formulaHtml = `<span>${a}</span> <span>${op}</span> <span class="blank-box">▢</span> <span>=</span> <span>${ans}</span>`;
      audioText = `${a}${op === '×' ? '乘' : (op === '÷' ? '除以' : op)}方框等于${ans}，方框等于几呢？`;
    }

    return {
      key: `box_${hideLeft ? 'L' : 'R'}_${a}_${op}_${b}`,
      icon: '🔲',
      questionText: `想一想：方框 ▢ 里应该填几？`,
      audioText: audioText,
      formulaHtml: formulaHtml,
      answer: targetAnswer,
      options: generateOptions(targetAnswer, 4)
    };
  }

  // 3. ⚡ 混合运算 (3~4数连算)
  function generateMixedCalcQuestion(level) {
    let a, b, c, op1, op2, ans, formulaHtml, targetAnswer;
    const isFindBox = Math.random() > 0.4;

    if (level <= 2) {
      a = 2 + Math.floor(Math.random() * 4);
      b = 1 + Math.floor(Math.random() * 3);
      c = 1 + Math.floor(Math.random() * 2);
      op1 = '+';
      op2 = Math.random() > 0.5 ? '+' : '-';
      ans = op2 === '+' ? a + b + c : a + b - c;
      if (ans < 0) { op2 = '+'; ans = a + b + c; }
    } else if (level <= 5) {
      a = 15 + Math.floor(Math.random() * 30);
      b = 8 + Math.floor(Math.random() * 15);
      c = 5 + Math.floor(Math.random() * 10);
      op1 = '+';
      op2 = '-';
      ans = a + b - c;
    } else if (level <= 7) {
      a = 2 + Math.floor(Math.random() * 6);
      b = 2 + Math.floor(Math.random() * 6);
      c = 3 + Math.floor(Math.random() * 12);
      op1 = '×';
      op2 = Math.random() > 0.5 ? '+' : '-';
      ans = op2 === '+' ? a * b + c : a * b - c;
      if (ans < 0) { op2 = '+'; ans = a * b + c; }
    } else {
      if (Math.random() > 0.5) {
        c = 2 + Math.floor(Math.random() * 4);
        ans = 10 + Math.floor(Math.random() * 15);
        const sum = ans * c;
        a = 15 + Math.floor(Math.random() * (sum - 15));
        b = sum - a;
        op1 = '+';
        op2 = '÷';
        if (isFindBox) {
          targetAnswer = b;
          formulaHtml = `<span>(</span> <span>${a}</span> <span>+</span> <span class="blank-box">▢</span> <span>)</span> <span>÷</span> <span>${c}</span> <span>=</span> <span>${ans}</span>`;
        } else {
          targetAnswer = ans;
          formulaHtml = `<span>(</span> <span>${a}</span> <span>+</span> <span>${b}</span> <span>)</span> <span>÷</span> <span>${c}</span> <span>=</span> <span class="blank-box">?</span>`;
        }
        return {
          icon: '⚡',
          questionText: isFindBox ? '混合运算：方框 ▢ 等于几？' : '混合运算：计算最终结果！',
          audioText: `请根据混合运算顺序，算出正确结果吧！`,
          formulaHtml: formulaHtml,
          answer: targetAnswer,
          options: generateOptions(targetAnswer, 4)
        };
      } else {
        a = 12 + Math.floor(Math.random() * 15);
        b = 2 + Math.floor(Math.random() * 4);
        c = 10 + Math.floor(Math.random() * 20);
        op1 = '×';
        op2 = '-';
        ans = a * b - c;
        if (ans < 0) { op2 = '+'; ans = a * b + c; }
      }
    }

    if (isFindBox) {
      targetAnswer = b;
      formulaHtml = `<span>${a}</span> <span>${op1}</span> <span class="blank-box">▢</span> <span>${op2}</span> <span>${c}</span> <span>=</span> <span>${ans}</span>`;
    } else {
      targetAnswer = ans;
      formulaHtml = `<span>${a}</span> <span>${op1}</span> <span>${b}</span> <span>${op2}</span> <span>${c}</span> <span>=</span> <span class="blank-box">?</span>`;
    }

    return {
      key: `mix_${isFindBox ? 'box' : 'res'}_${a}_${op1}_${b}_${op2}_${c}`,
      icon: '⚡',
      questionText: isFindBox ? '混合连算：方框 ▢ 里是几？' : '混合连算：算出最终得数！',
      audioText: `观察算式，注意计算先后顺序，算出正确答案吧！`,
      formulaHtml: formulaHtml,
      answer: targetAnswer,
      options: generateOptions(targetAnswer, 4)
    };
  }

  // 作答反馈
  function handleOptionClick(selected, correct, btnEl) {
    if (isAnswerLocked) return;

    if (String(selected) === String(correct)) {
      isAnswerLocked = true;
      btnEl.classList.add('correct');
      levelScore++;
      playSpeech('答对了！太棒啦！');
      showFeedback('🎉', '算得又快又准！');

      setTimeout(() => {
        hideFeedback();
        if (questionInLevelIndex < 4) {
          questionInLevelIndex++;
          loadQuestion();
        } else {
          showLevelClearModal();
        }
      }, 1300);
    } else {
      btnEl.classList.add('wrong');
      playSpeech('再仔细算一算哦~');
      showFeedback('🤔', '再算算看~');

      setTimeout(() => {
        hideFeedback();
        btnEl.classList.remove('wrong');
      }, 1100);
    }
  }

  // 关卡完成结算
  function showLevelClearModal() {
    if (levelClearModal) {
      levelClearModal.style.display = 'flex';
      const cfg = LEVEL_CONFIGS.find(c => c.level === currentLevel);
      if (clearTitle) clearTitle.textContent = `${cfg ? cfg.name : `第 ${currentLevel} 关`} 闯关成功！`;
      if (clearSubtitle) clearSubtitle.textContent = `连续答对 ${levelScore} 题，思维真敏捷！`;
      if (clearScore) clearScore.textContent = `${levelScore} / 5`;
      playSpeech(`太棒啦！第${currentLevel}关闯关成功！`);
    }
  }

  // 辅助函数
  function generateOptions(answer, count) {
    if (typeof answer !== 'number') return [answer, '错', '对', '不确定'];
    const set = new Set([answer]);
    const deltas = [-2, -1, 1, 2, -10, 10, -5, 5];
    while (set.size < count) {
      const delta = deltas[Math.floor(Math.random() * deltas.length)];
      const fake = answer + delta;
      if (fake > 0 && fake !== answer) set.add(fake);
      else set.add(answer + Math.floor(Math.random() * 6) + 1);
    }
    const arr = Array.from(set);
    return shuffle(arr);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function playSpeech(text) {
    if (window.practiceSupport && typeof window.practiceSupport.speakText === 'function') {
      window.practiceSupport.speakText(text);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      window.speechSynthesis.speak(u);
    }
  }

  function showFeedback(emoji, text) {
    if (feedbackEmoji) feedbackEmoji.textContent = emoji;
    if (feedbackText) feedbackText.textContent = text;
    if (feedbackOverlay) feedbackOverlay.style.display = 'flex';
  }

  function hideFeedback() {
    if (feedbackOverlay) feedbackOverlay.style.display = 'none';
  }

  // 暴露给单元测试
  window.calcChallengeApp = {
    generateCalcRushQuestion,
    generateBlankBoxQuestion,
    generateMixedCalcQuestion,
    LEVEL_CONFIGS
  };

  document.addEventListener('DOMContentLoaded', init);
})();
