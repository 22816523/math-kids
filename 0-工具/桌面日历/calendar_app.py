# -*- coding: utf-8 -*-
"""
桌面浮动日历工具 - 暗黑玻璃拟态风格
功能：本周/本月视图切换、农历显示、黄历宜忌、休息日标记、天气显示
作者：AI Assistant
"""

import sys
import os
import calendar
import json
import urllib.request
import threading
from datetime import datetime, date, timedelta
from PyQt5.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QPushButton, QGridLayout, QFrame,
    QGraphicsOpacityEffect
)
from PyQt5.QtCore import Qt, QPoint, QPropertyAnimation, QEasingCurve, QTimer
from PyQt5.QtGui import QFont, QColor, QPainter, QBrush, QPen, QLinearGradient, QIcon

# 尝试导入 lunardate 库
try:
    from lunardate import LunarDate
    USE_LUNARDATE = True
except ImportError:
    USE_LUNARDATE = False

# ==================== 农历计算模块 ====================
class LunarCalendar:
    """
    农历计算类
    基于寿星万年历算法，计算公历对应的农历日期
    """

    # 农历数据表（1900-2100年）
    LUNAR_INFO = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
        0x0d520
    ]

    # 天干
    TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    # 地支
    DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    # 生肖
    SHENG_XIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    # 农历月份
    LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']
    # 农历日期
    LUNAR_DAY = [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ]

    @classmethod
    def get_lunar_year_days(cls, year):
        """获取农历年的总天数"""
        sum_days = 348
        for i in range(0x8000, 0x8, -1):
            if cls.LUNAR_INFO[year - 1900] & i:
                sum_days += 1
        return sum_days + cls.get_leap_days(year)

    @classmethod
    def get_leap_month(cls, year):
        """获取闰月月份，无闰月返回0"""
        return cls.LUNAR_INFO[year - 1900] & 0xf

    @classmethod
    def get_leap_days(cls, year):
        """获取闰月天数"""
        if cls.get_leap_month(year):
            return 30 if cls.LUNAR_INFO[year - 1900] & 0x10000 else 29
        return 0

    @classmethod
    def get_lunar_month_days(cls, year, month):
        """获取农历月份的天数"""
        return 30 if cls.LUNAR_INFO[year - 1900] & (0x10000 >> month) else 29

    @classmethod
    def solar_to_lunar(cls, year, month, day):
        """
        公历转农历
        返回：(农历年, 农历月, 农历日, 是否闰月)
        """
        # 计算距离1900年1月31日的天数
        base_date = date(1900, 1, 31)
        target_date = date(year, month, day)
        offset = (target_date - base_date).days

        # 计算农历年
        lunar_year = 1900
        while lunar_year < 2101 and offset > 0:
            days_in_year = cls.get_lunar_year_days(lunar_year)
            if offset < days_in_year:
                break
            offset -= days_in_year
            lunar_year += 1

        # 计算农历月
        lunar_month = 1
        leap_month = cls.get_leap_month(lunar_year)
        is_leap = False

        while lunar_month < 13 and offset > 0:
            # 闰月
            if leap_month > 0 and lunar_month == (leap_month + 1) and not is_leap:
                lunar_month -= 1
                is_leap = True
                days_in_month = cls.get_leap_days(lunar_year)
            else:
                days_in_month = cls.get_lunar_month_days(lunar_year, lunar_month)

            if offset < days_in_month:
                break

            offset -= days_in_month

            if is_leap and lunar_month == leap_month:
                is_leap = False

            lunar_month += 1

        lunar_day = offset + 1
        return lunar_year, lunar_month, lunar_day, is_leap

    @classmethod
    def get_lunar_date_str(cls, year, month, day):
        """获取农历日期字符串"""
        try:
            if USE_LUNARDATE:
                # 使用 lunardate 库获取准确的农历
                ld = LunarDate.fromSolarDate(year, month, day)
                lunar_month = ld.month
                lunar_day = ld.day
                is_leap = ld.isLeapMonth
            else:
                # 使用内置算法
                lunar_year, lunar_month, lunar_day, is_leap = cls.solar_to_lunar(year, month, day)

            # 确保索引在有效范围内
            lunar_month = max(1, min(12, lunar_month))
            lunar_day = max(1, min(30, lunar_day))
            month_str = ('闰' if is_leap else '') + cls.LUNAR_MONTH[lunar_month - 1] + '月'
            day_str = cls.LUNAR_DAY[lunar_day - 1]
            return f"{month_str}{day_str}"
        except Exception:
            return ""

    @classmethod
    def get_ganzhi_year(cls, year):
        """获取年份的天干地支"""
        gan_index = (year - 4) % 10
        zhi_index = (year - 4) % 12
        return cls.TIAN_GAN[gan_index] + cls.DI_ZHI[zhi_index]

    @classmethod
    def get_shengxiao(cls, year):
        """获取生肖"""
        return cls.SHENG_XIAO[(year - 4) % 12]


# ==================== 黄历数据模块 ====================
class Almanac:
    """
    黄历类
    提供每日宜忌、冲煞等信息
    """

    # 宜事项列表
    YI_LIST = [
        '祭祀', '祈福', '求嗣', '开光', '出行', '解除', '动土', '起基',
        '开市', '交易', '立券', '挂匾', '纳财', '入宅', '移徙', '安床',
        '栽种', '入殓', '破土', '安葬', '修坟', '立碑', '嫁娶', '纳采',
        '订盟', '冠笄', '裁衣', '会亲友', '进人口', '经络', '开仓', '出货财',
        '修造', '竖柱', '上梁', '开渠', '穿井', '盖屋', '造桥', '筑堤',
        '开池', '伐木', '作灶', '造畜稠', '教牛马', '破屋', '坏垣', '余事勿取'
    ]

    # 忌事项列表
    JI_LIST = [
        '嫁娶', '开市', '安葬', '动土', '破土', '出行', '移徙', '入宅',
        '祭祀', '祈福', '开光', '安床', '作灶', '掘井', '词讼', '诸事不宜'
    ]

    # 冲煞数据
    CHONG_LIST = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
    SHA_LIST = ['北', '西', '南', '东']

    # 喜神方位（按天干）
    XI_SHEN = ['东北', '西北', '西南', '正南', '东南', '东北', '西北', '西南', '正南', '东南']
    # 财神方位（按天干）
    CAI_SHEN = ['东北', '正东', '正南', '东南', '正南', '正西', '西南', '正北', '正东', '正南']

    @classmethod
    def get_day_info(cls, year, month, day):
        """
        获取某日的黄历信息
        使用简化算法生成宜忌（实际应用中应使用完整黄历数据）
        """
        # 基于日期生成伪随机但固定的宜忌
        seed = year * 10000 + month * 100 + day

        # 生成宜事项（3-5个）
        yi_count = (seed % 3) + 3
        yi_items = []
        for i in range(yi_count):
            idx = (seed + i * 7) % len(cls.YI_LIST)
            if cls.YI_LIST[idx] not in yi_items:
                yi_items.append(cls.YI_LIST[idx])

        # 生成忌事项（2-4个）
        ji_count = (seed % 3) + 2
        ji_items = []
        for i in range(ji_count):
            idx = (seed + i * 11) % len(cls.JI_LIST)
            if cls.JI_LIST[idx] not in ji_items and cls.JI_LIST[idx] not in yi_items:
                ji_items.append(cls.JI_LIST[idx])

        # 计算冲煞
        chong_idx = (seed + day) % 12
        sha_idx = day % 4
        chong = f"冲{cls.CHONG_LIST[chong_idx]}"
        sha = f"煞{cls.SHA_LIST[sha_idx]}"

        # 计算喜神、财神方位（基于天干）
        gan_idx = (seed + day) % 10
        xi_shen = f"喜神{cls.XI_SHEN[gan_idx]}"
        cai_shen = f"财神{cls.CAI_SHEN[gan_idx]}"

        return {
            'yi': yi_items,
            'ji': ji_items,
            'chong': chong,
            'sha': sha,
            'xi_shen': xi_shen,
            'cai_shen': cai_shen
        }


