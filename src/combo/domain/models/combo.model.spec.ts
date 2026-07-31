import { ComboPriceMode } from '../enum/combo-price-mode.enum';
import { ComboModel } from './combo.model';

const product = (overrides: Partial<Record<string, any>> = {}) => ({
    _id: 'p1',
    name: 'Vela Lavanda',
    price: 4000,
    stock: 10,
    isActive: true,
    ...overrides,
});

const combo = (overrides: Partial<Record<string, any>> = {}) =>
    ComboModel.create({
        name: 'Combo Relax',
        items: [{ product: product(), quantity: 2 }],
        priceMode: ComboPriceMode.FIXED,
        fixedPrice: 7000,
        ...overrides,
    });

describe('ComboModel', () => {
    describe('pricing', () => {
        it('sums the components at their catalogue price for compareAtPrice', () => {
            const model = combo({
                items: [
                    { product: product({ price: 4000 }), quantity: 2 },
                    { product: product({ _id: 'p2', price: 4500 }), quantity: 1 },
                ],
            });

            expect(model.compareAtPrice).toBe(12500);
        });

        it('uses the fixed price verbatim in FIXED mode', () => {
            const model = combo({ priceMode: ComboPriceMode.FIXED, fixedPrice: 7000 });

            expect(model.price).toBe(7000);
            expect(model.savings).toBe(1000);
        });

        it('discounts the sum in PERCENTAGE mode', () => {
            const model = combo({
                items: [
                    { product: product({ price: 4000 }), quantity: 2 },
                    { product: product({ _id: 'p2', price: 4500 }), quantity: 1 },
                ],
                priceMode: ComboPriceMode.PERCENTAGE,
                fixedPrice: undefined,
                discountPercentage: 20,
            });

            expect(model.compareAtPrice).toBe(12500);
            expect(model.price).toBe(10000);
            expect(model.savings).toBe(2500);
        });

        it('rounds a percentage price to two decimals', () => {
            const model = combo({
                items: [{ product: product({ price: 33.33 }), quantity: 1 }],
                priceMode: ComboPriceMode.PERCENTAGE,
                fixedPrice: undefined,
                discountPercentage: 15,
            });

            expect(model.price).toBe(28.33);
        });

        it('never reports a negative saving when the fixed price is above the sum', () => {
            const model = combo({ fixedPrice: 99000 });

            expect(model.savings).toBe(0);
        });
    });

    describe('derived stock', () => {
        it('is capped by the scarcest component', () => {
            const model = combo({
                items: [
                    { product: product({ stock: 7 }), quantity: 2 },
                    { product: product({ _id: 'p2', stock: 2 }), quantity: 1 },
                ],
            });

            // floor(7/2) = 3 and floor(2/1) = 2, so two combos can be assembled.
            expect(model.stock).toBe(2);
        });

        it('is zero when a component is deactivated', () => {
            const model = combo({
                items: [
                    { product: product({ stock: 50 }), quantity: 1 },
                    { product: product({ _id: 'p2', stock: 50, isActive: false }), quantity: 1 },
                ],
            });

            expect(model.stock).toBe(0);
            expect(model.hasAllComponentsAvailable).toBe(false);
        });

        it('is zero when a component was never populated', () => {
            const model = combo({ items: [{ product: 'p1', quantity: 1 }] });

            expect(model.stock).toBe(0);
            expect(model.compareAtPrice).toBe(0);
        });
    });

    describe('assertSellable', () => {
        it('accepts a quantity within the derived stock', () => {
            const model = combo({ items: [{ product: product({ stock: 10 }), quantity: 2 }] });

            expect(() => model.assertSellable(5)).not.toThrow();
        });

        it('rejects a quantity above the derived stock', () => {
            const model = combo({ items: [{ product: product({ stock: 10 }), quantity: 2 }] });

            expect(() => model.assertSellable(6)).toThrow(/Insufficient stock/);
        });

        it('rejects a deactivated combo', () => {
            const model = combo({ isActive: false });

            expect(() => model.assertSellable(1)).toThrow(/not available/);
        });

        it('rejects a combo whose component is gone', () => {
            const model = combo({
                items: [{ product: product({ isActive: false }), quantity: 1 }],
            });

            expect(() => model.assertSellable(1)).toThrow(/no longer available/);
        });
    });

    describe('componentLines', () => {
        it('multiplies the per-combo units by the combos being sold', () => {
            const model = combo({
                items: [
                    { product: product({ _id: 'p1', price: 4000 }), quantity: 2 },
                    { product: product({ _id: 'p2', price: 4500 }), quantity: 1 },
                ],
            });

            expect(model.componentLines(3)).toEqual([
                { productId: 'p1', name: 'Vela Lavanda', unitPrice: 4000, quantity: 6 },
                { productId: 'p2', name: 'Vela Lavanda', unitPrice: 4500, quantity: 3 },
            ]);
        });
    });

    describe('create', () => {
        it('rejects a combo with no products', () => {
            expect(() => combo({ items: [] })).toThrow(/at least one product/);
        });

        it('rejects the same product listed twice', () => {
            expect(() =>
                combo({
                    items: [
                        { product: product(), quantity: 1 },
                        { product: product(), quantity: 2 },
                    ],
                }),
            ).toThrow(/cannot be listed twice/);
        });

        it('rejects a FIXED combo with no fixed price', () => {
            expect(() => combo({ fixedPrice: undefined })).toThrow(/needs a fixedPrice/);
        });

        it('rejects a PERCENTAGE combo with no percentage', () => {
            expect(() =>
                combo({ priceMode: ComboPriceMode.PERCENTAGE, fixedPrice: undefined }),
            ).toThrow(/needs a discountPercentage/);
        });

        it('blanks the price field its mode ignores', () => {
            const model = combo({
                priceMode: ComboPriceMode.PERCENTAGE,
                fixedPrice: 7000,
                discountPercentage: 20,
            });

            expect(model.toJSON().fixedPrice).toBeUndefined();
        });
    });
});
