import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardStatus } from './entities/card.entity';
import { Company } from '../company/entities/company.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardStatusDto } from './dto/update-card-status.dto';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,

    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async findAll(companyId: string): Promise<Card[]> {
    await this.findCompany(companyId);
    return this.cardRepo.find({ where: { company_id: companyId } });
  }

  async findOne(companyId: string, cardId: string): Promise<Card> {
    const card = await this.cardRepo.findOne({
      where: { id: cardId, company_id: companyId },
    });
    if (!card) throw new NotFoundException(`Card ${cardId} not found`);
    return card;
  }

  async apply(companyId: string, dto: CreateCardDto): Promise<Card> {
    const company = await this.findCompany(companyId);
    if(!company) throw new NotFoundException(`Company ${companyId} not found`);
    const card = this.cardRepo.create({
      ...dto,
      company_id: companyId,
      status: CardStatus.UNDER_REVIEW,
    });
    return this.cardRepo.save(card);
  }

  async updateStatus(companyId: string, cardId: string, dto: UpdateCardStatusDto): Promise<Card> {
    const card = await this.findOne(companyId, cardId);
    card.status = dto.status;
    return this.cardRepo.save(card);
  }

  private async findCompany(companyId: string): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    return company;
  }
}
