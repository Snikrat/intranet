import styles from "./styles.module.css";

type PageItem = number | "...";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel?: string;
  nextLabel?: string;
};

function buildPages(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  previousLabel = "Anterior",
  nextLabel = "Próxima",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);
  const isPreviousDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  function handlePrevious() {
    if (!isPreviousDisabled) {
      onPageChange(currentPage - 1);
    }
  }

  function handleNext() {
    if (!isNextDisabled) {
      onPageChange(currentPage + 1);
    }
  }

  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button
        type="button"
        className={styles.navButton}
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
      >
        {previousLabel}
      </button>

      <div className={styles.pages}>
        {pages.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className={styles.ellipsis}
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              type="button"
              className={`${styles.pageButton} ${
                currentPage === page ? styles.activePage : ""
              }`}
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? "page" : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.navButton}
        onClick={handleNext}
        disabled={isNextDisabled}
      >
        {nextLabel}
      </button>
    </nav>
  );
}
