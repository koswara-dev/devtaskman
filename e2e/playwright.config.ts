import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  globalSetup: require.resolve('./global-setup'),
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    }
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: 'http://localhost:5000/health',
      reuseExistingServer: true,
      timeout: 30_000
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000
    }
  ]
});
