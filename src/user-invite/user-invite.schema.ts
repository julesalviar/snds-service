import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'user_invites' })
export class UserInvite extends Document {
  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true, default: () => new Date() })
  sentAt: Date;

  @Prop({ default: 'pending' })
  status: 'pending' | 'sent' | 'accepted';

  @Prop({ enum: ['sqs', 'synchronous'], default: 'synchronous' })
  processingMethod: 'sqs' | 'synchronous';

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export type UserInviteDocument = HydratedDocument<UserInvite>;
export const UserInviteSchema = SchemaFactory.createForClass(UserInvite);

UserInviteSchema.index({ email: 1 }, { unique: false });
UserInviteSchema.index({ token: 1 }, { unique: true });
