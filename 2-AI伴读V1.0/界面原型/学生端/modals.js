/**
 * 校校读吧小管家 - 学生端弹窗组件
 * 包含所有学生端需要的弹窗
 */

// 弹窗样式
const MODAL_STYLES = `
<style>
/* 引入设计系统变量 */
:root {
    --color-primary: #36CFC9;
    --color-secondary: #FFC857;
    --color-text-primary: #333333;
    --color-text-secondary: #666666;
    --color-text-tertiary: #999999;
    --color-bg-primary: #FFFFFF;
    --color-bg-secondary: #F0F9FF;
    --color-border: #E5E6EB;
    --radius-md: 8px;
    --radius-xl: 16px;
    --duration-fast: 100ms;
    --duration-normal: 200ms;
}

.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: none; align-items: center; justify-content: center; }
.modal-overlay.show { display: flex; }
.modal-container { background: white; border-radius: var(--radius-xl); width: 300px; max-width: 90%; overflow: hidden; animation: modalSlideIn var(--duration-normal) ease-out; }
@keyframes modalSlideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { padding: 20px; text-align: center; border-bottom: 1px solid #f0f0f0; }
.modal-title { font-size: 20px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px; }
.modal-subtitle { font-size: 14px; color: var(--color-text-tertiary); }
.modal-content { padding: 20px; }
.modal-text { font-size: 18px; color: var(--color-text-secondary); line-height: 1.8; text-align: center; }
.modal-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
.modal-actions { display: flex; border-top: 1px solid #f0f0f0; }
.modal-btn { flex: 1; height: 48px; background: none; border: none; font-size: 16px; cursor: pointer; transition: all var(--duration-fast); border-radius: var(--radius-md); }
.modal-btn:not(:last-child) { border-right: 1px solid #f0f0f0; }
.modal-btn.primary { color: var(--color-primary); font-weight: 600; }
.modal-btn.danger { color: #ff4d4f; }
.modal-btn:hover { background: var(--color-bg-secondary); }

.checkin-success { text-align: center; }
.checkin-icon { font-size: 64px; margin-bottom: 16px; }
.checkin-title { font-size: 20px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px; }
.checkin-subtitle { font-size: 14px; color: var(--color-text-tertiary); margin-bottom: 20px; }
.checkin-reward { display: flex; justify-content: space-around; padding: 16px; background: #f0f9ff; border-radius: 8px; margin-bottom: 20px; }
.reward-item { text-align: center; }
.reward-value { font-size: 24px; font-weight: 700; color: var(--color-primary); margin-bottom: 4px; }
.reward-label { font-size: 12px; color: var(--color-text-tertiary); }
.checkin-days { font-size: 14px; color: var(--color-text-secondary); }

.exam-complete { text-align: center; }
.score-circle { width: 120px; height: 120px; margin: 0 auto 20px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display: flex; align-items: center; justify-content: center; flex-direction: column; color: white; }
.score-number { font-size: 48px; font-weight: 700; }
.score-label { font-size: 14px; opacity: 0.9; }
.exam-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px; }
.stat-card { padding: 12px; background: #fafafa; border-radius: 8px; text-align: center; }
.stat-value { font-size: 18px; font-weight: 600; color: var(--color-primary); margin-bottom: 4px; }
.stat-label { font-size: 12px; color: var(--color-text-tertiary); }

.levelup-modal { text-align: center; }
.levelup-icon { font-size: 80px; margin-bottom: 16px; animation: bounce 0.6s ease-in-out; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
.levelup-title { font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px; }
.levelup-subtitle { font-size: 14px; color: var(--color-text-tertiary); margin-bottom: 20px; }
.level-badge { display: inline-block; padding: 8px 20px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; border-radius: 20px; font-size: 16px; font-weight: 600; margin-bottom: 20px; }
.levelup-benefits { text-align: left; padding: 16px; background: #f0f9ff; border-radius: 8px; margin-bottom: 20px; }
.benefit-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; color: var(--color-text-secondary); }
.benefit-item:last-child { margin-bottom: 0; }

.badge-earned { text-align: center; }
.badge-icon-large { width: 100px; height: 100px; margin: 0 auto 20px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3); animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.badge-name { font-size: 20px; font-weight: 700; color: var(--color-text-primary); margin-bottom: 8px; }
.badge-desc { font-size: 14px; color: var(--color-text-tertiary); margin-bottom: 20px; }
.badge-progress { padding: 16px; background: #fafafa; border-radius: 8px; }
.progress-text { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 8px; }
.progress-bar { height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-secondary)); transition: width 0.3s; }

.exchange-confirm { }
.product-preview { display: flex; gap: 12px; padding: 16px; background: #fafafa; border-radius: 8px; margin-bottom: 16px; }
.product-image { width: 60px; height: 60px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; }
.product-info { flex: 1; }
.product-name { font-size: 14px; font-weight: 600; color: var(--color-text-primary); margin-bottom: 4px; }
.product-price { font-size: 16px; font-weight: 700; color: var(--color-secondary); }
.exchange-info { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 16px; }
.points-info { display: flex; justify-content: space-between; padding: 12px; background: #fff7e6; border-radius: var(--radius-md); font-size: 14px; }
.points-label { color: var(--color-text-tertiary); }
.points-value { font-weight: 600; color: var(--color-text-primary); }
</style>
`;

