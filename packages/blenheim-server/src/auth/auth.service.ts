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
  _refreshTokens = new Map<string, string>();

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
  }> {
    const user = await this._userService.findUser(username);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return await this.createTokens(user.username);
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
          if (await this._refreshTokenMatches(user.username, refreshToken)) {
            return await this.createTokens(user.username);
          } else {
            throw new UnauthorizedException('Invalid token for user');
          }
        } else {
          throw new HttpException('User does not exist', HttpStatus.NOT_FOUND);
        }
      } else {
        throw new UnauthorizedException('Invalid token type');
      }
    } catch (e) {
      throw new UnauthorizedException(`Invalid refresh token: ${e.message}`);
    }
  }

  async logout(username: string) {
    this._removeRefreshToken(username);
  }

  private async createTokens(username: string) {
    // The default options in JwtService are set for access tokens
    const accessToken = await this._jwtService.signAsync({
      username: username,
      tokenType: 'access',
    });

    // If the client knows the expiry it will not have to wait for a failure to refresh the token
    const accessTokenExpiry =
      this._config.get<number>('ACCESS_TOKEN_EXPIRATION') ?? 0;

    const refreshOptions: JwtSignOptions = {
      secret: this._config.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this._config.get('REFRESH_TOKEN_EXPIRATION'),
    };
    const refreshToken = await this._jwtService.signAsync(
      { username: username, tokenType: 'refresh' },
      refreshOptions,
    );
    // store the refresh token so we can check it is only used once
    await this._storeRefreshToken(username, refreshToken);

    return {
      access_token: accessToken,
      access_token_expiry: accessTokenExpiry,
      refresh_token: refreshToken,
    };
  }

  private async _storeRefreshToken(username: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    this._refreshTokens.set(username, hashedToken);
  }

  private async _refreshTokenMatches(username: string, refreshToken: string) {
    const token = this._refreshTokens.get(username);
    if (!token) {
      throw new Error(`No refresh token found for ${username}`);
    }
    return await bcrypt.compare(refreshToken, token);
  }

  private _removeRefreshToken(username: string) {
    if (!this._refreshTokens.delete(username)) {
      throw new Error(`No refresh token found for ${username}`);
    }
  }
}
