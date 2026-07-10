import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('Auth');
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: CreateUserDto) {
    return await this.authService.register(payload);
  }

  @Post('authenticate')
  async login(@Body() payload: LoginUserDto) {
    return await this.authService.authenticate(payload);
  }
}
