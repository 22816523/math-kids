/**
 * 校校读吧小管家 - 路由管理系统
 * 模拟小程序的路由跳转功能
 */

// 路由配置
const ROUTES = {
    // 学生端路由
    student: {
        login: '00-登录.html',
        home: '01-首页.html',
        checkin: '02-打卡.html',
        aiChat: '03-AI对话.html',
        exam: '04-测评答题.html',
        examResult: '05-测评结果.html',
        shop: '05-积分商城.html',
        profile: '06-个人中心.html',
        myChildren: '06-1-我的孩子.html',
        addChild: '06-2-添加孩子.html',
        bookshelf: '07-书架.html',
        badge: '09-等级勋章.html',
        rank: '10-班级排行榜.html',
        aiVideo: '11-AI导读视频.html',
        points: '12-积分明细.html',
        profileEdit: '13-个人信息编辑.html',
        notification: '14-消息通知.html',
        messageDetail: '14-1-消息详情.html',
        readingPlanList: '15-阅读计划列表.html',
        readingPlanDetail: '15-1-阅读计划详情.html',
        readingPlanHistory: '15-2-历史活动.html',
        exchangeRecord: '16-兑换记录.html',
        readingStats: '17-我的阅读.html',
        readBook: '18-阅读书籍.html',
        bookDetail: '19-书籍详情.html',
        examDetail: '20-测评详情.html',
        productDetail: '22-商品详情.html',
        address: '23-收货地址.html',
        badgeDetail: '26-勋章详情.html',
        examList: '28-测评列表.html',
        checkinRecord: '29-我的打卡记录.html',
        checkinDetail: '30-打卡详情.html',
        aiIntro: '07-AI导语.html',
        joinClass: '08-加入班级.html',
        worksheetAnswer: '09-打卡成功.html',
        abilityProfile: '10-阅读能力图谱.html',
        certificates: '21-我的奖状.html',
        feedback: '31-用户反馈.html',
        feedbackRecord: '32-反馈记录.html',
        classCheckin: '40-班级广场.html',
        classCheckinDetail: '30-打卡详情.html',
        news: '41-资讯列表.html',
        newsDetail: '42-资讯详情.html'
    },
    // 教师端路由
    teacher: {
        login: '00-登录.html',
        forgotPassword: '00-找回密码.html',
        planList: '01-阅读计划列表.html',
        createClass: '34-创建班级.html',
        createPlan: '01-创建计划-基本信息.html',
        basicInfo: '01-创建计划-基本信息.html',
        selectBook: '02-创建阅读计划.html',
        setupTasks: '03-创建计划-划分章节.html',
        divideChapters: '03-创建计划-划分章节.html',  // 兼容旧路由
        monitor: '03-进度监控.html',
        examManage: '04-测评管理.html',
        report: '05-数据报告.html',
        studentDetail: '06-学生详情.html',
        examReview: '07-测评批改.html',
        message: '08-消息推送.html',
        createMessage: '08-1-新建消息.html',
        studentManage: '09-学生管理.html',
        classSettings: '22-班级详情.html',  // 已整合到班级详情页
        profile: '11-教师个人中心.html',
        dataExport: '12-数据导出.html',
        searchBook: '13-搜索书籍.html',
        recommendBook: '14-推荐书单.html',
        configResources: '15-配置阅读资源.html',
        scanBook: '16-扫码添加.html',
        previewPublish: '17-预览发布.html',
        createExam: '18-创建测评.html',
        questionBank: '19-题库管理.html',
        editPlan: '20-编辑计划.html',
        planDetail: '21-计划详情.html',
        classDetail: '22-班级详情.html',
        messageDetail: '23-消息详情.html',
        receivedMessageDetail: '23-1-收到的消息详情.html',
        studentCompare: '24-学生对比.html',
        resourceLibrary: '25-资源库.html',
        parentCommunication: '26-家长沟通.html',
        profileEdit: '27-个人信息编辑.html',
        changePassword: '28-1-修改密码.html',
        changePhone: '28-2-修改手机号.html',
        bindEmail: '28-3-绑定邮箱.html',
        notification: '29-通知设置.html',
        privacy: '30-隐私设置.html',
        help: '31-使用帮助.html',
        feedback: '32-意见反馈.html',
        about: '33-关于我们.html',
        quarterlyPlans: '43-季度计划列表.html',
        publishQuarterlyPlan: '44-发布季度计划.html',
        history: '46-历史活动.html'
    }
};

