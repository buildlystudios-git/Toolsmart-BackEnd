import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { Category } from '../categories/schemas/category.schema';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { Order } from '../orders/schemas/order.schema';
import { User } from '../users/schemas/user.schema';
import { DashboardActivityItem } from './interfaces/dashboard-activity-item.interface';
import { Product } from 'src/products/schemas/product.schema';

const REPORTING_TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET_MS = (5 * 60 + 30) * 60_000;

// Replace with the actual stored terminal status from OrderStatus.
const COMPLETED_ORDER_STATUSES: ReadonlySet<string> = new Set(['COMPLETED']);

interface StatusCount {
  _id: string | null;
  count: number;
}

interface MonthlyCount {
  _id: number;
  count: number;
}

// Mongoose creates these fields through `timestamps: true`.
type Timestamped<T> = T & { createdAt: Date };

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<Timestamped<User>>,

    @InjectModel(Order.name)
    private readonly orderModel: Model<Timestamped<Order>>,

    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,

    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
  ) {}

  async getSummary() {
    const [userCounts, orderCounts, categories, products] = await Promise.all([
      this.userModel
        .aggregate<{ total: number; active: number }>([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: {
                $sum: {
                  $cond: [
                    { $eq: [{ $ifNull: ['$isDeleted', false] }, false] },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ])
        .exec(),

      this.orderModel
        .aggregate<StatusCount>([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
        .exec(),

      this.categoryModel.countDocuments({ isActive: true }).exec(),
      this.productModel.countDocuments({ isActive: true }).exec(),
    ]);

    const users = userCounts[0];
    const orders = { total: 0, pending: 0, completed: 0 };

    for (const { _id: status, count } of orderCounts) {
      orders.total += count;

      if (status === OrderStatus.PENDING_APPROVAL) {
        orders.pending += count;
      }

      if (status !== null && COMPLETED_ORDER_STATUSES.has(status)) {
        orders.completed += count;
      }
    }

    return {
      users: {
        total: users?.total ?? 0,
        active: users?.active ?? 0,
        suspended: (users?.total ?? 0) - (users?.active ?? 0),
      },
      orders,
      categories,
      products,
    };
  }

  async getAnalytics(year?: number) {
    const now = new Date();
    const nowInIndia = new Date(now.getTime() + IST_OFFSET_MS);
    const currentYear = nowInIndia.getUTCFullYear();
    const reportingYear = year ?? currentYear;

    if (
      !Number.isInteger(reportingYear) ||
      reportingYear < 1900 ||
      reportingYear > currentYear
    ) {
      throw new BadRequestException(
        `year must be an integer between 1900 and ${currentYear}`,
      );
    }

    const isCurrentYear = reportingYear === currentYear;
    const start = new Date(Date.UTC(reportingYear, 0, 1) - IST_OFFSET_MS);
    const end = isCurrentYear
      ? now
      : new Date(Date.UTC(reportingYear + 1, 0, 1) - IST_OFFSET_MS);
    const monthCount = isCurrentYear ? nowInIndia.getUTCMonth() + 1 : 12;

    const monthlyPipeline: PipelineStage[] = [
      { $match: { createdAt: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            $month: { date: '$createdAt', timezone: REPORTING_TIMEZONE },
          },
          count: { $sum: 1 },
        },
      },
    ];

    const [orderCounts, registrationCounts, usersAtStart] = await Promise.all([
      this.orderModel.aggregate<MonthlyCount>(monthlyPipeline).exec(),
      this.userModel.aggregate<MonthlyCount>(monthlyPipeline).exec(),
      this.userModel.countDocuments({ createdAt: { $lt: start } }).exec(),
    ]);

    const ordersByMonth = new Map(
      orderCounts.map(({ _id, count }) => [_id, count] as const),
    );
    const registrationsByMonth = new Map(
      registrationCounts.map(({ _id, count }) => [_id, count] as const),
    );

    let registeredUsersCumulative = usersAtStart;

    const months = Array.from({ length: monthCount }, (_, index) => {
      const month = index + 1;
      registeredUsersCumulative += registrationsByMonth.get(month) ?? 0;

      return {
        month,
        ordersPlaced: ordersByMonth.get(month) ?? 0,
        registeredUsersCumulative,
      };
    });

    const newRegistrations = registeredUsersCumulative - usersAtStart;

    return {
      year: reportingYear,
      months,
      userGrowthPercent:
        usersAtStart === 0
          ? null
          : Math.round((newRegistrations / usersAtStart) * 10_000) / 100,
    };
  }

  async getRecentActivity(limit = 10): Promise<DashboardActivityItem[]> {
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new BadRequestException('limit must be between 1 and 50');
    }

    const now = new Date();
    const createdAt = { $type: 'date' as const, $lte: now };

    const [orders, users] = await Promise.all([
      this.orderModel
        .find({ createdAt })
        .select('_id orderNumber createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .lean()
        .exec(),

      this.userModel
        .find({ createdAt, isDeleted: { $ne: true } })
        .select('_id fullName createdAt')
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit)
        .lean()
        .exec(),
    ]);

    const orderActivity = orders.map((order): DashboardActivityItem => {
      const entityId = order._id.toString();

      return {
        id: `ORDER_PLACED:${entityId}`,
        type: 'ORDER_PLACED',
        entityId,
        title: `New order #${order.orderNumber} placed`,
        occurredAt: order.createdAt.toISOString(),
      };
    });

    const registrationActivity = users.map((user): DashboardActivityItem => {
      const entityId = user._id.toString();
      const fullName = user.fullName?.trim();

      return {
        id: `USER_REGISTERED:${entityId}`,
        type: 'USER_REGISTERED',
        entityId,
        title: fullName ? `${fullName} registered` : 'New user registered',
        occurredAt: user.createdAt.toISOString(),
      };
    });

    return [...orderActivity, ...registrationActivity]
      .sort(
        (left, right) =>
          right.occurredAt.localeCompare(left.occurredAt) ||
          right.id.localeCompare(left.id),
      )
      .slice(0, limit);
  }
}