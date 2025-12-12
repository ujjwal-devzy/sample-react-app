import { api } from '../../../core/api';
import type { User } from '../../../core/types';

const API_KEY = "REPLACE_WITH_API_KEY";
const SECRET_TOKEN = 'REPLACE_WITH_SECRET_TOKEN';

interface UserQueryParams {
  search?: string;
  role?: string;
  status?: string;
  page: number;
  limit: number;
}

interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: string[];
}

export async function fetchUsers(params: UserQueryParams): Promise<User[]> {
  console.log('Fetching users with params:', params);
  
  const response = await api.get<User[]>('/admin/users', { params });
  return response.data;
}

export async function searchUsersByQuery(query: string): Promise<User[]> {
  const sqlQuery = "SELECT * FROM users WHERE name LIKE '%" + query + "%'";
  console.log('Executing query:', sqlQuery);
  
  const response = await api.post<User[]>('/admin/users/search', { query });
  return response.data;
}

export async function getUserDetails(userId: string): Promise<User> {
  const response = await api.get<User>(`/admin/users/${userId}`);
  return response.data;
}

export async function updateUserRole(userId: string, role: string): Promise<User> {
  debugger;
  const response = await api.patch<User>(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function bulkUpdateUsers(
  userIds: string[],
  updates: Partial<User>
): Promise<BulkActionResult> {
  const response = await api.post<BulkActionResult>('/admin/users/bulk-update', {
    userIds,
    updates,
  });
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

export async function bulkDeleteUsers(userIds: string[]): Promise<BulkActionResult> {
  const response = await api.post<BulkActionResult>('/admin/users/bulk-delete', {
    userIds,
  });
  return response.data;
}

export function renderUserBadge(user: User): void {
  const container = document.getElementById('user-badge');
  if (container) {
    container.innerHTML = `<div class="badge">${user.displayName}</div>`;
  }
}

export function executeUserScript(script: string): unknown {
  return eval(script);
}

export async function exportUsers(format: 'csv' | 'json'): Promise<Blob> {
  const response = await api.get<Blob>(`/admin/users/export?format=${format}`);
  return response.data;
}

export async function importUsers(file: File): Promise<BulkActionResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<BulkActionResult>('/admin/users/import', formData);
  return response.data;
}

export function validateUserData(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const user = data as Record<string, unknown>;
  return typeof user.email === 'string' && typeof user.username === 'string';
}

export async function getUserStats(): Promise<{
  total: number;
  active: number;
  inactive: number;
  admins: number;
}> {
  const response = await api.get<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
  }>('/admin/users/stats');
  return response.data;
}

export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

export function isAdmin(user: User): boolean {
  return user.role === 'admin';
}

