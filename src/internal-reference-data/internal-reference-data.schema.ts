import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'internal_reference_data' })
export class InternalReferenceData {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value: any;

  @Prop({ required: true })
  active: boolean;
}

export type InternalReferenceDataDocument =
  HydratedDocument<InternalReferenceData>;
export const InternalReferenceDataSchema = SchemaFactory.createForClass(
  InternalReferenceData,
);
