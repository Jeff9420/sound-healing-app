#!/usr/bin/env python3
"""
批量更新pages目录下所有HTML文件,添加i18n支持
"""

import os
import re
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent
PAGES_DIR = BASE_DIR / 'pages'

def update_html_lang(content):
    """更新HTML lang属性为en-US"""
    # Match <html lang="...">
    content = re.sub(
        r'<html\s+lang="[^"]*"',
        '<html lang="en-US"',
        content,
        flags=re.IGNORECASE
    )
    return content

def add_pages_i18n_script(content):
    """添加pages-i18n.js到HTML文件"""

    # 检查是否已经包含pages-i18n.js
    if 'pages-i18n.js' in content:
        print("    ✓ pages-i18n.js already included")
        return content

    # 计算相对路径深度
    # 如果文件在pages/xxx/index.html, 则需要../../assets/js/pages-i18n.js
    # 如果文件在pages/docs/xxx/yyy.html, 则需要../../../assets/js/pages-i18n.js

    # 尝试在</body>之前插入
    script_tag = '<script src="../../assets/js/pages-i18n.js"></script>'

    # 如果找到</body>,在其之前插入
    if '</body>' in content:
        content = content.replace(
            '</body>',
            f'    {script_tag}\n</body>'
        )
        print("    ✓ Added pages-i18n.js before </body>")
    else:
        print("    ⚠ Could not find </body> tag")

    return content

def add_back_link_i18n(content):
    """为返回链接添加data-i18n属性"""

    # Match: <a ...href="../../index.html">返回首页</a>
    # or: <a ...href="...">← 返回...</a>

    # Pattern for back to home links
    patterns = [
        (r'(<a[^>]*href="[^"]*index\.html"[^>]*>)(← 返回首页|返回首页)(</a>)',
         r'\1<span data-i18n="nav.back">← Back to Home</span>\3'),

        (r'(<a[^>]*href="[^"]*index\.html"[^>]*>)(.*?返回.*?)(</a>)',
         r'\1<span data-i18n="nav.back">← Back to Home</span>\3'),
    ]

    for pattern, replacement in patterns:
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            print("    ✓ Added data-i18n to back link")
            break

    return content

def update_html_file(filepath):
    """更新单个HTML文件"""
    print(f"\n📄 Processing: {filepath.relative_to(BASE_DIR)}")

    try:
        # 读取文件
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 应用更新
        content = update_html_lang(content)
        content = add_pages_i18n_script(content)
        content = add_back_link_i18n(content)

        # 如果有变化,写回文件
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print("    ✅ File updated successfully")
            return True
        else:
            print("    ℹ️  No changes needed")
            return False

    except Exception as e:
        print(f"    ❌ Error: {e}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("📦 批量更新Pages目录HTML文件 - 添加i18n支持")
    print("=" * 60)

    if not PAGES_DIR.exists():
        print(f"❌ Pages目录不存在: {PAGES_DIR}")
        return

    # 查找所有HTML文件
    html_files = list(PAGES_DIR.rglob('*.html'))

    if not html_files:
        print("❌ 未找到HTML文件")
        return

    print(f"\n找到 {len(html_files)} 个HTML文件\n")

    # 更新每个文件
    updated_count = 0
    for filepath in html_files:
        if update_html_file(filepath):
            updated_count += 1

    # 总结
    print("\n" + "=" * 60)
    print(f"✅ 完成！共更新 {updated_count}/{len(html_files)} 个文件")
    print("=" * 60)

    print("\n📝 后续步骤:")
    print("1. 检查更新的文件")
    print("2. 测试pages页面的多语言功能")
    print("3. 提交并部署")

if __name__ == '__main__':
    main()
