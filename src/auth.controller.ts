/* eslint-disable prettier/prettier */
import { Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@ApiTags('user')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) { }
}
