import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger('DatabaseService');

  constructor(private config: ConfigService) {}

  public db!: ReturnType<typeof drizzle>;

  onModuleInit() {
    this.db = drizzle(this.config.get<string>('DATABASE_URL') || '');
    this.logger.log('Postgres Database connected');
  }
}
