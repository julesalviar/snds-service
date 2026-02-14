import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { PlanClassification } from 'src/ppa-plan/plan-classification.enum';
import { PlanImplementationStatus } from 'src/ppa-plan/plan-implementation-status.enum';
import { PlanParticipant } from 'src/ppa-plan/plan-participant.enum';

@Schema({ timestamps: true, collection: 'ppa_plans' })
export class PpaPlan {
  @Prop({ required: true })
  kra: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  activity: string;

  @Prop({ required: true })
  objective: string;

  @Prop({
    required: true,
    type: String,
    enum: PlanClassification,
  })
  classification: PlanClassification;

  @Prop({ required: true })
  expectedOutput: string;

  @Prop({ required: false })
  implementationStartDate: string; // ISO Date

  @Prop({ required: false })
  implementationEndDate: string; // ISO Date

  @Prop()
  budgetaryRequirement: number;

  @Prop()
  materialsAndSupplies: string;

  @Prop()
  fundSource: string;

  @Prop({
    required: true,
    type: [String],
    enum: PlanParticipant,
  })
  participants: PlanParticipant[];

  @Prop()
  supportNeed: string;

  @Prop()
  supportReceivedValue: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  stakeholderUserId: Types.ObjectId;

  @Prop()
  amountUtilized: number;

  @Prop({
    required: true,
    type: String,
    enum: PlanImplementationStatus,
  })
  implementationStatus: PlanImplementationStatus;

  @Prop()
  factors: string;

  @Prop()
  timeliness: string;

  @Prop({ type: [String], default: [] })
  reportUrls: string[];

  @Prop({ type: [String], default: [] })
  allowedRoles: string[];
}

export type PpaPlanDocument = HydratedDocument<PpaPlan>;
export const PpaPlanSchema = SchemaFactory.createForClass(PpaPlan);
