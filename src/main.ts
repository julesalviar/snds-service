import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port: string | 3000 = process.env.PORT ?? 3000;

  await app.listen(port);
  logger.log(`Server running at: http://localhost:${port}`);
}

bootstrap();
