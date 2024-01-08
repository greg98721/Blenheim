import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';

import { User } from '@blenheim/model';

export interface UserWithPassword extends User {
  password: string;
}

@Injectable()
export class UsersService {
  private readonly _allUsers: UserWithPassword[] = [
    {
      username: 'bob',
      password: 'topSecret',
      firstName: 'Bob',
      lastName: 'Smith',
      birthDate: new Date(1973, 6, 21),
      address: '16 Julian Street\nRedwoodtown\nBlenheim 7201',
      customerCode: 'ABC001',
    },
  ];

  findUser$(username: string): Observable<UserWithPassword | undefined> {
    return of(this._allUsers.find((u) => u.username === username));
  }
}
