import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import { AipService } from './aip.service';
import { AipDto } from 'src/common/dto/aip.dto';

@Controller('aip')
export class AipController {
  constructor(private readonly aipService: AipService) {}

  @Post('create')
  async createNewAip(@Body() aipDto: AipDto) {
    return this.aipService.createAip(aipDto);
  }

  @Get()
  async getAipById(@Query('id') id: string) {
    return this.aipService.getAipById(id);
  }

  @Get('all')
  async getAall() {
    return this.aipService.getAll();
  }

  @Delete()
  async deleteAip(@Query('id') id: string) {
    return this.aipService.deleteAip(id);
  }

  @Post('edit')
  async editAip(@Query('id') id: string, @Body() aipDto: AipDto) {
    return this.aipService.updateAip(id, aipDto);
  }
}
