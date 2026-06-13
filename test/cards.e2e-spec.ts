import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CardController } from '../src/modules/card/card.controller';
import { CardService } from '../src/modules/card/card.service';
import { CardStatus } from '../src/modules/card/entities/card.entity';

const mockCardService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  apply: jest.fn(),
  updateCard: jest.fn(),
  activate: jest.fn(),
  remove: jest.fn(),
});

describe('CardsController (e2e)', () => {
  let app: INestApplication;
  let cardService: ReturnType<typeof mockCardService>;

  const underReviewCard = {
    id: 'card1',
    card_number: null,
    issue_date: null,
    exp_date: null,
    max_credit: 50000,
    current_credit: 50000,
    status: CardStatus.UNDER_REVIEW,
    company_id: 'c1',
  };

  const activeCard = {
    ...underReviewCard,
    card_number: '4539123456789012',
    issue_date: '2024-01-01',
    exp_date: '2027-01-01',
    status: CardStatus.ACTIVE,
    current_credit: 30000,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [{ provide: CardService, useFactory: mockCardService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();

    cardService = module.get(CardService);
  });

  afterAll(() => app.close());

  describe('GET /companies/:companyId/cards', () => {
    it('returns 200 with card list', async () => {
      cardService.findAll.mockResolvedValue([underReviewCard]);
      return request(app.getHttpServer())
        .get('/companies/c1/cards')
        .expect(200)
        .expect([underReviewCard]);
    });
  });

  describe('GET /companies/:companyId/cards/:cardId', () => {
    it('returns 200 with card', async () => {
      cardService.findOne.mockResolvedValue(underReviewCard);
      return request(app.getHttpServer())
        .get('/companies/c1/cards/card1')
        .expect(200)
        .expect(underReviewCard);
    });
  });

  describe('POST /companies/:companyId/cards', () => {
    it('returns 201 with card in under_review status', async () => {
      cardService.apply.mockResolvedValue(underReviewCard);
      return request(app.getHttpServer())
        .post('/companies/c1/cards')
        .send({ max_credit: 50000 })
        .expect(201)
        .expect(underReviewCard);
    });

    it('returns 400 for missing max_credit', async () => {
      return request(app.getHttpServer())
        .post('/companies/c1/cards')
        .send({})
        .expect(400);
    });

    it('returns 400 for negative max_credit', async () => {
      return request(app.getHttpServer())
        .post('/companies/c1/cards')
        .send({ max_credit: -100 })
        .expect(400);
    });
  });

  describe('PATCH /companies/:companyId/cards/:cardId', () => {
    it('returns 200 with updated card', async () => {
      cardService.updateCard.mockResolvedValue({ ...underReviewCard, status: CardStatus.INACTIVE });
      return request(app.getHttpServer())
        .patch('/companies/c1/cards/card1')
        .send({ status: CardStatus.INACTIVE })
        .expect(200);
    });

    it('returns 400 for invalid status', async () => {
      return request(app.getHttpServer())
        .patch('/companies/c1/cards/card1')
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('POST /companies/:companyId/cards/:cardId/activations', () => {
    it('returns 201 with activated card', async () => {
      cardService.activate.mockResolvedValue(activeCard);
      return request(app.getHttpServer())
        .post('/companies/c1/cards/card1/activations')
        .expect(201)
        .expect(activeCard);
    });
  });

  describe('DELETE /companies/:companyId/cards/:cardId', () => {
    it('returns 200 on delete', async () => {
      cardService.remove.mockResolvedValue(undefined);
      return request(app.getHttpServer())
        .delete('/companies/c1/cards/card1')
        .expect(200);
    });
  });
});
