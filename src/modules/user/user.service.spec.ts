import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { UserCompany, UserCompanyRole } from '../company/entities/user-company.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  delete: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userRepo: ReturnType<typeof mockRepo>;
  let companyRepo: ReturnType<typeof mockRepo>;
  let userCompanyRepo: ReturnType<typeof mockRepo>;

  const user: User = {
    id: 'u1',
    first_name: 'Anna',
    last_name: 'Svensson',
    email: 'anna@example.com',
    personal_number: '199001011234',
  } as User;

  const company: Company = {
    id: 'c1',
    name: 'Acme AB',
    org_number: '5591234567',
    payment_provider: 'internal',
  } as Company;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useFactory: mockRepo },
        { provide: getRepositoryToken(Company), useFactory: mockRepo },
        { provide: getRepositoryToken(UserCompany), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get(UserService);
    userRepo = module.get(getRepositoryToken(User));
    companyRepo = module.get(getRepositoryToken(Company));
    userCompanyRepo = module.get(getRepositoryToken(UserCompany));
  });

  describe('findAll', () => {
    it('returns all users', async () => {
      userRepo.find.mockResolvedValue([user]);
      expect(await service.findAll()).toEqual([user]);
    });
  });

  describe('findOne', () => {
    it('returns user when found', async () => {
      userRepo.findOne.mockResolvedValue(user);
      expect(await service.findOne('u1')).toEqual(user);
    });

    it('throws NotFoundException when not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates and saves a user', async () => {
      userRepo.create.mockReturnValue(user);
      userRepo.save.mockResolvedValue(user);
      const result = await service.create({
        first_name: 'Anna',
        last_name: 'Svensson',
        email: 'anna@example.com',
        personal_number: '199001011234',
      });
      expect(result).toEqual(user);
      expect(userRepo.save).toHaveBeenCalledWith(user);
    });
  });

  describe('update', () => {
    it('updates and saves a user', async () => {
      userRepo.findOne.mockResolvedValue({ ...user });
      userRepo.save.mockResolvedValue({ ...user, first_name: 'Updated' });
      const result = await service.update('u1', { first_name: 'Updated' });
      expect(result.first_name).toBe('Updated');
    });

    it('throws NotFoundException for unknown user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.update('bad', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes user', async () => {
      userRepo.findOne.mockResolvedValue(user);
      userRepo.remove.mockResolvedValue(undefined);
      await expect(service.remove('u1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException for unknown user', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCompanies', () => {
    it('returns companies for a user', async () => {
      userRepo.findOne.mockResolvedValue(user);
      userCompanyRepo.find.mockResolvedValue([{ company }]);
      const result = await service.findCompanies('u1');
      expect(result).toEqual([company]);
    });
  });

  describe('createCompany', () => {
    it('creates company and links to user', async () => {
      userRepo.findOne.mockResolvedValue(user);
      companyRepo.create.mockReturnValue(company);
      companyRepo.save.mockResolvedValue(company);
      userCompanyRepo.create.mockReturnValue({ user_id: 'u1', company_id: 'c1', role: UserCompanyRole.OWNER });
      userCompanyRepo.save.mockResolvedValue({});
      const result = await service.createCompany('u1', { name: 'Acme AB', org_number: '5591234567' });
      expect(result).toEqual(company);
    });
  });
});
