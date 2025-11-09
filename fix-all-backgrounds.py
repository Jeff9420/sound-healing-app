#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量替换所有CSS文件中的白色/浅色背景为Raphael AI深色背景
"""

import re
import os
import glob

# Raphael AI 配色方案
RAPHAEL_COLORS = {
    # 白色背景 -> 深棕黑色背景
    'background: white': 'background: #120a07',
    'background: #fff': 'background: #120a07',
    'background: #ffffff': 'background: #120a07',
    'background-color: white': 'background-color: #120a07',
    'background-color: #fff': 'background-color: #120a07',
    'background-color: #ffffff': 'background-color: #120a07',

    # 浅灰色背景 -> 深棕色背景
    'background: #f5f5f5': 'background: #1b100a',
    'background: #f8f8f8': 'background: #1b100a',
    'background: #fafafa': 'background: #1b100a',
    'background: #f0f0f0': 'background: #1b100a',
    'background-color: #f5f5f5': 'background-color: #1b100a',
    'background-color: #f8f8f8': 'background-color: #1b100a',
    'background-color: #fafafa': 'background-color: #1b100a',
    'background-color: #f0f0f0': 'background-color: #1b100a',

    # 半透明白色 -> 半透明暗色
    'rgba(255, 255, 255, 0.95)': 'rgba(18, 10, 7, 0.95)',
    'rgba(255, 255, 255, 0.9)': 'rgba(18, 10, 7, 0.9)',
    'rgba(255, 255, 255, 0.8)': 'rgba(27, 16, 10, 0.8)',
    'rgba(255, 255, 255, 0.7)': 'rgba(27, 16, 10, 0.7)',
    'rgba(255, 255, 255, 0.5)': 'rgba(27, 16, 10, 0.5)',

    # 黑色文本 -> 暖白色文本
    'color: black': 'color: #fdf3e5',
    'color: #000': 'color: #fdf3e5',
    'color: #000000': 'color: #fdf3e5',
    'color: #333': 'color: #fdf3e5',
    'color: #222': 'color: #fdf3e5',
}

def fix_css_file(file_path):
    """修复单个CSS文件的背景和文本颜色"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 替换颜色
        for old, new in RAPHAEL_COLORS.items():
            content = content.replace(old, new)

        # 如果内容有变化，写入文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            print(f'✅ Updated: {os.path.basename(file_path)}')
            return True
        else:
            print(f'⏭️  Skipped: {os.path.basename(file_path)} (no changes needed)')
            return False

    except Exception as e:
        print(f'❌ Error updating {file_path}: {e}')
        return False

def main():
    css_dir = 'assets/css'
    css_files = glob.glob(f'{css_dir}/*.css')

    print(f'🔍 Found {len(css_files)} CSS files\n')

    updated_count = 0
    for css_file in css_files:
        if fix_css_file(css_file):
            updated_count += 1

    print(f'\n✨ Complete! Updated {updated_count} files')

if __name__ == '__main__':
    main()
