import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest } from 'express';
import { CreateUserDto, LoginUserDto } from './auth.dto';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
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