# ==================== 2026年休息日数据 ====================
# 包含法定节假日和周末休息日（已排除调休工作日）
REST_DAYS_2026 = {
    # 1月
    (2026, 1, 1), (2026, 1, 2), (2026, 1, 3), (2026, 1, 10), (2026, 1, 11),
    (2026, 1, 18), (2026, 1, 24), (2026, 1, 25),
    # 2月（春节假期）
    (2026, 2, 1), (2026, 2, 7), (2026, 2, 8), (2026, 2, 12), (2026, 2, 13),
    (2026, 2, 14), (2026, 2, 15), (2026, 2, 16), (2026, 2, 17), (2026, 2, 18),
    (2026, 2, 19), (2026, 2, 20), (2026, 2, 21), (2026, 2, 22), (2026, 2, 23),
    # 3月
    (2026, 3, 1), (2026, 3, 7), (2026, 3, 8), (2026, 3, 15), (2026, 3, 21),
    (2026, 3, 22), (2026, 3, 29),
    # 4月（清明节）
    (2026, 4, 4), (2026, 4, 5), (2026, 4, 6), (2026, 4, 12), (2026, 4, 18),
    (2026, 4, 19), (2026, 4, 26),
    # 5月（劳动节）
    (2026, 5, 1), (2026, 5, 2), (2026, 5, 3), (2026, 5, 4), (2026, 5, 5),
    (2026, 5, 10), (2026, 5, 16), (2026, 5, 17), (2026, 5, 24), (2026, 5, 30),
    (2026, 5, 31),
    # 6月（端午节）
    (2026, 6, 7), (2026, 6, 13), (2026, 6, 14), (2026, 6, 19), (2026, 6, 20),
    (2026, 6, 21), (2026, 6, 28),
    # 7月
    (2026, 7, 4), (2026, 7, 5), (2026, 7, 12), (2026, 7, 18), (2026, 7, 19),
    (2026, 7, 26),
    # 8月
    (2026, 8, 1), (2026, 8, 2), (2026, 8, 9), (2026, 8, 15), (2026, 8, 16),
    (2026, 8, 23), (2026, 8, 29), (2026, 8, 30),
    # 9月（中秋节）
    (2026, 9, 6), (2026, 9, 12), (2026, 9, 13), (2026, 9, 19), (2026, 9, 25),
    (2026, 9, 26), (2026, 9, 27),
    # 10月（国庆节）
    (2026, 10, 1), (2026, 10, 2), (2026, 10, 3), (2026, 10, 4), (2026, 10, 5),
    (2026, 10, 6), (2026, 10, 7), (2026, 10, 11), (2026, 10, 17), (2026, 10, 18),
    (2026, 10, 25), (2026, 10, 31),
    # 11月
    (2026, 11, 1), (2026, 11, 8), (2026, 11, 14), (2026, 11, 15), (2026, 11, 22),
    (2026, 11, 28), (2026, 11, 29),
    # 12月
    (2026, 12, 6), (2026, 12, 12), (2026, 12, 13), (2026, 12, 20), (2026, 12, 26),
    (2026, 12, 27),
}


