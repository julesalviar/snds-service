import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateEngagementDto,
  UpdateEngagementDto,
} from './engagement.dto';
import { EngagementService } from './engagement.service';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('engagements')
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Post()
  async createEngagement(@Body() engagementDto: CreateEngagementDto) {
    return this.engagementService.createEngagement(engagementDto);
  }

  @Public()
  @Get(':stakeholderUserId')
  async getEngagementsByStakeholder(
    @Param('stakeholderUserId') stakeholderUserId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.engagementService.getEngagementsByStakeholder(
      stakeholderUserId,
      Number(page),
      Number(limit),
    );
  }

  // @Public()
  // @Get('school-need/:schoolNeedId')
  // async getEngagementsBySchoolNeed(
  //   @Param('schoolNeedId') schoolNeedId: string,
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10,
  // ) {
  //   return this.engagementService.getEngagementsBySchoolNeed(
  //     schoolNeedId,
  //     Number(page),
  //     Number(limit),
  //   );
  // }

  // @Public()
  // @Get(':id')
  // async getEngagementById(@Param('id') id: string) {
  //   return this.engagementService.getEngagementById(id);
  // }

  // @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  // @Put(':id')
  // async updateEngagement(
  //   @Param('id') id: string,
  //   @Body() updateEngagementDto: UpdateEngagementDto,
  // ) {
  //   return this.engagementService.updateEngagement(id, updateEngagementDto);
  // }

  // @PermissionsAllowed(PermissionsEnum.SCHOOL_NEED_MANAGE)
  // @Delete(':id')
  // async deleteEngagement(@Param('id') id: string) {
  //   return this.engagementService.deleteEngagement(id);
  // }
}
