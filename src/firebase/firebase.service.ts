// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import * as admin from 'firebase-admin';
// import { readFileSync } from 'fs';
// import { join } from 'path';

// @Injectable()
// export class FirebaseService implements OnModuleInit {
//   private readonly logger = new Logger(FirebaseService.name);

//   onModuleInit() {
//     if (admin.apps.length > 0) {
//       return;
//     }

//     const serviceAccount = JSON.parse(
//       readFileSync(
//         join(process.cwd(), 'config', 'firebase-service-account.json'),
//         'utf8',
//       ),
//     );

//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });

//     this.logger.log('Firebase initialized successfully');
//   }

//   /**
//    * Send notification to a single device
//    */
//   async send(message: admin.messaging.Message) {
//     try {
//       return await admin.messaging().send(message);
//     } catch (error) {
//       this.logger.error('Failed to send notification', error);
//       throw error;
//     }
//   }

//   /**
//    * Send notification to multiple devices
//    */
//   async sendMulticast(
//     message: admin.messaging.MulticastMessage,
//   ) {
//     try {
//       return await admin.messaging().sendEachForMulticast(message);
//     } catch (error) {
//       this.logger.error('Failed to send multicast notification', error);
//       throw error;
//     }
//   }

//   /**
//    * Subscribe tokens to a topic
//    */
//   async subscribeToTopic(
//     tokens: string[],
//     topic: string,
//   ) {
//     return admin.messaging().subscribeToTopic(tokens, topic);
//   }

//   /**
//    * Unsubscribe tokens from a topic
//    */
//   async unsubscribeFromTopic(
//     tokens: string[],
//     topic: string,
//   ) {
//     return admin.messaging().unsubscribeFromTopic(tokens, topic);
//   }
// }

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import {
  getMessaging,
  Message,
  MulticastMessage,
  BatchResponse,
} from 'firebase-admin/messaging';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    if (getApps().length > 0) {
      return;
    }

    initializeApp({
      credential: cert({
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      }),
    });

    this.logger.log('Firebase initialized successfully');
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    try {
      const messageId = getMessaging().send({
        token,
        notification: {
          title,
          body,
        },
        data,
      });

      this.logger.log(`Notification sent successfully: ${messageId}`);

      return messageId;
    } catch (error) {
      this.logger.error('Failed to send notification', error);
      throw error;
    }
  }

  /**
   * Send notification to a single device
   */
  async send(message: Message): Promise<string> {
    try {
      const messageId = await getMessaging().send(message);

      this.logger.log(`Notification sent successfully: ${messageId}`);

      return messageId;
    } catch (error) {
      this.logger.error('Failed to send notification', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   */
  async sendMulticast(
    message: MulticastMessage,
  ): Promise<BatchResponse> {
    try {
      const response = await getMessaging().sendEachForMulticast(message);

      this.logger.log(
        `Success: ${response.successCount}, Failed: ${response.failureCount}`,
      );

      return response;
    } catch (error) {
      this.logger.error('Failed to send multicast notification', error);
      throw error;
    }
  }

  /**
   * Subscribe devices to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string) {
    return getMessaging().subscribeToTopic(tokens, topic);
  }

  /**
   * Unsubscribe devices from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string) {
    return getMessaging().unsubscribeFromTopic(tokens, topic);
  }
}