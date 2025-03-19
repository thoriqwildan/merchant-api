import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const options = new DocumentBuilder()
    .setTitle('Merchant RESTful API')
    .setDescription('This is a RESTful API for a merchant application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  console.log(`App Environment: ${configService.get<string>('NODE_ENV')}`);
  console.log(`Running on port: ${configService.get<number>('PORT')}`);

  app.use('/profiles', express.static('uploads/profiles'));

  app.enableCors(configService.get<boolean>('ENABLE_CORS'));

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(configService.get<number>('PORT') || 3000);
}
void bootstrap();
