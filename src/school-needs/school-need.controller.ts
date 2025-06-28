import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { NeedDto, UpdateNeedDto } from './school-need.dto';
import { SchoolNeedService } from './school-need.service';

@Controller('school-needs/:schoolId')
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
  async deleteSchoolNeed(
    @Param('schoolId') schoolId: string,
    @Param('id') id: string,
  ) {
    return this.schoolNeedService.deleteSchoolNeed(schoolId, id);
  }

  @Get(':id')
  async getSchoolNeedById(@Param('id') id: string) {
    return this.schoolNeedService.getSchoolNeedById(id);
  }

  @Get()
  async getAll() {
    return this.schoolNeedService.getAll();
  }

  @Patch(':id')
  async editAip(@Param('id') id: string, @Body() updateNeedDto: UpdateNeedDto) {
    return this.schoolNeedService.updateSchoolNeed(id, updateNeedDto);
  }
}
