import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
// import { UserRole } from 'src/user/enums/user-role.enum';

@Schema({ timestamps: true })
export class Aip extends Document {
  @Prop({ required: true, unique: true })
  apn: string;

  @Prop({ required: true })
  schoolYear: string;

  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  objectives: string;

  @Prop()
  pillars: string;

  @Prop()
  materialsNeeded: string;

  @Prop()
  totalBudget: string;

  @Prop()
  budgetSource: string;

  @Prop({ required: true })
  responsiblePerson: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export type UserDocument = HydratedDocument<Aip>;
export const AipSchema = SchemaFactory.createForClass(Aip);
