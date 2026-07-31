import { round2 } from "../../../core/domain/utils/money.util";
import { IPricingLineInput, IPricingResult } from "../../../promotion/domain/types/pricing.type";
import { OrderItemType } from "../enum/order-item-type.enum";
import { OrderItemModel } from "../models/order-item.model";
import { OrderModel } from "../models/order.model";
import { ISaleLine, IStockLine } from "../types/order.type";

/**
 * The key that makes two lines "the same line". Product and combo ids live in
 * different collections, so the type has to be part of the key: without it a
 * combo could collide with a product that happened to share an id.
 */
export const saleLineKey = (line: { itemType: OrderItemType; productId?: string; comboId?: string }): string =>
    `${line.itemType}:${line.itemType === OrderItemType.COMBO ? line.comboId : line.productId}`;

/**
 * Product units a set of validated sale lines will move. Combos are expanded
 * into their components, and repeated products are summed, so the caller hands
 * stock reservation one line per product and never asks for the same stock twice.
 */
export const toStockLines = (lines: ISaleLine[]): IStockLine[] => {
    const merged = new Map<string, IStockLine>();

    const add = (productId: string, quantity: number, name: string) => {
        const existing = merged.get(productId);

        if (existing) {
            existing.quantity += quantity;
            return;
        }

        merged.set(productId, { productId, quantity, name });
    };

    for (const line of lines) {
        if (line.itemType === OrderItemType.COMBO) {
            line.combo.components.forEach((component) =>
                add(
                    String(component.product?._id ?? component.product),
                    component.quantity * line.quantity,
                    component.name,
                ),
            );
            continue;
        }

        add(line.product._id, line.quantity, line.product.name);
    }

    return [...merged.values()];
};

/** Turns a validated sale line into the immutable snapshot the order stores. */
export const toOrderItem = (line: ISaleLine): OrderItemModel => {
    if (line.itemType === OrderItemType.COMBO) {
        return OrderItemModel.createCombo({
            combo: { _id: line.combo._id },
            name: line.combo.name,
            unitPrice: line.combo.price,
            quantity: line.quantity,
            components: line.combo.components,
        });
    }

    return OrderItemModel.create({
        product: { _id: line.product._id },
        name: line.product.name,
        unitPrice: line.product.price,
        quantity: line.quantity,
    });
};

/**
 * Describes the sale to the pricing engine. `ref` is the array index, which is
 * what lets two lines of the same product be told apart on the way back.
 */
export const toPricingLines = (lines: ISaleLine[]): IPricingLineInput[] =>
    lines.map((line, index) => {
        const ref = String(index);

        if (line.itemType === OrderItemType.COMBO) {
            return {
                ref,
                itemType: OrderItemType.COMBO,
                comboId: line.combo._id,
                quantity: line.quantity,
                unitPrice: line.combo.price,
                total: round2(line.combo.price * line.quantity),
            };
        }

        return {
            ref,
            itemType: OrderItemType.PRODUCT,
            productId: line.product._id,
            categoryId: line.product.category,
            subCategoryId: line.product.subCategory,
            quantity: line.quantity,
            unitPrice: line.product.price,
            total: round2(line.product.price * line.quantity),
        };
    });

/**
 * Writes the engine's verdict onto an order that already holds its lines, in the
 * same order they were added — which is the order `toPricingLines` numbered them.
 */
export const applyPricing = (order: OrderModel, pricing: IPricingResult, coupon?: string): void => {
    order.items.forEach((item, index) => {
        const priced = pricing.lines.find((line) => line.ref === String(index));

        if (priced) item.applyDiscount(priced.discount, priced.appliedPromotions);
    });

    order.setPromotions(pricing.appliedPromotions, coupon);
};
