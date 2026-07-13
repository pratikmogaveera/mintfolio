import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './db/database.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { SchemeModule } from './scheme/scheme.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, DatabaseModule, PortfolioModule, SchemeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
