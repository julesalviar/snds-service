import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class School extends Document {
  @Prop({ required: true })
  region: string;
  @Prop({ required: true })
  division: string;
  @Prop({ required: true })
  districtOrCluster: string;
  @Prop({ required: true })
  schoolName: string;
  @Prop({ required: true, unique: true })
  schoolId: string;
  @Prop({ required: true })
  schoolOffering: string;
  @Prop({ required: true })
  accountablePerson: string;
  @Prop({ required: true })
  designation: string;
  @Prop({ required: true })
  contactNumber: string;
  @Prop({ required: true })
  officialEmailAddress: string;
  @Prop({ required: true })
  password: string;
}
export type SchoolDocument = HydratedDocument<School>;
export const SchoolSchema = SchemaFactory.createForClass(School);
