import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: '4111111111111111' })
  @IsString()
  card_number: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsDateString()
  exp_date: string;

  @ApiPropertyOptional({
    example: 5000,
    description: 'Required only when no pre-existing invoice exists for the OCR. Invoice will be auto-derived from the transaction.',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;
}
