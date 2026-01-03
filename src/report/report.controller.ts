import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ReportService } from 'src/report/report.service';
import { EngagementService } from 'src/engagement/engagement.service';
import { UserInfo } from 'src/user/user.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('report')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly engagementService: EngagementService,
  ) {}

  @Get(':reportId')
  async getReport(
    @Param('reportId') reportId: string,
    @Query() params: any,
    @UserInfo('schoolId') userSchoolId: string,
    @UserInfo('activeRole') activeRole: UserRole,
  ) {
    this.engagementService.getAllEngagements()
    return null;
  }
}
