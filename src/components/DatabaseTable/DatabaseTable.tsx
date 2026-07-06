import React, { useState, useMemo, useEffect } from 'react';
import { DatabaseEyepiece } from '../../models/DatabaseEyepiece';
import { matchesName } from '../../utils/fuzzySearch';
import { parseNumericFilter } from '../../utils/numericFilter';
import { DatabaseTableHeader, ColumnDefinition } from './DatabaseTableHeader';
import { DatabaseTableCell } from './DatabaseTableCell';
import styles from './DatabaseTable.module.css';

/** Round to up to maxDecimals places, stripping trailing zeros. */
const fmt = (value: number, maxDecimals = 2): string =>
  parseFloat(value.toFixed(maxDecimals)).toString();

// Column definitions matching the updated table structure
export const COLUMNS: ColumnDefinition[] = [
  { key: 'fullName', label: 'Name', type: 'text' },
  { key: 'brand', label: 'Brand', type: 'text' },
  { key: 'line', label: 'Line', type: 'text' },
  { key: 'fl', label: 'FL', type: 'number', suffix: 'mm' },
  { key: 'afov', label: 'AFOV', type: 'number', suffix: '°' },
  { key: 'fs', label: 'FS', type: 'number', suffix: 'mm' },
  { key: 'eyeRelief', label: 'ER', type: 'number', suffix: 'mm' },
  { key: 'weightOz', label: 'Wt', type: 'number', suffix: 'oz' },
  { key: 'elementCount', label: 'Elem', type: 'number' },
];

interface DatabaseTableProps {
  eyepieces: DatabaseEyepiece[];
}

interface ComputedEyepiece extends DatabaseEyepiece {
  fl: number | null;
  flIsMeasured: boolean;
  afov: number | null;
  afovIsMeasured: boolean;
  fs: number | null;
  fsSource: 'measured' | 'mfr' | 'calculated' | null;
}

// Small ruler SVG icon for measured values
const MeasuredIcon: React.FC = () => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    fill="var(--accent)"
    style={{
      marginLeft: '5px',
      verticalAlign: 'middle',
      display: 'inline-block',
      cursor: 'help',
      opacity: 0.8,
    }}
    title="this value was measured"
  >
    <title>this value was measured</title>
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h4v2h2V5h2v3h2V5h4v14z" />
  </svg>
);

