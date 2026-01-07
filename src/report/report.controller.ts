import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReportService } from 'src/report/report.service';
import { EngagementService } from 'src/engagement/engagement.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UserInfo } from 'src/user/user.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { ReportResponseDto } from 'src/report/report.dto';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly engagementService: EngagementService,
  ) {}

  @Post(':reportId/generate')
  async generateReport(
    @UserInfo('activeRole') activeRole: string,
    @UserInfo('schoolId') schoolId: string,
    @UserInfo('perms') userPermissions: PermissionsEnum[],
    @Param('reportId') reportId: string,
    @Body() param: any,
  ) {
    switch (activeRole) {
      case UserRole.SCHOOL_ADMIN:
        param.schoolId = schoolId;
        return this.reportService.runReport(
          reportId,
          param,
          activeRole,
          userPermissions,
        );
      case UserRole.DIVISION_ADMIN:
        return this.reportService.runReport(
          reportId,
          param,
          activeRole,
          userPermissions,
        );
      default:
        throw new Error('Unauthorized');
    }
  }

  @Get()
  async getAllReport(
    @UserInfo('activeRole') activeRole: string,
    @UserInfo('perms') userPermissions: PermissionsEnum[],
  ): Promise<{ success: boolean; data: ReportResponseDto[] }> {
    return this.reportService.getAllReports(activeRole, userPermissions);
  }
}
