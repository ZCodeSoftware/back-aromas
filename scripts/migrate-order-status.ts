/**
 * One-off migration: `order.status` used to be the plain string of an enum and is
 * now an ObjectId pointing at `cat_order_status`.
 *
 *   npm run migrate:order-status
 *
 * Idempotent. It matches documents whose status is still a string, so running it
 * twice is a no-op, and it seeds any catalogue row that is missing before moving
 * anything. Raw collections on purpose: the Mongoose schema already declares the
 * new type and would refuse to cast the old values.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const ORDER_STATUSES = [
    { code: 'PENDING', name: 'Pendiente', sortOrder: 1 },
    { code: 'PAID', name: 'Pagado', sortOrder: 2 },
    { code: 'SHIPPED', name: 'Enviado', sortOrder: 3 },
    { code: 'DELIVERED', name: 'Entregado', sortOrder: 4 },
    { code: 'CANCELLED', name: 'Cancelado', sortOrder: 5 },
    { code: 'REFUNDED', name: 'Reembolsado', sortOrder: 6 },
];

async function main(): Promise<void> {
    const uri = process.env.MONGO_URI;

    if (!uri) throw new Error('MONGO_URI is not set');

    await mongoose.connect(uri);

    const catalogue = mongoose.connection.collection('cat_order_status');
    const orders = mongoose.connection.collection('order');

    await catalogue.bulkWrite(
        ORDER_STATUSES.map((status) => ({
            updateOne: {
                filter: { code: status.code },
                update: { $setOnInsert: { ...status, isActive: true, createdAt: new Date(), updatedAt: new Date() } },
                upsert: true,
            },
        })),
    );

    for (const { code } of ORDER_STATUSES) {
        const row = await catalogue.findOne({ code });

        if (!row) throw new Error(`Order status ${code} could not be seeded`);

        // The filter only matches the old string value: an already migrated
        // document holds an ObjectId, which never equals the code.
        const { modifiedCount } = await orders.updateMany({ status: code }, { $set: { status: row._id } });

        console.log(`${code}: ${modifiedCount} orders migrated`);
    }

    const leftovers = await orders.countDocuments({ status: { $type: 'string' } });

    if (leftovers) {
        console.warn(`${leftovers} orders still hold a status that is not in the catalogue, review them by hand`);
    }

    await mongoose.disconnect();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
