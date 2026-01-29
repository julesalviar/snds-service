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
import { SchoolOfferingRefDataValidationPipe } from './school-offering-ref-data.validation.pipe';

import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

function normalizeDistrictQuery(
  district?: string | string[],
): string[] | undefined {
  if (district == null || district === '') return undefined;
  const raw = Array.isArray(district) ? district : [district];
  const filtered = raw.filter((d) => typeof d === 'string' && d.trim() !== '');
  return filtered.length > 0 ? filtered : undefined;
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('schools')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @PermissionsAllowed(PermissionsEnum.SCHOOL_PROFILE_MANAGE)
  @Post()
  async createSchool(
    @Body(SchoolOfferingRefDataValidationPipe) schoolRegistrationDto: SchoolDto,
  ) {
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
    @Body(SchoolOfferingRefDataValidationPipe) updateSchoolDto: UpdateSchoolDto,
  ) {
    return this.schoolService.updateSchool(id, updateSchoolDto);
  }

  @Public()
  @Get()
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('district') district?: string | string[],
    @Query('search') search?: string,
    @Query('withNeed') withNeed?: string,
    @Query('withAip') withAip?: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('withGeneratedResources') withGeneratedResources?: string,
  ) {
    const districts = normalizeDistrictQuery(district);
    return this.schoolService.getAll(
      Number(page),
      Number(limit),
      districts,
      search,
      withNeed === 'true',
      withAip === 'true',
      schoolYear,
      withGeneratedResources === 'true',
    );
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
