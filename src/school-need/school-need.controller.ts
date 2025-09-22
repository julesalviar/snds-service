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
import { SchoolNeedDto, UpdateNeedDto } from './school-need.dto';
import { SchoolNeedService } from './school-need.service';
import { User } from 'src/user/user.decorator';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';
import { StakeHolderEngageDto } from 'src/stakeholder-engage/stakeholder-engage.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('school-needs')
export class SchoolNeedController {
  constructor(private readonly schoolNeedService: SchoolNeedService) {}

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Post()
  async createNeed(@Body() needDto: SchoolNeedDto) {
    return this.schoolNeedService.createSchoolNeed(needDto);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Delete(':id')
  async deleteSchoolNeed(@Param('id') id: string) {
    return this.schoolNeedService.deleteSchoolNeed(id);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_VIEW)
  @Get(':param')
  async getSchoolNeed(@Param('param') param: string) {
    return this.schoolNeedService.getSchoolNeed(param);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_VIEW)
  @Get()
  async getAll(
    @User('schoolId') schoolId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('schoolYear') schoolYear?: string,
  ) {
    console.log('School ID from principal:', schoolId);
    const effectiveSchoolId = schoolId;

    const isValidFormat = /^\d{4}-\d{4}$/.test(schoolYear || '');
    const finalSchoolYear = isValidFormat ? schoolYear : undefined;

    return this.schoolNeedService.getAll(
      effectiveSchoolId,
      Number(page),
      Number(limit),
      finalSchoolYear,
    );
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Put(':id')
  async editSchoolNeed(
    @Param('id') id: string,
    @Body() updateNeedDto: UpdateNeedDto,
  ) {
    return this.schoolNeedService.updateSchoolNeed(id, updateNeedDto);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Patch(':id/status')
  async updateSchoolNeedStatus(
    @Param('id') id: string,
    @Body() updateNeedStatusDto: UpdateNeedDto,
  ) {
    return this.schoolNeedService.updateSchoolNeedStatus(
      id,
      updateNeedStatusDto,
    );
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  @Post(':id/engage')
  async engageSchoolNeed(
    @Param('id') id: string,
    @Body() stakeHolderEngageDto: StakeHolderEngageDto,
  ) {
    return this.schoolNeedService.engageSchoolNeeds(id, stakeHolderEngageDto);
  }
}
