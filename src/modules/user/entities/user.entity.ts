import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserCompany } from '../../company/entities/user-company.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 'uuid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Anna' })
  @Column()
  first_name: string;

  @ApiProperty({ example: 'Svensson' })
  @Column()
  last_name: string;

  @ApiProperty({ example: 'anna@example.com' })
  @Column()
  email: string;

  @Exclude()
  @Column()
  password: string;

  @ApiProperty({ example: '199001011234' })
  @Column({ unique: true })
  personal_number: string;

  @OneToMany(() => UserCompany, (uc) => uc.user)
  user_companies: UserCompany[];
}
