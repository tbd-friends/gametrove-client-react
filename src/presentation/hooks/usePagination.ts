import {useCallback, useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

export interface UsePaginationProps {
    initialPage?: number;
    initialPageSize?: number;
    pageKey?: string; // Unique key to identify this pagination context
}

export interface UsePaginationReturn {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    paginationEnabled: boolean;
    handlePageChange: (page: number) => void;
    handleNextPage: () => void;
    handlePreviousPage: () => void;
    resetToFirstPage: () => void;
    setPaginationData: (data: { totalPages: number; totalItems: number; enabled: boolean }) => void;
}

const PAGINATION_STORAGE_KEY = 'gametrove_pagination_state';
const NAVIGATION_SOURCE_KEY = 'gametrove_navigation_source';

export function usePagination({
                                  initialPage = 1,
                                  initialPageSize = 20,
                                  pageKey = 'default'
                              }: UsePaginationProps = {}): UsePaginationReturn {
    const location = useLocation();
    
    // Save pagination state to sessionStorage whenever page changes
    const savePaginationState = useCallback((page: number) => {
        try {
            const existingState = sessionStorage.getItem(PAGINATION_STORAGE_KEY);
            const paginationState = existingState ? JSON.parse(existingState) : {};
            paginationState[pageKey] = page;
            sessionStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify(paginationState));
        } catch (error) {
            console.warn('Failed to save pagination state:', error);
        }
    }, [pageKey]);

    // Get saved page from storage
    const getSavedPage = useCallback(() => {
        try {
            const savedState = sessionStorage.getItem(PAGINATION_STORAGE_KEY);
            if (savedState) {
                const paginationState = JSON.parse(savedState);
                return paginationState[pageKey] || initialPage;
            }
        } catch (error) {
            console.warn('Failed to restore pagination state:', error);
        }
        return initialPage;
    }, [initialPage, pageKey]);

    const [currentPage, setCurrentPage] = useState(() => {
        // On initial mount, check navigation source
        const navigationSource = sessionStorage.getItem(NAVIGATION_SOURCE_KEY);
        if (navigationSource === 'sidebar') {
            sessionStorage.removeItem(NAVIGATION_SOURCE_KEY);
            return 1;
        }
        return getSavedPage();
    });
    
    const [pageSize] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [paginationEnabled, setPaginationEnabled] = useState(false);

    // Handle navigation source changes when location changes
    useEffect(() => {
        const navigationSource = sessionStorage.getItem(NAVIGATION_SOURCE_KEY);
        
        if (navigationSource === 'sidebar') {
            // Reset to page 1 for sidebar navigation
            setCurrentPage(1);
            savePaginationState(1);
            sessionStorage.removeItem(NAVIGATION_SOURCE_KEY);
        } else {
            // For other navigation (like back from detail page), restore saved page
            const savedPage = getSavedPage();
            if (savedPage !== currentPage) {
                setCurrentPage(savedPage);
            }
        }
    }, [location.pathname, getSavedPage, savePaginationState, currentPage]);

    const handlePageChange = useCallback((page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            savePaginationState(page);
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    }, [totalPages, savePaginationState]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, handlePageChange]);

    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    }, [currentPage, handlePageChange]);

    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
        savePaginationState(1);
    }, [savePaginationState]);

    const setPaginationData = useCallback((data: { totalPages: number; totalItems: number; enabled: boolean }) => {
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
        setPaginationEnabled(data.enabled);
    }, []);

    return {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        paginationEnabled,
        handlePageChange,
        handleNextPage,
        handlePreviousPage,
        resetToFirstPage,
        setPaginationData
    };
}