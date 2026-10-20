import 'reflect-metadata';
import cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { EnvService } from '@/config/env.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const env = app.get(EnvService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: [env.webOrigin, ...env.corsOrigins],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Mcp-Protocol-Version',
      'Mcp-Session-Id',
    ],
  });

  app.setGlobalPrefix('api', {
    exclude: [
      '.well-known/oauth-authorization-server',
      '.well-known/oauth-protected-resource',
    ],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Tarikul's Personal MCP Server")
    .setDescription('Google Calendar MCP, OAuth, and dashboard API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(env.port, '0.0.0.0');

  console.log(`🚀 Server: http://localhost:${env.port}`);
  console.log(`📚 Docs:   http://localhost:${env.port}/api/docs`);
}

void bootstrap();