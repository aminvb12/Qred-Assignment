import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { CardStatus } from '../entities/card.entity';

export class UpdateCardDto {
  @ApiProperty({ enum: CardStatus, example: CardStatus.ACTIVE })
  @IsEnum(CardStatus)
  status: CardStatus;

  @ApiPropertyOptional({ example: 0, description: 'Set remaining credit (0 to max_credit)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  current_credit?: number;
}
