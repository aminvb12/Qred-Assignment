import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { Invoice } from './entities/invoice.entity';

// Company-scoped routes: GET /companies/:companyId/invoices
@ApiTags('invoices')
@Controller('companies/:companyId/invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices for a company' })
  @ApiResponse({ status: 200, type: [Invoice] })
  findAll(@Param('companyId') companyId: string, @Query() query: QueryInvoiceDto) {
    return this.invoiceService.findAll(companyId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, type: Invoice })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, type: Invoice })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoiceService.updateStatus(id, dto);
  }
}

// Top-level invoice creation — Qred creates invoices identified by org_number, not company UUID
@ApiTags('invoices')
@Controller('invoices')
export class InvoiceAdminController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice (Qred → company, identified by org_number)' })
  @ApiResponse({ status: 201, type: Invoice })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }
}
