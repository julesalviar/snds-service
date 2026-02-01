import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { UserRole } from 'src/user/enums/user-role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ lowercase: true, unique: true })
  userName: string;

  @Prop()
  name: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  address: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  sector: string;

  @Prop()
  subsector: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ enum: UserRole })
  role: UserRole;

  @Prop()
  schoolId?: string;

  // Transition to multiple roles per user
  @Prop({ required: true, enum: UserRole })
  activeRole: UserRole;

  @Prop({ required: true, type: [String], enum: UserRole })
  roles: UserRole[];

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailConfirmationToken?: string;

  @Prop()
  emailConfirmationTokenExpires?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetTokenExpires?: Date;

  @Prop()
  contactNumber?: string;

  /** 'system' for reference/seed accounts; omitted for normal users */
  @Prop()
  created?: string;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
