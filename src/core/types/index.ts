/**
 * Core Application Types
 * Single source of truth for shared type definitions across the application
 */

// ============================================
// BASE TYPES
// ============================================

export type UUID = string;
export type ISODateString = string;
export type Timestamp = number;

export interface Entity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeletable extends Entity {
  deletedAt: Date | null;
  isDeleted: boolean;
}

export interface Auditable extends Entity {
  createdBy: UUID;
  updatedBy: UUID;
}

// ============================================
// PAGINATION & FILTERING
// ============================================

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOperator {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
  value: unknown;
}

export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterOperator[];
  search?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: ISODateString;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp: ISODateString;
}

// ============================================
// ASYNC STATE
// ============================================

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: ApiError | null;
}

// ============================================
// USER & AUTH TYPES
// ============================================

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer' | 'guest';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User extends Entity {
  email: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  lastLoginAt: Date | null;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  taskAssigned: boolean;
  taskMentioned: boolean;
  projectUpdates: boolean;
  weeklyDigest: boolean;
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  issuedAt: Date;
  expiresAt: Date;
}

// ============================================
// ORGANIZATION & TEAM TYPES
// ============================================

export type OrganizationPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type TeamRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Organization extends Entity {
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  plan: OrganizationPlan;
  ownerId: UUID;
  settings: OrganizationSettings;
}

export interface OrganizationSettings {
  allowGuestAccess: boolean;
  requireTwoFactor: boolean;
  defaultProjectVisibility: 'private' | 'team' | 'public';
  maxProjectsPerTeam: number;
  maxMembersPerProject: number;
}

export interface Team extends Entity {
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  organizationId: UUID;
  leadId: UUID;
  memberCount: number;
  projectCount: number;
}

export interface TeamMember {
  userId: UUID;
  teamId: UUID;
  role: TeamRole;
  joinedAt: Date;
  invitedBy: UUID;
  user?: User;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectVisibility = 'private' | 'team' | 'organization' | 'public';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project extends Auditable {
  name: string;
  key: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  iconEmoji: string;
  color: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  priority: ProjectPriority;
  teamId: UUID;
  organizationId: UUID;
  startDate: Date | null;
  targetDate: Date | null;
  completedDate: Date | null;
  progress: number;
  taskCount: number;
  completedTaskCount: number;
  memberIds: UUID[];
  tags: string[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  enableTimeTracking: boolean;
  enableEstimates: boolean;
  defaultTaskPriority: ProjectPriority;
  enableSubtasks: boolean;
  enableDependencies: boolean;
  enableCustomFields: boolean;
  workflowStages: WorkflowStage[];
}

export interface WorkflowStage {
  id: UUID;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
  isCompleted: boolean;
}

// ============================================
// PERMISSION TYPES
// ============================================

export type Permission = 
  | 'project:create'
  | 'project:read'
  | 'project:update'
  | 'project:delete'
  | 'project:manage_members'
  | 'task:create'
  | 'task:read'
  | 'task:update'
  | 'task:delete'
  | 'task:assign'
  | 'task:move'
  | 'comment:create'
  | 'comment:read'
  | 'comment:update'
  | 'comment:delete'
  | 'team:create'
  | 'team:read'
  | 'team:update'
  | 'team:delete'
  | 'team:manage_members'
  | 'settings:read'
  | 'settings:update'
  | 'billing:read'
  | 'billing:manage';

export interface RolePermissions {
  role: UserRole | TeamRole;
  permissions: Permission[];
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'task_assigned'
  | 'task_mentioned'
  | 'task_completed'
  | 'task_due_soon'
  | 'task_overdue'
  | 'comment_added'
  | 'comment_mentioned'
  | 'project_invitation'
  | 'team_invitation'
  | 'member_joined'
  | 'member_left'
  | 'system_announcement';

export interface Notification extends Entity {
  userId: UUID;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  read: boolean;
  readAt: Date | null;
  actionUrl: string | null;
  expiresAt: Date | null;
}

// ============================================
// FILE & ATTACHMENT TYPES
// ============================================

export type FileType = 'image' | 'video' | 'document' | 'archive' | 'other';

export interface FileAttachment extends Entity {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileType: FileType;
  url: string;
  thumbnailUrl: string | null;
  uploadedBy: UUID;
  entityType: 'task' | 'comment' | 'project' | 'message';
  entityId: UUID;
}

// ============================================
// ACTIVITY & AUDIT TYPES
// ============================================

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'moved'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'attached'
  | 'mentioned'
  | 'completed'
  | 'reopened';

export interface ActivityLog extends Entity {
  userId: UUID;
  action: ActivityAction;
  entityType: string;
  entityId: UUID;
  entityName: string;
  changes: PropertyChange[];
  metadata: Record<string, unknown>;
  user?: User;
}

export interface PropertyChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// ============================================
// SEARCH TYPES
// ============================================

export type SearchableEntity = 'task' | 'project' | 'user' | 'team' | 'comment' | 'file';

export interface SearchResult<T = unknown> {
  entity: SearchableEntity;
  id: UUID;
  title: string;
  subtitle: string;
  url: string;
  score: number;
  highlights: SearchHighlight[];
  data: T;
}

export interface SearchHighlight {
  field: string;
  snippet: string;
  matches: [number, number][];
}

export interface SearchQuery {
  query: string;
  entities?: SearchableEntity[];
  filters?: FilterOperator[];
  pagination?: PaginationParams;
}

// ============================================
// FORM & VALIDATION TYPES
// ============================================

export interface FormField<T = unknown> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export type ValidationRule<T = unknown> = (value: T, formValues?: Record<string, unknown>) => string | null;

export interface FieldValidation<T = unknown> {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: ValidationRule<T>[];
}

// ============================================
// UI COMPONENT TYPES
// ============================================

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success' | 'warning';
export type ColorScheme = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'info';

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Bounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

