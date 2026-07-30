import { HttpStatus } from '@nestjs/common';
import { BaseErrorException } from '../../../core/domain/exceptions/base.error.exception';

const MS_PER_DAY = 86_400_000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const OFFSET_PATTERN = /^([+-])(\d{2}):(\d{2})$/;

/** Bounds the day grid of a time series, and with it the response size. */
export const MAX_RANGE_DAYS = 366;

export const DEFAULT_TZ_OFFSET = '-03:00';

/** Number of days a range covers when the caller gives no dates. */
const DEFAULT_SPAN_DAYS = 30;

/**
 * A calendar range turned into the two instants a query needs. `toExclusive` is
 * the start of the day *after* `dateTo`, so filters are half-open
 * (`$gte`/`$lt`): a `$lte` on a day boundary either drops the last millisecond
 * or double-counts it.
 */
export interface IResolvedRange {
    /** Echoed back as given, 'YYYY-MM-DD'. */
    dateFrom: string;
    /** Echoed back as given. Inclusive as a day, which is what a human means. */
    dateTo: string;
    timezone: string;
    offsetMinutes: number;
    from: Date;
    toExclusive: Date;
}

export interface IRangeInput {
    dateFrom?: string;
    dateTo?: string;
    timezone?: string;
}

export function parseOffsetMinutes(timezone: string): number {
    const match = OFFSET_PATTERN.exec(timezone);

    if (!match) {
        throw new BaseErrorException(
            `timezone must be a fixed UTC offset like ${DEFAULT_TZ_OFFSET}`,
            HttpStatus.BAD_REQUEST,
        );
    }

    const [, sign, hours, minutes] = match;
    const magnitude = Number(hours) * 60 + Number(minutes);

    return sign === '-' ? -magnitude : magnitude;
}

/** Instant of local midnight on `day`, via the native ISO-with-offset parser. */
export function startOfLocalDay(day: string, timezone: string): Date {
    const instant = new Date(`${day}T00:00:00.000${timezone}`);

    if (Number.isNaN(instant.getTime())) {
        throw new BaseErrorException(`${day} is not a valid calendar date`, HttpStatus.BAD_REQUEST);
    }

    return instant;
}

/** Exact for a fixed offset: no DST means every day is 24 hours long. */
export function addDays(instant: Date, days: number): Date {
    return new Date(instant.getTime() + days * MS_PER_DAY);
}

export function localDayString(instant: Date, offsetMinutes: number): string {
    return new Date(instant.getTime() + offsetMinutes * 60_000).toISOString().slice(0, 10);
}

export function todayInTz(offsetMinutes: number): string {
    return localDayString(new Date(), offsetMinutes);
}

/** Every calendar day the range covers, in order. */
export function dayGrid(range: IResolvedRange): string[] {
    const days: string[] = [];

    for (let t = range.from.getTime(); t < range.toExclusive.getTime(); t += MS_PER_DAY) {
        days.push(localDayString(new Date(t), range.offsetMinutes));
    }

    return days;
}

/**
 * Turns optional calendar days into a resolved range. With neither date given the
 * window is the last 30 days including today: an unbounded default would produce
 * an unbounded number of time-series buckets.
 */
export function resolveRange(input: IRangeInput, defaultTimezone = DEFAULT_TZ_OFFSET): IResolvedRange {
    const timezone = input.timezone || defaultTimezone;
    const offsetMinutes = parseOffsetMinutes(timezone);

    assertDayFormat(input.dateFrom, 'dateFrom');
    assertDayFormat(input.dateTo, 'dateTo');

    const dateTo = input.dateTo ?? todayInTz(offsetMinutes);
    const dateFrom =
        input.dateFrom ?? localDayString(addDays(startOfLocalDay(dateTo, timezone), -(DEFAULT_SPAN_DAYS - 1)), offsetMinutes);

    const from = startOfLocalDay(dateFrom, timezone);
    const toInclusiveStart = startOfLocalDay(dateTo, timezone);

    if (from.getTime() > toInclusiveStart.getTime()) {
        throw new BaseErrorException(
            'dateFrom must be earlier than or equal to dateTo',
            HttpStatus.BAD_REQUEST,
        );
    }

    const spanDays = Math.round((toInclusiveStart.getTime() - from.getTime()) / MS_PER_DAY) + 1;

    if (spanDays > MAX_RANGE_DAYS) {
        throw new BaseErrorException(
            `The date range cannot exceed ${MAX_RANGE_DAYS} days`,
            HttpStatus.BAD_REQUEST,
        );
    }

    return {
        dateFrom,
        dateTo,
        timezone,
        offsetMinutes,
        from,
        toExclusive: addDays(toInclusiveStart, 1),
    };
}

/**
 * Only when the caller actually sent dates. Used by the dashboard, which must
 * stay all-time when it receives none.
 */
export function resolveOptionalRange(
    input: IRangeInput,
    defaultTimezone = DEFAULT_TZ_OFFSET,
): IResolvedRange | null {
    if (!input.dateFrom && !input.dateTo) return null;

    return resolveRange(input, defaultTimezone);
}

/**
 * A `Date` accepts '2026-02-31' by rolling it into March, so the string is
 * compared back to the parsed day to reject dates that do not exist.
 */
function assertDayFormat(day: string | undefined, field: string): void {
    if (day === undefined) return;

    if (!DAY_PATTERN.test(day)) {
        throw new BaseErrorException(`${field} must be a calendar day in YYYY-MM-DD`, HttpStatus.BAD_REQUEST);
    }

    const parsed = new Date(`${day}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== day) {
        throw new BaseErrorException(`${field} is not a valid calendar date`, HttpStatus.BAD_REQUEST);
    }
}
