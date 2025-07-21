import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class ReferenceData {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, required: true })
  value: any;

  @Prop({ required: true })
  active: boolean;
}

export type ReferenceDataDocument = HydratedDocument<ReferenceData>;
export const ReferenceDataSchema = SchemaFactory.createForClass(ReferenceData);
