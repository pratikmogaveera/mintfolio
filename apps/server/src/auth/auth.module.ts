import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../db/database.module';
import { AuthService } from './auth.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
