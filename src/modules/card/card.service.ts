import { Injectable, NotFoundException, MethodNotAllowedException } from '@nestjs/common';
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
  ) { }

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
    await this.findCompany(companyId);

    const card = this.cardRepo.create({
      max_credit: dto.max_credit,
      current_credit: dto.max_credit,
      company_id: companyId,
      status: CardStatus.UNDER_REVIEW,
    });
    return this.cardRepo.save(card);
  }

  async updateStatus(companyId: string, cardId: string, dto: UpdateCardStatusDto): Promise<Card> {
    const card = await this.findOne(companyId, cardId);

    const today = new Date();
    const expDate = new Date(today);
    expDate.setFullYear(expDate.getFullYear() + 3);
    card.status = dto.status;
    card.card_number = this.generateCardNumber();
    card.issue_date = today;
    card.exp_date = expDate;
    return this.cardRepo.save(card);
  }

  private generateCardNumber(): string {
    // Generate a 16-digit Luhn-valid card number with Qred BIN prefix 4539
    const prefix = '4539';
    let number = prefix;
    for (let i = 0; i < 11; i++) {
      number += Math.floor(Math.random() * 10).toString();
    }
    return number + this.luhnCheckDigit(number);
  }

  private luhnCheckDigit(partial: string): string {
    let sum = 0;
    let isEven = true;
    for (let i = partial.length - 1; i >= 0; i--) {
      let digit = parseInt(partial[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return ((10 - (sum % 10)) % 10).toString();
  }

  async remove(companyId: string, cardId: string): Promise<void> {
    const card = await this.findOne(companyId, cardId);

    if (card.status === CardStatus.ACTIVE && card.current_credit > 0) {
      throw new MethodNotAllowedException(`Cannot delete active card with outstanding credit`);
    }

    await this.cardRepo.remove(card);
  }

  private async findCompany(companyId: string): Promise<Company> {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException(`Company ${companyId} not found`);
    return company;
  }
}
