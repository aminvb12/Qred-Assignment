import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 50000, description: 'Requested credit limit in SEK' })
  @IsNumber()
  @IsPositive()
  max_credit: number;
}
