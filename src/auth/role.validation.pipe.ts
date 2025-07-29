import {
  Injectable,
  PipeTransform,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { CreateSchoolAdminDto } from 'src/common/dtos/create-school-admin.dto';
import { UserRole } from 'src/user/enums/user-role.enum';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RoleValidationPipe implements PipeTransform {
  async transform(value: CreateUserDto | CreateSchoolAdminDto) {
    switch (value.role) {
      case UserRole.STAKEHOLDER:
        await validateOrReject(plainToInstance(CreateUserDto, value));
        break;
      case UserRole.SCHOOL_ADMIN:
        await validateOrReject(plainToInstance(CreateSchoolAdminDto, value));
        break;
      default:
        throw new UnauthorizedException('Invalid User Role');
    }
    return value;
  }
}
