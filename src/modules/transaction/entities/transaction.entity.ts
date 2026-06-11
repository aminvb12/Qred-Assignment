import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ocr_number: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'date', nullable: true })
  paid_date: Date;

  @Column()
  invoice_id: string;

  @OneToOne(() => Invoice, (invoice) => invoice.transaction)
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
