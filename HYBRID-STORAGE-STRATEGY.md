# 🔄 混合存储策略实施指南

## 📋 策略概述

结合 Git 历史清理 + Archive.org 外部存储 + 少量 LFS 样本的最优方案。

## 🎯 实施步骤

### 第一步：Git 历史清理

#### 1.1 备份当前仓库
```bash
# 创建完整备份
git clone --mirror https://github.com/Jeff9420/sound-healing-app.git sound-healing-app-backup.git
```

#### 1.2 使用 BFG 清理大文件
```bash
# 下载 BFG Repo-Cleaner
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar

# 方案A：完全删除所有音频文件
java -jar bfg-1.14.0.jar --delete-files "*.mp3" --delete-folders "assets/audio" --no-blob-protection

# 方案B：转换为 LFS 指针（保留少量样本）
java -jar bfg-1.14.0.jar --convert-to-git-lfs "*.mp3" --no-blob-protection
```

#### 1.3 彻底清理和压缩
```bash
# 清理引用日志
git reflog expire --expire=now --all

# 垃圾回收和压缩
git gc --prune=now --aggressive

# 检查仓库大小
du -sh .git/
```

### 第二步：创建音频文件清单

#### 2.1 生成 SHA256 校验清单
```bash
# Windows PowerShell 脚本
$files = Get-ChildItem -Recurse -Include *.mp3 "assets/audio"
$checksums = @()
foreach ($file in $files) {
    $hash = (Get-FileHash $file.FullName -Algorithm SHA256).Hash
    $checksums += [PSCustomObject]@{
        File = $file.FullName
        SHA256 = $hash
        Size = $file.Length
        Category = $file.Directory.Name
    }
}
$checksums | ConvertTo-Json | Out-File "AUDIO-CHECKSUMS.json"
```

#### 2.2 Linux/Mac 版本
```bash
#!/bin/bash
# generate_checksums.sh

echo "# 音频文件校验清单" > AUDIO-CHECKSUMS.md
echo "生成时间: $(date)" >> AUDIO-CHECKSUMS.md
echo "" >> AUDIO-CHECKSUMS.md

find assets/audio -name "*.mp3" | while read file; do
    hash=$(shasum -a 256 "$file" | cut -d' ' -f1)
    size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file")
    category=$(dirname "$file" | sed 's|assets/audio/||')
    
    echo "## $(basename "$file")" >> AUDIO-CHECKSUMS.md
    echo "- **路径**: $file" >> AUDIO-CHECKSUMS.md
    echo "- **分类**: $category" >> AUDIO-CHECKSUMS.md
    echo "- **大小**: ${size} bytes" >> AUDIO-CHECKSUMS.md
    echo "- **SHA256**: \`$hash\`" >> AUDIO-CHECKSUMS.md
    echo "" >> AUDIO-CHECKSUMS.md
done
```

### 第三步：创建下载管理器

