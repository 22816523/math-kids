/**
 * 校校读吧小管家 - 管理平台通用脚本
 * PC端管理后台共享JavaScript
 */

// ==================== 角色定义 ====================
const ROLES = {
    SUPER_ADMIN: 'super_admin',
    SCHOOL_ADMIN: 'school_admin',
    TEACHER: 'teacher',
    CONTENT_MANAGER: 'content_manager'
};

const ROLE_NAMES = {
    [ROLES.SUPER_ADMIN]: '超级管理员',
    [ROLES.SCHOOL_ADMIN]: '学校管理员',
    [ROLES.TEACHER]: '教师',
    [ROLES.CONTENT_MANAGER]: '内容管理员'
};

// ==================== 菜单配置 ====================
const MENU_CONFIG = {
    [ROLES.SUPER_ADMIN]: [
        {
            group: '工作台',
            items: [
                { icon: '📊', text: '数据概览', page: '13-数据看板.html', id: 'dashboard' },
            ]
        },
        {
            group: '学校管理',
            items: [
                { icon: '🏫', text: '学校列表', page: '23-学校管理.html', id: 'school' },
                { icon: '👥', text: '角色权限', page: '22-角色管理.html', id: 'role' },
            ]
        },
        {
            group: '用户管理',
            items: [
                { icon: '👨‍🏫', text: '教师管理', page: '28-教师管理.html', id: 'teacher' },
                { icon: '👨‍🎓', text: '学生管理', page: '26-学生管理.html', id: 'student' },
                { icon: '🎓', text: '班级管理', page: '11-班级管理.html', id: 'class' },
            ]
        },
        {
            group: '内容管理',
            items: [
                { icon: '📚', text: '书库管理', page: '10-图书管理.html', id: 'book' },
                { icon: '⭐', text: '推荐书单', page: '09-书单管理.html', id: 'booklist' },
                { icon: '📝', text: '题库管理', page: '20-题库管理.html', id: 'question' },
                { icon: '🎬', text: '资源库', page: '21-资源管理.html', id: 'resource' },
            ]
        },
        {
            group: '审核管理',
            items: [
                { icon: '✅', text: '内容审核', page: '12-内容审核.html', id: 'audit' },
                { icon: '📋', text: '审核记录', page: '07-审核记录.html', id: 'auditRecords' },
            ]
        },
        {
            group: '运营管理',
            items: [
                { icon: '🏆', text: '积分规则', page: '18-积分配置.html', id: 'points' },
                { icon: '🎖️', text: '等级勋章', page: '08-徽章配置.html', id: 'badge' },
                { icon: '🛒', text: '商城管理', page: '25-商城管理.html', id: 'store' },
            ]
        },
        {
            group: '消息通知',
            items: [
                { icon: '📢', text: '消息推送', page: '17-消息推送.html', id: 'message' },
                { icon: '📨', text: '推送记录', page: '19-推送记录.html', id: 'pushRecords' },
            ]
        },
        {
            group: '数据分析',
            items: [
                { icon: '📈', text: '数据统计', page: '16-数据统计.html', id: 'stats' },
                { icon: '📊', text: '数据对比', page: '14-数据对比.html', id: 'compare' },
                { icon: '📤', text: '数据导出', page: '15-数据导出.html', id: 'export' },
            ]
        },
        {
            group: '系统配置',
            items: [
                { icon: '⚙️', text: '系统参数', page: '27-系统配置.html', id: 'system' },
                { icon: '📖', text: '科目管理', page: '29-科目管理.html', id: 'subject' },
            ]
        },
        {
            group: '个人中心',
            items: [
                { icon: '👤', text: '个人设置', page: '24-系统设置.html', id: 'settings' },
            ]
        }
    ],
    [ROLES.SCHOOL_ADMIN]: [
        {
            group: '工作台',
            items: [
                { icon: '📊', text: '数据概览', page: '13-数据看板.html', id: 'dashboard' },
            ]
        },
        {
            group: '用户管理',
            items: [
                { icon: '👨‍🏫', text: '教师管理', page: '28-教师管理.html', id: 'teacher' },
                { icon: '👨‍🎓', text: '学生管理', page: '26-学生管理.html', id: 'student' },
                { icon: '🎓', text: '班级管理', page: '11-班级管理.html', id: 'class' },
            ]
        },
        {
            group: '内容管理',
            items: [
                { icon: '📚', text: '书库管理', page: '10-图书管理.html', id: 'book' },
                { icon: '⭐', text: '推荐书单', page: '09-书单管理.html', id: 'booklist' },
                { icon: '📝', text: '题库管理', page: '20-题库管理.html', id: 'question' },
                { icon: '🎬', text: '资源库', page: '21-资源管理.html', id: 'resource' },
            ]
        },
        {
            group: '运营管理',
            items: [
                { icon: '🏆', text: '积分规则', page: '18-积分配置.html', id: 'points' },
                { icon: '🎖️', text: '等级勋章', page: '08-徽章配置.html', id: 'badge' },
                { icon: '🛒', text: '商城管理', page: '25-商城管理.html', id: 'store' },
            ]
        },
        {
            group: '消息通知',
            items: [
                { icon: '📢', text: '消息推送', page: '17-消息推送.html', id: 'message' },
                { icon: '📨', text: '推送记录', page: '19-推送记录.html', id: 'pushRecords' },
            ]
        },
        {
            group: '数据分析',
            items: [
                { icon: '📈', text: '数据统计', page: '16-数据统计.html', id: 'stats' },
                { icon: '📊', text: '数据对比', page: '14-数据对比.html', id: 'compare' },
                { icon: '📤', text: '数据导出', page: '15-数据导出.html', id: 'export' },
            ]
        },
        {
            group: '系统配置',
            items: [
                { icon: '📖', text: '科目管理', page: '29-科目管理.html', id: 'subject' },
            ]
        },
        {
            group: '个人中心',
            items: [
                { icon: '👤', text: '个人设置', page: '24-系统设置.html', id: 'settings' },
            ]
        }
    ],
    [ROLES.TEACHER]: [
        {
            group: '工作台',
            items: [
                { icon: '📊', text: '我的班级', page: '13-数据看板.html', id: 'dashboard' },
            ]
        },
        {
            group: '班级管理',
            items: [
                { icon: '👨‍🎓', text: '学生管理', page: '26-学生管理.html', id: 'student' },
                { icon: '🎓', text: '班级管理', page: '11-班级管理.html', id: 'class' },
            ]
        },
        {
            group: '教学资源',
            items: [
                { icon: '📚', text: '书库浏览', page: '10-图书管理.html', id: 'book' },
                { icon: '⭐', text: '推荐书单', page: '09-书单管理.html', id: 'booklist' },
            ]
        },
        {
            group: '消息通知',
            items: [
                { icon: '📢', text: '消息推送', page: '17-消息推送.html', id: 'message' },
            ]
        },
        {
            group: '数据查看',
            items: [
                { icon: '📈', text: '数据统计', page: '16-数据统计.html', id: 'stats' },
            ]
        },
        {
            group: '个人中心',
            items: [
                { icon: '👤', text: '个人设置', page: '24-系统设置.html', id: 'settings' },
            ]
        }
    ],
    [ROLES.CONTENT_MANAGER]: [
        {
            group: '工作台',
            items: [
                { icon: '📊', text: '内容概览', page: '13-数据看板.html', id: 'dashboard' },
            ]
        },
        {
            group: '内容管理',
            items: [
                { icon: '📚', text: '书库管理', page: '10-图书管理.html', id: 'book' },
                { icon: '⭐', text: '推荐书单', page: '09-书单管理.html', id: 'booklist' },
                { icon: '📝', text: '题库管理', page: '20-题库管理.html', id: 'question' },
                { icon: '🎬', text: '资源库', page: '21-资源管理.html', id: 'resource' },
            ]
        },
        {
            group: '审核管理',
            items: [
                { icon: '✅', text: '内容审核', page: '12-内容审核.html', id: 'audit' },
                { icon: '📋', text: '审核记录', page: '07-审核记录.html', id: 'auditRecords' },
            ]
        },
        {
            group: '个人中心',
            items: [
                { icon: '👤', text: '个人设置', page: '24-系统设置.html', id: 'settings' },
            ]
        }
    ]
};

