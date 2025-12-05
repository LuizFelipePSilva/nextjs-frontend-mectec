import "./styles.css";

import { Button } from "../Buttons";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  onChange,
}: PaginationProps) {
  return (
    <div className="pagination-container">
      {page > 0 && (
        <Button
          className="pagination-button"
          variant="ghost"
          onClick={() => onChange(page - 1)}
        >
          {"<"}
        </Button>
      )}
      <span className="pagination-text">
        {page + 1}/{totalPages}
      </span>
      {page < totalPages - 1 && (
        <Button
          className="pagination-button"
          variant="ghost"
          onClick={() => onChange(page + 1)}
        >
          {">"}
        </Button>
      )}
    </div>
  );
}