// Tab页面配置（学生端）
const STUDENT_TABS = ['home', 'checkin', 'aiChat', 'shop', 'bookshelf', 'profile'];

// Tab页面配置（教师端）
const TEACHER_TABS = ['planList', 'monitor', 'examManage', 'profile'];

/**
 * 模拟小程序的路由API
 */
const wx = {
    /**
     * 保留当前页面，跳转到应用内的某个页面
     * @param {Object} options - 跳转选项
     * @param {String} options.url - 需要跳转的应用内页面路径
     */
    navigateTo: function(options) {
        if (!options || !options.url) {
            console.error('navigateTo: url is required');
            return;
        }

        // 添加页面切换动画
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = options.url;
        }, 200);
    },

    /**
     * 关闭当前页面，跳转到应用内的某个页面
     * @param {Object} options - 跳转选项
     * @param {String} options.url - 需要跳转的应用内页面路径
     */
    redirectTo: function(options) {
        if (!options || !options.url) {
            console.error('redirectTo: url is required');
            return;
        }

        // 使用replace避免产生历史记录
        window.location.replace(options.url);
    },

    /**
     * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
     * @param {Object} options - 跳转选项
     * @param {String} options.url - 需要跳转的 tabBar 页面路径
     */
    switchTab: function(options) {
        if (!options || !options.url) {
            console.error('switchTab: url is required');
            return;
        }

        // Tab切换使用replace
        window.location.replace(options.url);
    },

    /**
     * 关闭当前页面，返回上一页面或多级页面
     * @param {Object} options - 返回选项
     * @param {Number} options.delta - 返回的页面数，默认为1
     */
    navigateBack: function(options) {
        const delta = (options && options.delta) || 1;
        window.history.go(-delta);
    },

    /**
     * 关闭所有页面，打开到应用内的某个页面
     * @param {Object} options - 跳转选项
     * @param {String} options.url - 需要跳转的应用内页面路径
     */
    reLaunch: function(options) {
        if (!options || !options.url) {
            console.error('reLaunch: url is required');
            return;
        }

        window.location.replace(options.url);
    }
};

/**
 * 路由辅助函数
 */
const Router = {
    /**
     * 获取URL参数
     * @param {String} name - 参数名
     * @returns {String|null} 参数值
     */
    getQuery: function(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * 获取所有URL参数
     * @returns {Object} 参数对象
     */
    getAllQuery: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        for (const [key, value] of urlParams) {
            params[key] = value;
        }
        return params;
    },

    /**
     * 构建带参数的URL
     * @param {String} url - 基础URL
     * @param {Object} params - 参数对象
     * @returns {String} 完整URL
     */
    buildUrl: function(url, params) {
        if (!params || Object.keys(params).length === 0) {
            return url;
        }

        const queryString = new URLSearchParams(params).toString();
        return `${url}?${queryString}`;
    },

    /**
     * 跳转到学生端页面
     * @param {String} page - 页面key
     * @param {Object} params - 参数对象
     * @param {String} method - 跳转方式 (navigateTo/redirectTo/switchTab)
     */
    toStudentPage: function(page, params, method = 'navigateTo') {
        const url = ROUTES.student[page];
        if (!url) {
            console.error(`Student page not found: ${page}`);
            return;
        }

        const fullUrl = this.buildUrl(url, params);

        if (STUDENT_TABS.includes(page)) {
            wx.switchTab({ url: fullUrl });
        } else {
            wx[method]({ url: fullUrl });
        }
    },

    /**
     * 跳转到教师端页面
     * @param {String} page - 页面key
     * @param {Object} params - 参数对象
     * @param {String} method - 跳转方式 (navigateTo/redirectTo/switchTab)
     */
    toTeacherPage: function(page, params, method = 'navigateTo') {
        const url = ROUTES.teacher[page];
        if (!url) {
            console.error(`Teacher page not found: ${page}`);
            return;
        }

        const fullUrl = this.buildUrl(url, params);

        if (TEACHER_TABS.includes(page)) {
            wx.switchTab({ url: fullUrl });
        } else {
            wx[method]({ url: fullUrl });
        }
    },

    /**
     * 返回上一页
     * @param {Number} delta - 返回的页面数
     */
    back: function(delta = 1) {
        wx.navigateBack({ delta });
    }
};

