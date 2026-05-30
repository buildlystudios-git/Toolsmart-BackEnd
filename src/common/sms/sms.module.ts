import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { Msg91Service } from './providers/msg91.service';
import { GupshupService } from './providers/gupshup.service';

@Module({
  providers: [SmsService, Msg91Service, GupshupService],
  exports: [SmsService]
})
export class SmsModule {}
