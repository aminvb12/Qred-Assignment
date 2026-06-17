import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { Invoice } from './entities/invoice.entity';
import { TransactionService } from '../transaction/transaction.service';
import { PayInvoiceDto } from '../transaction/dto/pay-invoice.dto';
import { Transaction } from '../transaction/entities/transaction.entity';

// Company-scoped routes: GET /companies/:companyId/invoices
@ApiTags('invoices')
@Controller('companies/:companyId/invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly transactionService: TransactionService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'List invoices for a company' })
  @ApiResponse({ status: 200, type: [Invoice] })
  findAll(@Param('companyId') companyId: string, @Query() query: QueryInvoiceDto) {
    return this.invoiceService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by company id and invoice ID' })
  @ApiResponse({ status: 200, type: Invoice })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('companyId') companyId: string, @Param('id') id: string) {
    return this.invoiceService.findOne(companyId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status by company id and invoice id' })
  @ApiResponse({ status: 200, type: Invoice })
  updateStatus(@Param('companyId') companyId: string, @Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoiceService.updateStatus(companyId, id, dto);
  }

  @Post(':id/payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Pay an invoice — marks it PAID, restores card credit, records transaction' })
  @ApiResponse({ status: 201, type: Transaction })
  @ApiResponse({ status: 400, description: 'Amount mismatch or invoice already paid' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  payInvoice(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() dto: PayInvoiceDto,
  ): Promise<Transaction> {
    return this.transactionService.payInvoice(id, dto, companyId);
  }
}

// Top-level invoice creation — Qred creates invoices identified by org_number, not company UUID
@ApiTags('invoices')
@Controller('invoices')
export class InvoiceAdminController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @Post()
  @ApiOperation({ summary: 'Create invoice (Qred → company, identified by org_number)' })
  @ApiResponse({ status: 201, type: Invoice })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }
}
