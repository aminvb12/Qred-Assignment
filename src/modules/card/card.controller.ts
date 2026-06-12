import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardStatusDto } from './dto/update-card-status.dto';

@ApiTags('companies/:companyId/cards')
@Controller('companies/:companyId/cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Get()
  findAll(@Param('companyId') companyId: string) {
    return this.cardService.findAll(companyId);
  }

  @Get(':cardId')
  findOne(@Param('companyId') companyId: string, @Param('cardId') cardId: string) {
    return this.cardService.findOne(companyId, cardId);
  }

  @Post()
  apply(@Param('companyId') companyId: string, @Body() dto: CreateCardDto) {
    return this.cardService.apply(companyId, dto);
  }

  @Patch(':cardId/status')
  updateStatus(
    @Param('companyId') companyId: string,
    @Param('cardId') cardId: string,
    @Body() dto: UpdateCardStatusDto,
  ) {
    return this.cardService.updateStatus(companyId, cardId, dto);
  }
}
