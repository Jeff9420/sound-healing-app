#!/usr/bin/env python3
"""
批量修复resources目录下所有详情页面的多语言支持
- 将lang改为en-US
- 添加pages-i18n.js脚本
- 将硬编码中文替换为英语+data-i18n属性
"""

import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent
RESOURCES_DIR = BASE_DIR / 'pages' / 'resources'

# 通用映射：中文 -> data-i18n键
COMMON_MAPPINGS = {
    # 返回链接
    r'(<a[^>]*href="index\.html"[^>]*>)(← 返回资源中心|返回资源中心)(</a>)':
        r'\1<span data-i18n="nav.backResources">← Back to Resources</span>\3',

    # 类别标签
    r'(<span[^>]*class="resource-category"[^>]*>)(实践指南)(</span>)':
        r'\1<span data-i18n="detail.category.guide">Practice Guide</span>\3',
    r'(<span[^>]*class="resource-category"[^>]*>)(视频教程)(</span>)':
        r'\1<span data-i18n="detail.category.video">Video Tutorial</span>\3',
    r'(<span[^>]*class="resource-category"[^>]*>)(用户故事|真实故事)(</span>)':
        r'\1<span data-i18n="detail.category.story">User Story</span>\3',
    r'(<span[^>]*class="resource-category"[^>]*>)(专家访谈)(</span>)':
        r'\1<span data-i18n="detail.category.interview">Expert Interview</span>\3',
    r'(<span[^>]*class="resource-category"[^>]*>)(品牌背书)(</span>)':
        r'\1<span data-i18n="detail.category.endorsement">Brand Endorsement</span>\3',
    r'(<span[^>]*class="resource-category"[^>]*>)(博客文章)(</span>)':
        r'\1<span data-i18n="detail.category.blog">Blog Article</span>\3',
    r'(<span[^>]*class="resource-category"[^>]*>)(下载资源)(</span>)':
        r'\1<span data-i18n="detail.category.download">Download</span>\3',

    # CTA按钮
    r'(<a[^>]*class="hero-btn-primary"[^>]*data-cta="[^"]*"[^>]*>)(填写需求表单)(</a>)':
        r'\1<span data-i18n="detail.cta.plan">Fill Needs Form</span>\3',
    r'(<a[^>]*class="hero-btn-secondary"[^>]*data-cta="[^"]*"[^>]*>)(查看实践案例|查看案例)(</a>)':
        r'\1<span data-i18n="detail.cta.impact">View Case Studies</span>\3',

    # 内容预告部分
    r'(<h2[^>]*>)(内容预告)(</h2>)':
        r'\1<span data-i18n="detail.content.preview">Content Preview</span>\3',
    r'(我们正在整理.*的完整内容。)':
        '<p data-i18n="detail.content.preparing">We are currently preparing the complete content for this guide.</p>',
    r'(敬请期待完整版，我们会在完成审核后第一时间发布。)':
        '<p data-i18n="detail.content.coming">Please stay tuned for the complete version, which will be published shortly after review.</p>',

    # 亮点
    r'(<li[^>]*>)(亮点一：结合声音与呼吸的实用技巧)(</li>)':
        r'\1<span data-i18n="detail.highlight.one">Highlight 1: Combining sound with breathing techniques</span>\3',
    r'(<li[^>]*>)(亮点二：可直接应用的日常流程)(</li>)':
        r'\1<span data-i18n="detail.highlight.two">Highlight 2: Ready-to-use daily routines</span>\3',
    r'(<li[^>]*>)(亮点三：推荐音频与配套练习)(</li>)':
        r'\1<span data-i18n="detail.highlight.three">Highlight 3: Recommended audio tracks and exercises</span>\3',

    # 下一步行动
    r'(<h3[^>]*>)(下一步行动)(</h3>)':
        r'\1<span data-i18n="detail.actions.title">Next Steps</span>\3',
    r'(<a[^>]*class="cta-primary"[^>]*>)(提交我的练习需求|提交需求)(</a>)':
        r'\1<span data-i18n="detail.actions.submit">Submit My Practice Needs</span>\3',
    r'(<a[^>]*class="cta-secondary"[^>]*>)(订阅每周精选)(</a>)':
        r'\1<span data-i18n="detail.actions.subscribe">Subscribe to Weekly Selection</span>\3',

    # 延伸阅读
    r'(<h3[^>]*>)(延伸阅读|相关阅读)(</h3>)':
        r'\1<span data-i18n="detail.related.title">Related Reading</span>\3',
    r'(<a[^>]*href="../../index\.html#journeyShowcase"[^>]*>)(探索更多疗愈场景 →)(</a>)':
        r'\1<span data-i18n="detail.related.more">Explore More Healing Scenarios →</span>\3',
}

def update_html_lang(content):
    """更新HTML lang属性为en-US"""
    content = re.sub(
        r'<html\s+lang="[^"]*"',
        '<html lang="en-US"',
        content,
        flags=re.IGNORECASE
    )
    return content

