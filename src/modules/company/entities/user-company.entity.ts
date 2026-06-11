import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Company } from './company.entity';

export enum UserCompanyRole {
  OWNER = 'owner',
  ADMIN = 'admin',
}

@Entity('user_companies')
@Unique(['user_id', 'company_id'])
export class UserCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  company_id: string;

  @Column({ type: 'enum', enum: UserCompanyRole, default: UserCompanyRole.OWNER })
  role: UserCompanyRole;

  @ManyToOne(() => User, (user) => user.user_companies)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, (company) => company.user_companies)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
