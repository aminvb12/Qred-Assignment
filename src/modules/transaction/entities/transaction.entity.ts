import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';

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

  @OneToOne(() => Invoice, (invoice) => invoice.transaction)
  @JoinColumn({ name: 'ocr_number', referencedColumnName: 'ocr_number' })
  invoice: Invoice;
}
