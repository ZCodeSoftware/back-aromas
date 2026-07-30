import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";


export type CatOrderStatusDocument = HydratedDocument<CatOrderStatus>;

@Schema({ collection: 'cat_order_status', timestamps: true })
export class CatOrderStatus {
    /**
     * Stable key the code reads by (PENDING, PAID, ...). Unique and never edited
     * through the ABM: the whole order lifecycle is keyed on it.
     */
    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    code: string;

    /** Label shown to a human. This is the part an admin may rewrite. */
    @Prop({ required: true })
    name: string;

    /** Display order of the lifecycle, so a listing does not sort alphabetically. */
    @Prop({ required: false, type: Number, default: 0 })
    sortOrder: number;

    @Prop({ required: false, type: Boolean, default: true })
    isActive: boolean;
}

export const CatOrderStatusSchema = SchemaFactory.createForClass(CatOrderStatus);
