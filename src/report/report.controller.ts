import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from 'src/report/report.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UserInfo } from 'src/user/user.decorator';
import { UserRole } from 'src/user/enums/user-role.enum';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { ReportResponseDto } from 'src/report/report.dto';
import { Request } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('reports')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
  ) {}

  @Post(':reportId/generate')
  async generateReport(
    @UserInfo('activeRole') activeRole: string,
    @UserInfo('schoolId') schoolId: string,
    @UserInfo('perms') userPermissions: PermissionsEnum[],
    @Param('reportId') reportId: string,
    @Body() param: any,
    @Headers('tenant') tenantHeader?: string,
    @Req() request?: Request,
  ) {
    // Get tenant code from header or request object
    const tenantCode =
      tenantHeader ||
      (request as any)?.tenantCode ||
      (request as any)?.headers?.['tenant'];

    switch (activeRole) {
      case UserRole.SCHOOL_ADMIN:
        param.schoolId = schoolId;
        return this.reportService.runReport(
          reportId,
          param,
          activeRole,
          userPermissions,
          tenantCode,
        );
      case UserRole.DIVISION_ADMIN:
        return this.reportService.runReport(
          reportId,
          param,
          activeRole,
          userPermissions,
          tenantCode,
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