// 弹窗HTML模板
const MODAL_TEMPLATES = {
    // 1. 打卡成功弹窗
    checkinSuccess: `
        <div class="modal-overlay" id="checkinSuccessModal">
            <div class="modal-container" style="width: 320px;">
                <div class="modal-content checkin-success">
                    <div class="checkin-title">打卡成功</div>
                    <div class="checkin-subtitle">坚持阅读，每天进步一点点</div>
                    <div class="checkin-reward">
                        <div class="reward-item">
                            <div class="reward-value">+5</div>
                            <div class="reward-label">积分</div>
                        </div>
                        <div class="reward-item">
                            <div class="reward-value">15</div>
                            <div class="reward-label">连续天数</div>
                        </div>
                    </div>
                    <div class="checkin-guide-preview" style="margin-top: 16px; padding: 12px; background: #f0f9ff; border-radius: 8px; border: 1px solid #e6f7ff;">
                        <div style="font-size: 13px; color: #1890ff; font-weight: 600; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                            <span>📋</span> 导读单已完成
                        </div>
                        <div style="font-size: 12px; color: #666; line-height: 1.5;">
                            点击下方按钮查看参考答案，对比学习效果更好哦
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('checkinSuccessModal')">返回</button>
                    <button class="modal-btn primary" onclick="viewGuideAnswer()">查看参考答案</button>
                </div>
            </div>
        </div>
    `,

    // 2. 测评完成弹窗
    examComplete: `
        <div class="modal-overlay" id="examCompleteModal">
            <div class="modal-container">
                <div class="modal-content exam-complete">
                    <div class="score-circle">
                        <div class="score-number">85</div>
                        <div class="score-label">分</div>
                    </div>
                    <div class="modal-title">测评完成</div>
                    <div class="modal-subtitle">表现不错，继续加油</div>
                    <div class="exam-stats">
                        <div class="stat-card">
                            <div class="stat-value">25分钟</div>
                            <div class="stat-label">用时</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">7/8</div>
                            <div class="stat-label">正确率</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">+20</div>
                            <div class="stat-label">获得积分</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">班级第3</div>
                            <div class="stat-label">排名</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('examCompleteModal')">返回</button>
                    <button class="modal-btn primary" onclick="viewExamResult()">查看详情</button>
                </div>
            </div>
        </div>
    `,

    // 3. 升级弹窗
    levelUp: `
        <div class="modal-overlay" id="levelUpModal">
            <div class="modal-container">
                <div class="modal-content levelup-modal">
                    <div class="levelup-icon">🎉</div>
                    <div class="levelup-title">恭喜升级</div>
                    <div class="levelup-subtitle">你的阅读等级提升了</div>
                    <div class="level-badge">Lv.5 阅读达人</div>
                    <div class="levelup-benefits">
                        <div class="benefit-item">
                            <span>✨</span>
                            <span>解锁专属勋章</span>
                        </div>
                        <div class="benefit-item">
                            <span>🎁</span>
                            <span>获得50积分奖励</span>
                        </div>
                        <div class="benefit-item">
                            <span>📚</span>
                            <span>开放高级书籍权限</span>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn primary" onclick="closeModal('levelUpModal')">太棒了</button>
                </div>
            </div>
        </div>
    `,

    // 4. 获得勋章弹窗
    badgeEarned: `
        <div class="modal-overlay" id="badgeEarnedModal">
            <div class="modal-container">
                <div class="modal-content badge-earned">
                    <div class="badge-icon-large">🏆</div>
                    <div class="badge-name">阅读新星</div>
                    <div class="badge-desc">连续阅读7天，养成良好习惯</div>
                    <div class="badge-progress">
                        <div class="progress-text">下一个勋章：阅读达人（连续阅读30天）</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 23%"></div>
                        </div>
                        <div class="progress-text" style="margin-top: 8px; text-align: right;">7/30天</div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('badgeEarnedModal')">返回</button>
                    <button class="modal-btn primary" onclick="viewAllBadges()">查看全部勋章</button>
                </div>
            </div>
        </div>
    `,

    // 5. 兑换确认弹窗
    exchangeConfirm: `
        <div class="modal-overlay" id="exchangeConfirmModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">确认兑换</div>
                </div>
                <div class="modal-content exchange-confirm">
                    <div class="product-preview">
                        <div class="product-image">文具</div>
                        <div class="product-info">
                            <div class="product-name">精美文具套装</div>
                            <div class="product-price">200积分</div>
                        </div>
                    </div>
                    <div class="exchange-info">
                        兑换后商品将在3-5天内送达，请确保收货地址正确
                    </div>
                    <div class="points-info">
                        <div>
                            <div class="points-label">当前积分</div>
                            <div class="points-value">580</div>
                        </div>
                        <div style="text-align: right;">
                            <div class="points-label">兑换后剩余</div>
                            <div class="points-value">380</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('exchangeConfirmModal')">取消</button>
                    <button class="modal-btn primary" onclick="confirmExchange()">确认兑换</button>
                </div>
            </div>
        </div>
    `,

    // 6. 删除确认弹窗
    deleteConfirm: `
        <div class="modal-overlay" id="deleteConfirmModal">
            <div class="modal-container">
                <div class="modal-content">
                    <div class="modal-icon">⚠️</div>
                    <div class="modal-text">确定要删除这条记录吗？<br>删除后无法恢复</div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('deleteConfirmModal')">取消</button>
                    <button class="modal-btn danger" onclick="confirmDelete()">删除</button>
                </div>
            </div>
        </div>
    `,

    // 7. 分享弹窗
    share: `
        <div class="modal-overlay" id="shareModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">分享到</div>
                </div>
                <div class="modal-content">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 10px;">
                        <div style="text-align: center; cursor: pointer;" onclick="shareToWechat()">
                            <div style="font-size: 40px; margin-bottom: 8px;">💬</div>
                            <div style="font-size: 13px; color: #595959;">微信</div>
                        </div>
                        <div style="text-align: center; cursor: pointer;" onclick="shareToMoments()">
                            <div style="font-size: 40px; margin-bottom: 8px;">📱</div>
                            <div style="font-size: 13px; color: #595959;">朋友圈</div>
                        </div>
                        <div style="text-align: center; cursor: pointer;" onclick="copyLink()">
                            <div style="font-size: 40px; margin-bottom: 8px;">🔗</div>
                            <div style="font-size: 13px; color: #595959;">复制链接</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('shareModal')">取消</button>
                </div>
            </div>
        </div>
    `,

    // 8. 加载中弹窗
    loading: `
        <div class="modal-overlay" id="loadingModal">
            <div class="modal-container" style="width: 120px; padding: 30px;">
                <div style="text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 12px; animation: spin 1s linear infinite;">⏳</div>
                    <div style="font-size: 14px; color: #595959;">加载中...</div>
                </div>
            </div>
        </div>
        <style>
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        </style>
    `,

    // 9. 提示弹窗
    toast: `
        <div id="toastContainer" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; display: none;">
            <div style="background: rgba(0,0,0,0.8); color: white; padding: 12px 24px; border-radius: 8px; font-size: 14px; white-space: nowrap;"></div>
        </div>
    `
};

