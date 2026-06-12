import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';

export enum CardStatus {
  UNDER_REVIEW = 'under_review',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  card_number: string;

  @Column({ type: 'date' })
  issue_date: Date;

  @Column({ type: 'date' })
  exp_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  max_credit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  current_credit: number;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.INACTIVE,
  })
  status: CardStatus;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.cards)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
