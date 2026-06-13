import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { InvoiceType } from '../entities/invoice.entity';

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

  @ApiProperty({ example: 'Qred AB', description: 'Name of the invoice sender' })
  @IsString()
  from: string;

  @ApiProperty({ example: '5560206220', description: 'Org number of the invoice sender' })
  @IsString()
  from_org_number: string;

  @ApiProperty({ example: '5591234567', description: 'Org number used to look up the company' })
  @IsString()
  org_number: string;

  @ApiPropertyOptional({ example: 'Storgatan 1, Stockholm' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: InvoiceType, example: InvoiceType.STATEMENT })
  @IsOptional()
  @IsEnum(InvoiceType)
  type?: InvoiceType;
}
