import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UsersService } from '../users/users.service';
import { RedisService } from '../common/redis/redis.service';
import { SmsService } from '../common/sms/sms.service';
import { PhoneNumberDto } from './dto/phonenumber.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
    private redisService: RedisService,
    private smsService: SmsService,
  ) {}

  // REGISTER
  // async register(dto: PhoneNumberDto) {
  //   const existing = await this.usersService.findByPhone(dto.phoneNumber);
  //   if (existing) {
  //     return await this.login(dto);
  //   }
  //   else{
  //     const user = await this.usersService.create({
  //       ...dto,
  //       isPhoneNumberVerified: false  // we will verify phone number via OTP, so set this to false initially
  //     });

  //     return await this.sendOtp(dto.phoneNumber);
  //   }
  // }

  // LOGIN
  async login(dto: PhoneNumberDto) {
    const user = await this.usersService.findByPhone(dto.phoneNumber);
    if (!user) {
      await this.usersService.create({
        ...dto,
        isPhoneNumberVerified: true  // we will verify phone number via OTP, so set this to false initially
      });
    }

    return await this.sendOtp(dto.phoneNumber);
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid user');
    }

    const isMatch = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 🔁 Rotate tokens
    return this.generateTokens(user);
  }

  // LOGOUT
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  // SEND OTP
  private async sendOtp(phoneNumber: string) {
    const key = `otp:count:${phoneNumber}`;

    // Increment count (5 min window)
    const count = await this.redisService.increment(key, 300);

    // Limit reached
    if (count > 3) {
      throw new BadRequestException(
        'Too many OTP requests. Try again after 5 minutes'
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await this.smsService.sendSms(
      phoneNumber,
      `Your OTP is ${otp}`
    );

    await this.redisService.set(`otp:${phoneNumber}`, otp, 300);

    console.log(`OTP for ${phoneNumber}: ${otp}`);

    return {
      message: 'OTP sent successfully',
      attempts: count
    };
  }

  // VERIFY OTP
  async verifyOtp(phoneNumber: string, otp: string) {
    const key = `otp:verify:${phoneNumber}`;

    const attempts = await this.redisService.increment(key, 300);

    if (attempts > 3) {
      throw new BadRequestException(
        'Too many failed attempts. Try later'
      );
    }

    const storedOtp = await this.redisService.get(`otp:${phoneNumber}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // success → reset attempts
    await this.redisService.del(key);
    await this.redisService.del(`otp:${phoneNumber}`);

    let user = await this.usersService.findByPhone(phoneNumber);

    if (!user) {
      user = await this.usersService.create({
        role: 'retailer',
        phoneNumber,
        isPhoneNumberVerified: true  // set to true after successful OTP verification
      });
    }
    else{
      user = await this.usersService.updatePhoneNumberVerification(phoneNumber, true);
    }

    return this.generateTokens(user);
  }

  // GENERATE TOKENS
  private async generateTokens(user: any) {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const payload = {
      sub: user._id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      phoneNumber: user.phoneNumber,
      isPhoneNumberVerified: user.isPhoneNumberVerified,
      role: user.role
    };

    const jwtOptions: JwtSignOptions = {
      secret: process.env.JWT_SECRET!,
      expiresIn: '20m' as const,
      issuer: process.env.JWT_ISSUER!,
      audience: process.env.JWT_AUDIENCE!,
    };


    const accessToken = this.jwt.sign(payload, jwtOptions);

    // Refresh Token (minimal payload)
    const refreshPayload = {
      sub: user._id,
      jti: uuidv4(),
    };
  

    const refreshToken = this.jwt.sign(refreshPayload, 
      {
      secret: process.env.JWT_SECRET,
      expiresIn: '6h',
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    }
    );

    const hash = await bcrypt.hash(refreshToken, 10);

    await this.usersService.updateRefreshToken(user._id, hash);

    return {
      accessToken,
      refreshToken
    };
  }
}