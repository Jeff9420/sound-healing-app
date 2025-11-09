#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量替换CSS文件中的紫色为Raphael AI的橙黄色风格
"""

import re

def update_colors(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 替换紫色为橙黄色
    replacements = {
        # 纯色十六进制
        '#6666ff': '#f6a93b',
        '#9f7aea': '#f87c0f',
        '#5555ee': '#f6c36d',
        '#8e69d9': '#f4973c',
        '#8888ff': '#ffd49a',

        # RGB(A) 颜色 - 紫色
        'rgba(102, 102, 255, 0.1)': 'rgba(246, 169, 59, 0.12)',
        'rgba(102, 102, 255, 0.2)': 'rgba(246, 169, 59, 0.2)',
        'rgba(102, 102, 255, 0.3)': 'rgba(246, 169, 59, 0.35)',
        'rgba(102, 102, 255, 0.4)': 'rgba(248, 124, 15, 0.35)',
        'rgba(102, 102, 255, 0.5)': 'rgba(246, 169, 59, 0.55)',
        'rgba(102, 102, 255, 0.6)': 'rgba(246, 169, 59, 0.6)',

        'rgba(159, 122, 234, 0.1)': 'rgba(122, 90, 248, 0.12)',
        'rgba(159, 122, 234, 0.3)': 'rgba(122, 90, 248, 0.18)',

        # 深蓝背景
        'rgba(13, 19, 31, 0.95)': 'rgba(18, 10, 7, 0.95)',
        'rgba(13, 19, 31, 0.98)': 'rgba(27, 16, 10, 0.98)',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)

    print(f'✅ Updated {file_path}')

# 更新文件
files_to_update = [
    'assets/css/redesign-v2.css',
    'assets/css/index-styles.css',
]

for file_path in files_to_update:
    try:
        update_colors(file_path)
    except FileNotFoundError:
        print(f'⚠️  File not found: {file_path}')
    except Exception as e:
        print(f'❌ Error updating {file_path}: {e}')

print('\n🎨 Color update complete!')
