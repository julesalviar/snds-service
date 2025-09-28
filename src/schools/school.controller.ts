import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  Get,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolDto, UpdateSchoolDto } from './school.dto';

import { AuthGuard } from '@nestjs/passport';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_MANAGE)
  @Post()
  async createSchool(@Body() schoolRegistrationDto: SchoolDto) {
    return this.schoolService.create(schoolRegistrationDto);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_MANAGE)
  @Delete(':id')
  async deleteSchool(@Param('id') id: string) {
    return this.schoolService.deleteSchool(id);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_MANAGE)
  @Put(':id')
  async updateSchool(
    @Param('id') id: string,
    @Body() updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolService.updateSchool(id, updateSchoolDto);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_VIEW)
  @Get()
  async getAll(
    @Query('page') page = 1, 
    @Query('limit') limit = 10,
    @Query('district') district?: string
  ) {
    return this.schoolService.getAll(Number(page), Number(limit), district);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_MANAGE)
  @Get(':id')
  async getSchoolById(@Param('id') id: string) {
    return this.schoolService.getSchoolById(id);
  }

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_MANAGE)
  @Get('by-school-id/:schoolId')
  async getSchoolBySchoolId(@Param('schoolId') schoolId: string) {
    return this.schoolService.getSchoolBySchoolId(schoolId);
  }
}