def update_meta_tags(content):
    """更新meta标签为英语"""
    # 更新常见的中文title
    content = re.sub(
        r'(<title>)[^<]*声音疗愈资源中心(</title>)',
        r'\1Sound Healing Resource Hub\2',
        content
    )
    return content

def add_pages_i18n_script(content):
    """添加pages-i18n.js脚本"""
    if 'pages-i18n.js' in content:
        print("    ✓ pages-i18n.js already included")
        return content

    # 在第一个<script>标签之前插入，如果没有则在</body>之前
    script_tag = '<script src="../../assets/js/pages-i18n.js"></script>'

    # 查找第一个<script>标签
    script_match = re.search(r'<script', content)
    if script_match:
        pos = script_match.start()
        content = content[:pos] + f'    {script_tag}\n    ' + content[pos:]
        print("    ✓ Added pages-i18n.js before existing scripts")
    elif '</body>' in content:
        content = content.replace('</body>', f'    {script_tag}\n</body>')
        print("    ✓ Added pages-i18n.js before </body>")
    else:
        print("    ⚠ Could not find insertion point for script")

    return content

def apply_common_mappings(content):
    """应用通用映射替换"""
    changes = 0
    for pattern, replacement in COMMON_MAPPINGS.items():
        if re.search(pattern, content):
            content = re.sub(pattern, replacement, content)
            changes += 1

    if changes > 0:
        print(f"    ✓ Applied {changes} common mappings")

    return content

def add_simple_data_i18n(content):
    """为还没有data-i18n的简单元素添加属性（保守方式）"""
    # 只为明确的模式添加data-i18n

    # 1. 返回链接
    if '← 返回资源中心' in content and 'data-i18n' not in content[:content.find('返回资源中心')+20]:
        content = re.sub(
            r'(<a[^>]*href="index\.html")(>← 返回资源中心</a>)',
            r'\1 data-i18n="nav.backResources">\n← Back to Resources</a>',
            content
        )
        print("    ✓ Added data-i18n to back link")

    # 2. 类别标签 - 如果还没有data-i18n
    category_patterns = [
        ('实践指南', 'detail.category.guide', 'Practice Guide'),
        ('视频教程', 'detail.category.video', 'Video Tutorial'),
        ('用户故事', 'detail.category.story', 'User Story'),
        ('专家访谈', 'detail.category.interview', 'Expert Interview'),
        ('品牌背书', 'detail.category.endorsement', 'Brand Endorsement'),
        ('博客文章', 'detail.category.blog', 'Blog Article'),
        ('下载资源', 'detail.category.download', 'Download'),
    ]

    for chinese, key, english in category_patterns:
        if chinese in content and f'data-i18n="{key}"' not in content:
            content = re.sub(
                f'(<span[^>]*class="resource-category"[^>]*>){chinese}(</span>)',
                f'\\1<span data-i18n="{key}">{english}</span>\\2',
                content
            )

    # 3. CTA按钮
    if '填写需求表单' in content:
        content = re.sub(
            r'(>)(填写需求表单)(</a>)',
            r' data-i18n="detail.cta.plan">\nFill Needs Form</a>',
            content
        )

    if '查看实践案例' in content or '查看案例' in content:
        content = re.sub(
            r'(>)(查看实践案例|查看案例)(</a>)',
            r' data-i18n="detail.cta.impact">\nView Case Studies</a>',
            content
        )

    return content

def fix_html_file(filepath):
    """修复单个HTML文件"""
    print(f"\n📄 Processing: {filepath.relative_to(BASE_DIR)}")

    # 跳过index.html和sleep-routine.html（已手动修复）
    if filepath.name in ['index.html', 'sleep-routine.html']:
        print("    ℹ️  Already fixed manually, skipping")
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 应用所有修复
        content = update_html_lang(content)
        content = update_meta_tags(content)
        content = add_pages_i18n_script(content)
        content = apply_common_mappings(content)
        content = add_simple_data_i18n(content)

        # 如果有变化，写回文件
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
    print("=" * 70)
    print("📦 批量修复Resources详情页 - 多语言支持")
    print("=" * 70)

    if not RESOURCES_DIR.exists():
        print(f"❌ Resources目录不存在: {RESOURCES_DIR}")
        return

    # 查找所有HTML文件
    html_files = list(RESOURCES_DIR.glob('*.html'))

    if not html_files:
        print("❌ 未找到HTML文件")
        return

    print(f"\n找到 {len(html_files)} 个HTML文件\n")

    # 修复每个文件
    updated_count = 0
    for filepath in html_files:
        if fix_html_file(filepath):
            updated_count += 1

    # 总结
    print("\n" + "=" * 70)
    print(f"✅ 完成！共更新 {updated_count}/{len(html_files)} 个文件")
    print("=" * 70)

    print("\n📝 后续步骤:")
    print("1. 检查更新的文件")
    print("2. 测试页面的多语言功能")
    print("3. 提交并部署")
    print("\n⚠️  注意：由于每个页面的标题和内容不同，部分页面可能需要手动调整")

if __name__ == '__main__':
    main()
