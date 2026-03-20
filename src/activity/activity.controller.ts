import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityDto, UpdateActivityDto } from './activity.dto';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserInfo } from 'src/user/user.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @PermissionsAllowed(PermissionsEnum.ACTIVITY_MANAGE)
  @Post()
  create(
    @Body() activityDto: ActivityDto,
    @UserInfo('schoolId') userSchoolId: string,
    @UserInfo('activeRole') activeRole: UserRole,
  ) {
    return this.activityService.create(activityDto, userSchoolId, activeRole);
  }

  @PermissionsAllowed(PermissionsEnum.ACTIVITY_VIEW)
  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('active') active?: string,
    @Query('activityNumber') activityNumber?: string,
    @Query('schoolId') schoolId?: string,
    @Query('startDatetimeFrom') startDatetimeFrom?: string,
    @Query('startDatetimeTo') startDatetimeTo?: string,
    @Query('endDatetimeFrom') endDatetimeFrom?: string,
    @Query('endDatetimeTo') endDatetimeTo?: string,
  ) {
    return this.activityService.findAll(
      Number(page),
      Number(limit),
      search,
      type,
      active,
      activityNumber,
      schoolId,
      {
        startDatetimeFrom,
        startDatetimeTo,
        endDatetimeFrom,
        endDatetimeTo,
      },
    );
  }

  @PermissionsAllowed(PermissionsEnum.ACTIVITY_VIEW)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @PermissionsAllowed(PermissionsEnum.ACTIVITY_MANAGE)
  @Put(':id')
  update(
    @UserInfo('schoolId') userSchoolId: string,
    @UserInfo('activeRole') activeRole: UserRole,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    return this.activityService.update(
      id,
      updateActivityDto,
      userSchoolId,
      activeRole,
    );
  }

  @PermissionsAllowed(PermissionsEnum.ACTIVITY_MANAGE)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @UserInfo('schoolId') userSchoolId: string,
    @UserInfo('activeRole') activeRole: UserRole,
  ) {
    return this.activityService.remove(id, userSchoolId, activeRole);
  }
}
