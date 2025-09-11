/**
 * 配置适配器 - Archive.org外部存储兼容层
 * 将AUDIO_CONFIG_ARCHIVE适配为AUDIO_CONFIG格式，确保向后兼容
 */

class ConfigAdapter {
    constructor() {
        this.archiveConfig = null;
        this.adaptedConfig = null;
        this.initialized = false;
    }
    
    /**
     * 初始化配置适配器
     */
    initialize() {
        if (typeof AUDIO_CONFIG_ARCHIVE !== 'undefined') {
            this.archiveConfig = AUDIO_CONFIG_ARCHIVE;
            this.adaptedConfig = this.adaptArchiveConfig();
            
            // 将适配后的配置设为全局AUDIO_CONFIG
            window.AUDIO_CONFIG = this.adaptedConfig;
            
            this.initialized = true;
            console.log('✅ 配置适配器: Archive.org配置已适配为AUDIO_CONFIG格式');
            
            // 触发配置更新事件
            window.dispatchEvent(new CustomEvent('audioConfigReady', {
                detail: { 
                    source: 'archive.org',
                    config: this.adaptedConfig,
                    originalConfig: this.archiveConfig 
                }
            }));
            
            return true;
        } else if (typeof AUDIO_CONFIG !== 'undefined') {
            console.log('✅ 配置适配器: 使用本地AUDIO_CONFIG配置');
            this.initialized = true;
            return true;
        } else {
            console.warn('⚠️ 配置适配器: 未找到任何音频配置');
            return false;
        }
    }
    
    /**
     * 将Archive.org配置格式适配为标准AUDIO_CONFIG格式
     */
    adaptArchiveConfig() {
        if (!this.archiveConfig) return null;
        
        const adapted = {
            baseUrl: this.archiveConfig.baseUrl,
            fallbackUrl: this.archiveConfig.fallbackUrl,
            mirrorUrls: this.archiveConfig.mirrorUrls,
            categories: {}
        };
        
        // 适配各个音频分类
        Object.entries(this.archiveConfig.categories).forEach(([categoryKey, categoryData]) => {
            adapted.categories[categoryKey] = {
                name: categoryData.name,
                icon: categoryData.icon,
                description: categoryData.description,
                archiveFolder: categoryData.archiveFolder || categoryKey.toLowerCase().replace(/\s+/g, '-') + '/',
                files: this.adaptCategoryFiles(categoryData.files, categoryKey)
            };
        });
        
        return adapted;
    }
    
    /**
     * 适配分类文件列表
     */
    adaptCategoryFiles(files, categoryKey) {
        if (!files || !Array.isArray(files)) return [];
        
        return files.map(file => {
            if (typeof file === 'string') {
                // 简单字符串格式，直接返回
                return file;
            } else if (file.originalName) {
                // Archive.org格式，使用originalName保持兼容性
                return file.originalName;
            } else if (file.filename) {
                // 使用filename作为fallback
                return file.filename.replace('.mp3', '').replace(/-/g, ' ') + '.mp3';
            } else {
                return 'Unknown Audio File.mp3';
            }
        });
    }
    
    /**
     * 获取音频文件的完整URL
     */
    getAudioUrl(categoryKey, fileName, preferArchive = true) {
        if (!this.initialized) {
            console.warn('配置适配器未初始化');
            return null;
        }
        
        const category = this.adaptedConfig?.categories[categoryKey];
        if (!category) {
            console.warn(`分类不存在: ${categoryKey}`);
            return null;
        }
        
        if (preferArchive && this.archiveConfig) {
            // 优先使用Archive.org URL
            const archiveFolder = category.archiveFolder || '';
            const baseUrl = this.archiveConfig.baseUrl;
            
            // 查找对应的Archive文件名
            const archiveCategory = this.archiveConfig.categories[categoryKey];
            if (archiveCategory && archiveCategory.files) {
                const archiveFile = archiveCategory.files.find(f => 
                    f.originalName === fileName || f.filename === fileName
                );
                
                if (archiveFile) {
                    return `${baseUrl}${archiveFolder}${archiveFile.filename || archiveFile.originalName}`;
                }
            }
            
            // 如果找不到，使用原始文件名构建URL
            const encodedFileName = encodeURIComponent(fileName);
            return `${baseUrl}${archiveFolder}${encodedFileName}`;
        } else {
            // 使用本地fallback URL
            const fallbackUrl = this.adaptedConfig.fallbackUrl || 'assets/audio/';
            const categoryFolder = categoryKey + '/';
            return `${fallbackUrl}${categoryFolder}${fileName}`;
        }
    }
    
    /**
     * 获取备用URL列表（用于重试机制）
     */
    getFallbackUrls(categoryKey, fileName) {
        const urls = [];
        
        if (this.archiveConfig && this.archiveConfig.mirrorUrls) {
            // 添加Archive.org镜像URL
            const category = this.adaptedConfig?.categories[categoryKey];
            const archiveFolder = category?.archiveFolder || '';
            
            const archiveCategory = this.archiveConfig.categories[categoryKey];
            let targetFileName = fileName;
            
            if (archiveCategory && archiveCategory.files) {
                const archiveFile = archiveCategory.files.find(f => 
                    f.originalName === fileName || f.filename === fileName
                );
                if (archiveFile) {
                    targetFileName = archiveFile.filename || archiveFile.originalName;
                }
            }
            
            const encodedFileName = encodeURIComponent(targetFileName);
            
            // 主URL
            urls.push(`${this.archiveConfig.baseUrl}${archiveFolder}${encodedFileName}`);
            
            // 镜像URLs
            this.archiveConfig.mirrorUrls.forEach(mirrorUrl => {
                urls.push(`${mirrorUrl}${archiveFolder}${encodedFileName}`);
            });
        }
        
        // 本地fallback URL
        if (this.adaptedConfig?.fallbackUrl) {
            urls.push(`${this.adaptedConfig.fallbackUrl}${categoryKey}/${fileName}`);
        }
        
        return urls;
    }
    
    /**
     * 检查Archive.org是否可用
     */
    async checkArchiveAvailability() {
        if (!this.archiveConfig) return false;
        
        try {
            const response = await fetch(this.archiveConfig.baseUrl, { 
                method: 'HEAD', 
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.warn('Archive.org检查失败:', error.message);
            return false;
        }
    }
    
    /**
     * 获取配置状态
     */
    getStatus() {
        return {
            initialized: this.initialized,
            hasArchiveConfig: !!this.archiveConfig,
            hasLocalConfig: typeof AUDIO_CONFIG !== 'undefined',
            categoriesCount: this.adaptedConfig ? Object.keys(this.adaptedConfig.categories).length : 0,
            totalFiles: this.getTotalFileCount()
        };
    }
    
    /**
     * 获取总文件数量
     */
    getTotalFileCount() {
        if (!this.adaptedConfig) return 0;
        
        return Object.values(this.adaptedConfig.categories)
            .reduce((total, category) => total + (category.files?.length || 0), 0);
    }
}

// 创建全局实例
window.configAdapter = new ConfigAdapter();

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.configAdapter.initialize(), 100);
    });
} else {
    setTimeout(() => window.configAdapter.initialize(), 100);
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigAdapter;
}

console.log('🔧 配置适配器已加载，等待初始化...');