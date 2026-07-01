import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  //const allowedOrigins = JSON.parse(process.env.ALLOW_ORIGIN || '[]');

  // app.enableCors({
  //   origin: (origin, callback) => {
  //     if (!origin || allowedOrigins.includes(origin)) {
  //       return callback(null, true);
  //     }
  //     return callback(new Error('CORS blocked'));
  //   },
  //   credentials: true,
  // });

  //Allow all origins for development purposes
  app.enableCors();

  // Global API prefix
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Toolzkart API')
    .setDescription('Auth APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 4000, '0.0.0.0');
}
bootstrap();