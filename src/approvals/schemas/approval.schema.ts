import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Approval {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status!: ApprovalStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  approvedBy?: Types.ObjectId;

  @Prop()
  rejectionReason?: string;

  @Prop({ default: false })
  isDeleted?: boolean;
}

export const ApprovalSchema = SchemaFactory.createForClass(Approval);

// 🔥 Indexes
ApprovalSchema.index({ userId: 1 });
ApprovalSchema.index({ status: 1 });
ApprovalSchema.index({ createdAt: -1 });