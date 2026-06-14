import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TransactionController } from '../src/modules/transaction/transaction.controller';
import { TransactionService } from '../src/modules/transaction/transaction.service';

const mockTransactionService = () => ({
  getTransactions: jest.fn(),
  pay: jest.fn(),
});

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;
  let transactionService: ReturnType<typeof mockTransactionService>;

  const transaction = {
    id: 'tx1',
    ocr_number: 'OCR001',
    amount: 5000,
    date: '2024-01-15',
    paid_date: null,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [{ provide: TransactionService, useFactory: mockTransactionService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    transactionService = module.get(TransactionService);
  });

  afterAll(() => app.close());

  describe('GET /companies/:companyId/transactions', () => {
    it('returns 200 with transaction list', async () => {
      transactionService.getTransactions.mockResolvedValue([transaction]);
      return request(app.getHttpServer())
        .get('/companies/c1/transactions')
        .expect(200)
        .expect([transaction]);
    });

    it('passes companyId to service', async () => {
      transactionService.getTransactions.mockResolvedValue([]);
      await request(app.getHttpServer()).get('/companies/c1/transactions');
      expect(transactionService.getTransactions).toHaveBeenCalledWith('c1', undefined);
    });
  });

  describe('POST /companies/:companyId/transactions', () => {
    const payDto = { card_number: '4539123456789012', exp_date: '2027-01-01', amount: 5000 };

    it('returns 201 with created transaction', async () => {
      transactionService.pay.mockResolvedValue(transaction);
      return request(app.getHttpServer())
        .post('/companies/c1/transactions')
        .send(payDto)
        .expect(201)
        .expect(transaction);
    });

    it('returns 400 for missing card_number', async () => {
      return request(app.getHttpServer())
        .post('/companies/c1/transactions')
        .send({ exp_date: '2027-01-01', amount: 5000 })
        .expect(400);
    });

    it('returns 400 for missing amount', async () => {
      return request(app.getHttpServer())
        .post('/companies/c1/transactions')
        .send({ card_number: '4539123456789012', exp_date: '2027-01-01' })
        .expect(400);
    });

    it('returns 400 for invalid exp_date format', async () => {
      return request(app.getHttpServer())
        .post('/companies/c1/transactions')
        .send({ card_number: '4539123456789012', exp_date: 'not-a-date', amount: 5000 })
        .expect(400);
    });

    it('passes correct args to service', async () => {
      transactionService.pay.mockResolvedValue(transaction);
      await request(app.getHttpServer())
        .post('/companies/c1/transactions')
        .send(payDto);
      expect(transactionService.pay).toHaveBeenCalledWith(payDto, 'c1');
    });
  });
});
