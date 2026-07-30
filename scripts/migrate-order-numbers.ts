/**
 * One-off migration: orders now carry `orderNumber`, a consecutive integer the
 * customer reads, instead of being identified by the tail of their ObjectId.
 *
 *   npm run migrate:order-numbers
 *
 * Idempotent. It only numbers documents that have no number yet, and it leaves
 * the `order` sequence sitting on the highest number in use, so the next checkout
 * continues from there. Raw collections on purpose: the Mongoose schema declares
 * `orderNumber` as required and would refuse to load the documents being fixed.
 *
 * Existing orders are numbered oldest first, so the numbers agree with the order
 * the shop actually took them in.
 */
import 'dotenv/config';
import mongoose from 'mongoose';

/** Must match ORDER_NUMBER_START in the order repository. */
const ORDER_NUMBER_START = 1000;

const ORDER_NUMBER_SEQUENCE = 'order';

async function main(): Promise<void> {
    const uri = process.env.MONGO_URI;

    if (!uri) throw new Error('MONGO_URI is not set');

    await mongoose.connect(uri);

    const orders = mongoose.connection.collection('order');
    // Typed explicitly: this sequence is keyed by name, so its `_id` is a string
    // and not the ObjectId the driver assumes by default.
    const counters = mongoose.connection.collection<{ _id: string; seq: number }>('counter');

    // Where to resume from: the highest number already handed out, or one below the
    // floor so the first order of an unnumbered shop lands exactly on it.
    const [highest] = await orders
        .find({ orderNumber: { $type: 'number' } })
        .sort({ orderNumber: -1 })
        .limit(1)
        .toArray();

    let next = Math.max(highest?.orderNumber ?? 0, ORDER_NUMBER_START - 1);

    const pending = await orders
        .find({ orderNumber: { $exists: false } })
        .sort({ createdAt: 1, _id: 1 })
        .toArray();

    for (const order of pending) {
        next += 1;
        await orders.updateOne({ _id: order._id }, { $set: { orderNumber: next } });
        console.log(`${order._id}: numbered ${next}`);
    }

    console.log(`${pending.length} orders numbered`);

    // The sequence has to end up at or above every number in use, otherwise the
    // next checkout would collide with the unique index.
    await counters.updateOne({ _id: ORDER_NUMBER_SEQUENCE }, { $max: { seq: next } }, { upsert: true });

    console.log(`Sequence "${ORDER_NUMBER_SEQUENCE}" left at ${next}, next order will be ${next + 1}`);

    const leftovers = await orders.countDocuments({ orderNumber: { $exists: false } });

    if (leftovers) {
        console.warn(`${leftovers} orders are still unnumbered, review them by hand`);
    }

    await mongoose.disconnect();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
