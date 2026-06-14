import { Injectable } from '@nestjs/common';
import { ITransactionSource } from './transaction-source.interface';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Company } from '../../company/entities/company.entity';

@Injectable()
export class StripeIssuingSource implements ITransactionSource {
  async getTransactions(_companyId: string, _cardId?: string): Promise<Transaction[]> {
    // ...
    // const charges = await stripe.issuing.transactions.list({ cardholder: company.stripe_cardholder_id });
    // return charges.data.map(mapStripeTransactionToEntity);
    throw new Error('Not implemented');
  }

  async pay(_ocr: string, _dto: CreateTransactionDto, _company: Company): Promise<Transaction> {
    // ...
    // Stripe Issuing handles authorization via webhooks — payments are not initiated here
    // This would instead mark the invoice as processing upon receiving a stripe issuing.authorization.created event
    throw new Error('Not implemented');
  }
}
