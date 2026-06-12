import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: '1234567890' })
  @IsString()
  ocr_number: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  issue_date: string;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ example: 15000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'Storgatan 1, Stockholm' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'uuid-of-company' })
  @IsString()
  company_id: string;
}
