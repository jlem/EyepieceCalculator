import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { DatabaseTable } from './DatabaseTable';
import { DatabaseTableCell } from './DatabaseTableCell';
import { DatabaseEyepiece } from '../../models/DatabaseEyepiece';

const testEyepieces: DatabaseEyepiece[] = [
  {
    fullName: "12.5mm Tele Vue Delos",
    line: "Delos",
    brand: "Tele Vue",
    mfrFocalLength: 12.5,
    measuredFocalLength: null,
    mfrApparentFOV: 72,
    measuredApparentFOV: 72,
    weightOz: 14.1,
    eyeRelief: 20,
    mfrFieldStop: 15.0,
    measuredFieldStop: null,
    calculatedFieldStop: 15.7,
    elementCount: 6
  },
  {
    fullName: "17.3mm Tele Vue Delos",
    line: "Delos",
    brand: "Tele Vue",
    mfrFocalLength: 17.3,
    measuredFocalLength: null,
    mfrApparentFOV: 72,
    measuredApparentFOV: 72.3,
    weightOz: 14.5,
    eyeRelief: 20,
    mfrFieldStop: 21.2,
    measuredFieldStop: null,
    calculatedFieldStop: 21.7,
    elementCount: 6
  },
  {
    fullName: "14mm Explore Scientific 82",
    line: "82 Series",
    brand: "Explore Scientific",
    mfrFocalLength: 14,
    measuredFocalLength: 14.2,
    mfrApparentFOV: 82,
    measuredApparentFOV: null,
    weightOz: 9.0,
    eyeRelief: 15,
    mfrFieldStop: 19.3,
    measuredFieldStop: null,
    calculatedFieldStop: null,
    elementCount: 7
  }
];

describe('DatabaseTableCell', () => {
  it('renders string values directly', () => {
    render(
      <table>
        <tbody>
          <tr>
            <DatabaseTableCell value="Tele Vue" type="text" />
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole('cell')).toHaveTextContent('Tele Vue');
  });

  it('renders numeric values formatted with decimals and suffix', () => {
    render(
      <table>
        <tbody>
          <tr>
            <DatabaseTableCell value={12.5} type="number" suffix="mm" decimals={1} />
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole('cell')).toHaveTextContent('12.5mm');
  });

  it('renders fallback for null values', () => {
    render(
      <table>
        <tbody>
          <tr>
            <DatabaseTableCell value={null} type="number" />
          </tr>
        </tbody>
      </table>
    );
    expect(screen.getByRole('cell')).toHaveTextContent('—');
  });
});

describe('DatabaseTable', () => {
  it('renders and displays results count', () => {
    render(<DatabaseTable eyepieces={testEyepieces} />);
    expect(screen.getByText(/Showing 1 to 3 of 3 eyepieces/)).toBeInTheDocument();
  });

  it('filters by name fuzzily', async () => {
    render(<DatabaseTable eyepieces={testEyepieces} />);
    const inputs = screen.getAllByRole('textbox');
    const nameFilterInput = inputs[0];

    fireEvent.change(nameFilterInput, { target: { value: 'TV 12' } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to 1 of 1 eyepieces/)).toBeInTheDocument();
      expect(screen.queryByText("17.3mm Tele Vue Delos")).not.toBeInTheDocument();
      expect(screen.queryByText("14mm Explore Scientific 82")).not.toBeInTheDocument();
      expect(screen.getByText("12.5mm Tele Vue Delos")).toBeInTheDocument();
    });
  });

  it('filters numeric columns using comparison operator', async () => {
    render(<DatabaseTable eyepieces={testEyepieces} />);
    const inputs = screen.getAllByRole('textbox');
    // index 3 is FL column filter input
    const flFilterInput = inputs[3];

    fireEvent.change(flFilterInput, { target: { value: '> 13' } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to 2 of 2 eyepieces/)).toBeInTheDocument();
      expect(screen.queryByText("12.5mm Tele Vue Delos")).not.toBeInTheDocument();
      expect(screen.getByText("17.3mm Tele Vue Delos")).toBeInTheDocument();
      expect(screen.getByText("14mm Explore Scientific 82")).toBeInTheDocument();
    });
  });

  it('sorts columns when header clicked', () => {
    render(<DatabaseTable eyepieces={testEyepieces} />);

    // Default sort is Name (fullName) which resolves as Brand -> Line -> Focal Length
    // So alphabetical order is: Explore Scientific (14mm) -> Tele Vue Delos (12.5mm) -> Tele Vue Delos (17.3mm)
    let rows = screen.getAllByRole('row').slice(1); // skip the single header row
    expect(rows[0]).toHaveTextContent('14mm Explore Scientific 82');

    // Click on FL to sort ascending
    const mfrFlHeader = screen.getByText('FL');
    fireEvent.click(mfrFlHeader);

    // Ascending order: 12.5 (Tele Vue) -> 14 (Explore Scientific) -> 17.3 (Tele Vue)
    rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('12.5mm Tele Vue Delos');

    // Click again to sort descending
    fireEvent.click(mfrFlHeader);
    rows = screen.getAllByRole('row').slice(1);
    // Descending order: 17.3 -> 14 -> 12.5
    expect(rows[0]).toHaveTextContent('17.3mm Tele Vue Delos');
  });

  it('changes page size', () => {
    render(<DatabaseTable eyepieces={testEyepieces} />);
    const pageSizeSelect = screen.getByTestId('page-size-select');
    fireEvent.change(pageSizeSelect, { target: { value: '25' } });
    expect(screen.getByText(/Showing 1 to 3 of 3 eyepieces/)).toBeInTheDocument();
  });
});
