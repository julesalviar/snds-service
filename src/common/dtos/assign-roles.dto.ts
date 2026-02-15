import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { UserRole } from 'src/user/enums/user-role.enum';

export class AssignRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  officeIds?: string[];
}
