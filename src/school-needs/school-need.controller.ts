import {
  Controller,
  Post,
  Put,
  Get,
  Query,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  SchoolNeedDto,
  UpdateNeedDto,
  UpdateSchoolNeedStatusDto,
} from './school-need.dto';
import { SchoolNeedService } from './school-need.service';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { AuthGuard } from '@nestjs/passport';

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
  @Get(':id')
  async getSchoolNeedById(@Param('id') id: string) {
    return this.schoolNeedService.getSchoolNeedById(id);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_VIEW)
  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.schoolNeedService.getAll(Number(page), Number(limit));
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
    @Body() updateNeedStatusDto: UpdateSchoolNeedStatusDto,
  ) {
    return this.schoolNeedService.updateSchoolNeedStatus(
      id,
      updateNeedStatusDto,
    );
  }
}
