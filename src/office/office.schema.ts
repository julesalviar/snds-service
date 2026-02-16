import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'offices' })
export class Office extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  division: string;
}

export type OfficeDocument = HydratedDocument<Office>;
export const OfficeSchema = SchemaFactory.createForClass(Office);
