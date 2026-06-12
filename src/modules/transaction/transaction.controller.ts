import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post(':ocr/payments')
  @HttpCode(HttpStatus.CREATED)
  pay(@Param('ocr') ocr: string, @Body() dto: CreateTransactionDto) {
    return this.transactionService.pay(ocr, dto);
  }
}
