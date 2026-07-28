import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatTypeHousing } from "../catalogs/cat-type-housing.schema";
import { Geo } from "./geo.schema";

export type AddressDocument = HydratedDocument<Address>;

@Schema({ collection: 'address', timestamps: true })
export class Address {
    @Prop({ type: String, required: false })
    name?: string;

    @Prop({ type: String, required: true })
    street: string;

    @Prop({ type: Number, required: false })
    number?: number;

    @Prop({ type: String, required: true })
    zipCode: string;

    @Prop({ type: String, required: false })
    description?: string;

    @Prop({ type: String, required: false })
    floorAddress?: string;

    /** Soft-delete flag, defaulted like every other collection so the client need not send it. */
    @Prop({ type: Boolean, required: true, default: true })
    isActive: boolean;

    @Prop({ type: Boolean, required: false, default: true })
    isAble: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'CatTypeHousing' })
    typeOfHousing?: CatTypeHousing;

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Geo' })
    geo?: Geo;
}

export const AddressSchema = SchemaFactory.createForClass(Address);