import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../pagination";
import PaginationNumbers from "../pagination-numbers";
import { CursorPaginationProps } from "./types";

export function CursorPagination({
  state: { page, cursors, totalPages, nextCursor },
  onPageChange,
}: CursorPaginationProps) {
  const handlePageClick = (targetPage: number) => {
    if (targetPage > totalPages) {
      return;
    }

    if (targetPage === 1) {
      onPageChange(1, []);
      return;
    }

    // For any forward navigation when we have nextCursor
    if (targetPage > page && nextCursor) {
      const newCursors = [...cursors, nextCursor];
      onPageChange(targetPage, newCursors);
      return;
    }

    // For backward navigation
    if (targetPage <= cursors.length + 1) {
      onPageChange(targetPage, cursors);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => {
              if (page > 1) {
                handlePageClick(page - 1);
              }
            }}
            isActive={page !== 1}
          />
        </PaginationItem>

        <PaginationNumbers
          currentPage={page}
          totalPages={totalPages}
          onPageClick={handlePageClick}
        />

        <PaginationItem>
          <PaginationNext
            onClick={() => {
              if (nextCursor) {
                handlePageClick(page + 1);
              }
            }}
            isActive={!!nextCursor}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
