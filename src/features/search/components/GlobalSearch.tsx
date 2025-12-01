/**
 * Global Search Component
 * Command palette style global search
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useKeyboardShortcut } from '../../../core/hooks/useKeyboardShortcut';
import { useDebouncedValue } from '../../../core/hooks/useDebounce';
import { searchService } from '../services/searchService';
import type { SearchResult, SearchSuggestion, SearchFilters, SearchEntityType } from '../types';
import { Modal } from '../../../shared/components/Modal';
import { Badge } from '../../../shared/components/Badge';
import { Spinner } from '../../../shared/components/Loading';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (url: string) => void;
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SearchEntityType | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebouncedValue(query, 200);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      loadSuggestions();
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery, activeFilter]);

  const loadSuggestions = async () => {
    try {
      const suggestions = await searchService.getSuggestions('');
      setSuggestions(suggestions);
    } catch {
      // Ignore errors
    }
  };

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const filters: SearchFilters = {};
      if (activeFilter) {
        filters.entityTypes = [activeFilter];
      }

      const response = await searchService.search({
        query: searchQuery,
        filters,
        limit: 10,
      });
      setResults(response.results);
      setSelectedIndex(0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = results.length > 0 ? results : suggestions;
      const maxIndex = items.length - 1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results.length > 0) {
            handleResultClick(results[selectedIndex]);
          } else if (suggestions.length > 0) {
            setQuery(suggestions[selectedIndex].text);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    },
    [results, suggestions, selectedIndex, onClose]
  );

  const handleResultClick = (result: SearchResult) => {
    onNavigate?.(result.url);
    onClose();
    setQuery('');
  };

  const entityTypeIcons: Record<SearchEntityType, React.ReactNode> = {
    task: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    project: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    team: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    user: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    comment: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    file: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
  };

  const filterOptions: { value: SearchEntityType | null; label: string }[] = [
    { value: null, label: 'All' },
    { value: 'task', label: 'Tasks' },
    { value: 'project', label: 'Projects' },
    { value: 'team', label: 'Teams' },
    { value: 'user', label: 'Users' },
    { value: 'file', label: 'Files' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="global-search">
        <div className="global-search-header">
          <div className="global-search-input-wrapper">
            <svg
              className="global-search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="global-search-input"
              placeholder="Search tasks, projects, teams..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {isLoading && <Spinner size="sm" className="global-search-spinner" />}
          </div>
          <div className="global-search-filters">
            {filterOptions.map((option) => (
              <button
                key={option.value || 'all'}
                className={`global-search-filter ${
                  activeFilter === option.value ? 'active' : ''
                }`}
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="global-search-results">
          {!query && suggestions.length > 0 && (
            <div className="global-search-section">
              <div className="global-search-section-title">Recent Searches</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${index}`}
                  className={`global-search-item ${
                    selectedIndex === index ? 'selected' : ''
                  }`}
                  onClick={() => setQuery(suggestion.text)}
                >
                  <span className="global-search-item-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span className="global-search-item-title">{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}

          {query && results.length > 0 && (
            <div className="global-search-section">
              <div className="global-search-section-title">
                Results ({results.length})
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  className={`global-search-item ${
                    selectedIndex === index ? 'selected' : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <span className="global-search-item-icon">
                    {entityTypeIcons[result.entityType]}
                  </span>
                  <div className="global-search-item-content">
                    <span className="global-search-item-title">{result.title}</span>
                    {result.description && (
                      <span className="global-search-item-description">
                        {result.description}
                      </span>
                    )}
                  </div>
                  <div className="global-search-item-meta">
                    <Badge size="sm" variant="secondary">
                      {result.entityType}
                    </Badge>
                    {result.metadata.status && (
                      <Badge size="sm" variant="default">
                        {result.metadata.status}
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && !isLoading && results.length === 0 && (
            <div className="global-search-empty">
              <p>No results found for "{query}"</p>
              <p className="global-search-empty-hint">
                Try different keywords or filters
              </p>
            </div>
          )}
        </div>

        <div className="global-search-footer">
          <div className="global-search-shortcuts">
            <span>
              <kbd>↑</kbd> <kbd>↓</kbd> to navigate
            </span>
            <span>
              <kbd>Enter</kbd> to select
            </span>
            <span>
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

interface SearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export function SearchTrigger({ onClick, className = '' }: SearchTriggerProps) {
  useKeyboardShortcut('mod+k', onClick);

  return (
    <button className={`search-trigger ${className}`} onClick={onClick}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <span>Search...</span>
      <kbd>⌘K</kbd>
    </button>
  );
}

