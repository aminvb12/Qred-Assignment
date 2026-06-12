import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Anna' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Svensson' })
  @IsString()
  last_name: string;

  @ApiProperty({ example: 'anna@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '199001011234', description: '12 digits, starts with 19' })
  @Matches(/^19\d{10}$/, {
    message: 'Personal number must be 12 digits and start with 19',
  })
  personal_number: string;
}
