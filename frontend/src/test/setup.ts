/**
 * Test setup file for Vitest
 */

import { expect, afterEach, vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

