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
import { PpaPlanService } from './ppa-plan.service';
import { CreatePpaPlanDto } from './ppa-plan.dto';
import { UpdatePpaPlanDto } from './ppa-plan.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { UserInfo } from 'src/user/user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('ppa-plan')
export class PpaPlanController {
  constructor(private readonly ppaPlanService: PpaPlanService) {}

  @Post()
  create(@Body() dto: CreatePpaPlanDto) {
    return this.ppaPlanService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('stakeholderUserId') stakeholderUserId?: string,
    @Query('assignedUserId') assignedUserId?: string,
    @Query('officeId') officeId?: string,
    @Query('implementationStatus') implementationStatus?: string,
    @Query('classification') classification?: string,
    @Query('startDateFrom') startDateFrom?: string,
    @Query('startDateTo') startDateTo?: string,
    @Query('endDateFrom') endDateFrom?: string,
    @Query('endDateTo') endDateTo?: string,
  ) {
    return this.ppaPlanService.findAll(Number(page), Number(limit), {
      stakeholderUserId,
      assignedUserId,
      officeId,
      implementationStatus,
      classification,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ppaPlanService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePpaPlanDto) {
    return this.ppaPlanService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ppaPlanService.remove(id);
  }
}