export const DatabaseTable: React.FC<DatabaseTableProps> = ({ eyepieces }) => {
  // Sorting state
  const [sortKey, setSortKey] = useState<string>('fullName');
  const [sortDir, setSortDir] = useState<number>(1); // 1 = asc, -1 = desc

  // Filtering state
  const [rawFilters, setRawFilters] = useState<Record<string, string>>({});
  const [debouncedFilters, setDebouncedFilters] = useState<Record<string, string>>({});

  // Pagination state
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(100);

  // Debounce filter inputs by 150ms to keep UI typing smooth
  useEffect(() => {
    const keys1 = Object.keys(rawFilters);
    const keys2 = Object.keys(debouncedFilters);
    let changed = keys1.length !== keys2.length;
    if (!changed) {
      for (const k of keys1) {
        if (rawFilters[k] !== debouncedFilters[k]) {
          changed = true;
          break;
        }
      }
    }

    if (!changed) return;

    const timer = setTimeout(() => {
      setDebouncedFilters(rawFilters);
    }, 150);
    return () => clearTimeout(timer);
  }, [rawFilters, debouncedFilters]);

  // Reset to first page when filters or sorting change
  const isMounted = React.useRef(false);
  useEffect(() => {
    if (isMounted.current) {
      setPageIndex(0);
    } else {
      isMounted.current = true;
    }
  }, [debouncedFilters, sortKey, sortDir]);

  // 1. Precompute values for clean sorting, filtering, and rendering
  const computedData = useMemo((): ComputedEyepiece[] => {
    return eyepieces.map((row) => {
      // FL: Measured FL overrides Manufacturer FL
      const fl = row.measuredFocalLength !== null ? row.measuredFocalLength : row.mfrFocalLength;
      const flIsMeasured = row.measuredFocalLength !== null;

      // AFOV: Measured AFOV overrides Manufacturer AFOV
      const afov = row.measuredApparentFOV !== null ? row.measuredApparentFOV : row.mfrApparentFOV;
      const afovIsMeasured = row.measuredApparentFOV !== null;

      // FS: Pecking order: Measured -> Manufacturer -> Calculated
      let fs: number | null = null;
      let fsSource: ComputedEyepiece['fsSource'] = null;
      if (row.measuredFieldStop !== null) {
        fs = row.measuredFieldStop;
        fsSource = 'measured';
      } else if (row.mfrFieldStop !== null) {
        fs = row.mfrFieldStop;
        fsSource = 'mfr';
      } else if (row.calculatedFieldStop !== null) {
        fs = row.calculatedFieldStop;
        fsSource = 'calculated';
      }

      return {
        ...row,
        fl,
        flIsMeasured,
        afov,
        afovIsMeasured,
        fs,
        fsSource,
      };
    });
  }, [eyepieces]);

  // Apply filters
  const filteredData = useMemo(() => {
    return computedData.filter((row) => {
      for (const col of COLUMNS) {
        const filterVal = debouncedFilters[col.key];
        if (!filterVal || filterVal.trim() === '') continue;

        if (col.type === 'text') {
          if (col.key === 'fullName') {
            if (!matchesName(row.fullName, filterVal)) {
              return false;
            }
          } else {
            const cellVal = String(row[col.key as keyof ComputedEyepiece] || '').toLowerCase();
            if (!cellVal.includes(filterVal.toLowerCase())) {
              return false;
            }
          }
        } else {
          const testFn = parseNumericFilter(filterVal);
          const cellVal = row[col.key as keyof ComputedEyepiece];
          if (testFn && !testFn(cellVal as number | null)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [computedData, debouncedFilters]);

  // Apply sort
  const sortedData = useMemo(() => {
    const compareValues = (a: any, b: any, type: 'text' | 'number') => {
      if (type === 'number') {
        if (a === null && b === null) return 0;
        if (a === null) return 1;
        if (b === null) return -1;
        return a - b;
      }
      return String(a || '').localeCompare(String(b || ''));
    };

    const compareRows = (a: ComputedEyepiece, b: ComputedEyepiece) => {
      if (sortKey === 'fullName') {
        // Multi-level sort for Name column: Brand -> Line -> FL
        const res =
          compareValues(a.brand, b.brand, 'text') ||
          compareValues(a.line, b.line, 'text') ||
          compareValues(a.fl, b.fl, 'number');
        return res * sortDir;
      }
      const col = COLUMNS.find((c) => c.key === sortKey);
      const type = col ? col.type : 'text';
      const valA = a[sortKey as keyof ComputedEyepiece];
      const valB = b[sortKey as keyof ComputedEyepiece];

      if (type === 'number') {
        if (valA === null && valB === null) return 0;
        if (valA === null) return 1;
        if (valB === null) return -1;
        return (valA as number - (valB as number)) * sortDir;
      }

      return compareValues(valA, valB, type) * sortDir;
    };

    return [...filteredData].sort((a, b) => compareRows(a, b));
  }, [filteredData, sortKey, sortDir]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pageIndex, pageSize]);

  // Handlers
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => -prev);
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setRawFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const paginationRange = useMemo(() => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, pageIndex - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }, [pageIndex, totalPages]);

  return (
    <div>
      <div className={styles.tableContainer}>
        <table className={styles.databaseTable} data-testid="database-table">
          <colgroup>
            <col className={styles.colName} />
            <col className={styles.colBrand} />
            <col className={styles.colLine} />
            <col className={styles.colNum} />
            <col className={styles.colNum} />
            <col className={styles.colNum} />
            <col className={styles.colNum} />
            <col className={styles.colNum} />
            <col className={styles.colNum} />
          </colgroup>
          <DatabaseTableHeader
            columns={COLUMNS}
            sortKey={sortKey}
            sortDir={sortDir}
            filters={rawFilters}
            onSort={handleSort}
            onFilterChange={handleFilterChange}
          />
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ textAlign: 'center', padding: '24px 0' }}>
                  No eyepieces match your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <tr key={`${row.fullName}-${i}`}>
                  <DatabaseTableCell value={row.fullName} type="text" className={styles.colName} />
                  <DatabaseTableCell value={row.brand} type="text" className={styles.colBrand} />
                  <DatabaseTableCell value={row.line} type="text" className={styles.colLine} />

                  {/* Combined FL Cell */}
                  <td className={styles.colNum} style={{ textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>
                    {row.fl !== null ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        {fmt(row.fl)}mm
                        {row.flIsMeasured && <MeasuredIcon />}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Combined AFOV Cell */}
                  <td className={styles.colNum} style={{ textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>
                    {row.afov !== null ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        {fmt(row.afov)}°
                        {row.afovIsMeasured && <MeasuredIcon />}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  {/* Combined FS Cell */}
                  <td className={styles.colNum} style={{ textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}>
                    {row.fs !== null ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
                        {row.fsSource === 'calculated' ? (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                            {fmt(row.fs)}mm
                            <span
                              style={{
                                color: 'var(--accent2)',
                                marginLeft: '2px',
                                cursor: 'help',
                                fontWeight: 'bold',
                              }}
                              title="this value was calculated and is only an approximation"
                            >
                              *
                            </span>
                          </span>
                        ) : (
                          <>
                            {fmt(row.fs)}mm
                            {row.fsSource === 'measured' && <MeasuredIcon />}
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>

                  <DatabaseTableCell
                    value={row.eyeRelief}
                    type="number"
                    decimals={2}
                    suffix="mm"
                    className={styles.colNum}
                  />
                  <DatabaseTableCell
                    value={row.weightOz}
                    type="number"
                    decimals={2}
                    suffix="oz"
                    className={styles.colNum}
                  />
                  <DatabaseTableCell
                    value={row.elementCount}
                    type="number"
                    decimals={0}
                    className={styles.colNum}
                  />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className={styles.paginationContainer}>
        <div className={styles.statusText} data-testid="results-count">
          Showing {filteredData.length === 0 ? 0 : pageIndex * pageSize + 1} to{' '}
          {Math.min((pageIndex + 1) * pageSize, filteredData.length)} of{' '}
          {filteredData.length} eyepieces
        </div>

        <div className={styles.controlsWrapper}>
          <div className={styles.buttonGroup}>
            <button
              data-testid="page-prev"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className={styles.pageButton}
            >
              Previous
            </button>

            {paginationRange.map((pageIdx) => (
              <button
                key={pageIdx}
                data-testid={`page-num-${pageIdx + 1}`}
                onClick={() => setPageIndex(pageIdx)}
                className={`${styles.pageButton} ${pageIndex === pageIdx ? styles.activePageButton : ''}`}
              >
                {pageIdx + 1}
              </button>
            ))}

            <button
              data-testid="page-next"
              onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
              disabled={pageIndex === totalPages - 1}
              className={styles.pageButton}
            >
              Next
            </button>
          </div>

          <select
            id="pageSizeSelect"
            data-testid="page-size-select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
            className={styles.pageSizeSelector}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>
    </div>
  );
};
