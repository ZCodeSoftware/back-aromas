import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { BaseErrorException } from "../../../core/domain/exceptions/base.error.exception";
import { round2 } from "../../../core/domain/utils/money.util";
import { PromotionValueType } from "../../domain/enum/promotion-value-type.enum";
import { PromotionModel } from "../../domain/models/promotion.model";
import { IPromotionUsageRepository } from "../../domain/repositories/promotion-usage.interface.repository";
import { IPromotionRepository } from "../../domain/repositories/promotion.interface.repository";
import { IPricingService } from "../../domain/services/pricing.interface.service";
import {
    IAppliedPromotion,
    IPricedLine,
    IPricingLineInput,
    IPricingRequest,
    IPricingResult,
} from "../../domain/types/pricing.type";
import { allocate } from "../../domain/utils/allocate.util";
import SymbolsPromotion from "../../symbols-promotion";

/** Working copy of a line while the discounts are being stacked onto it. */
interface IWorkingLine {
    input: IPricingLineInput;
    discount: number;
    appliedPromotions: IAppliedPromotion[];
}

@Injectable()
export class PricingService implements IPricingService {
    private readonly logger = new Logger(PricingService.name);

    constructor(
        @Inject(SymbolsPromotion.IPromotionRepository)
        private readonly promotionRepository: IPromotionRepository,
        @Inject(SymbolsPromotion.IPromotionUsageRepository)
        private readonly promotionUsageRepository: IPromotionUsageRepository,
    ) { }

    /**
     * Order of operations, and why:
     *   1. the best automatic promotion per line — they do not stack, so two
     *      overlapping sales cannot compound into a price nobody intended;
     *   2. the coupon on top, over what is left of the line, which is the one
     *      discount the buyer explicitly asked for;
     *   3. totals, with shipping added last and never discounted.
     */
    async price(request: IPricingRequest): Promise<IPricingResult> {
        const lines: IWorkingLine[] = request.lines.map((input) => ({
            input,
            discount: 0,
            appliedPromotions: [],
        }));

        const subTotalPrice = round2(lines.reduce((acc, line) => acc + line.input.total, 0));

        await this.applyAutomatic(lines, subTotalPrice);

        const { coupon, couponError } = await this.applyCoupon(lines, subTotalPrice, request);

        const discountTotal = round2(lines.reduce((acc, line) => acc + line.discount, 0));
        const shippingPrice = round2(request.shippingPrice ?? 0);

        return {
            subTotalPrice,
            discountTotal,
            shippingPrice,
            totalPrice: round2(subTotalPrice - discountTotal + shippingPrice),
            lines: lines.map(
                (line): IPricedLine => ({
                    ref: line.input.ref,
                    discount: line.discount,
                    netTotal: round2(line.input.total - line.discount),
                    appliedPromotions: line.appliedPromotions,
                }),
            ),
            appliedPromotions: this.consolidate(lines),
            coupon,
            ...(couponError ? { couponError } : {}),
        };
    }

