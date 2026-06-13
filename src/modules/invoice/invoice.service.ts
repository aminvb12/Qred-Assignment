import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Invoice, InvoiceType } from './entities/invoice.entity';
import { Company } from '../company/entities/company.entity';
import { Card } from '../card/entities/card.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus, UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async findAll(companyId: string, query: QueryInvoiceDto): Promise<Invoice[]> {
    const qb = this.invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.transaction', 'transaction')
      .where('invoice.company_id = :companyId', { companyId });

    if (query.status) qb.andWhere('invoice.status = :status', { status: query.status });
    if (query.type)   qb.andWhere('invoice.type = :type', { type: query.type });
    if (query.due_from) qb.andWhere('invoice.due_date >= :due_from', { due_from: query.due_from });
    if (query.due_to)   qb.andWhere('invoice.due_date <= :due_to', { due_to: query.due_to });

    return qb.orderBy('invoice.due_date', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['transaction'],
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const company = await this.companyRepo.findOne({ where: { org_number: dto.org_number } });
    if (!company) throw new NotFoundException(`Company with org_number ${dto.org_number} not found`);
    const { org_number, ...rest } = dto;
    const invoice = this.invoiceRepo.create({ ...rest, company_id: company.id });
    return this.invoiceRepo.save(invoice);
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = dto.status;
    return this.invoiceRepo.save(invoice);
  }

  // Company pays a Qred invoice (statement or fee) via external payment (bank transfer, external card).
  // No Qred card validation — the Qred card is never used to pay Qred invoices.
  // On payment: invoice → paid, current_credit restored up to max_credit.
  async pay(companyId: string, ocr: string): Promise<Invoice> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      const invoice = await qr.manager.findOne(Invoice, {
        where: { ocr_number: ocr, company_id: companyId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!invoice) throw new NotFoundException(`Invoice ${ocr} not found`);
      if (invoice.status !== InvoiceStatus.PENDING) {
        throw new BadRequestException(`Invoice is already ${invoice.status}`);
      }

      // statement invoices are paid externally (bank transfer) — no card involved
      // fee invoices deduct from/restore the Qred card credit
      if (invoice.type !== InvoiceType.STATEMENT) {
        const card = await qr.manager.findOne(Card, {
          where: { company_id: companyId },
        });
        if (card) {
          const restored = Number(card.current_credit) + Number(invoice.amount);
          card.current_credit = Math.min(restored, Number(card.max_credit));
          await qr.manager.save(Card, card);
        }
      }

      invoice.status = InvoiceStatus.PAID;
      const saved = await qr.manager.save(Invoice, invoice);

      await qr.commitTransaction();
      return saved;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
