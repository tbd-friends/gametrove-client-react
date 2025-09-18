import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

const COLLECTION_SEARCH_KEY = 'gametrove_collection_search';

export interface UseCollectionSearchReturn {
  searchValue: string;
  debouncedSearchValue: string;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;
  isSearchFieldFocused: boolean;
  setIsSearchFieldFocused: (focused: boolean) => void;
}

/**
 * Custom hook to manage collection search functionality
 * Handles search state, debouncing, and localStorage persistence
 */
export function useCollectionSearch(): UseCollectionSearchReturn {
  // Initialize search value from localStorage
  const [searchValue, setSearchValue] = useState(() => {
    return localStorage.getItem(COLLECTION_SEARCH_KEY) || '';
  });

  const [isSearchFieldFocused, setIsSearchFieldFocused] = useState(false);

  // Debounce the search value to prevent API calls on every keystroke
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Persist search value to localStorage whenever it changes
  useEffect(() => {
    if (searchValue) {
      localStorage.setItem(COLLECTION_SEARCH_KEY, searchValue);
    } else {
      localStorage.removeItem(COLLECTION_SEARCH_KEY);
    }
  }, [searchValue]);

  const clearSearch = () => {
    setSearchValue('');
  };

  return {
    searchValue,
    debouncedSearchValue,
    setSearchValue,
    clearSearch,
    isSearchFieldFocused,
    setIsSearchFieldFocused,
  };
}