    /**
     * Burns one use of each promotion. Run before the order is written so that a
     * coupon which just ran out fails the sale before any stock is taken; anything
     * already burnt is handed back if a later one loses the race.
     */
    async commitUsage(result: IPricingResult, userId?: string | null, orderId?: string): Promise<void> {
        const consumed: IAppliedPromotion[] = [];

        for (const applied of result.appliedPromotions) {
            const taken = await this.promotionRepository.consumeUse(applied.promotion);

            if (!taken) {
                await this.revertUsage({ ...result, appliedPromotions: consumed }, userId);
                throw new BaseErrorException(
                    `The promotion ${applied.name} has run out of uses`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            consumed.push(applied);
            await this.promotionUsageRepository.create({
                promotionId: applied.promotion,
                userId: userId ?? null,
                orderId,
                discount: applied.discount,
            });
        }
    }

    /** Best effort, like stock release: a failure here is logged, never thrown. */
    async revertUsage(result: IPricingResult, userId?: string | null): Promise<void> {
        for (const applied of result.appliedPromotions) {
            try {
                await this.promotionRepository.releaseUse(applied.promotion);
                await this.promotionUsageRepository.deleteLast(applied.promotion, userId ?? null);
            } catch (error) {
                this.logger.error(
                    `Could not give back a use of promotion ${applied.promotion}`,
                    error?.stack,
                );
            }
        }
    }

    /**
     * One automatic promotion per line: the one that takes the most off it. They
     * are deliberately not stacked — overlapping sales would otherwise compound,
     * and the shop owner has no way to reason about the resulting price.
     */
    private async applyAutomatic(lines: IWorkingLine[], subTotalPrice: number): Promise<void> {
        const now = new Date();
        // The repository already filters by state and date, but the model is
        // re-checked here on purpose: it is the authority on when a promotion is
        // in force, and money must not depend on a query being written correctly.
        const promotions = (await this.promotionRepository.findActiveAutomatic(now)).filter(
            (promotion) =>
                promotion.isActive &&
                promotion.isValidAt(now) &&
                promotion.reachesMinPurchase(subTotalPrice) &&
                promotion.hasUsesLeft,
        );

        if (!promotions.length) return;

        // Each candidate is costed over every line it reaches, so a FIXED amount is
        // split before the winners are picked and the comparison stays honest.
        const candidates = promotions.map((promotion) => ({
            promotion,
            shares: this.shares(promotion, lines),
        }));

        lines.forEach((line, index) => {
            let best: { promotion: PromotionModel; discount: number } | null = null;

            for (const candidate of candidates) {
                const discount = candidate.shares[index];

                if (discount > 0 && (!best || discount > best.discount)) {
                    best = { promotion: candidate.promotion, discount };
                }
            }

            if (best) this.applyToLine(line, best.promotion, best.discount);
        });
    }

    private async applyCoupon(
        lines: IWorkingLine[],
        subTotalPrice: number,
        request: IPricingRequest,
    ): Promise<{ coupon: IPricingResult['coupon']; couponError?: string }> {
        const code = request.couponCode?.trim().toUpperCase();

        if (!code) return { coupon: null };

        const promotion = await this.promotionRepository.findByCode(code);
        const error = await this.rejectionReason(promotion, subTotalPrice, request.userId);

        if (error) return { coupon: null, couponError: error };

        const shares = this.shares(promotion, lines);
        const total = round2(shares.reduce((acc, share) => acc + share, 0));

        if (total <= 0) {
            return {
                coupon: null,
                couponError: 'El cupón no aplica a ninguno de los productos de tu carrito.',
            };
        }

        lines.forEach((line, index) => {
            if (shares[index] > 0) this.applyToLine(line, promotion, shares[index]);
        });

        return { coupon: { code, promotion: promotion.promotionId } };
    }

    /**
     * Why a coupon cannot be used, in the buyer's language. Returns null when it
     * can. Deliberately specific: "expired" and "not found" send the customer to
     * very different next steps.
     */
    private async rejectionReason(
        promotion: PromotionModel | null,
        subTotalPrice: number,
        userId?: string | null,
    ): Promise<string | null> {
        if (!promotion || !promotion.isActive) {
            return 'El cupón no existe o ya no está disponible.';
        }

        if (!promotion.isValidAt()) {
            return 'El cupón está vencido o todavía no empezó.';
        }

        if (!promotion.reachesMinPurchase(subTotalPrice)) {
            return `El cupón requiere una compra mínima de $${promotion.minPurchase}.`;
        }

        if (!promotion.hasUsesLeft) {
            return 'El cupón alcanzó su límite de usos.';
        }

        if (promotion.usageLimitPerUser !== undefined && userId) {
            const used = await this.promotionUsageRepository.countByUser(
                promotion.promotionId,
                userId,
            );

            if (used >= promotion.usageLimitPerUser) {
                return 'Ya usaste este cupón la cantidad máxima de veces.';
            }
        }

        return null;
    }

    /**
     * What a promotion takes off each line, in line order. PERCENTAGE is computed
     * per line; FIXED is an order-level amount split across the lines it reaches,
     * in proportion to what each is still worth — `$500 off` has to take $500 from
     * the order, not $500 from every line.
     */
    private shares(promotion: PromotionModel, lines: IWorkingLine[]): number[] {
        const nets = lines.map((line) =>
            promotion.matches(line.input) ? round2(line.input.total - line.discount) : 0,
        );

        if (promotion.valueType === PromotionValueType.PERCENTAGE) {
            return nets.map((net) => (net > 0 ? promotion.discountFor(net) : 0));
        }

        const reachable = round2(nets.reduce((acc, net) => acc + net, 0));

        // Capped at what the matching lines are worth: a $500 coupon on a $300
        // cart takes $300, never leaving a negative line behind.
        return allocate(Math.min(promotion.value, reachable), nets);
    }

    private applyToLine(line: IWorkingLine, promotion: PromotionModel, discount: number): void {
        const capped = round2(Math.min(discount, round2(line.input.total - line.discount)));

        if (capped <= 0) return;

        line.discount = round2(line.discount + capped);
        line.appliedPromotions.push({
            promotion: promotion.promotionId,
            code: promotion.code,
            name: promotion.name,
            valueType: promotion.valueType,
            value: promotion.value,
            scope: promotion.scope,
            discount: capped,
        });
    }

    /** The per-line entries rolled up to one row per promotion, for the order. */
    private consolidate(lines: IWorkingLine[]): IAppliedPromotion[] {
        const byPromotion = new Map<string, IAppliedPromotion>();

        for (const line of lines) {
            for (const applied of line.appliedPromotions) {
                const existing = byPromotion.get(applied.promotion);

                if (existing) {
                    existing.discount = round2(existing.discount + applied.discount);
                    continue;
                }

                byPromotion.set(applied.promotion, { ...applied });
            }
        }

        return [...byPromotion.values()];
    }
}
