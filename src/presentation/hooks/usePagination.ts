import { useState } from 'react';

export interface UsePaginationProps {
  initialPage?: number;
  initialPageSize?: number;
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

export function usePagination({ 
  initialPage = 1, 
  initialPageSize = 20 
}: UsePaginationProps = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [paginationEnabled, setPaginationEnabled] = useState(false);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const setPaginationData = (data: { totalPages: number; totalItems: number; enabled: boolean }) => {
    setTotalPages(data.totalPages);
    setTotalItems(data.totalItems);
    setPaginationEnabled(data.enabled);
  };

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