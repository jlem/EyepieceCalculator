import React from 'react';
import styles from './DatabaseTable.module.css';

export interface ColumnDefinition {
  key: string;
  label: string;
  type: 'text' | 'number';
  suffix?: string;
  decimals?: number;
}

interface DatabaseTableHeaderProps {
  columns: ColumnDefinition[];
  sortKey: string;
  sortDir: number;
  filters: Record<string, string>;
  onSort: (key: string) => void;
  onFilterChange: (key: string, value: string) => void;
}

export const DatabaseTableHeader: React.FC<DatabaseTableHeaderProps> = ({
  columns,
  sortKey,
  sortDir,
  filters,
  onSort,
  onFilterChange,
}) => {
  const handleThClick = (e: React.MouseEvent, key: string) => {
    // Prevent sorting if the click was inside the input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('input')) {
      return;
    }
    onSort(key);
  };

  return (
    <thead>
      <tr>
        {columns.map((col) => {
          const isSorted = sortKey === col.key;
          const arrow = isSorted ? (sortDir === 1 ? ' ▲' : ' ▼') : '';
          return (
            <th
              key={col.key}
              className={styles.headerCell}
              onClick={(e) => handleThClick(e, col.key)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`${styles.sortableLabel} ${isSorted ? styles.sortActive : ''}`}>
                {col.label}
                <span className={styles.arrowIndicator}>{arrow}</span>
              </div>
              <div className={styles.filterInputWrapper}>
                <input
                  type="text"
                  value={filters[col.key] || ''}
                  onChange={(e) => onFilterChange(col.key, e.target.value)}
                  className={styles.columnFilterInput}
                  placeholder=""
                />
                <svg viewBox="0 0 24 24" className={styles.searchIcon}>
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
