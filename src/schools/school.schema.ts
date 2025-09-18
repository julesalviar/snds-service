import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class School extends Document {
  @Prop({ required: true, unique: true })
  schoolId: number;

  @Prop()
  createdByUserId: string;

  @Prop({ required: true, unique: true })
  schoolName: string;

  @Prop()
  division: string;

  @Prop()
  districtOrCluster: string;

  @Prop()
  schoolOffering: string;

  @Prop()
  accountablePerson: string;

  @Prop()
  designation: string;

  @Prop()
  contactNumber: String;

  @Prop({ required: true, unique: true })
  officialEmailAddress: string;
}

export type SchoolDocument = HydratedDocument<School>;
export const SchoolSchema = SchemaFactory.createForClass(School);
