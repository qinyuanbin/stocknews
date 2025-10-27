import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsEntity } from './news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly repo: Repository<NewsEntity>,
  ) {}

  async existing(news: Partial<NewsEntity>) {
    return this.repo.findOne({
      where: { symbol: news.symbol, title: news.title, source: news.source },
    });
  }

  async create(news: Partial<NewsEntity>) {
    // 简单去重：同股票+标题+发布时间
    const exists = await this.existing(news);
    if (exists) return null;
    return this.repo.save(news);
  }

  async findAll(limit = 10) {
    return this.repo.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  async findBySymbol(symbol: string, limit = 10) {
    return this.repo.find({
      where: { symbol },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
