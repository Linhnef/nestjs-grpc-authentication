/* eslint-disable prettier/prettier */
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { config } from 'dotenv';

import { Injectable } from '@nestjs/common';

config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

    constructor() {
        super({
            clientID: process.env.NEST_GOOGLE_CLIENT_ID,
            clientSecret: process.env.NEST_GOOGLE_SECRET,
            callbackURL: process.env.NEST_GOOGLE_CALLBACK_URL,
            scope: ['email', 'profile'],
        });
    }

    authorizationParams(options: any): any {
        return Object.assign(options, {
            access_type: 'offline',
            prompt: "consent"
        });
    }


    async validate(accessToken: string, refreshToken: string, profile, done: VerifyCallback): Promise<any> {
        const { name, emails, photos } = profile

        const user = {
            email: emails[0].value,
            name: name.givenName,
            picture: photos[0].value,
            accessToken,
            refreshToken
        }
        done(null, user);
    }
}