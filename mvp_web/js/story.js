/**
 * 数学启蒙 · 故事应用题 JS
 * 支持 3 大子模式：求一共与剩余、比多比少、生活决策
 */

(function () {
  'use strict';

  // 状态变量
  let currentMode = 'change'; // 'change' | 'compare' | 'decision'
  let currentQuestion = null;
  let isAnswerLocked = false;

  // DOM 元素
  const tabs = document.querySelectorAll('.mode-tab');
  const questionText = document.getElementById('questionText');
  const questionSpeaker = document.getElementById('questionSpeaker');
  const storyStage = document.getElementById('storyStage');
  const storyItems = document.getElementById('storyItems');
  const storyOptions = document.getElementById('storyOptions');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackEmoji = document.getElementById('feedbackEmoji');
  const feedbackText = document.getElementById('feedbackText');

  // 初始化
  function init() {
    bindTabEvents();
    bindSpeakerEvent();
    loadNewQuestion();
  }

  // 绑定模式页签点击
  function bindTabEvents() {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        if (isAnswerLocked) return;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.getAttribute('data-mode');
        loadNewQuestion();
      });
    });
  }

  // 绑定语音播报喇叭
  function bindSpeakerEvent() {
    if (questionSpeaker) {
      questionSpeaker.addEventListener('click', () => {
        if (currentQuestion && currentQuestion.audioText) {
          playSpeech(currentQuestion.audioText);
        }
      });
    }
  }

  // 加载新题目
  function loadNewQuestion() {
    isAnswerLocked = false;
    storyItems.innerHTML = '';
    storyOptions.innerHTML = '';

    if (currentMode === 'change') {
      generateChangeQuestion();
    } else if (currentMode === 'compare') {
      generateCompareQuestion();
    } else if (currentMode === 'decision') {
      generateDecisionQuestion();
    }

    // 题目渲染完成后自动朗读
    if (currentQuestion && currentQuestion.audioText) {
      questionText.textContent = currentQuestion.questionText;
      playSpeech(currentQuestion.audioText);
    }
  }

  // ================= 1. 求一共与求剩余（动态变化） =================
  function generateChangeQuestion() {
    const templates = [
      {
        type: 'sub_birds',
        icon: '🐦',
        total: 5,
        actionCount: 2,
        actionType: 'fly_away',
        questionText: '树上有5只小鸟，飞走了2只，还剩几只？',
        audioText: '树上有5只小鸟，飞走了2只，还剩下几只小鸟呢？',
        answer: 3,
        options: [2, 3, 4]
      },
      {
        type: 'sub_cookies',
        icon: '🍪',
        total: 4,
        actionCount: 1,
        actionType: 'eaten',
        questionText: '盘子里有4块饼干，被小熊吃了1块，还剩几块？',
        audioText: '盘子里有4块饼干，被小熊吃了1块，还剩下几块饼干呢？',
        answer: 3,
        options: [2, 3, 4]
      },
      {
        type: 'add_ducks',
        icon: '🦆',
        total: 3,
        actionCount: 2,
        actionType: 'join_in',
        questionText: '池塘里有3只鸭子，又游来了2只，一共有几只？',
        audioText: '池塘里原本有3只鸭子，又游来了2只，现在一共有几只鸭子呢？',
        answer: 5,
        options: [4, 5, 6]
      },
      {
        type: 'sub_apples',
        icon: '🍎',
        total: 6,
        actionCount: 2,
        actionType: 'eaten',
        questionText: '树上有6个红苹果，掉落了2个，树上还剩几个？',
        audioText: '树上有6个红苹果，掉落了2个，树上还剩下几个苹果呢？',
        answer: 4,
        options: [3, 4, 5]
      }
    ];

    currentQuestion = templates[Math.floor(Math.random() * templates.length)];

    // 渲染舞台物品
    let initialRenderCount = currentQuestion.actionType === 'join_in' ? currentQuestion.total : currentQuestion.total;
    
    for (let i = 0; i < initialRenderCount; i++) {
      const itemEl = document.createElement('div');
      itemEl.className = 'story-item';
      itemEl.id = `item-${i}`;
      itemEl.textContent = currentQuestion.icon;
      storyItems.appendChild(itemEl);
    }

    // 触发延迟动画
    setTimeout(() => {
      if (currentQuestion.actionType === 'fly_away') {
        for (let i = 0; i < currentQuestion.actionCount; i++) {
          const item = document.getElementById(`item-${i}`);
          if (item) item.classList.add('fly-away');
        }
      } else if (currentQuestion.actionType === 'eaten') {
        for (let i = 0; i < currentQuestion.actionCount; i++) {
          const item = document.getElementById(`item-${i}`);
          if (item) item.classList.add('eaten');
        }
      } else if (currentQuestion.actionType === 'join_in') {
        for (let i = 0; i < currentQuestion.actionCount; i++) {
          const itemEl = document.createElement('div');
          itemEl.className = 'story-item join-in';
          itemEl.textContent = currentQuestion.icon;
          storyItems.appendChild(itemEl);
        }
      }
    }, 1200);

    // 渲染选项
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // ================= 2. 比多比少（排队对齐） =================
  function generateCompareQuestion() {
    const templates = [
      {
        iconA: '🐰', nameA: '兔子', countA: 5,
        iconB: '🥕', nameB: '胡萝卜', countB: 3,
        questionText: '兔子有5只，胡萝卜有3个，兔子比胡萝卜多几个？',
        audioText: '小兔子有5只，胡萝卜有3个，兔子比胡萝卜多几个呀？',
        answer: 2,
        options: [1, 2, 3]
      },
      {
        iconA: '🐱', nameA: '小猫', countA: 4,
        iconB: '🐟', nameB: '小鱼', countB: 6,
        questionText: '小鱼有6条，小猫有4只，小鱼比小猫多几条？',
        audioText: '小鱼有6条，小猫有4只，小鱼比小猫多几条呢？',
        answer: 2,
        options: [1, 2, 3]
      },
      {
        iconA: '🐵', nameA: '猴子', countA: 4,
        iconB: '🍌', nameB: '香蕉', countB: 2,
        questionText: '猴子有4只，香蕉有2根，猴子比香蕉多几只？',
        audioText: '小猴子有4只，香蕉有2根，猴子比香蕉多几只呢？',
        answer: 2,
        options: [1, 2, 3]
      }
    ];

    currentQuestion = templates[Math.floor(Math.random() * templates.length)];

    // 渲染排队对比布局
    const groupEl = document.createElement('div');
    groupEl.className = 'align-group';

    // 排 A
    const rowA = document.createElement('div');
    rowA.className = 'align-row';
    rowA.innerHTML = `<span class="align-label">${currentQuestion.nameA}</span><div class="align-items-line"></div>`;
    const lineA = rowA.querySelector('.align-items-line');
    for (let i = 0; i < currentQuestion.countA; i++) {
      const box = document.createElement('div');
      box.className = 'align-item-box';
      if (currentQuestion.countA > currentQuestion.countB && i >= currentQuestion.countB) {
        box.classList.add('extra');
      }
      box.textContent = currentQuestion.iconA;
      lineA.appendChild(box);
    }

    // 排 B
    const rowB = document.createElement('div');
    rowB.className = 'align-row';
    rowB.innerHTML = `<span class="align-label">${currentQuestion.nameB}</span><div class="align-items-line"></div>`;
    const lineB = rowB.querySelector('.align-items-line');
    for (let i = 0; i < currentQuestion.countB; i++) {
      const box = document.createElement('div');
      box.className = 'align-item-box';
      if (currentQuestion.countB > currentQuestion.countA && i >= currentQuestion.countA) {
        box.classList.add('extra');
      }
      box.textContent = currentQuestion.iconB;
      lineB.appendChild(box);
    }

    groupEl.appendChild(rowA);
    groupEl.appendChild(rowB);
    storyItems.appendChild(groupEl);

    // 渲染选项
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // ================= 3. 生活决策（够不够） =================
  function generateDecisionQuestion() {
    const templates = [
      {
        type: 'chairs',
        iconA: '🦊', countA: 4, labelA: '4只小狐狸',
        iconB: '🪑', countB: 3, labelB: '3把椅子',
        questionText: '4只小狐狸，只有3把椅子，椅子够不够坐？',
        audioText: '有4只小狐狸开会，现场只有3把椅子，请问椅子够不够坐呢？',
        answer: '不够',
        options: ['够', '不够']
      },
      {
        type: 'money',
        iconA: '💰', countA: '10元',
        iconB: '🍰', countB: '蛋糕4元 + 牛奶5元',
        questionText: '口袋里有10元，买4元蛋糕和5元牛奶，钱够不够？',
        audioText: '小熊带了10元钱，想买一个4元的蛋糕和一个5元的牛奶，带的钱够不够呢？',
        answer: '够',
        options: ['够', '不够']
      },
      {
        type: 'apples_share',
        iconA: '🐻', countA: 3, labelA: '3只小熊',
        iconB: '🍎', countB: 5, labelB: '5个苹果',
        questionText: '3只小熊，分5个苹果，每熊分1个，苹果够不够？',
        audioText: '有3只小熊，盘子里有5个苹果，每只小熊分1个，苹果够不够分呢？',
        answer: '够',
        options: ['够', '不够']
      }
    ];

    currentQuestion = templates[Math.floor(Math.random() * templates.length)];

    // 渲染决策场景
    const sceneDiv = document.createElement('div');
    sceneDiv.style.display = 'flex';
    sceneDiv.style.flexDirection = 'column';
    sceneDiv.style.alignItems = 'center';
    sceneDiv.style.gap = '12px';
    sceneDiv.style.zIndex = '2';

    sceneDiv.innerHTML = `
      <div style="display:flex; gap:24px; align-items:center;">
        <div style="background:#FFF; padding:12px 20px; border-radius:20px; border:2px solid #CBD5E1; font-size:20px; font-weight:800;">
          ${currentQuestion.iconA} ${currentQuestion.labelA || currentQuestion.countA}
        </div>
        <div style="font-size:24px; font-weight:900; color:#64748B;">vs</div>
        <div style="background:#FFF; padding:12px 20px; border-radius:20px; border:2px solid #CBD5E1; font-size:20px; font-weight:800;">
          ${currentQuestion.iconB} ${currentQuestion.labelB || currentQuestion.countB}
        </div>
      </div>
    `;

    storyItems.appendChild(sceneDiv);

    // 渲染选项
    renderOptions(currentQuestion.options, currentQuestion.answer);
  }

  // 统一渲染选项
  function renderOptions(options, correctAnswer) {
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'story-opt-btn';
      btn.textContent = opt === '够' ? '够 👍' : (opt === '不够' ? '不够 👎' : opt);
      btn.addEventListener('click', () => handleSelectOption(opt, correctAnswer, btn));
      storyOptions.appendChild(btn);
    });
  }

  // 处理作答
  function handleSelectOption(selected, correct, btnEl) {
    if (isAnswerLocked) return;

    if (selected === correct) {
      isAnswerLocked = true;
      btnEl.classList.add('correct');
      playSpeech('答对了！你真棒！');
      showFeedback('🎉', '太棒啦！');

      setTimeout(() => {
        hideFeedback();
        loadNewQuestion();
      }, 1600);
    } else {
      btnEl.classList.add('wrong');
      playSpeech('再数一数看试一试~');
      showFeedback('🤔', '再想想看~');

      setTimeout(() => {
        hideFeedback();
        btnEl.classList.remove('wrong');
      }, 1200);
    }
  }

  // 辅助函数：播放语音
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

  // 显示/隐藏正负反馈浮层
  function showFeedback(emoji, text) {
    feedbackEmoji.textContent = emoji;
    feedbackText.textContent = text;
    feedbackOverlay.style.display = 'flex';
  }

  function hideFeedback() {
    feedbackOverlay.style.display = 'none';
  }

  // 启动
  document.addEventListener('DOMContentLoaded', init);
})();
