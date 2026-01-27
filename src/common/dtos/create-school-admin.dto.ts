import { IsDefined, IsString, Validate } from 'class-validator';
import { Region } from 'src/common/enums/region.enum';
import { DivisionRegionMatchConstraint } from 'src/common/validators/division-region-match-constraint.validator';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';

export class CreateSchoolAdminDto extends CreateUserDto {
  @IsDefined()
  @IsString()
  region: Region;

  @Validate(DivisionRegionMatchConstraint)
  division: string;

  @IsString()
  @IsDefined()
  district: string;

  @IsString()
  @IsDefined()
  schoolName: string;

  @IsString()
  @IsDefined()
  schoolId: string;

  @IsString()
  @IsDefined()
  schoolOffering: string;

  @IsString()
  nameOfAccountablePerson: string;

  @IsString()
  designation: string;

  @IsString()
  contactNumber: string;
}
