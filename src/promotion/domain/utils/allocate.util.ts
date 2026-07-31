import { round2 } from "../../../core/domain/utils/money.util";

/**
 * Splits `amount` across `weights` in proportion to each weight, guaranteeing
 * that the parts add up to exactly `round2(amount)`.
 *
 * Rounding each share on its own always leaves a cent or two unaccounted for
 * ($100 over three equal lines gives 33.33 x 3 = 99.99), and that gap is what
 * would make a stored order fail its own `subTotal - discount = total` check.
 * The remainder therefore lands on the heaviest line, where it is least visible.
 */
export const allocate = (amount: number, weights: number[]): number[] => {
    const total = round2(amount);
    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);

    if (totalWeight <= 0 || total <= 0) return weights.map(() => 0);

    const parts = weights.map((weight) => round2((total * weight) / totalWeight));
    const residue = round2(total - parts.reduce((acc, part) => acc + part, 0));

    if (residue !== 0) {
        const heaviest = weights.indexOf(Math.max(...weights));
        parts[heaviest] = round2(parts[heaviest] + residue);
    }

    return parts;
};
