import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Invoice } from '../invoice/entities/invoice.entity';
import { Card, CardStatus } from '../card/entities/card.entity';
import { InvoiceStatus } from '../invoice/dto/update-invoice-status.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async pay(ocr: string, dto: CreateTransactionDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Find invoice by OCR
      const invoice = await queryRunner.manager.findOne(Invoice, {
        where: { ocr_number: ocr },
        lock: { mode: 'pessimistic_write' },
      });
      if (!invoice) throw new NotFoundException(`Invoice with OCR ${ocr} not found`);
      if (invoice.status !== InvoiceStatus.PENDING) {
        throw new BadRequestException(`Invoice is already ${invoice.status}`);
      }

      // 2. Find card and validate
      const card = await queryRunner.manager.findOne(Card, {
        where: { card_number: dto.card_number },
        lock: { mode: 'pessimistic_write' },
      });
      if (!card) throw new NotFoundException(`Card not found`);
      if (card.status !== CardStatus.ACTIVE) {
        throw new BadRequestException(`Card is ${card.status}`);
      }
      if (new Date(card.exp_date) < new Date()) {
        throw new BadRequestException(`Card is expired`);
      }
      if (card.exp_date.toString() !== dto.exp_date) {
        throw new BadRequestException(`Card expiry date does not match`);
      }

      // 3. Check credit
      if (Number(card.current_credit) < Number(invoice.amount)) {
        throw new BadRequestException(`Insufficient credit`);
      }

      // 4. Deduct from current_credit
      card.current_credit = Number(card.current_credit) - Number(invoice.amount);
      await queryRunner.manager.save(Card, card);

      // 5. Update invoice status
      invoice.status = InvoiceStatus.PROCESSING;
      await queryRunner.manager.save(Invoice, invoice);

      // 6. Create transaction
      const transaction = queryRunner.manager.create(Transaction, {
        ocr_number: ocr,
        amount: invoice.amount,
        date: new Date(),
      });
      const saved = await queryRunner.manager.save(Transaction, transaction);

      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
