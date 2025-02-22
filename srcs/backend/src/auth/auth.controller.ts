import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    Injectable,
    Param,
    Post,
    Query,
    Redirect,
    Req,
    Res, UnauthorizedException,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { join } from 'path';
import { write } from 'fs';
import { TwoFactDto } from './DTOs/2fa.dto';
import { JwtTwoFactorGuard } from './guard.auth';
import { intraExceptionFilter } from './auth-exception.filter';

//https://stackoverflow.com/questions/54863655/whats-the-difference-between-interceptor-vs-middleware-vs-filter-in-nest-js

@Controller('42')
export class AuthController {
    constructor(private readonly AuthService: AuthService, private JwtService: JwtService) {}

    @Get()
    @UseGuards(AuthGuard('42'))
    async FortyTwoAuth(@Req() req) {
        return { message: 'You are logged in' };
    }

  @Get('redirect')
  @UseFilters(new intraExceptionFilter())
  @UseGuards(AuthGuard('42'))
  async FortyTwoAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Query('code') code,
  ) {
    const found = await this.AuthService.createAccount(
      req.user.username,
      req.user.avatar,
        ""
    );
    const twofa = !found.two_authentication ? true : false;
    // const enabled = twofa ? true : false;
    const accessToken = this.AuthService.signToken(
      req.user.username,
      found.user_id,
      twofa,
      true,
    );
        // if (!found.two_authentication)
        res.cookie('jwt', accessToken, { httpOnly: false });
        return twofa ? res.redirect(process.env.CLIENT_URL) : res.redirect(process.env.CLIENT_URL + '/2fa');
    }

  // only in login
  @Post('2fa')
  @UseGuards(JwtTwoFactorGuard)
  async TwoFAcheck(
    @Body() body: TwoFactDto,
    @Req() req,
    @Res({ passthrough: true }) response: any,
  ) {
    const userInfo = await this.AuthService.findUserId(req.user['userLogin']);
    const res = await this.AuthService.verify2fa(
      body.code,
      userInfo.two_authentication,
    );
    if (!res) { response.redirect(process.env.CLIENT_URL + '/2fa') ; return };
    response.clearCookie('jwt');
    const accessToken = this.AuthService.signToken(
      req.user['userLogin'],
      req.user['userId'],
      true,
      true,
    );
    response.cookie('jwt', accessToken, { httpOnly: false });
    return response.redirect(process.env.CLIENT_URL);
  }

    @Get('2fa')
    @UseGuards(AuthGuard('jwt')) //'jwt' is what we named our strategy in accessJwtStrategy.ts Guard used to get Payload JWT
    async TwoFactor(@Req() req: Request) {
        const user = req.user;
        var result = await this.AuthService.generate2fa(user['userLogin']);

        return result;
    }
    // setting isenabled to true
    @Post('2fa/activate')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(201)
    async activateTwoFA(@Body() body: TwoFactDto, @Req() req) {
        const userInfo = await this.AuthService.findUserId(req.user['userLogin']);
        const res = await this.AuthService.verify2fa(body.code, userInfo.two_authentication);
        if (!res) throw new HttpException('Token Invalid', 401);
    }
    // setting isenabled to true
    @Post('2fa/delete')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(201)
    async deleteTwoFA(@Body() body: TwoFactDto, @Req() req) {
        const userInfo = await this.AuthService.deleteTwoFa(req.user['userLogin']).catch((err) => {
            throw new HttpException('ERROR', 404);
        });
    }

    @Post('signout')
    @UseGuards(AuthGuard('jwt'))
    logout(@Res({ passthrough: true }) res) {
        res.clearCookie('jwt');
        return { message: 'Logged out' };
    }

    @Post('b3/:token')
    async b3Auth(@Param('token') token: string) {
        try {
            // Decode JWT token
            const decoded = this.AuthService.decodeB3Token(token);

            if (!decoded) {
                throw new UnauthorizedException('Invalid token');
            }

            // Get username (or format address if username is missing)
            const username = decoded.username || this.AuthService.formatAddress(decoded.address);

            // Use avatar if provided, otherwise null
            const avatar = decoded.avatar || "";

            const found = await this.AuthService.createAccount(username, avatar,token);

            const result = this.AuthService.signToken(
                username,
                found.user_id,
                false,
                false
            );

            return { access_token: result.access_token };

        } catch (error) {
            throw new UnauthorizedException('Token validation failed');
        }
    }
}
