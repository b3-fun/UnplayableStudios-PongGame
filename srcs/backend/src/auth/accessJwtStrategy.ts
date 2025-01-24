import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { Request, response } from 'express';

const customExtractor = (req: Request) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};


@Injectable()
export class accessJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([customExtractor]), //This is where we use the customExtractor functiona
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // add here a bool value to check if 2fa is enabled or not
  async validate(payload: any) {
    
    // if (payload.isAuth && payload.isEnabled)
    //     {
    //       response.redirect(process.env.CLIENT_URL + '/2fa')
    //     }
    // throw new HttpException("Can't Authenticate", 403)
    return payload
  }
}
//https://wanago.io/2020/05/25/api-nestjs-authenticating-users-bcrypt-passport-jwt-cookies/
