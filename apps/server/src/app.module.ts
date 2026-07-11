import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/database.module';
import { ConfigModule } from '@nestjs/config';
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, DatabaseModule, PortfolioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
