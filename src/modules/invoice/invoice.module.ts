import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController, InvoiceAdminController } from './invoice.controller';
import { Company } from '../company/entities/company.entity';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Company]), TransactionModule],
  controllers: [InvoiceController, InvoiceAdminController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}
