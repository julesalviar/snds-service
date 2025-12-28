import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AipService } from './aip.service';
import { AipDto } from 'src/aip/aip.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserInfo } from 'src/user/user.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('aips')
export class AipController {
  constructor(private readonly aipService: AipService) {}

  @PermissionsAllowed(PermissionsEnum.PROJECT_MANAGE)
  @Post()
  async createNewAip(@UserInfo() currentUser: any, @Body() aipDto: AipDto) {
    return this.aipService.createAip(aipDto, currentUser);
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_VIEW)
  @Get(':id')
  async getAipById(@Param('id') id: string) {
    return this.aipService.getAipById(id);
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_VIEW)
  @Get()
  async getAll(
    @UserInfo('schoolId') userSchoolId: string,
    @UserInfo('activeRole') activeRole: UserRole,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('schoolYear') schoolYear?: string,
    @Query('schoolId') querySchoolId?: string,
  ) {
    const schoolId =
      activeRole === UserRole.SCHOOL_ADMIN
        ? userSchoolId || querySchoolId
        : querySchoolId;

    const isSchoolYearValid = schoolYear && /^\d{4}-\d{4}$/.test(schoolYear);
    const normalizedSchoolYear = isSchoolYearValid ? schoolYear : undefined;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.aipService.getAll(
      schoolId,
      normalizedSchoolYear,
      pageNumber,
      limitNumber,
    );
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_MANAGE)
  @Delete(':id')
  async deleteAip(@Param('id') id: string) {
    return this.aipService.deleteAip(id);
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_MANAGE)
  @Patch(':id')
  async editAip(@Param('id') id: string, @Body() aipDto: AipDto) {
    return this.aipService.updateAip(id, aipDto);
  }
}
