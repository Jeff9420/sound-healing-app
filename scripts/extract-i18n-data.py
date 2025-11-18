#!/usr/bin/env python3
"""
提取 i18n-system.js 中的翻译数据到独立的 JSON 文件
这将减少 ~130KB 的包体积
"""

import json
import os
import re

# 读取 i18n-system.js
input_file = 'assets/js/i18n-system.js'
output_dir = 'assets/js/i18n-data'

print('🚀 开始提取 i18n 翻译数据...')

# 创建输出目录
os.makedirs(output_dir, exist_ok=True)

# 读取文件
with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 查找 getTranslationData 方法
pattern = r"getTranslationData\(langCode\)\s*{[^}]*const translations = \{(.*?)\};\s*return translations"
match = re.search(pattern, content, re.DOTALL)

if not match:
    print('❌ 未找到 getTranslationData 方法')
    exit(1)

translations_code = match.group(1)

# 解析每种语言的数据
languages = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'es-ES']

for lang in languages:
    print(f'📝 提取 {lang} 翻译数据...')

    # 查找该语言的翻译对象
    lang_pattern = rf"'{lang}':\s*\{{(.*?)\}}(?=,\s*'|\s*\}})"
    lang_match = re.search(lang_pattern, translations_code, re.DOTALL)

    if not lang_match:
        print(f'⚠️  未找到 {lang} 数据')
        continue

    lang_content = lang_match.group(1)

    # 解析为字典
    translations = {}

    # 匹配所有键值对
    kv_pattern = r"'([^']+)':\s*'([^']*(?:\\'[^']*)*)'"
    for kv_match in re.finditer(kv_pattern, lang_content):
        key = kv_match.group(1)
        value = kv_match.group(2)
        # 处理转义字符
        value = value.replace("\\'", "'")
        translations[key] = value

    # 写入 JSON 文件
    output_file = os.path.join(output_dir, f'{lang}.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)

    print(f'✅ {lang}: {len(translations)} 条翻译已保存到 {output_file}')

print('\n✨ 翻译数据提取完成！')
print(f'📁 JSON 文件位置: {output_dir}/')
print('\n下一步:')
print('1. 修改 i18n-system.js 以动态加载这些 JSON 文件')
print('2. 删除 getTranslationData 方法中的硬编码数据')
print('3. 测试所有语言切换功能')
