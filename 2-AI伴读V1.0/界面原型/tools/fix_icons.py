#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复图标问题 - 移除错误的Iconfont链接
"""

import os
import re
from pathlib import Path

def remove_iconfont_link(html_content):
    """移除HTML中的Iconfont链接"""
    # 移除Iconfont CDN链接
    pattern = r'\s*<link rel="stylesheet" href="//at\.alicdn\.com/t/c/font_\w+\.css">\s*\n'
    html_content = re.sub(pattern, '', html_content)
    return html_content

def restore_icons(html_content):
    """将Iconfont图标恢复为Emoji"""
    # 图标映射表（反向）
    icon_to_emoji = {
        'icon-home': '🏠',
        'icon-book': '📚',
        'icon-user': '👤',
        'icon-check-circle': '✅',
        'icon-edit': '📝',
        'icon-shopping-cart': '🛒',
        'icon-message': '💬',
        'icon-trophy': '🏆',
        'icon-bar-chart': '📊',
        'icon-line-chart': '📈',
        'icon-bell': '🔔',
        'icon-setting': '⚙️',
        'icon-search': '🔍',
        'icon-sound': '📢',
        'icon-star': '⭐',
        'icon-play-circle': '🎬',
        'icon-folder': '📁',
        'icon-upload': '📤',
        'icon-download': '📥',
        'icon-link': '🔗',
        'icon-file-text': '📋',
        'icon-printer': '🖨️',
        'icon-team': '👥',
        'icon-bank': '🎓',
        'icon-smile': '🎉',
        'icon-bulb': '💡',
        'icon-warning': '⚠️',
        'icon-close-circle': '❌',
        'icon-lock': '🔒',
        'icon-unlock': '🔓',
        'icon-read': '📖',
        'icon-file': '📄',
        'icon-aim': '🎯',
        'icon-dollar': '💰',
        'icon-gift': '🎁',
        'icon-calendar': '📅',
        'icon-clock-circle': '⏰',
        'icon-hourglass': '⏳',
        'icon-left': '🔙',
        'icon-right': '➡️',
        'icon-up': '⬆️',
        'icon-down': '⬇️',
        'icon-plus': '➕',
        'icon-minus': '➖',
        'icon-reload': '🔄',
        'icon-heart': '❤️',
        'icon-like': '👍',
        'icon-mail': '📧',
        'icon-global': '🌐',
        'icon-robot': '🤖',
        'icon-desktop': '🖥️',
        'icon-mobile': '📱',
    }

    for icon_class, emoji in icon_to_emoji.items():
        # 匹配 <i class="iconfont icon-xxx"></i> 并替换为 emoji
        pattern = rf'<i class="iconfont {icon_class}"></i>'
        html_content = html_content.replace(pattern, emoji)

    return html_content

def fix_html_file(file_path):
    """修复单个HTML文件"""
    try:
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 移除Iconfont链接
        content = remove_iconfont_link(content)

        # 恢复图标为Emoji
        content = restore_icons(content)

        # 如果有修改，写回文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False

    except Exception as e:
        print(f"[ERROR] 处理文件失败 {file_path}: {str(e)}")
        return False

def fix_directory(directory):
    """修复目录下的所有HTML文件"""
    directory = Path(directory)
    html_files = list(directory.rglob('*.html'))

    print(f"找到 {len(html_files)} 个HTML文件")
    print("=" * 60)

    fixed_count = 0

    for html_file in html_files:
        if fix_html_file(html_file):
            fixed_count += 1
            relative_path = html_file.relative_to(directory)
            print(f"[OK] {relative_path}")

    print("=" * 60)
    print(f"\n修复完成！共修复 {fixed_count} 个文件")

def main():
    """主函数"""
    print("开始修复图标问题...")
    print("=" * 60)

    # 获取当前脚本所在目录
    script_dir = Path(__file__).parent

    # 处理三个子目录
    directories = ['学生端', '教师端', '管理平台']

    for dir_name in directories:
        dir_path = script_dir / dir_name
        if dir_path.exists():
            print(f"\n处理 {dir_name}...")
            fix_directory(dir_path)
        else:
            print(f"[WARNING] 目录不存在: {dir_path}")

if __name__ == '__main__':
    main()
