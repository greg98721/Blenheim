import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

// We define the Dto's using classes so that are preserved in the runtime Javascript for nestJs unlike interfaces
class LoginDto {
  username: string;
  password: string;
}

class RefreshDto {
  refreshToken: string;
}

class LogoutDto {
  username: string;
}
@Controller('api/auth')
export class AuthController {
  constructor(private _authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this._authService.login(loginDto.username, loginDto.password);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    return await this._authService.refreshAccessToken(refreshDto.refreshToken);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(@Body() logoutDto: LogoutDto) {
    return await this._authService.logout(logoutDto.username);
  }
}