# ==================== 皮肤主题定义 ====================
# 皮肤配置字典，包含所有主题的颜色和样式参数
THEMES = {
    'glass': {  # 暗黑玻璃拟态（原版）
        'name': '玻璃拟态',
        'container_bg': 'rgba(30, 30, 30, 0.95)',
        'container_border': '1px solid rgba(255, 255, 255, 0.1)',
        'container_shadow': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'container_radius': '16px',
        'title_color': '#00c3ff',
        'title_gradient': 'qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #00c3ff, stop:1 #ffff1c)',
        'btn_bg': 'rgba(255, 255, 255, 0.1)',
        'btn_color': '#cccccc',
        'btn_border': 'none',
        'btn_radius': '20px',
        'btn_active_bg': 'qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #00c3ff, stop:1 #ffff1c)',
        'btn_active_color': '#1a1a1a',
        'weekday_color': '#999999',
        'date_bg': 'transparent',
        'date_color': '#ffffff',
        'date_border': 'none',
        'date_radius': '12px',
        'date_hover_bg': 'rgba(0, 200, 255, 0.1)',
        'today_border_color1': '#00c3ff',
        'today_border_color2': '#ffff1c',
        'today_bg': 'rgba(30, 30, 30, 0.95)',
        'rest_bg': '#e63946',
        'rest_color': '#ffffff',
        'rest_border': 'none',
        'rest_hover_bg': '#d62828',
        'selected_bg': 'rgba(0, 200, 255, 0.2)',
        'selected_color': '#00c3ff',
        'selected_border': 'none',
        'detail_bg': 'rgba(255, 255, 255, 0.05)',
        'detail_border': 'none',
        'detail_title_color': '#ffffff',
        'detail_text_color': '#cccccc',
        'detail_sub_color': '#999999',
        'yi_color': '#4ade80',
        'ji_color': '#f87171',
        'close_bg': 'rgba(255, 255, 255, 0.1)',
        'close_color': '#ffffff',
        'nav_color': 'rgba(255, 255, 255, 0.7)',
    },
    'industrial': {  # 机械工业风
        'name': '机械工业',
        'container_bg': '#2C2C2C',
        'container_border': '1px solid #E0E0E0',
        'container_shadow': '0 0 30px rgba(224, 224, 224, 0.3)',
        'container_radius': '0px',
        'title_color': '#00BFFF',
        'title_gradient': 'qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #00BFFF, stop:1 #FFFFFF)',
        'btn_bg': '#1A1A1A',
        'btn_color': '#E0E0E0',
        'btn_border': '1px solid #00BFFF',
        'btn_radius': '0px',
        'btn_active_bg': '#00BFFF',
        'btn_active_color': '#1a1a1a',
        'weekday_color': '#E0E0E0',
        'date_bg': '#1A1A1A',
        'date_color': '#E0E0E0',
        'date_border': '1px solid #333333',
        'date_radius': '0px',
        'date_hover_bg': '#333333',
        'today_border_color1': '#00BFFF',
        'today_border_color2': '#00BFFF',
        'today_bg': '#222222',
        'rest_bg': '#2A6099',
        'rest_color': '#FFFFFF',
        'rest_border': '1px solid #00BFFF',
        'rest_hover_bg': '#1F4B78',
        'selected_bg': 'rgba(0, 191, 255, 0.2)',
        'selected_color': '#00BFFF',
        'selected_border': '1px solid #00BFFF',
        'detail_bg': '#1A1A1A',
        'detail_border': '1px solid #00BFFF',
        'detail_title_color': '#E0E0E0',
        'detail_text_color': '#E0E0E0',
        'detail_sub_color': '#CCCCCC',
        'yi_color': '#4ade80',
        'ji_color': '#f87171',
        'close_bg': '#1A1A1A',
        'close_color': '#E0E0E0',
        'nav_color': '#E0E0E0',
    },
    'fresh': {  # 小清新治愈风
        'name': '小清新',
        'container_bg': '#FCFCFC',
        'container_border': '1px solid #A7E9C1',
        'container_shadow': '0 0 30px rgba(167, 233, 193, 0.1)',
        'container_radius': '16px',
        'title_color': '#607B96',
        'title_gradient': 'qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #A7E9C1, stop:1 #607B96)',
        'btn_bg': '#F0F9F4',
        'btn_color': '#607B96',
        'btn_border': 'none',
        'btn_radius': '12px',
        'btn_active_bg': '#A7E9C1',
        'btn_active_color': '#ffffff',
        'weekday_color': '#607B96',
        'date_bg': '#F0F9F4',
        'date_color': '#607B96',
        'date_border': 'none',
        'date_radius': '16px',
        'date_hover_bg': '#E0F5EA',
        'today_border_color1': '#A7E9C1',
        'today_border_color2': '#A7E9C1',
        'today_bg': '#FCFCFC',
        'rest_bg': '#F8C8DC',
        'rest_color': '#607B96',
        'rest_border': 'none',
        'rest_hover_bg': '#F5B8D2',
        'selected_bg': 'rgba(167, 233, 193, 0.3)',
        'selected_color': '#5BA37A',
        'selected_border': 'none',
        'detail_bg': '#F0F9F4',
        'detail_border': '1px solid #A7E9C1',
        'detail_title_color': '#607B96',
        'detail_text_color': '#607B96',
        'detail_sub_color': '#94A3B8',
        'yi_color': '#22c55e',
        'ji_color': '#e879a0',
        'close_bg': '#F0F9F4',
        'close_color': '#607B96',
        'nav_color': '#607B96',
    },
    'minimal': {  # 极致简约风
        'name': '极简风格',
        'container_bg': '#F8F8F8',
        'container_border': '1px solid #E8E8E8',
        'container_shadow': 'none',
        'container_radius': '6px',
        'title_color': '#333333',
        'title_gradient': 'none',
        'btn_bg': '#FFFFFF',
        'btn_color': '#333333',
        'btn_border': '1px solid #E8E8E8',
        'btn_radius': '6px',
        'btn_active_bg': '#333333',
        'btn_active_color': '#FFFFFF',
        'weekday_color': '#333333',
        'date_bg': '#FFFFFF',
        'date_color': '#333333',
        'date_border': '1px solid #E8E8E8',
        'date_radius': '6px',
        'date_hover_bg': '#F0F0F0',
        'today_border_color1': '#333333',
        'today_border_color2': '#333333',
        'today_bg': '#FFFFFF',
        'rest_bg': '#E8F4F8',
        'rest_color': '#333333',
        'rest_border': '1px solid #E8E8E8',
        'rest_hover_bg': '#E0EFF5',
        'selected_bg': 'rgba(102, 102, 102, 0.08)',
        'selected_color': '#666666',
        'selected_border': '1px solid #666666',
        'detail_bg': '#FFFFFF',
        'detail_border': '1px solid #E8E8E8',
        'detail_title_color': '#333333',
        'detail_text_color': '#333333',
        'detail_sub_color': '#666666',
        'yi_color': '#22c55e',
        'ji_color': '#ef4444',
        'close_bg': '#FFFFFF',
        'close_color': '#333333',
        'nav_color': '#333333',
    },
    'vintage': {  # 复古台历风
        'name': '复古台历',
        'container_bg': '#EADBC8',
        'container_border': '2px solid #B88663',
        'container_shadow': '0 0 25px rgba(184, 134, 99, 0.35)',
        'container_radius': '8px',
        'title_color': '#9E2B25',
        'title_gradient': 'qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #9E2B25, stop:1 #D4A017)',
        'btn_bg': '#F5EAD3',
        'btn_color': '#804722',
        'btn_border': '1px solid #B88663',
        'btn_radius': '4px',
        'btn_active_bg': '#9E2B25',
        'btn_active_color': '#EADBC8',
        'btn_active_border': '1px solid #D4A017',
        'weekday_color': '#804722',
        'date_bg': '#F5EAD3',
        'date_color': '#804722',
        'date_border': '1px solid #B88663',
        'date_radius': '4px',
        'date_hover_bg': '#E2D0B0',
        'today_border_color1': '#D4A017',
        'today_border_color2': '#D4A017',
        'today_bg': '#FFF5E1',
        'rest_bg': '#9E2B25',
        'rest_color': '#EADBC8',
        'rest_border': '1px solid #D4A017',
        'rest_hover_bg': '#8A2621',
        'selected_bg': 'rgba(158, 43, 37, 0.12)',
        'selected_color': '#9E2B25',
        'selected_border': '1px solid #9E2B25',
        'detail_bg': '#F5EAD3',
        'detail_border': '1px solid #B88663',
        'detail_title_color': '#804722',
        'detail_text_color': '#804722',
        'detail_sub_color': '#A66D4F',
        'yi_color': '#2E7D32',
        'ji_color': '#9E2B25',
        'close_bg': '#F5EAD3',
        'close_color': '#804722',
        'nav_color': '#804722',
    },
}


# ==================== 天气获取模块 ====================
class WeatherFetcher:
    """
    天气获取类
    使用 wttr.in 免费API获取天气数据
    """

    # 天气代码映射到天气类型和图标
    WEATHER_MAP = {
        # 晴天
        '113': ('sunny', '☀️'),
        # 多云
        '116': ('partly_cloudy', '⛅'),
        '119': ('cloudy', '☁️'),
        '122': ('overcast', '☁️'),
        # 雾
        '143': ('foggy', '🌫️'),
        '248': ('foggy', '🌫️'),
        '260': ('foggy', '🌫️'),
        # 小雨/毛毛雨
        '176': ('light_rain', '🌦️'),
        '263': ('light_rain', '🌦️'),
        '266': ('light_rain', '🌦️'),
        '293': ('light_rain', '🌦️'),
        '296': ('light_rain', '🌦️'),
        # 中雨/大雨
        '299': ('rain', '🌧️'),
        '302': ('rain', '🌧️'),
        '305': ('rain', '🌧️'),
        '308': ('rain', '🌧️'),
        '311': ('rain', '🌧️'),
        '314': ('rain', '🌧️'),
        '317': ('rain', '🌧️'),
        '353': ('rain', '🌧️'),
        '356': ('rain', '🌧️'),
        '359': ('rain', '🌧️'),
        # 雷阵雨
        '200': ('thunderstorm', '⛈️'),
        '386': ('thunderstorm', '⛈️'),
        '389': ('thunderstorm', '⛈️'),
        '392': ('thunderstorm', '⛈️'),
        '395': ('thunderstorm', '⛈️'),
        # 小雪
        '179': ('light_snow', '🌨️'),
        '323': ('light_snow', '🌨️'),
        '326': ('light_snow', '🌨️'),
        '368': ('light_snow', '🌨️'),
        # 中雪/大雪
        '182': ('snow', '❄️'),
        '185': ('snow', '❄️'),
        '227': ('snow', '❄️'),
        '230': ('snow', '❄️'),
        '329': ('snow', '❄️'),
        '332': ('snow', '❄️'),
        '335': ('snow', '❄️'),
        '338': ('snow', '❄️'),
        '350': ('snow', '❄️'),
        '371': ('snow', '❄️'),
        '374': ('snow', '❄️'),
        '377': ('snow', '❄️'),
    }

    # 天气类型对应的图标（用于直接查询）
    WEATHER_ICONS = {
        'sunny': '☀️',
        'partly_cloudy': '⛅',
        'cloudy': '☁️',
        'overcast': '☁️',
        'foggy': '🌫️',
        'light_rain': '🌦️',
        'rain': '🌧️',
        'thunderstorm': '⛈️',
        'light_snow': '🌨️',
        'snow': '❄️',
    }

    @staticmethod
    def fetch_weather(callback):
        """
        异步获取天气数据
        callback: 回调函数，接收(天气类型, 图标, 温度, 城市名)
        """
        def _fetch():
            try:
                # 使用wttr.in API获取天气（自动根据IP定位）
                url = 'https://wttr.in/?format=j1'
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=10) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    # 获取当前天气代码
                    current = data.get('current_condition', [{}])[0]
                    weather_code = current.get('weatherCode', '113')
                    temp_c = current.get('temp_C', '--')
                    # 获取城市名称
                    nearest_area = data.get('nearest_area', [{}])[0]
                    city_name = nearest_area.get('areaName', [{}])[0].get('value', '')
                    weather_info = WeatherFetcher.WEATHER_MAP.get(weather_code, ('sunny', '☀️'))
                    callback(weather_info[0], weather_info[1], temp_c, city_name)
            except Exception as e:
                print(f"Weather fetch error: {e}")
                # 获取失败时默认显示晴天
                callback('sunny', '☀️', '--', '')

        # 在后台线程中执行
        thread = threading.Thread(target=_fetch, daemon=True)
        thread.start()


