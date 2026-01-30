#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import re
import sys
from pathlib import Path

def optimize_css(css_content):
    """Apply CSS optimizations"""

    # Add line-height to font-size rules that don't have it
    patterns = [
        # Font sizes with corresponding line-heights
        (r'(font-size:\s*24px;)(?![^}]*line-height)', r'\1\n            line-height: 1.2;'),
        (r'(font-size:\s*20px;)(?![^}]*line-height)', r'\1\n            line-height: 1.2;'),
        (r'(font-size:\s*18px;)(?![^}]*line-height)', r'\1\n            line-height: 1.4;'),
        (r'(font-size:\s*16px;)(?![^}]*line-height)', r'\1\n            line-height: 1.4;'),
        (r'(font-size:\s*15px;)(?![^}]*line-height)', r'\1\n            line-height: 1.6;'),
        (r'(font-size:\s*14px;)(?![^}]*line-height)', r'\1\n            line-height: 1.6;'),
        (r'(font-size:\s*13px;)(?![^}]*line-height)', r'\1\n            line-height: 1.5;'),
        (r'(font-size:\s*12px;)(?![^}]*line-height)', r'\1\n            line-height: 1.5;'),
        (r'(font-size:\s*11px;)(?![^}]*line-height)', r'\1\n            line-height: 1.4;'),
        (r'(font-size:\s*10px;)(?![^}]*line-height)', r'\1\n            line-height: 1.4;'),
    ]

    for pattern, replacement in patterns:
        css_content = re.sub(pattern, replacement, css_content)

    # Fix font-family
    css_content = re.sub(
        r'font-family:\s*-apple-system[^;]*;',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
        css_content
    )

    # Fix button heights
    css_content = re.sub(r'height:\s*32px;', 'height: 36px;', css_content)
    css_content = re.sub(r'height:\s*40px;', 'height: 44px;', css_content)

    # Fix transitions
    css_content = re.sub(r'transition:\s*all\s+0\.2s;', 'transition: all 0.3s;', css_content)
    css_content = re.sub(r'transition:\s*transform\s+0\.2s;', 'transition: transform 0.3s;', css_content)
    css_content = re.sub(r'transition:\s*background\s+0\.2s;', 'transition: all 0.3s;', css_content)

    # Fix font-weight for stat values
    css_content = re.sub(
        r'(\.stat-value\s*\{[^}]*font-weight:\s*)600',
        r'\1700',
        css_content
    )

    # Fix card margins
    css_content = re.sub(r'margin:\s*16px;', 'margin: 0 16px 12px;', css_content)
    css_content = re.sub(r'margin:\s*0\s+16px\s+16px;', 'margin: 0 16px 12px;', css_content)

    return css_content

def process_file(file_path):
    """Process a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract style section
        style_match = re.search(r'(<style>)(.*?)(</style>)', content, re.DOTALL)
        if not style_match:
            return False, "No style tag found"

        original_css = style_match.group(2)
        optimized_css = optimize_css(original_css)

        if original_css != optimized_css:
            new_content = content.replace(original_css, optimized_css)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True, "Optimized"

        return False, "No changes needed"

    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    base_dir = Path(__file__).parent

    print("=" * 60)
    print("Batch CSS Optimization")
    print("=" * 60)

    total = 0
    optimized = 0

    # Process student pages
    student_dir = base_dir / "学生端"
    if student_dir.exists():
        print("\nProcessing student pages...")
        for html_file in sorted(student_dir.glob("*.html")):
            total += 1
            success, msg = process_file(html_file)
            status = "[OK]" if success else "[SKIP]"
            print(f"  {status} {html_file.name}: {msg}")
            if success:
                optimized += 1

    # Process teacher pages
    teacher_dir = base_dir / "教师端"
    if teacher_dir.exists():
        print("\nProcessing teacher pages...")
        for html_file in sorted(teacher_dir.glob("*.html")):
            total += 1
            success, msg = process_file(html_file)
            status = "[OK]" if success else "[SKIP]"
            print(f"  {status} {html_file.name}: {msg}")
            if success:
                optimized += 1

    print("\n" + "=" * 60)
    print(f"Complete! Total: {total}, Optimized: {optimized}, Skipped: {total - optimized}")
    print("=" * 60)

if __name__ == "__main__":
    main()
