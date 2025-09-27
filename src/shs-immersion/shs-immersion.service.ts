import { Model, Types } from 'mongoose';
import { PROVIDER } from 'src/common/constants/providers';
import { COUNTER } from 'src/common/constants/counters';
import { CounterService } from 'src/common/counter/counter.services';
import {
  NotFoundException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ImmersionInfoDto, ImmersionVenueDto } from './shs-immersion.dto';
import { ImmersionInfo} from './shs-immersion-info.schema';
@Injectable()
export class ShsImmersionService {
  constructor(
    @Inject(PROVIDER.IMMERSION_INFO_MODEL)
    private readonly immersionInfoModel: Model<ImmersionInfo>,

    // @Inject(PROVIDER.IMMERSION_VENUE_MODEL)
    // private readonly immersionVenueModel: Model<ImmersionVenue>,
    private readonly counterService: CounterService,
  ) {}

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
