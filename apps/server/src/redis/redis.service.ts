import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Redis from 'ioredis';

const SCHEME_CACHE_TTL = 86400; // 24 hours

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger('RedisService');

  constructor(private config: ConfigService) {}
  private redis: Redis;

  async onModuleInit() {
    this.redis = new Redis(this.config.get<string>('REDIS_URL') || 'redis://localhost:6379');
    await this.populateCachedScheme();
  }

  async populateCachedScheme() {
    try {
      this.logger.log('Populating redis cache.');
      const cacheCheck = await this.get('scheme-list');
      if (cacheCheck?.length) {
        this.logger.log('Existing cache found.');
        return;
      }
      const response = await axios.get<MFScheme[]>('https://api.mfapi.in/mf');
      await this.setex('scheme-list', SCHEME_CACHE_TTL, JSON.stringify(response.data));
      this.logger.log(`Redis cache populated: ${response.data.length} schemes.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while populating redis.';
      this.logger.warn(`Redis cache populating failed: ${errorMessage}`);
    }
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async set(key: string, data: string) {
    return await this.redis.set(key, data);
  }

  async setex(key: string, expiry: number, data: string) {
    return await this.redis.setex(key, expiry, data);
  }
}
