import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Card } from '../../card/entities/card.entity';

@Entity('transactions')
export class Transaction {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '1234567890' })
  @Column({ unique: true })
  ocr_number: string;

  @ApiProperty({ example: 15000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ example: '2024-01-15' })
  @Column({ type: 'date' })
  date: Date;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @Column({ type: 'date', nullable: true })
  paid_date: Date;

  @ApiProperty({ example: 'uuid' })
  @Column()
  company_id: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @Column({ nullable: true })
  card_id: string | null;

  @ManyToOne(() => Card, { nullable: true, eager: false })
  @JoinColumn({ name: 'card_id' })
  card: Card | null;

  @OneToOne(() => Invoice, (invoice) => invoice.transaction)
  @JoinColumn({ name: 'ocr_number', referencedColumnName: 'ocr_number' })
  invoice: Invoice;
}
