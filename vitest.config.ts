/**
 * Vitest Configuration
 * Vitest 配置
 *
 * @version 3.0.0
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Global setup
    globalSetup: ['./src/test/setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'coverage/',
        'scripts/',
        'public/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Higher thresholds for critical modules
        'src/audio/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/stores/**': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    },

    // Test matching
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'test/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      '**/*.config.*'
    ],

    // Test timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Concurrency
    threads: true,
    maxConcurrency: 4,

    // Reporting
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './coverage/test-report.html'
    },

    // Watch mode
    watch: false,

    // Globals
    globals: true,

    // Setup files
    setupFiles: ['./src/test/setup.ts'],

    // Mocking
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,

    // Retry failed tests
    retry: 2,

    // Benchmark
    benchmark: {
      include: ['src/**/*.{bench,benchmark}.{js,ts}'],
      exclude: ['node_modules/', 'dist/']
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/stores': resolve(__dirname, 'src/stores'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/assets': resolve(__dirname, 'src/assets'),
      '@/test': resolve(__dirname, 'src/test')
    }
  },

  define: {
    // Define global constants for testing
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },

  // Optimize dependencies for testing
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'zustand',
      'vitest',
      '@vue/test-utils'
    ]
  }
})