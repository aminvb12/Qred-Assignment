import { IsDateString, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateCardDto {
  @IsString()
  card_number: string;

  @IsDateString()
  issue_date: string;

  @IsDateString()
  exp_date: string;

  @IsNumber()
  @IsPositive()
  max_credit: number;
}
