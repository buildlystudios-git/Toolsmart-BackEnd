import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly firebaseService: FirebaseService) {}

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
}