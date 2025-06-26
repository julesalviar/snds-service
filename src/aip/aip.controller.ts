import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';

import { AipService } from './aip.service';
import { AipDto } from 'src/aip/aip.dto';

@Controller('aips')
export class AipController {
  constructor(private readonly aipService: AipService) {}

  @Post()
  async createNewAip(@Body() aipDto: AipDto) {
    return this.aipService.createAip(aipDto);
  }

  @Get(':id')
  async getAipById(@Param('id') id: string) {
    return this.aipService.getAipById(id);
  }

  @Get()
  async getAll() {
    return this.aipService.getAll();
  }

  @Delete(':id')
  async deleteAip(@Param('id') id: string) {
    return this.aipService.deleteAip(id);
  }

  @Patch(':id')
  async editAip(@Param('id') id: string, @Body() aipDto: AipDto) {
    return this.aipService.updateAip(id, aipDto);
  }
}
