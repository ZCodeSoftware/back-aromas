import { round2 } from '../../../core/domain/utils/money.util';
import { GroupBy } from '../enum/group-by.enum';
import { ISalesDailyRow, ISalesPoint, ISalesTimeSeries, ISalesTotals } from '../types/analytics.type';
import { dayGrid, IResolvedRange } from './date-range.util';

const MS_PER_DAY = 86_400_000;

interface IAccumulator {
    bucket: string;
    orders: number;
    revenue: number;
    subTotal: number;
    shipping: number;
    paidOrders: number;
    paidRevenue: number;
}

/**
 * Bucket a calendar day belongs to. Operates on the already-localised day string,
 * so it is timezone-free by construction.
 */
export function bucketKeyOf(day: string, groupBy: GroupBy): string {
    if (groupBy === GroupBy.MONTH) return day.slice(0, 7);
    if (groupBy === GroupBy.DAY) return day;

    return mondayOf(day);
}

/** Monday of the ISO week containing `day`, as 'YYYY-MM-DD'. */
export function mondayOf(day: string): string {
    const d = new Date(`${day}T00:00:00.000Z`);
    // getUTCDay is 0 for Sunday, so shift it into a Monday-first week.
    const back = (d.getUTCDay() + 6) % 7;

    return new Date(d.getTime() - back * MS_PER_DAY).toISOString().slice(0, 10);
}

/**
 * Folds daily aggregation rows into the requested granularity.
 *
 * The bucket map is seeded from the range's own day grid before any row is added,
 * so buckets with no sales come out as zeros and the output order is guaranteed
 * without a sort.
 */
export function rollUp(
    rows: ISalesDailyRow[],
    range: IResolvedRange,
    groupBy: GroupBy,
): Pick<ISalesTimeSeries, 'totals' | 'points'> {
    const grid = dayGrid(range);
    const buckets = new Map<string, IAccumulator>();
    // Which buckets are fully inside the range: a week or month at either edge
    // may cover days the caller did not ask for.
    const daysPerBucket = new Map<string, number>();

    grid.forEach((day) => {
        const key = bucketKeyOf(day, groupBy);

        if (!buckets.has(key)) {
            buckets.set(key, emptyAccumulator(key));
        }

        daysPerBucket.set(key, (daysPerBucket.get(key) ?? 0) + 1);
    });

    rows.forEach((row) => {
        const bucket = buckets.get(bucketKeyOf(row.day, groupBy));

        // A row outside the grid cannot happen with a range-scoped query, but
        // dropping it is safer than creating an out-of-order bucket.
        if (!bucket) return;

        bucket.orders += row.orders;
        bucket.revenue += row.revenue;
        bucket.subTotal += row.subTotal;
        bucket.shipping += row.shipping;
        bucket.paidOrders += row.paidOrders;
        bucket.paidRevenue += row.paidRevenue;
    });

    const points: ISalesPoint[] = [...buckets.values()].map((bucket) => ({
        bucket: bucket.bucket,
        partial: (daysPerBucket.get(bucket.bucket) ?? 0) < expectedDays(bucket.bucket, groupBy),
        orders: bucket.orders,
        paidOrders: bucket.paidOrders,
        revenue: round2(bucket.revenue),
        paidRevenue: round2(bucket.paidRevenue),
        subTotal: round2(bucket.subTotal),
        shipping: round2(bucket.shipping),
        avgTicket: bucket.orders ? round2(bucket.revenue / bucket.orders) : 0,
        paidAvgTicket: bucket.paidOrders ? round2(bucket.paidRevenue / bucket.paidOrders) : 0,
    }));

    return { totals: totalsOf(rows), points };
}

/**
 * Summed from the raw rows rather than from the rounded buckets: rounding first
 * and adding afterwards drifts.
 */
function totalsOf(rows: ISalesDailyRow[]): ISalesTotals {
    const sum = rows.reduce<IAccumulator>(
        (acc, row) => ({
            bucket: acc.bucket,
            orders: acc.orders + row.orders,
            revenue: acc.revenue + row.revenue,
            subTotal: acc.subTotal + row.subTotal,
            shipping: acc.shipping + row.shipping,
            paidOrders: acc.paidOrders + row.paidOrders,
            paidRevenue: acc.paidRevenue + row.paidRevenue,
        }),
        emptyAccumulator(''),
    );

    return {
        orders: sum.orders,
        paidOrders: sum.paidOrders,
        revenue: round2(sum.revenue),
        paidRevenue: round2(sum.paidRevenue),
        subTotal: round2(sum.subTotal),
        shipping: round2(sum.shipping),
        avgTicket: sum.orders ? round2(sum.revenue / sum.orders) : 0,
        paidAvgTicket: sum.paidOrders ? round2(sum.paidRevenue / sum.paidOrders) : 0,
    };
}

/** How many days a complete bucket of this granularity holds. */
function expectedDays(bucket: string, groupBy: GroupBy): number {
    if (groupBy === GroupBy.DAY) return 1;
    if (groupBy === GroupBy.WEEK) return 7;

    const [year, month] = bucket.split('-').map(Number);

    return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function emptyAccumulator(bucket: string): IAccumulator {
    return { bucket, orders: 0, revenue: 0, subTotal: 0, shipping: 0, paidOrders: 0, paidRevenue: 0 };
}
