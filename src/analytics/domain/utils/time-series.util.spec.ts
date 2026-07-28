import { GroupBy } from '../enum/group-by.enum';
import { ISalesDailyRow } from '../types/analytics.type';
import { resolveRange } from './date-range.util';
import { bucketKeyOf, mondayOf, rollUp } from './time-series.util';

const row = (day: string, over: Partial<ISalesDailyRow> = {}): ISalesDailyRow => ({
    day,
    orders: 1,
    revenue: 100,
    subTotal: 100,
    shipping: 0,
    paidOrders: 1,
    paidRevenue: 100,
    ...over,
});

const range = (dateFrom: string, dateTo: string) =>
    resolveRange({ dateFrom, dateTo, timezone: '-03:00' });

describe('mondayOf', () => {
    it('maps every day of a week onto its Monday', () => {
        // 2026-07-27 is a Monday.
        expect(mondayOf('2026-07-27')).toBe('2026-07-27');
        expect(mondayOf('2026-07-29')).toBe('2026-07-27');
        // Sunday belongs to the week that started the previous Monday.
        expect(mondayOf('2026-08-02')).toBe('2026-07-27');
        expect(mondayOf('2026-08-03')).toBe('2026-08-03');
    });
});

describe('bucketKeyOf', () => {
    it('keys days, ISO weeks and months', () => {
        expect(bucketKeyOf('2026-07-29', GroupBy.DAY)).toBe('2026-07-29');
        expect(bucketKeyOf('2026-07-29', GroupBy.WEEK)).toBe('2026-07-27');
        expect(bucketKeyOf('2026-07-29', GroupBy.MONTH)).toBe('2026-07');
    });
});

describe('rollUp', () => {
    it('fills days with no sales as zeros, in order', () => {
        const { points } = rollUp(
            [row('2026-07-02', { orders: 2, revenue: 250 })],
            range('2026-07-01', '2026-07-03'),
            GroupBy.DAY,
        );

        expect(points.map((p) => p.bucket)).toEqual(['2026-07-01', '2026-07-02', '2026-07-03']);
        expect(points[0]).toMatchObject({ orders: 0, revenue: 0, avgTicket: 0 });
        expect(points[1]).toMatchObject({ orders: 2, revenue: 250, avgTicket: 125 });
        expect(points[2].orders).toBe(0);
    });

    it('guards the zero divisor instead of emitting NaN', () => {
        const { points, totals } = rollUp([], range('2026-07-01', '2026-07-02'), GroupBy.DAY);

        expect(points.every((p) => p.avgTicket === 0 && p.paidAvgTicket === 0)).toBe(true);
        expect(totals.avgTicket).toBe(0);
        expect(totals.paidAvgTicket).toBe(0);
    });

    it('rounds money to two decimals', () => {
        const { points } = rollUp(
            [row('2026-07-01', { orders: 3, revenue: 59.97, subTotal: 59.97 })],
            range('2026-07-01', '2026-07-01'),
            GroupBy.DAY,
        );

        expect(points[0].revenue).toBe(59.97);
        expect(points[0].avgTicket).toBe(19.99);
    });

    it('sums totals from the raw rows, not from the rounded buckets', () => {
        // Three days of 0.005 round to 0.01 each (0.03), but sum to 0.015 → 0.02.
        const rows = ['2026-07-01', '2026-07-02', '2026-07-03'].map((day) =>
            row(day, { orders: 1, revenue: 0.005, subTotal: 0.005, paidRevenue: 0.005 }),
        );

        const { totals } = rollUp(rows, range('2026-07-01', '2026-07-03'), GroupBy.DAY);

        expect(totals.revenue).toBe(0.02);
        expect(totals.orders).toBe(3);
    });

    it('consolidates weeks and flags the partial edges', () => {
        // Wed 2026-07-29 to Mon 2026-08-03: two incomplete weeks.
        const { points } = rollUp(
            [row('2026-07-29', { orders: 2, revenue: 200 }), row('2026-08-03')],
            range('2026-07-29', '2026-08-03'),
            GroupBy.WEEK,
        );

        expect(points.map((p) => p.bucket)).toEqual(['2026-07-27', '2026-08-03']);
        expect(points.map((p) => p.partial)).toEqual([true, true]);
        expect(points[0].orders).toBe(2);
        expect(points[1].orders).toBe(1);
    });

    it('marks a whole week as complete', () => {
        const { points } = rollUp([], range('2026-07-27', '2026-08-02'), GroupBy.WEEK);

        expect(points).toHaveLength(1);
        expect(points[0]).toMatchObject({ bucket: '2026-07-27', partial: false });
    });

    it('consolidates months and marks a truncated one as partial', () => {
        const { points } = rollUp(
            [row('2026-07-15', { orders: 4, revenue: 400 }), row('2026-08-01')],
            range('2026-07-01', '2026-08-01'),
            GroupBy.MONTH,
        );

        expect(points.map((p) => p.bucket)).toEqual(['2026-07', '2026-08']);
        // July is complete (31 days in range), August only has one day of 31.
        expect(points.map((p) => p.partial)).toEqual([false, true]);
        expect(points[0].orders).toBe(4);
    });

    it('separates paid from total revenue', () => {
        const { points, totals } = rollUp(
            [row('2026-07-01', { orders: 2, revenue: 300, paidOrders: 1, paidRevenue: 100 })],
            range('2026-07-01', '2026-07-01'),
            GroupBy.DAY,
        );

        expect(points[0]).toMatchObject({ avgTicket: 150, paidAvgTicket: 100 });
        expect(totals).toMatchObject({ revenue: 300, paidRevenue: 100 });
    });

    it('ignores a row that falls outside the grid', () => {
        const { points, totals } = rollUp(
            [row('2020-01-01', { orders: 99 })],
            range('2026-07-01', '2026-07-01'),
            GroupBy.DAY,
        );

        expect(points).toHaveLength(1);
        expect(points[0].orders).toBe(0);
        // Totals come straight from the rows, so the stray one still shows there.
        expect(totals.orders).toBe(99);
    });
});
