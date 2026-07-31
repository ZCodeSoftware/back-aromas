import { round2 } from '../../../core/domain/utils/money.util';
import { allocate } from './allocate.util';

const sum = (values: number[]) => round2(values.reduce((acc, value) => acc + value, 0));

describe('allocate', () => {
    it('splits proportionally when the division is exact', () => {
        expect(allocate(100, [50, 50])).toEqual([50, 50]);
    });

    it('gives the rounding remainder to the heaviest line', () => {
        const parts = allocate(100, [100, 100, 100]);

        // 33.33 three times leaves a cent behind; it has to land somewhere.
        expect(sum(parts)).toBe(100);
        expect(parts).toEqual([33.34, 33.33, 33.33]);
    });

    it('adds up to the exact amount on uneven weights', () => {
        const parts = allocate(500, [1200, 350.55, 99.45]);

        expect(sum(parts)).toBe(500);
    });

    it('weights the split by what each line is worth', () => {
        expect(allocate(300, [300, 100])).toEqual([225, 75]);
    });

    it('gives nothing away when every weight is zero', () => {
        expect(allocate(100, [0, 0])).toEqual([0, 0]);
    });

    it('gives nothing away when there is nothing to split', () => {
        expect(allocate(0, [100, 50])).toEqual([0, 0]);
    });

    it('handles a single line', () => {
        expect(allocate(37.77, [500])).toEqual([37.77]);
    });
});
