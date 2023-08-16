/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
import { Observable } from "rxjs";
import { JwtPayload } from "../dto/jwt-payload.dto";
import User from "../entity/token";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";

export interface GrpcAuthService {
    validate(request: JwtPayload): Observable<User>;
}

export interface AuthServiceController {
    validate(request: JwtPayload): Promise<User> | Observable<User> | User;
}

export function AuthServiceControllerMethods() {
    return function (constructor: Function) {
        const grpcMethods: string[] = ["validate"];
        for (const method of grpcMethods) {
            const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            GrpcMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods: string[] = [];
        for (const method of grpcStreamMethods) {
            const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            GrpcStreamMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}