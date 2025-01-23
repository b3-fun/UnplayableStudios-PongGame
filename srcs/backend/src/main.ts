import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    logger.log('Application instance created');

    app.use(cookieParser());
    logger.log('Cookie parser middleware enabled');

    const corsOptions = {
      origin: process.env.CLIENT_URL,
      credentials: true,
    };
    app.enableCors(corsOptions);
    logger.log(`CORS enabled for origin: ${process.env.CLIENT_URL}`);

    const config = new DocumentBuilder()
        .setTitle('ft_Transcendence')
        .setDescription('Transcendence Routes')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger documentation setup at /api');

    await app.listen(process.env.PORT);
    logger.log(`Application is running on port ${process.env.PORT}`);
  } catch (error) {
    logger.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Unhandled bootstrap error:', error);
  process.exit(1);
});