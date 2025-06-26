import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterSchema } from './counter.schema';
import { CounterService } from './counter.services';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Counter', schema: CounterSchema }]),
  ],
  providers: [CounterService],
  exports: [CounterService],
})
export class CounterModule {}
