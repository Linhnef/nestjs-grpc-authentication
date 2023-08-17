/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from "../dto/jwt-payload.dto";
import { AuthenticationService } from "./authentication.service";
import { User } from "./grpc-user-service";

@Injectable()
export class JwtStategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthenticationService
    ) {
        super({
            secretOrKey: 'secretKey',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        return await this.authService.validate(payload)
    }
}