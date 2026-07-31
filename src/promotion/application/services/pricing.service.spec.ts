import { OrderChannel } from '../../../order/domain/enum/order-channel.enum';
import { OrderItemType } from '../../../order/domain/enum/order-item-type.enum';
import { PromotionScope } from '../../domain/enum/promotion-scope.enum';
import { PromotionValueType } from '../../domain/enum/promotion-value-type.enum';
import { PromotionModel } from '../../domain/models/promotion.model';
import type { IPricingLineInput, IPricingRequest } from '../../domain/types/pricing.type';
import { PricingService } from './pricing.service';

const promotion = (over: Partial<Record<string, any>> = {}) =>
    PromotionModel.hydrate({
        _id: over._id ?? 'promo1',
        name: 'Promo',
        scope: PromotionScope.ALL,
        valueType: PromotionValueType.PERCENTAGE,
        value: 10,
        isActive: true,
        usedCount: 0,
        ...over,
    });

const productLine = (over: Partial<IPricingLineInput> = {}): IPricingLineInput => {
    const quantity = over.quantity ?? 1;
    const unitPrice = over.unitPrice ?? 1000;

    return {
        ref: '0',
        itemType: OrderItemType.PRODUCT,
        productId: 'p1',
        categoryId: 'cat1',
        subCategoryId: 'sub1',
        quantity,
        unitPrice,
        total: unitPrice * quantity,
        ...over,
    };
};

const comboLine = (over: Partial<IPricingLineInput> = {}): IPricingLineInput =>
    productLine({
        ref: 'c',
        itemType: OrderItemType.COMBO,
        comboId: 'combo1',
        productId: undefined,
        categoryId: undefined,
        subCategoryId: undefined,
        ...over,
    });

const build = (over: { automatic?: PromotionModel[]; byCode?: PromotionModel | null; usedByUser?: number } = {}) => {
    const promotionRepository = {
        findActiveAutomatic: jest.fn().mockResolvedValue(over.automatic ?? []),
        findByCode: jest.fn().mockResolvedValue(over.byCode ?? null),
        consumeUse: jest.fn().mockResolvedValue(true),
        releaseUse: jest.fn().mockResolvedValue(undefined),
    };
    const promotionUsageRepository = {
        create: jest.fn().mockResolvedValue(undefined),
        countByUser: jest.fn().mockResolvedValue(over.usedByUser ?? 0),
        deleteLast: jest.fn().mockResolvedValue(undefined),
    };

    return {
        service: new PricingService(promotionRepository as any, promotionUsageRepository as any),
        promotionRepository,
        promotionUsageRepository,
    };
};

const request = (over: Partial<IPricingRequest> = {}): IPricingRequest => ({
    lines: [productLine()],
    channel: OrderChannel.ONLINE,
    shippingPrice: 0,
    userId: 'u1',
    ...over,
});

