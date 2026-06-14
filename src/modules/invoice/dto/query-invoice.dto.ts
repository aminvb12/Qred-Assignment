import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { InvoiceStatus } from './update-invoice-status.dto';

export class QueryInvoiceDto {
  @ApiPropertyOptional({ enum: InvoiceStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter invoices due from this date' })
  @IsOptional()
  @IsString()
  due_from?: string;

  @ApiPropertyOptional({ example: '2024-12-31', description: 'Filter invoices due to this date' })
  @IsOptional()
  @IsString()
  due_to?: string;
}
