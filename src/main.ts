import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const port: string | 3000 = process.env.PORT ?? 3000;
  const allowedOrigins = Object.entries(process.env)
    .filter(([key]) => key.startsWith('CORS_DOMAINS_'))
    .flatMap(
      ([, value]) => value?.split(',').map((origin) => origin.trim()) ?? [],
    );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,tenant',
  });

  await app.listen(port);
  logger.log(`Server running at: http://localhost:${port}`);
}

bootstrap();
