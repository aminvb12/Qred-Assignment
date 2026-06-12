import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { CardStatus } from '../entities/card.entity';

export class UpdateCardStatusDto {
  @ApiProperty({ enum: CardStatus, example: CardStatus.ACTIVE })
  @IsEnum(CardStatus)
  status: CardStatus;
}
