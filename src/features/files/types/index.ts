/**
 * File Types
 * Types for file attachments and management
 */

import type { UUID, User, FileType } from '../../../core/types';

// ============================================
// FILE ENTITY
// ============================================

export interface File {
  id: UUID;
  name: string;
  originalName: string;
  type: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl: string | null;
  parentId: UUID | null;
  path: string;
  isFolder: boolean;
  children?: File[];
  uploaderId: UUID;
  uploadedBy: UUID;
  uploader?: User;
  downloadCount: number;
  lastAccessedAt: Date | null;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  entityType: 'task' | 'comment' | 'project' | 'message';
  entityId: UUID;
  tags: string[];
  metadata: FileMetadata;
  permissions: FilePermission[];
  versions: FileVersion[];
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
  encoding?: string;
  bitrate?: number;
  thumbnailUrl?: string;
  previewUrl?: string;
  extractedText?: string;
  [key: string]: string | number | undefined;
}

// ============================================
// FILE VERSIONS
// ============================================

export interface FileVersion {
  id: UUID;
  fileId: UUID;
  version: number;
  size: number;
  url: string;
  uploaderId: UUID;
  comment?: string;
  createdAt: Date;
}

// ============================================
// FILE PERMISSIONS
// ============================================

export type FilePermissionLevel = 'view' | 'comment' | 'edit' | 'admin';

export interface FilePermission {
  id: UUID;
  fileId: UUID;
  type: 'user' | 'team' | 'organization' | 'public';
  entityId?: UUID;
  level: FilePermissionLevel;
  expiresAt?: Date;
}

// ============================================
// FILE DTOs
// ============================================

export interface CreateFolderDTO {
  name: string;
  parentId: UUID | null;
  entityType: 'task' | 'project' | 'team' | 'user';
  entityId: UUID;
}

export interface UploadFileDTO {
  file: globalThis.File;
  parentId?: UUID | null;
  entityType: 'task' | 'project' | 'team' | 'user';
  entityId: UUID;
  tags?: string[];
}

export interface UpdateFileDTO {
  name?: string;
  parentId?: UUID | null;
  tags?: string[];
}

// ============================================
// FILE UPLOAD
// ============================================

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  bytesUploaded: number;
  totalBytes: number;
}

export interface FileUploadOptions {
  maxFileSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  extractText?: boolean;
}

// ============================================
// FILE FILTERS
// ============================================

export interface FileFilters {
  search?: string;
  types?: string[];
  tags?: string[];
  uploaderId?: UUID;
  parentId?: UUID | null;
  dateFrom?: Date;
  dateTo?: Date;
  minSize?: number;
  maxSize?: number;
}

export type FileSortBy = 'name' | 'size' | 'type' | 'createdAt' | 'updatedAt';

// ============================================
// FILE SHARE
// ============================================

export interface FileShareLink {
  id: UUID;
  fileId: UUID;
  url: string;
  expiresAt: Date | null;
  password?: string;
  maxDownloads?: number;
  downloadCount: number;
  createdAt: Date;
  createdBy: UUID;
}

export interface CreateShareLinkDTO {
  expiresAt?: Date;
  password?: string;
  maxDownloads?: number;
}

// ============================================
// FILE CONTEXT
// ============================================

export interface FileContextValue {
  files: File[];
  currentFolder: File | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: FileUploadProgress[];
  selectedFiles: UUID[];
  viewMode: 'grid' | 'list';
  
  // Navigation
  navigateToFolder: (folderId: UUID | null) => void;
  getPath: () => File[];
  
  // Actions
  loadFiles: (entityType: string, entityId: UUID, filters?: FileFilters) => Promise<void>;
  uploadFiles: (files: globalThis.File[], options?: UploadFileDTO) => Promise<File[]>;
  createFolder: (data: CreateFolderDTO) => Promise<File>;
  updateFile: (fileId: UUID, data: UpdateFileDTO) => Promise<File>;
  deleteFiles: (fileIds: UUID[]) => Promise<void>;
  moveFiles: (fileIds: UUID[], targetFolderId: UUID | null) => Promise<void>;
  copyFiles: (fileIds: UUID[], targetFolderId: UUID | null) => Promise<void>;
  downloadFile: (fileId: UUID) => Promise<void>;
  downloadFiles: (fileIds: UUID[]) => Promise<void>;
  
  // Selection
  selectFile: (fileId: UUID) => void;
  deselectFile: (fileId: UUID) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelection: (fileId: UUID) => void;
  
  // Sharing
  createShareLink: (fileId: UUID, options?: CreateShareLinkDTO) => Promise<FileShareLink>;
  deleteShareLink: (linkId: UUID) => Promise<void>;
  
  // View
  setViewMode: (mode: 'grid' | 'list') => void;
}
