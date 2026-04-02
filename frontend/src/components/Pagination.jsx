import React from 'react';

export default function Pagination({ pagination, onPageChange }) {
  // Destructure with default values to prevent crashes if pagination is partially null
  const { 
    page = 1, 
    totalPages = 1, 
    total = 0, 
    limit = 10 
  } = pagination || {};

  // Don't show pagination if there's only one page or no data
  if (totalPages <= 1) return null;

  // Calculate the range of items currently being shown (e.g., "Showing 1–10")
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  /**
   * Generates an array of page numbers with ellipses for long lists
   * Example: [1, '...', 4, 5, 6, '...', 10]
   */
  const getPages = () => {
    const pages = [];
    const delta = 2; // Number of pages to show around the current page
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1); // Always show the first page

    if (left > 2) pages.push('...');

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push('...');

    if (totalPages > 1) {
      pages.push(totalPages); // Always show the last page
    }

    return pages;
  };

  return (
    <div style={styles.wrapper}>
      {/* Informational Text */}
      <span style={styles.info}>
        Showing <strong style={styles.strong}>{from}–{to}</strong> of <strong style={styles.strong}>{total}</strong> users
      </span>

      {/* Navigation Controls */}
      <div style={styles.controls}>
        {/* Previous Button */}
        <button
          style={{ ...styles.btn, ...(page === 1 ? styles.btnDisabled : {}) }}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous Page"
        >
          ← Prev
        </button>

        {/* Page Numbers */}
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={styles.ellipsis}>…</span>
          ) : (
            <button
              key={p}
              style={{ ...styles.btn, ...(p === page ? styles.btnActive : {}) }}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          style={{ ...styles.btn, ...(page === totalPages ? styles.btnDisabled : {}) }}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next Page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// --- Styles ---

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    padding: '24px 0', // Slightly increased padding for better breathing room
  },
  info: { 
    fontSize: 13, 
    color: 'var(--text-muted)',
    fontFamily: 'DM Sans, sans-serif'
  },
  strong: {
    color: 'var(--text)',
  },
  controls: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6 
  },
  btn: {
    padding: '8px 14px', // Slightly taller buttons for better tap targets
    borderRadius: 'var(--radius-sm)', // Using your global variable
    border: '1.5px solid var(--border)', // Matches your input-field border weight
    background: 'var(--surface2)',
    color: 'var(--text-muted)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition)',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
  },
  btnActive: {
    background: 'var(--accent)',
    color: '#fff',
    borderColor: 'var(--accent)',
    boxShadow: '0 4px 12px var(--accent-glow)',
  },
  btnDisabled: { 
    opacity: 0.3, 
    cursor: 'not-allowed',
    borderColor: 'var(--border)'
  },
  ellipsis: { 
    padding: '0 8px', 
    color: 'var(--text-dim)', 
    fontSize: 14,
    userSelect: 'none'
  },
};