import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatRole } from "../catalogs/cat-role.schema";
import { Address } from "./address.schema";

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'user', timestamps: true })
export class User {
    @Prop({ required: false, type: String, default: null })
    firstName: string;

    @Prop({ required: false, type: String, default: null })
    lastName: string;

    @Prop({ required: true, name: 'email', type: String, unique: true })
    email: string;

    /**
     * `select: false` so no query can leak the hash by accident. The login lookup
     * asks for it explicitly with `.select('+password')`.
     */
    @Prop({ required: true, name: 'password', type: String, select: false })
    password: string;

    @Prop({ required: false, name: 'phone', type: String, default: null })
    phone: string;

    @Prop({ required: true, name: 'is_active', type: Boolean, default: true })
    isActive: boolean;

    @Prop({ required: false, name: 'newsletter', type: Boolean, default: false })
    newsletter: boolean;

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CatRole' }],
        required: true,
        name: 'roles',
        default: [],
    })
    roles: CatRole[];

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }],
        required: false,
        name: 'address',
        default: [],
    })
    address?: Address[];
}

export const UserSchema = SchemaFactory.createForClass(User);
