import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';
import { ActivityType } from './activity-type.enum';

@Schema({ timestamps: true, collection: 'activities' })
export class Activity extends Document {
  @Prop({ required: true, unique: true })
  activityNumber: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ActivityType,
    default: ActivityType.PARTNERSHIP_ENGAGEMENT,
  })
  type: ActivityType;

  @Prop({ default: true })
  active?: boolean;

  @Prop({ default: false })
  hasTime?: boolean;

  @Prop()
  startDatetime?: string;

  @Prop()
  endDatetime?: string;

  @Prop()
  location?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  stakeholderId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'School' })
  schoolId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;

  @Prop()
  updatedBy?: string;
}

export type ActivityDocument = HydratedDocument<Activity>;
export const ActivitySchema = SchemaFactory.createForClass(Activity);
