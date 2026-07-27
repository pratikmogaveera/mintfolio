import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { type Request as ExpressRequest, type Response } from 'express';
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
  async register(@Body() payload: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return await this.authService.register(payload, res);
  }

  @Post('authenticate')
  async login(@Body() payload: LoginUserDto, @Res({ passthrough: true }) res: Response) {
    return await this.authService.authenticate(payload, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