describe('PricingService', () => {
    describe('no promotions', () => {
        it('leaves the cart untouched and adds shipping to the total', async () => {
            const { service } = build();

            const result = await service.price(
                request({ lines: [productLine({ unitPrice: 1000, quantity: 2 })], shippingPrice: 350 }),
            );

            expect(result.subTotalPrice).toBe(2000);
            expect(result.discountTotal).toBe(0);
            expect(result.totalPrice).toBe(2350);
            expect(result.lines[0].netTotal).toBe(2000);
            expect(result.appliedPromotions).toEqual([]);
        });
    });

    describe('automatic promotions', () => {
        it('applies a percentage off a matching category', async () => {
            const { service } = build({
                automatic: [
                    promotion({ scope: PromotionScope.CATEGORY, categories: ['cat1'], value: 10 }),
                ],
            });

            const result = await service.price(request());

            expect(result.discountTotal).toBe(100);
            expect(result.totalPrice).toBe(900);
            expect(result.lines[0].appliedPromotions).toHaveLength(1);
        });

        it('leaves a line of another category alone', async () => {
            const { service } = build({
                automatic: [
                    promotion({ scope: PromotionScope.CATEGORY, categories: ['other'], value: 10 }),
                ],
            });

            const result = await service.price(request());

            expect(result.discountTotal).toBe(0);
        });

        it('keeps only the best of two overlapping promotions', async () => {
            const { service } = build({
                automatic: [
                    promotion({ _id: 'small', value: 10 }),
                    promotion({ _id: 'big', value: 25 }),
                ],
            });

            const result = await service.price(request());

            // 25% wins outright; the two do not compound into 35%.
            expect(result.discountTotal).toBe(250);
            expect(result.lines[0].appliedPromotions).toHaveLength(1);
            expect(result.lines[0].appliedPromotions[0].promotion).toBe('big');
        });

        it('lets a different promotion win on each line', async () => {
            const { service } = build({
                automatic: [
                    promotion({ _id: 'cats', scope: PromotionScope.CATEGORY, categories: ['cat1'], value: 30 }),
                    promotion({ _id: 'all', value: 10 }),
                ],
            });

            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', categoryId: 'cat1', unitPrice: 1000 }),
                        productLine({ ref: '1', categoryId: 'cat2', unitPrice: 1000 }),
                    ],
                }),
            );

            expect(result.lines[0].discount).toBe(300);
            expect(result.lines[1].discount).toBe(100);
            expect(result.discountTotal).toBe(400);
        });

        it('ignores a promotion whose window has passed', async () => {
            const { service } = build({
                automatic: [
                    promotion({ endsAt: new Date('2020-01-01'), value: 50 }),
                ],
            });

            // findActiveAutomatic filters by date in Mongo, but the model is the
            // authority: a stale read must not discount anything.
            const result = await service.price(request());

            expect(result.discountTotal).toBe(0);
        });

        it('ignores a promotion below its minimum purchase', async () => {
            const { service } = build({
                automatic: [promotion({ minPurchase: 5000, value: 50 })],
            });

            const result = await service.price(request());

            expect(result.discountTotal).toBe(0);
        });

        it('ignores a promotion that ran out of uses', async () => {
            const { service } = build({
                automatic: [promotion({ usageLimit: 2, usedCount: 2, value: 50 })],
            });

            const result = await service.price(request());

            expect(result.discountTotal).toBe(0);
        });
    });

    describe('automatic promotions on combos', () => {
        it('reaches a combo line through the COMBOS scope', async () => {
            const { service } = build({
                automatic: [
                    promotion({ scope: PromotionScope.COMBOS, combos: ['combo1'], value: 10 }),
                ],
            });

            const result = await service.price(request({ lines: [comboLine({ unitPrice: 2000 })] }));

            expect(result.discountTotal).toBe(200);
        });

        it('reaches a combo line through ALL', async () => {
            const { service } = build({ automatic: [promotion({ value: 10 })] });

            const result = await service.price(request({ lines: [comboLine({ unitPrice: 2000 })] }));

            expect(result.discountTotal).toBe(200);
        });

        it('never reaches a combo through a category rule', async () => {
            const { service } = build({
                automatic: [
                    promotion({ scope: PromotionScope.CATEGORY, categories: ['cat1'], value: 50 }),
                ],
            });

            // The components inside the combo are already sold below list price;
            // discounting them again would take the same money off twice.
            const result = await service.price(request({ lines: [comboLine()] }));

            expect(result.discountTotal).toBe(0);
        });

        it('never reaches a combo through a product rule', async () => {
            const { service } = build({
                automatic: [
                    promotion({ scope: PromotionScope.PRODUCTS, products: ['p1'], value: 50 }),
                ],
            });

            const result = await service.price(request({ lines: [comboLine()] }));

            expect(result.discountTotal).toBe(0);
        });

        it('never reaches a loose product through a combo rule', async () => {
            const { service } = build({
                automatic: [
                    promotion({ scope: PromotionScope.COMBOS, combos: ['combo1'], value: 50 }),
                ],
            });

            const result = await service.price(request({ lines: [productLine()] }));

            expect(result.discountTotal).toBe(0);
        });
    });

    describe('FIXED promotions', () => {
        it('splits a flat amount across the lines it reaches', async () => {
            const { service } = build({
                automatic: [
                    promotion({ valueType: PromotionValueType.FIXED, value: 300 }),
                ],
            });

            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', unitPrice: 300 }),
                        productLine({ ref: '1', unitPrice: 100 }),
                    ],
                }),
            );

            // $300 off the order, not off each line: 3:1 by value.
            expect(result.lines[0].discount).toBe(225);
            expect(result.lines[1].discount).toBe(75);
            expect(result.discountTotal).toBe(300);
        });

        it('adds up to the exact amount when the split does not divide evenly', async () => {
            const { service } = build({
                automatic: [
                    promotion({ valueType: PromotionValueType.FIXED, value: 100 }),
                ],
            });

            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', unitPrice: 100 }),
                        productLine({ ref: '1', unitPrice: 100 }),
                        productLine({ ref: '2', unitPrice: 100 }),
                    ],
                }),
            );

            const sum = result.lines.reduce((acc, line) => acc + line.discount, 0);
            expect(Math.round(sum * 100) / 100).toBe(100);
            expect(result.discountTotal).toBe(100);
        });

        it('never takes more than the cart is worth', async () => {
            const { service } = build({
                automatic: [
                    promotion({ valueType: PromotionValueType.FIXED, value: 5000 }),
                ],
            });

            const result = await service.price(request({ lines: [productLine({ unitPrice: 300 })] }));

            expect(result.discountTotal).toBe(300);
            expect(result.totalPrice).toBe(0);
            expect(result.lines[0].netTotal).toBe(0);
        });

        it('only splits across the lines its scope reaches', async () => {
            const { service } = build({
                automatic: [
                    promotion({
                        valueType: PromotionValueType.FIXED,
                        value: 200,
                        scope: PromotionScope.CATEGORY,
                        categories: ['cat1'],
                    }),
                ],
            });

            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', categoryId: 'cat1', unitPrice: 1000 }),
                        productLine({ ref: '1', categoryId: 'cat2', unitPrice: 1000 }),
                    ],
                }),
            );

            expect(result.lines[0].discount).toBe(200);
            expect(result.lines[1].discount).toBe(0);
        });
    });

    describe('coupons', () => {
        it('stacks on top of the automatic discount, over what is left', async () => {
            const { service } = build({
                automatic: [promotion({ _id: 'auto', value: 10 })],
                byCode: promotion({ _id: 'coupon', code: 'BIENVENIDA', value: 10 }),
            });

            const result = await service.price(request({ couponCode: 'BIENVENIDA' }));

            // 10% of 1000 = 100, then 10% of the remaining 900 = 90. Not 200:
            // the coupon works on the net, so the order can never go below zero.
            expect(result.lines[0].discount).toBe(190);
            expect(result.discountTotal).toBe(190);
            expect(result.lines[0].appliedPromotions).toHaveLength(2);
            expect(result.coupon).toEqual({ code: 'BIENVENIDA', promotion: 'coupon' });
        });

        it('accepts a code typed in lower case', async () => {
            const { service, promotionRepository } = build({
                byCode: promotion({ _id: 'coupon', code: 'BIENVENIDA', value: 10 }),
            });

            const result = await service.price(request({ couponCode: '  bienvenida ' }));

            expect(promotionRepository.findByCode).toHaveBeenCalledWith('BIENVENIDA');
            expect(result.coupon?.code).toBe('BIENVENIDA');
        });

        it('reports an unknown code instead of throwing', async () => {
            const { service } = build({ byCode: null });

            const result = await service.price(request({ couponCode: 'NOEXISTE' }));

            expect(result.coupon).toBeNull();
            expect(result.couponError).toMatch(/no existe/i);
            expect(result.discountTotal).toBe(0);
        });

        it('reports an expired code', async () => {
            const { service } = build({
                byCode: promotion({ code: 'VIEJO', endsAt: new Date('2020-01-01') }),
            });

            const result = await service.price(request({ couponCode: 'VIEJO' }));

            expect(result.couponError).toMatch(/vencido/i);
        });

        it('reports a minimum purchase that is not met', async () => {
            const { service } = build({
                byCode: promotion({ code: 'GRANDE', minPurchase: 5000 }),
            });

            const result = await service.price(request({ couponCode: 'GRANDE' }));

            expect(result.couponError).toMatch(/compra mínima/i);
        });

        it('reports a code the customer already used up', async () => {
            const { service } = build({
                byCode: promotion({ code: 'UNAVEZ', usageLimitPerUser: 1 }),
                usedByUser: 1,
            });

            const result = await service.price(request({ couponCode: 'UNAVEZ' }));

            expect(result.couponError).toMatch(/máxima de veces/i);
        });

        it('skips the per-user limit on an anonymous counter sale', async () => {
            const { service, promotionUsageRepository } = build({
                byCode: promotion({ code: 'UNAVEZ', usageLimitPerUser: 1, value: 10 }),
            });

            const result = await service.price(
                request({ couponCode: 'UNAVEZ', userId: null, channel: OrderChannel.POS }),
            );

            expect(promotionUsageRepository.countByUser).not.toHaveBeenCalled();
            expect(result.discountTotal).toBe(100);
        });

        it('reports a code that matches nothing in the cart', async () => {
            const { service } = build({
                byCode: promotion({
                    code: 'SOLOVELAS',
                    scope: PromotionScope.CATEGORY,
                    categories: ['otra'],
                }),
            });

            const result = await service.price(request({ couponCode: 'SOLOVELAS' }));

            expect(result.coupon).toBeNull();
            expect(result.couponError).toMatch(/no aplica/i);
        });
    });

    describe('totals', () => {
        it('never discounts shipping', async () => {
            const { service } = build({
                automatic: [
                    promotion({ valueType: PromotionValueType.FIXED, value: 5000 }),
                ],
            });

            const result = await service.price(
                request({ lines: [productLine({ unitPrice: 1000 })], shippingPrice: 500 }),
            );

            expect(result.discountTotal).toBe(1000);
            expect(result.totalPrice).toBe(500);
        });

        it('keeps the line discounts and the order discount in agreement', async () => {
            const { service } = build({ automatic: [promotion({ value: 33 })] });

            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', unitPrice: 333.33 }),
                        productLine({ ref: '1', unitPrice: 66.67 }),
                    ],
                }),
            );

            const sum = result.lines.reduce((acc, line) => acc + line.discount, 0);
            expect(Math.round(sum * 100) / 100).toBe(result.discountTotal);
            expect(result.subTotalPrice - result.discountTotal).toBe(result.totalPrice);
        });

        it('rolls the per-line entries up to one row per promotion', async () => {
            const { service } = build({ automatic: [promotion({ _id: 'auto', value: 10 })] });

            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', unitPrice: 1000 }),
                        productLine({ ref: '1', unitPrice: 2000 }),
                    ],
                }),
            );

            expect(result.appliedPromotions).toHaveLength(1);
            expect(result.appliedPromotions[0].discount).toBe(300);
        });
    });

    describe('commitUsage', () => {
        it('burns one use and records who used it', async () => {
            const { service, promotionRepository, promotionUsageRepository } = build({
                automatic: [promotion({ _id: 'auto', value: 10 })],
            });
            const result = await service.price(request());

            await service.commitUsage(result, 'u1', 'o1');

            expect(promotionRepository.consumeUse).toHaveBeenCalledWith('auto');
            expect(promotionUsageRepository.create).toHaveBeenCalledWith({
                promotionId: 'auto',
                userId: 'u1',
                orderId: 'o1',
                discount: 100,
            });
        });

        it('rejects the sale when the last use was taken by someone else', async () => {
            const { service, promotionRepository } = build({
                automatic: [promotion({ _id: 'auto', value: 10 })],
            });
            promotionRepository.consumeUse.mockResolvedValue(false);
            const result = await service.price(request());

            await expect(service.commitUsage(result, 'u1')).rejects.toMatchObject({
                statusCode: 400,
            });
        });

        it('gives back what it already burnt when a later one loses the race', async () => {
            const { service, promotionRepository } = build({
                automatic: [
                    promotion({ _id: 'first', scope: PromotionScope.CATEGORY, categories: ['cat1'], value: 10 }),
                    promotion({ _id: 'second', scope: PromotionScope.CATEGORY, categories: ['cat2'], value: 10 }),
                ],
            });
            const result = await service.price(
                request({
                    lines: [
                        productLine({ ref: '0', categoryId: 'cat1' }),
                        productLine({ ref: '1', categoryId: 'cat2' }),
                    ],
                }),
            );
            promotionRepository.consumeUse
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);

            await expect(service.commitUsage(result, 'u1')).rejects.toMatchObject({
                statusCode: 400,
            });

            expect(promotionRepository.releaseUse).toHaveBeenCalledTimes(1);
            expect(promotionRepository.releaseUse).toHaveBeenCalledWith('first');
        });
    });
});
