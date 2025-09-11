#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
音频配置自动更新脚本
自动扫描音频文件夹并生成配置

使用方法：
1. 将新音频文件放到 assets/audio/ 对应分类文件夹
2. 运行：python update-audio-config.py
3. 重新部署应用

@date 2025-09-08
"""

import os
import json
import re
from pathlib import Path

# 音频文件夹路径
AUDIO_BASE_PATH = "assets/audio"
CONFIG_FILE_PATH = "assets/js/audio-config.js"

# 分类配置（可根据需要修改）
CATEGORY_CONFIG = {
    'Animal sounds': {
        'name': '动物声音',
        'icon': '🐾',
        'description': '自然动物的声音，如鸟鸣、溪水声等'
    },
    'Chakra': {
        'name': '脉轮音乐', 
        'icon': '🌈',
        'description': '调节身体能量中心的音乐'
    },
    'Fire': {
        'name': '火焰声音',
        'icon': '🔥', 
        'description': '篝火、壁炉等火焰燃烧的声音'
    },
    'hypnosis': {
        'name': '催眠音乐',
        'icon': '😴',
        'description': '专业催眠和深度放松音乐'
    },
    'meditation': {
        'name': '冥想音乐',
        'icon': '🧘',
        'description': '专注冥想和正念练习音乐'
    },
    'Rain': {
        'name': '雨声',
        'icon': '🌧️',
        'description': '各种雨声：小雨、暴雨、雷雨等'
    },
    'running water': {
        'name': '流水声',
        'icon': '💧',
        'description': '溪流、瀑布、河水等自然水声'
    },
    'Singing bowl sound': {
        'name': '颂钵音乐',
        'icon': '🎎',
        'description': '西藏颂钵的清脆治愈声音'
    },
    'Subconscious Therapy': {
        'name': '潜意识疗法',
        'icon': '🌟',
        'description': '潜意识改善和心理治疗音乐'
    }
}

def scan_audio_files():
    """扫描音频文件夹，返回分类和文件列表"""
    audio_config = {
        'baseUrl': 'assets/audio/',
        'categories': {}
    }
    
    if not os.path.exists(AUDIO_BASE_PATH):
        print(f"❌ 音频文件夹不存在: {AUDIO_BASE_PATH}")
        return audio_config
    
    total_files = 0
    
    for category_folder in os.listdir(AUDIO_BASE_PATH):
        folder_path = os.path.join(AUDIO_BASE_PATH, category_folder)
        
        if not os.path.isdir(folder_path):
            continue
            
        # 扫描音频文件
        audio_files = []
        supported_formats = ['.mp3', '.wav', '.ogg', '.m4a', '.aac']
        
        for file_name in os.listdir(folder_path):
            file_ext = os.path.splitext(file_name)[1].lower()
            if file_ext in supported_formats:
                audio_files.append(file_name)
        
        if audio_files:
            # 按文件名排序
            audio_files.sort()
            
            # 获取分类配置
            category_info = CATEGORY_CONFIG.get(category_folder, {
                'name': category_folder,
                'icon': '🎵',
                'description': f'{category_folder} 音频文件'
            })
            
            audio_config['categories'][category_folder] = {
                'name': category_info['name'],
                'icon': category_info['icon'],
                'description': category_info['description'],
                'files': audio_files
            }
            
            total_files += len(audio_files)
            print(f"✅ {category_folder}: {len(audio_files)} 个文件")
    
    print(f"\n📊 总计扫描: {len(audio_config['categories'])} 个分类, {total_files} 个音频文件")
    return audio_config

def generate_config_file(audio_config):
    """生成 JavaScript 配置文件"""
    js_content = f"""// 音频配置文件 - 自动生成于 {os.path.basename(__file__)}
// 生成时间: {import_time()}
const AUDIO_CONFIG = {json_to_js(audio_config)};

// 导出配置（如果在 Node.js 环境）
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = AUDIO_CONFIG;
}}

console.log('🎵 音频配置加载完成: {{}} 个分类, {{}} 个音频文件'.format(
    Object.keys(AUDIO_CONFIG.categories).length,
    Object.values(AUDIO_CONFIG.categories).reduce((sum, cat) => sum + cat.files.length, 0)
));
"""
    
    try:
        with open(CONFIG_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(js_content)
        print(f"✅ 配置文件已生成: {CONFIG_FILE_PATH}")
    except Exception as e:
        print(f"❌ 生成配置文件失败: {e}")

def json_to_js(obj, indent=4):
    """将 Python 对象转换为 JavaScript 对象格式"""
    def format_value(value, current_indent=0):
        spaces = " " * current_indent
        next_spaces = " " * (current_indent + indent)
        
        if isinstance(value, dict):
            if not value:
                return "{}"
            items = []
            for k, v in value.items():
                key = f"'{k}'" if isinstance(k, str) else str(k)
                items.append(f"{next_spaces}{key}: {format_value(v, current_indent + indent)}")
            return "{\n" + ",\n".join(items) + f"\n{spaces}}"
        
        elif isinstance(value, list):
            if not value:
                return "[]"
            items = []
            for item in value:
                items.append(f"{next_spaces}{format_value(item, current_indent + indent)}")
            return "[\n" + ",\n".join(items) + f"\n{spaces}]"
        
        elif isinstance(value, str):
            return f"'{value}'"
        
        else:
            return str(value)
    
    return format_value(obj)

def import_time():
    """获取当前时间"""
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')

def backup_current_config():
    """备份当前配置文件"""
    if os.path.exists(CONFIG_FILE_PATH):
        backup_path = f"{CONFIG_FILE_PATH}.backup"
        try:
            with open(CONFIG_FILE_PATH, 'r', encoding='utf-8') as src:
                with open(backup_path, 'w', encoding='utf-8') as dst:
                    dst.write(src.read())
            print(f"📦 已备份原配置文件: {backup_path}")
        except Exception as e:
            print(f"⚠️ 备份失败: {e}")

def main():
    """主函数"""
    print("🚀 开始扫描音频文件...")
    print(f"📁 扫描路径: {os.path.abspath(AUDIO_BASE_PATH)}")
    print("-" * 50)
    
    # 备份当前配置
    backup_current_config()
    
    # 扫描文件
    audio_config = scan_audio_files()
    
    if not audio_config['categories']:
        print("❌ 未找到音频文件，请检查文件夹结构")
        return
    
    # 生成配置文件
    print("\n🔧 生成配置文件...")
    generate_config_file(audio_config)
    
    print("\n✅ 音频配置更新完成！")
    print("\n📝 下一步操作:")
    print("1. 检查生成的 assets/js/audio-config.js 文件")
    print("2. 在浏览器中测试应用功能")
    print("3. 重新部署到 Netlify")

if __name__ == "__main__":
    main()