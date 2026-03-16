import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

import '@testing-library/jest-dom';

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next-auth (server-side)
vi.mock('next-auth', () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
    auth: vi.fn(() => null),
  })),
}));

// Mock Next.js server modules
vi.mock('next/server', () => ({
  NextRequest: class NextRequest { },
  NextResponse: {
    json: vi.fn(() => ({ status: 200 })),
    redirect: vi.fn(() => ({ status: 302 })),
  },
}));

// Mock Prisma client
vi.mock('@/generated/prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    // Add common Prisma methods
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    // Add specific models that might be used
    settings: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    knowledgeVector: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    vectorSearchLog: {
      create: vi.fn(),
    },
    backupRecord: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  })),
}));

// Mock pg Pool
vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    connect: vi.fn(),
    end: vi.fn(),
  })),
}));

// Mock @prisma/adapter-pg
vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn(() => ({})),
}));

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    // Add common Prisma methods
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    // Add specific models
    settings: {
      findUnique: vi.fn(() => Promise.resolve(null)),
      findMany: vi.fn(() => Promise.resolve([])),
      create: vi.fn(),
      update: vi.fn(),
    },
    knowledgeVector: {
      findMany: vi.fn(() => Promise.resolve([
        {
          id: 'test-vector-1',
          knowledgeId: 'test-knowledge-1',
          content: 'This is test content for vector search',
          embedding: JSON.stringify([0.1, 0.2, 0.3]),
          model: 'test-model',
          dimension: 3,
          chunkIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ])),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    vectorSearchLog: {
      create: vi.fn(),
    },
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock child_process for backup service
vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    on: vi.fn(),
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
  })),
  exec: vi.fn(),
  execSync: vi.fn(),
  default: {
    spawn: vi.fn(() => ({
      on: vi.fn(),
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
    })),
    exec: vi.fn(),
    execSync: vi.fn(),
  },
}));

// Mock RAG feature flag
vi.mock('@/lib/ai/rag-feature-flag', () => ({
  isRagEnabled: vi.fn(() => Promise.resolve(false)), // Default to disabled
}));

// Setup global test environment
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};
