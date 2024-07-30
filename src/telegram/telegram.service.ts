import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ImageParserService } from '../utils/image-parser.service';
import { TextParserService } from '../utils/text-parser.service';
import { BybitService } from '../bybit/bybit.service';
import { OrderData } from '../bybit/bybit.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService implements OnModuleInit {
  private telegraf: Telegraf;

  constructor(
    private readonly configService: ConfigService,
    private readonly imageParser: ImageParserService,
    private readonly textParser: TextParserService,
    private readonly bybitService: BybitService,
  ) {}

  async onModuleInit() {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');

    this.telegraf = new Telegraf(token);
    this.telegraf.on('message', (ctx) => this.handleMessage(ctx));
    this.telegraf.launch();
  }

  async handleMessage(ctx: any) {
    try {
      const message: string = ctx.message.caption;
      const photo = ctx.message.photo;

      const validMessage =
        !!message.includes('Беру') &&
        !!message.includes('Стоп') &&
        !!message.includes('Тейки');

      if (photo && validMessage) {
        const fileLink = await ctx.telegram.getFileLink(
          photo[photo.length - 1].file_id,
        );
        const orderData = await this.getOrderData(message, fileLink.href);
        await this.bybitService.placeOrder(orderData);
      } else {
        Logger.log('This is not valid message');
      }
    } catch (e) {
      Logger.error(e);
    }
  }

  private async getOrderData(
    message: string,
    fileLinkHref: string,
  ): Promise<OrderData> {
    const parsedText = await this.textParser.parse2(message);
    const parsedImage = await this.imageParser.parse(fileLinkHref);

    return { ...parsedImage, ...parsedText };
  }
}
