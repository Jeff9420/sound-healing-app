/**
 * ESLint配置 - 声音疗愈应用第三阶段优化
 * 代码质量和性能优化规则
 * 
 * @author Claude Code Performance Optimization - Phase 3
 * @date 2024-09-05
 */

module.exports = {
    env: {
        browser: true,
        es2020: true,
        node: true
    },
    
    extends: [
        'eslint:recommended'
    ],
    
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    
    globals: {
        // 全局变量声明
        'window': 'readonly',
        'document': 'readonly',
        'localStorage': 'readonly',
        'performance': 'readonly',
        'navigator': 'readonly',
        'console': 'readonly',
        'requestAnimationFrame': 'readonly',
        'cancelAnimationFrame': 'readonly',
        'setTimeout': 'readonly',
        'clearTimeout': 'readonly',
        'setInterval': 'readonly',
        'clearInterval': 'readonly'
    },
    
    rules: {
        // 错误预防
        'no-unused-vars': ['error', { 
            'varsIgnorePattern': '^_',
            'argsIgnorePattern': '^_'
        }],
        'no-undef': 'error',
        'no-redeclare': 'error',
        'no-dupe-keys': 'error',
        'no-unreachable': 'error',
        
        // 性能优化相关
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        
        // 代码风格
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'never'],
        'no-trailing-spaces': 'error',
        'eol-last': 'error',
        
        // 最佳实践
        'eqeqeq': 'error',
        'curly': 'error',
        'no-alert': 'warn',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        
        // 内存泄漏预防
        'no-global-assign': 'error',
        'no-implicit-globals': 'error',
        
        // 异步处理
        'no-async-promise-executor': 'error',
        'no-await-in-loop': 'warn',
        'prefer-promise-reject-errors': 'error',
        
        // 现代JavaScript特性
        'arrow-spacing': 'error',
        'template-curly-spacing': 'error',
        'object-shorthand': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-template': 'error',
        
        // 可读性
        'max-len': ['warn', { 
            'code': 120,
            'ignoreComments': true,
            'ignoreStrings': true,
            'ignoreTemplateLiterals': true
        }],
        'max-depth': ['warn', 4],
        'complexity': ['warn', 10]
    },
    
    overrides: [
        // Service Worker特殊规则
        {
            files: ['sw*.js'],
            globals: {
                'self': 'readonly',
                'caches': 'readonly',
                'fetch': 'readonly',
                'importScripts': 'readonly'
            },
            rules: {
                'no-restricted-globals': 'off'
            }
        },
        
        // 配置文件特殊规则
        {
            files: ['vite.config.js', 'eslint.config.js', '*.config.js'],
            env: {
                node: true
            },
            rules: {
                'no-console': 'off'
            }
        }
    ]
};