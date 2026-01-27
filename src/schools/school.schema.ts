import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class School extends Document {
  @Prop({ required: true })
  schoolId: number;

  @Prop()
  createdByUserId: string;

  @Prop({ required: true })
  schoolName: string;

  @Prop()
  region: string;

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
  contactNumber: string;

  @Prop({ required: true })
  officialEmailAddress: string;

  @Prop()
  location: string;

  @Prop()
  profileDocUrl: string;

  @Prop()
  logoUrl: string;
}

export type SchoolDocument = HydratedDocument<School>;
export const SchoolSchema = SchemaFactory.createForClass(School);

SchoolSchema.index({ schoolId: 1 });
SchoolSchema.index({ schoolName: 1 }, { unique: true });
SchoolSchema.index({ officialEmailAddress: 1 }, { unique: true });
