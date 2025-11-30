import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from 'src/user/enums/user-role.enum';

export class SwitchRoleDto {
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}
