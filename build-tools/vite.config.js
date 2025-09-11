/**
 * Vite构建配置 - 声音疗愈应用第三阶段优化
 * 现代构建工具集成：Tree Shaking + 代码分割 + 性能优化
 * 目标：包体积减少50%+，构建速度提升200%+
 * 
 * @author Claude Code Performance Optimization - Phase 3
 * @date 2024-09-05
 * @version 3.2.0
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // 基础配置
    root: '../',
    base: './',
    
    // 开发服务器配置
    server: {
        port: 3000,
        host: '0.0.0.0',
        open: true,
        cors: true,
        hmr: {
            port: 3001
        }
    },
    
    // 构建配置
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: process.env.NODE_ENV !== 'production',
        
        // 代码分割配置
        rollupOptions: {
            input: {
                main: resolve(__dirname, '../index.html')
            },
            
            output: {
                // 手动分块策略
                manualChunks: {
                    // 第三方库单独打包
                    'vendor': [],
                    
                    // 核心功能模块
                    'core': [
                        'assets/js/audio-config.js',
                        'assets/js/audio-manager.js',
                        'assets/js/ui-controller.js'
                    ],
                    
                    // 性能优化模块
                    'performance': [
                        'assets/js/audio-lazy-loader.js',
                        'assets/js/cache-manager.js',
                        'assets/js/device-performance-classifier.js',
                        'assets/js/real-time-performance-monitor.js'
                    ],
                    
                    // 智能功能模块
                    'intelligence': [
                        'assets/js/intelligent-audio-preloader.js',
                        'assets/js/ab-testing-framework.js'
                    ],
                    
                    // 视觉效果模块
                    'visual': [
                        'assets/js/visual-effects.js',
                        'assets/js/background-scene-manager.js',
                        'assets/js/theme-manager.js'
                    ],
                    
                    // 增强功能模块
                    'features': [
                        'assets/js/playlist-ui.js',
                        'assets/js/nature-ui.js',
                        'assets/js/sleep-timer.js'
                    ]
                },
                
                // 文件命名策略
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId 
                        ? chunkInfo.facadeModuleId.split('/').pop().split('.')[0] 
                        : 'chunk';
                    return `js/${facadeModuleId}-[hash].js`;
                },
                
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
                        return `images/[name]-[hash].[ext]`;
                    }
                    if (/css/i.test(ext)) {
                        return `css/[name]-[hash].[ext]`;
                    }
                    if (/mp3|wav|ogg|m4a|flac/i.test(ext)) {
                        return `audio/[name].[ext]`; // 音频文件不加哈希，保持原名
                    }
                    return `assets/[name]-[hash].[ext]`;
                }
            },
            
            // 外部依赖（如果有CDN资源）
            external: []
        },
        
        // 压缩配置
        minify: 'terser',
        terserOptions: {
            compress: {
                // 移除console.log（生产环境）
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true,
                
                // 优化选项
                dead_code: true,
                unused: true,
                collapse_vars: true,
                reduce_vars: true
            },
            mangle: {
                // 保留函数名（用于调试）
                keep_fnames: process.env.NODE_ENV !== 'production'
            },
            format: {
                // 移除注释
                comments: false
            }
        },
        
        // 构建目标
        target: ['es2020', 'chrome80', 'firefox75', 'safari13'],
        
        // 资源内联阈值（小于4KB内联）
        assetsInlineLimit: 4096,
        
        // CSS代码分割
        cssCodeSplit: true,
        
        // 生成manifest
        manifest: true,
        
        // 构建报告
        reportCompressedSize: true,
        
        // 警告阈值
        chunkSizeWarningLimit: 1000
    },
    
    // 插件配置
    plugins: [
        // Service Worker插件
        {
            name: 'service-worker-plugin',
            generateBundle(options, bundle) {
                // 确保Service Worker文件被复制
                this.emitFile({
                    type: 'asset',
                    fileName: 'sw-enhanced.js',
                    source: require('fs').readFileSync(
                        resolve(__dirname, '../sw-enhanced.js'), 
                        'utf-8'
                    )
                });
                
                this.emitFile({
                    type: 'asset',
                    fileName: 'sw.js',
                    source: require('fs').readFileSync(
                        resolve(__dirname, '../sw.js'), 
                        'utf-8'
                    )
                });
            }
        },
        
        // 资源优化插件
        {
            name: 'assets-optimization-plugin',
            generateBundle(options, bundle) {
                console.log('📦 构建输出分析:');
                
                const chunks = Object.values(bundle).filter(chunk => chunk.type === 'chunk');
                const assets = Object.values(bundle).filter(asset => asset.type === 'asset');
                
                console.log(`📄 JavaScript chunks: ${chunks.length}`);
                chunks.forEach(chunk => {
                    const sizeKB = (chunk.code.length / 1024).toFixed(2);
                    console.log(`  ${chunk.fileName}: ${sizeKB}KB`);
                });
                
                console.log(`🎨 Assets: ${assets.length}`);
                assets.forEach(asset => {
                    const sizeKB = (asset.source.length / 1024).toFixed(2);
                    console.log(`  ${asset.fileName}: ${sizeKB}KB`);
                });
            }
        }
    ],
    
    // 依赖优化
    optimizeDeps: {
        include: [],
        exclude: []
    },
    
    // CSS配置
    css: {
        // PostCSS配置
        postcss: {
            plugins: [
                // 自动添加浏览器前缀
                require('autoprefixer')({
                    overrideBrowserslist: [
                        'Chrome >= 80',
                        'Firefox >= 75',
                        'Safari >= 13',
                        'iOS >= 13',
                        'Android >= 8'
                    ]
                }),
                
                // CSS压缩（生产环境）
                ...(process.env.NODE_ENV === 'production' ? [
                    require('cssnano')({
                        preset: ['default', {
                            discardComments: { removeAll: true },
                            normalizeWhitespace: true,
                            mergeLonghand: true,
                            mergeRules: true
                        }]
                    })
                ] : [])
            ]
        },
        
        // CSS模块化
        modules: false,
        
        // CSS预处理器
        preprocessorOptions: {}
    },
    
    // 路径解析
    resolve: {
        alias: {
            '@': resolve(__dirname, '../assets'),
            '@js': resolve(__dirname, '../assets/js'),
            '@css': resolve(__dirname, '../assets/css'),
            '@audio': resolve(__dirname, '../assets/audio')
        }
    },
    
    // 环境变量
    define: {
        __DEV__: process.env.NODE_ENV !== 'production',
        __PROD__: process.env.NODE_ENV === 'production',
        __VERSION__: JSON.stringify(require('../package.json').version)
    },
    
    // 预览配置
    preview: {
        port: 4173,
        host: '0.0.0.0'
    }
});