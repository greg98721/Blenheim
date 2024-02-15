import { Injectable } from '@nestjs/common';
import { formatISO } from 'date-fns';
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
      birthDate: formatISO(new Date(1973, 6, 21), { representation: 'date' }),
      address: '16 Julian Street\nRedwoodtown\nBlenheim 7201',
      email: 'bob@here.com',
      phoneNumber: '03 578 1234',
    };
  }

  async findUser(username: string): Promise<UserWithPassword | undefined> {
    if (this._userCache.length === 0) {
      const tempUser = await this.createTempUser();
      this._userCache.push(tempUser);
    }
    return this._userCache.find((u) => u.username === username);
  }

  async addUser(user: User, password: string) {
    if (this._userCache.find((u) => u.username === user.username)) {
      throw new Error('User already exists');
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      this._userCache.push({ ...user, passwordHash: hashedPassword });
    }
  }

  updateUser(user: User) {
    this._userCache = this._userCache.map((u) => {
      if (u.username === user.username) {
        return { ...user, passwordHash: u.passwordHash };
      } else {
        return u;
      }
    });
  }

  async updateUserPassword(username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    this._userCache = this._userCache.map((u) => {
      if (u.username === username) {
        u.passwordHash = hashedPassword;
        return u;
      } else {
        return u;
      }
    });
  }

  deleteUser(username: string) {
    // Delete booking
    this._userCache = this._userCache.filter((u) => u.username !== username);
  }
}
