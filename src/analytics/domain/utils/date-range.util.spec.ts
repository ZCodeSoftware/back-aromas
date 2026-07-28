import {
    addDays,
    localDayString,
    parseOffsetMinutes,
    resolveOptionalRange,
    resolveRange,
    startOfLocalDay,
    dayGrid,
} from './date-range.util';

describe('parseOffsetMinutes', () => {
    it('reads negative and positive offsets', () => {
        expect(parseOffsetMinutes('-03:00')).toBe(-180);
        expect(parseOffsetMinutes('+05:30')).toBe(330);
        expect(parseOffsetMinutes('+00:00')).toBe(0);
    });

    it('rejects an IANA zone name', () => {
        expect(() => parseOffsetMinutes('America/Argentina/Buenos_Aires')).toThrow(
            /fixed UTC offset/,
        );
    });
});

describe('startOfLocalDay', () => {
    it('resolves local midnight to the right instant', () => {
        // Midnight in Argentina is 03:00 UTC the same day.
        expect(startOfLocalDay('2026-07-01', '-03:00').toISOString()).toBe('2026-07-01T03:00:00.000Z');
        // Midnight in India is 18:30 UTC the day before.
        expect(startOfLocalDay('2026-07-01', '+05:30').toISOString()).toBe('2026-06-30T18:30:00.000Z');
    });
});

describe('localDayString', () => {
    it('is offset-sign correct in both directions', () => {
        expect(localDayString(new Date('2026-07-01T03:00:00.000Z'), -180)).toBe('2026-07-01');
        // 02:59 UTC is still the previous day in Argentina.
        expect(localDayString(new Date('2026-07-01T02:59:59.999Z'), -180)).toBe('2026-06-30');
        expect(localDayString(new Date('2026-06-30T18:30:00.000Z'), 330)).toBe('2026-07-01');
    });
});

describe('resolveRange', () => {
    it('is half-open: toExclusive is midnight of the day after dateTo', () => {
        const range = resolveRange({ dateFrom: '2026-07-01', dateTo: '2026-07-28', timezone: '-03:00' });

        expect(range.from.toISOString()).toBe('2026-07-01T03:00:00.000Z');
        expect(range.toExclusive.toISOString()).toBe('2026-07-29T03:00:00.000Z');
        expect(range.dateFrom).toBe('2026-07-01');
        expect(range.dateTo).toBe('2026-07-28');
        expect(range.offsetMinutes).toBe(-180);
    });

    it('accepts a single-day range', () => {
        const range = resolveRange({ dateFrom: '2026-07-28', dateTo: '2026-07-28', timezone: '-03:00' });

        expect(dayGrid(range)).toEqual(['2026-07-28']);
    });

    it('defaults dateTo to today when only dateFrom is given', () => {
        const range = resolveRange({ dateFrom: '2026-07-01', timezone: '+00:00' });

        expect(range.dateTo).toBe(new Date().toISOString().slice(0, 10));
    });

    it('defaults to a 30-day window inclusive of dateTo', () => {
        const range = resolveRange({ dateTo: '2026-07-30', timezone: '+00:00' });

        expect(range.dateFrom).toBe('2026-07-01');
        expect(dayGrid(range)).toHaveLength(30);
    });

    it('falls back to the timezone the caller was configured with', () => {
        const range = resolveRange({ dateFrom: '2026-07-01', dateTo: '2026-07-01' }, '+05:30');

        expect(range.timezone).toBe('+05:30');
        expect(range.offsetMinutes).toBe(330);
    });

    it('rejects an inverted range', () => {
        expect(() =>
            resolveRange({ dateFrom: '2026-07-28', dateTo: '2026-07-01', timezone: '-03:00' }),
        ).toThrow(/earlier than or equal/);
    });

    it('rejects a span beyond 366 days', () => {
        expect(() =>
            resolveRange({ dateFrom: '2025-01-01', dateTo: '2026-07-28', timezone: '-03:00' }),
        ).toThrow(/cannot exceed 366 days/);
    });

    it('accepts exactly 366 days', () => {
        expect(() =>
            resolveRange({ dateFrom: '2026-01-01', dateTo: '2027-01-01', timezone: '-03:00' }),
        ).not.toThrow();
    });

    it('rejects a day that does not exist rather than rolling it over', () => {
        expect(() => resolveRange({ dateFrom: '2026-02-31', timezone: '-03:00' })).toThrow(
            /not a valid calendar date/,
        );
    });

    it('rejects a malformed day', () => {
        expect(() => resolveRange({ dateFrom: '01/07/2026', timezone: '-03:00' })).toThrow(
            /YYYY-MM-DD/,
        );
    });

    it('allows a dateTo in the future, to survive clock skew', () => {
        const tomorrow = localDayString(addDays(new Date(), 1), 0);

        expect(() => resolveRange({ dateFrom: tomorrow, dateTo: tomorrow, timezone: '+00:00' })).not.toThrow();
    });
});

describe('resolveOptionalRange', () => {
    it('is null when neither date is given, which keeps the dashboard all-time', () => {
        expect(resolveOptionalRange({})).toBeNull();
        expect(resolveOptionalRange({ timezone: '-03:00' })).toBeNull();
    });

    it('resolves as soon as one date is given', () => {
        expect(resolveOptionalRange({ dateTo: '2026-07-28', timezone: '-03:00' })).not.toBeNull();
    });
});

describe('dayGrid', () => {
    it('walks every day of the range in order', () => {
        const range = resolveRange({ dateFrom: '2026-07-01', dateTo: '2026-07-04', timezone: '-03:00' });

        expect(dayGrid(range)).toEqual(['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04']);
    });

    it('is correct across a month boundary in a positive offset', () => {
        const range = resolveRange({ dateFrom: '2026-06-29', dateTo: '2026-07-02', timezone: '+05:30' });

        expect(dayGrid(range)).toEqual(['2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02']);
    });
});
