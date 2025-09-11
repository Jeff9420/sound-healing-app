/**
 * 性能测试脚本 - 声音疗愈应用第三阶段优化
 * 自动化性能测试和构建质量评估
 * 目标：确保构建输出符合性能标准
 * 
 * @author Claude Code Performance Optimization - Phase 3
 * @date 2024-09-05
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PerformanceTestRunner {
    constructor() {
        this.distPath = path.resolve(__dirname, '../dist');
        this.thresholds = {
            totalBundleSize: 500 * 1024,      // 500KB
            chunkSize: 200 * 1024,            // 200KB per chunk
            cssSize: 100 * 1024,              // 100KB for CSS
            imageSize: 50 * 1024,             // 50KB per image
            chunkCount: 10                    // 最多10个chunks
        };
        
        this.results = {
            bundleSize: 0,
            chunkCount: 0,
            cssSize: 0,
            imageSize: 0,
            chunks: [],
            assets: [],
            warnings: [],
            recommendations: []
        };
    }
    
    /**
     * 运行完整性能测试
     */
    async run() {
        console.log('🧪 启动构建性能测试...\n');
        
        try {
            await this.checkDistDirectory();
            await this.analyzeBundleSize();
            await this.analyzeChunks();
            await this.analyzeAssets();
            await this.generateReport();
            
        } catch (error) {
            console.error('❌ 性能测试失败:', error);
            process.exit(1);
        }
    }
    
    /**
     * 检查构建目录
     */
    async checkDistDirectory() {
        if (!fs.existsSync(this.distPath)) {
            throw new Error('构建目录不存在，请先运行 npm run build');
        }
        
        console.log('✅ 构建目录检查通过');
    }
    
    /**
     * 分析包体积
     */
    async analyzeBundleSize() {
        console.log('📊 分析包体积...');
        
        const files = this.getAllFiles(this.distPath);
        let totalSize = 0;
        
        for (const file of files) {
            const stats = fs.statSync(file);
            totalSize += stats.size;
        }
        
        this.results.bundleSize = totalSize;
        
        console.log(`📦 总包体积: ${this.formatBytes(totalSize)}`);
        
        if (totalSize > this.thresholds.totalBundleSize) {
            this.results.warnings.push({
                type: 'bundle_size',
                message: `总包体积 ${this.formatBytes(totalSize)} 超出阈值 ${this.formatBytes(this.thresholds.totalBundleSize)}`,
                severity: 'warning'
            });
        }
    }
    
    /**
     * 分析代码块
     */
    async analyzeChunks() {
        console.log('📄 分析代码块...');
        
        const jsDir = path.join(this.distPath, 'js');
        if (!fs.existsSync(jsDir)) {
            this.results.warnings.push({
                type: 'missing_js',
                message: 'JavaScript目录不存在',
                severity: 'error'
            });
            return;
        }
        
        const jsFiles = fs.readdirSync(jsDir)
            .filter(file => file.endsWith('.js'))
            .map(file => ({
                name: file,
                path: path.join(jsDir, file),
                size: fs.statSync(path.join(jsDir, file)).size
            }));
        
        this.results.chunkCount = jsFiles.length;
        this.results.chunks = jsFiles;
        
        console.log(`📦 JavaScript文件数量: ${jsFiles.length}`);
        
        jsFiles.forEach(file => {
            console.log(`  ${file.name}: ${this.formatBytes(file.size)}`);
            
            if (file.size > this.thresholds.chunkSize) {
                this.results.warnings.push({
                    type: 'chunk_size',
                    message: `文件 ${file.name} 大小 ${this.formatBytes(file.size)} 超出阈值`,
                    severity: 'warning'
                });
            }
        });
        
        if (jsFiles.length > this.thresholds.chunkCount) {
            this.results.warnings.push({
                type: 'chunk_count',
                message: `JavaScript文件数量 ${jsFiles.length} 超出推荐值 ${this.thresholds.chunkCount}`,
                severity: 'info'
            });
        }
    }
    
    /**
     * 分析资源文件
     */
    async analyzeAssets() {
        console.log('🎨 分析资源文件...');
        
        const cssDir = path.join(this.distPath, 'css');
        const imagesDir = path.join(this.distPath, 'images');
        const audioDir = path.join(this.distPath, 'assets/audio');
        
        // 分析CSS文件
        if (fs.existsSync(cssDir)) {
            const cssFiles = fs.readdirSync(cssDir)
                .filter(file => file.endsWith('.css'));
            
            let totalCssSize = 0;
            cssFiles.forEach(file => {
                const filePath = path.join(cssDir, file);
                const size = fs.statSync(filePath).size;
                totalCssSize += size;
                
                console.log(`  CSS: ${file} - ${this.formatBytes(size)}`);
            });
            
            this.results.cssSize = totalCssSize;
            
            if (totalCssSize > this.thresholds.cssSize) {
                this.results.warnings.push({
                    type: 'css_size',
                    message: `CSS总大小 ${this.formatBytes(totalCssSize)} 超出阈值`,
                    severity: 'warning'
                });
            }
        }
        
        // 分析图片文件
        if (fs.existsSync(imagesDir)) {
            const imageFiles = fs.readdirSync(imagesDir);
            
            imageFiles.forEach(file => {
                const filePath = path.join(imagesDir, file);
                const size = fs.statSync(filePath).size;
                
                console.log(`  图片: ${file} - ${this.formatBytes(size)}`);
                
                if (size > this.thresholds.imageSize) {
                    this.results.warnings.push({
                        type: 'image_size',
                        message: `图片 ${file} 大小 ${this.formatBytes(size)} 建议优化`,
                        severity: 'info'
                    });
                }
            });
        }
        
        // 统计音频文件（仅统计，不检查大小）
        if (fs.existsSync(audioDir)) {
            const audioFiles = fs.readdirSync(audioDir);
            console.log(`🎵 音频文件数量: ${audioFiles.length}`);
        }
    }
    
    /**
     * 生成性能报告
     */
    async generateReport() {
        console.log('\n📋 生成性能报告...');
        
        // 计算性能得分
        const score = this.calculatePerformanceScore();
        
        // 生成优化建议
        this.generateRecommendations();
        
        const report = {
            timestamp: new Date().toISOString(),
            performanceScore: score,
            bundleAnalysis: {
                totalSize: this.formatBytes(this.results.bundleSize),
                chunkCount: this.results.chunkCount,
                cssSize: this.formatBytes(this.results.cssSize),
                chunks: this.results.chunks.map(chunk => ({
                    name: chunk.name,
                    size: this.formatBytes(chunk.size)
                }))
            },
            thresholds: {
                totalBundleSize: this.formatBytes(this.thresholds.totalBundleSize),
                chunkSize: this.formatBytes(this.thresholds.chunkSize),
                cssSize: this.formatBytes(this.thresholds.cssSize),
                chunkCount: this.thresholds.chunkCount
            },
            warnings: this.results.warnings,
            recommendations: this.results.recommendations
        };
        
        // 保存报告到文件
        const reportPath = path.join(this.distPath, 'performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 控制台输出摘要
        this.printSummary(report);
    }
    
    /**
     * 计算性能得分
     */
    calculatePerformanceScore() {
        let score = 100;
        
        // 包体积评分
        const sizeRatio = this.results.bundleSize / this.thresholds.totalBundleSize;
        if (sizeRatio > 1) {
            score -= Math.min(30, (sizeRatio - 1) * 50);
        }
        
        // 代码块数量评分
        if (this.results.chunkCount > this.thresholds.chunkCount) {
            score -= (this.results.chunkCount - this.thresholds.chunkCount) * 2;
        }
        
        // 警告扣分
        this.results.warnings.forEach(warning => {
            switch (warning.severity) {
                case 'error': score -= 20; break;
                case 'warning': score -= 10; break;
                case 'info': score -= 2; break;
            }
        });
        
        return Math.max(0, Math.round(score));
    }
    
    /**
     * 生成优化建议
     */
    generateRecommendations() {
        const recommendations = [];
        
        // 包体积优化建议
        if (this.results.bundleSize > this.thresholds.totalBundleSize) {
            recommendations.push({
                category: 'bundle_optimization',
                message: '考虑进一步的代码分割和Tree Shaking优化',
                priority: 'high'
            });
        }
        
        // 代码块优化建议
        const largeChunks = this.results.chunks.filter(chunk => chunk.size > this.thresholds.chunkSize);
        if (largeChunks.length > 0) {
            recommendations.push({
                category: 'chunk_optimization',
                message: `有 ${largeChunks.length} 个较大的代码块需要进一步分割`,
                priority: 'medium'
            });
        }
        
        // CSS优化建议
        if (this.results.cssSize > this.thresholds.cssSize) {
            recommendations.push({
                category: 'css_optimization',
                message: '考虑CSS代码分割和未使用样式清理',
                priority: 'medium'
            });
        }
        
        // 通用建议
        recommendations.push({
            category: 'caching',
            message: '确保启用了适当的浏览器缓存策略',
            priority: 'low'
        });
        
        recommendations.push({
            category: 'compression',
            message: '在服务器端启用Gzip/Brotli压缩',
            priority: 'low'
        });
        
        this.results.recommendations = recommendations;
    }
    
    /**
     * 打印摘要报告
     */
    printSummary(report) {
        console.log('═'.repeat(60));
        console.log('📊 构建性能报告摘要');
        console.log('═'.repeat(60));
        
        const scoreColor = report.performanceScore >= 90 ? '🟢' : 
                          report.performanceScore >= 70 ? '🟡' : '🔴';
        
        console.log(`${scoreColor} 性能得分: ${report.performanceScore}/100`);
        console.log(`📦 包体积: ${report.bundleAnalysis.totalSize}`);
        console.log(`📄 代码块数量: ${report.bundleAnalysis.chunkCount}`);
        console.log(`🎨 CSS大小: ${report.bundleAnalysis.cssSize}`);
        
        if (report.warnings.length > 0) {
            console.log(`\n⚠️  警告 (${report.warnings.length}):`);
            report.warnings.forEach(warning => {
                const icon = warning.severity === 'error' ? '❌' : 
                           warning.severity === 'warning' ? '⚠️' : 'ℹ️';
                console.log(`  ${icon} ${warning.message}`);
            });
        }
        
        if (report.recommendations.length > 0) {
            console.log(`\n💡 优化建议 (${report.recommendations.length}):`);
            report.recommendations.forEach(rec => {
                const priority = rec.priority === 'high' ? '🔴' :
                               rec.priority === 'medium' ? '🟡' : '🟢';
                console.log(`  ${priority} ${rec.message}`);
            });
        }
        
        console.log(`\n📄 详细报告已保存: dist/performance-report.json`);
        console.log('═'.repeat(60));
        
        // 根据性能得分决定退出码
        if (report.performanceScore < 70) {
            console.log('❌ 构建性能未达标，请查看优化建议');
            process.exit(1);
        } else {
            console.log('✅ 构建性能测试通过');
            process.exit(0);
        }
    }
    
    /**
     * 递归获取所有文件
     */
    getAllFiles(dirPath) {
        const files = [];
        
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory()) {
                files.push(...this.getAllFiles(itemPath));
            } else {
                files.push(itemPath);
            }
        }
        
        return files;
    }
    
    /**
     * 格式化字节数
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 运行性能测试
const testRunner = new PerformanceTestRunner();
testRunner.run();