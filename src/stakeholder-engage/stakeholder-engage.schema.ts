import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'stakeholder_engage' })
export class StakeholderEngage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SchoolNeed', required: true })
  schoolNeedId: Types.ObjectId;

  @Prop({ required: true })
  code: number;

  @Prop({ required: true })
  donatedAmount: number;

  @Prop({ required: true })
  typeOfStakeholder: string;

  @Prop({ required: true })
  amountContributionOrAppraisedValue: number;

  @Prop({ required: true })
  unitMeasure: string;

  @Prop({ required: true })
  moaSigningDate: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

  @Prop()
  createdAt: Date;
}

export type StakeholderEngageDocument = HydratedDocument<StakeholderEngage>;
export const StakeholderEngageSchema =
  SchemaFactory.createForClass(StakeholderEngage);
