import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice } from './entities/invoice.entity';
import { Company } from '../company/entities/company.entity';
import { InvoiceStatus } from './dto/update-invoice-status.dto';

const mockRepo = () => ({
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

const mockQueryBuilder = () => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn(),
});

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepo: ReturnType<typeof mockRepo>;
  let companyRepo: ReturnType<typeof mockRepo>;

  const company: Company = { id: 'c1', name: 'Acme AB', org_number: '5591234567' } as Company;

  const pendingInvoice: Invoice = {
    id: 'inv1',
    ocr_number: 'OCR001',
    issue_date: new Date('2024-01-01'),
    due_date: new Date('2024-02-01'),
    amount: 15000,
    status: InvoiceStatus.PENDING,
    company_id: 'c1',
    from: 'Qred AB',
    from_org_number: '5560206220',
  } as Invoice;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: getRepositoryToken(Invoice), useFactory: mockRepo },
        { provide: getRepositoryToken(Company), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(InvoiceService);
    invoiceRepo = module.get(getRepositoryToken(Invoice));
    companyRepo = module.get(getRepositoryToken(Company));
  });

  describe('findAll', () => {
    it('returns invoices for a company', async () => {
      const qb = mockQueryBuilder();
      qb.getMany.mockResolvedValue([pendingInvoice]);
      invoiceRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.findAll('c1', {});
      expect(result).toEqual([pendingInvoice]);
    });

    it('applies status filter', async () => {
      const qb = mockQueryBuilder();
      qb.getMany.mockResolvedValue([pendingInvoice]);
      invoiceRepo.createQueryBuilder.mockReturnValue(qb);
      await service.findAll('c1', { status: InvoiceStatus.PENDING });
      expect(qb.andWhere).toHaveBeenCalledWith('invoice.status = :status', { status: InvoiceStatus.PENDING });
    });
  });

  describe('findOne', () => {
    it('returns invoice when found', async () => {
      invoiceRepo.findOne.mockResolvedValue(pendingInvoice);
      expect(await service.findOne('inv1')).toEqual(pendingInvoice);
    });

    it('throws NotFoundException when not found', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates invoice using org_number lookup', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      invoiceRepo.create.mockReturnValue(pendingInvoice);
      invoiceRepo.save.mockResolvedValue(pendingInvoice);
      const result = await service.create({
        ocr_number: 'OCR001',
        issue_date: '2024-01-01',
        due_date: '2024-02-01',
        amount: 15000,
        org_number: '5591234567',
        from: 'Qred AB',
        from_org_number: '5560206220',
      } as any);
      expect(result).toEqual(pendingInvoice);
      expect(companyRepo.findOne).toHaveBeenCalledWith({ where: { org_number: '5591234567' } });
    });

    it('throws NotFoundException for unknown org_number', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.create({
        org_number: 'bad',
        from: 'Qred AB',
        from_org_number: '5560206220',
      } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('updates invoice status', async () => {
      invoiceRepo.findOne.mockResolvedValue({ ...pendingInvoice });
      invoiceRepo.save.mockImplementation(inv => Promise.resolve(inv));
      const result = await service.updateStatus('inv1', { status: InvoiceStatus.PAID });
      expect(result.status).toBe(InvoiceStatus.PAID);
    });

    it('throws NotFoundException when invoice not found', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus('bad', { status: InvoiceStatus.PAID })).rejects.toThrow(NotFoundException);
    });
  });
});
