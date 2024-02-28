import { NestMiddleware, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import path, { join, resolve } from 'path';
const resolvePath = (file: string) => path.resolve(`../${file}`);
const allowedExt = [
  '.js',
  '.ico',
  '.css',
  '.png',
  '.jpg',
  '.woff2',
  '.woff',
  '.ttf',
  '.svg',
];
@Injectable({ scope: Scope.REQUEST })
export class FrontendMiddleware implements NestMiddleware {
  constructor(private _configService: ConfigService) {}
  use(req: Request, res: Response, next: any) {
    const { url } = req;
    if (url.indexOf('/api') === 0) {
      // it starts with /api --> continue with execution
      next();
    } else if (allowedExt.filter((ext) => url.indexOf(ext) > 0).length > 0) {
      // it has a file extension --> resolve the file

      res.sendFile(
        resolve(
          join(
            __dirname,
            this._configService.get<string>('CLIENT_DIST') || '',
            url,
          ),
        ),
      );
    } else {
      res.sendFile(
        resolvePath(this._configService.get<string>('CLIENT_INDEX_FILE') || ''),
      );
    }
  }
}
