import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { config } from 'process';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  // constructor() {
  //   super({
  //     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  //     secretOrKey: process.env.JWT_SECRET,

  //     issuer: config.get<string>('JWT_ISSUER'),
  //     audience: config.get<string>('JWT_AUDIENCE'),

  //     passReqToCallback: true,
  //   });
  // }

  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),

      issuer: config.get<string>('JWT_ISSUER'),
      audience: config.get<string>('JWT_AUDIENCE'),

      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader?.replace('Bearer', '').trim();

    return {
      ...payload,
      refreshToken, // attach raw token
    };
  }
}