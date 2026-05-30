import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Approval, ApprovalStatus } from './schemas/approval.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class ApprovalsService {
  constructor(
    @InjectModel(Approval.name)
    private approvalModel: Model<Approval>,
  ) {}

  //  Create
  async create(userId: string, dto: any) {
    return this.approvalModel.create({
      ...dto,
      userId,
    });
  }

  //  Get all
  async findAll(query: any) {
    const { status } = query;

    const filter: any = { isDeleted: false };

    if (status) filter.status = status;

    return this.approvalModel
      .find(filter)
      .sort({ createdAt: -1 });
  }

  //  Get one
  async findById(id: string) {
    const approval = await this.approvalModel.findById(id);

    if (!approval) throw new NotFoundException('Approval not found');

    return approval;
  }

  //  Update
  async update(id: string, dto: any) {
    const approval = await this.approvalModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );

    if (!approval) throw new NotFoundException('Approval not found');

    return approval;
  }

  //  Approve
  async approve(id: string, adminId: string) {
    const approval = await this.approvalModel.findById(id);

    if (!approval) throw new NotFoundException('Approval not found');

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Already processed');
    }

    approval.status = ApprovalStatus.APPROVED;
    approval.approvedBy = new Types.ObjectId(adminId);

    return approval.save();
  }

  //  Reject
  async reject(id: string, adminId: string, reason?: string) {
    const approval = await this.approvalModel.findById(id);

    if (!approval) throw new NotFoundException('Approval not found');

    if (approval.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Already processed');
    }

    approval.status = ApprovalStatus.REJECTED;
    approval.approvedBy = new Types.ObjectId(adminId);
    approval.rejectionReason = reason;

    return approval.save();
  }
}