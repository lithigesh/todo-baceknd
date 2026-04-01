import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): { status: string; message: string } {
    return { status: 'ok', message: 'Todo API is running' };
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
