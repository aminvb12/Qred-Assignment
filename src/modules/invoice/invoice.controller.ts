import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';

@ApiTags('invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  @ApiOperation({ summary: 'List all invoices' })
  @ApiResponse({ status: 200, description: 'Returns array of invoices' })
  findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Returns invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created' })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  @ApiResponse({ status: 200, description: 'Invoice status updated' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoiceService.updateStatus(id, dto);
  }
}
