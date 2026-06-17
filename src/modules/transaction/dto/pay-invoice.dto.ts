import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class PayInvoiceDto {
  @ApiProperty({ example: 15000, description: 'Amount must match the invoice amount exactly' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
