import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { NeedDto } from './need.dto';
import { SchoolNeedService } from './need.service';

@Controller('schools/:schoolId/needs')
export class SchoolNeedController {
  constructor(private readonly schoolNeedService: SchoolNeedService) {}

  @Post()
  async createNeed(
    @Param('schoolId') schoolId: string,
    @Body() needDto: NeedDto,
  ) {
    return this.schoolNeedService.createSchoolNeed(schoolId, needDto);
  }

  @Delete(':id')
  async deleteSchoolNeed(@Param('schoolId') schoolId: string, @Param('id') id: string) {
      return this.schoolNeedService.deleteSchoolNeed(schoolId, id);
  }
    
    
  // @Get(':id')
  // async getAipById(@Param('id') id: string) {
  //     return this.aipService.getAipById(id);
  // }

  // @Get()
  // async getAll() {
  //     return this.aipService.getAll();
  // }


  // @Patch(':id')
  // async editAip(@Param('id') id: string, @Body() aipDto: AipDto) {
  //     return this.aipService.updateAip(id, aipDto);
  // }
}
