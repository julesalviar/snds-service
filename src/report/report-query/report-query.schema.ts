import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'report_queries' })
export class ReportQuery extends Document {
  @Prop({ required: true })
  modelName: string;

  @Prop({ type: Array, required: true })
  queries: (
    | {
        type: 'find';
        filter: Record<string, any>;
        projection?: Record<string, any>;
        populate?: { path: string; select?: string }[];
        sort?: Record<string, 1 | -1>;
        limit?: number | string;
        skip?: number | string;
      }
    | { type: 'count'; filter: Record<string, any> }
    | { type: 'aggregate'; pipeline: Record<string, any>[] }
  )[];
}

export type ReportQueryDocument = HydratedDocument<ReportQuery>;
export const ReportQuerySchema = SchemaFactory.createForClass(ReportQuery);
