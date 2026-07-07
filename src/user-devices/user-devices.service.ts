import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDevice } from './schemas/user-device.schema';
import { CreateUserDeviceDto } from './dto/create-user-device.dto';

@Injectable()
export class UserDevicesService {
  constructor(
    @InjectModel(UserDevice.name)
    private readonly userDeviceModel: Model<UserDevice>,
  ) {}

  /**
   * Register or Update Device
   * Called after successful login
   */
  async registerDevice(
    userId: string,
    dto: CreateUserDeviceDto,
  ) {
    return this.userDeviceModel.findOneAndUpdate(
      { token: dto.token },
      {
        userId: new Types.ObjectId(userId),
        token: dto.token,
        deviceType: dto.deviceType,
        deviceName: dto.deviceName,
        appVersion: dto.appVersion,
        lastUsedAt: new Date(),
        isActive: true,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  }

  /**
   * Unregister Device
   * Called during logout
   */
  async unregisterDevice(
    userId: string,
    token: string,
  ) {
    const device = await this.userDeviceModel.findOne({
      userId: new Types.ObjectId(userId),
      token,
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    device.isActive = false;
    device.lastUsedAt = new Date();

    return device.save();
  }

  /**
   * Get all devices of logged-in user
   */
  async getUserDevices(userId: string) {
    return this.userDeviceModel
      .find({
        userId: new Types.ObjectId(userId),
      })
      .sort({ lastUsedAt: -1 });
  }

  /**
   * Get active devices of a user
   * Used while sending push notifications
   */
  async getActiveDevices(userId: string) {
    return this.userDeviceModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }

  /**
   * Update Last Used Time
   */
  async updateLastUsed(token: string) {
    return this.userDeviceModel.findOneAndUpdate(
      { token },
      {
        lastUsedAt: new Date(),
      },
      {
        new: true,
      },
    );
  }

  /**
   * Delete Device Permanently (Optional)
   */
  async deleteDevice(
    userId: string,
    token: string,
  ) {
    return this.userDeviceModel.findOneAndDelete({
      userId: new Types.ObjectId(userId),
      token,
    });
  }

  /**
   * Remove Invalid Firebase Token
   * Called when Firebase reports an invalid token
   */
  async removeInvalidToken(token: string) {
    return this.userDeviceModel.findOneAndUpdate(
      { token },
      {
        isActive: false,
      },
      {
        new: true,
      },
    );
  }
}