import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionSourceFactory } from './sources/transaction-source.factory';
import { InternalLedgerSource } from './sources/internal-ledger.source';
import { StripeIssuingSource } from './sources/stripe-issuing.source';
import { AdyenSource } from './sources/adyen.source';
import { NetsSource } from './sources/nets.source';
import { Company } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    TransactionSourceFactory,
    InternalLedgerSource,
    StripeIssuingSource,
    AdyenSource,
    NetsSource,
  ],
  exports: [TransactionService],
})
export class TransactionModule {}
