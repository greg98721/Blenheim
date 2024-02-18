import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { UsersService } from './users.service';
import { User } from '@blenheim/model';
import { AuthService } from '../auth/auth.service';

@Controller('api/users')
export class UsersController {
  constructor(
    private _userService: UsersService,
    private _authService: AuthService,
  ) {}

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

  // This is anonymous to enable creating a new user
  @Post()
  async add(@Body() data: { user: User; password: string }) {
    await this._userService.addUser(data.user, data.password);
    // then login in with this user
    return await this._authService.login(data.user.username, data.password);
  }

  @UseGuards(AuthGuard)
  @Patch()
  async updateUser(@Body() body: { user: User; password?: string }) {
    return this._userService.updateUser(body.user, body.password);
  }

  @UseGuards(AuthGuard)
  @Delete(':username')
  async deleteBooking(@Param('username') username: string) {
    return this._userService.deleteUser(username);
  }
}
