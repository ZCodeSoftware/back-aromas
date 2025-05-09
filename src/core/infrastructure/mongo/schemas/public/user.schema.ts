import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { CatRole } from "../catalogs/cat-role.schema";

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'user', timestamps: true })
export class User {
    @Prop({ required: false, name: 'firstname', type: String, default: null })
    firstname: string;

    @Prop({ required: false, name: 'lastname', type: String, default: null })
    lastname: string;

    @Prop({ required: true, name: 'email', type: String, unique: true })
    email: string;

    @Prop({ required: true, name: 'password', type: String })
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
}

export const UserSchema = SchemaFactory.createForClass(User);
