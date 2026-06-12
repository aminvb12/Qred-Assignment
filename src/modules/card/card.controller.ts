import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardStatusDto } from './dto/update-card-status.dto';
import { Card } from './entities/card.entity';

@ApiTags('cards')
@Controller('companies/:companyId/cards')
export class CardController {
  constructor(private readonly cardService: CardService) { }

  @Get()
  @ApiOperation({ summary: 'List cards for company' })
  @ApiResponse({ status: 200, type: [Card] })
  findAll(@Param('companyId') companyId: string) {
    return this.cardService.findAll(companyId);
  }

  @Get(':cardId')
  @ApiOperation({ summary: 'Get card by ID' })
  @ApiResponse({ status: 200, type: Card })
  @ApiResponse({ status: 404, description: 'Card not found' })
  findOne(@Param('companyId') companyId: string, @Param('cardId') cardId: string) {
    return this.cardService.findOne(companyId, cardId);
  }

  @Delete(':cardId')
  @ApiOperation({ summary: 'Delete card' })
  @ApiResponse({ status: 204, description: 'Card deleted' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  remove(@Param('companyId') companyId: string, @Param('cardId') cardId: string) {
    return this.cardService.remove(companyId, cardId);
  }

  @Post()
  @ApiOperation({ summary: 'Apply for a card' })
  @ApiResponse({ status: 201, type: Card, description: 'Status: under_review' })
  apply(@Param('companyId') companyId: string, @Body() dto: CreateCardDto) {
    return this.cardService.apply(companyId, dto);
  }

  @Patch(':cardId/status')
  @ApiOperation({ summary: 'Update card status' })
  @ApiResponse({ status: 200, type: Card })
  updateStatus(
    @Param('companyId') companyId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardStatusDto,
  ) {
    return this.cardService.updateStatus(companyId, cardId, dto);
  }
}
