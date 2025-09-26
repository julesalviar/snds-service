import { Injectable } from '@nestjs/common';
import { ImmersionInfoDto, ImmersionVenueDto } from './shs-immersion.dto';

@Injectable()
export class ShsImmersionService {
  constructor() {}

  async createShsImmersionInfo(immersionDto: ImmersionInfoDto): Promise<any> {
    return immersionDto;
  }

  async addImmersionVenue(
    param: string,
    immersionVenueDto: ImmersionVenueDto,
  ): Promise<any> {
    return { param: param, immersionVenueDto };
  }
}
