import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { School, SchoolSchema } from './school.schema';
import { PROVIDER } from '../common/constants/providers';
import { Model } from 'mongoose';

@Module({
//   imports: [
//     MongooseModule.forFeature([
//         { name: School.name, schema: SchoolSchema },
//     ]),
//   ],
  controllers: [SchoolController],
  providers: [SchoolService],
    // {
    //   provide: PROVIDER.SCHOOL_MODEL, // Custom provider for School model
    //   useFactory: (schoolModel: Model<School>) => schoolModel, // Inject Mongoose Model here
    //   inject: [School], // Inject the School model
    // },
//   ],
})
export class SchoolModule {}
