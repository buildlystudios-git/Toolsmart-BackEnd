import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Order } from '../orders/schemas/order.schema';
import { UserDevicesService } from '../user-devices/user-devices.service';

@Injectable()
export class NotificationService {

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userDevicesService: UserDevicesService
  ) {}

  async sendNotification(dto: SendNotificationDto) {
    return this.firebaseService.send({
      token: dto.token,
      notification: {
        title: dto.title,
        body: dto.body,
      },
    });
  }

  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
  ) {
    return this.firebaseService.sendMulticast({
      tokens,
      notification: {
        title,
        body,
      },
    });
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
  ) {
    return this.firebaseService.send({
      topic,
      notification: {
        title,
        body,
      },
    });
  }

  async sendOrderStatusNotification(order: Order) {
    const title = 'Order Status Updated';
    //@ts-ignore
    const orderId = order._id;

    let body = '';

    switch (order.status) {
      case 'APPROVED':
        body = `Your order #${orderId} has been approved.`;
        break;

      case 'PROCESSING':
        body = `Your order #${orderId} is now being processed.`;
        break;

      case 'SHIPPED':
        body = `Your order #${orderId} has been shipped.`;
        break;

      case 'DELIVERED':
        body = `Your order #${orderId} has been delivered.`;
        break;

      case 'REJECTED':
        body = `Your order #${orderId} has been rejected.`;
        break;

      case 'CANCELLED':
        body = `Your order #${orderId} has been cancelled.`;
        break;

      default:
        body = `Your order #${orderId} status has been updated.`;
    }

    /**
     * Save notification in DB
     */
    // await this.notificationModel.create({
    //   userId: order.userId,
    //   title,
    //   message: body,
    //   type: 'ORDER_STATUS',
    //   orderId: order._id,
    //   isRead: false,
    // });

    /**
     * Get all active devices
     */
    const devices = await this.userDevicesService.getActiveDevices(
      order.userId.toString(),
    );

    if (!devices.length) {
      return;
    }

    /**
     * Send push notification to every active device
     */
    for (const device of devices) {
      try {
        await this.firebaseService.sendPushNotification(
          device.token,
          title,
          body,
          {
            
            orderId: orderId.toString(),
            status: order.status,
          },
        );
      } catch (error) {
        this.logger.error(
          `Failed to send notification to token ${device.token}`,
          error,
        );

        /**
         * Token expired/invalid
         */
        await this.userDevicesService.removeInvalidToken(device.token);
      }
    }
  }
}