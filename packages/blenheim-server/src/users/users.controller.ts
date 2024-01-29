import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private _userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get(':username')
  async user(@Param('username') username: string) {
    const u = await this._userService.findUser(username);
    if (u) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...user } = u;
      return user;
    } else {
      throw new HttpException(
        `User ${username} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
