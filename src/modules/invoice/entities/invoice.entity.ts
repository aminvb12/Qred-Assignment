import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { InvoiceStatus } from '../dto/update-invoice-status.dto';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ocr_number: string;

  @Column({ type: 'date' })
  issue_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
  status: InvoiceStatus;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.invoices)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToOne(() => Transaction, (transaction) => transaction.invoice)
  transaction: Transaction;
}
