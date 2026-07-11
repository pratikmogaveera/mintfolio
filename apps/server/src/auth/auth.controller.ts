import { Body, Controller, Get, Logger, Post, Request, UseGuards } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { type Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('Auth');
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Request() request: ExpressRequest) {
    return await this.authService.me(request.user?.sub);
  }

  @Post('register')
  async register(@Body() payload: CreateUserDto) {
    return await this.authService.register(payload);
  }

  @Post('authenticate')
  async login(@Body() payload: LoginUserDto) {
    return await this.authService.authenticate(payload);
  }
}
