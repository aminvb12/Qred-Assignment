import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserCompany } from '../../company/entities/user-company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({unique: true})
  personal_number: string;

  @OneToMany(() => UserCompany, (uc) => uc.user)
  user_companies: UserCompany[];
}
