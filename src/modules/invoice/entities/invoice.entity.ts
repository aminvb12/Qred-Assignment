import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { InvoiceStatus } from '../dto/update-invoice-status.dto';

@Entity('invoices')
export class Invoice {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: '1234567890' })
  @Column({ unique: true })
  ocr_number: string;

  @ApiProperty({ example: '2024-01-01' })
  @Column({ type: 'date' })
  issue_date: Date;

  @ApiProperty({ example: '2024-02-01' })
  @Column({ type: 'date' })
  due_date: Date;

  @ApiProperty({ example: 15000 })
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @ApiPropertyOptional({ example: 'Storgatan 1, Stockholm' })
  @Column({ nullable: true })
  address: string;

  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.PENDING })
  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @ApiProperty({ example: 'uuid' })
  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.invoices)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToOne(() => Transaction, (transaction) => transaction.invoice)
  transaction: Transaction;
}
