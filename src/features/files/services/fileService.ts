/**
 * File Service
 * Handles file uploads, downloads, and management
 */

import type { UUID } from '../../../core/types';
import { api } from '../../../core/api';
import { generateUUID } from '../../../core/utils/id';
import type {
  File,
  FileFilters,
  FileSortBy,
  UploadFileDTO,
  CreateFolderDTO,
  UpdateFileDTO,
  FileShareLink,
  CreateShareLinkDTO,
  FileUploadProgress,
} from '../types';

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

function createMockFile(overrides: Partial<File>): File {
  const now = new Date();
  return {
    id: generateUUID(),
    name: 'file',
    originalName: 'file',
    type: 'file',
    fileType: 'other',
    mimeType: 'application/octet-stream',
    size: 0,
    url: '',
    thumbnailUrl: null,
    parentId: null,
    path: '/',
    isFolder: false,
    uploaderId: 'user_001',
    uploadedBy: 'user_001',
    downloadCount: 0,
    lastAccessedAt: null,
    uploadedAt: now,
    createdAt: now,
    updatedAt: now,
    entityType: 'project',
    entityId: 'proj_001',
    tags: [],
    metadata: {},
    permissions: [],
    versions: [],
    ...overrides,
  };
}

const MOCK_FILES: File[] = [
  createMockFile({
    id: 'file_001',
    name: 'Design Mockups',
    originalName: 'Design Mockups',
    type: 'folder',
    fileType: 'other',
    mimeType: 'folder',
    path: '/Design Mockups',
    isFolder: true,
    tags: ['design'],
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  }),
  createMockFile({
    id: 'file_002',
    name: 'requirements.pdf',
    originalName: 'requirements.pdf',
    type: 'pdf',
    fileType: 'document',
    mimeType: 'application/pdf',
    size: 2456789,
    url: '/files/requirements.pdf',
    thumbnailUrl: '/thumbnails/requirements.png',
    path: '/requirements.pdf',
    downloadCount: 15,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    tags: ['documentation', 'requirements'],
    metadata: {
      pages: 24,
      thumbnailUrl: '/thumbnails/requirements.png',
    },
    versions: [
      {
        id: 'version_001',
        fileId: 'file_002',
        version: 1,
        size: 2456789,
        url: '/files/requirements.pdf',
        uploaderId: 'user_001',
        comment: 'Initial upload',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      },
    ],
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  }),
  createMockFile({
    id: 'file_003',
    name: 'screenshot.png',
    originalName: 'screenshot.png',
    type: 'image',
    fileType: 'image',
    mimeType: 'image/png',
    size: 524288,
    url: '/files/screenshot.png',
    thumbnailUrl: '/thumbnails/screenshot_thumb.png',
    parentId: 'file_001',
    path: '/Design Mockups/screenshot.png',
    uploaderId: 'user_002',
    uploadedBy: 'user_002',
    downloadCount: 8,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 30),
    tags: ['screenshot', 'ui'],
    metadata: {
      width: 1920,
      height: 1080,
      thumbnailUrl: '/thumbnails/screenshot_thumb.png',
    },
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  }),
  createMockFile({
    id: 'file_004',
    name: 'meeting-notes.md',
    originalName: 'meeting-notes.md',
    type: 'markdown',
    fileType: 'document',
    mimeType: 'text/markdown',
    size: 8192,
    url: '/files/meeting-notes.md',
    path: '/meeting-notes.md',
    downloadCount: 3,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60),
    tags: ['meeting', 'notes'],
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  }),
  createMockFile({
    id: 'file_005',
    name: 'data-export.csv',
    originalName: 'data-export.csv',
    type: 'csv',
    fileType: 'document',
    mimeType: 'text/csv',
    size: 1048576,
    url: '/files/data-export.csv',
    path: '/data-export.csv',
    uploaderId: 'user_003',
    uploadedBy: 'user_003',
    downloadCount: 22,
    lastAccessedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    tags: ['data', 'export'],
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  }),
];

// ============================================
// FILE SERVICE
// ============================================

