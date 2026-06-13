import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { InvoiceController, InvoiceAdminController } from '../src/modules/invoice/invoice.controller';
import { InvoiceService } from '../src/modules/invoice/invoice.service';
import { InvoiceStatus } from '../src/modules/invoice/dto/update-invoice-status.dto';
import { InvoiceType } from '../src/modules/invoice/entities/invoice.entity';

const mockInvoiceService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  pay: jest.fn(),
});

describe('InvoicesController (e2e)', () => {
  let app: INestApplication;
  let invoiceService: ReturnType<typeof mockInvoiceService>;

  const invoice = {
    id: 'inv1',
    ocr_number: 'OCR001',
    issue_date: '2024-01-01',
    due_date: '2024-02-01',
    amount: 15000,
    from: 'Qred AB',
    from_org_number: '5560206220',
    type: InvoiceType.STATEMENT,
    status: InvoiceStatus.PENDING,
    company_id: 'c1',
  };

  const paidInvoice = { ...invoice, status: InvoiceStatus.PAID };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController, InvoiceAdminController],
      providers: [{ provide: InvoiceService, useFactory: mockInvoiceService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    invoiceService = module.get(InvoiceService);
  });

  afterAll(() => app.close());

  describe('GET /companies/:companyId/invoices', () => {
    it('returns 200 with invoice list', async () => {
      invoiceService.findAll.mockResolvedValue([invoice]);
      return request(app.getHttpServer())
        .get('/companies/c1/invoices')
        .expect(200)
        .expect([invoice]);
    });

    it('passes status query param', async () => {
      invoiceService.findAll.mockResolvedValue([invoice]);
      await request(app.getHttpServer())
        .get('/companies/c1/invoices?status=pending')
        .expect(200);
      expect(invoiceService.findAll).toHaveBeenCalledWith('c1', expect.objectContaining({ status: 'pending' }));
    });

    it('passes type query param', async () => {
      invoiceService.findAll.mockResolvedValue([invoice]);
      await request(app.getHttpServer())
        .get('/companies/c1/invoices?type=statement')
        .expect(200);
      expect(invoiceService.findAll).toHaveBeenCalledWith('c1', expect.objectContaining({ type: 'statement' }));
    });
  });

  describe('GET /companies/:companyId/invoices/:id', () => {
    it('returns 200 with invoice', async () => {
      invoiceService.findOne.mockResolvedValue(invoice);
      return request(app.getHttpServer())
        .get('/companies/c1/invoices/inv1')
        .expect(200)
        .expect(invoice);
    });
  });

  describe('POST /invoices (admin create)', () => {
    it('returns 201 with created invoice', async () => {
      invoiceService.create.mockResolvedValue(invoice);
      return request(app.getHttpServer())
        .post('/invoices')
        .send({
          ocr_number: 'OCR001',
          issue_date: '2024-01-01',
          due_date: '2024-02-01',
          amount: 15000,
          from: 'Qred AB',
          from_org_number: '5560206220',
          org_number: '5591234567',
        })
        .expect(201)
        .expect(invoice);
    });

    it('returns 400 for missing required fields', async () => {
      return request(app.getHttpServer())
        .post('/invoices')
        .send({ amount: 15000 })
        .expect(400);
    });

    it('returns 400 for invalid date format', async () => {
      return request(app.getHttpServer())
        .post('/invoices')
        .send({
          ocr_number: 'OCR001',
          issue_date: 'not-a-date',
          due_date: '2024-02-01',
          amount: 15000,
          from: 'Qred AB',
          from_org_number: '5560206220',
          org_number: '5591234567',
        })
        .expect(400);
    });
  });

  describe('PATCH /companies/:companyId/invoices/:id/status', () => {
    it('returns 200 with updated status', async () => {
      invoiceService.updateStatus.mockResolvedValue(paidInvoice);
      return request(app.getHttpServer())
        .patch('/companies/c1/invoices/inv1/status')
        .send({ status: InvoiceStatus.PAID })
        .expect(200)
        .expect(paidInvoice);
    });

    it('returns 400 for invalid status', async () => {
      return request(app.getHttpServer())
        .patch('/companies/c1/invoices/inv1/status')
        .send({ status: 'invalid' })
        .expect(400);
    });
  });

  describe('POST /companies/:companyId/invoices/:ocr/payments', () => {
    it('returns 200 with paid invoice', async () => {
      invoiceService.pay.mockResolvedValue(paidInvoice);
      return request(app.getHttpServer())
        .post('/companies/c1/invoices/OCR001/payments')
        .expect(200)
        .expect(paidInvoice);
    });
  });
});
