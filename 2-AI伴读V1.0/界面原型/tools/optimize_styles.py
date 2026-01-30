#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量优化HTML页面样式
根据统一设计规范优化所有页面的CSS样式
"""

import os
import re
from pathlib import Path

# 统一的CSS规则映射
CSS_OPTIMIZATIONS = {
    # 字体和行高
    r'font-family:\s*-apple-system[^;]*;': 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',

    # 标题字体大小和行高
    r'\.navbar-title\s*\{([^}]*)\}': lambda m: optimize_navbar_title(m.group(1)),
    r'\.section-title\s*\{([^}]*)\}': lambda m: optimize_section_title(m.group(1)),

    # 按钮高度和内边距
    r'height:\s*32px;': 'height: 36px;',  # 小按钮
    r'height:\s*40px;': 'height: 44px;',  # 标准按钮

    # 卡片阴影
    r'box-shadow:\s*0\s+2px\s+8px\s+rgba\(0,\s*0,\s*0,\s*0\.06\);': 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);',

    # 圆角
    r'border-radius:\s*4px;': 'border-radius: 4px;',
    r'border-radius:\s*8px;': 'border-radius: 8px;',

    # 间距
    r'margin-bottom:\s*16px;': 'margin-bottom: 12px;',  # 卡片间距统一为12px

    # 过渡效果
    r'transition:\s*all\s+0\.2s;': 'transition: all 0.3s;',
}

def optimize_navbar_title(content):
    """优化导航栏标题样式"""
    if 'line-height' not in content:
        content = content.rstrip() + '\n            line-height: 1.4;'
    return f'.navbar-title {{{content}\n        }}'

def optimize_section_title(content):
    """优化区块标题样式"""
    rules = {}
    for line in content.split(';'):
        if ':' in line:
            key, value = line.split(':', 1)
            rules[key.strip()] = value.strip()

    # 确保有正确的字体大小和行高
    if 'font-size' not in rules or rules.get('font-size') == '14px':
        rules['font-size'] = '16px'
    if 'line-height' not in rules:
        rules['line-height'] = '1.4'
    if 'font-weight' not in rules:
        rules['font-weight'] = '600'

    result = '.section-title {\n'
    for key, value in rules.items():
        result += f'            {key}: {value};\n'
    result += '        }'
    return result

def add_line_heights(css_content):
    """为缺少line-height的样式添加行高"""
    # 为文字元素添加行高
    patterns = [
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*24px;[^}]*)(})', r'\1\n            line-height: 1.2;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*20px;[^}]*)(})', r'\1\n            line-height: 1.2;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*18px;[^}]*)(})', r'\1\n            line-height: 1.4;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*16px;[^}]*)(})', r'\1\n            line-height: 1.4;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*14px;[^}]*)(})', r'\1\n            line-height: 1.6;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*13px;[^}]*)(})', r'\1\n            line-height: 1.5;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*12px;[^}]*)(})', r'\1\n            line-height: 1.5;\2'),
        (r'(\.[\w-]+\s*\{[^}]*font-size:\s*10px;[^}]*)(})', r'\1\n            line-height: 1.4;\2'),
    ]

    for pattern, replacement in patterns:
        # 只添加到还没有line-height的规则中
        css_content = re.sub(pattern, lambda m: m.group(0) if 'line-height' in m.group(0) else re.sub(pattern, replacement, m.group(0)), css_content)

    return css_content

def optimize_html_file(file_path):
    """优化单个HTML文件"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 提取style标签内容
        style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
        if not style_match:
            print(f"  ⚠️  未找到style标签: {file_path.name}")
            return False

        css_content = style_match.group(1)

        # 应用CSS优化规则
        for pattern, replacement in CSS_OPTIMIZATIONS.items():
            if callable(replacement):
                css_content = re.sub(pattern, replacement, css_content, flags=re.DOTALL)
            else:
                css_content = re.sub(pattern, replacement, css_content)

        # 添加缺失的行高
        css_content = add_line_heights(css_content)

        # 替换回原内容
        content = content.replace(style_match.group(1), css_content)

        # 只有内容改变时才写入
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"  ❌ 处理失败: {file_path.name} - {str(e)}")
        return False

def main():
    """主函数"""
    base_dir = Path(__file__).parent
    student_dir = base_dir / "学生端"
    teacher_dir = base_dir / "教师端"

    print("=" * 60)
    print("开始批量优化HTML页面样式")
    print("=" * 60)

    total_files = 0
    optimized_files = 0

    # 处理学生端页面
    if student_dir.exists():
        print(f"\n📱 处理学生端页面...")
        student_files = sorted(student_dir.glob("*.html"))
        for file_path in student_files:
            total_files += 1
            print(f"  处理: {file_path.name}")
            if optimize_html_file(file_path):
                optimized_files += 1
                print(f"    ✅ 已优化")
            else:
                print(f"    ⏭️  无需更改")

    # 处理教师端页面
    if teacher_dir.exists():
        print(f"\n👨‍🏫 处理教师端页面...")
        teacher_files = sorted(teacher_dir.glob("*.html"))
        for file_path in teacher_files:
            total_files += 1
            print(f"  处理: {file_path.name}")
            if optimize_html_file(file_path):
                optimized_files += 1
                print(f"    ✅ 已优化")
            else:
                print(f"    ⏭️  无需更改")

    print("\n" + "=" * 60)
    print(f"✨ 优化完成!")
    print(f"   总文件数: {total_files}")
    print(f"   已优化: {optimized_files}")
    print(f"   未更改: {total_files - optimized_files}")
    print("=" * 60)

if __name__ == "__main__":
    main()
