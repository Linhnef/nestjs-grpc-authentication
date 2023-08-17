/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Gradient Platform Authentication Swagger')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });

  // microservices

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(process.cwd(), 'dist/protos/rpc/user.proto'),
      url: configService.get('AUTH_GRPC_CONNECTION_URL'),
    },
  });
  app.startAllMicroservices();
  app.listen(configService.get('PORT'));
  Logger.debug(`Server Running in ${configService.get('PORT')}`, 'NestApplication');
}
bootstrap();
