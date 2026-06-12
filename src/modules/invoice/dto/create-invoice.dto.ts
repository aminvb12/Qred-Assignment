import { IsDateString, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  ocr_number: string;

  @IsDateString()
  issue_date: string;

  @IsDateString()
  due_date: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  company_id: string;
}
