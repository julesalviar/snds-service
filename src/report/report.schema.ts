import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'reports' })
export class Report extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ReportTemplate', _id: false })
  reportTemplateId: Types.ObjectId;

  @Prop()
  reportQueryId: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [String], default: [] })
  allowedRoles?: string[];

  @Prop({ type: [String], default: [] })
  allowedPermissions?: string[];
}

export type ReportDocument = HydratedDocument<Report>;
export const ReportSchema = SchemaFactory.createForClass(Report);

ReportSchema.index({ reportTemplateId: 1 });
ReportSchema.index({ reportQueryId: 1 });
