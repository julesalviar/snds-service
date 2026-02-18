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
import { OfficeService } from './office.service';
import { OfficeDto, UpdateOfficeDto } from './office.dto';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('offices')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @PermissionsAllowed(PermissionsEnum.OFFICE_PROFILE_MANAGE)
  @Post()
  async createOffice(@Body() officeDto: OfficeDto) {
    return this.officeService.create(officeDto);
  }

  @PermissionsAllowed(PermissionsEnum.OFFICE_PROFILE_MANAGE)
  @Delete(':id')
  async deleteOffice(@Param('id') id: string) {
    return this.officeService.deleteOffice(id);
  }

  @PermissionsAllowed(PermissionsEnum.OFFICE_PROFILE_MANAGE)
  @Put(':id')
  async updateOffice(
    @Param('id') id: string,
    @Body() updateOfficeDto: UpdateOfficeDto,
  ) {
    return this.officeService.updateOffice(id, updateOfficeDto);
  }

  @Public()
  @Get()
  async getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
    @Query('division') division?: string,
    @Query('includePpaPlanCount') includePpaPlanCount?: string,
  ) {
    return this.officeService.getAll(
      Number(page),
      Number(limit),
      search,
      division,
      includePpaPlanCount === 'true',
    );
  }

  @Get(':id')
  async getOfficeById(@Param('id') id: string) {
    return this.officeService.getOfficeById(id);
  }
}
