import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ITransactionSource } from './transaction-source.interface';
import { Transaction } from '../entities/transaction.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { Company } from '../../company/entities/company.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Card, CardStatus } from '../../card/entities/card.entity';
import { InvoiceStatus } from '../../invoice/dto/update-invoice-status.dto';

@Injectable()
export class InternalLedgerSource implements ITransactionSource {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async getTransactions(companyId: string, cardId?: string): Promise<Transaction[]> {
    const qb = this.dataSource
      .getRepository(Transaction)
      .createQueryBuilder('t')
      .innerJoin('t.invoice', 'i')
      .leftJoinAndSelect('t.card', 'card')
      .where('i.company_id = :companyId', { companyId });

    if (cardId) {
      qb.andWhere('t.card_id = :cardId', { cardId });
    }

    return qb.orderBy('t.date', 'DESC').getMany();
  }

  async pay(dto: CreateTransactionDto, company: Company): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ── Validate card ──────────────────────────────────────────────────────
      const card = await queryRunner.manager.findOne(Card, {
        where: { card_number: dto.card_number },
        lock: { mode: 'pessimistic_write' },
      });
      if (!card) throw new NotFoundException(`Card not found`);
      if (card.status !== CardStatus.ACTIVE) throw new BadRequestException(`Card is ${card.status}`);
      if (new Date(card.exp_date) < new Date()) throw new BadRequestException(`Card is expired`);
      if (card.exp_date.toString() !== dto.exp_date) throw new BadRequestException(`Card expiry mismatch`);
      if (Number(card.current_credit) < dto.amount) throw new BadRequestException(`Insufficient credit`);

      // ── Deduct credit ──────────────────────────────────────────────────────
      card.current_credit = Number(card.current_credit) - dto.amount;
      await queryRunner.manager.save(Card, card);

      const now = new Date();
      const ocr = `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      // ── Create Qred invoice for the company (PENDING) ──────────────────────
      // Invoice must be persisted before the transaction due to FK on ocr_number.
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = queryRunner.manager.create(Invoice, {
        ocr_number: ocr,
        amount: dto.amount,
        issue_date: now,
        due_date: dueDate,
        company_id: company.id,
        status: InvoiceStatus.PENDING,
        from: 'Qred AB',
        from_org_number: '5560206220',
      });
      await queryRunner.manager.save(Invoice, invoice);

      // ── Record transaction ─────────────────────────────────────────────────
      const transaction = queryRunner.manager.create(Transaction, {
        ocr_number: ocr,
        amount: dto.amount,
        date: now,
        paid_date: now,
        card_id: card.id,
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
