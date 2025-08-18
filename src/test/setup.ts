import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase Admin
vi.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({
      toDate: vi.fn(() => date),
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
    })),
    now: vi.fn(() => ({
      toDate: vi.fn(() => new Date()),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: (Date.now() % 1000) * 1000000,
    })),
  },
}));
