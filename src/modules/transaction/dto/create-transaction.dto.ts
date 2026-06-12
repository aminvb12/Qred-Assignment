import { IsDateString, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  card_number: string;

  @IsDateString()
  exp_date: string;
}
