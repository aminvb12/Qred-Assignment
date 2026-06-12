import { IsEnum } from 'class-validator';

export enum InvoiceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;
}
