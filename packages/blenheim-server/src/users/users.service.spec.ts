import { Test, TestingModule } from '@nestjs/testing';
import { expect } from '@jest/globals';
import { firstValueFrom } from 'rxjs';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a valid user', () => {
    // To test an observable - use firstValueFrom to turn it into a promise and then use expect(resolves.toBe()) to process the result asynchronously
    return expect(firstValueFrom(service.findUser$('bob'))).resolves.toEqual({
      username: 'bob',
      password: 'topSecret',
      firstName: 'Bob',
      lastName: 'Smith',
      birthDate: new Date(1973, 6, 21),
      address: '16 Julian Street\nRedwoodtown\nBlenheim 7201',
      customerCode: 'ABC001',
    });
  });
  it('should not find an invalid user', () => {
    return expect(
      firstValueFrom(service.findUser$('invalid')),
    ).resolves.toEqual(undefined);
  });
});
