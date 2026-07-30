import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type CounterDocument = HydratedDocument<Counter>;

/**
 * Named sequences, one document per sequence. Exists because an order number has
 * to be a short consecutive integer a customer can read out over the phone, and
 * nothing in a MongoDB document gives that: the ObjectId is hexadecimal and its
 * timestamp is neither consecutive nor unique within a second.
 *
 * The `_id` is the sequence name, so allocating is a single upsert on a known key
 * and two concurrent checkouts can never be handed the same number.
 */
@Schema({ collection: 'counter', versionKey: false })
export class Counter {
    @Prop({ required: true, type: String })
    _id: string;

    @Prop({ required: true, type: Number, default: 0 })
    seq: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