// ==================== 用户管理 ====================
class UserManager {
    constructor() {
        this.currentUser = this.loadUser();
    }

    // 加载用户信息
    loadUser() {
        const userStr = localStorage.getItem('admin_user');
        if (userStr) {
            return JSON.parse(userStr);
        }
        // 默认用户
        return {
            id: 1,
            name: '张老师',
            role: ROLES.SUPER_ADMIN,
            avatar: '张',
            school: '示范中学',
            email: 'zhang@example.com'
        };
    }

    // 保存用户信息
    saveUser(user) {
        localStorage.setItem('admin_user', JSON.stringify(user));
        this.currentUser = user;
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 获取用户角色
    getUserRole() {
        return this.currentUser.role;
    }

    // 获取角色名称
    getRoleName() {
        return ROLE_NAMES[this.currentUser.role];
    }

    // 切换角色（用于原型演示）
    switchRole(role) {
        this.currentUser.role = role;
        this.saveUser(this.currentUser);
        window.location.reload();
    }

    // 登出
    logout() {
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    }
}

// ==================== 菜单管理 ====================
class MenuManager {
    constructor(userManager) {
        this.userManager = userManager;
    }

    // 获取当前角色的菜单
    getMenuForCurrentRole() {
        const role = this.userManager.getUserRole();
        return MENU_CONFIG[role] || [];
    }