def generate_stylesheet(theme_key):
    """根据主题配置生成样式表"""
    t = THEMES.get(theme_key, THEMES['glass'])
    return f"""
/* 主窗口样式 */
QWidget#mainWindow {{
    background-color: {t['container_bg']};
    border-radius: {t['container_radius']};
    border: {t['container_border']};
}}

/* 标题栏样式 */
QLabel#titleLabel {{
    color: {t['title_color']};
    font-size: 20px;
    font-weight: bold;
    padding: 8px;
}}

/* 时间显示样式 */
QLabel#timeLabel {{
    color: {t['title_color']};
    font-size: 18px;
    font-weight: bold;
}}

/* 切换按钮样式 */
QPushButton#viewButton {{
    background-color: {t['btn_bg']};
    color: {t['btn_color']};
    border: {t['btn_border']};
    border-radius: {t['btn_radius']};
    padding: 6px 16px;
    font-size: 14px;
}}

QPushButton#viewButton:hover {{
    background-color: {t['date_hover_bg']};
    color: {t['date_color']};
}}

QPushButton#viewButton:checked {{
    background: {t['btn_active_bg']};
    color: {t['btn_active_color']};
    font-weight: bold;
}}

/* 皮肤选择按钮 */
QPushButton#skinButton {{
    background-color: {t['btn_bg']};
    color: {t['btn_color']};
    border: {t['btn_border']};
    border-radius: {t['btn_radius']};
    padding: 6px 12px;
    font-size: 12px;
}}

QPushButton#skinButton:hover {{
    background-color: {t['date_hover_bg']};
}}

/* 星期标签样式 */
QLabel#weekdayLabel {{
    color: {t['weekday_color']};
    font-size: 14px;
    padding: 4px;
}}

/* 普通日期按钮样式 */
QPushButton#dateButton {{
    background-color: {t['date_bg']};
    color: {t['date_color']};
    border: {t['date_border']};
    border-radius: {t['date_radius']};
    font-size: 22px;
    font-weight: bold;
    min-width: 60px;
    max-width: 60px;
    min-height: 50px;
    max-height: 50px;
}}

QPushButton#dateButton:hover {{
    background-color: {t['date_hover_bg']};
}}

/* 选中态日期按钮 */
QPushButton#selectedButton {{
    background-color: {t['selected_bg']};
    color: {t['selected_color']};
    border: {t['selected_border']};
    border-radius: {t['date_radius']};
    font-size: 22px;
    font-weight: bold;
    min-width: 60px;
    max-width: 60px;
    min-height: 50px;
    max-height: 50px;
}}

/* 休息日按钮样式 */
QPushButton#restDayButton {{
    background-color: {t['rest_bg']};
    color: {t['rest_color']};
    border: {t['rest_border']};
    border-radius: {t['date_radius']};
    font-size: 22px;
    font-weight: bold;
    min-width: 60px;
    max-width: 60px;
    min-height: 50px;
    max-height: 50px;
}}

QPushButton#restDayButton:hover {{
    background-color: {t['rest_hover_bg']};
}}

/* 详情面板样式 */
QFrame#detailPanel {{
    background-color: {t['detail_bg']};
    border: {t['detail_border']};
    border-radius: {t['date_radius']};
    padding: 15px;
}}

QLabel#detailTitle {{
    color: {t['detail_title_color']};
    font-size: 18px;
    font-weight: bold;
}}

QLabel#detailLunar {{
    color: {t['detail_text_color']};
    font-size: 17px;
}}

QLabel#detailAlmanac {{
    color: {t['detail_sub_color']};
    font-size: 15px;
}}

QLabel#detailYi {{
    color: {t['yi_color']};
    font-size: 16px;
}}

QLabel#detailJi {{
    color: {t['ji_color']};
    font-size: 16px;
}}

QLabel#detailChongSha {{
    color: {t['detail_sub_color']};
    font-size: 15px;
}}

/* 关闭按钮样式 */
QPushButton#closeButton {{
    background-color: {t['close_bg']};
    color: {t['close_color']};
    border: {t['btn_border']};
    border-radius: {t['date_radius']};
    font-size: 16px;
    font-weight: bold;
    min-width: 24px;
    max-width: 24px;
    min-height: 24px;
    max-height: 24px;
    padding: 0px;
    text-align: center;
    line-height: 24px;
}}

QPushButton#closeButton:hover {{
    background-color: #e63946;
    color: #ffffff;
}}

/* 导航按钮样式 */
QPushButton#navButton {{
    background-color: transparent;
    color: {t['nav_color']};
    border: none;
    font-size: 18px;
    font-weight: bold;
    min-width: 32px;
    min-height: 32px;
}}

QPushButton#navButton:hover {{
    color: {t['title_color']};
}}

/* 农历标签样式 */
QLabel#lunarLabel {{
    color: {t['detail_text_color']};
    font-size: 16px;
    font-weight: bold;
}}

QLabel#lunarIndicator {{
    color: {t['detail_text_color']};
    font-size: 12px;
}}
"""


