import { IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  org_number: string;

  @IsOptional()
  @IsString()
  logo?: string;
}
