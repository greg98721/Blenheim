import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @Post('login')
  async login(@Body() signInDto: Record<string, any>) {
    return this._authService.login(signInDto.username, signInDto.password);
  }
}
