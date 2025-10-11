#!/usr/bin/env python3
"""
PWA图标生成脚本
使用 PIL 生成所有缺失的PWA图标
"""

import os
import math
from PIL import Image, ImageDraw, ImageFont

# 需要生成的图标尺寸
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

# 输出目录
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
icons_dir = os.path.join(project_dir, 'assets', 'icons')

# 确保输出目录存在
os.makedirs(icons_dir, exist_ok=True)

def generate_icon(size):
    """生成单个图标"""
    # 创建图像
    img = Image.new('RGB', (size, size), color='#0d131f')
    draw = ImageDraw.Draw(img)

    # 绘制背景渐变 (简化版：使用单色背景和圆形)
    # 主背景色
    draw.rectangle([(0, 0), (size, size)], fill='#6666ff')

    # 绘制声波效果（简化版：多个圆环）
    center_x = size // 2
    center_y = size // 2

    # 绘制多个同心圆环表示声波
    for i in range(1, 5):
        radius = int(size * 0.1 * i)
        alpha = max(10, 80 - i * 15)  # 逐渐变淡
        color = f'rgba(255, 255, 255, {alpha/255})'
        # PIL不直接支持rgba字符串，改用RGB
        rgb_color = (255, 255, 255)
        draw.ellipse(
            [(center_x - radius, center_y - radius),
             (center_x + radius, center_y + radius)],
            outline=rgb_color,
            width=max(1, size // 50)
        )

    # 中心实心圆（代表声音源）
    circle_radius = size // 8
    draw.ellipse(
        [(center_x - circle_radius, center_y - circle_radius),
         (center_x + circle_radius, center_y + circle_radius)],
        fill=(255, 255, 255)
    )

    # 添加文字（仅在较大尺寸）
    if size >= 192:
        try:
            # 尝试使用系统字体
            font_size = size // 10
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                font = ImageFont.load_default()

            text = "SF"
            # 获取文本边界框
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]

            # 在中心绘制文字
            text_x = center_x - text_width // 2
            text_y = center_y - text_height // 2
            draw.text((text_x, text_y), text, fill=(102, 102, 255), font=font)
        except Exception as e:
            print(f"   [WARN] Text rendering failed: {e}")

    return img

def generate_all_icons():
    """生成所有图标"""
    print(">>> Starting PWA icon generation...\n")

    # 生成各种尺寸的图标
    for size in sizes:
        img = generate_icon(size)
        filename = f'icon-{size}x{size}.png'
        filepath = os.path.join(icons_dir, filename)
        img.save(filepath, 'PNG')
        print(f"[OK] Generated: {filename}")

    # 生成 favicon.png (32x32)
    favicon = generate_icon(32)
    favicon_path = os.path.join(project_dir, 'favicon.png')
    favicon.save(favicon_path, 'PNG')
    print(f"[OK] Generated: favicon.png (32x32)")

    # 生成 android-chrome-192x192.png
    android_chrome = generate_icon(192)
    android_path = os.path.join(project_dir, 'android-chrome-192x192.png')
    android_chrome.save(android_path, 'PNG')
    print(f"[OK] Generated: android-chrome-192x192.png")

    print(f"\n[SUCCESS] All icons generated!")
    print(f"[INFO] PWA icons location: {icons_dir}")
    print(f"[INFO] Root icons: favicon.png, android-chrome-192x192.png")

if __name__ == "__main__":
    try:
        generate_all_icons()
    except Exception as error:
        print(f"[ERROR] Icon generation failed: {error}")
        print("\n[TIP] Please install Pillow package:")
        print("   pip install Pillow")
        exit(1)
