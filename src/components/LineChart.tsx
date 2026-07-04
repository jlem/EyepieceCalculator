import React, { useState, useEffect, useRef } from 'react';

export interface LineChartProps {
  values: number[];
  axisFormatter?: (value: number) => string;
  pointFormatter?: (value: number) => string;
  lineClass?: 'fl' | 'brightness' | 'brightness-change' | 'mag';
  xLabels?: string[] | null;
  shadingStartIdx?: number | null;
}

export const LineChart: React.FC<LineChartProps> = ({
  values,
  axisFormatter = (v) => v.toFixed(0),
  pointFormatter = (v) => v.toFixed(1),
  lineClass = 'fl',
  xLabels = null,
  shadingStartIdx = null,
}) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 560, height: 240 });

  useEffect(() => {
    const svgEl = containerRef.current;
    if (!svgEl) return;
    const parent = svgEl.parentNode as HTMLElement;
    if (!parent) return;

    const handleResize = () => {
      const rect = parent.getBoundingClientRect();
      const padding = 32; // 16px padding on left/right of .chart-container
      
      const labelEl = parent.querySelector('.chart-label') as HTMLElement;
      const labelH = labelEl ? labelEl.offsetHeight : 20;
      
      const w = rect.width - padding;
      const h = rect.height - padding - labelH - 12;

      setDimensions({
        width: w > 0 ? w : 560,
        height: h > 0 ? h : 240,
      });
    };

    // Initial measure
    handleResize();

    // Set up ResizeObserver with window resize fallback for JSDOM environments
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(parent);
      return () => {
        observer.disconnect();
      };
    } else {
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const { width, height } = dimensions;
  const padL = 40;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const minV = 0;
  const maxV = Math.max(...values) * 1.1 || 1;
  const N = values.length;

  const getX = (i: number) => padL + (N === 1 ? 0 : (i / (N - 1)) * plotW);
  const getY = (v: number) => padT + plotH - ((v - minV) / (maxV - minV)) * plotH;

  // Grid lines
  const divisions = 4;
  const gridLines = [];
  for (let d = 0; d <= divisions; d++) {
    const val = (maxV / divisions) * d;
    const y = getY(val);
    gridLines.push({ y, val });
  }

  // Shading region
  let showShading = false;
  let shadingX = 0;
  let shadingW = 0;
  if (shadingStartIdx !== null && shadingStartIdx >= 0 && shadingStartIdx <= N - 1) {
    shadingX = padL + (shadingStartIdx / (N === 1 ? 1 : N - 1)) * plotW;
    shadingW = width - padR - shadingX;
    if (shadingW > 0) {
      showShading = true;
    }
  }

  // Path data
  const pathD = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${getX(i)} ${getY(v)}`)
    .join(' ');

  return (
    <svg ref={containerRef} viewBox={`0 0 ${width} ${height}`} className="line-chart">
      {/* Horizontal gridlines + y-axis labels */}
      {gridLines.map((line, idx) => (
        <React.Fragment key={`grid-${idx}`}>
          <line
            className="grid-line"
            x1={padL}
            y1={line.y}
            x2={width - padR}
            y2={line.y}
          />
          <text
            className="axis-text"
            x={padL - 8}
            y={line.y + 3}
            textAnchor="end"
          >
            {axisFormatter(line.val)}
          </text>
        </React.Fragment>
      ))}

      {/* Shading region for Advanced High Range */}
      {showShading && (
        <React.Fragment key="shading">
          <rect
            className="chart-shading"
            x={shadingX}
            y={padT}
            width={shadingW}
            height={plotH}
            fill="rgba(255, 255, 255, 0.035)"
            pointerEvents="none"
          />
          <line
            className="chart-shading-line"
            x1={shadingX}
            y1={padT}
            x2={shadingX}
            y2={padT + plotH}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="3,3"
            pointerEvents="none"
          />
          <text
            className="chart-shading-text"
            x={shadingX + 6}
            y={padT - 6}
            fill="rgba(255, 255, 255, 0.45)"
            fontSize="8px"
            fontWeight="700"
            letterSpacing="0.05em"
            pointerEvents="none"
          >
            HIGH RANGE
          </text>
        </React.Fragment>
      )}

      {/* X-axis line */}
      <line
        className="axis-line"
        x1={padL}
        y1={padT + plotH}
        x2={width - padR}
        y2={padT + plotH}
      />

      {/* Line Path */}
      {pathD && <path className={`${lineClass}-line`} d={pathD} />}

      {/* Dots and Labels */}
      {values.map((v, i) => {
        const cx = getX(i);
        const cy = getY(v);
        const labelY = cy - 10 < padT + 8 ? cy + 16 : cy - 10;
        const xLabelText = xLabels && xLabels[i] !== undefined ? xLabels[i] : (i + 1).toString();
        return (
          <React.Fragment key={`dot-${i}`}>
            <circle
              className={`${lineClass}-dot`}
              cx={cx}
              cy={cy}
              r="3.5"
            />
            <text
              className="point-text"
              x={cx}
              y={labelY}
              textAnchor="middle"
            >
              {pointFormatter(v)}
            </text>
            <text
              className="axis-text"
              x={cx}
              y={padT + plotH + 16}
              textAnchor="middle"
            >
              {xLabelText}
            </text>
          </React.Fragment>
        );
      })}
    </svg>
  );
};
