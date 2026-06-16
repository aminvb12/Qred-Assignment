import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Company } from '../company/entities/company.entity';
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
  ) { }

  async findAll(companyId: string, query: QueryInvoiceDto): Promise<Invoice[]> {
    const qb = this.invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.transaction', 'transaction')
      .where('invoice.company_id = :companyId', { companyId });

    if (query.status) qb.andWhere('invoice.status = :status', { status: query.status });
    if (query.due_from) qb.andWhere('invoice.due_date >= :due_from', { due_from: query.due_from });
    if (query.due_to)   qb.andWhere('invoice.due_date <= :due_to', { due_to: query.due_to });

    return qb.orderBy('invoice.due_date', 'DESC').getMany();
  }

  async findOne(companyId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, company_id: companyId },
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

  async updateStatus(companyId: string, id: string, dto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.findOne(companyId, id);
    invoice.status = dto.status;
    return this.invoiceRepo.save(invoice);
  }
}
