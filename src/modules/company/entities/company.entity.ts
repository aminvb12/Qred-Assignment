import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserCompany } from './user-company.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Card } from '../../card/entities/card.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  org_number: string;

  @Column({ nullable: true })
  logo: string;

  @OneToMany(() => UserCompany, (uc) => uc.company)
  user_companies: UserCompany[];

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices: Invoice[];

  @OneToMany(() => Card, (card) => card.company)
  cards: Card[];
}
