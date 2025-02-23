import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "../pagination";

import { CursorPaginationProps } from "./types";

export function CursorPagination({
  state: { page, cursors, totalPages, nextCursor },
  onPageChange,
}: CursorPaginationProps) {
  const handlePageClick = (targetPage: number) => {
    if (targetPage > totalPages || targetPage < 1) {
      return;
    }

    if (targetPage === 1) {
      onPageChange(1, []);
      return;
    }

    if (targetPage === page + 1 && nextCursor) {
      onPageChange(targetPage, [...cursors, nextCursor]);
      return;
    }

    if (targetPage === page - 1) {
      onPageChange(targetPage, cursors);
    }
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageClick(page - 1)}
            isActive={page !== 1}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink isActive>
            {page} / {totalPages}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageClick(page + 1)}
            isActive={!!nextCursor}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
