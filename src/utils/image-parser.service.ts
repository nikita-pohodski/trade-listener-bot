import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as Tesseract from 'tesseract.js';

export type ParsedImage = { symbol: string; leverage: number };

@Injectable()
export class ImageParserService {
  private readonly logger = new Logger(ImageParserService.name);
  private worker: Tesseract.Worker | null = null;

  async parse(imageUrl: string): Promise<ParsedImage> {
    try {
      if (!this.worker) {
        this.worker = await Tesseract.createWorker(['rus', 'eng']);
      }

      const { data: imageBuffer } = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const {
        data: { text },
      } = await this.worker.recognize(imageBuffer);

      const lines = text.split('\n').filter((line) => line.trim());
      const symbol = lines[0].split(' ')[0].trim();
      const leverageStr = lines[1].split(' ')[1].trim();
      const leverage = Number(leverageStr.split('.')[0]);

      if (isNaN(leverage)) {
        throw new Error('Invalid leverage value');
      }

      return { symbol, leverage };
    } catch (error) {
      this.logger.error('Error parsing image:', error);
      throw error;
    }
  }
}
