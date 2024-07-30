import { Module } from '@nestjs/common';
import { ImageParserService } from './image-parser.service';
import { TextParserService } from './text-parser.service';

@Module({
  providers: [ImageParserService, TextParserService],
  exports: [ImageParserService, TextParserService],
})
export class UtilsModule {}
