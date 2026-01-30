#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
校校读吧小管家 - 图标批量替换脚本
将HTML文件中的Emoji图标替换为Iconfont图标
"""

import os
import re
from pathlib import Path

# Emoji到Iconfont的映射表
ICON_MAPPING = {
    # 导航和Tab栏图标
    '🏠': 'icon-home',
    '📚': 'icon-book',
    '👤': 'icon-user',
    '✅': 'icon-check-circle',
    '📝': 'icon-edit',
    '🛒': 'icon-shopping-cart',
    '💬': 'icon-message',

    # 功能图标
    '🏆': 'icon-trophy',
    '📊': 'icon-bar-chart',
    '📈': 'icon-line-chart',
    '🔔': 'icon-bell',
    '⚙️': 'icon-setting',
    '🔍': 'icon-search',
    '📢': 'icon-sound',
    '⭐': 'icon-star',
    '🎬': 'icon-play-circle',
    '📁': 'icon-folder',
    '📤': 'icon-upload',
    '📥': 'icon-download',
    '🔗': 'icon-link',
    '📋': 'icon-file-text',
    '🖨️': 'icon-printer',

    # 用户和角色图标
    '👨‍🏫': 'icon-team',
    '👨‍🎓': 'icon-user',
    '👥': 'icon-team',
    '🎓': 'icon-bank',

    # 状态和反馈图标
    '🎉': 'icon-smile',
    '✨': 'icon-star',
    '💡': 'icon-bulb',
    '⚠️': 'icon-warning',
    '❌': 'icon-close-circle',
    '🔒': 'icon-lock',
    '🔓': 'icon-unlock',

    # 内容图标
    '📖': 'icon-read',
    '📄': 'icon-file',
    '🎯': 'icon-aim',
    '🏅': 'icon-trophy',
    '🎖️': 'icon-trophy',
    '💰': 'icon-dollar',
    '🎁': 'icon-gift',

    # 时间和日期
    '📅': 'icon-calendar',
    '⏰': 'icon-clock-circle',
    '⏳': 'icon-hourglass',

    # 其他常用图标
    '🔙': 'icon-left',
    '➡️': 'icon-right',
    '⬆️': 'icon-up',
    '⬇️': 'icon-down',
    '➕': 'icon-plus',
    '➖': 'icon-minus',
    '🔄': 'icon-reload',
    '❤️': 'icon-heart',
    '👍': 'icon-like',
    '💬': 'icon-message',
    '📧': 'icon-mail',
    '🌐': 'icon-global',
    '🏫': 'icon-bank',
    '🤖': 'icon-robot',
    '📺': 'icon-desktop',
    '📱': 'icon-mobile',
    '🖥️': 'icon-desktop',
}

# Iconfont CDN链接
ICONFONT_CDN = '//at.alicdn.com/t/c/font_8d5l8fzk5b87iudi.css'

def add_iconfont_link(html_content):
    """在HTML的head标签中添加Iconfont CSS链接"""
    # 检查是否已经包含Iconfont链接
    if 'at.alicdn.com' in html_content or 'iconfont' in html_content:
        return html_content

    # 在</head>之前插入Iconfont链接
    iconfont_link = f'    <link rel="stylesheet" href="{ICONFONT_CDN}">\n'
    html_content = html_content.replace('</head>', f'{iconfont_link}</head>')

    return html_content

def replace_emoji_to_icon(html_content):
    """替换HTML中的Emoji为Iconfont图标"""
    replacements = 0

    for emoji, icon_class in ICON_MAPPING.items():
        # 匹配各种Emoji使用场景
        patterns = [
            # 场景1: 直接在标签中的Emoji
            (rf'>{emoji}<', f'><i class="iconfont {icon_class}"></i><'),

            # 场景2: 在div/span中的Emoji（保留样式）
            (rf'<(div|span)([^>]*)>{emoji}</(div|span)>',
             rf'<\1\2><i class="iconfont {icon_class}"></i></\1>'),

            # 场景3: Emoji后面跟文字
            (rf'>{emoji}\s+', f'><i class="iconfont {icon_class}"></i> '),

            # 场景4: Emoji在文字前面
            (rf'\s+{emoji}<', f' <i class="iconfont {icon_class}"></i><'),
        ]

        for pattern, replacement in patterns:
            new_content = re.sub(pattern, replacement, html_content)
            if new_content != html_content:
                replacements += len(re.findall(pattern, html_content))
                html_content = new_content

    return html_content, replacements

def process_html_file(file_path):
    """处理单个HTML文件"""
    try:
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 添加Iconfont链接
        content = add_iconfont_link(content)

        # 替换Emoji为图标
        content, replacements = replace_emoji_to_icon(content)

        # 如果有修改，写回文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, replacements

        return False, 0

    except Exception as e:
        print(f"[ERROR] 处理文件失败 {file_path}: {str(e)}")
        return False, 0

def process_directory(directory):
    """处理目录下的所有HTML文件"""
    directory = Path(directory)
    html_files = list(directory.rglob('*.html'))

    print(f"找到 {len(html_files)} 个HTML文件")
    print("=" * 60)

    total_files = 0
    total_replacements = 0

    for html_file in html_files:
        modified, replacements = process_html_file(html_file)
        if modified:
            total_files += 1
            total_replacements += replacements
            relative_path = html_file.relative_to(directory)
            print(f"[OK] {relative_path} - 替换了 {replacements} 个图标")

    print("=" * 60)
    print(f"\n替换统计:")
    print(f"   - 处理文件数: {total_files}")
    print(f"   - 替换图标数: {total_replacements}")
    print(f"\n图标替换完成！")

def main():
    """主函数"""
    print("开始替换图标...")
    print("=" * 60)

    # 获取当前脚本所在目录
    script_dir = Path(__file__).parent

    # 处理三个子目录
    directories = ['学生端', '教师端', '管理平台']

    for dir_name in directories:
        dir_path = script_dir / dir_name
        if dir_path.exists():
            print(f"\n处理 {dir_name}...")
            process_directory(dir_path)
        else:
            print(f"[WARNING] 目录不存在: {dir_path}")

if __name__ == '__main__':
    main()
