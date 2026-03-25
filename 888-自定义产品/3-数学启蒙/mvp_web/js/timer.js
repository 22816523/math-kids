// 家长控制 - 时长监控
const ParentalControl = {
  // 中文大写数字映射（1-10）
  CHINESE_NUMS: ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'],

  init() {
    this.checkTimeout();
    setInterval(() => this.checkTimeout(), 30000);
  },

  getSettings() {
    const s = localStorage.getItem('parentalSettings');
    return s ? JSON.parse(s) : { duration: 0 };
  },

  getStartTime() {
    return parseInt(localStorage.getItem('sessionStartTime') || Date.now());
  },

  resetTimer() {
    localStorage.setItem('sessionStartTime', Date.now());
  },

  checkTimeout() {
    const settings = this.getSettings();
    if (settings.duration === 0) return;
    const elapsed = Date.now() - this.getStartTime();
    const limit = settings.duration * 60 * 1000;
    if (elapsed >= limit) this.showVerifyModal();
  },

  // 生成3个不重复的1-10随机数字
  generateCode() {
    const pool = [1,2,3,4,5,6,7,8,9,10];
    const code = [];
    while (code.length < 3) {
      const idx = Math.floor(Math.random() * pool.length);
      code.push(pool.splice(idx, 1)[0]);
    }
    return code;
  },

  // 渲染验证弹窗内容
  _buildModal(title, text, code, onSuccess, onCancel) {
    const modal = document.createElement('div');
    modal.id = 'verifyModal';

    // 打乱显示的10个按钮顺序
    const shuffled = [...this.CHINESE_NUMS].sort(() => Math.random() - 0.5);
    let selected = [];

    const render = () => {
      modal.innerHTML = `
        <div class="modal-overlay">
          <div class="modal-content">
            <div class="modal-title">${title}</div>
            <div class="modal-text">${text}</div>
            <div class="verify-code">
              ${code.map((n, i) => {
                const filled = selected[i] !== undefined;
                return `<div class="verify-digit ${filled ? 'filled' : ''}">
                  ${filled ? this.CHINESE_NUMS[selected[i]-1] : n}
                </div>`;
              }).join('')}
            </div>
            <div class="verify-hint">请按顺序点击上方数字对应的中文大写</div>
            <div class="verify-options">
              ${shuffled.map(ch => {
                const val = this.CHINESE_NUMS.indexOf(ch) + 1;
                const usedIdx = selected.indexOf(val);
                return `<button class="verify-option-btn ${usedIdx !== -1 ? 'used' : ''}"
                  onclick="ParentalControl._selectChar(${val})">${ch}</button>`;
              }).join('')}
            </div>
            <div id="verifyError" class="verify-error"></div>
            ${onCancel ? `<button class="btn-ghost" style="margin-top:16px;" onclick="document.getElementById('verifyModal').remove()">取消</button>` : ''}
          </div>
        </div>
      `;
    };

    this._currentCode = code;
    this._currentSelected = selected;
    this._onSuccess = onSuccess;
    this._rerender = render;

    render();
    document.body.appendChild(modal);
  },

  _selectChar(val) {
    const code = this._currentCode;
    const selected = this._currentSelected;
    const step = selected.length;

    if (step >= 3) return;

    if (val === code[step]) {
      selected.push(val);
      this._rerender();

      if (selected.length === 3) {
        // 全对，短暂停顿后通过
        setTimeout(() => {
          document.getElementById('verifyModal')?.remove();
          this._onSuccess && this._onSuccess();
        }, 400);
      }
    } else {
      // 选错，重置并提示
      this._currentSelected.length = 0;
      this._rerender();
      const err = document.getElementById('verifyError');
      if (err) {
        err.textContent = '❌ 顺序不对，请重新选择';
        setTimeout(() => { if (err) err.textContent = ''; }, 1500);
      }
    }
  },

  showVerifyModal() {
    if (document.getElementById('verifyModal')) return;
    const code = this.generateCode();
    this._buildModal('⏰ 休息一下', '学习时间到啦！请家长验证后继续', code, () => {
      this.resetTimer();
    }, null);
  },

  requireVerification(callback) {
    if (document.getElementById('verifyModal')) return;
    const code = this.generateCode();
    this._pendingCallback = callback;
    this._buildModal('🔒 家长验证', '请完成验证以继续', code, () => {
      if (this._pendingCallback) {
        this._pendingCallback();
        this._pendingCallback = null;
      }
    }, true);
  }
};

// 初始化
if (!localStorage.getItem('sessionStartTime')) {
  ParentalControl.resetTimer();
}
ParentalControl.init();
