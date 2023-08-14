/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from '../service/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthServiceController, AuthServiceControllerMethods } from '../service/grpc-auth-service';

@ApiTags('authentication')
@AuthServiceControllerMethods()
@Controller()
export class AuthenticationController implements AuthServiceController {
    constructor(private readonly authService: AuthenticationService) { }

    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('redirect')
    @UseGuards(AuthGuard('google'))
    googleSignInRedirect(@Req() req) {
        return this.authService.googleAuth(req)
    }

    @GrpcMethod()
    async validate(payload: JwtPayload) {
        return await this.authService.validate(payload)
    }

    @Get('welcome')
    @UseGuards(AuthGuard('jwt'))
    async welcome() {
        return 'welcome !'
    }



}
