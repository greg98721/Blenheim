import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            // mock implementation of UsersService methods
            findUser$: jest.fn().mockReturnValue(
              of({
                username: 'bob',
                password: 'topSecret',
                firstName: 'Bob',
                lastName: 'Smith',
                birthDate: new Date(1973, 6, 21),
                address: '16 Julian Street\nRedwoodtown\nBlenheim 7201',
                customerCode: 'ABC001',
              }),
            ),
          },
        },
        {
          provide: JwtService,
          useValue: {
            // mock implementation of JwtService methods
            sign: jest.fn().mockReturnValue('test_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a JWT on successful login', async () => {
    const result = {
      access_token: 'test_token',
    };

    jest
      .spyOn(service, 'login')
      .mockImplementation(() => Promise.resolve(result));

    expect(await service.login('bob', 'topSecret')).toEqual(result);
  });
});
