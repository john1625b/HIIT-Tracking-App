import React from 'react';
import { render } from '@testing-library/react';
import TrendChart from './TrendChart';
import { Workout } from '../types';

// Fix for missing Jest type definitions in the current environment
declare const describe: any;
declare const test: any;
declare const expect: any;
declare const jest: any;

// Mock Recharts since it renders SVG/Canvas and relies on ResizeObserver which is flaky in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ data }: any) => (
    <div data-testid="mock-chart">
      {data.map((d: any) => (
        <div key={d.uniqueKey} data-testid="chart-point" data-date={d.displayDate} data-cal={d.calories}></div>
      ))}
    </div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

// Mock Data: Unsorted dates
const mockData: Workout[] = [
  { id: '3', date: '2023-10-03', calories: 400, exerciseId: 'ex1', durationMinutes: 20, intensity: 20 },
  { id: '1', date: '2023-10-01', calories: 300, exerciseId: 'ex1', durationMinutes: 20, intensity: 15 },
  { id: '2', date: '2023-10-02', calories: 350, exerciseId: 'ex1', durationMinutes: 20, intensity: 17.5 },
];

describe('TrendChart Logic', () => {
  test('correctly sorts data ascending by date (Oldest -> Newest)', () => {
    const { getAllByTestId } = render(<TrendChart data={mockData} />);
    
    const points = getAllByTestId('chart-point');
    
    // Expect 3 points
    expect(points).toHaveLength(3);
    
    // Recharts renders in array order. We expect array to be sorted Ascending.
    // Index 0 should be Oct 1
    expect(points[0].getAttribute('data-date')).toContain('Oct 1');
    // Index 2 should be Oct 3
    expect(points[2].getAttribute('data-date')).toContain('Oct 3');
  });

  test('slices data to last 20 items', () => {
    // Generate 25 items
    const longData: Workout[] = Array.from({ length: 25 }, (_, i) => ({
      id: `id-${i}`,
      date: new Date(2023, 0, i + 1).toISOString(),
      calories: 100 + i,
      exerciseId: 'ex1',
      durationMinutes: 20,
      intensity: 5
    }));

    const { getAllByTestId } = render(<TrendChart data={longData} />);
    const points = getAllByTestId('chart-point');

    expect(points).toHaveLength(20);
    // Last point should be the latest date (index 24 => Jan 25)
    expect(points[19].getAttribute('data-date')).toContain('Jan 25');
  });
});