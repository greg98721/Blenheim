import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { User } from '@blenheim/model';
export interface UserWithPassword extends User {
  passwordHash: string;
}

@Injectable()
export class UsersService {
  private _userCache: UserWithPassword[] = [];

  async createTempUser(): Promise<UserWithPassword> {
    const hashedPassword = await bcrypt.hash('topSecret', 10);
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
}
