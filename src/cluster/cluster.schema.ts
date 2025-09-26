import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'clusters' })
export class Cluster extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  division: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export type ClusterDocument = HydratedDocument<Cluster>;
export const ClusterSchema = SchemaFactory.createForClass(Cluster);
