import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AipService } from './aip.service';
import { AipDto } from 'src/aip/aip.dto';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { RolesAllowed } from 'src/common/decorators/roles.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard, RolesGuard)
@Controller('aips')
export class AipController {
  constructor(private readonly aipService: AipService) {}

  @RolesAllowed('SchoolAdmin', 'DivisionAdmin', 'SuperAdmin')
  @Post()
  async createNewAip(@Body() aipDto: AipDto) {
    return this.aipService.createAip(aipDto);
  }

  @PermissionsAllowed('viewReports')
  @Get(':id')
  async getAipById(@Param('id') id: string) {
    return this.aipService.getAipById(id);
  }

  @PermissionsAllowed('viewReports')
  @Get()
  async getAll() {
    return this.aipService.getAll();
  }

  @RolesAllowed('SchoolAdmin', 'DivisionAdmin', 'SuperAdmin')
  @Delete(':id')
  async deleteAip(@Param('id') id: string) {
    return this.aipService.deleteAip(id);
  }

  @RolesAllowed('SchoolAdmin', 'DivisionAdmin', 'SuperAdmin')
  @Patch(':id')
  async editAip(@Param('id') id: string, @Body() aipDto: AipDto) {
    return this.aipService.updateAip(id, aipDto);
  }
}
