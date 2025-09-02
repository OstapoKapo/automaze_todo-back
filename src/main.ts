import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/HttpException.filter';
import helmet from 'helmet';
import { ExcludeSensitiveInterceptor } from './common/middleware/Exclude-sensitive.interceptor';
import { FastifyAdapter } from '@nestjs/platform-fastify';




dotenv.config({path: '.env.local'})


async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';


  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ trustProxy: true })
  );

  app.use(cookieParser());

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new ExcludeSensitiveInterceptor());

  const config = new DocumentBuilder()
    .setTitle('to-do app API')
    .setDescription('API for managing to-do items')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT;
  if(!PORT) throw new Error("No PORT specified in env.local file");

  await app.listen(PORT);
}
bootstrap();
