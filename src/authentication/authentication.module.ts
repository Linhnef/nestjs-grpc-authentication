/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthenticationService } from './service/authentication.service';
import User from './entity/token';
import { AuthenticationController } from './controller/authentication.controller';
import { JwtStategy } from './service/jwt.stategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { GoogleStrategy } from './service/google.stategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: 'secretKey',
            signOptions: {
                expiresIn: 3600,
            }
        }),
        TypeOrmModule.forFeature([User]),
        ClientsModule.register([
            {
                name: 'AUTH_SERVICE',
                transport: Transport.GRPC,
                options: {
                    package: 'auth',
                    protoPath: join(process.cwd(), 'dist/protos/rpc/auth.proto')
                },
            },
        ]),
        ClientsModule.register([
            {
                name: 'USER_SERVICE',
                transport: Transport.GRPC,
                options: {
                    package: 'user',
                    protoPath: join(process.cwd(), 'dist/protos/rpc/user.proto'),
                    url: process.env.USER_GRPC_CONNECTION_URL
                },
            },
        ])
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, GoogleStrategy, JwtStategy],
    exports: [PassportModule, JwtStategy]
})
export class AuthenticationModule { }