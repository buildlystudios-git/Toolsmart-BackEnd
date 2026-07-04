import { Controller, Post, Body, UseGuards, Req, Logger, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { PhoneNumberDto } from './dto/phonenumber.dto';
import { RefreshDto } from './dto/refresh.dto';
import { SendOtpDto, OtpDto } from './dto/otp.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenGuard } from './guards/jwt-auth.guard/refresh-token.guard';
import { AdminLoginDto } from './dto/admin-login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  // Register
  //@ts-ignore 
  // @Throttle({ limit: 5, ttl: 60 })
  // @Post('register')
  // register(@Body() dto: PhoneNumberDto) {
  //   return this.authService.register(dto);
  // }

  // Login
  //@ts-ignore 
  @Post('admilogin')
  adminLogin(@Body() dto: AdminLoginDto) {
    this.logger.log(`Admin login attempt for email: ${dto.email}`);
    return this.authService.adminLogin(dto);
  }

  // User Login
  @Post('login')
  login(@Body() dto: PhoneNumberDto) {
    this.logger.log(`User login attempt for phone number: ${dto.phoneNumber}`);
    return this.authService.login(dto);
  }


  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  refresh(@Req() req) {
    return this.authService.refresh(
      req.user.sub,
      req.user.refreshToken
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Req() req) {
    this.logger.debug(`User: ${JSON.stringify(req.user)}`);
    return this.authService.logout(req.user.sub);
  }

  // // Send OTP
  // //@ts-ignore 
  // @Throttle({ limit: 5, ttl: 60 })
  // @Post('otp/send')
  // sendOtp(@Body() dto: SendOtpDto) {
  //   return this.authService.sendOtp(dto.phoneNumber);
  // }

  // Verify OTP
  @Post('otp/verify')
  verifyOtp(@Body() dto: OtpDto) {
    return this.authService.verifyOtp(dto.phoneNumber, dto.otp!);
  }
}