# ==================== 今日日期按钮（带渐变边框和发光效果）====================
class TodayButton(QPushButton):
    """
    今日日期按钮类
    实现渐变边框和发光效果，支持不同皮肤
    """

    def __init__(self, text, theme_key='glass', parent=None):
        super().__init__(text, parent)
        self.setMinimumSize(60, 50)
        self.setMaximumSize(60, 50)
        self.setFont(QFont('Microsoft YaHei', 22, QFont.Bold))
        self.setCursor(Qt.PointingHandCursor)
        self.theme_key = theme_key
        self.update_theme(theme_key)

    def update_theme(self, theme_key):
        """更新主题配置"""
        self.theme_key = theme_key
        theme = THEMES.get(theme_key, THEMES['glass'])
        self.border_color1 = QColor(theme['today_border_color1'])
        self.border_color2 = QColor(theme['today_border_color2'])
        self.bg_color = QColor(theme['today_bg'])
        self.text_color = QColor(theme['date_color'])
        self.border_radius = int(theme['date_radius'].replace('px', ''))
        self.update()

    def paintEvent(self, event):
        """自定义绘制，实现渐变边框"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)

        # 绘制背景
        painter.setBrush(QBrush(self.bg_color))
        painter.setPen(Qt.NoPen)
        painter.drawRoundedRect(2, 2, self.width() - 4, self.height() - 4,
                                self.border_radius, self.border_radius)

        # 绘制渐变边框 - 2px宽度
        gradient = QLinearGradient(0, 0, self.width(), self.height())
        gradient.setColorAt(0, self.border_color1)
        gradient.setColorAt(1, self.border_color2)

        pen = QPen(QBrush(gradient), 2)
        painter.setPen(pen)
        painter.setBrush(Qt.NoBrush)
        painter.drawRoundedRect(2, 2, self.width() - 4, self.height() - 4,
                                self.border_radius, self.border_radius)

        # 绘制文字
        painter.setPen(self.text_color)
        painter.setFont(self.font())
        painter.drawText(self.rect(), Qt.AlignCenter, self.text())

        painter.end()


# ==================== 主窗口类 ====================
class CalendarWindow(QWidget):
    """
    主日历窗口类
    支持多种皮肤主题的浮动日历
    """

    def __init__(self):
        super().__init__()
        # 当前显示的日期
        self.current_date = datetime.now()
        # 视图模式：'week' 或 'month'
        self.view_mode = 'week'
        # 选中的日期（用于显示详情）
        self.selected_date = None
        # 拖动相关变量
        self.drag_position = None
        # 存储日期按钮引用 {date: button}
        self.date_buttons = {}
        # 基础高度（不含详情面板）
        self.base_height = 230
        # 当前皮肤主题
        self.current_theme = 'industrial'
        # 皮肤列表及主色
        self.theme_keys = ['industrial', 'glass', 'fresh', 'minimal', 'vintage']
        self.theme_colors = {
            'industrial': '#00BFFF',  # 机械蓝
            'glass': '#00c3ff',       # 玻璃蓝
            'fresh': '#A7E9C1',       # 清新绿
            'minimal': '#333333',     # 极简黑
            'vintage': '#9E2B25',     # 复古红
        }
        self.theme_index = 0
        self.theme_dots = []  # 存储主题圆点按钮
        self.is_pinned = True  # 是否置顶
        self.weather_icon = '☀️'  # 当前天气图标
        self.weather_temp = '--'  # 当前温度
        self.weather_city = ''  # 当前城市名称

        self.init_ui()

    def init_ui(self):
        """初始化用户界面"""
        # 设置窗口属性：无边框、置顶、透明背景
        self.setWindowFlags(
            Qt.FramelessWindowHint |  # 无边框
            Qt.WindowStaysOnTopHint |  # 置顶
            Qt.Tool  # 不在任务栏显示
        )
        self.setAttribute(Qt.WA_TranslucentBackground)  # 透明背景
        self.setObjectName('mainWindow')

        # 设置窗口宽度
        self.setMinimumWidth(580)
        self.setMaximumWidth(580)

        # 应用样式表
        self.setStyleSheet(generate_stylesheet(self.current_theme))

        # 创建主布局
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)

        # 创建主容器（用于实现圆角背景）
        self.container = QFrame()
        self.container.setObjectName('mainWindow')
        self.container_layout = QVBoxLayout(self.container)
        self.container_layout.setContentsMargins(20, 15, 20, 35)
        self.container_layout.setSpacing(12)

        # 创建顶部工具栏（皮肤选择+关闭按钮）
        self.create_toolbar()

        # 创建标题栏（包含本周/本月按钮和日期标题）
        self.create_title_bar()

        # 创建星期标签行
        self.create_weekday_labels()

        # 创建日期网格容器（用于居中）
        self.date_grid_layout = QGridLayout()
        self.date_grid_layout.setSpacing(5)  # 默认周视图间距5px
        self.date_grid_layout.setAlignment(Qt.AlignCenter)
        self.container_layout.addLayout(self.date_grid_layout)

        # 创建底部农历显示
        self.create_lunar_bar()

        # 创建详情面板（默认隐藏）
        self.create_detail_panel()

        self.main_layout.addWidget(self.container)

        # 更新日历显示
        self.update_calendar()

        # 初始化农历显示为今天
        self.update_lunar_display(datetime.now().date())

        # 获取天气数据
        self.fetch_weather()

        # 天气更新定时器（每30分钟更新一次）
        self.weather_timer = QTimer(self)
        self.weather_timer.timeout.connect(self.fetch_weather)
        self.weather_timer.start(30 * 60 * 1000)  # 30分钟

    def fetch_weather(self):
        """获取天气数据"""
        WeatherFetcher.fetch_weather(self.on_weather_received)

    def on_weather_received(self, weather_type, icon, temp, city):
        """天气数据接收回调"""
        self.weather_icon = icon
        self.weather_temp = temp
        self.weather_city = city
        self.update_weather_label()

    def create_toolbar(self):
        """创建顶部工具栏（时间显示+天气+主题圆点+关闭按钮）"""
        # 创建工具栏容器
        self.toolbar_widget = QWidget()
        self.toolbar_widget.setFixedHeight(35)
        toolbar_layout = QHBoxLayout(self.toolbar_widget)
        toolbar_layout.setSpacing(8)
        toolbar_layout.setContentsMargins(0, 0, 0, 0)

        # 左侧时间显示（始终可见）
        self.time_label = QLabel()
        self.time_label.setObjectName('timeLabel')
        self.update_time()

        # 天气显示标签（始终可见，在时间旁边）
        self.weather_label = QLabel('☀️ --°')
        self.weather_label.setObjectName('weatherLabel')
        self.update_weather_label()

        # 右侧控件容器（主题圆点+关闭按钮，鼠标移入显示）
        self.right_controls = QWidget()
        right_layout = QHBoxLayout(self.right_controls)
        right_layout.setSpacing(6)
        right_layout.setContentsMargins(0, 0, 0, 0)

        # 创建5个主题圆点
        self.theme_dots = []
        for i, key in enumerate(self.theme_keys):
            dot = QPushButton()
            dot.setFixedSize(18, 18)
            dot.setCursor(Qt.PointingHandCursor)
            dot.setProperty('theme_key', key)
            dot.clicked.connect(lambda checked, k=key: self.on_theme_dot_clicked(k))
            self.theme_dots.append(dot)
            right_layout.addWidget(dot)

        # 更新圆点样式
        self.update_theme_dots()

        # 置顶按钮
        self.pin_btn = QPushButton('📌')
        self.pin_btn.setObjectName('pinButton')
        self.pin_btn.clicked.connect(self.toggle_pin)
        self.pin_btn.setCursor(Qt.PointingHandCursor)
        self.pin_btn.setToolTip('取消置顶')
        self.update_pin_button()

        # 关闭按钮
        self.close_btn = QPushButton('×')
        self.close_btn.setObjectName('closeButton')
        self.close_btn.clicked.connect(self.close)
        self.close_btn.setCursor(Qt.PointingHandCursor)

        right_layout.addWidget(self.pin_btn)
        right_layout.addWidget(self.close_btn)

        toolbar_layout.addWidget(self.time_label)
        toolbar_layout.addWidget(self.weather_label)
        toolbar_layout.addStretch()
        toolbar_layout.addWidget(self.right_controls)

        self.container_layout.addWidget(self.toolbar_widget)

        # 设置右侧控件透明度效果
        self.toolbar_opacity = QGraphicsOpacityEffect(self.right_controls)
        self.toolbar_opacity.setOpacity(0)
        self.right_controls.setGraphicsEffect(self.toolbar_opacity)

        # 创建淡入淡出动画
        self.toolbar_anim = QPropertyAnimation(self.toolbar_opacity, b"opacity")
        self.toolbar_anim.setDuration(200)
        self.toolbar_anim.setEasingCurve(QEasingCurve.InOutQuad)

        # 创建延迟隐藏定时器
        self.hide_delay_timer = QTimer(self)
        self.hide_delay_timer.setSingleShot(True)
        self.hide_delay_timer.timeout.connect(self.delayed_hide_toolbar)

        # 创建定时器更新时间
        self.time_timer = QTimer(self)
        self.time_timer.timeout.connect(self.update_time)
        self.time_timer.start(1000)

    def update_theme_dots(self):
        """更新主题圆点样式"""
        for i, dot in enumerate(self.theme_dots):
            key = self.theme_keys[i]
            color = self.theme_colors[key]
            is_selected = (key == self.current_theme)
            if is_selected:
                # 选中状态：白色边框
                dot.setStyleSheet(f"""
                    QPushButton {{
                        background-color: {color};
                        border: 2px solid #ffffff;
                        border-radius: 9px;
                    }}
                    QPushButton:hover {{
                        border: 2px solid #ffffff;
                    }}
                """)
            else:
                # 未选中状态
                dot.setStyleSheet(f"""
                    QPushButton {{
                        background-color: {color};
                        border: 2px solid transparent;
                        border-radius: 9px;
                    }}
                    QPushButton:hover {{
                        border: 2px solid rgba(255, 255, 255, 0.5);
                    }}
                """)

    def on_theme_dot_clicked(self, theme_key):
        """点击主题圆点切换主题"""
        if theme_key == self.current_theme:
            return
        self.current_theme = theme_key
        self.theme_index = self.theme_keys.index(theme_key)
        self.setStyleSheet(generate_stylesheet(theme_key))
        # 更新今日按钮主题
        today = datetime.now().date()
        if today in self.date_buttons:
            btn = self.date_buttons[today]
            if isinstance(btn, TodayButton):
                btn.update_theme(theme_key)
        # 更新圆点样式
        self.update_theme_dots()
        # 更新置顶按钮样式
        self.update_pin_button()
        # 更新天气标签样式
        self.update_weather_label()

    def toggle_pin(self):
        """切换置顶状态"""
        self.is_pinned = not self.is_pinned
        # 保存当前位置
        pos = self.pos()
        # 更新窗口标志
        if self.is_pinned:
            self.setWindowFlags(
                Qt.FramelessWindowHint |
                Qt.WindowStaysOnTopHint |
                Qt.Tool
            )
        else:
            self.setWindowFlags(
                Qt.FramelessWindowHint |
                Qt.Tool
            )
        # 恢复透明背景
        self.setAttribute(Qt.WA_TranslucentBackground)
        # 恢复位置并显示
        self.move(pos)
        self.show()
        # 更新按钮样式
        self.update_pin_button()

    def update_pin_button(self):
        """更新置顶按钮样式"""
        t = THEMES.get(self.current_theme, THEMES['glass'])
        if self.is_pinned:
            self.pin_btn.setText('📌')
            self.pin_btn.setToolTip('取消置顶')
            self.pin_btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {t['btn_active_bg']};
                    color: {t['btn_active_color']};
                    border: {t['btn_border']};
                    border-radius: {t['date_radius']};
                    font-size: 12px;
                    min-width: 24px;
                    max-width: 24px;
                    min-height: 24px;
                    max-height: 24px;
                    padding: 0px;
                }}
                QPushButton:hover {{
                    background-color: {t['btn_active_bg']};
                }}
            """)
        else:
            self.pin_btn.setText('📍')
            self.pin_btn.setToolTip('置顶')
            self.pin_btn.setStyleSheet(f"""
                QPushButton {{
                    background-color: {t['close_bg']};
                    color: {t['close_color']};
                    border: {t['btn_border']};
                    border-radius: {t['date_radius']};
                    font-size: 12px;
                    min-width: 24px;
                    max-width: 24px;
                    min-height: 24px;
                    max-height: 24px;
                    padding: 0px;
                }}
                QPushButton:hover {{
                    background-color: {t['date_hover_bg']};
                }}
            """)

    def update_weather_label(self):
        """更新天气标签显示"""
        t = THEMES.get(self.current_theme, THEMES['glass'])
        # 显示格式：图标 城市 温度
        city_str = f' {self.weather_city}' if self.weather_city else ''
        self.weather_label.setText(f'{self.weather_icon}{city_str} {self.weather_temp}°')
        self.weather_label.setStyleSheet(f"""
            QLabel {{
                color: {t['title_color']};
                font-size: 14px;
                padding-left: 8px;
            }}
        """)

    def update_time(self):
        """更新时间显示"""
        current_time = datetime.now().strftime('%H:%M')
        self.time_label.setText(current_time)

    def delayed_hide_toolbar(self):
        """延迟隐藏工具栏（检查鼠标是否仍在窗口外）"""
        # 检查鼠标是否在窗口内
        if not self.underMouse():
            self.toolbar_anim.stop()
            self.toolbar_anim.setStartValue(self.toolbar_opacity.opacity())
            self.toolbar_anim.setEndValue(0.0)
            self.toolbar_anim.start()

    def create_title_bar(self):
        """创建标题栏"""
        title_layout = QHBoxLayout()

        # 本周/本月按钮
        self.week_btn = QPushButton('本周')
        self.week_btn.setObjectName('viewButton')
        self.week_btn.setCheckable(True)
        self.week_btn.setChecked(True)
        self.week_btn.clicked.connect(lambda: self.switch_view('week'))
        self.week_btn.setCursor(Qt.PointingHandCursor)

        self.month_btn = QPushButton('本月')
        self.month_btn.setObjectName('viewButton')
        self.month_btn.setCheckable(True)
        self.month_btn.clicked.connect(lambda: self.switch_view('month'))
        self.month_btn.setCursor(Qt.PointingHandCursor)

        # 上一月按钮
        self.prev_btn = QPushButton('<')
        self.prev_btn.setObjectName('navButton')
        self.prev_btn.clicked.connect(self.go_previous)
        self.prev_btn.setCursor(Qt.PointingHandCursor)

        # 年月标签（渐变色）
        self.title_label = QLabel()
        self.title_label.setObjectName('titleLabel')
        self.update_title()

        # 下一月按钮
        self.next_btn = QPushButton('>')
        self.next_btn.setObjectName('navButton')
        self.next_btn.clicked.connect(self.go_next)
        self.next_btn.setCursor(Qt.PointingHandCursor)

        title_layout.addWidget(self.week_btn)
        title_layout.addWidget(self.month_btn)
        title_layout.addStretch()
        title_layout.addWidget(self.prev_btn)
        title_layout.addWidget(self.title_label)
        title_layout.addWidget(self.next_btn)

        self.container_layout.addLayout(title_layout)

    def create_weekday_labels(self):
        """创建星期标签行"""
        weekday_layout = QHBoxLayout()
        weekday_layout.setSpacing(12)

        weekdays = ['一', '二', '三', '四', '五', '六', '日']
        for day in weekdays:
            label = QLabel(day)
            label.setObjectName('weekdayLabel')
            label.setAlignment(Qt.AlignCenter)
            label.setFixedWidth(60)
            weekday_layout.addWidget(label)

        self.container_layout.addLayout(weekday_layout)

    def create_lunar_bar(self):
        """创建底部农历显示栏"""
        lunar_layout = QHBoxLayout()
        lunar_layout.setContentsMargins(0, 10, 0, 0)

        # 三角形指示符
        self.lunar_indicator = QLabel('▶')
        self.lunar_indicator.setStyleSheet("color: #ffffff; font-size: 12px;")

        # 农历日期标签
        self.lunar_label = QLabel()
        self.lunar_label.setStyleSheet("color: #ffffff; font-size: 16px; font-weight: bold;")

        lunar_layout.addWidget(self.lunar_indicator)
        lunar_layout.addWidget(self.lunar_label)
        lunar_layout.addStretch()

        self.container_layout.addLayout(lunar_layout)

    def update_lunar_display(self, day_date):
        """更新农历显示"""
        try:
            # 获取农历信息
            if USE_LUNARDATE:
                ld = LunarDate.fromSolarDate(day_date.year, day_date.month, day_date.day)
                lunar_month = ld.month
                lunar_day = ld.day
                is_leap = ld.isLeapMonth
            else:
                lunar_year, lunar_month, lunar_day, is_leap = LunarCalendar.solar_to_lunar(
                    day_date.year, day_date.month, day_date.day)

            # 确保索引在有效范围内
            lunar_month = max(1, min(12, lunar_month))
            lunar_day = max(1, min(30, lunar_day))

            # 农历月份
            month_str = ('闰' if is_leap else '') + LunarCalendar.LUNAR_MONTH[lunar_month - 1] + '月'
            # 农历日期
            day_str = LunarCalendar.LUNAR_DAY[lunar_day - 1]

            # 获取节气（简化版，只显示部分重要节气）
            jieqi = self.get_jieqi(day_date)
            jieqi_str = f"  {jieqi}" if jieqi else ""

            # 更新标签
            self.lunar_label.setText(f"{day_date.year}年{day_date.month}月{day_date.day}日  农历{month_str}{day_str}{jieqi_str}")
        except Exception:
            # 如果农历计算出错，只显示公历
            self.lunar_label.setText(f"{day_date.year}年{day_date.month}月{day_date.day}日")

    def get_jieqi(self, day_date):
        """获取节气（简化版）"""
        # 2026年主要节气日期
        jieqi_2026 = {
            (1, 5): '小寒', (1, 20): '大寒',
            (2, 4): '立春', (2, 18): '雨水',
            (3, 5): '惊蛰', (3, 20): '春分',
            (4, 4): '清明', (4, 20): '谷雨',
            (5, 5): '立夏', (5, 21): '小满',
            (6, 5): '芒种', (6, 21): '夏至',
            (7, 7): '小暑', (7, 22): '大暑',
            (8, 7): '立秋', (8, 23): '处暑',
            (9, 7): '白露', (9, 23): '秋分',
            (10, 8): '寒露', (10, 23): '霜降',
            (11, 7): '立冬', (11, 22): '小雪',
            (12, 7): '大雪', (12, 21): '冬至',
        }
        return jieqi_2026.get((day_date.month, day_date.day), '')

    def create_detail_panel(self):
        """创建详情面板（默认隐藏）"""
        self.detail_panel = QFrame()
        self.detail_panel.setObjectName('detailPanel')
        self.detail_panel.setVisible(False)

        detail_layout = QVBoxLayout(self.detail_panel)
        detail_layout.setSpacing(10)
        detail_layout.setContentsMargins(15, 15, 15, 15)

        # 农历日期（公历+农历+星期）
        self.detail_lunar = QLabel()
        self.detail_lunar.setObjectName('detailLunar')

        # 黄道吉日标题
        self.detail_title = QLabel()
        self.detail_title.setObjectName('detailTitle')

        # 宜
        self.detail_yi = QLabel()
        self.detail_yi.setObjectName('detailYi')
        self.detail_yi.setWordWrap(True)

        # 忌
        self.detail_ji = QLabel()
        self.detail_ji.setObjectName('detailJi')
        self.detail_ji.setWordWrap(True)

        # 冲煞+喜神+财神（一行显示）
        self.detail_chongsha = QLabel()
        self.detail_chongsha.setObjectName('detailChongSha')
        self.detail_chongsha.setWordWrap(True)

        detail_layout.addWidget(self.detail_lunar)
        detail_layout.addWidget(self.detail_title)
        detail_layout.addWidget(self.detail_yi)
        detail_layout.addWidget(self.detail_ji)
        detail_layout.addWidget(self.detail_chongsha)

        self.container_layout.addWidget(self.detail_panel)

    def update_title(self):
        """更新标题显示"""
        year = self.current_date.year
        month = self.current_date.month
        # 计算第几周
        week_num = self.current_date.isocalendar()[1]
        self.title_label.setText(f'{year}年{month}月 第{week_num}周')

    def switch_view(self, mode):
        """切换视图模式"""
        self.view_mode = mode
        # 更新按钮状态
        self.week_btn.setChecked(mode == 'week')
        self.month_btn.setChecked(mode == 'month')
        # 更新标题和日历
        self.update_title()
        self.update_calendar()

    def go_previous(self):
        """切换到上一周/月"""
        if self.view_mode == 'week':
            self.current_date -= timedelta(days=7)
        else:
            # 上一个月
            if self.current_date.month == 1:
                self.current_date = self.current_date.replace(
                    year=self.current_date.year - 1, month=12, day=1)
            else:
                self.current_date = self.current_date.replace(
                    month=self.current_date.month - 1, day=1)
        self.update_title()
        self.update_calendar()

    def go_next(self):
        """切换到下一周/月"""
        if self.view_mode == 'week':
            self.current_date += timedelta(days=7)
        else:
            # 下一个月
            if self.current_date.month == 12:
                self.current_date = self.current_date.replace(
                    year=self.current_date.year + 1, month=1, day=1)
            else:
                self.current_date = self.current_date.replace(
                    month=self.current_date.month + 1, day=1)
        self.update_title()
        self.update_calendar()

    def update_calendar(self):
        """更新日历显示"""
        # 隐藏详情面板
        self.detail_panel.hide()
        self.selected_date = None

        # 先断开所有按钮的信号连接，避免在删除时触发事件
        for btn in list(self.date_buttons.values()):
            try:
                btn.clicked.disconnect()
            except Exception:
                pass

        # 清除现有日期按钮 - 使用同步删除
        while self.date_grid_layout.count():
            item = self.date_grid_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.setParent(None)
                widget.hide()
                del widget

        # 清空按钮引用
        self.date_buttons = {}
        today = datetime.now().date()

        if self.view_mode == 'week':
            # 周视图间距12px
            self.date_grid_layout.setSpacing(12)
            # 本周视图：显示当前周的7天（周一为第一天）
            current = self.current_date.date()
            # 计算本周一的日期
            days_since_monday = current.weekday()
            monday = current - timedelta(days=days_since_monday)

            for i in range(7):
                day_date = monday + timedelta(days=i)
                self.add_date_button(day_date, today, 0, i)

            # 周视图基础高度（含工具栏）
            self.base_height = 300

        else:
            # 月视图间距12px
            self.date_grid_layout.setSpacing(12)
            # 本月视图：显示整月
            year = self.current_date.year
            month = self.current_date.month

            # 获取本月第一天是星期几（周一=0）
            first_day = date(year, month, 1)
            first_weekday = first_day.weekday()

            # 获取本月天数
            _, days_in_month = calendar.monthrange(year, month)

            row = 0
            col = first_weekday

            for day in range(1, days_in_month + 1):
                day_date = date(year, month, day)
                self.add_date_button(day_date, today, row, col)

                col += 1
                if col > 6:
                    col = 0
                    row += 1

            # 月视图根据行数计算高度（含工具栏）
            num_rows = row + 1 if col > 0 else row
            # 工具栏35 + 标题栏50 + 星期栏30 + 日期行(62*行数) + 农历栏50 + 边距40
            self.base_height = 240 + num_rows * 62

        # 强制更新布局
        self.date_grid_layout.update()
        self.container_layout.update()

        # 设置高度
        self.setFixedHeight(self.base_height)

        # 更新农历显示为今天
        self.update_lunar_display(today)

    def add_date_button(self, day_date, today, row, col):
        """添加日期按钮"""
        day_num = day_date.day
        is_today = day_date == today
        is_rest_day = (day_date.year, day_date.month, day_date.day) in REST_DAYS_2026
        is_selected = self.selected_date == day_date

        # 获取当前主题配置
        theme = THEMES.get(self.current_theme, THEMES['glass'])

        if is_today:
            # 今日使用特殊的渐变边框按钮，传入当前主题
            btn = TodayButton(str(day_num), self.current_theme)
        else:
            btn = QPushButton(str(day_num))
            if is_selected:
                btn.setObjectName('selectedButton')
            elif is_rest_day:
                btn.setObjectName('restDayButton')
            else:
                btn.setObjectName('dateButton')

        btn.setCursor(Qt.PointingHandCursor)

        # 绑定点击事件
        btn.clicked.connect(lambda checked, d=day_date: self.show_date_detail(d))

        # 存储按钮引用
        self.date_buttons[day_date] = btn

        self.date_grid_layout.addWidget(btn, row, col)

    def show_date_detail(self, day_date):
        """显示日期详情"""
        # 如果点击的是同一个日期，直接返回
        if self.selected_date == day_date:
            return

        # 暂时阻止按钮信号，避免重复触发
        for btn in self.date_buttons.values():
            btn.blockSignals(True)

        try:
            # 更新选中状态
            old_selected = self.selected_date
            self.selected_date = day_date

            # 更新旧选中按钮的样式（只更新必要的属性）
            if old_selected and old_selected in self.date_buttons:
                old_btn = self.date_buttons[old_selected]
                if not isinstance(old_btn, TodayButton):
                    is_rest = (old_selected.year, old_selected.month, old_selected.day) in REST_DAYS_2026
                    if is_rest:
                        old_btn.setObjectName('restDayButton')
                    else:
                        old_btn.setObjectName('dateButton')
                    # 清除内联样式，让样式表生效
                    old_btn.setStyleSheet("")

            # 更新新选中按钮的样式
            if day_date in self.date_buttons:
                new_btn = self.date_buttons[day_date]
                if not isinstance(new_btn, TodayButton):
                    new_btn.setObjectName('selectedButton')
                    # 清除内联样式，让样式表生效
                    new_btn.setStyleSheet("")

            # 更新农历显示
            self.update_lunar_display(day_date)

            # 获取农历信息
            try:
                lunar_str = LunarCalendar.get_lunar_date_str(
                    day_date.year, day_date.month, day_date.day)
            except Exception:
                lunar_str = ""

            # 获取黄历信息
            almanac_info = Almanac.get_day_info(
                day_date.year, day_date.month, day_date.day)

            # 星期几
            weekday_names = ['一', '二', '三', '四', '五', '六', '日']
            weekday_str = f'星期{weekday_names[day_date.weekday()]}'

            # 更新详情面板
            self.detail_lunar.setText(
                f'{day_date.year}年{day_date.month}月{day_date.day}日 农历{lunar_str} {weekday_str}')
            self.detail_title.setText('【黄道吉日·金匮】')
            self.detail_yi.setText(f'宜：{" ".join(almanac_info["yi"])}')
            self.detail_ji.setText(f'忌：{" ".join(almanac_info["ji"])}')
            self.detail_chongsha.setText(
                f'{almanac_info["chong"]} {almanac_info["sha"]} | {almanac_info["xi_shen"]} | {almanac_info["cai_shen"]}')

            # 显示详情面板
            if not self.detail_panel.isVisible():
                self.detail_panel.setVisible(True)
                new_height = self.base_height + 150
                self.setFixedHeight(new_height)
        except Exception as e:
            print(f"Error in show_date_detail: {e}")
        finally:
            # 恢复按钮信号
            for btn in self.date_buttons.values():
                btn.blockSignals(False)

    # ==================== 窗口拖动功能 ====================
    def mousePressEvent(self, event):
        """鼠标按下事件，记录拖动起始位置"""
        if event.button() == Qt.LeftButton:
            self.drag_position = event.globalPos() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        """鼠标移动事件，实现窗口拖动"""
        if event.buttons() == Qt.LeftButton and self.drag_position:
            self.move(event.globalPos() - self.drag_position)
            event.accept()

    def mouseReleaseEvent(self, event):
        """鼠标释放事件"""
        self.drag_position = None

    def enterEvent(self, event):
        """鼠标进入窗口，淡入显示工具栏"""
        # 取消延迟隐藏
        self.hide_delay_timer.stop()
        self.toolbar_anim.stop()
        self.toolbar_anim.setStartValue(self.toolbar_opacity.opacity())
        self.toolbar_anim.setEndValue(1.0)
        self.toolbar_anim.start()
        super().enterEvent(event)

    def leaveEvent(self, event):
        """鼠标离开窗口，淡出隐藏工具栏"""
        self.hide_delay_timer.start(150)
        super().leaveEvent(event)


# ==================== 程序入口 ====================
def main():
    """程序主入口"""
    # 创建应用程序实例
    app = QApplication(sys.argv)

    # 设置应用程序图标
    icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'calendar.ico')
    if os.path.exists(icon_path):
        app.setWindowIcon(QIcon(icon_path))

    # 设置应用程序字体
    font = QFont('Microsoft YaHei', 10)
    app.setFont(font)

    # 创建并显示主窗口
    window = CalendarWindow()
    # 将窗口移动到屏幕中央
    screen = app.primaryScreen().geometry()
    x = (screen.width() - window.width()) // 2
    y = (screen.height() - window.height()) // 2
    window.move(x, y)
    window.show()

    # 运行应用程序
    sys.exit(app.exec_())


if __name__ == '__main__':
    main()
