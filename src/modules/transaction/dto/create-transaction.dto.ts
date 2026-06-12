import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  card_number: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  exp_date: string;
}
