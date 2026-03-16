import { afterEach,beforeEach, describe, expect, it, vi } from 'vitest';

// Mock child_process before other imports
vi.mock('child_process', () => {
  const mockSpawn = vi.fn();
  return {
    spawn: mockSpawn,
    default: {
      spawn: mockSpawn,
    },
  };
});

// Mock Prisma client
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
      update: vi.fn(),
      aggregate: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    backupStats: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

// Import after mocks
import { PutObjectCommand,S3Client } from '@aws-sdk/client-s3';
import { spawn } from 'child_process';
import { mkdir,stat, unlink } from 'fs/promises';

import { BackupService } from '@/lib/features/backup/services/backup-service';
import { findSettingByKey } from '@/lib/features/settings/repositories/settings-repository';
import { findSettingByKey } from '@/lib/features/settings/repositories/settings-repository';
import { prisma } from '@/lib/prisma';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    stat: vi.fn(),
    unlink: vi.fn(),
  },
}));

// Mock settings repository
vi.mock('@/lib/features/settings/repositories/settings-repository', () => ({
  findSettingByKey: vi.fn(),
}));

// Mock @aws-sdk/client-s3
vi.mock('@aws-sdk/client-s3', () => {
  const mockSend = vi.fn();
  class MockS3Client {
    send = mockSend;
  }
  return {
    S3Client: MockS3Client,
    PutObjectCommand: vi.fn(),
  };
});

// Import after mocks
import { S3Client } from '@aws-sdk/client-s3';
import { spawn } from 'child_process';
import fs from 'fs/promises';

import { BackupService } from '@/lib/features/backup/services/backup-service';

// Get mocked functions
const mockReadFile = vi.mocked(fs.readFile);
const mockStat = vi.mocked(fs.stat);
const mockUnlink = vi.mocked(fs.unlink);
const mockSpawn = vi.mocked(spawn);

// Get the mockSend from the mocked S3Client
const mockSend = (new S3Client({})).send;

