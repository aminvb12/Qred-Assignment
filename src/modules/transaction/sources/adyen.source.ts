import { Injectable } from '@nestjs/common';
import { ITransactionSource } from './transaction-source.interface';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Company } from '../../company/entities/company.entity';

@Injectable()
export class AdyenSource implements ITransactionSource {
  async getTransactions(_companyId: string, _cardId?: string): Promise<Transaction[]> {
    // ...
    // const response = await adyenClient.management().getTransactions({ merchantAccount: company.adyen_merchant_id });
    // return response.data.map(mapAdyenTransactionToEntity);
    throw new Error('Not implemented');
  }

  async pay(_dto: CreateTransactionDto, _company: Company): Promise<Transaction> {
    // ...
    // await adyenClient.payments().makePayment({ reference: _dto.card_number, amount: _dto.amount, ... });
    throw new Error('Not implemented');
  }
}