class FileService {
  private uploadListeners: Map<string, (progress: FileUploadProgress) => void> = new Map();

  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get files for an entity
   */
  async getFiles(
    entityType: string,
    entityId: UUID,
    filters?: FileFilters,
    sortBy: FileSortBy = 'createdAt',
    parentId: UUID | null = null
  ): Promise<File[]> {
    if (USE_MOCK) {
      await this.mockDelay();

      let files = MOCK_FILES.filter((f) => f.parentId === parentId);

      if (filters) {
        if (filters.search) {
          const search = filters.search.toLowerCase();
          files = files.filter((f) => f.name.toLowerCase().includes(search));
        }
        if (filters.types?.length) {
          files = files.filter((f) => filters.types!.includes(f.type));
        }
        if (filters.tags?.length) {
          files = files.filter((f) =>
            filters.tags!.some((tag) => f.tags.includes(tag))
          );
        }
      }

      // Sort
      files.sort((a, b) => {
        // Folders first
        if (a.isFolder !== b.isFolder) {
          return a.isFolder ? -1 : 1;
        }

        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'size':
            return b.size - a.size;
          case 'type':
            return (a.type || '').localeCompare(b.type || '');
          case 'updatedAt':
            return b.uploadedAt.getTime() - a.uploadedAt.getTime();
          default:
            return b.uploadedAt.getTime() - a.uploadedAt.getTime();
        }
      });

      return files;
    }