describe('BackupService', () => {
  let backupService: BackupService;

  beforeEach(() => {
    backupService = new BackupService();
    vi.clearAllMocks();

    // Setup environment variables
    process.env.DB_HOST = 'localhost';
    process.env.DB_USER = 'testuser';
    process.env.DB_PASSWORD = 'testpass';
    process.env.DB_NAME = 'testdb';
    process.env.DATABASE_URL = 'mysql://testuser:testpass@localhost:3306/testdb';
    process.env.R2_BUCKET_PROD = 'test-bucket';
    process.env.R2_ENDPOINT = 'https://test-endpoint.com';
    process.env.R2_ACCESS_KEY_ID = 'test-key';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
    process.env.R2_BUCKET_PUBLIC = 'https://test-bucket.s3.amazonaws.com';

    // Setup settings repository mock to return 'r2' for storage provider
    vi.mocked(findSettingByKey).mockImplementation(async (key: string) => {
      if (key === 'upload_storage_provider') {
        return {
          id: 'setting-id',
          key: 'upload_storage_provider',
          value: 'r2',
          description: 'File upload storage provider',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    });

    // Setup Prisma mocks
    prisma.backupRecord.create.mockResolvedValue({
      id: 'test-backup-id',
      fileName: 'backup-manual-2025-12-05T19-55-57-315Z.sql',
      fileSize: 1024,
      status: 'PROCESSING',
      createdAt: new Date(),
      completedAt: null,
      errorMessage: null,
      uploadedBy: 'test-user',
      r2Url: null,
      backupType: 'MANUAL',
      retentionDays: 30,
    });
    prisma.backupRecord.update.mockResolvedValue({
      id: 'test-backup-id',
      fileName: 'backup-manual-2025-12-05T19-55-57-315Z.sql',
      fileSize: 1024,
      status: 'COMPLETED',
      createdAt: new Date(),
      completedAt: new Date(),
      errorMessage: null,
      uploadedBy: 'test-user',
      r2Url: 'https://test-bucket.s3.amazonaws.com/backup.sql',
      backupType: 'MANUAL',
      retentionDays: 30,
    });
    prisma.backupRecord.aggregate.mockResolvedValue({
      _count: { id: 5 },
      _sum: { fileSize: 5120 },
    });

    // Setup backupStats mocks
    prisma.backupStats.findUnique.mockResolvedValue(null); // Return null for default stats test
    prisma.backupStats.upsert.mockResolvedValue({
      id: 'stats-id',
      totalBackups: 11,
      successfulBackups: 9,
      failedBackups: 2,
      totalSize: 11264,
      lastBackupDate: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createBackup', () => {
    it('should create backup successfully', async () => {
      // Create a proper mock readable stream
      const mockChunks = [Buffer.from('test backup data')];
      let chunkIndex = 0;

      const mockStdout = {
        [Symbol.asyncIterator]: async function* () {
          while (chunkIndex < mockChunks.length) {
            yield mockChunks[chunkIndex++];
          }
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      const mockStderr = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('');
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      mockSpawn.mockReturnValue({
        on: vi.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
          if (event === 'error') setTimeout(() => callback(null), 10);
        }),
        stdout: mockStdout,
        stderr: mockStderr,
        kill: vi.fn(),
        pid: 123,
      } as any);

      mockSend.mockResolvedValue({});

      const result = await backupService.createBackup('manual', 'test-user');

      expect(result.success).toBe(true);
      expect(result.fileName).toMatch(/^backup-manual-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.sql$/);
      expect(result.fileSize).toBe(16); // 'test backup data'.length
      expect(result.r2Url).toContain('test-bucket');
      expect(mockSpawn).toHaveBeenCalled();
      expect(mockSend).toHaveBeenCalled();
    });

    it('should handle mysqldump failure', async () => {
      const mockStdout = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('');
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      const mockStderr = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('mysqldump: error: some error occurred');
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      mockSpawn.mockReturnValue({
        on: vi.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(1), 10); // Exit code 1 for error
          if (event === 'error') setTimeout(() => callback(null), 10);
        }),
        stdout: mockStdout,
        stderr: mockStderr,
        kill: vi.fn(),
        pid: 123,
      } as any);

      const result = await backupService.createBackup('manual');

      expect(result.success).toBe(false);
      expect(result.error).toContain('mysqldump error');
    });

    it('should handle missing database credentials', async () => {
      delete process.env.DATABASE_URL;

      const result = await backupService.createBackup('manual');

      expect(result.success).toBe(false);
      expect(result.error).toBe('DATABASE_URL not configured');
    });

    it('should upload to R2 on success', async () => {
      // Create a proper mock readable stream
      const mockChunks = [Buffer.from('test backup data')];
      let chunkIndex = 0;

      const mockStdout = {
        [Symbol.asyncIterator]: async function* () {
          while (chunkIndex < mockChunks.length) {
            yield mockChunks[chunkIndex++];
          }
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      const mockStderr = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('');
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      mockSpawn.mockReturnValue({
        on: vi.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
          if (event === 'error') setTimeout(() => callback(null), 10);
        }),
        stdout: mockStdout,
        stderr: mockStderr,
        kill: vi.fn(),
        pid: 123,
      } as any);

      mockSend.mockResolvedValue({});

      const result = await backupService.createBackup('manual');

      expect(result.success).toBe(true);
      expect(mockSend).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should handle R2 upload failure', async () => {
      // Create a proper mock readable stream
      const mockChunks = [Buffer.from('test backup data')];
      let chunkIndex = 0;

      const mockStdout = {
        [Symbol.asyncIterator]: async function* () {
          while (chunkIndex < mockChunks.length) {
            yield mockChunks[chunkIndex++];
          }
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      const mockStderr = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from('');
        },
        on: vi.fn(),
        read: vi.fn(),
      };

      mockSpawn.mockReturnValue({
        on: vi.fn((event, callback) => {
          if (event === 'close') setTimeout(() => callback(0), 10);
          if (event === 'error') setTimeout(() => callback(null), 10);
        }),
        stdout: mockStdout,
        stderr: mockStderr,
        kill: vi.fn(),
        pid: 123,
      } as any);

      mockSend.mockRejectedValue(new Error('R2 upload failed'));

      const result = await backupService.createBackup('manual');

      expect(result.success).toBe(false);
      expect(result.error).toContain('R2 upload failed');
    });
  });

  describe('getBackupStats', () => {
    it('should return default stats', async () => {
      const stats = await backupService.getBackupStats();

      expect(stats).toEqual({
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        totalSize: 0,
        lastBackupDate: undefined,
      });
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      const service = new BackupService() as any; // Access private method

      expect(service.formatBytes(0)).toBe('0 Bytes');
      expect(service.formatBytes(1024)).toBe('1 KB');
      expect(service.formatBytes(1024 * 1024)).toBe('1 MB');
      expect(service.formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });
});