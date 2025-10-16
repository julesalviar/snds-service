import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'school_summaries' })
export class SchoolSummary extends Document {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    match: /^\d{4}-\d{4}$|^ALL_TIME$/,
  })
  schoolYear: string; // Format: "2024-2025" or "ALL_TIME"

  @Prop({ required: true, default: 0 })
  totalNeedQuantity: number; // Sum of school-need.quantity

  @Prop({ required: true, default: 0 })
  totalEngagementQuantity: number; // Sum of engagement.quantity

  @Prop({ required: true, default: 0, min: 0, max: 100 })
  accomplishmentPercentage: number; // Calculated: min((totalEngagement / totalNeed) * 100, 100)

  @Prop({ required: true, default: 0 })
  needCount: number; // Count of school needs

  @Prop({ required: true, default: 0 })
  engagementCount: number; // Count of engagements

  @Prop({ required: true, default: 0 })
  aipCount: number;

  @Prop({ default: 0 })
  version: number; // For optimistic locking in high-concurrency scenarios
}

export type SchoolSummaryDocument = HydratedDocument<SchoolSummary>;
export const SchoolSummarySchema = SchemaFactory.createForClass(SchoolSummary);

// Compound unique index: One summary per school per school year
SchoolSummarySchema.index({ schoolId: 1, schoolYear: 1 }, { unique: true });

// Index for querying current year summaries
SchoolSummarySchema.index({ schoolYear: 1 });

// Index for school lookups
SchoolSummarySchema.index({ schoolId: 1 });
