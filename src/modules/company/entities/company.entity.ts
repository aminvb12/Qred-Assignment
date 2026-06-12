import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserCompany } from './user-company.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Card } from '../../card/entities/card.entity';

@Entity('companies')
export class Company {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Acme AB' })
  @Column()
  name: string;

  @ApiProperty({ example: '5591234567' })
  @Column({ unique: true })
  org_number: string;

  @ApiPropertyOptional({ example: 'https://acme.se/logo.png' })
  @Column({ nullable: true })
  logo: string;

  @OneToMany(() => UserCompany, (uc) => uc.company)
  user_companies: UserCompany[];

  @OneToMany(() => Invoice, (invoice) => invoice.company)
  invoices: Invoice[];

  @OneToMany(() => Card, (card) => card.company)
  cards: Card[];
}
