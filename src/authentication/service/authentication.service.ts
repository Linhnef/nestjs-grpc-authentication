/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import User from '../entity/token';
import { google } from 'googleapis';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { SignInDTO } from '../dto/sign-in.dto';


@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User)
        private authenticationRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    // &access_type=offline&prompt=consent
    async googleAuth(req) {
        const { refreshToken, accessToken, email, name, picture } = req.user
        const existed = await this.authenticationRepository.findOne({ where: { email: email } })

        const payload: JwtPayload = { email: email };
        const jwtToken: string = await this.jwtService.sign(payload);

        if (!!existed) {
            return { existed: true }
        } else {
            const newUser = await this.authenticationRepository.create({
                email: email,
                avatar: picture,
                username: name,
                accessToken: accessToken,
                refreshToken: refreshToken,
            })

            await this.authenticationRepository.save(newUser);

            const { refreshToken: _, ...props } = newUser
            return { ...props, jwtToken, existed: false }
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

        const existed = await this.authenticationRepository.findOne({ where: { email: user.data.email } })

        if (!existed) throw new HttpException('User Not Found !!!', HttpStatus.NOT_FOUND);

        const payload: JwtPayload = { email: user.data.email };
        const jwtToken: string = await this.jwtService.sign(payload);

        const { refreshToken: _, ...props } = existed

        return { ...props, jwtToken }

    }

    async refreshToken(user: User) {

        const OAuth2 = google.auth.OAuth2;

        const oauth2Client = new OAuth2()

        oauth2Client.setCredentials({ refresh_token: user.refreshToken, access_token: user.accessToken });

        const refreshToken = await oauth2Client.refreshAccessToken()

        const existed = await this.authenticationRepository.findOne({ where: { email: user.email } })

        if (!existed) throw new HttpException('User Not Found !!!', HttpStatus.NOT_FOUND);

        existed.refreshToken = refreshToken.credentials.refresh_token
        existed.accessToken = refreshToken.credentials.access_token

        await this.authenticationRepository.save(existed)

        const payload: JwtPayload = { email: user.email };
        const jwtToken: string = await this.jwtService.sign(payload);

        return { ...existed, jwtToken }
    }

    async validate(payload: JwtPayload) {
        const { email } = payload;
        const user: User = await this.authenticationRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }

}