import { type MFScheme } from '@mintfolio/shared';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Redis from 'ioredis';
import { SCHEME_CACHE_TTL } from '../../lib/utils';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger('RedisService');

  constructor(private config: ConfigService) {}
  private redis: Redis;

  // L1: in-process cache — avoids JSON.parse on every search request.
  // Populated lazily on first getSchemeList() call, or eagerly when
  // populateCachedScheme fetches fresh data from the API.
  private schemeList: MFScheme[] | null = null;

  async onModuleInit() {
    this.redis = new Redis(this.config.get<string>('REDIS_URL') || 'redis://localhost:6379');
    this.logger.log('Redis connected.');
    await this.populateCachedScheme();
  }

  async populateCachedScheme(force: boolean = false) {
    try {
      this.logger.log('Populating scheme list cache...');
      if (!force) {
        const cacheCheck = await this.get('scheme-list');
        if (cacheCheck?.length) {
          this.logger.log('Existing scheme cache found, skipping fetch.');
          return;
        }
      }
      const response = await axios.get<MFScheme[]>('https://api.mfapi.in/mf');
      await this.setex('scheme-list', SCHEME_CACHE_TTL, JSON.stringify(response.data));
      // Populate L1 immediately so the first search after a forced refresh is fast.
      this.schemeList = response.data;
      this.logger.log(`Redis cache populated: ${response.data.length} schemes.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while populating redis.';
      this.logger.warn(`Redis cache populating failed: ${errorMessage}`);
    }
  }

  /**
   * Returns the full parsed scheme list.
   *
   * Cache hierarchy:
   *   L1 — in-process memory (no parse cost after first call)
   *   L2 — Redis (survives restarts; one JSON.parse on first call)
   *   L3 — mfapi.in (fresh fetch if both caches are cold)
   */
  async getSchemeList(): Promise<MFScheme[]> {
    // L1 hit — most common path after first call
    if (this.schemeList) return this.schemeList;

    // L2 hit — first call after a process restart
    const raw = await this.get('scheme-list');
    if (raw) {
      this.schemeList = JSON.parse(raw) as MFScheme[];
      this.logger.log(`In-memory scheme cache warmed from Redis: ${this.schemeList.length} schemes.`);
      return this.schemeList;
    }

    // L3 — Redis TTL expired and process restarted; re-fetch from source
    await this.populateCachedScheme(true);
    return this.schemeList ?? [];
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
