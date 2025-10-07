import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'engagements' })
export class Engagement extends Document {
  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  stakeholderUserId: Types.ObjectId;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true })
  signingDate: string;

  @Prop()
  startDate?: string;

  @Prop()
  endDate?: string;

  @Prop({ type: Types.ObjectId, ref: 'SchoolNeed' })
  schoolNeedId?: Types.ObjectId;
}

export type EngagementDocument = HydratedDocument<Engagement>;
export const EngagementSchema = SchemaFactory.createForClass(Engagement);
