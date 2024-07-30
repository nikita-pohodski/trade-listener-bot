import { Injectable, Logger } from '@nestjs/common';
import { RestClientV5 } from 'bybit-api';
import { OrderData } from './bybit.types';

@Injectable()
export class BybitService {
  private readonly restClient = new RestClientV5({
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
  });

  async placeOrder(orderData: OrderData) {
    const side = orderData.type === 'LONG' ? 'Buy' : 'Sell';
    const qty = 5;

    try {
      await this.restClient.setLeverage({
        symbol: orderData.symbol,
        category: 'linear',
        buyLeverage: String(orderData.leverage),
        sellLeverage: String(orderData.leverage),
      });

      const response = await this.restClient.submitOrder({
        category: 'linear',
        symbol: orderData.symbol,
        side,
        orderType: 'Market',
        qty: (qty * orderData.leverage).toString(),
        isLeverage: 1,
        stopLoss: orderData.stopLoss.toString(),
      });

      Logger.log(`Order placed successfully: ${response.result.orderId}`);

      return response;
    } catch (error) {
      Logger.error(`Failed to place order: ${error.message}`);
      throw new Error(`Failed to place order: ${error.message}`);
    }
  }
}
