import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get('')
  health(): string {
    return 'Im okay!';
  }
}