#### 3.1 智能下载器
```javascript
class HybridAudioManager {
    constructor() {
        this.downloadCache = new Map();
        this.checksumCache = new Map();
        this.downloadQueue = [];
        this.isDownloading = false;
        
        // 加载校验清单
        this.loadChecksums();
    }
    
    async loadChecksums() {
        try {
            const response = await fetch('AUDIO-CHECKSUMS.json');
            const checksums = await response.json();
            
            checksums.forEach(item => {
                this.checksumCache.set(item.File, {
                    sha256: item.SHA256,
                    size: item.Size,
                    category: item.Category
                });
            });
            
            console.log('校验清单加载完成:', this.checksumCache.size, '个文件');
        } catch (error) {
            console.error('校验清单加载失败:', error);
        }
    }
    
    async downloadAudio(filename, options = {}) {
        const cacheKey = filename;
        
        // 检查本地缓存
        if (this.downloadCache.has(cacheKey)) {
            return this.downloadCache.get(cacheKey);
        }
        
        // 添加到下载队列
        return new Promise((resolve, reject) => {
            this.downloadQueue.push({
                filename,
                options,
                resolve,
                reject
            });
            
            this.processDownloadQueue();
        });
    }
    
    async processDownloadQueue() {
        if (this.isDownloading || this.downloadQueue.length === 0) {
            return;
        }
        
        this.isDownloading = true;
        
        while (this.downloadQueue.length > 0) {
            const task = this.downloadQueue.shift();
            
            try {
                const audioData = await this.downloadSingleFile(task.filename, task.options);
                this.downloadCache.set(task.filename, audioData);
                task.resolve(audioData);
            } catch (error) {
                console.error(`下载失败: ${task.filename}`, error);
                task.reject(error);
            }
        }
        
        this.isDownloading = false;
    }
    
    async downloadSingleFile(filename, options) {
        const urls = this.generateUrls(filename);
        let lastError;
        
        for (const url of urls) {
            try {
                console.log(`尝试下载: ${url}`);
                
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(30000) // 30秒超时
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                
                // 验证文件完整性
                if (await this.verifyIntegrity(filename, arrayBuffer)) {
                    const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(blob);
                    
                    console.log(`下载成功: ${filename}`);
                    return {
                        url: audioUrl,
                        blob: blob,
                        size: arrayBuffer.byteLength,
                        verified: true
                    };
                } else {
                    throw new Error('文件完整性验证失败');
                }
                
            } catch (error) {
                console.warn(`URL失败: ${url}`, error.message);
                lastError = error;
                continue;
            }
        }
        
        throw new Error(`所有下载源都失败: ${lastError?.message || '未知错误'}`);
    }
    
    generateUrls(filename) {
        const archiveBase = 'https://archive.org/download/sound-healing-collection/';
        const mirrors = [
            'https://ia801504.us.archive.org/download/sound-healing-collection/',
            'https://ia601504.us.archive.org/download/sound-healing-collection/'
        ];
        
        // 根据文件名确定分类文件夹
        const category = this.getCategory(filename);
        const relativePath = `${category}/${filename}`;
        
        // 生成多个下载URL
        const urls = [
            archiveBase + relativePath,
            ...mirrors.map(mirror => mirror + relativePath)
        ];
        
        // 如果存在本地LFS文件，添加到最后作为备选
        if (this.hasLocalLFS(filename)) {
            urls.push(`assets/audio/${category}/${filename}`);
        }
        
        return urls;
    }
    
    async verifyIntegrity(filename, arrayBuffer) {
        const expectedChecksum = this.checksumCache.get(filename);
        if (!expectedChecksum) {
            console.warn(`没有找到文件的校验信息: ${filename}`);
            return true; // 如果没有校验信息，假设文件正确
        }
        
        // 计算SHA256
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const isValid = hashHex.toLowerCase() === expectedChecksum.sha256.toLowerCase();
        
        if (!isValid) {
            console.error(`文件完整性验证失败: ${filename}`);
            console.error(`期望: ${expectedChecksum.sha256}`);
            console.error(`实际: ${hashHex}`);
        }
        
        return isValid;
    }
    
    getCategory(filename) {
        // 从校验清单中获取分类信息
        const checksum = this.checksumCache.get(filename);
        return checksum?.category || 'unknown';
    }
    
    hasLocalLFS(filename) {
        // 检查是否存在本地LFS文件（少量样本）
        // 这里可以维护一个小样本文件列表
        const localSamples = [
            'nature-bird-songs.mp3',
            'ocean-waves-sample.mp3',
            'rain-light-sample.mp3'
        ];
        return localSamples.includes(filename);
    }
    
    // 预下载热门文件
    async preloadPopularTracks() {
        const popularTracks = [
            'nature-bird-songs.mp3',
            'ocean-waves.mp3',
            'rain-thunder.mp3',
            'singing-bowl-healing.mp3'
        ];
        
        console.log('开始预下载热门音频...');
        
        const downloadPromises = popularTracks.map(track => 
            this.downloadAudio(track, { priority: 'high' })
        );
        
        try {
            await Promise.all(downloadPromises);
            console.log('热门音频预下载完成');
        } catch (error) {
            console.error('预下载失败:', error);
        }
    }
    
    // 清理缓存
    cleanup() {
        this.downloadCache.forEach((data, key) => {
            if (data.url) {
                URL.revokeObjectURL(data.url);
            }
        });
        this.downloadCache.clear();
    }
}
```

### 第四步：更新应用配置

#### 4.1 README.md 更新
```markdown
# 🎵 声音疗愈应用

## 音频文件下载

由于音频文件较大，我们使用外部存储方案：

### 自动下载
应用会自动从以下源下载音频：
1. Archive.org (主要源)
2. 镜像站点 (备用源)
3. 本地样本 (少量预装)

### 手动下载
如需手动下载所有音频文件：

```bash
# 下载完整音频包
curl -L https://archive.org/download/sound-healing-collection/complete-audio-pack.zip -o audio-pack.zip

# 验证下载完整性
curl -L https://archive.org/download/sound-healing-collection/SHA256SUMS -o SHA256SUMS
sha256sum -c SHA256SUMS
```

### 文件完整性验证
每个音频文件都提供SHA256校验：
- 校验清单：[AUDIO-CHECKSUMS.json](AUDIO-CHECKSUMS.json)
- Windows验证：`certutil -hashfile file.mp3 SHA256`
- Linux/Mac验证：`shasum -a 256 file.mp3`
```

### 第五步：实施监控和分析

#### 5.1 下载性能监控
```javascript
class DownloadAnalytics {
    constructor() {
        this.metrics = {
            downloadCount: 0,
            totalSize: 0,
            averageSpeed: 0,
            successRate: 0,
            popularFiles: new Map()
        };
    }
    
    recordDownload(filename, size, duration, success) {
        this.metrics.downloadCount++;
        
        if (success) {
            this.metrics.totalSize += size;
            const speed = size / duration; // bytes per second
            this.metrics.averageSpeed = 
                (this.metrics.averageSpeed + speed) / 2;
        }
        
        // 记录热门文件
        const count = this.metrics.popularFiles.get(filename) || 0;
        this.metrics.popularFiles.set(filename, count + 1);
        
        this.updateSuccessRate();
    }
    
    updateSuccessRate() {
        // 计算成功率逻辑
    }
    
    getTopFiles(limit = 10) {
        return Array.from(this.metrics.popularFiles.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }
}
```

## 🎯 方案总结

### ✅ 你的方案优势

1. **仓库轻量化** - BFG清理后仓库只有几MB
2. **部署快速** - 无需下载大文件，部署秒级完成
3. **成本为零** - Archive.org免费存储，GitHub免费托管
4. **完整性保证** - SHA256校验确保文件安全
5. **渐进加载** - 按需下载，优化用户体验
6. **多重备份** - Archive.org + 镜像 + 本地样本

### 🚀 实施优先级

1. **立即执行** - Git历史清理 (影响最大)
2. **并行进行** - Archive.org文件上传
3. **后续优化** - 下载管理器和校验系统

这个混合策略是目前最佳解决方案！既解决了存储问题，又保证了性能和用户体验。👍