/**
 * Search Service
 * Handles global search across all entities
 */

import type { UUID } from '../../../core/types';
import { api } from '../../../core/api';
import { generateUUID } from '../../../core/utils/id';
import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchFilters,
  SearchHistoryItem,
  SavedSearch,
  SearchSuggestion,
  SearchEntityType,
} from '../types';

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

const MOCK_RESULTS: SearchResult[] = [
  {
    id: 'task_001',
    entityType: 'task',
    title: 'Implement user authentication',
    description: 'Set up JWT-based authentication with refresh tokens',
    url: '/tasks/task_001',
    metadata: {
      status: 'in_progress',
      priority: 'high',
      assignee: 'John Doe',
      projectName: 'Main App',
    },
    highlights: [
      {
        field: 'title',
        snippet: 'Implement <mark>user</mark> <mark>authentication</mark>',
        matchedTerms: ['user', 'authentication'],
      },
    ],
    score: 0.95,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'project_001',
    entityType: 'project',
    title: 'Main App',
    description: 'Primary application with authentication and dashboard features',
    url: '/projects/project_001',
    metadata: {
      status: 'active',
      teamName: 'Engineering',
    },
    highlights: [
      {
        field: 'description',
        snippet: '...with <mark>authentication</mark> and dashboard features',
        matchedTerms: ['authentication'],
      },
    ],
    score: 0.82,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: 'task_002',
    entityType: 'task',
    title: 'Design login page UI',
    description: 'Create responsive login page with form validation',
    url: '/tasks/task_002',
    metadata: {
      status: 'done',
      priority: 'medium',
      assignee: 'Jane Smith',
      projectName: 'Main App',
    },
    highlights: [
      {
        field: 'title',
        snippet: 'Design <mark>login</mark> page UI',
        matchedTerms: ['login'],
      },
    ],
    score: 0.78,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: 'user_001',
    entityType: 'user',
    title: 'John Doe',
    description: 'john.doe@company.com',
    url: '/users/user_001',
    metadata: {
      teamName: 'Engineering',
    },
    highlights: [
      {
        field: 'title',
        snippet: '<mark>John</mark> Doe',
        matchedTerms: ['john'],
      },
    ],
    score: 0.65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: 'team_001',
    entityType: 'team',
    title: 'Engineering',
    description: 'Core engineering team responsible for product development',
    url: '/teams/team_001',
    metadata: {},
    highlights: [
      {
        field: 'description',
        snippet: 'Core <mark>engineering</mark> team...',
        matchedTerms: ['engineering'],
      },
    ],
    score: 0.55,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
];

// ============================================
// SEARCH SERVICE
// ============================================

class SearchService {
  private searchHistory: SearchHistoryItem[] = [];
  private savedSearches: SavedSearch[] = [];

  private mockDelay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Perform a global search
   */
  async search(searchQuery: SearchQuery): Promise<SearchResponse> {
    if (USE_MOCK) {
      await this.mockDelay();

      let results = [...MOCK_RESULTS];
      const query = searchQuery.query.toLowerCase();

      // Filter by query
      if (query) {
        results = results.filter(
          (r) =>
            r.title.toLowerCase().includes(query) ||
            r.description?.toLowerCase().includes(query)
        );
      }

      // Filter by entity types
      if (searchQuery.filters?.entityTypes?.length) {
        results = results.filter((r) =>
          searchQuery.filters!.entityTypes!.includes(r.entityType)
        );
      }

      // Sort
      if (searchQuery.sortBy === 'newest') {
        results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      } else if (searchQuery.sortBy === 'oldest') {
        results.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
      } else if (searchQuery.sortBy === 'title') {
        results.sort((a, b) => a.title.localeCompare(b.title));
      } else {
        results.sort((a, b) => b.score - a.score);
      }

      // Pagination
      const page = searchQuery.page || 1;
      const limit = searchQuery.limit || 20;
      const start = (page - 1) * limit;
      const paginatedResults = results.slice(start, start + limit);

      // Add to history
      if (query) {
        this.addToHistory(query, searchQuery.filters, results.length);
      }

      return {
        results: paginatedResults,
        total: results.length,
        page,
        limit,
        hasMore: start + limit < results.length,
        facets: this.generateFacets(MOCK_RESULTS),
        searchTime: Math.random() * 100,
      };
    }

    const response = await api.post<SearchResponse>('/search', searchQuery);
    return response.data;
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (USE_MOCK) {
      await this.mockDelay(100);

      const suggestions: SearchSuggestion[] = [];

      // Recent searches
      const recentMatches = this.searchHistory
        .filter((h) => h.query.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map((h) => ({
          type: 'recent' as const,
          text: h.query,
        }));
      suggestions.push(...recentMatches);

      // Completions from results
      const completions = MOCK_RESULTS
        .filter((r) => r.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map((r) => ({
          type: 'completion' as const,
          text: r.title,
          entityType: r.entityType,
        }));
      suggestions.push(...completions);

      return suggestions;
    }

    const response = await api.get<SearchSuggestion[]>('/search/suggestions', {
      params: { query },
    });
    return response.data;
  }

  /**
   * Get search history
   */
  getHistory(): SearchHistoryItem[] {
    return [...this.searchHistory];
  }

  /**
   * Add to search history
   */
  private addToHistory(query: string, filters?: SearchFilters, resultCount = 0): void {
    const existingIndex = this.searchHistory.findIndex(
      (h) => h.query.toLowerCase() === query.toLowerCase()
    );

    if (existingIndex !== -1) {
      this.searchHistory.splice(existingIndex, 1);
    }

    this.searchHistory.unshift({
      id: generateUUID(),
      query,
      filters,
      timestamp: new Date(),
      resultCount,
    });

    // Keep only last 20 searches
    this.searchHistory = this.searchHistory.slice(0, 20);
  }

  /**
   * Clear search history
   */
  clearHistory(): void {
    this.searchHistory = [];
  }

  /**
   * Save a search
   */
  async saveSearch(
    name: string,
    query: string,
    filters?: SearchFilters
  ): Promise<SavedSearch> {
    if (USE_MOCK) {
      await this.mockDelay(200);

      const savedSearch: SavedSearch = {
        id: generateUUID(),
        name,
        query,
        filters,
        userId: 'user_001',
        isShared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.savedSearches.push(savedSearch);
      return savedSearch;
    }

    const response = await api.post<SavedSearch>('/search/saved', {
      name,
      query,
      filters,
    });
    return response.data;
  }

  /**
   * Get saved searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      return [...this.savedSearches];
    }

    const response = await api.get<SavedSearch[]>('/search/saved');
    return response.data;
  }

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      this.savedSearches = this.savedSearches.filter((s) => s.id !== id);
      return;
    }

    await api.delete(`/search/saved/${id}`);
  }

  /**
   * Generate facet counts
   */
  private generateFacets(results: SearchResult[]) {
    const entityTypes: Record<string, number> = {};
    const statuses: Record<string, number> = {};
    const priorities: Record<string, number> = {};

    results.forEach((r) => {
      entityTypes[r.entityType] = (entityTypes[r.entityType] || 0) + 1;
      if (r.metadata.status) {
        statuses[r.metadata.status] = (statuses[r.metadata.status] || 0) + 1;
      }
      if (r.metadata.priority) {
        priorities[r.metadata.priority] = (priorities[r.metadata.priority] || 0) + 1;
      }
    });

    const toFacetArray = (record: Record<string, number>) =>
      Object.entries(record).map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' '),
        count,
      }));

    return {
      entityTypes: toFacetArray(entityTypes),
      projects: [],
      teams: [],
      statuses: toFacetArray(statuses),
      priorities: toFacetArray(priorities),
    };
  }

  /**
   * Search within a specific entity type
   */
  async searchByType(
    entityType: SearchEntityType,
    query: string,
    limit = 5
  ): Promise<SearchResult[]> {
    const response = await this.search({
      query,
      filters: { entityTypes: [entityType] },
      limit,
    });
    return response.results;
  }
}

export const searchService = new SearchService();

