import 'reflect-metadata';
import cookieParser from 'cookie-parser';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  // Enable cookie parsing for incoming requests.
  app.use(cookieParser());

  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('PORT');
  const webOrigin = config.getOrThrow<string>('WEB_ORIGIN');
  const corsOrigins = config.getOrThrow<string[]>('CORS_ORIGINS');

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors({
    origin: [webOrigin, ...corsOrigins],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Mcp-Protocol-Version',
      'Mcp-Session-Id',
    ],
  });

  app.setGlobalPrefix('api');

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

  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server: http://localhost:${port}`);
  console.log(`📚 Docs:   http://localhost:${port}/api/docs`);
}

void bootstrap();
