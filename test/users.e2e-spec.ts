import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UserController } from '../src/modules/user/user.controller';
import { UserService } from '../src/modules/user/user.service';

const mockUserService = () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  findCompanies: jest.fn(),
  createCompany: jest.fn(),
  removeCompany: jest.fn(),
});

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userService: ReturnType<typeof mockUserService>;

  const user = {
    id: 'u1',
    first_name: 'Anna',
    last_name: 'Svensson',
    email: 'anna@example.com',
    personal_number: '199001011234',
  };

  const company = {
    id: 'c1',
    name: 'Acme AB',
    org_number: '5591234567',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useFactory: mockUserService }],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    userService = module.get(UserService);
  });

  afterAll(() => app.close());

  describe('GET /users', () => {
    it('returns 200 with user list', async () => {
      userService.findAll.mockResolvedValue([user]);
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect([user]);
    });
  });

  describe('GET /users/:id', () => {
    it('returns 200 when user exists', async () => {
      userService.findOne.mockResolvedValue(user);
      return request(app.getHttpServer())
        .get('/users/u1')
        .expect(200)
        .expect(user);
    });
  });

  describe('POST /users', () => {
    it('returns 201 with created user', async () => {
      userService.create.mockResolvedValue(user);
      return request(app.getHttpServer())
        .post('/users')
        .send({
          first_name: 'Anna',
          last_name: 'Svensson',
          email: 'anna@example.com',
          personal_number: '199001011234',
        })
        .expect(201)
        .expect(user);
    });

    it('returns 400 for invalid personal_number', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          first_name: 'Anna',
          last_name: 'Svensson',
          email: 'anna@example.com',
          personal_number: 'invalid',
        })
        .expect(400);
    });

    it('returns 400 for invalid email', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          first_name: 'Anna',
          last_name: 'Svensson',
          email: 'not-an-email',
          personal_number: '199001011234',
        })
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('returns 200 with updated user', async () => {
      userService.update.mockResolvedValue({ ...user, first_name: 'Updated' });
      return request(app.getHttpServer())
        .patch('/users/u1')
        .send({ first_name: 'Updated' })
        .expect(200)
        .expect({ ...user, first_name: 'Updated' });
    });
  });

  describe('DELETE /users/:id', () => {
    it('returns 204', async () => {
      userService.remove.mockResolvedValue(undefined);
      return request(app.getHttpServer())
        .delete('/users/u1')
        .expect(204);
    });
  });

  describe('GET /users/:id/companies', () => {
    it('returns 200 with companies', async () => {
      userService.findCompanies.mockResolvedValue([company]);
      return request(app.getHttpServer())
        .get('/users/u1/companies')
        .expect(200)
        .expect([company]);
    });
  });

  describe('POST /users/:id/companies', () => {
    it('returns 201 with created company', async () => {
      userService.createCompany.mockResolvedValue(company);
      return request(app.getHttpServer())
        .post('/users/u1/companies')
        .send({ name: 'Acme AB', org_number: '5591234567' })
        .expect(201)
        .expect(company);
    });
  });

  describe('DELETE /users/:id/companies/:companyId', () => {
    it('returns 204', async () => {
      userService.removeCompany.mockResolvedValue(undefined);
      return request(app.getHttpServer())
        .delete('/users/u1/companies/c1')
        .expect(204);
    });
  });
});
