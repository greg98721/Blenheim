import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

export interface TokenPayload {
  username: string;
  tokenType: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private _userService: UsersService,
    private _jwtService: JwtService,
    private _config: ConfigService,
  ) {}

  async login(
    username: string,
    password: string,
  ): Promise<{
    access_token: string;
    access_token_expiry: number;
    refresh_token: string;
    refresh_token_expiry: number;
  }> {
    const user = await this._userService.findUser(username);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // The default options in JwtService are set for access tokens
      const accessToken = await this._jwtService.signAsync({
        username: user.username,
        tokenType: 'access',
      });

      const refreshOptions: JwtSignOptions = {
        secret: this._config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this._config.get('REFRESH_TOKEN_EXPIRATION'),
      };
      const refreshToken = await this._jwtService.signAsync(
        { username: user.username, tokenType: 'refresh' },
        refreshOptions,
      );
      const accessTokenExpiry = this._config.get<number>(
        'ACCESS_TOKEN_EXPIRATION',
      );
      const refreshTokenExpiry = this._config.get<number>(
        'REFRESH_TOKEN_EXPIRATION',
      );
      return {
        access_token: accessToken,
        access_token_expiry: accessTokenExpiry ?? 0,
        refresh_token: refreshToken,
        refresh_token_expiry: refreshTokenExpiry ?? 0,
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const refreshOptions: JwtSignOptions = {
        secret: this._config.get<string>('REFRESH_TOKEN_SECRET'),
      };
      const payload = await this._jwtService.verifyAsync<TokenPayload>(
        refreshToken,
        refreshOptions,
      );
      if (payload.tokenType === 'refresh') {
        const user = await this._userService.findUser(payload.username);
        if (user !== undefined) {
          if (
            await this._userService.refreshTokenMatches(
              user.username,
              refreshToken,
            )
          ) {
            const accessToken = await this._jwtService.signAsync({
              username: user.username,
              tokenType: 'access',
            });
            return {
              access_token: accessToken,
            };
          } else {
            throw new UnauthorizedException('Invalid token for user');
          }
        } else {
          throw new HttpException(
            'User with this id does not exist',
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(username: string) {
    this._userService.removeRefreshToken(username);
  }
}
