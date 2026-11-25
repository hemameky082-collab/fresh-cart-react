import '../styles/pagination.css';

interface Props {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, itemsPerPage, totalItems, onPageChange }: Props) {
  const pages = Math.max(1, Math.ceil(totalItems / Math.max(1, itemsPerPage)));
  if (pages <= 1) return null;
  const list: (number | '...')[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - currentPage) <= 2) list.push(p);
    else if (list[list.length - 1] !== '...') list.push('...');
  }
  return (
    <ul className="ngx-pagination" role="navigation" aria-label="Pagination">
      <li className={`pagination-previous ${currentPage === 1 ? 'disabled' : ''}`}>
        {currentPage === 1 ? <span>Previous</span> : <a onClick={() => onPageChange(currentPage - 1)}>Previous</a>}
      </li>
      {list.map((p, i) =>
        p === '...' ? (
          <li key={`e${i}`} className="ellipsis" />
        ) : p === currentPage ? (
          <li key={p} className="current">
            <span>{p}</span>
          </li>
        ) : (
          <li key={p}>
            <a onClick={() => onPageChange(p)}>{p}</a>
          </li>
        ),
      )}
      <li className={`pagination-next ${currentPage === pages ? 'disabled' : ''}`}>
        {currentPage === pages ? <span>Next</span> : <a onClick={() => onPageChange(currentPage + 1)}>Next</a>}
      </li>
    </ul>
  );
}
