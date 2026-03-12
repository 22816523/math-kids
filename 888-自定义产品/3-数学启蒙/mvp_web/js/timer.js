// 家长控制 - 时长监控
const ParentalControl = {
  init() {
    this.checkTimeout();
    setInterval(() => this.checkTimeout(), 30000); // 每30秒检查一次
  },

  getSettings() {
    const settings = localStorage.getItem('parentalSettings');
    return settings ? JSON.parse(settings) : { duration: 0 }; // 0表示不限制
  },

  getStartTime() {
    return parseInt(localStorage.getItem('sessionStartTime') || Date.now());
  },

  resetTimer() {
    localStorage.setItem('sessionStartTime', Date.now());
  },

  checkTimeout() {
    const settings = this.getSettings();
    if (settings.duration === 0) return; // 不限制

    const startTime = this.getStartTime();
    const elapsed = Date.now() - startTime;
    const limit = settings.duration * 60 * 1000; // 转换为毫秒

    if (elapsed >= limit) {
      this.showVerifyModal();
    }
  },

  showVerifyModal() {
    if (document.getElementById('verifyModal')) return;

    const number = Math.floor(Math.random() * 90) + 10;
    const chinese = this.numberToChinese(number);
    const options = this.generateOptions(number);

    const modal = document.createElement('div');
    modal.id = 'verifyModal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-title">⏰ 休息一下</div>
          <div class="modal-text">学习时间到啦！请家长验证后继续</div>
          <div class="verify-number">${chinese}</div>
          <div class="verify-options">
            ${options.map(opt =>
              `<button class="verify-option-btn" onclick="ParentalControl.verify(${number}, ${opt})">${opt}</button>`
            ).join('')}
          </div>
          <div id="verifyError" class="verify-error"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  verify(correctNumber, selected) {
    if (selected === correctNumber) {
      this.resetTimer();
      document.getElementById('verifyModal').remove();
    } else {
      document.getElementById('verifyError').textContent = '❌ 验证失败，请重试';
    }
  },

  numberToChinese(num) {
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    if (num < 10) return digits[num];
    if (num === 10) return '拾';

    const tens = Math.floor(num / 10);
    const ones = num % 10;

    let result = '';
    if (tens === 1) {
      result = '拾';
    } else {
      result = digits[tens] + '拾';
    }

    if (ones > 0) {
      result += digits[ones];
    }

    return result;
  },

  generateOptions(correctNumber) {
    const options = [correctNumber];
    while (options.length < 4) {
      const opt = Math.floor(Math.random() * 90) + 10;
      if (!options.includes(opt)) {
        options.push(opt);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  },

  requireVerification(callback) {
    const number = Math.floor(Math.random() * 90) + 10;
    const chinese = this.numberToChinese(number);
    const options = this.generateOptions(number);
    this._pendingCallback = callback;

    const modal = document.createElement('div');
    modal.id = 'verifyModal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-title">🔒 家长验证</div>
          <div class="modal-text">请完成验证以继续</div>
          <div class="verify-number">${chinese}</div>
          <div class="verify-options">
            ${options.map(opt =>
              `<button class="verify-option-btn" onclick="ParentalControl.verifyAndCallback(${number}, ${opt})">${opt}</button>`
            ).join('')}
          </div>
          <button class="btn-ghost" style="margin-top:16px;" onclick="document.getElementById('verifyModal').remove()">取消</button>
          <div id="verifyError" class="verify-error"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  verifyAndCallback(correctNumber, selected) {
    if (selected === correctNumber) {
      document.getElementById('verifyModal').remove();
      if (this._pendingCallback) {
        this._pendingCallback();
        this._pendingCallback = null;
      }
    } else {
      document.getElementById('verifyError').textContent = '❌ 验证失败，请重试';
    }
  }
};

// 初始化
if (!localStorage.getItem('sessionStartTime')) {
  ParentalControl.resetTimer();
}
ParentalControl.init();
