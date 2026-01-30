/**
 * 校校读吧小管家 - 教师端弹窗组件
 * 包含所有教师端需要的弹窗
 */

// 弹窗样式（教师端配色）
const MODAL_STYLES = `
<style>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: none; align-items: center; justify-content: center; }
.modal-overlay.show { display: flex; }
.modal-container { background: white; border-radius: 12px; width: 320px; max-width: 90%; overflow: hidden; animation: modalSlideIn 0.3s ease-out; }
@keyframes modalSlideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
.modal-header { padding: 20px; text-align: center; border-bottom: 1px solid #f0f0f0; }
.modal-title { font-size: 18px; font-weight: 600; color: #262626; margin-bottom: 4px; }
.modal-subtitle { font-size: 13px; color: #8c8c8c; }
.modal-content { padding: 20px; }
.modal-text { font-size: 14px; color: #595959; line-height: 1.8; text-align: center; }
.modal-icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
.modal-actions { display: flex; border-top: 1px solid #f0f0f0; }
.modal-btn { flex: 1; height: 48px; background: none; border: none; font-size: 16px; cursor: pointer; transition: all 0.2s; }
.modal-btn:not(:last-child) { border-right: 1px solid #f0f0f0; }
.modal-btn.primary { color: #1890FF; font-weight: 600; }
.modal-btn.danger { color: #ff4d4f; }
.modal-btn:hover { background: #f5f5f5; }

.publish-success { text-align: center; }
.success-icon { font-size: 64px; margin-bottom: 16px; }
.success-title { font-size: 20px; font-weight: 700; color: #262626; margin-bottom: 8px; }
.success-subtitle { font-size: 14px; color: #8c8c8c; margin-bottom: 20px; }
.publish-info { padding: 16px; background: #f0f9ff; border-radius: 8px; margin-bottom: 16px; }
.info-item { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
.info-item:last-child { margin-bottom: 0; }
.info-label { color: #8c8c8c; }
.info-value { color: #262626; font-weight: 600; }

.delete-confirm { }
.delete-warning { padding: 12px; background: #fff1f0; border-left: 3px solid #ff4d4f; border-radius: 4px; margin-bottom: 16px; }
.warning-text { font-size: 13px; color: #ff4d4f; line-height: 1.6; }
.delete-info { font-size: 14px; color: #595959; line-height: 1.8; }

.student-add { }
.form-group { margin-bottom: 16px; }
.form-group:last-child { margin-bottom: 0; }
.form-label { display: block; font-size: 13px; color: #595959; margin-bottom: 8px; }
.form-input { width: 100%; height: 36px; border: 1px solid #d9d9d9; border-radius: 4px; padding: 0 12px; font-size: 14px; }
.form-input:focus { outline: none; border-color: #1890FF; }
.form-select { width: 100%; height: 36px; border: 1px solid #d9d9d9; border-radius: 4px; padding: 0 12px; font-size: 14px; background: white; }

.batch-import { }
.upload-area { border: 2px dashed #d9d9d9; border-radius: 8px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 16px; }
.upload-area:hover { border-color: #1890FF; background: #f0f9ff; }
.upload-icon { font-size: 48px; margin-bottom: 12px; color: #8c8c8c; }
.upload-text { font-size: 14px; color: #595959; margin-bottom: 4px; }
.upload-hint { font-size: 12px; color: #8c8c8c; }
.template-link { color: #1890FF; text-decoration: underline; cursor: pointer; }

.message-send { }
.message-preview { padding: 16px; background: #fafafa; border-radius: 8px; margin-bottom: 16px; }
.message-title { font-size: 14px; font-weight: 600; color: #262626; margin-bottom: 8px; }
.message-content { font-size: 13px; color: #595959; line-height: 1.6; }
.recipient-info { display: flex; justify-content: space-between; padding: 12px; background: #f0f9ff; border-radius: 8px; font-size: 13px; }
.recipient-label { color: #8c8c8c; }
.recipient-count { color: #1890FF; font-weight: 600; }

.export-options { }
.option-group { margin-bottom: 20px; }
.option-group:last-child { margin-bottom: 0; }
.option-title { font-size: 14px; font-weight: 600; color: #262626; margin-bottom: 12px; }
.checkbox-group { }
.checkbox-item { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; cursor: pointer; }
.checkbox-item:last-child { margin-bottom: 0; }
.checkbox { width: 16px; height: 16px; }
.checkbox-label { font-size: 13px; color: #595959; }

.ai-generate { text-align: center; }
.ai-icon { font-size: 64px; margin-bottom: 16px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } }
.ai-title { font-size: 18px; font-weight: 600; color: #262626; margin-bottom: 8px; }
.ai-subtitle { font-size: 13px; color: #8c8c8c; margin-bottom: 20px; }
.ai-progress { padding: 16px; background: #f0f9ff; border-radius: 8px; }
.progress-text { font-size: 13px; color: #595959; margin-bottom: 8px; text-align: left; }
.progress-bar { height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #1890FF, #40a9ff); transition: width 0.3s; animation: progressMove 1.5s linear infinite; }
@keyframes progressMove { 0% { background-position: 0 0; } 100% { background-position: 50px 0; } }

.class-switch { }
.class-list { max-height: 300px; overflow-y: auto; }
.class-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f0f0f0; cursor: pointer; transition: all 0.2s; }
.class-item:hover { background: #f5f5f5; }
.class-item:last-child { border-bottom: none; }
.class-info { }
.class-name { font-size: 14px; font-weight: 600; color: #262626; margin-bottom: 4px; }
.class-meta { font-size: 12px; color: #8c8c8c; }
.class-badge { padding: 4px 12px; background: #e6f7ff; color: #1890FF; border-radius: 12px; font-size: 11px; font-weight: 600; }
</style>
`;

