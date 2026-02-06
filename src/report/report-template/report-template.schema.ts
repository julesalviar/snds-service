import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

// Centralize the paper sizes in a const array
const paperSizes = [
  'a0',
  'a1',
  'a2',
  'a3',
  'a4',
  'a5',
  'a6',
  'letter',
  'legal',
  'tabloid',
  'ledger',
] as const;

// Infer the union type from the array
type PaperSize = (typeof paperSizes)[number];

@Schema({ timestamps: true, collection: 'report_templates' })
export class ReportTemplate extends Document {
  @Prop()
  name: string;

  @Prop({ enum: ['portrait', 'landscape'], default: 'portrait' })
  orientation: string;

  @Prop({
    enum: paperSizes,
    default: 'a4',
  })
  paperSize: PaperSize;

  @Prop({ type: Array, default: [] })
  parameters: {
    name: string;
    type: string; // 'text' | 'date' | 'number' | 'select'
    label: string;
    value?: string;
  }[];

  @Prop()
  reportType: string;

  @Prop({ default: 1 })
  scale: number;

  @Prop({ type: Object })
  table: {
    columns: { header: string; field: string }[];
  };
}

export type ReportTemplateDocument = HydratedDocument<ReportTemplate>;
export const ReportTemplateSchema =
  SchemaFactory.createForClass(ReportTemplate);
