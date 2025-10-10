#!/usr/bin/env python3
"""
将SVG社交媒体模板转换为JPG图片
"""
import subprocess
import sys
import os

def install_packages():
    """安装必要的Python包"""
    packages = ['cairosvg', 'pillow']
    for package in packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            print(f"安装 {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])

def svg_to_jpg(svg_path, jpg_path, quality=90):
    """将SVG转换为JPG"""
    try:
        import cairosvg
        from PIL import Image
        import io

        print(f"正在转换 {svg_path} -> {jpg_path}")

        # SVG转PNG（cairosvg的中间步骤）
        png_data = cairosvg.svg2png(url=svg_path)

        # PNG转JPG（使用Pillow）
        img = Image.open(io.BytesIO(png_data))

        # 转换为RGB模式（JPG不支持透明度）
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (26, 26, 46))  # 深色背景
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # 保存为JPG
        img.save(jpg_path, 'JPEG', quality=quality, optimize=True)

        # 检查文件大小
        file_size = os.path.getsize(jpg_path) / 1024  # KB
        print(f"✓ 创建成功: {jpg_path} ({file_size:.1f} KB)")

        if file_size > 300:
            print(f"  ⚠ 警告: 文件大小 {file_size:.1f} KB 超过推荐的300KB")

        return True

    except Exception as e:
        print(f"✗ 转换失败: {e}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("社交媒体分享图片生成工具")
    print("=" * 60)

    # 安装必要的包
    print("\n1. 检查并安装依赖...")
    install_packages()

    # 定义路径
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, 'assets', 'images')

    conversions = [
        {
            'svg': os.path.join(assets_dir, 'og-image-template.svg'),
            'jpg': os.path.join(assets_dir, 'og-image.jpg'),
            'name': 'Open Graph图片 (1200x630)'
        },
        {
            'svg': os.path.join(assets_dir, 'twitter-card-template.svg'),
            'jpg': os.path.join(assets_dir, 'twitter-card.jpg'),
            'name': 'Twitter Card图片 (1200x628)'
        }
    ]

    print("\n2. 开始转换SVG到JPG...")
    success_count = 0

    for conv in conversions:
        print(f"\n处理: {conv['name']}")
        if os.path.exists(conv['svg']):
            if svg_to_jpg(conv['svg'], conv['jpg'], quality=90):
                success_count += 1
        else:
            print(f"✗ 找不到文件: {conv['svg']}")

    # 总结
    print("\n" + "=" * 60)
    print(f"转换完成: {success_count}/{len(conversions)} 个图片创建成功")
    print("=" * 60)

    if success_count == len(conversions):
        print("\n✓ 所有社交媒体分享图片已创建！")
        print("\n图片位置:")
        for conv in conversions:
            if os.path.exists(conv['jpg']):
                print(f"  - {conv['jpg']}")

        print("\n下一步:")
        print("1. 检查图片质量和文件大小")
        print("2. 使用以下工具测试分享效果:")
        print("   - Facebook: https://developers.facebook.com/tools/debug/")
        print("   - Twitter: https://cards-dev.twitter.com/validator")
        print("   - LinkedIn: https://www.linkedin.com/post-inspector/")
    else:
        print("\n⚠ 部分图片创建失败，请检查错误信息")

if __name__ == '__main__':
    main()
