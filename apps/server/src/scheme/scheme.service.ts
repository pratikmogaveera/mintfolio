import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { SEARCH_RESULT_LIMIT } from '../../lib/utils';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SchemeService {
  private readonly logger = new Logger('SchemeService');
  constructor(private redis: RedisService) {}

  async searchScheme(q: string) {
    try {
      if (!q) throw new BadRequestException('Search query is required.');
      if (q.length < 3) throw new BadRequestException('Search query needs to be at least 3 characters long.');

      let schemeData: MFScheme[] = [];
      const cachedResponse = await this.redis.get('scheme-list');
      if (cachedResponse) {
        schemeData = JSON.parse(cachedResponse) as MFScheme[];
      } else {
        await this.redis.populateCachedScheme();
        const raw = await this.redis.get('scheme-list');
        schemeData = raw ? (JSON.parse(raw) as MFScheme[]) : [];
      }
      const query = q.toLowerCase();
      const matches = schemeData
        .filter((item) => item.schemeName.toLowerCase().includes(query))
        .slice(0, SEARCH_RESULT_LIMIT);
      this.logger.debug(`Search: "${q}" → ${matches.length} results`);
      return matches;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong while fetching scheme list.';
      this.logger.warn(errorMessage);
      throw error;
    }
  }
}
