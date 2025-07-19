import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port: string | 3000 = process.env.PORT ?? 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://gensan.local:4200',
      'http://tacurong.local:4200',
      'https://gensan.mysnds.com',
      'https://tacurong.mysnds.com',
      'https://mysnds.com',
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,tenant',
  });

  await app.listen(port);
  logger.log(`Server running at: http://localhost:${port}`);
}

bootstrap();
