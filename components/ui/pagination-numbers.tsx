import { PaginationEllipsis } from "@/components/ui/pagination";
import PagePaginationItem from "./page-pagination-item";

interface PaginationNumbersProps {
  currentPage: number;
  totalPages: number;
  onPageClick: (page: number) => void;
}

const PaginationNumbers = ({
  currentPage,
  totalPages,
  onPageClick,
}: PaginationNumbersProps) => {
  if (totalPages <= 5) {
    return (
      <>
        {Array.from({ length: totalPages }, (_, i) => (
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

      {currentPage < totalPages && (
        <PagePaginationItem
          pageNumber={currentPage + 1}
          currentPage={currentPage}
          onClick={onPageClick}
        />
      )}
    </>
  );
};

export default PaginationNumbers;
