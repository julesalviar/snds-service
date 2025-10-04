import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
// import { User } from 'src/user/user.decorator';
import { PermissionsAllowed } from 'src/common/decorators/permissions.decorator';
import { PermissionsEnum } from 'src/user/enums/user-permission.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ShsImmersionService } from './shs-immersion.service';
import { ImmersionInfoDto, ImmersionVenueDto } from './shs-immersion.dto';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller('shs-immersion')
export class ShsImmersionController {
  constructor(private readonly shsImmersionService: ShsImmersionService) {}

  @PermissionsAllowed(PermissionsEnum.SHS_IMMERSION_MANAGE)
  @Post()
  async createImmersionInfo(@Body() immersionDto: ImmersionInfoDto) {
    return this.shsImmersionService.createShsImmersionInfo(immersionDto);
  }

  @PermissionsAllowed(PermissionsEnum.SHS_IMMERSION_VIEW)
  @Get()
  async getAll(
    @Query('schoolId') schoolId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.shsImmersionService.getAll(
      schoolId,
      Number(page),
      Number(limit),
    );
  }

  @PermissionsAllowed(PermissionsEnum.SHS_IMMERSION_MANAGE)
  @Patch(':param/venue')
  async addImmersionVenue(
    @Param('param') param: string,
    @Body() immersionVenueDto: ImmersionVenueDto,
  ) {
    return this.shsImmersionService.addImmersionVenue(param, immersionVenueDto);
  }
}
