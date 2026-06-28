import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TwilioService{
  async sendSms(to: string, body: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_PHONE_NUMBER!;

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const form = new URLSearchParams({
      To: to,
      From: from,
      Body: body,
    });

    const { data } = await axios.post(url, form, {
      auth: {
        username: accountSid,
        password: authToken,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return data;
  }
}