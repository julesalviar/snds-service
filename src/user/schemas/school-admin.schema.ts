import { Prop, Schema } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import { Region } from 'src/common/enums/region.enum';

@Schema({ timestamps: true })
export class SchoolAdmin extends User {
  @Prop({ enum: Region })
  region: Region;

  @Prop()
  division: string;

  @Prop()
  district: string;

  @Prop()
  schoolName: string;

  @Prop()
  schoolId: string;

  @Prop()
  schoolOffering;

  @Prop()
  nameOfAccountablePerson: string;

  @Prop()
  designation: string;

  @Prop()
  contactNumber: string;
}
