import { describe, it, expect } from 'vitest';
import { computeSalesData, hasSales } from '../dashboardUtils';

describe('dashboard utils', () => {
  it('computes sales data for last 6 months and detects sales', () => {
    const now = new Date(2026, 0, 15); // Jan 2026
    const orders = [
      { total: 100, createdAt: '2026-01-10T00:00:00Z' },
      { total: 50, createdAt: '2025-12-20T00:00:00Z' },
      { total: 25, createdAt: '2025-12-05T00:00:00Z' }
    ];

    const { salesData, ordersPerMonth } = computeSalesData(orders, 6, now);

    // salesData should be an array of 6 months
    expect(salesData.length).toBe(6);

    // There should be non-zero sales in at least one month
    expect(hasSales(salesData)).toBe(true);

    // Check that total for January 2026 (first month in the returned array depending on now) is at least 100
    const jan = salesData.find(m => m.name === new Date(2026, 0, 1).toLocaleString('default', { month: 'short' }));
    expect(jan).toBeDefined();
    expect(jan.sales).toBeGreaterThanOrEqual(100);
  });

  it('returns zero sales and hasSales=false when orders are zero/none', () => {
    const now = new Date(2026, 0, 15);
    const orders = [{ total: 0, createdAt: '2026-01-10T00:00:00Z' }];

    const { salesData } = computeSalesData(orders, 6, now);
    expect(salesData.every(s => s.sales === 0)).toBe(true);
    expect(hasSales(salesData)).toBe(false);
  });
});
