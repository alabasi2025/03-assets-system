/**
 * Assets & Maintenance System API
 * نظام إدارة الأصول والصيانة
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('نظام الأصول والصيانة - Assets & Maintenance System')
    .setDescription(`
      ## API Documentation
      
      هذا التوثيق يشمل جميع نقاط النهاية (Endpoints) المتاحة في نظام إدارة الأصول والصيانة.
      
      ### الوحدات الرئيسية:
      - **الأصول (Assets)**: إدارة الأصول الثابتة
      - **تصنيفات الأصول (Asset Categories)**: تصنيف وتنظيم الأصول
      - **الإهلاك (Depreciation)**: حساب وإدارة إهلاك الأصول
      - **خطط الصيانة (Maintenance Plans)**: الصيانة الوقائية
      - **طلبات الصيانة (Maintenance Requests)**: الصيانة الطارئة
      - **أوامر العمل (Work Orders)**: إدارة أوامر العمل
      - **قطع الغيار (Spare Parts)**: إدارة المخزون
    `)
    .setVersion('1.0.0')
    .addTag('Assets', 'إدارة الأصول الثابتة')
    .addTag('Asset Categories', 'تصنيفات الأصول')
    .addTag('Depreciation', 'إدارة الإهلاك')
    .addTag('Maintenance Plans', 'خطط الصيانة الوقائية')
    .addTag('Maintenance Requests', 'طلبات الصيانة الطارئة')
    .addTag('Work Orders', 'أوامر العمل')
    .addTag('Spare Parts', 'قطع الغيار')
    .addTag('Health', 'فحص صحة النظام')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Assets System API Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  Logger.log(`🚀 Assets System API is running on: http://localhost:${port}`);
  Logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  Logger.log(`📡 API Endpoints available at: http://localhost:${port}/api/v1`);
}

bootstrap();
