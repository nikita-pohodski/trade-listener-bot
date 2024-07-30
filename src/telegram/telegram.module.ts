import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { UtilsModule } from '../utils/utils.module';
import { Telegraf } from 'telegraf';
import { BybitModule } from '../bybit/bybit.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), UtilsModule, BybitModule],
  exports: [TelegramService],
  providers: [TelegramService, Telegraf],
})
export class TelegramModule {}
