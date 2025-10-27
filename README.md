# Stock News Notifier

Stock News Notifier 是一个自动爬取股票新闻并发送即时通知的工具，专为投资者设计。

## 项目背景

在使用富途牛牛时，股票消息通知常常延迟，有时可能导致亏损。而富途的资讯更新通常不提供通知，只有公告才会通知。这让实时跟踪市场信息变得不方便。

为了解决这个问题，本项目可以**实时抓取股票新闻**，并通过飞书消息直接发送到手机，实现即时提醒。

## 功能

- 自动爬取多家财经网站的最新股票新闻，包括：
  - Yahoo Finance
  - Investing.com
  - MarketWatch
- 检测新闻更新并抓取新闻内容
- 使用 AI 翻译新闻标题和正文
- 将翻译后的新闻通过飞书机器人发送通知
- 支持同时关注多只股票
- 自动运行，无需手动干预

## 配置说明

请在项目根目录下创建 `.env` 文件，配置以下内容（以下为示例，敏感信息请自行替换）：

```env
# 飞书配置
FEISHU_APP_ID=your_app_id
FEISHU_APP_SECRET=your_app_secret
FEISHU_RECEIVE_ID=your_receive_id
FEISHU_RECEIVE_ID_TYPE=user_id

# LLM 配置
LLM=qwen
QWEN_API_KEY=your_api_key
QWEN_MODEL=qwen-plus
QWEN_EMBEDDING_MODEL=text-embedding-v3

# 关注的股票代码（用逗号分隔）
SYMBOLS=APPL,TSLK

# 服务端口
PORT=3000
````

> ⚠️ 注意：以上示例中的 App ID、App Secret、API Key 均为占位符，请替换为你自己的信息。

## 使用方法

1. 安装依赖：

```bash
npm install
```

2. 构建项目：

```bash
npm run build
```

3. 启动程序：

```bash
npx pm2 start dist/main.js --name stocknews
```

4. 配置开机自启（可选）：

```bash
.\scripts\setup-pm2-startup.bat
```

## 新闻来源

本项目仅抓取公开网页的新闻信息，新闻内容来源于各大财经网站，版权归原网站及作者所有。

## 知识产权

本项目遵循 MIT 许可证，允许自由使用、修改和分发。详细请参见 [LICENSE](./LICENSE)。
