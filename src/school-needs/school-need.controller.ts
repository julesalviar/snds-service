import {
  Controller,
  Post,
  Put,
  Get,
  Delete,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import {
  NeedDto,
  UpdateNeedDto,
  UpdateSchoolNeedStatusDto,
} from './school-need.dto';
import { SchoolNeedService } from './school-need.service';

@Controller('school-needs')
export class SchoolNeedController {
  constructor(private readonly schoolNeedService: SchoolNeedService) {}

  @Post()
  async createNeed(@Body() needDto: NeedDto) {
    return this.schoolNeedService.createSchoolNeed(needDto);
  }

  @Delete(':id')
  async deleteSchoolNeed(@Param('id') id: string) {
    return this.schoolNeedService.deleteSchoolNeed(id);
  }

  @Get(':id')
  async getSchoolNeedById(@Param('id') id: string) {
    return this.schoolNeedService.getSchoolNeedById(id);
  }

  @Get()
  async getAll() {
    return this.schoolNeedService.getAll();
  }

  @Put(':id')
  async editSchoolNeed(
    @Param('id') id: string,
    @Body() updateNeedDto: UpdateNeedDto,
  ) {
    return this.schoolNeedService.updateSchoolNeed(id, updateNeedDto);
  }

  @Patch(':id/status')
  async updateSchoolNeedStatus(
    @Param('id') id: string,
    @Body() updateNeedStatusDto: UpdateSchoolNeedStatusDto,
  ) {
    return this.schoolNeedService.updateSchoolNeedStatus(
      id,
      updateNeedStatusDto,
    );
  }
}
