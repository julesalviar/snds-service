import { Controller, Post, Body, Param, Get, Query, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { SchoolDto } from './school.dto';

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
  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.schoolService.getAll(Number(page), Number(limit));
  }
}
