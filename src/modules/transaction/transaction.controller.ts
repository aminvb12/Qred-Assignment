import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@Controller('companies/:companyId/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions for a company' })
  @ApiQuery({ name: 'card_id', required: false, description: 'Filter transactions by card ID' })
  @ApiResponse({ status: 200, type: [Transaction] })
  getTransactions(
    @Param('companyId') companyId: string,
    @Query('card_id') cardId?: string,
  ) {
    return this.transactionService.getTransactions(companyId, cardId);
  }

  @Post(':ocr/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Pay invoice by OCR number' })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 400, description: 'Insufficient credit or invalid card' })
  @ApiResponse({ status: 404, description: 'Invoice or card not found' })
  pay(
    @Param('companyId') companyId: string,
    @Param('ocr') ocr: string,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionService.pay(ocr, dto, companyId);
  }
}