// 弹窗控制函数
const ModalManager = {
    // 初始化弹窗
    init: function() {
        // 添加样式
        if (!document.getElementById('modal-styles')) {
            const styleEl = document.createElement('div');
            styleEl.id = 'modal-styles';
            styleEl.innerHTML = MODAL_STYLES;
            document.head.appendChild(styleEl);
        }

        // 添加所有弹窗模板到body
        Object.values(MODAL_TEMPLATES).forEach(template => {
            const div = document.createElement('div');
            div.innerHTML = template;
            document.body.appendChild(div.firstElementChild);
        });
    },

    // 显示弹窗
    show: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },

    // 关闭弹窗
    close: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },

    // 显示Toast提示
    showToast: function(message, duration = 2000) {
        const toast = document.getElementById('toastContainer');
        if (toast) {
            toast.querySelector('div').textContent = message;
            toast.style.display = 'block';
            setTimeout(() => {
                toast.style.display = 'none';
            }, duration);
        }
    }
};

// 全局函数
function showModal(modalId) {
    ModalManager.show(modalId);
}

function closeModal(modalId) {
    ModalManager.close(modalId);
}

function showToast(message, duration) {
    ModalManager.showToast(message, duration);
}

// 业务逻辑函数
function viewGuideAnswer() {
    closeModal('checkinSuccessModal');
    if (typeof Router !== 'undefined') {
        Router.toStudentPage('worksheetAnswer');
    } else {
        window.location.href = '09-打卡成功.html';
    }
}

function viewExamResult() {
    closeModal('examCompleteModal');
    if (typeof Router !== 'undefined') {
        Router.toStudentPage('examDetail');
    } else {
        window.location.href = '20-测评详情.html';
    }
}

function viewAllBadges() {
    closeModal('badgeEarnedModal');
    if (typeof Router !== 'undefined') {
        Router.toStudentPage('badge');
    }
}

function confirmExchange() {
    closeModal('exchangeConfirmModal');
    showToast('兑换成功，请等待发货');
}

function confirmDelete() {
    closeModal('deleteConfirmModal');
    showToast('删除成功');
}

function shareToWechat() {
    closeModal('shareModal');
    showToast('分享到微信');
}

function shareToMoments() {
    closeModal('shareModal');
    showToast('分享到朋友圈');
}

function copyLink() {
    closeModal('shareModal');
    showToast('链接已复制');
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ModalManager.init();
    });
} else {
    ModalManager.init();
}

// 导出到全局
window.ModalManager = ModalManager;
window.showModal = showModal;
window.closeModal = closeModal;
window.showToast = showToast;
