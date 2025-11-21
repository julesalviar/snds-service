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
  selectedOption: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop()
  schoolId?: string;

  // Transition to multiple roles per user
  @Prop({ required: true, enum: UserRole })
  activeRole: UserRole;

  @Prop({ required: true, type: [String], enum: UserRole })
  roles: UserRole[];
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
