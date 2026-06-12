import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(':ocr/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Pay invoice by OCR number (ACID payment flow)' })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @ApiResponse({ status: 422, description: 'Insufficient credit or invalid card' })
  pay(@Param('ocr') ocr: string, @Body() dto: CreateTransactionDto) {
    return this.transactionService.pay(ocr, dto);
  }
}
