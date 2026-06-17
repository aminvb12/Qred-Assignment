import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { PayInvoiceDto } from '../dto/pay-invoice.dto';
import { Company } from '../../company/entities/company.entity';

export const TRANSACTION_SOURCE = 'TRANSACTION_SOURCE';

export interface ITransactionSource {
  pay(dto: CreateTransactionDto, company: Company): Promise<Transaction>;
  payInvoice(invoiceId: string, dto: PayInvoiceDto, company: Company): Promise<Transaction>;
  getTransactions(companyId: string, cardId?: string): Promise<Transaction[]>;
}
