import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onNextPage,
  onPreviousPage
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Show first page if we're not starting from 1
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white rounded-md text-sm font-medium transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2 text-gray-400">...</span>);
      }
    }

    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    // Show last page if we're not ending at the last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2 text-gray-400">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white rounded-md text-sm font-medium transition-colors"
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-gray-400 text-sm">
        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} games
      </div>
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
          }`}
        >
          ←
        </button>

        {/* Page Numbers */}
        {renderPageNumbers()}

        {/* Next Button */}
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-slate-800 text-gray-500 cursor-not-allowed'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
          }`}
        >
          →
        </button>
      </div>
    </div>
  );
};