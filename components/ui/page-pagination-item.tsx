import { PaginationItem, PaginationLink } from "./pagination";

interface PagePaginationItemProps {
  pageNumber: number;
  currentPage: number;
  onClick: (pageNumber: number) => void;
}

const PagePaginationItem = ({
  pageNumber,
  currentPage,
  onClick,
}: PagePaginationItemProps) => {
  return (
    <PaginationItem>
      <PaginationLink
        onClick={() => onClick(pageNumber)}
        isActive={currentPage === pageNumber}
      >
        {pageNumber}
      </PaginationLink>
    </PaginationItem>
  );
};

export default PagePaginationItem;
