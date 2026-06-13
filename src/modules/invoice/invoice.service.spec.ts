import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Invoice, InvoiceType } from './entities/invoice.entity';
import { Company } from '../company/entities/company.entity';
import { Card, CardStatus } from '../card/entities/card.entity';
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

const makeQueryRunner = (invoice: Invoice, card?: Card) => ({
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: {
    findOne: jest.fn().mockImplementation((entity) => {
      // Return copies so tests don't mutate shared fixtures
      if (entity === Invoice) return Promise.resolve(invoice ? { ...invoice } : null);
      if (entity === Card) return Promise.resolve(card ? { ...card } : null);
      return Promise.resolve(null);
    }),
    save: jest.fn().mockImplementation((_, obj) => Promise.resolve(obj)),
  },
});

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepo: ReturnType<typeof mockRepo>;
  let companyRepo: ReturnType<typeof mockRepo>;
  let dataSource: { createQueryRunner: jest.Mock };

  const company: Company = { id: 'c1', name: 'Acme AB', org_number: '5591234567' } as Company;

  const pendingInvoice: Invoice = {
    id: 'inv1',
    ocr_number: 'OCR001',
    issue_date: new Date('2024-01-01'),
    due_date: new Date('2024-02-01'),
    amount: 15000,
    status: InvoiceStatus.PENDING,
    type: InvoiceType.STATEMENT,
    company_id: 'c1',
    from: 'Qred AB',
    from_org_number: '5560206220',
  } as Invoice;

  const card: Card = {
    id: 'card1',
    max_credit: 50000,
    current_credit: 35000,
    status: CardStatus.ACTIVE,
    company_id: 'c1',
  } as Card;

  beforeEach(async () => {
    dataSource = { createQueryRunner: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: getRepositoryToken(Invoice), useFactory: mockRepo },
        { provide: getRepositoryToken(Company), useFactory: mockRepo },
        { provide: getDataSourceToken(), useValue: dataSource },
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

    it('applies type filter', async () => {
      const qb = mockQueryBuilder();
      qb.getMany.mockResolvedValue([pendingInvoice]);
      invoiceRepo.createQueryBuilder.mockReturnValue(qb);
      await service.findAll('c1', { type: InvoiceType.STATEMENT });
      expect(qb.andWhere).toHaveBeenCalledWith('invoice.type = :type', { type: InvoiceType.STATEMENT });
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
        company_name: 'Acme AB',
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

  describe('pay', () => {
    it('pays a statement invoice without touching card', async () => {
      const qr = makeQueryRunner(pendingInvoice, card);
      dataSource.createQueryRunner.mockReturnValue(qr);

      const result = await service.pay('c1', 'OCR001');
      expect(result.status).toBe(InvoiceStatus.PAID);
      // For statement type: card.save should NOT be called
      const savedCalls = (qr.manager.save as jest.Mock).mock.calls;
      const cardSaved = savedCalls.some(([entity]) => entity === Card);
      expect(cardSaved).toBe(false);
    });

    it('pays a fee invoice and restores card credit', async () => {
      const feeInvoice = { ...pendingInvoice, type: InvoiceType.FEE };
      const qr = makeQueryRunner(feeInvoice, card);
      dataSource.createQueryRunner.mockReturnValue(qr);

      await service.pay('c1', 'OCR001');
      const savedCalls = (qr.manager.save as jest.Mock).mock.calls;
      const cardSaved = savedCalls.some(([entity]) => entity === Card);
      expect(cardSaved).toBe(true);
    });

    it('throws BadRequestException if invoice already paid', async () => {
      const paidInvoice = { ...pendingInvoice, status: InvoiceStatus.PAID };
      const qr = makeQueryRunner(paidInvoice);
      dataSource.createQueryRunner.mockReturnValue(qr);
      await expect(service.pay('c1', 'OCR001')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException for unknown OCR', async () => {
      const qr = makeQueryRunner(null as any);
      qr.manager.findOne.mockResolvedValue(null);
      dataSource.createQueryRunner.mockReturnValue(qr);
      await expect(service.pay('c1', 'BADOCR')).rejects.toThrow(NotFoundException);
    });

    it('rolls back on error', async () => {
      const qr = makeQueryRunner(null as any);
      qr.manager.findOne.mockRejectedValue(new Error('DB error'));
      dataSource.createQueryRunner.mockReturnValue(qr);
      await expect(service.pay('c1', 'OCR001')).rejects.toThrow();
      expect(qr.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
