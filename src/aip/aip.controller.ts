import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AipService } from './aip.service';
import { AipDto } from 'src/aip/aip.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
@Controller('aips')
export class AipController {
  constructor(private readonly aipService: AipService) {}

  @PermissionsAllowed(PermissionsEnum.PROJECT_MANAGE)
  @Post()
  async createNewAip(@Body() aipDto: AipDto) {
    return this.aipService.createAip(aipDto);
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_VIEW)
  @Get(':id')
  async getAipById(@Param('id') id: string) {
    return this.aipService.getAipById(id);
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_VIEW)
  @Get()
  async getAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.aipService.getAll(Number(page), Number(limit));
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_MANAGE)
  @Delete(':id')
  async deleteAip(@Param('id') id: string) {
    return this.aipService.deleteAip(id);
  }

  @PermissionsAllowed(PermissionsEnum.PROJECT_MANAGE)
  @Patch(':id')
  async editAip(@Param('id') id: string, @Body() aipDto: AipDto) {
    return this.aipService.updateAip(id, aipDto);
  }
}
