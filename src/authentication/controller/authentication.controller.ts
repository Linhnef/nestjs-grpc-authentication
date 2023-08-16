/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpStatus, Next, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticationService } from '../service/authentication.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthServiceController, AuthServiceControllerMethods } from '../service/grpc-auth-service';
import { SignInDTO } from '../dto/sign-in.dto';

import { config } from 'dotenv';
import { toQueryString } from 'src/utils/string';
import { GetUser } from '../decorator/get-user.decorator';
import User from '../entity/user.entity';

config();

@ApiTags('authentication')
@AuthServiceControllerMethods()
@Controller()
export class AuthenticationController implements AuthServiceController {
    constructor(private readonly authService: AuthenticationService) { }

    @Get()
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {

    }

    @Redirect()
    @Get('redirect')
    @UseGuards(AuthGuard('google'))
    async googleRedirect(@Req() req) {
        const user = await this.authService.googleAuth(req)
        if (user.existed) {
            return { url: `${process.env.NEST_APP_URL}/sign-up?existed=true` }
        } else {
            return { url: `${process.env.NEST_APP_URL}/sign-in${toQueryString(user)}` }
        }

    }

    @Post('/sign-in')
    async googleSignIn(@Body() params: SignInDTO) {
        return await this.authService.signIn(params)
    }

    @Get('/me')
    @UseGuards(AuthGuard('jwt'))
    async me(@GetUser() user: User) {
        console.log(user)
        return await this.authService.refreshToken(user)
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
