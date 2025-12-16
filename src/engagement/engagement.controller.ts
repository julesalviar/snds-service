import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CreateEngagementDto } from './engagement.dto';
import { EngagementService } from './engagement.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { UserInfo } from 'src/user/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('engagements')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post()
  async createEngagement(@Body() engagementDto: CreateEngagementDto) {
    return this.engagementService.createEngagement(engagementDto);
  }

  @Public()
  @Get()
  async getAllEngagements(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('stakeholderUserId') stakeholderUserId?: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('specificContribution') specificContribution?: string,
    @Query('schoolId') schoolId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sector') sector?: string,
  ) {
    return this.engagementService.getAllEngagements(
      Number(page),
      Number(limit),
      stakeholderUserId,
      schoolYear,
      specificContribution,
      schoolId,
      startDate,
      endDate,
      sector,
    );
  }

  @Get('my-contributions/summary')
  async getEngagementsSummary(
    @UserInfo('userId') stakeholderUserId?: string,
    @Query('schoolYear') schoolYear?: string,
  ) {
    return this.engagementService.getEngagementsSummary(
      stakeholderUserId,
      schoolYear,
    );
  }

  @Public()
  @Get('my-contributions')
  async getEngagementsByStakeholder(
    @UserInfo('userId') stakeholderUserId: string,
    @Query('schoolYear') schoolYear?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.engagementService.getEngagementsByStakeholder(
      stakeholderUserId,
      schoolYear,
      Number(page),
      Number(limit),
    );
  }

  @Delete(':id')
  async deleteEngagement(@Param('id') id: string) {
    return this.engagementService.deleteEngagement(id);
  }
}
