import {
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { S3Service } from 'src/utils/s3.service';
import * as bcrypt from 'bcrypt';
import * as path from 'node:path';
import { readFile } from 'node:fs/promises';
import { UserFilterDto } from './dto/get-user-filter.dto';


@Injectable()
export class UsersService implements OnApplicationBootstrap{

  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    private readonly s3Service: S3Service,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Application bootstrapped...');
    await this.loadUserScripts();

  }

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
    updateData: UpdateUserDto
  ): Promise<User> {

    if (updateData.profileImage) {
      const uploaded = await this.s3Service.uploadBase64(updateData.profileImage, `user-${userId}`);
      updateData.profileImage = uploaded.url;
    }
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
  async findAll(query: UserFilterDto): Promise<{ data: User[], total: number }> {
    const { search, isDeleted, sortBy } = query;
    const page = query.page || 1;
    const limit = query.limit || 10;

    let filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (isDeleted) {
      filter.isDeleted = isDeleted === 'true';
    }

    const skip = (page - 1) * limit;
    
    const users = await this.userModel.find(filter).sort(sortBy).skip(skip).limit(limit).exec();
    const total = await this.userModel.countDocuments(filter);
    return { data: users, total };
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

  async loadUserScripts() {

    try {
      const filePath = path.resolve(process.cwd(), 'src', 'scripts', 'admin-users.json');
      const fileContents = await readFile(filePath, 'utf-8');

      const adminUsers = JSON.parse(fileContents);

      const newUsers = [];
      for (const adminUser of adminUsers) {
        const existing = await this.findByEmail(adminUser.email);
        if (!existing) {
          const createDto: any = {
            ...adminUser,
            role: 'admin',
            isEmailVerified: true,
            isPhoneNumberVerified: true,
            password: await bcrypt.hash(adminUser.password, 10)
          };

          //@ts-ignore
          newUsers.push(createDto);

          
        }
      }
      await this.userModel.insertMany(newUsers);
      this.logger.log(`Admin users loaded: ${newUsers.length}`);
    } catch (error) {
      this.logger.error('Failed to load admin-users.json', error);
      throw new Error('Unable to load admin users');
    }
  }
}
