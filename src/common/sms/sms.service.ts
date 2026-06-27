import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Msg91Service } from './providers/msg91.service';
import { GupshupService } from './providers/gupshup.service';
import { SmsProvider } from './interfaces/sms.interface';

@Injectable()
export class SmsService {
  private provider: SmsProvider;
  private readonly logger = new Logger(SmsService.name);

  constructor(
    private config: ConfigService,
    private msg91: Msg91Service,
    private gupshup: GupshupService,
  ) {
    const provider = this.config.get<string>('SMS_PROVIDER');

    if (provider === 'GUPSHUP') {
      this.provider = this.gupshup;
    } else {
      this.provider = this.msg91; // default
    }
  }

  async sendSms(to: string, message: string) {
    try {
      if(process.env.CB_SMS){
        return;
      }

      return await this.provider.sendSms(to, message);
    } catch (err) {
      this.logger.warn('Primary SMS failed, fallback to Gupshup', err as string);
      return this.gupshup.sendSms(to, message);
    }
  }
}