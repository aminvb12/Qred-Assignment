import { Injectable } from '@nestjs/common';
import { ITransactionSource } from './transaction-source.interface';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Company } from '../../company/entities/company.entity';

@Injectable()
export class NetsSource implements ITransactionSource {
  async getTransactions(_companyId: string, _cardId?: string): Promise<Transaction[]> {
    // ...
    // const response = await netsClient.getTransactions({ agreementId: company.nets_agreement_id });
    // return response.transactions.map(mapNetsTransactionToEntity);
    throw new Error('Not implemented');
  }

  async payInvoice(_invoiceId: string, _dto: any, _company: any): Promise<any> { throw new Error('Not implemented'); }

  async pay(_dto: CreateTransactionDto, _company: Company): Promise<Transaction> {
    // ...
    // await netsClient.initiatePayment({ amount: _dto.amount, ... });
    throw new Error('Not implemented');
  }
}
