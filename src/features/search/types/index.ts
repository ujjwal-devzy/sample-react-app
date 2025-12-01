/**
 * Search Types
 * Types for the global search feature
 */

import type { UUID } from '../../../core/types';

// ============================================
// SEARCH ENTITY TYPES
// ============================================

export type SearchEntityType = 'task' | 'project' | 'team' | 'user' | 'comment' | 'file';

export interface SearchResult {
  id: UUID;
  entityType: SearchEntityType;
  title: string;
  description?: string;
  url: string;
  metadata: SearchResultMetadata;
  highlights: SearchHighlight[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchResultMetadata {
  [key: string]: string | number | boolean | undefined;
  status?: string;
  priority?: string;
  assignee?: string;
  projectName?: string;
  teamName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface SearchHighlight {
  field: string;
  snippet: string;
  matchedTerms: string[];
}

// ============================================
// SEARCH FILTERS
// ============================================

export interface SearchFilters {
  entityTypes?: SearchEntityType[];
  projectId?: UUID;
  teamId?: UUID;
  assigneeId?: UUID;
  status?: string[];
  priority?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  hasAttachments?: boolean;
}

// ============================================
// SEARCH QUERY
// ============================================

export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  sortBy?: SearchSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type SearchSortBy = 'relevance' | 'newest' | 'oldest' | 'title';

// ============================================
// SEARCH RESPONSE
// ============================================

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: SearchFacets;
  searchTime: number;
}

export interface SearchFacets {
  entityTypes: FacetCount[];
  projects: FacetCount[];
  teams: FacetCount[];
  statuses: FacetCount[];
  priorities: FacetCount[];
}

export interface FacetCount {
  value: string;
  label: string;
  count: number;
}

// ============================================
// SEARCH HISTORY
// ============================================

export interface SearchHistoryItem {
  id: UUID;
  query: string;
  filters?: SearchFilters;
  timestamp: Date;
  resultCount: number;
}

// ============================================
// SEARCH SUGGESTIONS
// ============================================

export interface SearchSuggestion {
  type: 'recent' | 'popular' | 'completion';
  text: string;
  entityType?: SearchEntityType;
  metadata?: Record<string, string>;
}

// ============================================
// SAVED SEARCHES
// ============================================

export interface SavedSearch {
  id: UUID;
  name: string;
  query: string;
  filters?: SearchFilters;
  userId: UUID;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SEARCH CONTEXT
// ============================================

export interface SearchContextValue {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  error: string | null;
  filters: SearchFilters;
  facets: SearchFacets | null;
  totalResults: number;
  hasMore: boolean;
  
  // Actions
  search: (query: string, filters?: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilters: (filters: SearchFilters) => void;
  clearSearch: () => void;
  
  // History
  searchHistory: SearchHistoryItem[];
  clearHistory: () => void;
  
  // Saved searches
  savedSearches: SavedSearch[];
  saveSearch: (name: string) => Promise<void>;
  deleteSavedSearch: (id: UUID) => Promise<void>;
}

