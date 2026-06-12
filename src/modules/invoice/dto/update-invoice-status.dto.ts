import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum InvoiceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.PAID })
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
