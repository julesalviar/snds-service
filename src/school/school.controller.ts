import { Controller, Post, Body } from '@nestjs/common';

import { SchoolService } from './school.service';
import { SchoolRegistrationDto } from 'src/common/dto/school-registration.dto';

@Controller('school')
export class SchoolController {
//   constructor(private readonly schoolService: SchoolService) {}

  @Post('register')
  async registerSchool(@Body() schoolRegistrationDto: SchoolRegistrationDto) {
    // return this.schoolService.register(schoolRegistrationDto);
      return { message: "Ok", "data": schoolRegistrationDto };
  }
}
