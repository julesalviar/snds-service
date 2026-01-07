import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReferenceData,
  ReferenceDataSchema,
} from 'src/reference-data/reference-data.schema';
import { ReferenceDataService } from 'src/reference-data/reference-data.service';
import { ReferenceDataController } from 'src/reference-data/reference-data.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ReferenceData.name,
        schema: ReferenceDataSchema,
        collection: 'reference_data',
      },
    ]),
  ],
  providers: [ReferenceDataService],
  controllers: [ReferenceDataController],
  exports: [ReferenceDataService],
})
export class ReferenceDataModule {}
