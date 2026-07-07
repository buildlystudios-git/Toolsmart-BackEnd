import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum DeviceType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

@Schema({
  timestamps: true,
  collection: 'user_devices',
})
export class UserDevice {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  token!: string;

  @Prop({
    type: String,
    enum: Object.values(DeviceType),
    required: true,
  })
  deviceType!: DeviceType;

  @Prop()
  deviceName?: string;

  @Prop()
  appVersion?: string;

  @Prop({
    default: Date.now,
    index: true,
  })
  lastUsedAt!: Date;

  @Prop({
    default: true,
    index: true,
  })
  isActive!: boolean;
}

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);

// Indexes
UserDeviceSchema.index({ userId: 1 });
UserDeviceSchema.index({ userId: 1, isActive: 1 });
UserDeviceSchema.index({ lastUsedAt: 1 });