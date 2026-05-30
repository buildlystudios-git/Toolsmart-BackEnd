import { Injectable } from '@nestjs/common';
import { SmsProvider } from '../interfaces/sms.interface';

@Injectable()
export class GupshupService implements SmsProvider {
  async sendSms(to: string, message: string) {
    console.log('Sending via Gupshup:', to, message);
    return { success: true };
  }
}