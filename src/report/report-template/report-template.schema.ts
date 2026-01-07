import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'report_templates' })
export class ReportTemplate extends Document {
  @Prop()
  name: string;

  @Prop({ enum: ['portrait', 'landscape'], default: 'portrait' })
  orientation: string;

  @Prop({ enum: ['A4', 'Letter', 'Legal'], default: 'A4' })
  paperSize: string;

  @Prop({ type: Array, default: [] })
  parameters: {
    name: string;
    type: string; // 'text' | 'date' | 'number' | 'select'
    label: string;
    value?: string;
  }[];

  @Prop()
  reportType: string;

  @Prop({ type: Object })
  table: {
    columns: { header: string; field: string }[];
  };
}

export type ReportTemplateDocument = HydratedDocument<ReportTemplate>;
export const ReportTemplateSchema =
  SchemaFactory.createForClass(ReportTemplate);
