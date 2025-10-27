import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import { NewsService } from '../news/news.service';
import { FeishuService } from '../feishu/feishu.service';
import * as cheerio from 'cheerio';
import { NewsEntity } from 'src/news/news.entity';
import llm from 'core/llm';

@Injectable()
export class ScraperService implements OnModuleInit {
  private readonly logger = new Logger(ScraperService.name);
  private symbols = ['VIVK'];
  private browser: Browser; // 全局浏览器实例

  constructor(
    private readonly newsService: NewsService,
    private readonly feishuService: FeishuService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting scraper...');
    this.browser = await puppeteer.launch({ headless: true });
    this.startCheckLoop();
  }

  async startCheckLoop() {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    const loop = async () => {
      try {
        await this.checkUpdates(); // 等待上一次执行完毕
      } catch (err) {
        console.error("checkUpdates error:", err);
      }
      await delay(5000); // 等待5秒
      loop(); // 再次执行
    };

    loop(); // 启动循环
  }

  async onModuleDestroy() {
    await this.browser.close();
  }

  async checkUpdates() {
    this.logger.log('正在检查最新资讯...');
    for (const symbol of this.symbols) {
      try {
        await Promise.all([
          this.fetchYahoo(symbol),
          // this.fetchInvesting(browser, symbol),
          // this.fetchMarketWatch(browser, symbol),
        ]);
      } catch (err) {
        this.logger.error(err.message);
      }
    }
  }

  async getPage(url: string): Promise<string> {
    const page = await this.browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      return await page.content();
    } finally {
      await page.close(); // 自动关闭 page
    }
  }

  /** 翻译函数（你可以改用 DeepL / OpenAI / 百度翻译等） */
  async translate(title: string, content: string): Promise<{ title_zh: string; content_zh: string; }> {
    const systemPrompt = '你是一名专业的金融资讯翻译员，精通中英文。';
    const translatePrompt = `
你是一名专业的金融资讯翻译员。请将以下内容翻译为自然流畅的中文。

要求：
1. 严格保留原文所有关键信息；
2. 翻译应自然流畅，符合中文新闻风格；
3. 严格输出为 JSON 格式，不要添加任何解释或多余文字。

需要翻译的内容：
标题: ${title}
正文: ${content}

请返回以下 JSON：
{
  "title_zh": "翻译后的标题",
  "content_zh": "翻译后的正文"
}
`;
    const res = await llm.chat({ system: systemPrompt, user: translatePrompt });
    try {
      // 直接解析 JSON
      const translated: { title_zh: string; content_zh: string; } = JSON.parse(res);
      return translated;
    } catch (err) {
      console.error("解析 JSON 出错:", err);
      return { title_zh: '', content_zh: '' };
    }
  }

  async notifyNewNews(news: NewsEntity) {
    const text = `【${news.symbol}】【${news.title_zh}】\n\n${news.content_zh}\n【${news.source}】`;
    await this.feishuService.sendTextMessage(text);
  }

  async fetchYahoo(symbol: string) {
    const source = 'Yahoo Finance';
    const target = `https://finance.yahoo.com/quote/${symbol}?p=${symbol}`;
    const html = await this.getPage(target);
    const $ = cheerio.load(html);

    const latestNews = $('#tabpanel-news > div > section > div:nth-child(1) > section');
    const title = $(latestNews).find('h3').text().trim();
    const link = $(latestNews).find('a').attr('href');
    if (!title || !link) return;

    if (await this.newsService.existing({ symbol, title, source })) {
      this.logger.log(`新闻已存在，跳过: [${symbol}] ${title} 【${source}】`);
      return;
    }

    const url = link.startsWith('http') ? link : `https://finance.yahoo.com${link}`;
    const detailHtml = await this.getPage(url);
    const $$ = cheerio.load(detailHtml);
    const detailTitle = $$("#main-content-wrapper > div > article > div.cover-wrap > div.cover-headline > h1").text().trim();
    const detailContent = $$("#main-content-wrapper > div > article > div.body-wrap > div").text().trim();
    const translated = await this.translate(detailTitle, detailContent);

    const news = await this.newsService.create({
      symbol,
      url,
      title,
      title_zh: translated.title_zh || '',
      content_zh: translated.content_zh || '',
      source,
    });

    if (news) {
      await this.notifyNewNews(news);
    }
  }

  async fetchInvesting(symbol: string) {
    const url = `https://www.investing.com/equities/${symbol}-news`;
    const html = await this.getPage(url);
    const $ = cheerio.load(html);

    const items = $('article.js-article-item').toArray();
    for (const el of items) {
      const title = $(el).find('a.title').text().trim();
      const link = $(el).find('a.title').attr('href');
      if (!title || !link) continue;

      await this.newsService.create({
        symbol,
        title,
        url: link.startsWith('http') ? link : `https://www.investing.com${link}`,
        source: 'Investing',
      });
    }
  }

  async fetchMarketWatch(symbol: string) {
    const url = `https://www.marketwatch.com/investing/stock/${symbol}`;
    const html = await this.getPage(url);
    const $ = cheerio.load(html);

    const items = $('div.article__content').toArray();
    for (const el of items) {
      const title = $(el).find('h3').text().trim();
      const link = $(el).find('a').attr('href');
      if (!title || !link) continue;

      await this.newsService.create({
        symbol,
        title,
        url: link.startsWith('http') ? link : `https://www.marketwatch.com${link}`,
        source: 'MarketWatch',
      });
    }
  }
}
