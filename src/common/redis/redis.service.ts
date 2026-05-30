import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT)
    });
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async del(key: string) {
    return this.client.del(key);
  }

  // 🔢 OTP methods

  async sendOtp(phoneNumber: string) {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await this.set(`otp:${phoneNumber}`, otp, 300); // 5 min expiry

    return { message: 'OTP sent' };
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const stored = await this.get(`otp:${phoneNumber}`);

    if (!stored || stored !== otp) {
      return false;
    }

    await this.del(`otp:${phoneNumber}`);
    return true;
  }

  async increment(key: string, ttl: number): Promise<number> {
    const count = await this.client.incr(key);

    if (count === 1) {
      await this.client.expire(key, ttl);
    }

    return count;
  }
}