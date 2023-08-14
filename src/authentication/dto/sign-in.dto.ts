/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export class SignInDTO {
    @ApiProperty()
    accessToken: string

    @ApiProperty()
    refreshCode: string
};
