import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';

export enum CardStatus {
  UNDER_REVIEW = 'under_review',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Entity('cards')
export class Card {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '4111111111111111' })
  @Column({ unique: true })
  card_number: string;

  @ApiProperty({ example: '2024-01-01' })
  @Column({ type: 'date' })
  issue_date: Date;

  @ApiProperty({ example: '2027-01-01' })
  @Column({ type: 'date' })
  exp_date: Date;

  @ApiProperty({ example: 50000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  max_credit: number;

  @ApiProperty({ example: 50000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  current_credit: number;

  @ApiProperty({ enum: CardStatus, example: CardStatus.INACTIVE })
  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.INACTIVE })
  status: CardStatus;

  @ApiProperty({ example: 'uuid' })
  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.cards)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
