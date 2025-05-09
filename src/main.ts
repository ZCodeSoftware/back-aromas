import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import config from './config';
import { corsOptions } from './config/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(corsOptions);
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const result = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));
      return new BadRequestException(result);
    },
  }));
  app.setGlobalPrefix(process.env.APP_GLOBAL_PREFIX);
  const documentationConfig = new DocumentBuilder()
    .setTitle('Aromas API')
    .setDescription('Aromas API description')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-API-KEY', in: 'header' }, 'api-key')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentationConfig);
  document.security = [{ 'api-key': [] }];
  SwaggerModule.setup('api/documentation', app, document);
  await app.listen(config().app.app_port || 3000);
}
bootstrap()
  .then(() => {
    console.log(
      'Listening on: http://localhost:' +
      config().app.app_port +
      '/' +
      config().app.app_global_prefix,
    );
    console.log('Server started successfully 🎸 ');
  })
  .catch((e) => {
    console.log('Server failed to start');
    console.log(e);
  });
