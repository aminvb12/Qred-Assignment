import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionSourceFactory } from './sources/transaction-source.factory';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class TransactionService {
  constructor(
    private readonly factory: TransactionSourceFactory,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async getTransactions(companyId: string, cardId?: string): Promise<Transaction[]> {
    const company = await this.findCompany(companyId);
    // Factory selects the correct source based on company.payment_provider
    // (e.g. 'internal', 'stripe', 'adyen', 'nets')
    return this.factory.forCompany(company).getTransactions(companyId, cardId);
  }

  async pay(ocr: string, dto: CreateTransactionDto, companyId: string): Promise<Transaction> {
    const company = await this.findCompany(companyId);
    return this.factory.forCompany(company).pay(ocr, dto, company);
  }

  private async findCompany(companyId: string): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    return company;
  }
}
