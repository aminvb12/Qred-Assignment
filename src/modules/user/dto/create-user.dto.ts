import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsEmail()
  email: string;

  @Matches(/^19\d{10}$/, {
    message: 'Personal number must be 12 digits and start with 19',
  })
  personal_number: string;
}
