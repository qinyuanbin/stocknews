import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Get()
  async getAll(@Query('limit') limit?: string) {
    return this.service.findAll(Number(limit) || 10);
  }

  @Get('symbol')
  async getBySymbol(@Query('symbol') symbol: string, @Query('limit') limit?: string) {
    return this.service.findBySymbol(symbol, Number(limit) || 10);
  }
}
