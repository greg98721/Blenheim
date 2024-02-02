import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

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
            findUser: jest.fn().mockReturnValue(
              Promise.resolve({
                username: 'bob',
                passwordHash: await bcrypt.hash('topSecret', 10),
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
            signAsync: jest.fn().mockReturnValue(Promise.resolve('test_token')),
            verifyAsync: jest.fn().mockReturnValue(
              Promise.resolve({
                username: 'bob',
                tokenType: 'refresh',
              }),
            ),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            // mock implementation of ConfigService methods
            get: jest.fn((key: string) => {
              if (key === 'REFRESH_TOKEN_SECRET') {
                return 'test_secret' as any;
              } else if (key === 'REFRESH_TOKEN_EXPIRATION') {
                return 86400 as any;
              } else if (key === 'ACCESS_TOKEN_EXPIRATION') {
                return 900 as any;
              } else {
                return undefined;
              }
            }),
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
    const tokens = await service.login('bob', 'topSecret');
    expect(tokens.access_token).toEqual('test_token');
    expect(tokens.refresh_token).toEqual('test_token');
    expect(tokens.access_token_expiry).toEqual(900);
  });

  it('can refresh an access token', async () => {
    // first login so the refresh token is in the list of valid tokens
    await service.login('bob', 'topSecret');
    const refreshTokens = await service.refreshAccessToken('test_token');
    expect(refreshTokens.access_token).toEqual('test_token');
    expect(refreshTokens.refresh_token).toEqual('test_token');
    expect(refreshTokens.access_token_expiry).toEqual(900);
  });
});
