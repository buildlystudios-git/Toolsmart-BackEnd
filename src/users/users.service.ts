import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {}

  // CREATE USER
  async create(data: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(data);
    return await createdUser.save();
  }

  //FIND BY EMAIL
  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  // FIND BY ID
  // =========================
  async findById(userId: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await this.userModel.findById(userId).exec();
  }

  // FIND BY PHONE 
  async findByPhone(phoneNumber: string): Promise<User | null> {
    return await this.userModel.findOne({ phoneNumber }).exec();
  }

  // UPDATE REFRESH TOKEN
  async updateRefreshToken(
    userId: string,
    hash: string | null
  ): Promise<void> {
    await this.userModel.updateOne(
      { _id: userId },
      { refreshTokenHash: hash }
    ).exec();
  }

  // UPDATE USER
  async updateUser(
    userId: string,
    updateData: Partial<User>
  ): Promise<User> {
    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      updateData,
      { returnDocument: 'after' }
    ).exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }

  // DELETE USER
  async deleteUser(userId: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: userId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }

  // GET ALL USERS (Admin)
  async findAll(): Promise<User[]> {
    return await this.userModel.find().exec();
  }

  async updatePhoneNumberVerification(phoneNumber: string, isVerified: boolean): Promise<User> {
    const updated = await this.userModel.findOneAndUpdate(
      { phoneNumber },
      { isPhoneNumberVerified: isVerified },
      { returnDocument: 'after' }
    ).exec();

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  } 
}
