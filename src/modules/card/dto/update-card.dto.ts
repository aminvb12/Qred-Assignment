import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CardStatus } from '../entities/card.entity';

export class UpdateCardDto {
  @ApiProperty({ enum: CardStatus, example: CardStatus.ACTIVE })
  @IsEnum(CardStatus)
  status: CardStatus;

  @ApiProperty({ example: 5000 })
  current_credit?: number; // In a real system, this would not be updated directly by the user, but included here for simplicity

}
