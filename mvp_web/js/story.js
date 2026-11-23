/**
 * 数学启蒙 · 故事应用题 JS
 * 10题阶梯制：3简单 + 3中等 + 3困难 + 1综合
 * 涵盖：排队、购物、逆向、移多补少、间隔、干扰抗辩、倒推、周期、年龄差、租船统筹等全题型
 */

(function () {
  'use strict';

  // 全局轮次状态
  let currentRoundQueue = [];
  let currentIndex = 0; // 0 ~ 9
  let roundScore = 0;
  let isAnswerLocked = false;
  let currentQuestion = null;

  // DOM 元素
  const roundIndicator = document.getElementById('roundIndicator');
  const diffIndicator = document.getElementById('diffIndicator');
  const progressFill = document.getElementById('progressFill');
  const questionIcon = document.getElementById('questionIcon');
  const questionText = document.getElementById('questionText');
  const questionSpeaker = document.getElementById('questionSpeaker');
  const storyStage = document.getElementById('storyStage');
  const storyItems = document.getElementById('storyItems');
  const storyOptions = document.getElementById('storyOptions');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackEmoji = document.getElementById('feedbackEmoji');
  const feedbackText = document.getElementById('feedbackText');
  const summaryModal = document.getElementById('summaryModal');
  const statScore = document.getElementById('statScore');
  const statStars = document.getElementById('statStars');
  const btnRestartRound = document.getElementById('btnRestartRound');

  // 初始化
  function init() {
    bindSpeakerEvent();
    if (btnRestartRound) {
      btnRestartRound.addEventListener('click', startNewRound);
    }
    startNewRound();
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

  // 开启新的一轮（10题）
  function startNewRound() {
    if (summaryModal) summaryModal.style.display = 'none';
    currentRoundQueue = buildStoryRoundQueue();
    currentIndex = 0;
    roundScore = 0;
    loadQuestionAtIndex(currentIndex);
  }

  // ================= 题库生成器 =================

  // 1. 简单题库 (数域 10 以内，1步具象)
  function getEasyPool() {
    return [
      function subBirds() {
        const total = 5 + Math.floor(Math.random() * 4); // 5~8
        const sub = 2 + Math.floor(Math.random() * 2);   // 2~3
        const ans = total - sub;
        return {
          diff: 'easy',
          diffName: '🟢 简单',
          icon: '🐦',
          questionHtml: `树上有 <span class="hl-num">${total}</span> 只小鸟，飞走了 <span class="hl-num">${sub}</span> 只，树上还剩几只小鸟？`,
          audioText: `树上有${total}只小鸟，飞走了${sub}只，树上还剩下几只小鸟呢？`,
          answer: ans,
          options: generateOptions(ans, 4),
          renderStage: (container) => {
            for (let i = 0; i < total; i++) {
              const el = document.createElement('div');
              el.className = 'story-item';
              el.id = `item-bird-${i}`;
              el.textContent = '🐦';
              container.appendChild(el);
            }
            setTimeout(() => {
              for (let i = 0; i < sub; i++) {
                const b = document.getElementById(`item-bird-${i}`);
                if (b) b.classList.add('fly-away');
              }
            }, 800);
          }
        };
      },
      function addDucks() {
        const init = 3 + Math.floor(Math.random() * 3); // 3~5
        const add = 2 + Math.floor(Math.random() * 3);  // 2~4
        const ans = init + add;
        return {
          diff: 'easy',
          diffName: '🟢 简单',
          icon: '🦆',
          questionHtml: `池塘里有 <span class="hl-num">${init}</span> 只小鸭，又游来了 <span class="hl-num">${add}</span> 只，一共有几只小鸭？`,
          audioText: `池塘里有${init}只小鸭，又游来了${add}只，现在一共有几只小鸭呢？`,
          answer: ans,
          options: generateOptions(ans, 4),
          renderStage: (container) => {
            for (let i = 0; i < init; i++) {
              const el = document.createElement('div');
              el.className = 'story-item';
              el.textContent = '🦆';
              container.appendChild(el);
            }
            setTimeout(() => {
              for (let i = 0; i < add; i++) {
                const el = document.createElement('div');
                el.className = 'story-item join-in';
                el.textContent = '🦆';
                container.appendChild(el);
              }
            }, 600);
          }
        };
      },
      function compareRabbits() {
        const rabbits = 5 + Math.floor(Math.random() * 3); // 5~7
        const carrots = 2 + Math.floor(Math.random() * 3); // 2~4
        const diff = rabbits - carrots;
        return {
          diff: 'easy',
          diffName: '🟢 简单',
          icon: '🐰',
          questionHtml: `<span class="hl-name">小兔子</span> 有 <span class="hl-num">${rabbits}</span> 只，<span class="hl-name">胡萝卜</span> 有 <span class="hl-num">${carrots}</span> 个，小兔子比胡萝卜多几只？`,
          audioText: `小兔子有${rabbits}只，胡萝卜有${carrots}个，小兔子比胡萝卜多几只呢？`,
          answer: diff,
          options: generateOptions(diff, 4),
          renderStage: (container) => {
            const alignGroup = document.createElement('div');
            alignGroup.className = 'align-group';
            alignGroup.innerHTML = `
              <div class="align-row">
                <span class="align-label">兔子 (${rabbits})</span>
                <div class="align-items-line">
                  ${Array(rabbits).fill(0).map((_, idx) => `<div class="align-item-box ${idx >= carrots ? 'extra' : ''}">🐰</div>`).join('')}
                </div>
              </div>
              <div class="align-row">
                <span class="align-label">萝卜 (${carrots})</span>
                <div class="align-items-line">
                  ${Array(carrots).fill(0).map(() => `<div class="align-item-box">🥕</div>`).join('')}
                </div>
              </div>
            `;
            container.appendChild(alignGroup);
          }
        };
      },
      function enoughApples() {
        const bears = 4 + Math.floor(Math.random() * 2); // 4 or 5
        const apples = bears + (Math.random() > 0.5 ? 1 : -1);
        const isEnough = apples >= bears;
        return {
          diff: 'easy',
          diffName: '🟢 简单',
          icon: '🍎',
          questionHtml: `<span class="hl-num">${bears}</span> 只小熊分 <span class="hl-num">${apples}</span> 个苹果，每只小熊分 <span class="hl-num">1</span> 个，苹果够不够？`,
          audioText: `有${bears}只小熊，盘子里有${apples}个苹果，每只小熊分1个，苹果够不够分呢？`,
          answer: isEnough ? '够' : '不够',
          options: ['够', '不够'],
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">分配场景</div>
              <div style="display:flex;gap:18px;align-items:center;font-size:20px;font-weight:900;">
                <div>🐻 小熊：${bears} 只</div>
                <div style="color:#94A3B8;">vs</div>
                <div>🍎 苹果：${apples} 个</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function partWholeBalloons() {
        const red = 3 + Math.floor(Math.random() * 3); // 3~5
        const yellow = 2 + Math.floor(Math.random() * 3); // 2~4
        const total = red + yellow;
        return {
          diff: 'easy',
          diffName: '🟢 简单',
          icon: '🎈',
          questionHtml: `小明有 <span class="hl-num">${red}</span> 个红气球，<span class="hl-num">${yellow}</span> 个黄气球，一共有多少个气球？`,
          audioText: `小明有${red}个红气球，${yellow}个黄气球，一共有多少个气球呢？`,
          answer: total,
          options: generateOptions(total, 4),
          renderStage: (container) => {
            for (let i = 0; i < red; i++) {
              const el = document.createElement('div');
              el.className = 'story-item';
              el.textContent = '🎈';
              container.appendChild(el);
            }
            for (let i = 0; i < yellow; i++) {
              const el = document.createElement('div');
              el.className = 'story-item';
              el.textContent = '🟡';
              container.appendChild(el);
            }
          }
        };
      }
    ];
  }

  // 2. 中等题库 (数域 20 以内，两步、排队、逆向、倍数)
  function getMediumPool() {
    return [
      function queueBothSides() {
        const front = 3 + Math.floor(Math.random() * 4); // 3~6
        const back = 3 + Math.floor(Math.random() * 4);  // 3~6
        const total = front + back - 1;
        return {
          diff: 'medium',
          diffName: '🟡 中等',
          icon: '🐻',
          questionHtml: `小动物排队，小熊从前往后数排第 <span class="hl-num">${front}</span>，从后往前数排第 <span class="hl-num">${back}</span>，这一排一共有几只小动物？`,
          audioText: `小动物排队，小熊从前数排第${front}，从后数排第${back}，这一排一共有几只小动物呢？`,
          answer: total,
          options: generateOptions(total, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">排队队伍示意</div>
              <div class="queue-row">
                <span style="font-size:12px;color:#0284C7;font-weight:800;">前 ➡️</span>
                ${Array(total).fill(0).map((_, idx) => `
                  <div class="queue-member">
                    <div class="queue-avatar ${idx === front - 1 ? 'target' : ''}">${idx === front - 1 ? '🐻' : '🐥'}</div>
                    <span class="queue-badge">${idx + 1}</span>
                  </div>
                `).join('')}
                <span style="font-size:12px;color:#0284C7;font-weight:800;">⬅️ 后</span>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function shoppingChange() {
        const money = 15 + Math.floor(Math.random() * 6); // 15~20
        const item1 = 3 + Math.floor(Math.random() * 3);  // 3~5
        const item2 = 4 + Math.floor(Math.random() * 4);  // 4~7
        const left = money - item1 - item2;
        return {
          diff: 'medium',
          diffName: '🟡 中等',
          icon: '💰',
          questionHtml: `小猴带了 <span class="hl-num">${money}</span> 元去文具店，买了一支 <span class="hl-num">${item1}</span> 元的铅笔和一个 <span class="hl-num">${item2}</span> 元的本子，还剩多少元？`,
          audioText: `小猴带了${money}元去文具店，买了一支${item1}元的铅笔和一个${item2}元的本子，还剩下多少元呢？`,
          answer: left,
          options: generateOptions(left, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">文具店小票</div>
              <div style="font-size:15px;line-height:1.6;font-weight:800;">
                <div>👛 带来总钱数：<span style="color:#059669;">${money} 元</span></div>
                <div>✏️ 买铅笔：-${item1} 元</div>
                <div>📓 买本子：-${item2} 元</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function reverseCompareMore() {
        const cat = 6 + Math.floor(Math.random() * 5); // 6~10
        const diff = 3 + Math.floor(Math.random() * 4); // 3~6
        const dog = cat + diff;
        return {
          diff: 'medium',
          diffName: '🟡 中等',
          icon: '🐱',
          questionHtml: `小猫钓了 <span class="hl-num">${cat}</span> 条鱼，小狗比小猫多钓了 <span class="hl-num">${diff}</span> 条，小狗钓了多少条鱼？`,
          audioText: `小猫钓了${cat}条鱼，小狗比小猫多钓了${diff}条，小狗钓了多少条鱼呢？`,
          answer: dog,
          options: generateOptions(dog, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div style="font-size:16px;font-weight:800;display:flex;flex-direction:column;gap:8px;">
                <div>🐱 小猫：${cat} 条 🐟</div>
                <div>🐶 小狗：小猫的 ${cat} 条 + 多钓的 ${diff} 条</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function moveBalance() {
        const transfer = 2 + Math.floor(Math.random() * 3); // 2~4
        const right = 4 + Math.floor(Math.random() * 4);    // 4~7
        const left = right + transfer * 2;
        return {
          diff: 'medium',
          diffName: '🟡 中等',
          icon: '🍓',
          questionHtml: `左边盘子有 <span class="hl-num">${left}</span> 颗草莓，右边盘子有 <span class="hl-num">${right}</span> 颗草莓，从左边拿几颗到右边，两边草莓就一样多？`,
          audioText: `左边盘子有${left}颗草莓，右边盘子有${right}颗草莓，从左边拿几颗到右边，两边草莓就一样多了呢？`,
          answer: transfer,
          options: generateOptions(transfer, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div style="display:flex;gap:24px;font-size:18px;font-weight:900;">
                <div style="background:#FFF1F2;padding:10px 16px;border-radius:14px;border:2px solid #FDA4AF;">左盘: ${left} 🍓</div>
                <div style="align-self:center;color:#64748B;">➡️ 移动 ? 颗 ➡️</div>
                <div style="background:#FFF1F2;padding:10px 16px;border-radius:14px;border:2px solid #FDA4AF;">右盘: ${right} 🍓</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function multiplesIntro() {
        const squirrel = 2 + Math.floor(Math.random() * 3); // 2~4
        const times = 2 + Math.floor(Math.random() * 2);    // 2 or 3
        const total = squirrel * times;
        return {
          diff: 'medium',
          diffName: '🟡 中等',
          icon: '🐿️',
          questionHtml: `小松鼠采了 <span class="hl-num">${squirrel}</span> 个松果，松鼠妈妈采的是它的 <span class="hl-num">${times}</span> 倍，松鼠妈妈采了几个松果？`,
          audioText: `小松鼠采了${squirrel}个松果，松鼠妈妈采的是它的${times}倍，松鼠妈妈采了几个松果呢？`,
          answer: total,
          options: generateOptions(total, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div style="font-size:16px;font-weight:800;display:flex;flex-direction:column;gap:8px;">
                <div>🐿️ 小松鼠：${squirrel} 颗松果 🌰</div>
                <div>🦫 妈妈：相当于 ${times} 个 ${squirrel} 颗</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      }
    ];
  }

  // 3. 困难题库 (间隔、抗干扰、倒推还原、周期规律、年龄差)
  function getHardPool() {
    return [
      function sawWoodInterval() {
        const segs = 4 + Math.floor(Math.random() * 2); // 4 or 5段
        const minsPerCut = 2 + Math.floor(Math.random() * 2); // 2 or 3分钟
        const cuts = segs - 1;
        const totalMins = cuts * minsPerCut;
        return {
          diff: 'hard',
          diffName: '🔴 困难',
          icon: '🪚',
          questionHtml: `一根大木头要锯成 <span class="hl-num">${segs}</span> 段，每锯断一次需要 <span class="hl-num">${minsPerCut}</span> 分钟，锯完一共需要几分钟？`,
          audioText: `一根大木头要锯成${segs}段，每锯断一次需要${minsPerCut}分钟，锯完一共需要几分钟呢？`,
          answer: totalMins,
          options: generateOptions(totalMins, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">木头分段模型 (锯 ${cuts} 次得 ${segs} 段)</div>
              <div class="wood-strip">
                ${Array(segs).fill(0).map((_, idx) => `
                  <div class="wood-seg">第${idx+1}段</div>
                  ${idx < segs - 1 ? `<span class="saw-mark">🪚</span>` : ''}
                `).join('')}
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function distractionFrogs() {
        const birds = 6 + Math.floor(Math.random() * 4); // 6~9
        const frogs = 3 + Math.floor(Math.random() * 3); // 3~5 (干扰)
        const newBirds = 4 + Math.floor(Math.random() * 3); // 4~6
        const totalBirds = birds + newBirds;
        return {
          diff: 'hard',
          diffName: '🔴 困难',
          icon: '🧐',
          questionHtml: `树上有 <span class="hl-num">${birds}</span> 只小鸟，池塘边有 <span class="hl-distract">${frogs} 只青蛙</span>，又飞来 <span class="hl-num">${newBirds}</span> 只小鸟，现在树上一共有几只小鸟？`,
          audioText: `树上有${birds}只小鸟，池塘边有${frogs}只青蛙，又飞来了${newBirds}只小鸟，现在树上一共有几只小鸟呢？`,
          answer: totalBirds,
          options: generateOptions(totalBirds, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">关键信息提取（注意不要被无关信息迷惑）</div>
              <div style="font-size:15px;font-weight:800;display:flex;gap:16px;">
                <div>🐦 原有鸟：${birds}</div>
                <div>➕ 新飞来：${newBirds}</div>
                <div style="color:#94A3B8;text-decoration:line-through;">🐸 青蛙：${frogs}</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function reverseReductionHalf() {
        const left = 5 + Math.floor(Math.random() * 4); // 5~8
        const total = left * 2;
        return {
          diff: 'hard',
          diffName: '🔴 困难',
          icon: '🍑',
          questionHtml: `小狐狸摘了一筐鲜桃，送给奶奶一半后，自己篮子里还剩 <span class="hl-num">${left}</span> 个，原来一共摘了多少个鲜桃？`,
          audioText: `小狐狸摘了一筐鲜桃，送给奶奶一半后，自己还剩${left}个，原来一共摘了多少个鲜桃呢？`,
          answer: total,
          options: generateOptions(total, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">倒推还原示意</div>
              <div style="font-size:16px;font-weight:800;display:flex;gap:16px;">
                <div style="background:#ECFDF5;padding:8px 14px;border-radius:12px;border:1.5px solid #6EE7B7;">送奶奶一半: ${left} 🍑</div>
                <div style="background:#ECFDF5;padding:8px 14px;border-radius:12px;border:1.5px solid #6EE7B7;">自己剩一半: ${left} 🍑</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function cycleBeads() {
        const colors = [
          { name: '红', icon: '🔴' },
          { name: '黄', icon: '🟡' },
          { name: '蓝', icon: '🔵' }
        ];
        const targetPos = 10 + Math.floor(Math.random() * 4); // 10~13
        const rem = (targetPos - 1) % 3;
        const correctColor = colors[rem].name;
        return {
          diff: 'hard',
          diffName: '🔴 困难',
          icon: '📿',
          questionHtml: `小兔子串珠子，按 <span class="hl-name">“红、黄、蓝、红、黄、蓝...”</span> 的规律排列，第 <span class="hl-num">${targetPos}</span> 颗珠子是什么颜色？`,
          audioText: `小兔子串珠子，按照红、黄、蓝、红、黄、蓝的规律排列，第${targetPos}颗珠子是什么颜色呢？`,
          answer: correctColor,
          options: ['红', '黄', '蓝'],
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">周期排列规律 (3颗一组循环)</div>
              <div class="cycle-strip">
                ${['🔴','🟡','🔵','🔴','🟡','🔵','🔴','🟡','🔵'].map(c => `<div class="cycle-bead">${c}</div>`).join('')}
                <div class="cycle-bead mystery">?</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function ageInvariant() {
        const sisterAge = 9 + Math.floor(Math.random() * 3); // 9~11
        const brotherAge = 5 + Math.floor(Math.random() * 2); // 5~6
        const futureYears = 3 + Math.floor(Math.random() * 3); // 3~5
        const diff = sisterAge - brotherAge;
        return {
          diff: 'hard',
          diffName: '🔴 困难',
          icon: '🎂',
          questionHtml: `姐姐今年 <span class="hl-num">${sisterAge}</span> 岁，弟弟今年 <span class="hl-num">${brotherAge}</span> 岁，再过 <span class="hl-distract">${futureYears} 年</span>，姐姐比弟弟大几岁？`,
          audioText: `姐姐今年${sisterAge}岁，弟弟今年${brotherAge}岁，再过${futureYears}年之后，姐姐比弟弟大几岁呢？`,
          answer: diff,
          options: generateOptions(diff, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">💡 关键提示：不管过多少年，年龄差永远不变！</div>
              <div style="font-size:16px;font-weight:900;">今年相差：${sisterAge} - ${brotherAge} = ${diff} 岁</div>
            `;
            container.appendChild(card);
          }
        };
      }
    ];
  }

  // 4. 综合题库 (真实情境决策/统筹优化 - 第10题压轴)
  function getComprehensivePool() {
    return [
      function boatRentalOptimization() {
        const bigCap = 4;
        const smallCap = 2;
        const bigBoats = 2 + Math.floor(Math.random() * 2); // 2 or 3 条大船
        const smallBoatsNeeded = 1 + Math.floor(Math.random() * 2); // 1 or 2 条小船
        const totalKids = bigBoats * bigCap + smallBoatsNeeded * smallCap;
        return {
          diff: 'comp',
          diffName: '🟣 综合',
          icon: '⛵',
          questionHtml: `<span class="hl-num">${totalKids}</span> 个小朋友去公园划船，大船每条坐 <span class="hl-num">4</span> 人，小船每条坐 <span class="hl-num">2</span> 人。如果已经租了 <span class="hl-num">${bigBoats}</span> 条大船，还需要租几条小船刚好坐满？`,
          audioText: `有${totalKids}个小朋友去公园划船，大船坐4人，小船坐2人。如果租了${bigBoats}条大船，还需要租几条小船刚好坐满呢？`,
          answer: smallBoatsNeeded,
          options: generateOptions(smallBoatsNeeded, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">划船运力方案</div>
              <div style="font-size:15px;font-weight:800;display:flex;flex-direction:column;gap:6px;">
                <div>👥 总人数：${totalKids} 人</div>
                <div>🛳️ ${bigBoats} 条大船已坐：${bigBoats * bigCap} 人</div>
                <div>🛶 剩下 ${totalKids - bigBoats * bigCap} 人需要坐几条小船？</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function comboDiscountSavings() {
        const burger = 7 + Math.floor(Math.random() * 2); // 7 or 8元
        const drink = 3 + Math.floor(Math.random() * 2);  // 3 or 4元
        const singleSum = burger + drink;
        const discount = 2 + Math.floor(Math.random() * 2); // 省 2 or 3元
        const comboPrice = singleSum - discount;
        return {
          diff: 'comp',
          diffName: '🟣 综合',
          icon: '🍔',
          questionHtml: `汉堡单买一个 <span class="hl-num">${burger}</span> 元，果汁单买一杯 <span class="hl-num">${drink}</span> 元；如果买“汉堡+果汁套餐”只要 <span class="hl-num">${comboPrice}</span> 元。买套餐比单买省几元？`,
          audioText: `汉堡单买${burger}元，果汁单买${drink}元，套餐只要${comboPrice}元。买套餐比单买省几元呢？`,
          answer: discount,
          options: generateOptions(discount, 4),
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">餐吧比价单</div>
              <div style="font-size:15px;font-weight:800;display:flex;gap:18px;">
                <div>单买总价: ${burger} + ${drink} = ${singleSum} 元</div>
                <div style="color:#059669;">套餐特惠: ${comboPrice} 元</div>
              </div>
            `;
            container.appendChild(card);
          }
        };
      },
      function timeSchedule() {
        const startMins = 10;
        const studyMins = 20;
        const restMins = 10;
        const endMins = startMins + studyMins + restMins;
        return {
          diff: 'comp',
          diffName: '🟣 综合',
          icon: '⏰',
          questionHtml: `小熊上午 <span class="hl-num">9:10</span> 开始看书，看了 <span class="hl-num">20</span> 分钟后，又喝水休息了 <span class="hl-num">10</span> 分钟。休息结束时是上午几点几分？`,
          audioText: `小熊上午9点10分开始看书，看了20分钟后，又休息了10分钟。休息结束时是上午几点几分呢？`,
          answer: `9:${endMins}`,
          options: [`9:${endMins}`, `9:30`, `9:50`, `10:00`],
          renderStage: (container) => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
              <div class="scenario-title">时间线推算</div>
              <div style="font-size:15px;font-weight:800;display:flex;gap:12px;align-items:center;">
                <span>9:10 开始</span> ➜
                <span>+20分钟 看书</span> ➜
                <span>+10分钟 休息</span> ➜
                <span style="color:#2563EB;">? 结束</span>
              </div>
            `;
            container.appendChild(card);
          }
        };
      }
    ];
  }

  // 辅助：生成4个不重复选项
  function generateOptions(answer, count) {
    if (typeof answer !== 'number') return [answer, '错', '对', '不确定'];
    const set = new Set([answer]);
    while (set.size < count) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 3));
      const fake = answer + delta;
      if (fake > 0) set.add(fake);
    }
    const arr = Array.from(set);
    arr.sort(() => Math.random() - 0.5);
    return arr;
  }

  // 核心：构建10题队列（3简单 + 3中等 + 3困难 + 1综合）
  function buildStoryRoundQueue() {
    const pickRandomItems = (pool, n) => {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n).map(fn => fn());
    };

    const easyList = pickRandomItems(getEasyPool(), 3);
    const medList = pickRandomItems(getMediumPool(), 3);
    const hardList = pickRandomItems(getHardPool(), 3);
    const compList = pickRandomItems(getComprehensivePool(), 1);

    return [...easyList, ...medList, ...hardList, ...compList];
  }

  // 渲染指定题号
  function loadQuestionAtIndex(index) {
    isAnswerLocked = false;
    currentQuestion = currentRoundQueue[index];
    if (!currentQuestion) return;

    // 更新指示器
    if (roundIndicator) roundIndicator.textContent = `第 ${index + 1}/10 题`;
    if (diffIndicator) {
      diffIndicator.textContent = currentQuestion.diffName;
      diffIndicator.className = `diff-pill diff-${currentQuestion.diff}`;
    }
    if (progressFill) {
      progressFill.style.width = `${((index + 1) / 10) * 100}%`;
    }

    // 题目栏
    if (questionIcon) questionIcon.textContent = currentQuestion.icon || '📖';
    if (questionText) questionText.innerHTML = currentQuestion.questionHtml;

    // 清空并重新生成舞台
    if (storyItems) {
      storyItems.innerHTML = '';
      if (typeof currentQuestion.renderStage === 'function') {
        currentQuestion.renderStage(storyItems);
      }
    }

    // 渲染选项
    if (storyOptions) {
      storyOptions.innerHTML = '';
      currentQuestion.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'story-opt-btn';
        btn.textContent = opt === '够' ? '够 👍' : (opt === '不够' ? '不够 👎' : opt);
        btn.addEventListener('click', () => handleOptionClick(opt, currentQuestion.answer, btn));
        storyOptions.appendChild(btn);
      });
    }

    // 语音朗读
    if (currentQuestion.audioText) {
      playSpeech(currentQuestion.audioText);
    }
  }

  // 作答反馈
  function handleOptionClick(selected, correct, btnEl) {
    if (isAnswerLocked) return;

    if (String(selected) === String(correct)) {
      isAnswerLocked = true;
      btnEl.classList.add('correct');
      roundScore++;
      playSpeech('答对了！你真棒！');
      showFeedback('🎉', '太棒啦！');

      setTimeout(() => {
        hideFeedback();
        if (currentIndex < 9) {
          currentIndex++;
          loadQuestionAtIndex(currentIndex);
        } else {
          // 10 题全部答完，展示结算卡片
          showRoundSummary();
        }
      }, 1500);
    } else {
      btnEl.classList.add('wrong');
      playSpeech('再仔细想一想哦~');
      showFeedback('🤔', '再仔细想想~');

      setTimeout(() => {
        hideFeedback();
        btnEl.classList.remove('wrong');
      }, 1200);
    }
  }

  // 10题结算卡片
  function showRoundSummary() {
    if (summaryModal) {
      summaryModal.style.display = 'flex';
      if (statScore) statScore.textContent = `${roundScore} / 10`;
      if (statStars) {
        if (roundScore >= 9) statStars.textContent = '⭐⭐⭐ 满星大满贯！';
        else if (roundScore >= 7) statStars.textContent = '⭐⭐ 相当优秀！';
        else statStars.textContent = '⭐ 也很不错，继续加油！';
      }
      playSpeech(`太棒啦！你完成了10道故事题挑战，答对了${roundScore}道题！`);
    }
  }

  // 播放语音
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

  // 反馈浮层
  function showFeedback(emoji, text) {
    if (feedbackEmoji) feedbackEmoji.textContent = emoji;
    if (feedbackText) feedbackText.textContent = text;
    if (feedbackOverlay) feedbackOverlay.style.display = 'flex';
  }

  function hideFeedback() {
    if (feedbackOverlay) feedbackOverlay.style.display = 'none';
  }

  // 暴露给测试
  window.storyApp = {
    buildStoryRoundQueue,
    getEasyPool,
    getMediumPool,
    getHardPool,
    getComprehensivePool
  };

  // 启动
  document.addEventListener('DOMContentLoaded', init);
})();
