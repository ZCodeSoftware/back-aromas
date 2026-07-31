/**
 * One-off migration for the combos and discounts feature. Backfills the fields
 * added to `order` and `cart`, none of which existed before:
 *
 *   - order.items[].itemType   -> 'PRODUCT'   (every past line was a product)
 *   - order.items[].netTotal   -> items[].total  (nothing was ever discounted)
 *   - order.items[].discount / components / appliedPromotions -> empty defaults
 *   - order.discountTotal      -> 0
 *   - cart.items[].itemType    -> 'PRODUCT'
 *
 *   npm run migrate:pricing-fields
 *
 * Idempotent: every filter looks for the absence of the field, so a second run
 * matches nothing. The models already default these on read, which keeps the API
 * correct without the migration — this is what makes the stored documents match,
 * so the aggregation pipelines in analytics can filter on `items.itemType`
 * instead of having to special-case a missing one.
 *
 * Raw collections on purpose, like migrate-order-status.ts: this bypasses schema
 * casting and lets the positional-all operator touch every embedded line.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

async function main(): Promise<void> {
    const uri = process.env.MONGO_URI;

    if (!uri) throw new Error('MONGO_URI is not set');

    await mongoose.connect(uri);

    const orders = mongoose.connection.collection('order');
    const carts = mongoose.connection.collection('cart');

    // An aggregation pipeline update, so netTotal can be read off `total` of the
    // same line. `$map` rebuilds the array because `$[]` cannot copy across fields.
    const orderLines = await orders.updateMany(
        { 'items.itemType': { $exists: false }, items: { $ne: [] } },
        [
            {
                $set: {
                    items: {
                        $map: {
                            input: '$items',
                            as: 'item',
                            in: {
                                $mergeObjects: [
                                    '$$item',
                                    {
                                        itemType: { $ifNull: ['$$item.itemType', 'PRODUCT'] },
                                        discount: { $ifNull: ['$$item.discount', 0] },
                                        netTotal: { $ifNull: ['$$item.netTotal', '$$item.total'] },
                                        components: { $ifNull: ['$$item.components', []] },
                                        appliedPromotions: { $ifNull: ['$$item.appliedPromotions', []] },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
        ],
    );

    console.log(`order: ${orderLines.modifiedCount} orders had their lines backfilled`);

    const orderTotals = await orders.updateMany(
        { discountTotal: { $exists: false } },
        { $set: { discountTotal: 0, appliedPromotions: [] } },
    );

    console.log(`order: ${orderTotals.modifiedCount} orders had their discount totals initialised`);

    const cartLines = await carts.updateMany(
        { 'items.itemType': { $exists: false }, items: { $ne: [] } },
        { $set: { 'items.$[].itemType': 'PRODUCT' } },
    );

    console.log(`cart: ${cartLines.modifiedCount} carts had their lines backfilled`);

    const leftovers = await orders.countDocuments({
        items: { $elemMatch: { itemType: { $exists: false } } },
    });

    if (leftovers) {
        console.warn(`${leftovers} orders still hold a line with no itemType, review them by hand`);
    }

    await mongoose.disconnect();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