const STUDENT_CHILDREN_KEY = 'studentChildren';
const CURRENT_CHILD_KEY = 'currentChildId';
const PENDING_CHILD_KEY = 'pendingChildProfile';
const DEFAULT_CHILDREN = [
    {
        id: 'child_1',
        name: '小明',
        school: '阳光小学',
        className: '三年级一班',
        avatar: '明',
        points: 520,
        status: '正在学习中'
    },
    {
        id: 'child_2',
        name: '小雨',
        school: '阳光小学',
        className: '一年级二班',
        avatar: '雨',
        points: 360,
        status: '今日待打卡'
    }
];

const StudentChildStore = {
    getChildren: function() {
        try {
            const raw = localStorage.getItem(STUDENT_CHILDREN_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (error) {
            console.error('读取孩子档案失败:', error);
            return [];
        }
    },

    setChildren: function(children) {
        localStorage.setItem(STUDENT_CHILDREN_KEY, JSON.stringify(children));
    },

    ensureDemoChildren: function() {
        let children = this.getChildren();
        if (children.length < DEFAULT_CHILDREN.length) {
            children = DEFAULT_CHILDREN;
            this.setChildren(children);
        }

        if (!this.getCurrentChild()) {
            this.setCurrentChild(children[0].id);
        } else {
            this.syncLegacyUserInfo();
        }

        return children;
    },

    getCurrentChildId: function() {
        return localStorage.getItem(CURRENT_CHILD_KEY);
    },

    getCurrentChild: function() {
        const children = this.getChildren();
        const currentId = this.getCurrentChildId();
        return children.find(item => item.id === currentId) || children[0] || null;
    },

    setCurrentChild: function(childId) {
        localStorage.setItem(CURRENT_CHILD_KEY, childId);
        this.syncLegacyUserInfo();
    },

    syncLegacyUserInfo: function() {
        const current = this.getCurrentChild();
        if (!current) return;

        localStorage.setItem('userInfo', JSON.stringify({
            name: current.name,
            class: current.className,
            school: current.school
        }));
    },

    addChild: function(childData) {
        const children = this.getChildren();
        const nextChild = {
            id: `child_${Date.now()}`,
            name: childData.name,
            school: childData.school,
            className: childData.className,
            avatar: (childData.name || '新同学').slice(-1),
            points: childData.points || 0,
            status: childData.status || ''
        };

        children.push(nextChild);
        this.setChildren(children);
        this.setCurrentChild(nextChild.id);
        return nextChild;
    },

    removeChild: function(childId) {
        const children = this.getChildren();
        const nextChildren = children.filter(child => child.id !== childId);

        this.setChildren(nextChildren);

        if (!nextChildren.length) {
            localStorage.removeItem(CURRENT_CHILD_KEY);
            localStorage.removeItem('userInfo');
            return null;
        }

        const currentChild = this.getCurrentChild();
        if (!currentChild || currentChild.id === childId) {
            this.setCurrentChild(nextChildren[0].id);
            return nextChildren[0];
        }

        return this.getCurrentChild();
    },

    createPendingChild: function(name) {
        const childName = (name || '').trim() || '新同学';
        const child = {
            id: `child_${Date.now()}`,
            name: childName,
            school: '待加入班级',
            className: '待加入班级',
            avatar: childName.slice(-1),
            points: 0,
            status: '等待加入班级'
        };

        localStorage.setItem(PENDING_CHILD_KEY, JSON.stringify(child));
        return child;
    },

    getPendingChild: function() {
        try {
            const raw = localStorage.getItem(PENDING_CHILD_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            console.error('读取待添加孩子失败:', error);
            return null;
        }
    },

    clearPendingChild: function() {
        localStorage.removeItem(PENDING_CHILD_KEY);
    },

    finalizePendingChild: function(extra = {}) {
        const pendingChild = this.getPendingChild();
        if (!pendingChild) return null;

        const children = this.getChildren();
        const nextChild = { ...pendingChild, ...extra };
        children.push(nextChild);
        this.setChildren(children);
        this.setCurrentChild(nextChild.id);
        this.clearPendingChild();
        return nextChild;
    }
};

/**
 * 页面加载完成后的初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 添加页面淡入动画
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.3s';

    // 打印当前页面参数（调试用）
    const params = Router.getAllQuery();
    if (Object.keys(params).length > 0) {
        console.log('页面参数:', params);
    }
});

// 导出到全局
window.wx = wx;
window.Router = Router;
window.ROUTES = ROUTES;
window.StudentChildStore = StudentChildStore;

