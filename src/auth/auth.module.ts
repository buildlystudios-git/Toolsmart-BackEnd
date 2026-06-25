import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { RolesGuard } from './guards/roles.guard/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { CacheModule } from 'src/common/cache/cache.module';
import { SmsModule } from 'src/common/sms/sms.module';
import { RefreshTokenGuard } from './guards/jwt-auth.guard/refresh-token.guard';
import { JwtRefreshStrategy } from './strategies/jwt.strategy/jwt-refresh.strategy';

@Module({
  imports: [
    UsersModule,
    CacheModule,
    SmsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, JwtRefreshStrategy, RefreshTokenGuard, RolesGuard]
})
export class AuthModule {}
