/**
 * store.js - 全局状态管理模块
 * 管理学习进度、星星余额、防沉迷、收藏品
 */

const STORAGE_KEY = 'english_learning_mvp';

// 默认初始状态
function getDefaultState() {
    return {
        version: '1.0',
        user: {
            stars_earned: 0,
            stars_spent: 0,
            current_unit: 1,
            current_lesson: 1
        },
        lessons: {},
        units: {
            1: { completed: false },
            2: { completed: false },
            3: { completed: false },
            4: { completed: false }
        },
        shop: [
            { id: 'color_fruit', type: 'coloring', title: '水果拼盘涂色卡', cost: 10, unit: 1, emoji: '🍎🍌🍊' },
            { id: 'color_animal', type: 'coloring', title: '动物园涂色卡', cost: 10, unit: 2, emoji: '🐱🐶🐰' },
            { id: 'book_rainbow', type: 'book', title: '彩虹绘本', cost: 15, unit: 3, emoji: '🌈' },
            { id: 'book_body', type: 'book', title: '身体认知绘本', cost: 15, unit: 4, emoji: '🤚👁️' }
        ],
        my_collection: [],
        coloring_saves: {},
        anti_addiction: {
            today_date: null,
            today_minutes: 0,
            daily_limit_minutes: 15,
            is_locked: false
        }
    };
}

// 初始化20集课程的 lessons 数据
function initLessons(state) {
    for (let i = 1; i <= 20; i++) {
        if (!state.lessons[i]) {
            state.lessons[i] = { completed: false, stars: 0, date: null };
        }
    }
}

const Store = {
    _state: null,

    // 加载状态
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                this._state = JSON.parse(raw);
            } else {
                this._state = getDefaultState();
            }
        } catch (e) {
            this._state = getDefaultState();
        }
        initLessons(this._state);
        return this._state;
    },

    // 保存状态
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
    },

    // 获取当前状态
    get state() {
        if (!this._state) this.load();
        return this._state;
    },

    // ===== 星星操作 =====
    get starsBalance() {
        return this.state.user.stars_earned - this.state.user.stars_spent;
    },

    earnStars(n) {
        this.state.user.stars_earned += n;
        this.save();
    },

    spendStars(n) {
        if (this.starsBalance >= n) {
            this.state.user.stars_spent += n;
            this.save();
            return true;
        }
        return false;
    },

    // ===== 课程进度 =====
    completeLesson(lessonId, stars) {
        const lesson = this.state.lessons[lessonId];
        if (lesson) {
            lesson.completed = true;
            lesson.stars = stars;
            lesson.date = new Date().toISOString().split('T')[0];
            // 更新当前课程指针
            if (lessonId >= this.state.user.current_lesson) {
                this.state.user.current_lesson = lessonId + 1;
            }
            // 检查Unit是否完成
            this._checkUnitCompletion();
            this.save();
        }
    },

    _checkUnitCompletion() {
        for (let u = 1; u <= 4; u++) {
            const start = (u - 1) * 5 + 1;
            let allDone = true;
            for (let l = start; l < start + 5; l++) {
                if (!this.state.lessons[l] || !this.state.lessons[l].completed) {
                    allDone = false;
                    break;
                }
            }
            this.state.units[u].completed = allDone;
            if (allDone && u >= this.state.user.current_unit) {
                this.state.user.current_unit = u + 1;
            }
        }
    },

    isLessonUnlocked(lessonId) {
        if (lessonId === 1) return true;
        // 前一课已完成才解锁下一课
        return this.state.lessons[lessonId - 1] && this.state.lessons[lessonId - 1].completed;
    },

    // ===== 商店与收藏 =====
    buyItem(itemId) {
        const item = this.state.shop.find(i => i.id === itemId);
        if (!item) return false;
        if (this.state.my_collection.includes(itemId)) return false; // 已拥有
        if (!this.spendStars(item.cost)) return false;
        this.state.my_collection.push(itemId);
        this.save();
        return true;
    },

    ownsItem(itemId) {
        return this.state.my_collection.includes(itemId);
    },

    // ===== 涂色保存 =====
    saveColoring(itemId, colorData) {
        this.state.coloring_saves[itemId] = colorData;
        this.save();
    },

    getColoring(itemId) {
        return this.state.coloring_saves[itemId] || null;
    },

    resetColoring(itemId) {
        delete this.state.coloring_saves[itemId];
        this.save();
    },

    // ===== 防沉迷 =====
    checkAntiAddiction() {
        const aa = this.state.anti_addiction;
        const today = new Date().toISOString().split('T')[0];
        if (aa.today_date !== today) {
            aa.today_date = today;
            aa.today_minutes = 0;
            aa.is_locked = false;
        }
        this.save();
        return aa;
    },

    tickMinute() {
        const aa = this.state.anti_addiction;
        aa.today_minutes += 1;
        if (aa.today_minutes >= aa.daily_limit_minutes) {
            aa.is_locked = true;
        }
        this.save();
        return aa;
    },

    // ===== 进度导出/恢复 =====
    exportProgress() {
        return btoa(unescape(encodeURIComponent(JSON.stringify(this._state))));
    },

    importProgress(code) {
        try {
            this._state = JSON.parse(decodeURIComponent(escape(atob(code))));
            this.save();
            return true;
        } catch (e) {
            return false;
        }
    },

    // 重置所有数据
    reset() {
        this._state = getDefaultState();
        initLessons(this._state);
        this.save();
    }
};
