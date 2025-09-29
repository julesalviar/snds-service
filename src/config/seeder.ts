import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  if (process.env.NODE_ENV === 'production') {
    console.error('x Seeder cannot be run in production environment.');
    process.exit(1);
  }

  // e.g. ["tenant"]
  const args = process.argv.slice(2);
  const dataToSeed = args[0];

  if (!dataToSeed) {
    console.error(
      'x Please specify which seeder to run. Example: npm run seed tenant',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  // Dynamically import seeder file
  try {
    const { [`seed${capitalize(dataToSeed)}`]: seederFn } = await import(
      `./seeders/${dataToSeed}.seeder`
    );

    if (typeof seederFn !== 'function') {
      throw new Error(`Seeder function for "${dataToSeed}" not found.`);
    }

    await seederFn(app);
    console.log(`_/ ${dataToSeed} seeding completed.`);
  } catch (err) {
    console.error(`x Failed to run seeder "${dataToSeed}":`, err.message);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

bootstrap();
