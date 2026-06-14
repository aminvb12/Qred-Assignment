import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Company } from '../../company/entities/company.entity';

export const TRANSACTION_SOURCE = 'TRANSACTION_SOURCE';

export interface ITransactionSource {
  pay(ocr: string, dto: CreateTransactionDto, company: Company): Promise<Transaction>;
  getTransactions(companyId: string, cardId?: string): Promise<Transaction[]>;
}
