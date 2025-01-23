import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request, response } from 'express';
import { config } from 'dotenv';
import { PrismaService } from 'src/prisma/prisma.service';
// import { UsersService } from '../../users/users.service';
const customExtractor = (req: Request) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null;
};

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-two-factor') {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([customExtractor]),
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return payload;
    }
}