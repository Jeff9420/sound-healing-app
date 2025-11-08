#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
移除HTML中data-i18n元素的硬编码中文文本
保留元素结构，让i18n系统自动填充翻译
"""

import re
import sys

def remove_hardcoded_chinese(html_content):
    """
    移除带有data-i18n属性的元素中的硬编码中文文本
    """

    # 模式1: <element data-i18n="key">中文文本</element>
    # 替换为: <element data-i18n="key"></element>
    pattern1 = r'(<[^>]+data-i18n="[^"]+">)[\u4e00-\u9fff\s\w\.\,\!\?\:\;\-\+\&\·\、\，\。\！\？\：\；\—\…\%\d]+(<\/[^>]+>)'

    def replace_with_empty(match):
        opening = match.group(1)
        closing = match.group(2)
        return opening + closing

    # 第一遍：处理简单的单标签情况
    html_content = re.sub(pattern1, replace_with_empty, html_content)

    # 模式2: 单行包含中文的data-i18n元素
    # 例如: <span data-i18n="key">中文</span>
    pattern2 = r'(<(?:span|div|p|h[1-6]|li|button|a|label|option|small)[^>]*data-i18n="[^"]*"[^>]*>)[^<]*[\u4e00-\u9fff][^<]*(</(?:span|div|p|h[1-6]|li|button|a|label|option|small)>)'
    html_content = re.sub(pattern2, r'\1\2', html_content)

    # 模式3: placeholder中文
    pattern3 = r'(placeholder=")[^"]*[\u4e00-\u9fff][^"]*(")'
    html_content = re.sub(pattern3, r'\1\2', html_content)

    # 模式4: aria-label中文
    pattern4 = r'(aria-label=")[^"]*[\u4e00-\u9fff][^"]*(")'
    html_content = re.sub(pattern4, r'\1\2', html_content)

    return html_content

def main():
    input_file = 'index.html'
    output_file = 'index.html'

    print(f'📖 Reading {input_file}...')
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print('🔧 Removing hardcoded Chinese text from data-i18n elements...')
    modified_content = remove_hardcoded_chinese(content)

    print(f'💾 Writing to {output_file}...')
    with open(output_file, 'w', encoding='utf-8', newline='\n') as f:
        f.write(modified_content)

    print('✅ Done! Hardcoded Chinese text removed.')
    print('ℹ️  i18n system will now populate all translations based on user language preference.')

if __name__ == '__main__':
    main()
