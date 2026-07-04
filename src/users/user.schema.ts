import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class User {

  @Prop({ type: String, index: true, default: null })
  email?: string;

  @Prop({ default: false })
  isEmailVerified?: boolean;

  @Prop({ type: String, index: true, unique: true, sparse: true, required: true })
  phoneNumber!: string;

  // we verify phone number via OTP immidiately on registration, so we can set this to true by default
  @Prop({ default: true })
  isPhoneNumberVerified?: boolean;

  @Prop({ required: false })
  fullName?: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ type: String, required: false })
  refreshTokenHash?: string | null;

  @Prop({
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  })
  role!: string;

  @Prop()
  shopName?: string;

  @Prop()
  gstNumber?: string;

  @Prop()
  profileImage?: string;

  @Prop([
    {
      addressLine: { type: String, required: true },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      landmark: { type: String },
      label: { type: String },
      workplaceImage: { type: String },
      isDefault: { type: Boolean, default: false }
    }
  ])
  addresses?: {
    addressLine: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    label?: string;
    workplaceImage?: string;
    isDefault?: boolean;
  }[];

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);