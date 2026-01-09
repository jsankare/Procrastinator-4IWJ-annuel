import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts', 'test/**/*.spec.ts', 'test/**/*.ts'],
    testTimeout: 30_000,
  },
})

