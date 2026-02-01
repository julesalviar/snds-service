import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_invites' })
export class UserInvite extends Document {
  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true, default: () => new Date() })
  sentAt: Date;

  @Prop({ default: 'sent' })
  status: 'sent' | 'accepted';
}

export type UserInviteDocument = HydratedDocument<UserInvite>;
export const UserInviteSchema = SchemaFactory.createForClass(UserInvite);

UserInviteSchema.index({ email: 1 }, { unique: false });
