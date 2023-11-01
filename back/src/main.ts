//main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as serveStatic from 'serve-static';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'], // activez les différents niveaux de log ici
  });
  app.useGlobalPipes(new ValidationPipe());

  // Configuration CORS pour votre API HTTP
  // app.enableCors({
  //   origin: 'http://localhost:8080',
  //   methods: ['GET', 'POST', 'PUT'],
  //   credentials: true,
  // });

  app.enableCors({
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'my-custom-header'],
    credentials: true,
  });

  // Serveur de fichiers statiques
  const staticPath = '/uploads';
  app.use('/uploads', serveStatic(staticPath));

  await app.listen(3000);

}

bootstrap();



