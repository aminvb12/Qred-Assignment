import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { CardStatus } from '../entities/card.entity';

export class UpdateCardDto {
  @ApiProperty({ enum: CardStatus, example: CardStatus.ACTIVE })
  @IsEnum(CardStatus)
  status: CardStatus;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  current_credit?: number; // In a real system this would not be updated directly by the user
}
