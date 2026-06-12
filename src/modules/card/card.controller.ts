import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardStatusDto } from './dto/update-card-status.dto';

@ApiTags('cards')
@Controller('companies/:companyId/cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  @ApiOperation({ summary: 'List cards for company' })
  @ApiResponse({ status: 200, description: 'Returns array of cards' })
  findAll(@Param('companyId') companyId: string) {
    return this.cardService.findAll(companyId);
  }

  @Get(':cardId')
  @ApiOperation({ summary: 'Get card by ID' })
  @ApiResponse({ status: 200, description: 'Returns card' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  findOne(@Param('companyId') companyId: string, @Param('cardId') cardId: string) {
    return this.cardService.findOne(companyId, cardId);
  }

  @Post()
  @ApiOperation({ summary: 'Apply for a card' })
  @ApiResponse({ status: 201, description: 'Card application submitted, status: under_review' })
  apply(@Param('companyId') companyId: string, @Body() dto: CreateCardDto) {
    return this.cardService.apply(companyId, dto);
  }

  @Patch(':cardId/status')
  @ApiOperation({ summary: 'Update card status' })
  @ApiResponse({ status: 200, description: 'Card status updated' })
  updateStatus(
    @Param('companyId') companyId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardStatusDto,
  ) {
    return this.cardService.updateStatus(companyId, cardId, dto);
  }
}
