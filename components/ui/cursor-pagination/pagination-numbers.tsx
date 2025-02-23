import { PaginationEllipsis } from "@/components/ui/pagination";

import { PaginationNumbersProps } from "@/components/ui/pagination-numbers";
export function PaginationNumbers({
  currentPage,
  totalPages,
  onPageClick,
}: PaginationNumbersProps) {
  // Only show pages we can actually reach
  const reachablePages = Math.min(currentPage + 1, totalPages);

  if (totalPages <= 5) {
    return (
      <>
        {Array.from({ length: reachablePages }, (_, i) => (
          <PagePaginationItem
            key={i + 1}
            pageNumber={i + 1}
            currentPage={currentPage}
            onClick={onPageClick}
          />
        ))}
      </>
    );
  }

  return (
    <>
      <PagePaginationItem
        pageNumber={1}
        currentPage={currentPage}
        onClick={onPageClick}
      />

      {currentPage > 2 && <PaginationEllipsis />}

      {currentPage !== 1 && (
        <PagePaginationItem
          pageNumber={currentPage}
          currentPage={currentPage}
          onClick={onPageClick}
        />
      )}

      {currentPage < reachablePages && (
        <PagePaginationItem
          pageNumber={currentPage + 1}
          currentPage={currentPage}
          onClick={onPageClick}
        />
      )}
    </>
  );
}
