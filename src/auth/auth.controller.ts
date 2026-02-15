import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/common/dtos/login.dto';
import { CreateUserDto } from 'src/common/dtos/create-user.dto';
import { CreateSchoolAdminDto } from 'src/common/dtos/create-school-admin.dto';
import { RoleValidationPipe } from 'src/auth/role.validation.pipe';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserInfo } from 'src/user/user.decorator';
import { SwitchRoleDto } from 'src/common/dtos/switch-role.dto';
import { AssignRolesDto } from 'src/common/dtos/assign-roles.dto';
import { UserRole } from 'src/user/enums/user-role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body(new RoleValidationPipe())
    payload: CreateUserDto | CreateSchoolAdminDto,
  ) {
    return this.authService.signUp(payload);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('users/:userId/assign-roles')
  async assignRoles(
    @Param('userId') userId: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.authService.assignRoles(
      userId,
      assignRolesDto.roles,
      assignRolesDto.schoolId,
      assignRolesDto.officeIds,
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('switch-role')
  async switchRole(
    @UserInfo('userId') userId: string,
    @UserInfo('roles') currentRoles: UserRole[] | string[],
    @Body() switchRoleDto: SwitchRoleDto,
  ) {
    const roles = currentRoles as UserRole[];
    return this.authService.switchRole(userId, switchRoleDto.role, roles);
  }
}
