import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

/**
 * Registration token for closed registration (no invite required).
 * Admin creates tokens and distributes them; valid token grants access to register.
 */
@Schema({ timestamps: true, collection: 'registration_tokens' })
export class RegistrationToken extends Document {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export type RegistrationTokenDocument = HydratedDocument<RegistrationToken>;
export const RegistrationTokenSchema =
  SchemaFactory.createForClass(RegistrationToken);
