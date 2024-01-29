import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '@blenheim/model';
export interface UserWithPassword extends User {
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private _userCache: UserWithPassword[] = [];
  private _refreshTokens = new Map<string, string>();

  async createTempUser(): Promise<UserWithPassword> {
    const hashedPassword = await this.hashPassword('topSecret');
    return {
      username: 'bob',
      passwordHash: hashedPassword,
      firstName: 'Bob',
      lastName: 'Smith',
      birthDate: new Date(1973, 6, 21),
      address: '16 Julian Street\nRedwoodtown\nBlenheim 7201',
      customerCode: 'ABC001',
    };
  }

  async findUser(username: string): Promise<UserWithPassword | undefined> {
    if (this._userCache.length === 0) {
      const tempUser = await this.createTempUser();
      this._userCache.push(tempUser);
    }
    return this._userCache.find((u) => u.username === username);
  }

  async addRefreshToken(username: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    this._refreshTokens.set(username, hashedToken);
  }

  async refreshTokenMatches(username: string, refreshToken: string) {
    const token = this._refreshTokens.get(username);
    if (!token) {
      throw new Error(`No refresh token found for ${username}`);
    }
    return await bcrypt.compare(refreshToken, token);
  }

  removeRefreshToken(username: string) {
    if (!this._refreshTokens.delete(username)) {
      throw new Error(`No refresh token found for ${username}`);
    }
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
}
