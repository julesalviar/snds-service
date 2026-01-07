import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchoolNeedDto, SecureSchoolUpdateNeedDto } from './school-need.dto';
import { SchoolNeedService } from './school-need.service';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { BasicAuthGuard } from 'src/common/guards/basic-auth.guard';
import { UserInfo } from 'src/user/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('school-needs')
export class SchoolNeedController {
  constructor(private readonly schoolNeedService: SchoolNeedService) {}

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Post()
  async createNeed(@Body() needDto: SchoolNeedDto) {
    return this.schoolNeedService.createSchoolNeed(needDto);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Delete(':param')
  async deleteSchoolNeed(@Param('param') param: string) {
    return this.schoolNeedService.deleteSchoolNeed(param);
  }

  @Public()
  @Get()
  async getAll(
    @UserInfo('schoolId') schoolId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('schoolYear') schoolYear?: string,
    @Query('specificContribution') specificContribution?: string,
    @Query('schoolId') querySchoolId?: string,
    @Query('withEngagements') withEngagements?: string,
  ) {
    const effectiveSchoolId = querySchoolId || schoolId || undefined;

    const isValidFormat = /^\d{4}-\d{4}$/.test(schoolYear || '');
    const finalSchoolYear = isValidFormat ? schoolYear : undefined;

    return this.schoolNeedService.getAll(
      effectiveSchoolId,
      Number(page),
      Number(limit),
      finalSchoolYear,
      specificContribution,
      withEngagements,
    );
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Put(':id')
  async editSchoolNeed(
    @Param('id') id: string,
    @Body() updateNeedDto: SecureSchoolUpdateNeedDto,
  ) {
    return this.schoolNeedService.updateSchoolNeed(id, updateNeedDto);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Patch(':id/status')
  async updateSchoolNeedStatus(
    @Param('id') id: string,
    @Body() updateNeedStatusDto: SecureSchoolUpdateNeedDto,
  ) {
    return this.schoolNeedService.updateSchoolNeedStatus(
      id,
      updateNeedStatusDto,
    );
  }

  // This endpoint uses BasicAuthGuard instead of the class-level JWT/Roles/Permissions guards
  // All other endpoints in this controller use the class-level guards (JwtAuthGuard, RolesGuard, PermissionsGuard)
  // @Public() bypasses the class-level guards; then BasicAuthGuard is applied
  // IMPORTANT: This route must come before @Get(':param') to avoid route conflicts
  @Public()
  @UseGuards(BasicAuthGuard)
  @Post('fill-contribution-type')
  async fillContributionType() {
    return this.schoolNeedService.fillContributionType();
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_VIEW)
  @Get(':param')
  async getSchoolNeed(@Param('param') param: string) {
    return this.schoolNeedService.getSchoolNeed(param);
  }
}