    // 渲染侧边栏菜单
    renderSidebar() {
        const menu = this.getMenuForCurrentRole();
        const menuContainer = document.querySelector('.sidebar-menu');

        if (!menuContainer) return;

        let html = '';
        menu.forEach(group => {
            html += `<div class="menu-group">`;
            html += `<div class="menu-group-title">${group.group}</div>`;
            group.items.forEach(item => {
                const isActive = this.isActivePage(item.page);
                html += `
                    <a href="${item.page}" class="menu-item ${isActive ? 'active' : ''}" data-id="${item.id}">
                        <span class="menu-icon">${item.icon}</span>
                        <span class="menu-text">${item.text}</span>
                        ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
                    </a>
                `;
            });
            html += `</div>`;
        });

        menuContainer.innerHTML = html;
    }

    // 判断是否是当前页面
    isActivePage(page) {
        const currentPage = window.location.pathname.split('/').pop();
        return currentPage === page;
    }

    // 渲染侧边栏头部
    renderSidebarHeader() {
        const user = this.userManager.getCurrentUser();
        const roleName = this.userManager.getRoleName();
        const headerContainer = document.querySelector('.sidebar-header');

        if (!headerContainer) return;

        headerContainer.innerHTML = `
            <div class="sidebar-logo">
                <div class="logo-icon">📚</div>
                <div class="logo-text">校校读吧</div>
            </div>
            <div class="sidebar-role">${roleName}</div>
        `;
    }
}

// ==================== 页面管理 ====================
class PageManager {
    constructor(userManager) {
        this.userManager = userManager;
    }

    // 渲染顶部导航栏
    renderHeader(breadcrumbs = []) {
        const user = this.userManager.getCurrentUser();
        const headerContainer = document.querySelector('.admin-header');

        if (!headerContainer) return;

        // 生成面包屑
        let breadcrumbHtml = '<a href="13-数据看板.html" class="breadcrumb-item">首页</a>';
        breadcrumbs.forEach((item, index) => {
            breadcrumbHtml += '<span class="breadcrumb-separator">/</span>';
            if (index === breadcrumbs.length - 1) {
                breadcrumbHtml += `<span class="breadcrumb-item active">${item}</span>`;
            } else {
                breadcrumbHtml += `<a href="#" class="breadcrumb-item">${item}</a>`;
            }
        });

        headerContainer.innerHTML = `
            <div class="header-breadcrumb">${breadcrumbHtml}</div>
            <div class="header-actions">
                <div class="header-search">
                    <input type="text" class="header-search-input" placeholder="搜索...">
                    <span class="header-search-icon">🔍</span>
                </div>
                <div class="header-notification">
                    🔔
                    <span class="notification-badge">5</span>
                </div>
                <div class="header-user" onclick="toggleUserMenu()">
                    <div class="user-avatar">${user.avatar}</div>
                    <div class="user-info">
                        <div class="user-name">${user.name}</div>
                        <div class="user-role">${this.userManager.getRoleName()}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // 设置页面标题
    setPageTitle(title, description = '') {
        const headerContainer = document.querySelector('.page-header');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <h1 class="page-title">${title}</h1>
                ${description ? `<p class="page-description">${description}</p>` : ''}
            `;
        }
    }
}

// ==================== 工具函数 ====================

// 显示提示消息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 24px;
        background: ${type === 'success' ? '#52c41a' : type === 'error' ? '#ff4d4f' : '#1890FF'};
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 显示确认对话框
function showConfirm(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

// 显示模态框
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// 隐藏模态框
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// 格式化日期
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');

    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hour)
        .replace('mm', minute)
        .replace('ss', second);
}

// 格式化数字
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 切换用户菜单
function toggleUserMenu() {
    showToast('用户菜单功能开发中', 'info');
}

// 切换角色（用于原型演示）
function switchRole(role) {
    const userManager = new UserManager();
    userManager.switchRole(role);
}

// ==================== 初始化 ====================
let userManager, menuManager, pageManager;

document.addEventListener('DOMContentLoaded', function() {
    // 初始化管理器
    userManager = new UserManager();
    menuManager = new MenuManager(userManager);
    pageManager = new PageManager(userManager);

    // 渲染侧边栏
    menuManager.renderSidebarHeader();
    menuManager.renderSidebar();

    // 添加页面淡入动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
    }, 100);
});

// 导出到全局
window.userManager = userManager;
window.menuManager = menuManager;
window.pageManager = pageManager;
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showModal = showModal;
window.hideModal = hideModal;
window.formatDate = formatDate;
window.formatNumber = formatNumber;
window.switchRole = switchRole;
window.ROLES = ROLES;
window.ROLE_NAMES = ROLE_NAMES;
