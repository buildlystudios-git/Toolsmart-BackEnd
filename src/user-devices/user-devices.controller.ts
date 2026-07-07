import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { UserDevicesService } from './user-devices.service';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';
import { UnregisterDeviceDto } from './dto/unregister-device.dto';

@ApiTags('User Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user-devices')
export class UserDevicesController {
  constructor(
    private readonly userDevicesService: UserDevicesService,
  ) {}

  /**
   * Register or Update Device
   * Called immediately after login
   */
  @Post('register')
  @ApiOperation({
    summary: 'Register device for push notifications',
  })
  registerDevice(
    @Req() req: any,
    @Body() dto: CreateUserDeviceDto,
  ) {
    return this.userDevicesService.registerDevice(
      req.user.sub,
      dto,
    );
  }

  /**
   * Unregister Device
   * Called during logout
   */
    @Delete('unregister')
    unregisterDevice(
    @Req() req: any,
    @Body() dto: UnregisterDeviceDto,
    ) {
    return this.userDevicesService.unregisterDevice(
        req.user.sub,
        dto.token,
    );
    }

  /**
   * Get all registered devices
   */
  @Get()
  @ApiOperation({
    summary: 'Get logged in user devices',
  })
  getDevices(@Req() req: any) {
    return this.userDevicesService.getUserDevices(
      req.user.sub,
    );
  }
}