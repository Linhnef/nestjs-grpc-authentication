/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export class SignUpDTO {
    @ApiProperty()
    accessToken: string

    @ApiProperty()
    refreshCode: string
};
