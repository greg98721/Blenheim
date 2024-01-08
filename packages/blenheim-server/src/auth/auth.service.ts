import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private _userService: UsersService,
    private _jwtService: JwtService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await firstValueFrom(this._userService.findUser$(username));
    if (user?.password !== password) {
      throw new UnauthorizedException();
    } else {
      if (user !== undefined && user.password === user.password) {
        return {
          access_token: this._jwtService.sign({ username: user.username }),
        };
      } else {
        return {
          access_token: await this._jwtService.signAsync({
            username: user.username,
          }),
        };
      }
    }
  }
}