    const response = await api.get<File[]>('/files', {
      params: { entityType, entityId, ...filters, sortBy, parentId } as Record<string, unknown>,
    });
    return response.data;
  }

  /**
   * Get file by ID
   */
  async getFile(fileId: UUID): Promise<File> {
    if (USE_MOCK) {
      await this.mockDelay();
      const file = MOCK_FILES.find((f) => f.id === fileId);
      if (!file) {
        throw new Error('File not found');
      }
      return file;
    }

    const response = await api.get<File>(`/files/${fileId}`);
    return response.data;
  }

  /**
   * Upload files
   */
  async uploadFiles(data: UploadFileDTO): Promise<File> {
    if (USE_MOCK) {
      const uploadId = generateUUID();

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await this.mockDelay(200);
        this.notifyProgress({
          fileId: uploadId,
          fileName: data.file.name,
          progress,
          status: progress < 100 ? 'uploading' : 'processing',
          bytesUploaded: (progress / 100) * data.file.size,
          totalBytes: data.file.size,
        });
      }

      const now = new Date();
      const newFile: File = createMockFile({
        id: generateUUID(),
        name: data.file.name,
        originalName: data.file.name,
        type: this.getFileType(data.file.type),
        fileType: this.getFileTypeCategory(data.file.type),
        mimeType: data.file.type,
        size: data.file.size,
        url: `/files/${data.file.name}`,
        parentId: data.parentId || null,
        path: `/${data.file.name}`,
        tags: data.tags || [],
        entityType: data.entityType as 'task' | 'comment' | 'project' | 'message',
        entityId: data.entityId,
        uploadedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      MOCK_FILES.push(newFile);

      this.notifyProgress({
        fileId: uploadId,
        fileName: data.file.name,
        progress: 100,
        status: 'completed',
        bytesUploaded: data.file.size,
        totalBytes: data.file.size,
      });

      return newFile;
    }

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('entityType', data.entityType);
    formData.append('entityId', data.entityId);
    if (data.parentId) formData.append('parentId', data.parentId);
    if (data.tags) formData.append('tags', JSON.stringify(data.tags));

    const response = await api.post<File>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  }

  /**
   * Create folder
   */
  async createFolder(data: CreateFolderDTO): Promise<File> {
    if (USE_MOCK) {
      await this.mockDelay();

      const now = new Date();
      const folder: File = createMockFile({
        id: generateUUID(),
        name: data.name,
        originalName: data.name,
        type: 'folder',
        fileType: 'other',
        mimeType: 'folder',
        parentId: data.parentId,
        path: `/${data.name}`,
        isFolder: true,
        entityType: data.entityType as 'task' | 'comment' | 'project' | 'message',
        entityId: data.entityId,
        uploadedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      MOCK_FILES.push(folder);
      return folder;
    }

    const response = await api.post<File>('/files/folders', data);
    return response.data;
  }

  /**
   * Update file
   */
  async updateFile(fileId: UUID, data: UpdateFileDTO): Promise<File> {
    if (USE_MOCK) {
      await this.mockDelay();

      const index = MOCK_FILES.findIndex((f) => f.id === fileId);
      if (index === -1) {
        throw new Error('File not found');
      }

      MOCK_FILES[index] = {
        ...MOCK_FILES[index],
        ...data,
        updatedAt: new Date(),
      };

      return MOCK_FILES[index];
    }

    const response = await api.patch<File>(`/files/${fileId}`, data);
    return response.data;
  }

  /**
   * Delete files
   */
  async deleteFiles(fileIds: UUID[]): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      fileIds.forEach((id) => {
        const index = MOCK_FILES.findIndex((f) => f.id === id);
        if (index !== -1) {
          MOCK_FILES.splice(index, 1);
        }
      });
      return;
    }

    await api.delete('/files', { data: { fileIds } });
  }

  /**
   * Move files
   */
  async moveFiles(fileIds: UUID[], targetFolderId: UUID | null): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      fileIds.forEach((id) => {
        const file = MOCK_FILES.find((f) => f.id === id);
        if (file) {
          file.parentId = targetFolderId;
        }
      });
      return;
    }

    await api.post('/files/move', { fileIds, targetFolderId });
  }

  /**
   * Copy files
   */
  async copyFiles(fileIds: UUID[], targetFolderId: UUID | null): Promise<File[]> {
    if (USE_MOCK) {
      await this.mockDelay();

      const copies: File[] = [];
      fileIds.forEach((id) => {
        const original = MOCK_FILES.find((f) => f.id === id);
        if (original) {
          const now = new Date();
          const copy: File = {
            ...original,
            id: generateUUID(),
            name: `${original.name} (Copy)`,
            parentId: targetFolderId,
            uploadedAt: now,
            createdAt: now,
            updatedAt: now,
          };
          MOCK_FILES.push(copy);
          copies.push(copy);
        }
      });

      return copies;
    }

    const response = await api.post<File[]>('/files/copy', {
      fileIds,
      targetFolderId,
    });
    return response.data;
  }

  /**
   * Download file
   */
  async downloadFile(fileId: UUID): Promise<Blob> {
    if (USE_MOCK) {
      await this.mockDelay();
      // Return empty blob for mock
      return new Blob();
    }

    const response = await api.get<Blob>(`/files/${fileId}/download`);
    return response.data;
  }

  /**
   * Create share link
   */
  async createShareLink(
    fileId: UUID,
    options?: CreateShareLinkDTO
  ): Promise<FileShareLink> {
    if (USE_MOCK) {
      await this.mockDelay();

      return {
        id: generateUUID(),
        fileId,
        url: `https://app.example.com/share/${generateUUID()}`,
        expiresAt: options?.expiresAt || null,
        password: options?.password,
        maxDownloads: options?.maxDownloads,
        downloadCount: 0,
        createdAt: new Date(),
        createdBy: 'user_001',
      };
    }

    const response = await api.post<FileShareLink>(
      `/files/${fileId}/share`,
      options
    );
    return response.data;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(): Promise<{ used: number; total: number }> {
    if (USE_MOCK) {
      await this.mockDelay();
      const used = MOCK_FILES.reduce((acc, f) => acc + f.size, 0);
      return { used, total: 10 * 1024 * 1024 * 1024 }; // 10GB
    }

    const response = await api.get<{ used: number; total: number }>(
      '/files/storage'
    );
    return response.data;
  }

  /**
   * Get file type from mime type
   */
  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('document') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    if (mimeType.includes('text')) return 'text';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    return 'file';
  }

  /**
   * Get file type category for FileType
   */
  private getFileTypeCategory(mimeType: string): 'image' | 'video' | 'document' | 'archive' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return 'archive';
    return 'other';
  }

  /**
   * Subscribe to upload progress
   */
  onUploadProgress(
    fileId: string,
    callback: (progress: FileUploadProgress) => void
  ): () => void {
    this.uploadListeners.set(fileId, callback);
    return () => this.uploadListeners.delete(fileId);
  }

  /**
   * Notify upload progress
   */
  private notifyProgress(progress: FileUploadProgress): void {
    const listener = this.uploadListeners.get(progress.fileId);
    if (listener) {
      listener(progress);
    }
  }
}

export const fileService = new FileService();
