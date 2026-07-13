import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SchemeService } from './scheme.service';

@UseGuards(AuthGuard)
@Controller('scheme')
export class SchemeController {
  constructor(private schemeService: SchemeService) {}
  @Get('search')
  async searchScheme(@Query('q') q: string) {
    return await this.schemeService.searchScheme(q);
  }
}
