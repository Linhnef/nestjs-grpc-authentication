/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable prettier/prettier */
import { Observable } from "rxjs";
import { JwtPayload } from "../dto/jwt-payload.dto";
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";

export interface User {
    id: string;
    email: string;
    avatar: string;
    username: string;
    isEnable2fa: boolean;
    isOnboarding: boolean;
    exited: boolean
}

export interface CreateUserRequest {
    email: string;
    avatar: string;
    username: string;
}


export interface UpdateUserRequest {
    id: string;
    email: string;
    avatar: string;
    username: string;
    isEnable2fa: boolean;
    isOnboarding: boolean;
}

export interface GrpcUserService {
    getUser(request: JwtPayload): Observable<User>;
    createUser(request: CreateUserRequest): Observable<User>;
    updateUser(request: UpdateUserRequest): Observable<User>;
}

export interface UserServiceController {
    getUser(request: JwtPayload): Promise<User> | Promise<User> | Observable<User> | User;
    createUser(request: CreateUserRequest): Promise<User> | Promise<User> | Observable<User> | User;
    updateUser(request: UpdateUserRequest): Promise<User> | Promise<User> | Observable<User> | User;
}

export function UserServiceControllerMethods() {
    return function (constructor: Function) {
        const grpcMethods: string[] = ["getUser", "createUser", "updateUser"];
        for (const method of grpcMethods) {
            const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
        }
        const grpcStreamMethods: string[] = [];
        for (const method of grpcStreamMethods) {
            const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
            GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
        }
    };
}