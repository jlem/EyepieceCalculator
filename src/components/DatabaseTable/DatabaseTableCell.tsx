import React from 'react';

interface DatabaseTableCellProps {
  value: string | number | null;
  type: 'text' | 'number';
  decimals?: number;
  suffix?: string;
  className?: string;
}

export const DatabaseTableCell: React.FC<DatabaseTableCellProps> = ({
  value,
  type,
  decimals,
  suffix,
  className = '',
}) => {
  if (value === null || value === undefined || value === '') {
    return (
      <td className={`na text-muted ${className}`} style={{ textAlign: 'left' }}>
        —
      </td>
    );
  }

  if (type === 'number') {
    const num = typeof value === 'number' ? value : parseFloat(String(value));
    const formatted = typeof decimals === 'number'
      ? parseFloat(num.toFixed(decimals)).toString()
      : num.toString();
    const displayValue = suffix ? `${formatted}${suffix}` : formatted;

    return (
      <td
        className={`num ${className}`}
        style={{ textAlign: 'left', fontVariantNumeric: 'tabular-nums' }}
      >
        {displayValue}
      </td>
    );
  }

  return (
    <td className={className} title={String(value)}>
      {String(value)}
    </td>
  );
};
