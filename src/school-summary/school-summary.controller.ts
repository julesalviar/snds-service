import { Controller, Get, Param, Query, Post, UseGuards } from '@nestjs/common';
import { SchoolSummaryService } from './school-summary.service';
import { GetSchoolSummaryDto } from './school-summary.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@Controller('school-summary')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SchoolSummaryController {
  constructor(private readonly schoolSummaryService: SchoolSummaryService) {}

  /**
   * GET /school-summary?schoolYear=2024-2025&division=Division A&districtOrCluster=District 1
   * Get all schools summary for a specific school year
   * Optional filters: division, districtOrCluster
   */
  @Get()
  async getSchoolsSummary(@Query() query: GetSchoolSummaryDto) {
    return this.schoolSummaryService.getSchoolsSummary(
      query.schoolYear,
      query.division,
      query.districtOrCluster,
    );
  }

  /**
   * GET /school-summary/dashboard?schoolYear=2024-2025&division=Division A&districtOrCluster=District 1
   * Get all schools summary with both current year and all time data
   * Optional filters: division, districtOrCluster
   */
  @Get('dashboard')
  async getDashboardSummary(@Query() query: GetSchoolSummaryDto) {
    return this.schoolSummaryService.getAllSchoolsSummaryForDashboard(
      query.schoolYear,
      query.division,
      query.districtOrCluster,
    );
  }

  /**
   * GET /school-summary/:schoolId?schoolYear=2024-2025
   * Get detailed summary for a specific school (current year + all time)
   */
  @Get(':schoolId')
  async getSchoolDetailedSummary(
    @Param('schoolId') schoolId: string,
    @Query() query: GetSchoolSummaryDto,
  ) {
    return this.schoolSummaryService.getSchoolDetailedSummary(
      schoolId,
      query.schoolYear,
    );
  }

  /**
   * POST /school-summary/initialize
   * Initialize summaries for all existing data (migration endpoint)
   * This should be called once after deployment
   */
  @Post('initialize')
  async initializeSummaries() {
    return this.schoolSummaryService.initializeSchoolSummaries();
  }

  /**
   * POST /school-summary/recalculate/:schoolId?schoolYear=2024-2025
   * Recalculate summary for a specific school
   * Useful for fixing inconsistencies
   */
  @Post('recalculate/:schoolId')
  async recalculateSummary(
    @Param('schoolId') schoolId: string,
    @Query('schoolYear') schoolYear: string,
  ) {
    return this.schoolSummaryService.recalculateSchoolSummary(
      schoolId,
      schoolYear,
    );
  }
}
