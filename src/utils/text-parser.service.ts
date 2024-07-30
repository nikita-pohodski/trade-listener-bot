import { Injectable, Logger } from '@nestjs/common';

export type ParsedText = {
  type: string;
  stopLoss: number;
  takeProfits: number[];
};

@Injectable()
export class TextParserService {
  private readonly logger = new Logger(TextParserService.name);

  async parse(text: string): Promise<ParsedText> {
    const strings = text
      .toLowerCase()
      .split('\n')
      .filter((value) => !!value)
      .map((value) => value.trim());

    const typeAndTokenString = strings.find((value) =>
      value.startsWith('беру'),
    );
    const stopLossString = strings.find((value) => value.startsWith('стоп'));
    const takesStartIndex = strings.findIndex((value) =>
      value.startsWith('тейки'),
    );

    return {
      type: typeAndTokenString.split(' ')[1] === 'лонг' ? 'LONG' : 'SHORT',
      stopLoss: Number(stopLossString.split(':')[1].trim().split('(')[0]),
      takeProfits: [
        Number(strings[takesStartIndex + 1].split(':')[1].trim()),
        Number(strings[takesStartIndex + 2].split(':')[1].trim()),
        Number(strings[takesStartIndex + 3].split(':')[1].trim()),
        Number(strings[takesStartIndex + 4].split(':')[1].trim()),
      ],
    };
  }

  async parse2(text: string): Promise<ParsedText> {
    try {
      const lines = text
        .toLowerCase()
        .split('\n')
        .filter((line) => line.trim());

      return {
        type: this.extractType(lines),
        stopLoss: this.extractStopLoss(lines),
        takeProfits: this.extractTakeProfits(lines),
      };
    } catch (error) {
      this.logger.error('Error parsing text:', error);
      throw error;
    }
  }

  private extractType(lines: string[]): string {
    const typeAndTokenLine = lines.find((line) => line.startsWith('беру'));

    if (!typeAndTokenLine) {
      throw new Error('Type and token line not found');
    }

    return typeAndTokenLine.split(' ')[1] === 'лонг' ? 'LONG' : 'SHORT';
  }

  private extractStopLoss(lines: string[]): number {
    const stopLossLine = lines.find((line) => line.startsWith('стоп'));

    if (!stopLossLine) {
      throw new Error('Stop loss line not found');
    }

    const stopLossStr = stopLossLine.split(':')[1].trim().split('(')[0];
    const stopLoss = Number(stopLossStr);

    if (isNaN(stopLoss)) {
      throw new Error('Invalid stop loss value');
    }

    return stopLoss;
  }

  private extractTakeProfits(lines: string[]): number[] {
    const takesStartIndex = lines.findIndex((line) => line.startsWith('тейки'));

    if (takesStartIndex === -1) {
      throw new Error('Take profits lines not found');
    }

    return lines.slice(takesStartIndex + 1, takesStartIndex + 5).map((line) => {
      const takeProfitStr = line.split(':')[1].trim();
      const takeProfit = Number(takeProfitStr);

      if (isNaN(takeProfit)) {
        throw new Error('Invalid take profit value');
      }

      return takeProfit;
    });
  }
}
