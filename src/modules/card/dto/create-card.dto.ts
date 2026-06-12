import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  card_number: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  issue_date: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  exp_date: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @IsPositive()
  max_credit: number;
}
