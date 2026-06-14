import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionSourceFactory } from './sources/transaction-source.factory';
import { Company } from '../company/entities/company.entity';
import { Transaction } from './entities/transaction.entity';

const mockCompanyRepo = () => ({
  findOne: jest.fn(),
});

describe('TransactionService', () => {
  let service: TransactionService;
  let companyRepo: ReturnType<typeof mockCompanyRepo>;
  let factory: { forCompany: jest.Mock };

  const company: Company = {
    id: 'c1',
    name: 'Acme AB',
    org_number: '5591234567',
    payment_provider: 'internal',
  } as Company;

  const tx: Transaction = {
    id: 'tx1',
    ocr_number: 'OCR001',
    amount: 5000,
    date: new Date('2024-01-15'),
  } as Transaction;

  beforeEach(async () => {
    factory = { forCompany: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: TransactionSourceFactory, useValue: factory },
        { provide: getRepositoryToken(Company), useFactory: mockCompanyRepo },
      ],
    }).compile();

    service = module.get(TransactionService);
    companyRepo = module.get(getRepositoryToken(Company));
  });

  describe('getTransactions', () => {
    it('delegates to the correct source', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      const source = { getTransactions: jest.fn().mockResolvedValue([tx]) };
      factory.forCompany.mockReturnValue(source);

      const result = await service.getTransactions('c1');
      expect(result).toEqual([tx]);
      expect(factory.forCompany).toHaveBeenCalledWith(company);
      expect(source.getTransactions).toHaveBeenCalledWith('c1', undefined);
    });

    it('throws NotFoundException for unknown company', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.getTransactions('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('pay', () => {
    it('delegates payment to the correct source', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      const source = { pay: jest.fn().mockResolvedValue(tx) };
      factory.forCompany.mockReturnValue(source);

      const dto = { card_number: '4539123456789012', exp_date: '2027-01-01' };
      const result = await service.pay('OCR001', dto, 'c1');
      expect(result).toEqual(tx);
      expect(source.pay).toHaveBeenCalledWith('OCR001', dto, company);
    });

    it('throws NotFoundException for unknown company', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.pay('OCR001', {} as any, 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
