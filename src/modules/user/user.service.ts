import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Company } from '../company/entities/company.entity';
import { UserCompany, UserCompanyRole } from '../company/entities/user-company.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,

    @InjectRepository(UserCompany)
    private readonly userCompanyRepo: Repository<UserCompany>,
  ) { }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }

  async findCompanies(userId: string): Promise<Company[]> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    const userCompanies = await this.userCompanyRepo.find({
      where: { user_id: userId },
      relations: ['company'],
    });
    return userCompanies.map((uc) => uc.company);
  }

  async removeCompany(userId: string, companyId: string): Promise<void> {
    await this.findOne(userId);
    const userCompany = await this.userCompanyRepo.findOne({
      where: { user_id: userId, company_id: companyId },
    });
    if (!userCompany) throw new NotFoundException(`Company ${companyId} not found for user ${userId}`);
    await this.userCompanyRepo.remove(userCompany);
    await this.companyRepo.delete(companyId);
  }

  async createCompany(userId: string, dto: CreateCompanyDto): Promise<Company> {
    await this.findOne(userId);

    const company = this.companyRepo.create(dto);
    const savedCompany = await this.companyRepo.save(company);

    const userCompany = this.userCompanyRepo.create({
      user_id: userId,
      company_id: savedCompany.id,
      role: UserCompanyRole.OWNER,
    });
    await this.userCompanyRepo.save(userCompany);

    return savedCompany;
  }
}
