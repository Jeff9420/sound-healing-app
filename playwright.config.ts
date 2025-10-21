/**
 * Playwright Configuration
 * Playwright 配置
 *
 * @version 3.0.0
 */

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Test directory
  testDir: './e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list'],
    process.env.CI ? ['github'] : ['line']
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./e2e/global-setup.ts'),

  // Use shared directory for artifacts
  outputDir: 'playwright-report',

  // Test timeout
  timeout: 30 * 1000,

  // Expect timeout
  expect: {
    timeout: 5000
  },

  // Global test configuration
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video only when retrying a test for the first time
    video: 'retain-on-failure',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Global timeout for each action
    actionTimeout: 10000,

    // Global timeout for navigation
    navigationTimeout: 30000,

    // Ignore HTTPS errors for local testing
    ignoreHTTPSErrors: !process.env.CI,

    // User agent
    userAgent: 'Sound Healing E2E Tests',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Color scheme
    colorScheme: 'dark',

    // Locale
    locale: 'en-US',

    // Timezone
    timezoneId: 'America/New_York',

    // Geolocation
    geolocation: { latitude: 37.7749, longitude: -122.4194 }, // San Francisco

    // Permissions
    permissions: ['geolocation'],

    // Reduce motion
    reducedMotion: 'reduce',

    // Media
    media: {
      reducedMotion: 'reduce',
      colorScheme: 'dark'
    }
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Test against branded browsers
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },

    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },

    // Test with different screen sizes
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'], viewport: { width: 1024, height: 768 } },
    },

    // Test with different themes
    {
      name: 'Light Theme',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'light',
        darkMode: false
      },
    },

    // Test with reduced motion
    {
      name: 'Reduced Motion',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce'
      },
    },

    // Test with high contrast
    {
      name: 'High Contrast',
      use: {
        ...devices['Desktop Chrome'],
        forcedColors: 'active'
      },
    }
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Global setup for test data
  globalSetup: async () => {
    // Setup test database, mock APIs, etc.
    console.log('🚀 Setting up E2E test environment...')
  },

  // Global teardown
  globalTeardown: async () => {
    // Cleanup test data, close database connections, etc.
    console.log('🧹 Cleaning up E2E test environment...')
  },

  // Metadata
  metadata: {
    'Test Environment': process.env.NODE_ENV || 'test',
    'Browser Versions': 'Latest stable versions',
    'Viewports': 'Desktop, Tablet, Mobile',
    'Themes': 'Light, Dark, High Contrast',
    'Accessibility': 'Reduced Motion, Screen Reader Support'
  },

  // Custom test matchers
  expect: {
    // Custom matchers for audio testing
    toBePlaying: async (element: any) => {
      const isPlaying = await element.getAttribute('data-playing')
      return isPlaying === 'true'
    },

    // Custom matchers for accessibility
    toHaveAccessibleLabel: async (element: any, label: string) => {
      const ariaLabel = await element.getAttribute('aria-label')
      const textContent = await element.textContent()
      return ariaLabel === label || textContent?.trim() === label
    },

    // Custom matchers for theme
    toHaveTheme: async (page: any, theme: string) => {
      const htmlElement = await page.locator('html')
      const dataTheme = await htmlElement.getAttribute('data-theme')
      return dataTheme === theme
    }
  },

  // Performance testing
  performance: {
    // Enable performance monitoring
    enabled: true,

    // Performance budget
    budgets: [
      {
        name: 'initial-load',
        maxTransferSize: 500 * 1024, // 500KB
        maxDuration: 3000 // 3 seconds
      },
      {
        name: 'audio-load',
        maxTransferSize: 10 * 1024 * 1024, // 10MB
        maxDuration: 5000 // 5 seconds
      }
    ]
  },

  // Monitoring and reporting
  monitor: {
    // Enable performance monitoring
    enabled: true,

    // Report performance issues
    thresholds: {
      // Response time thresholds
      responseTime: 1000,

      // Resource loading thresholds
      resourceLoading: 5000,

      // JavaScript execution thresholds
      jsExecution: 2000
    }
  },

  // CI-specific configuration
  ...(process.env.CI && {
    retries: 3,
    timeout: 60 * 1000,
    expect: {
      timeout: 10000
    },
    reporter: [
      ['html'],
      ['json'],
      ['junit'],
      ['github']
    ],
    use: {
      headless: true,
      screenshot: 'only-on-failure',
      video: 'retain-on-failure'
    }
  }),

  // Development-specific configuration
  ...(!process.env.CI && {
    reporter: [
      ['html', { open: 'never' }],
      ['line']
    ],
    use: {
      headless: false,
      screenshot: 'only-on-failure',
      video: 'off',
      trace: 'retain-on-failure'
    }
  })
})