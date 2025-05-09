import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CatRoleDocument = HydratedDocument<CatRole>;

@Schema({ collection: 'cat_roles', timestamps: true })
export class CatRole {
  @Prop({ unique: true })
  name: string;
}

export const CatRoleSchema = SchemaFactory.createForClass(CatRole);