// 弹窗HTML模板
const MODAL_TEMPLATES = {
    // 1. 发布成功弹窗
    publishSuccess: `
        <div class="modal-overlay" id="publishSuccessModal">
            <div class="modal-container">
                <div class="modal-content publish-success">
                    <div class="success-icon">🎉</div>
                    <div class="success-title">发布成功</div>
                    <div class="success-subtitle">阅读计划已发布给学生</div>
                    <div class="publish-info">
                        <div class="info-item">
                            <span class="info-label">计划名称</span>
                            <span class="info-value">《三体》寒假阅读</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">目标班级</span>
                            <span class="info-value">初一(3)班</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">参与学生</span>
                            <span class="info-value">52人</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">阅读周期</span>
                            <span class="info-value">60天</span>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('publishSuccessModal')">返回</button>
                    <button class="modal-btn primary" onclick="viewPlanDetail()">查看详情</button>
                </div>
            </div>
        </div>
    `,

    // 2. 删除确认弹窗
    deleteConfirm: `
        <div class="modal-overlay" id="deleteConfirmModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">确认删除</div>
                </div>
                <div class="modal-content delete-confirm">
                    <div class="delete-warning">
                        <div class="warning-text">⚠️ 删除后无法恢复，请谨慎操作</div>
                    </div>
                    <div class="delete-info">
                        确定要删除这个阅读计划吗？<br>
                        删除后学生将无法继续访问该计划
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('deleteConfirmModal')">取消</button>
                    <button class="modal-btn danger" onclick="confirmDelete()">删除</button>
                </div>
            </div>
        </div>
    `,

    // 3. 添加学生弹窗
    studentAdd: `
        <div class="modal-overlay" id="studentAddModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">添加学生</div>
                </div>
                <div class="modal-content student-add">
                    <div class="form-group">
                        <label class="form-label">学生姓名 *</label>
                        <input type="text" class="form-input" placeholder="请输入学生姓名" id="studentName">
                    </div>
                    <div class="form-group">
                        <label class="form-label">学号 *</label>
                        <input type="text" class="form-input" placeholder="请输入学号" id="studentId">
                    </div>
                    <div class="form-group">
                        <label class="form-label">班级 *</label>
                        <select class="form-select" id="studentClass">
                            <option>初一(1)班</option>
                            <option>初一(2)班</option>
                            <option selected>初一(3)班</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">联系电话</label>
                        <input type="tel" class="form-input" placeholder="请输入联系电话" id="studentPhone">
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('studentAddModal')">取消</button>
                    <button class="modal-btn primary" onclick="confirmAddStudent()">确认添加</button>
                </div>
            </div>
        </div>
    `,

    // 4. 批量导入弹窗
    batchImport: `
        <div class="modal-overlay" id="batchImportModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">批量导入学生</div>
                </div>
                <div class="modal-content batch-import">
                    <div class="upload-area" onclick="selectFile()">
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">点击选择Excel文件</div>
                        <div class="upload-hint">支持 .xlsx 和 .xls 格式</div>
                    </div>
                    <div style="text-align: center; font-size: 13px; color: #8c8c8c;">
                        还没有模板？<span class="template-link" onclick="downloadTemplate()">下载导入模板</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('batchImportModal')">取消</button>
                    <button class="modal-btn primary" onclick="startImport()">开始导入</button>
                </div>
            </div>
        </div>
    `,

    // 5. 发送消息确认弹窗
    messageSend: `
        <div class="modal-overlay" id="messageSendModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">确认发送</div>
                </div>
                <div class="modal-content message-send">
                    <div class="message-preview">
                        <div class="message-title">阅读计划提醒</div>
                        <div class="message-content">
                            同学们好，《三体》阅读计划已经开始，请按时完成每日阅读任务并打卡。如有问题请及时联系老师
                        </div>
                    </div>
                    <div class="recipient-info">
                        <span class="recipient-label">发送对象</span>
                        <span class="recipient-count">初一(3)班 52名学生</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('messageSendModal')">取消</button>
                    <button class="modal-btn primary" onclick="confirmSendMessage()">确认发送</button>
                </div>
            </div>
        </div>
    `,

    // 6. 数据导出弹窗
    dataExport: `
        <div class="modal-overlay" id="dataExportModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">导出数据</div>
                </div>
                <div class="modal-content export-options">
                    <div class="option-group">
                        <div class="option-title">导出内容</div>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" class="checkbox" checked>
                                <span class="checkbox-label">学生基本信息</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" class="checkbox" checked>
                                <span class="checkbox-label">阅读进度数据</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" class="checkbox" checked>
                                <span class="checkbox-label">测评成绩</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" class="checkbox">
                                <span class="checkbox-label">打卡记录</span>
                            </label>
                        </div>
                    </div>
                    <div class="option-group">
                        <div class="option-title">导出格式</div>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="radio" name="format" class="checkbox" checked>
                                <span class="checkbox-label">Excel (.xlsx)</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="radio" name="format" class="checkbox">
                                <span class="checkbox-label">CSV (.csv)</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn" onclick="closeModal('dataExportModal')">取消</button>
                    <button class="modal-btn primary" onclick="confirmExport()">导出</button>
                </div>
            </div>
        </div>
    `,

    // 7. AI生成中弹窗
    aiGenerating: `
        <div class="modal-overlay" id="aiGeneratingModal">
            <div class="modal-container">
                <div class="modal-content ai-generate">
                    <div class="ai-icon">🤖</div>
                    <div class="ai-title">AI正在生成</div>
                    <div class="ai-subtitle">请稍候，这可能需要几秒钟</div>
                    <div class="ai-progress">
                        <div class="progress-text">正在分析书籍内容...</div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 60%"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    // 8. 切换班级弹窗
    classSwitch: `
        <div class="modal-overlay" id="classSwitchModal">
            <div class="modal-container">
                <div class="modal-header">
                    <div class="modal-title">切换班级</div>
                </div>
                <div class="modal-content class-switch">
                    <div class="class-list">
                        <div class="class-item" onclick="switchClass(1)">
                            <div class="class-info">
                                <div class="class-name">初一(1)班</div>
                                <div class="class-meta">48名学生 · 3个阅读计划</div>
                            </div>
                        </div>
                        <div class="class-item" onclick="switchClass(2)">
                            <div class="class-info">
                                <div class="class-name">初一(2)班</div>
                                <div class="class-meta">50名学生 · 2个阅读计划</div>
                            </div>
                        </div>
                        <div class="class-item" onclick="switchClass(3)">
                            <div class="class-info">
                                <div class="class-name">初一(3)班</div>
                                <div class="class-meta">52名学生 · 4个阅读计划</div>
                            </div>
                            <div class="class-badge">当前</div>
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn primary" onclick="closeModal('classSwitchModal')">取消</button>
                </div>
            </div>
        </div>
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
function viewPlanDetail() {
    closeModal('publishSuccessModal');
    if (typeof Router !== 'undefined') {
        Router.toTeacherPage('planDetail');
    }
}

function confirmDelete() {
    closeModal('deleteConfirmModal');
    showToast('删除成功');
}

function confirmAddStudent() {
    const name = document.getElementById('studentName').value;
    const id = document.getElementById('studentId').value;
    if (!name || !id) {
        showToast('请填写必填项');
        return;
    }
    closeModal('studentAddModal');
    showToast('添加成功');
}

function selectFile() {
    showToast('选择文件功能');
}

function downloadTemplate() {
    showToast('下载模板');
}

function startImport() {
    closeModal('batchImportModal');
    showToast('导入成功');
}

function confirmSendMessage() {
    closeModal('messageSendModal');
    showToast('消息已发送');
}

function confirmExport() {
    closeModal('dataExportModal');
    showToast('导出成功');
}

function switchClass(classId) {
    closeModal('classSwitchModal');
    showToast('已切换到班级 ' + classId);
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
