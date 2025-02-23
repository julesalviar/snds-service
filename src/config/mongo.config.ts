import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const mongooseModuleAsyncOptions: MongooseModuleAsyncOptions = {
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    const uri = config.get<string>('MONGO_URI');
    console.log(`Connecting to MongoDB: ${uri}`);
    return { uri };
  },
  inject: [ConfigService],
};
