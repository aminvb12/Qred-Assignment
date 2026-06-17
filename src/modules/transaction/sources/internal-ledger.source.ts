import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
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
    const invoices = await this.dataSource.getRepository(Invoice).find({
      where: { company_id: companyId },
      select: ['ocr_number'],
    });

    if (invoices.length === 0) return [];

    const ocrNumbers = invoices.map((i) => i.ocr_number);

    const where: Record<string, unknown> = { ocr_number: In(ocrNumbers) };
    if (cardId) where.card_id = cardId;

    return this.dataSource.getRepository(Transaction).find({
      where,
      relations: ['card'],
      order: { date: 'DESC' },
    });
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
      // Normalize: TypeORM returns `date` columns as Date objects or 'YYYY-MM-DD' strings
      const cardExpStr = card.exp_date instanceof Date
        ? card.exp_date.toISOString().split('T')[0]
        : String(card.exp_date);
      if (new Date(cardExpStr) < new Date()) throw new BadRequestException(`Card is expired`);
      if (cardExpStr !== dto.exp_date) throw new BadRequestException(`Card expiry mismatch`);
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
