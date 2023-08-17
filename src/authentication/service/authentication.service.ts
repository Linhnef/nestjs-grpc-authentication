/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import Token from '../entity/token';
import { google } from 'googleapis';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { SignInDTO } from '../dto/sign-in.dto';
import { ClientGrpc } from '@nestjs/microservices';
import { GrpcUserService, User } from './grpc-user-service';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class AuthenticationService implements OnModuleInit {
    private grpcUserService: GrpcUserService;
    constructor(
        @InjectRepository(Token)
        private tokenRepository: Repository<Token>,
        private jwtService: JwtService,
        @Inject('USER_SERVICE')
        private grpcClient: ClientGrpc,
    ) { }

    onModuleInit() {
        this.grpcUserService = this.grpcClient.getService<GrpcUserService>('UserService');
    }

    // &access_type=offline&prompt=consent
    async googleAuth(req) {
        const { refreshToken, accessToken, email, name, picture } = req.user

        const existed = await firstValueFrom(this.grpcUserService.getUser({
            email: email,
        }))
        const payload: JwtPayload = { email: email };
        const jwtToken: string = await this.jwtService.sign(payload);

        if (existed.exited) {
            return { existed: true }
        } else {
            const newUser = await firstValueFrom(this.grpcUserService.createUser({
                email: email,
                username: name,
                avatar: picture
            }))

            const token = new Token()
            token.accessToken = accessToken;
            token.refreshToken = refreshToken;
            token.userId = newUser.id;

            await this.tokenRepository.save(token);

            return { ...newUser, jwtToken, existed: false }
        }
    }

    async signIn(param: SignInDTO) {
        const { accessToken } = param

        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2()
        oauth2Client.setCredentials({ access_token: accessToken });

        var oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });

        const user = await oauth2.userinfo.get();

        const existed = await firstValueFrom(this.grpcUserService.getUser({
            email: user.data.email,
        }))

        if (!existed) throw new HttpException('User Not Found !!!', HttpStatus.NOT_FOUND);

        const payload: JwtPayload = { email: user.data.email };
        const jwtToken: string = await this.jwtService.sign(payload);

        return { ...existed, jwtToken }
    }

    async refreshToken(user: User) {

        const existed = await this.tokenRepository.findOne({ where: { userId: user.id } })

        if (!existed) throw new HttpException('User Not Found !!!', HttpStatus.NOT_FOUND);

        const OAuth2 = google.auth.OAuth2;

        const oauth2Client = new OAuth2()

        oauth2Client.setCredentials({ refresh_token: existed.refreshToken, access_token: existed.accessToken });

        const refreshToken = await oauth2Client.refreshAccessToken()


        existed.refreshToken = refreshToken.credentials.refresh_token
        existed.accessToken = refreshToken.credentials.access_token

        await this.tokenRepository.save(existed)

        const payload: JwtPayload = { email: user.email };
        const jwtToken: string = await this.jwtService.sign(payload);

        return { ...existed, jwtToken }
    }

    async me(user: User) {
        const payload: JwtPayload = { email: user.email };
        const jwtToken: string = await this.jwtService.sign(payload);
        return { ...user, jwtToken }
    }

    async validate(payload: JwtPayload) {
        const { email } = payload;
        const user: User = await firstValueFrom(this.grpcUserService.getUser({ email }))

        if (!user) {
            throw new UnauthorizedException();
        }
        const token: Token = await this.tokenRepository.findOne({ where: { userId: user.id } })

        if (!token) {
            throw new UnauthorizedException();
        }

        const { refreshToken, userId, created_at, updated_at, ...props } = token

        return {
            ...user,
            ...props
        };
    }

}