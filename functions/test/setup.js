/**
 * Jest Test Setup Configuration
 * 
 * Global test configuration and mocks for the AI PowerPoint Generator test suite.
 * Sets up common mocks, test utilities, and environment configuration.
 * 
 * @version 1.0.0
 * @author AI PowerPoint Generator Team
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.FUNCTIONS_EMULATOR = 'true';

// Global test timeout (30 seconds for AI operations)
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Restore console for specific tests if needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock Firebase Admin SDK
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }))
    }))
  }))
}));

// Mock Firebase Functions
jest.mock('firebase-functions', () => ({
  https: {
    onRequest: jest.fn((handler) => handler)
  },
  config: jest.fn(() => ({
    openai: {
      api_key: 'test-api-key'
    }
  })),
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock fetch for external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob())
  })
);

// Test utilities
global.testUtils = {
  // Create a valid slide specification for testing
  createValidSlideSpec: (overrides = {}) => ({
    title: 'Test Slide Title',
    layout: 'title-paragraph',
    paragraph: 'This is a test paragraph with sufficient content for validation.',
    notes: 'Test speaker notes',
    sources: ['Test source 1', 'Test source 2'],
    ...overrides
  }),

  // Create valid generation parameters for testing
  createValidGenerationParams: (overrides = {}) => ({
    prompt: 'Create a test slide about quarterly business results',
    audience: 'executives',
    tone: 'professional',
    contentLength: 'moderate',
    ...overrides
  }),

  // Create a mock AI response
  createMockAIResponse: (overrides = {}) => ({
    choices: [{
      message: {
        content: JSON.stringify({
          title: 'AI Generated Test Title',
          layout: 'title-paragraph',
          paragraph: 'AI generated test content with sufficient detail.',
          notes: 'AI generated speaker notes',
          sources: ['AI source 1'],
          ...overrides
        })
      }
    }]
  }),

  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random test data
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Create test performance metrics
  createTestMetrics: () => ({
    requestId: 'test-request-123',
    endpoint: '/test',
    startTime: Date.now() - 1000,
    endTime: Date.now(),
    duration: 1000,
    success: true
  })
};

// Global test hooks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset fetch mock
  fetch.mockClear();
});

afterEach(() => {
  // Clean up any test artifacts
  jest.restoreAllMocks();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export test configuration
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [__filename],
  testTimeout: 30000
};
