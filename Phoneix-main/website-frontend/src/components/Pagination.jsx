import React from "react";

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages, totalItems, pageSize, hasNextPage, hasPrevPage } = pagination;

    // Calculate the range of items currently displayed
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    // Generate page numbers to display (simple windowing logic)
    const getPageNumbers = () => {
        let pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10 select-none">

            {/* Pagination Status Text */}
            <div className="text-xs text-[#687280] font-medium">
                Showing <span className="font-bold text-white">{startItem}</span> to <span className="font-bold text-white">{endItem}</span> of <span className="font-bold text-[#FF6A00]">{totalItems}</span> records
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">

                {/* Prev Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!hasPrevPage}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    Prev
                </button>

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1.5">
                    {getPageNumbers().map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all border ${
                                currentPage === pageNum
                                    ? "bg-[#FF6A00] text-[#0A1F44] border-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.3)]"
                                    : "bg-white/5 text-[#687280] border-white/5 hover:border-white/20 hover:text-white"
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/10 text-white bg-white/5 hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                    Next
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Pagination;