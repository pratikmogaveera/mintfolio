import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger('Database');

  public db!: ReturnType<typeof drizzle>;

  onModuleInit() {
    this.db = drizzle(process.env.DATABASE_URL || '');
  }
}
