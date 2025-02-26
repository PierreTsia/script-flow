export interface CursorPaginationState {
  page: number;
  cursors: string[];
  totalPages: number;
  nextCursor?: string | null;
}

export interface CursorPaginationProps {
  state: CursorPaginationState;
  onPageChange: (newPage: number, newCursors: string[]) => void;
}
