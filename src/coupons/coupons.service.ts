import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './schemas/coupon.schema';
import { CouponFilterDto } from './dto/get-coupon-filter.dto';
import { Model, Types } from 'mongoose';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name)
    private couponModel: Model<Coupon>,
  ) {}

  // CREATE
  async create(dto: any) {
    return this.couponModel.create(dto);
  }

  //  UPDATE
  async update(id: string, dto: any) {
    const coupon = await this.couponModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    if (!coupon) throw new NotFoundException('Coupon not found');

    return coupon;
  }

  // DELETE
  async delete(id: string) {
    const coupon = await this.couponModel.findById(id);

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    await this.couponModel.deleteOne({ _id: id });

    return { message: 'Coupon deleted' };
  }

  // OPTIONAL: GET ALL
  async findAll(query: CouponFilterDto) {
    let {
        id
    } = query;

    const filter: any = {  };

    if (id) {
        try {
        filter._id = new Types.ObjectId(id);
        } catch (error) {
        throw new BadRequestException('Invalid coupon Id');
        }
    }

    const coupons = await this.couponModel.find({...filter}).sort({ createdAt: -1 });
    if (Object.keys(filter).length > 0 && coupons.length < 1) {
        throw new NotFoundException('No coupons found matching the criteria');
    }
    
    return coupons;
  }

  // OPTIONAL: GET ONE
  async findById(id: string) {
    const coupon = await this.couponModel.findById(id);

    if (!coupon) throw new NotFoundException('Coupon not found');

    return coupon;
  }
}