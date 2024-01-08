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
import { map } from 'rxjs';

@Controller('api/users')
export class UsersController {
  constructor(private _userService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get(':username')
  user(@Param('username') username: string) {
    return this._userService.findUser$(username).pipe(
      map((user) => {
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password, ...result } = user;
          return result;
        } else {
          throw new HttpException(
            `User ${username} not found`,
            HttpStatus.NOT_FOUND,
          );
        }
      }),
    );
  }
}
