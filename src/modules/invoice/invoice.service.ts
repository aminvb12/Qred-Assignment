import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Company } from '../company/entities/company.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus, UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) { }

  async findAll(): Promise<Invoice[]> {
    return this.invoiceRepo.find({ relations: ['transaction'] });
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
    const company = await this.companyRepo.findOne({ where: { id: dto.company_id } });
    if (!company) throw new NotFoundException(`Company ${dto.company_id} not found`);
    const invoice = this.invoiceRepo.create(dto);
    return this.invoiceRepo.save(invoice);
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = dto.status;
    return this.invoiceRepo.save(invoice);
  }
}
