import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { CardService } from './card.service';
import { Card, CardStatus } from './entities/card.entity';
import { Company } from '../company/entities/company.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('CardService', () => {
  let service: CardService;
  let cardRepo: ReturnType<typeof mockRepo>;
  let companyRepo: ReturnType<typeof mockRepo>;

  const company: Company = { id: 'c1', name: 'Acme AB', org_number: '5591234567' } as Company;

  const card: Card = {
    id: 'card1',
    card_number: '4539000000000000',
    issue_date: new Date('2026-01-01'),
    exp_date: new Date('2029-01-01'),
    max_credit: 50000,
    current_credit: 50000,
    status: CardStatus.UNDER_REVIEW,
    company_id: 'c1',
  } as Card;

  const activeCard: Card = {
    ...card,
    card_number: '4539123456789012',
    status: CardStatus.ACTIVE,
    current_credit: 30000,
  } as Card;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        { provide: getRepositoryToken(Card), useFactory: mockRepo },
        { provide: getRepositoryToken(Company), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(CardService);
    cardRepo = module.get(getRepositoryToken(Card));
    companyRepo = module.get(getRepositoryToken(Company));
  });

  describe('findAll', () => {
    it('returns cards for a company', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      cardRepo.find.mockResolvedValue([card]);
      expect(await service.findAll('c1')).toEqual([card]);
    });

    it('throws NotFoundException for unknown company', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.findAll('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('returns card when found', async () => {
      cardRepo.findOne.mockResolvedValue(card);
      expect(await service.findOne('c1', 'card1')).toEqual(card);
    });

    it('throws NotFoundException when card not found', async () => {
      cardRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('c1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('apply', () => {
    it('creates a card with under_review status and generates card credentials', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      cardRepo.create.mockReturnValue(card);
      cardRepo.save.mockResolvedValue(card);
      const result = await service.apply('c1', { max_credit: 50000 });
      expect(result.status).toBe(CardStatus.UNDER_REVIEW);
      expect(cardRepo.create).toHaveBeenCalledWith(expect.objectContaining({
        max_credit: 50000,
        current_credit: 50000,
        company_id: 'c1',
        status: CardStatus.UNDER_REVIEW,
        card_number: expect.stringMatching(/^\d{16}$/),
        issue_date: expect.any(Date),
        exp_date: expect.any(Date),
      }));
    });

    it('sets exp_date 3 years after issue_date', async () => {
      companyRepo.findOne.mockResolvedValue(company);
      let captured: any;
      cardRepo.create.mockImplementation((data) => { captured = data; return data; });
      cardRepo.save.mockImplementation(c => Promise.resolve(c));
      await service.apply('c1', { max_credit: 50000 });
      const diff = captured.exp_date.getFullYear() - captured.issue_date.getFullYear();
      expect(diff).toBe(3);
    });

    it('throws NotFoundException for unknown company', async () => {
      companyRepo.findOne.mockResolvedValue(null);
      await expect(service.apply('bad', { max_credit: 50000 })).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('sets status to active without changing card credentials', async () => {
      const underReviewCard = { ...card };
      cardRepo.findOne.mockResolvedValue(underReviewCard);
      cardRepo.save.mockImplementation(c => Promise.resolve(c));
      const result = await service.activate('c1', 'card1');
      expect(result.status).toBe(CardStatus.ACTIVE);
      // card_number and dates were set at apply time — activate must not overwrite them
      expect(result.card_number).toBe(underReviewCard.card_number);
      expect(result.issue_date).toBe(underReviewCard.issue_date);
      expect(result.exp_date).toBe(underReviewCard.exp_date);
    });

    it('throws BadRequestException if card is not under_review', async () => {
      cardRepo.findOne.mockResolvedValue(activeCard);
      await expect(service.activate('c1', 'card1')).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when card not found', async () => {
      cardRepo.findOne.mockResolvedValue(null);
      await expect(service.activate('c1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCard', () => {
    it('updates card status and credit', async () => {
      cardRepo.findOne.mockResolvedValue({ ...card });
      cardRepo.save.mockImplementation(c => Promise.resolve(c));
      const result = await service.updateCard('c1', 'card1', {
        status: CardStatus.INACTIVE,
        current_credit: 0,
      });
      expect(result.status).toBe(CardStatus.INACTIVE);
      expect(result.current_credit).toBe(0);
    });
  });

  describe('remove', () => {
    it('removes card without outstanding credit', async () => {
      cardRepo.findOne.mockResolvedValue({ ...activeCard, current_credit: 0 });
      cardRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove('c1', 'card1')).resolves.toBeUndefined();
    });

    it('throws MethodNotAllowedException for active card with credit', async () => {
      cardRepo.findOne.mockResolvedValue(activeCard);
      await expect(service.remove('c1', 'card1')).rejects.toThrow(MethodNotAllowedException);
    });

    it('throws NotFoundException when card not found', async () => {
      cardRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('c1', 'bad')).rejects.toThrow(NotFoundException);
    });
  });
});
