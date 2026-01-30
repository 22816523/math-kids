/**
 * 校校读吧小管家 - 路由管理系统
 * 模拟小程序的路由跳转功能
 */

// 路由配置
const ROUTES = {
    // 学生端路由
    student: {
        home: '01-首页.html',
        checkin: '02-打卡.html',
        aiChat: '03-AI对话.html',
        exam: '04-测评答题.html',
        shop: '05-积分商城.html',
        profile: '06-个人中心.html',
        bookshelf: '07-书架.html',
        examResult: '08-测评结果.html',
        badge: '09-等级勋章.html',
        rank: '10-班级排行榜.html',
        aiVideo: '11-AI导读视频.html',
        points: '12-积分明细.html',
        profileEdit: '13-个人信息编辑.html',
        notification: '14-消息通知.html',
        about: '15-关于我们.html',
        exchangeRecord: '16-兑换记录.html',
        readingStats: '17-阅读统计.html',
        readBook: '18-阅读书籍.html',
        bookDetail: '19-书籍详情.html',
        examDetail: '20-测评详情.html',
        notes: '21-我的笔记.html',
        productDetail: '22-商品详情.html',
        address: '23-收货地址.html',
        classmateDetail: '24-同学详情.html',
        planDetail: '25-计划详情.html',
        badgeDetail: '26-勋章详情.html',
        favorites: '27-我的收藏.html',
        examList: '28-测评列表.html'
    },
    // 教师端路由
    teacher: {
        login: '01-登录.html',
        pointsDetail: '02-积分明细.html',
        history: '03-历史活动.html',
        classList: '04-班级列表.html',
        createClass: '05-创建班级.html',
        planList: '06-阅读计划列表.html',
        studentManage: '07-学生管理.html',
        studentDetail: '08-学生详情.html',
        examDetail: '09-测评详情.html',
        enrollPlan: '10-报名阅读计划.html',
        feedbackRecord: '11-反馈记录.html',
        planDetailPreview: '12-计划详情预览.html',
        bookLevelDetail: '13-书籍关卡详情.html',
        monitor: '14-进度监控.html',
        examManage: '15-测评管理.html',
        examQuestionList: '16-测评题列表.html',
        userFeedback: '17-用户反馈.html',
        planExamStats: '18-计划测评统计.html',
        bookExamStats: '19-书籍测评统计.html',
        report: '20-数据报告.html',
        dataExport: '21-数据导出.html',
        message: '22-消息推送.html',
        createMessage: '23-新建消息.html',
        messageDetail: '24-消息详情.html',
        receivedMessageDetail: '25-收到的消息详情.html',
        profile: '26-教师个人中心.html',
        profileEdit: '27-个人信息编辑.html',
        changeAvatar: '28-更换头像.html',
        editName: '29-编辑姓名.html',
        selectGender: '30-选择性别.html',
        editBio: '31-编辑个人简介.html',
        selectGrade: '32-选择学段.html',
        selectSchool: '33-选择学校.html',
        selectSubject: '34-选择学科.html',
        selectTeachingYears: '35-选择教龄.html',
        security: '36-账号安全.html',
        bindEmail: '37-绑定邮箱.html',
        changePhone: '38-修改手机号.html'
    }
};

// Tab页面配置（学生端）
const STUDENT_TABS = ['home', 'checkin', 'aiChat', 'shop', 'profile'];

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
